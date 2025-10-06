from docx import Document as DocxDocument
from PyPDF2 import PdfReader

ALLOWED_EXT = {'txt','docx','pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXT

def extract_text(path):
    ext = path.rsplit('.',1)[1].lower()
    try:
        if ext == 'txt':
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        elif ext == 'docx':
            doc = DocxDocument(path)
            return '\n'.join(p.text for p in doc.paragraphs)
        elif ext == 'pdf':
            reader = PdfReader(path)
            text = ''
            for page in reader.pages:
                text += page.extract_text()
            return text
        else:
            return ''
    except Exception as e:
        # Log the error if needed, but for now return empty string
        return ''
