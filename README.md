# Legistra - AI-Powered Legal Document Analysis

**Production-ready platform for automated legal document analysis, contract review, and risk assessment using advanced NLP and machine learning.**

## Overview

Legistra transforms how legal professionals handle document review by automating time-consuming analysis tasks. The platform processes legal documents (PDF, DOCX, TXT) to extract key clauses, identify risks, generate summaries, and provide actionable insights—saving hours of manual review time while improving accuracy.

## Key Features

- **Multi-Format Support**: Upload and analyze PDF, DOCX, and TXT documents
- **AI-Powered Analysis**: Advanced NLP for clause extraction and risk identification
- **Multilingual Processing**: Support for English, Hindi, and Marathi documents
- **Real-time Processing**: Asynchronous task processing with progress tracking
- **PDF Export**: Generate professional analysis reports with detailed findings
- **Modern UI**: Clean, responsive React interface with dark mode support
- **RESTful API**: Complete API for integration with existing workflows

## Technology Stack

**Backend:**
- Flask (Web Framework)
- Celery + Redis (Async Task Processing)
- MongoDB (Document Database)
- Transformers + spaCy (NLP Models)
- ReportLab (PDF Generation)

**Frontend:**
- React 18 (UI Framework)
- Tailwind CSS (Styling)
- ShadCN/UI (Components)
- Axios (HTTP Client)

**ML/AI:**
- Hugging Face Transformers
- spaCy NLP Pipeline
- LangDetect (Language Detection)
- Custom Legal Document Models

## Architecture

```
React Frontend → Flask API → ML Pipeline → MongoDB/Redis
     ↓              ↓           ↓            ↓
   User Interface  REST API  NLP Models   Data Storage
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB (localhost:27017)
- Redis (localhost:6379)

### Backend Setup

```bash
cd legistra/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

### Frontend Setup

```bash
cd legistra/frontend
npm install
```

### Running the Application

```bash
# Start services
mongod
redis-server

# Start backend (in legistra/backend)
source venv/bin/activate
celery -A celery_app worker --loglevel=info  # Terminal 1
python app.py                                 # Terminal 2

# Start frontend (in legistra/frontend)
npm start
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

Create `.env` in `backend/`:

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
MONGODB_URI=mongodb://localhost:27017/
MONGO_DB=legal_docs
REDIS_URL=redis://localhost:6379/0
UPLOAD_FOLDER=uploads/
MAX_CONTENT_LENGTH=10485760
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600
```

## API Overview

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Current user info

### Document Management
- `POST /api/upload-document` - Upload document
- `GET /api/documents` - List user documents
- `GET /api/dashboard-stats` - Dashboard statistics

### Analysis
- `POST /api/analyze-document-fast-multilingual` - Analyze document
- `GET /api/task-status/<task_id>` - Check analysis status
- `POST /api/export-analysis-temp/<document_id>` - Export PDF report

## Why Legistra Exists

Legal document review is traditionally time-consuming, expensive, and prone to human error. Lawyers spend countless hours manually reviewing contracts, identifying clauses, and assessing risks. Legistra addresses this by:

- **Automating Manual Tasks**: Reduces review time from hours to minutes
- **Improving Accuracy**: AI models catch details humans might miss
- **Standardizing Analysis**: Consistent review process across all documents
- **Enabling Scalability**: Handle large document volumes efficiently
- **Reducing Costs**: Minimize billable hours spent on routine review

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
