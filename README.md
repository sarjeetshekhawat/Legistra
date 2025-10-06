# Legistra

Legistra is a web application for analyzing legal documents using advanced machine learning techniques. It allows users to upload legal documents (PDF, DOCX, TXT), perform automated summarization, clause extraction, risk identification, and export analysis reports as PDFs. The application leverages AI models for natural language processing to provide insights into legal texts, making it easier for legal professionals to review and understand complex documents.

## Key Features

- **Document Upload**: Support for PDF, DOCX, and TXT file formats.
- **Automated Analysis**: Summarization, clause extraction, and risk identification using transformer-based models.
- **Real-time Processing**: Asynchronous task processing with Celery for handling long-running analyses.
- **PDF Export**: Generate detailed PDF reports of analysis results.
- **Web Interface**: User-friendly frontend built with React for uploading documents and viewing results.
- **API Endpoints**: RESTful API for integration with other systems.
- **Scalable Architecture**: Built with Flask backend, MongoDB for data storage, and Redis for task queuing.

## Repository Structure

```
legistra/
├── backend/                 # Flask backend application
│   ├── app.py              # Main Flask app with API routes
│   ├── tasks.py            # Celery tasks for document analysis
│   ├── models.py           # MongoDB models and database operations
│   ├── config.py           # Configuration settings
│   ├── utils/              # Utility functions (e.g., file handling)
│   ├── uploads/            # Uploaded document storage
│   ├── tests/              # Unit tests
│   └── requirements.txt    # Python dependencies
├── frontend/                # React frontend application
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
├── ml/                     # Machine learning components
│   ├── models/             # Pre-trained models and fine-tuning scripts
│   ├── pipelines/          # ML pipelines (e.g., RAG, summarization)
│   ├── data/               # Data processing and datasets
│   └── scripts/            # Training and evaluation scripts
├── docs/                   # Documentation
├── data/                   # Shared data (e.g., FAISS index)
├── notebooks/              # Jupyter notebooks for experimentation
├── start_backend.py        # Script to start the backend
├── check_docs.py           # Utility script
└── TODO.md                 # Project TODO list
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- MongoDB
- Redis
- Git

### Cloning the Repository

```bash
git clone https://github.com/yourusername/legistra.git
cd legistra
```

### Backend Setup

1. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   cd legistra/backend
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the `backend/` directory based on `.env.example`:
   ```env
   FLASK_ENV=development
   MONGODB_URI=mongodb://localhost:27017/
   MONGO_DB=legal_docs
   REDIS_URL=redis://localhost:6379/0
   UPLOAD_FOLDER=uploads/
   MAX_CONTENT_LENGTH=10485760  # 10MB
   SECRET_KEY=your-secret-key-here
   ```

4. **Start required services**:
   - Ensure MongoDB is running on `localhost:27017`
   - Ensure Redis is running on `localhost:6379`

5. **Start Celery worker**:
   ```bash
   celery -A celery_app worker --loglevel=info
   ```

6. **Run the Flask app**:
   ```bash
   python app.py
   ```
   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

### Docker Setup (Optional)

If you prefer using Docker:

```bash
docker-compose up --build
```

This will start the backend, frontend, MongoDB, and Redis in containers.

## Usage Guide

1. **Upload a Document**:
   - Go to the upload page in the web interface.
   - Select a legal document (PDF, DOCX, or TXT) and upload it.
   - The system will store the document and extract text.

2. **Run Analysis**:
   - After upload, initiate the analysis task.
   - The system will process the document asynchronously using Celery.
   - Monitor the task status via the UI or API.

3. **View Results**:
   - Once analysis is complete, view the summary, extracted clauses, and identified risks.
   - The results are displayed in the web interface.

4. **Export PDF Report**:
   - Use the export feature to generate a PDF report containing the analysis results.
   - The PDF includes summary, clauses, and risks populated from the real analysis data.

## API Details

The backend provides RESTful API endpoints:

- `POST /api/upload-document`: Upload a document file.
- `POST /api/analyze-document`: Start analysis for an uploaded document (returns task_id).
- `GET /api/task-status/<task_id>`: Check the status of an analysis task.
- `POST /api/export-analysis`: Export analysis results as PDF (requires task_id).
- `GET /api/dashboard-stats`: Get dashboard statistics.

For detailed API documentation, refer to the Swagger UI or the code comments in `app.py`.

## Contribution Guidelines

1. **Fork the repository** on GitHub.
2. **Create a feature branch** from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and ensure tests pass.
4. **Commit your changes** with descriptive messages:
   ```bash
   git commit -m "Add feature: description of changes"
   ```
5. **Push to your fork** and **create a pull request** on GitHub.
6. Wait for review and merge.

Please follow PEP 8 for Python code and ESLint rules for JavaScript.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
