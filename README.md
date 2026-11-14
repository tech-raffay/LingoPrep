# LingoPrep 🎓

> AI-Powered IELTS & TOEFL English Proficiency Evaluator

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, Tailwind CSS, TypeScript |
| Backend | FastAPI (Python 3.10+) |
| Database | Supabase (PostgreSQL) |
| AI Engine | Llama 3 via Groq Cloud API |

## Project Structure

```
lingoprep/
├── lingoprep-frontend/    # Next.js app (port 3000)
├── lingoprep-backend/     # FastAPI server (port 8000)
└── .agents/               # Workspace rules
```

## Getting Started

### Frontend
```bash
cd lingoprep-frontend
npm install
cp .env.example .env.local   # Add your Supabase keys
npm run dev                   # → http://localhost:3000
```

### Backend
```bash
cd lingoprep-backend
python -m venv venv
venv\Scripts\activate         # Windows
pip install -r requirements.txt
cp .env.example .env          # Add your API keys
uvicorn app.main:app --reload # → http://localhost:8000
```

## Current Phase (7th Semester — 50%)

- [x] Project scaffold (frontend + backend)
- [ ] Supabase database schema
- [ ] Automated Reading Module (MCQ engine)
- [ ] Automated Listening Module (Audio + MCQ)
- [ ] Baseline Writing Evaluator (Llama 3)

## License

Academic project — Final Year Project (FYP)


## Reviewed backend hardening (November 2026)

The reviewed integration combines the cumulative scoring, answer protection,
authentication, AI contract, persistence/resource-limit and statistics changes
with the separate secure-audio work. It fixes averages that omitted zero scores,
safely excludes invalid historical grades, reads beyond database page limits,
batches passage metadata, and keeps unknown exams out of IELTS totals. Existing
score scales are unchanged; summary coverage is explicit and does not represent
a single complete mock exam.

The same change hardens database error/cardinality/delete handling, shares writing prompt lookup and fallback behavior, filters speaking examples consistently, adds additive prompt-table setup, and closes database/audio resources on shutdown. `/health` remains liveness; `/ready` checks configuration only.

See [answer/record protection](BACKEND_SECURITY.md), [persistence and resource
limits](lingoprep-backend/PERSISTENCE_RESOURCE_LIMITS.md), [secure audio](lingoprep-backend/AUDIO_HANDLING.md),
and [statistics and maintenance](lingoprep-backend/STATISTICS_MAINTENANCE.md) for
contracts, migration order, verification, and remaining limitations. Apply and
test every incremental migration in staging, configure the backend-only secrets,
and deploy frontend/backend together. No production database changes are made by
merging source code alone. Progress charts and saved-report pages remain future
application work.
