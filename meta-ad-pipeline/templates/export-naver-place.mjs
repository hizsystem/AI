import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATE = '20260310';
const HTML = '20260310_naver_place_carousel.html';
const outDir = path.join(__dirname, 'exports');

async function run() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Viewport at slide size for full-res capture
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

  const filePath = path.join(__dirname, HTML);
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  const slideCount = await page.$$eval('.slide', els => els.length);
  console.log(`슬라이드 ${slideCount}장 발견\n`);

  for (let i = 0; i < slideCount; i++) {
    // Reset all slides: hide everything, then show only the target slide at scale 1
    await page.evaluate((idx) => {
      document.body.style.padding = '0';
      document.body.style.margin = '0';
      document.body.style.background = 'transparent';
      document.querySelector('.header').style.display = 'none';

      const wraps = document.querySelectorAll('.slide-wrap');
      wraps.forEach((w, j) => {
        if (j === idx) {
          w.style.display = 'block';
          w.style.width = '1080px';
          w.style.height = '1350px';
          const slide = w.querySelector('.slide');
          slide.style.transform = 'none';
          // Hide slide number label
          const num = w.querySelector('.slide-num');
          if (num) num.style.display = 'none';
        } else {
          w.style.display = 'none';
        }
      });

      // Hide slides-row flex gap
      const row = document.querySelector('.slides-row');
      row.style.gap = '0';
      row.style.padding = '0';
    }, i);

    const slide = (await page.$$('.slide'))[i];
    const num = String(i + 1).padStart(2, '0');
    const filename = `${DATE}_naver_place_${num}.png`;
    const outPath = path.join(outDir, filename);

    await slide.screenshot({ path: outPath, type: 'png' });
    console.log(`  ✓ ${filename}`);

    // Reload page for clean state before next slide
    if (i < slideCount - 1) {
      await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
    }
  }

  await browser.close();
  console.log(`\n완료! ${slideCount}장 → ${outDir}`);
}

run().catch(console.error);
