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
