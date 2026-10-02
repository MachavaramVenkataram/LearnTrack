# LearnTrack

### AI-Powered Student Performance Prediction & Analytics

[![GitHub Repository](https://img.shields.io/badge/GitHub-LearnTrack-blue?logo=github)](https://github.com/MachavaramVenkataram/LearnTrack)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.13-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_RLS-3ECF8E?logo=supabase)](https://supabase.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-Ridge_Champion-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![SHAP](https://img.shields.io/badge/XAI-SHAP_Explainability-red)](https://github.com/slundberg/shap)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Primary_AI-8E75B2?logo=google)](https://deepmind.google/technologies/gemini/)
[![Groq](https://img.shields.io/badge/Groq-Fallback_AI-f55036)](https://groq.com/)

> **Repository URL**: [https://github.com/MachavaramVenkataram/LearnTrack](https://github.com/MachavaramVenkataram/LearnTrack)

---

## Overview

**LearnTrack** is a production-grade full-stack academic intelligence platform designed for students, educators, and academic institutions. Combining **Next.js 16** with Turbopack, **Supabase PostgreSQL** guarded by 100% strict Row Level Security (RLS), a dedicated **FastAPI Machine Learning prediction microservice**, **SHAP** (SHapley Additive exPlanations) for explainable AI, and context-isolated **Google Gemini / Groq fallback** generative intelligence, LearnTrack transforms raw academic signals (attendance, assessments, previous terms, study hours, coursework completion) into transparent, empirical performance predictions and personalized study optimization.

LearnTrack is architected with a strict separation of concerns between two distinct intelligence systems:
1. **Generative AI System (Google Gemini + Groq)**: Qualitative academic assistance, contextual flashcard creation, study planning, practice quiz generation, exam preparation, and conceptual tutoring.
2. **Machine Learning Prediction Engine (FastAPI + Scikit-Learn + SHAP)**: Quantitative academic scoring, confidence intervals, empirical feature attributions, What-If simulation, model error analysis, and automated retraining.

> **CRITICAL ARCHITECTURAL DISTINCTION**:
> Generative AI (Gemini and Groq) **does NOT replace** the ML prediction engine. Gemini and Groq handle language reasoning, content synthesis, and active recall assistance. All numerical performance predictions, risk categorizations, and sensitivity calculations are strictly executed by the deterministic Scikit-Learn regression model and validated by SHAP explainability.

---

## Features

- **Academic Dashboard**: Real-time academic command center displaying GPA, weighted scores, attendance tracking, and academic status indicators.
- **Performance Analytics**: Longitudinal progress visualization, subject breakdowns, semester trend comparisons, and risk alert indicators.
- **ML Performance Prediction**: Real-time regression inference calculating expected final marks, letter grades, and academic risk classifications from academic signals.
- **Explainable AI (SHAP)**: Empirical feature attribution cards highlighting exactly how attendance, internal assessments, and study hours mathematically influenced the predicted score.
- **What-If Simulator**: Interactive sensitivity simulator allowing students to hypothetically adjust study hours and attendance to project impact on expected grades before exams.
- **Smart Flashcards**: AI-generated flashcard decks tailored to course syllabi with active recall self-assessment.
- **Spaced Repetition (SM-2)**: Algorithmic scheduling following SuperMemo SM-2 principles for memory retention and mastery intervals.
- **AI Assistant**: Conversational study partner with grounded student context, strict student record isolation, and prompt injection defenses.
- **Study Plan**: Adaptive weekly schedules synthesized from upcoming exams, assignment deadlines, and identified subject weaknesses.
- **Notebook**: Interactive markdown notes editor with rich formatting, subject tagging, and AI summary integration.
- **Knowledge Base**: Curated academic resource repository and study reference documents.
- **Practice Quizzes**: Subject-specific interactive quizzes and question sets with immediate explanatory feedback.
- **Exam Preparation**: Targeted exam readiness diagnostics, high-yield concept reviews, and simulated mock questions.
- **Learning Memory**: Dynamic profile tracking personal study velocity, preferred review times, and recurring conceptual hurdles.
- **AI Academic Insights**: Structured evidence-based observations synthesizing strengths, improvement areas, and priority recommendations.
- **ML Monitoring & Telemetry**: Live telemetry monitoring prediction latency, request volume, and feature distribution shift (PSI).
- **Model Evaluation**: Benchmark reports comparing Ridge Regression, Random Forest, Gradient Boosting, and XGBoost across RMSE, MAE, and R² metrics.
- **Model Error Analysis**: Diagnostic residual distributions, quantile error breakdowns, and worst-case scenario analysis.
- **Automated Retraining**: Automated pipeline eligibility checks, validation gates, and admin-guided champion model promotion/rollback.
- **Academic Reports**: Academic summary reports exportable in JSON and CSV formats for student records.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (Turbopack, App Router, React Server Components)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS 4, Vanilla CSS Design Tokens
- **Icons & Motion**: Lucide React, Framer Motion
- **Data Visualization**: Recharts, Canvas Confetti

### Backend & ML Microservice
- **Framework**: FastAPI (Asynchronous Python Web Framework)
- **Runtime**: Python 3.13
- **ASGI Server**: Uvicorn
- **Validation**: Pydantic v2
- **Machine Learning**: Scikit-Learn (Ridge Champion Pipeline), XGBoost, Pandas, NumPy
- **Explainability**: SHAP (LinearExplainer & TreeSHAP)
- **Experiment Tracking**: MLflow Tracking & Model Registry

### AI Providers (Multi-Provider Architecture)
- **Primary AI Provider**: Google Gemini (`@google/genai`)
- **Fallback AI Provider**: Groq Cloud (`groq-sdk`)
- **Router**: Centralized AI Router with automated failover on transient errors (429 Rate Limits / 503 Service Unavailable)

### Database & Security
- **Database**: Supabase PostgreSQL 15
- **Authorization**: PostgreSQL Row Level Security (RLS) enabled on all tables
- **Authentication**: Supabase Auth (JWT sessions, Password & OAuth support)
- **Client**: `@supabase/ssr` and `@supabase/supabase-js`

### DevOps & Infrastructure
- **Containerization**: Docker, Docker Compose
- **Configuration**: Strict `.env.example` templates, zero committed credentials

---

## Architecture

```text
                           LearnTrack Platform Architecture
                                          │
                      ┌───────────────────┴───────────────────┐
                      ▼                                       ▼
           Next.js 16 (Turbopack)                    Supabase Platform
           ├── App Router (74 Pages & Routes)        ├── Auth (JWT & Sessions)
           ├── Server Route Handlers                 ├── PostgreSQL 15 (Strict RLS)
           └── Client UI (Recharts / Tailwind)       └── Storage Buckets
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
  Central AI Service        FastAPI ML Microservice (:8001)
  ├── Primary: Gemini       ├── Model: Ridge Regression Champion
  └── Fallback: Groq        ├── Explainability: SHAP Feature Impact
                            ├── What-If Simulator Engine
                            ├── MLflow Experiment Tracker
                            └── Drift (PSI) & Quality Checks
```

### AI & ML Separation of Concerns

| Capability | Engine | Provider / Library | Purpose |
| :--- | :--- | :--- | :--- |
| **Academic Performance Prediction** | Quantitative ML | Scikit-Learn Ridge | Computes expected numeric marks and letter grades |
| **Feature Attribution** | Explainable AI (XAI) | SHAP (Tree/Linear) | Calculates exact mathematical impact per input signal |
| **Sensitivity Simulation** | Quantitative ML | Scikit-Learn Pipeline | Simulates "What-If" parameter adjustments |
| **Conversational Study Assistant** | Generative AI | Google Gemini (Primary) | Context-aware academic Q&A and tutoring |
| **Failover Generative AI** | Generative AI | Groq Cloud (Fallback) | Automated failover on rate limits or API outages |
| **Flashcard Synthesis** | Generative AI | Gemini / Groq | Generates active recall Q&A pairs from course text |
| **Spaced Repetition Schedule** | Algorithmic Logic | SuperMemo SM-2 | Calculates review intervals based on recall ratings |

---

## Project Structure

```text
LearnTrack/
│
├── frontend/                     # Next.js 16 Frontend Application
│   ├── src/
│   │   ├── app/                  # App Router pages, layouts, and API routes
│   │   │   ├── (dashboard)/      # Authenticated dashboard views (analytics, goals, flashcards, etc.)
│   │   │   ├── api/ai/           # Server route handlers for AI features
│   │   │   └── api/health/       # System health & connectivity checks
│   │   ├── components/           # 220+ modular React components
│   │   │   ├── ai-assistant/     # Conversational assistant UI
│   │   │   ├── analytics/        # Performance charts and metric cards
│   │   │   ├── flashcards/       # Interactive flashcard review and decks
│   │   │   ├── layout/           # Sidebars, top navigation, and headers
│   │   │   ├── ml-monitoring/    # Telemetry and drift monitoring UI
│   │   │   ├── prediction/       # Prediction result display and attributions
│   │   │   ├── simulator/        # What-If sensitivity slider interface
│   │   │   └── ui/               # Core design system primitives (buttons, modals, cards)
│   │   ├── lib/                  # Application libraries
│   │   │   ├── academic/         # GPA and grade conversion utilities
│   │   │   ├── ai/               # Multi-provider router, Gemini, Groq, and schemas
│   │   │   ├── flashcards/       # SuperMemo SM-2 spaced repetition implementation
│   │   │   ├── ml/               # FastAPI ML client and input validators
│   │   │   └── supabase/         # Supabase client and auth helpers
│   │   └── types/                # TypeScript interfaces and domain schemas
│   ├── public/                   # Static public assets
│   ├── package.json              # Frontend dependencies and npm scripts
│   ├── package-lock.json         # Pinned npm dependency tree
│   └── tsconfig.json             # TypeScript configuration
│
├── ml-service/                   # FastAPI Machine Learning Microservice
│   ├── app/
│   │   ├── api/routes/           # API endpoints (prediction, monitoring, retraining, health)
│   │   ├── core/                 # Configuration, settings, and rate limiting
│   │   ├── schemas/              # Pydantic v2 request and response contracts
│   │   ├── services/             # Model loading, prediction, and insight services
│   │   └── main.py               # FastAPI application entrypoint
│   ├── ml/
│   │   ├── artifacts/            # Model artifacts (.pkl, .joblib, metadata.json)
│   │   ├── data/                 # Raw and processed academic performance datasets
│   │   ├── evaluation/           # Error analysis, residuals, and benchmark reports
│   │   ├── explainability/       # SHAP integration
│   │   ├── features/             # Feature engineering pipeline
│   │   ├── models/               # Training routines and model registry logic
│   │   ├── monitoring/           # Population Stability Index (PSI) drift monitoring
│   │   ├── retraining/           # Candidate evaluation, eligibility, and promotion
│   │   └── validation/           # Data quality schema validation
│   ├── tests/                    # 64-test Python validation suite
│   ├── Dockerfile                # Container recipe for ML microservice
│   └── requirements.txt          # Python dependencies
│
├── backend/                      # Alternative / Legacy ML Backend Module
│   ├── ml/                       # Predictor, dataset loader, and artifacts
│   ├── main.py                   # FastAPI entrypoint
│   └── requirements.txt          # Backend dependencies
│
├── supabase/                     # Database Schema & Migrations
│   ├── migrations/               # Sequential migration scripts (002 through 005)
│   ├── schema.sql                # Complete consolidated database schema with RLS
│   ├── seed.sql                  # Initial seed data for development
│   └── tests/                    # PostgreSQL RLS security test script
│
├── .env.example                  # Root environment template (placeholders only)
├── .gitignore                    # Git ignore rules for node, python, next, and caches
├── docker-compose.yml            # Multi-container local orchestration
└── README.md                     # Project documentation
```

---

## Environment Setup

### Environment Variables Security
LearnTrack uses environment variables for all external service connections.

1. **NEVER commit `.env.local` or `.env` files.** These files contain real credentials and are strictly excluded via `.gitignore`.
2. Always create your local configuration by copying `.env.example`:

```bash
# In the repository root / frontend:
cp .env.example frontend/.env.local
```

### Documented Variables (Placeholders Only)

| Variable | Required | Description | Example Placeholder |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Recommended | Google Gemini API key for primary AI features | `<your_gemini_api_key>` |
| `GEMINI_MODEL` | Optional | Gemini model identifier (default: `gemini-flash-latest`) | `gemini-flash-latest` |
| `GROQ_API_KEY` | Optional | Groq Cloud API key for automatic failover | `<your_groq_api_key>` |
| `GROQ_MODEL` | Optional | Groq model identifier (default: `qwen/qwen3.8-27b`) | `qwen/qwen3.8-27b` |
| `AI_PRIMARY_PROVIDER` | Optional | Primary AI provider name | `gemini` |
| `AI_FALLBACK_PROVIDER` | Optional | Fallback AI provider name | `groq` |
| `AI_ENABLE_FALLBACK` | Optional | Enable automatic transient error failover | `true` |
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Supabase project HTTPS URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Supabase public anonymous API key | `<your_supabase_anon_key>` |
| `NEXT_PUBLIC_ML_API_URL` | Required | FastAPI ML Microservice URL | `http://127.0.0.1:8001` |
| `NODE_ENV` | Optional | Node runtime environment | `development` |

---

## Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server with Turbopack
npm run dev
```

The frontend application runs by default at `http://localhost:3000`.

---

## FastAPI ML Setup

```bash
cd ml-service

# Create and activate Python virtual environment
python -m venv .venv

# Windows:
.\.venv\Scripts\activate

# Linux / macOS:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI ML microservice
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

- Microservice Base: `http://127.0.0.1:8001`
- Health Check: `http://127.0.0.1:8001/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8001/docs`

---

## Gemini Setup

1. Obtain an API key from Google AI Studio: [https://aistudio.google.com/](https://aistudio.google.com/)
2. In `frontend/.env.local`, set:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   GEMINI_MODEL=gemini-flash-latest
   ```
3. Gemini powers conversational tutoring, smart flashcard generation, adaptive study plans, and diagnostic practice sets.
4. All client-side requests proxy through Next.js server route handlers (`/api/ai/*`)—the Gemini API key is **never** sent to or exposed in the student's browser.

---

## Groq Fallback Setup

1. Obtain a free API key from Groq Cloud: [https://console.groq.com/](https://console.groq.com/)
2. In `frontend/.env.local`, set:
   ```env
   GROQ_API_KEY=your_actual_key_here
   GROQ_MODEL=qwen/qwen3.8-27b
   AI_FALLBACK_PROVIDER=groq
   AI_ENABLE_FALLBACK=true
   ```
3. If Google Gemini experiences rate limiting (`HTTP 429`) or transient outages (`HTTP 503`), the centralized router automatically routes the request to Groq without user disruption.

---

## Supabase Setup

1. Create a project on [Supabase](https://supabase.com/).
2. In your Supabase dashboard, copy your project URL and public `anon` key into `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
   ```
3. Run the SQL schema and migrations in the Supabase SQL Editor:
   - Execute `supabase/schema.sql` (Creates profiles, students, subjects, academic records, goals, flashcards, study sessions, and RLS policies).
   - Alternatively, execute sequential migrations in `supabase/migrations/`.
4. **Security Notice**: Never configure `SUPABASE_SERVICE_ROLE_KEY` in frontend environment variables. All frontend interactions must use the public `anon` key authenticated via user JWT.

---

## Development

```bash
# Terminal 1: Run ML Microservice
cd ml-service
.\.venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

# Terminal 2: Run Next.js Frontend
cd frontend
npm run dev
```

---

## Testing

LearnTrack maintains comprehensive test suites across both frontend and ML backend layers:

### Frontend Tests (Next.js & TypeScript)
```bash
cd frontend

# Run unit and integration tests (Gemini, Groq failover, SM-2 Flashcards, Supabase RLS)
npm test

# Run TypeScript static type check
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Run Next.js production build verification
npm run build
```

### Backend & ML Tests (Python & Pytest)
```bash
cd ml-service

# Run all 64 automated ML tests (schema validation, drift, retraining, API routes)
pytest tests/
```

---

## Deployment

### Vercel (Frontend)
1. Push your repository to GitHub.
2. Import the project in Vercel. Set the Root Directory to `frontend`.
3. Add environment variables from `frontend/.env.example` in the Vercel Dashboard.
4. Deploy.

### Containerized Deployment (Docker)
```bash
docker-compose up --build
```
This orchestrates:
- Next.js Frontend on port `3000`
- FastAPI ML microservice on port `8001`
- Health check monitoring and cross-container network routing

---

## Security

1. **Zero Hardcoded Secrets**: All API keys, database credentials, and service tokens are strictly configured through environment variables.
2. **Row Level Security (RLS)**: Every PostgreSQL table in Supabase is locked down with strict RLS policies, ensuring students can only access their own academic records.
3. **Key Sanitization**: Error messages and telemetry streams automatically sanitize and redact any string matching API key or token patterns before logging.
4. **Decoupled Architecture**: Generative language models never execute code or perform regression calculations directly; numerical scoring is strictly delegated to the deterministic Scikit-Learn service.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
