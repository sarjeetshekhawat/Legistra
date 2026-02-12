# Legistra - AI-Powered Legal Document Analysis

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![React](https://img.shields.io/badge/react-18-blue)
![Status](https://img.shields.io/badge/status-production--ready-green)

**Legistra is a production-ready platform for automated legal document analysis, contract review, and risk assessment using advanced NLP and machine learning.**

---

## 🚀 Overview

Legistra transforms how legal professionals handle document review by automating time-consuming analysis tasks. The platform processes legal documents (PDF, DOCX, TXT) to extract key clauses, identify risks, generate summaries, and provide actionable insights—saving hours of manual review time while improving accuracy.

## ✨ Key Features

- **📄 Multi-Format Support**: Seamlessly upload and analyze PDF, DOCX, and TXT documents.
- **mj🤖 AI-Powered Analysis**: specialized NLP models for clause extraction, risk detection, and summarization.
- **🌍 Multilingual Processing**: Native support for English, Hindi, and Marathi legal documents.
- **⚡ Real-time Processing**: Asynchronous task queue architecture for handling large documents without blocking.
- **📊 Interactive Dashboard**: Visual insights into risk distribution and document metrics.
- **📑 Professional Reports**: One-click PDF export of detailed analysis reports.
- **🔒 Secure & Private**: Enterprise-grade security with local processing capabilities.

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Task Queue**: Celery + Redis
- **Database**: MongoDB (Metadata & Results), PostgreSQL (User Data - optional)
- **ML/NLP**: Hugging Face Transformers, spaCy, PyTorch
- **PDF Generation**: ReportLab

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS, ShadCN/UI
- **State Management**: React Context / Hooks
- **Visualization**: Chart.js

## 📂 Project Structure

```
Legistra/
├── backend/                # Flask API & Worker Nodes
│   ├── models/             # Database Models
│   ├── utils/              # Helper Functions & File Processors
│   ├── app.py              # Application Entry Point
│   ├── celery_app.py       # Celery Configuration
│   ├── tasks.py            # Async Tasks Definitions
│   └── ...
├── frontend/               # React Client Application
│   ├── src/                # Components, Pages, Hooks
│   ├── public/             # Static Assets
│   └── ...
├── ml/                     # Machine Learning Pipeline
│   ├── data/               # Dataset Scripts
│   ├── models/             # ML Model Definitions
│   └── ...
├── docs/                   # Additional Documentation
└── README.md               # Project Documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB
- Redis Server

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Update .env with your database credentials
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 3. Running Services

Ensure MongoDB and Redis are running, then start the backend workers and API:

```bash
# Terminal 1: Celery Worker
cd backend
celery -A celery_app worker --loglevel=info

# Terminal 2: API Helper
cd backend
python app.py
```

## 🔌 API Overview

Legistra provides a comprehensive REST API. Key endpoints:

- **Auth**: `/auth/login`, `/auth/register`
- **Documents**: `/api/upload-document`, `/api/documents`, `/api/search-documents`
- **Analysis**: `/api/analyze-document`, `/api/task-status/<task_id>`
- **Stats**: `/api/dashboard-stats`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ by Sarjeet Shekhawat*
