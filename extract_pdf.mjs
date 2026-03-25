import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');

const pdfPath = "C:\\Users\\y2k1\\.openclaw\\media\\inbound\\个人信用报告2025090300050342486973---a1eb5e95-c736-401c-bdc5-5a810d36e6ea.pdf";

async function extractText() {
  const buffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }
  console.log(fullText);
}

extractText().catch(console.error);
