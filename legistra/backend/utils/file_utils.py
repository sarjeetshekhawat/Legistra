from docx import Document as DocxDocument
from PyPDF2 import PdfReader
import logging
import os

logger = logging.getLogger(__name__)

# Match the allowed extensions from config
ALLOWED_EXT = {'txt', 'docx', 'pdf', 'doc'}

def allowed_file(filename):
    """
    Check if file extension is allowed.
    
    Args:
        filename: Name of the file
        
    Returns:
        bool: True if extension is allowed, False otherwise
    """
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXT

def extract_text(path):
    """
    Extract text from a file based on its extension.
    
    Args:
        path: Path to the file
        
    Returns:
        str: Extracted text content
        
    Raises:
        Exception: If text extraction fails
    """
    if not path or not os.path.exists(path):
        raise ValueError(f"File does not exist: {path}")
    
    ext = path.rsplit('.', 1)[1].lower() if '.' in path else ''
    
    try:
        if ext == 'txt':
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        elif ext == 'docx':
            doc = DocxDocument(path)
            return '\n'.join(p.text for p in doc.paragraphs)
        elif ext == 'doc':
            # .doc files require additional libraries (python-docx doesn't support .doc)
            # For now, return a message indicating .doc files need conversion
            logger.warning(f".doc files are not fully supported. Please convert to .docx")
            raise ValueError("Legacy .doc format is not supported. Please convert to .docx format.")
        elif ext == 'pdf':
            reader = PdfReader(path)
            text = ''
            for page in reader.pages:
                text += page.extract_text()
            return text
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
    except ValueError as ve:
        # Re-raise ValueError (unsupported format)
        raise
    except Exception as e:
        # Log and re-raise other exceptions
        logger.error(f"Error extracting text from {path}: {str(e)}", exc_info=True)
        raise Exception(f"Failed to extract text from file: {str(e)}")
