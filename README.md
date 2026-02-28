# Legistra — AI-Powered Legal Document Analysis

![Python](https://img.shields.io/badge/python-3.11-3776AB?logo=python&logoColor=white)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

> Upload contracts, detect risks, and extract key clauses instantly with advanced NLP.  
> Built for legal professionals, startups, and students.

---

## ✨ Features

- **Multi-format upload** — PDF, DOCX, TXT
- **AI clause extraction** — Liability, payment, confidentiality, termination
- **Risk detection** — Critical / high / medium / low severity scoring
- **Multilingual** — English, Hindi, Marathi
- **Interactive dashboard** — Charts, stats, document overview
- **PDF export** — One-click professional analysis reports
- **JWT authentication** — Secure session management
- **Dockerized** — One-command deployment with docker-compose

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Chart.js |
| Backend | Flask, Gunicorn, Python 3.11 |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| AI / NLP | spaCy, PyTorch, Hugging Face Transformers |
| DevOps | Docker, docker-compose, nginx |

## 📐 Architecture

```
Browser (:80)  →  nginx  →  React SPA (static files)
                    ↓
                /api/*  →  Flask / Gunicorn (:5000)  →  Supabase (external)
```

## 🚀 Quick Start

### Docker (recommended)

```bash
git clone https://github.com/yourusername/Legistra.git
cd Legistra
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase URL and Key
docker-compose up --build
# Open http://localhost
```

### Manual Setup

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # Edit with real Supabase credentials
python app.py

# Frontend (new terminal)
cd frontend
npm install
npm start                      # Opens http://localhost:3000
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login (returns JWT) |
| POST | `/api/upload-document` | Upload legal document |
| POST | `/api/analyze-document-fast-multilingual` | Run AI analysis |
| GET | `/api/documents` | List user's documents |
| GET | `/api/dashboard-stats` | Dashboard metrics |
| POST | `/api/export-analysis` | Export as PDF report |
| GET | `/api/health` | Health check |

## 📂 Project Structure

```
Legistra/
├── backend/
│   ├── app.py                 # Flask application
│   ├── models_supabase.py     # Supabase data layer
│   ├── ml_analysis_sync.py    # AI/ML analysis pipeline
│   ├── auth.py                # JWT authentication
│   ├── config.py              # Environment configuration
│   ├── Dockerfile             # Multi-stage production build
│   └── requirements.txt
├── frontend/
│   ├── src/pages/             # React pages
│   ├── src/components/        # Reusable components
│   ├── Dockerfile             # React build → nginx
│   └── nginx.conf             # Reverse proxy config
├── docker-compose.yml         # Orchestration
└── README.md
```

## 🔒 Security

- Passwords hashed with PBKDF2 (Werkzeug)
- JWT tokens (HS256) with 24-hour expiry
- CORS restricted to allowed origins
- Non-root Docker container user
- Environment secrets never baked into images

## 📄 License

MIT — Built by **Sarjeet Shekhawat**
