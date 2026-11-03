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


## Statistics and maintenance update (3 November 2026)

The `fix/statistics-maintenance` branch builds on PR #5. It fixes averages that omitted zero scores, safely excludes invalid historical grades, reads beyond database page limits, batches passage metadata, and keeps unknown exams out of IELTS totals. Existing score scales are unchanged; summary coverage is explicit and does not represent a single complete mock exam.

The same change hardens database error/cardinality/delete handling, shares writing prompt lookup and fallback behavior, filters speaking examples consistently, adds additive prompt-table setup, and closes database/audio resources on shutdown. `/health` remains liveness; `/ready` checks configuration only.

See [Statistics and maintenance](lingoprep-backend/STATISTICS_MAINTENANCE.md) for contracts, migration instructions, verification and remaining limitations. Apply `migration_writing_prompts.sql` in staging and classify older unlabeled prompts before deployment. No production database changes were made. Progress charts and saved-report pages remain future application work.
