import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// A4 portrait
const WIDTH = 1240;
const HEIGHT = 1754;

const pages = [
  {
    name: 'brandrise-경험형',
    url: 'https://brandrise-profile.vercel.app/',
  },
  {
    name: 'brandrise-진단포커스형',
    url: 'https://brandrise-diagnosis.vercel.app/',
  },
];

async function exportPDF() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });

  for (const page of pages) {
    console.log(`Exporting: ${page.name}...`);
    const tab = await browser.newPage();
    await tab.setViewport({ width: WIDTH, height: HEIGHT });
    await tab.goto(page.url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for web fonts to fully load
    await tab.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 3000));

    const outputPath = path.join(__dirname, `${page.name}.pdf`);
    await tab.pdf({
      path: outputPath,
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: false,
    });

    console.log(`Done: ${outputPath}`);
    await tab.close();
  }

  await browser.close();
  console.log('All exports complete.');
}

exportPDF().catch(console.error);
