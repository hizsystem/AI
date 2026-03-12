import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'exports');

async function run() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const filePath = path.join(__dirname, 'profile_picture_br.html');
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);

  const slides = await page.$$('.slide');
  const labels = ['A_orange', 'B_dark', 'C_gradient'];

  for (let i = 0; i < slides.length; i++) {
    // Hide all, show only target
    await page.evaluate((idx) => {
      document.querySelectorAll('.slide').forEach((s, j) => {
        s.style.display = j === idx ? 'flex' : 'none';
      });
    }, i);

    const filename = `profile_br_${labels[i]}.png`;
    const outPath = path.join(outDir, filename);
    await slides[i].screenshot({ path: outPath, type: 'png' });
    console.log(`  ✓ ${filename}`);
  }

  await browser.close();
  console.log(`\n완료! → ${outDir}`);
}

run().catch(console.error);
