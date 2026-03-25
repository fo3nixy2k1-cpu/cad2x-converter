import sys
import subprocess

pdf_path = r"C:\Users\y2k1\.openclaw\media\inbound\个人信用报告2025090300050342486973---a1eb5e95-c736-401c-bdc5-5a810d36e6ea.pdf"

try:
    import PyPDF2
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        print(text)
except Exception as e:
    print(f"PyPDF2 failed: {e}")
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            print(text)
    except Exception as e2:
        print(f"pdfplumber failed: {e2}")
