/**
 * 범용 HTML → PDF 변환 스크립트
 *
 * 사용법:
 *   node scripts/export-to-pdf.mjs <input> [output]
 *
 * input:  HTML 파일 경로 또는 URL
 * output: PDF 출력 경로 (생략 시 input과 같은 위치에 .pdf로 저장)
 *
 * 예시:
 *   node scripts/export-to-pdf.mjs clients/brandrise/reports/weekly.html
 *   node scripts/export-to-pdf.mjs https://example.com output.pdf
 */
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Parse arguments
const input = process.argv[2];
let output = process.argv[3];

if (!input) {
  console.error('Usage: node scripts/export-to-pdf.mjs <input-html-or-url> [output.pdf]');
  process.exit(1);
}

// Determine input URL
const isUrl = input.startsWith('http://') || input.startsWith('https://');
const inputUrl = isUrl ? input : `file://${path.resolve(projectRoot, input)}`;

// Determine output path
if (!output) {
  if (isUrl) {
    output = 'export.pdf';
  } else {
    output = input.replace(/\.html?$/i, '') + '.pdf';
  }
}
output = path.resolve(projectRoot, output);

async function exportPDF() {
  console.log(`Input:  ${isUrl ? input : path.resolve(projectRoot, input)}`);
  console.log(`Output: ${output}`);

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754 });
  await page.goto(inputUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 2000));

  await page.pdf({
    path: output,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    preferCSSPageSize: true,
  });

  await browser.close();
  console.log(`PDF exported: ${output}`);
}

exportPDF().catch(err => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
