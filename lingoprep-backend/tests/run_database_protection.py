"""Run the real migration against a disposable local PostgreSQL cluster.

Usage: python tests/run_database_protection.py --pg-bin /path/to/postgres/bin
No Supabase credentials or existing database are used. The test cluster is
stopped in finally; its files/log remain under the repository's ignored tmp/.
"""

import argparse
from pathlib import Path
import socket
import subprocess
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pg-bin", type=Path, required=True)
    parser.add_argument("--persistence", action="store_true", help="Also test attempt transactions and workload admission")
    args = parser.parse_args()
    repository = Path(__file__).resolve().parents[2]
    directory = repository / "tmp" / f"database-protection-{uuid4().hex}"
    directory.mkdir(parents=True)
    data = directory / "data"
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]

    def run(program, *arguments):
        # A PostgreSQL child can inherit pipe handles on Windows, making
        # communicate() wait forever after pg_ctl exits. Use a log file instead.
        output_path = directory / f"{program}.log"
        with output_path.open("w", encoding="utf-8") as output_file:
            result = subprocess.run(
                [str(args.pg_bin / program), *map(str, arguments)],
                stdin=subprocess.DEVNULL, stdout=output_file,
                stderr=subprocess.STDOUT, timeout=120,
            )
        output = output_path.read_text(encoding="utf-8", errors="replace")
        if result.returncode:
            raise RuntimeError(output)
        return output

    run("initdb", "-D", data, "-U", "postgres", "-A", "trust", "--encoding=UTF8", "--locale=C")
    try:
        run("pg_ctl", "-D", data, "-l", directory / "postgres.log", "-w", "start",
            "-o", f"-h 127.0.0.1 -p {port}")
        output = run("psql", "-X", "-w", "-h", "127.0.0.1", "-p", port,
                     "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1",
                     "-f", Path(__file__).with_name("persistence_resources.sql" if args.persistence else "database_protection.sql"))
        (directory / "test-output.txt").write_text(output, encoding="utf-8")
        if args.persistence:
            def query(statement):
                result = subprocess.run([
                    str(args.pg_bin / "psql"), "-X", "-w", "-h", "127.0.0.1", "-p", str(port),
                    "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-At", "-c", statement,
                ], capture_output=True, text=True, timeout=30, check=True)
                return result.stdout.strip()

            # Independent connections race on the same rows/advisory lock.
            with ThreadPoolExecutor(max_workers=8) as pool:
                admissions = list(pool.map(lambda _: query(
                    f"SELECT public.acquire_workload(ARRAY['parallel-ip'],'parallel','{uuid4()}',100,3)"
                ), range(16)))
                if admissions.count("ok") != 3 or admissions.count("busy") != 13:
                    raise RuntimeError(f"Concurrent admission failed: {admissions}")
                key = uuid4()
                claims = list(pool.map(lambda _: query(
                    f"SELECT public.claim_submission('parallel','{key}','same-hash','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')->>'state'"
                ), range(16)))
                if claims.count("new") != 1 or claims.count("running") != 15:
                    raise RuntimeError(f"Concurrent claim failed: {claims}")
                query(f"""SELECT public.stage_submission('parallel','{key}',
                    '{{"status":200,"body":{{"saved":false}}}}',
                    '[{{"table":"session_logs","data":{{"module":"writing"}}}},
                      {{"table":"writing_submissions","data":{{"prompt":"Prompt","essay_text":"Essay"}}}}]')""")
                results = list(pool.map(lambda _: query(
                    f"SELECT public.finish_submission('parallel','{key}')->'body'->>'saved'"
                ), range(16)))
                if results != ["true"] * 16 or query("SELECT count(*) FROM public.session_logs WHERE id=(SELECT record_id FROM public.submission_attempts WHERE principal='parallel')") != "1":
                    raise RuntimeError("Concurrent finalization created duplicate or missing records")
            print("Persistence checks passed, including 16 concurrent claims, saves and workload admissions.")
        print("Database protection checks passed; migration applied twice successfully.")
    finally:
        if (data / "postmaster.pid").exists():
            run("pg_ctl", "-D", data, "-m", "fast", "-w", "stop")
        print(f"Local test logs: {directory}")


if __name__ == "__main__":
    main()
