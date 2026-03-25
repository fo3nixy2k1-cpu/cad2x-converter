#!/usr/bin/env python3
# Extract text from PDF file
import sys
import pathlib

try:
    import PyPDF2
    import fitz  # PyMuPDF
except ImportError:
    print("Required libraries not found. Please install: pip install PyPDF2 pymupdf")
    sys.exit(1)

pdf_path = r"C:\Users\y2k1\.openclaw\media\outbound\326db904-1804-4ccf-9590-6d71f1681d6d.pdf"
output_path = r"C:\Users\y2k1\.openclaw\workspace\pdf_extracted.txt"

def extract_with_pypdf2():
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        return f"PyPDF2 failed: {e}"

def extract_with_pymupdf():
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
        return text
    except Exception as e:
        return f"PyMuPDF failed: {e}"

if __name__ == "__main__":
    print(f"Extracting text from: {pdf_path}")

    # Try PyMuPDF first (better for complex PDFs)
    text = extract_with_pymupdf()
    if text.strip():
        print("Extraction successful with PyMuPDF")
    else:
        print("PyMuPDF returned empty, trying PyPDF2...")
        text = extract_with_pypdf2()
        if text.strip():
            print("Extraction successful with PyPDF2")
        else:
            print("Both extractions returned empty. PDF may be image-based or encrypted.")

    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)

    print(f"Text written to: {output_path}")
    print(f"First 2000 characters of extracted text:")
    print(text[:2000])
