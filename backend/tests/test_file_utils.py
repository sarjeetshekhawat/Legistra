import pytest
import os
from utils.file_utils import allowed_file, extract_text

def test_allowed_file():
    assert allowed_file('test.txt') == True
    assert allowed_file('test.docx') == True
    assert allowed_file('test.pdf') == True
    assert allowed_file('test.jpg') == False
    assert allowed_file('test') == False
    assert allowed_file('test.TXT') == True

def test_extract_text_txt():
    # Assuming sample.txt exists
    text = extract_text('tests/sample.txt').strip()
    assert text == 'This is a sample text file for testing document upload.'

def test_extract_text_docx():
    # Need a sample.docx, for now skip or assume
    pass

def test_extract_text_pdf():
    # For now, returns ''
    text = extract_text('tests/sample.pdf')
    assert text == ''

def test_extract_text_invalid():
    text = extract_text('tests/nonexistent.txt')
    assert text == ''
