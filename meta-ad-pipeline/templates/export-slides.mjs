import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATE = '20260309';

const files = [
  { html: 'cardnews_portfolio_insta_B.html', prefix: 'B' },
  { html: 'cardnews_portfolio_insta_C.html', prefix: 'C' },
];

const outDir = path.join(__dirname, 'exports');

async function run() {
  const browser = await puppeteer.launch({ headless: true });

  for (const { html, prefix } of files) {
    const page = await browser.newPage();
    const filePath = path.join(__dirname, html);
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map(img =>
          img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })
        )
      );
    });

    const slides = await page.$$('.slide');
    console.log(`${prefix}안: ${slides.length}장 발견`);

    for (let i = 0; i < slides.length; i++) {
      const num = String(i + 1).padStart(2, '0');
      const filename = `${DATE}_portfolio_insta_${prefix}_${num}.png`;
      const outPath = path.join(outDir, filename);

      await slides[i].screenshot({ path: outPath, type: 'png' });
      console.log(`  ✓ ${filename}`);
    }

    await page.close();
  }

  await browser.close();
  console.log(`\n완료! ${outDir} 에 저장됨`);
}

run().catch(console.error);
