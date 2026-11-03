"""Run the real migration against a disposable local PostgreSQL cluster.

Usage: python tests/run_database_protection.py --pg-bin /path/to/postgres/bin
No Supabase credentials or existing database are used. The test cluster is
stopped in finally; its files/log remain under the repository's ignored tmp/.
"""

import argparse
from pathlib import Path
import socket
import subprocess
from uuid import uuid4


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pg-bin", type=Path, required=True)
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
                     "-f", Path(__file__).with_name("database_protection.sql"))
        (directory / "test-output.txt").write_text(output, encoding="utf-8")
        print("Database protection checks passed; migration applied twice successfully.")
    finally:
        if (data / "postmaster.pid").exists():
            run("pg_ctl", "-D", data, "-m", "fast", "-w", "stop")
        print(f"Local test logs: {directory}")


if __name__ == "__main__":
    main()
