import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const jobs = [
  { slug: "yard-kitchen", url: "https://www.yardkitchen.co.uk" },
  { slug: "flowers-kitchen", url: "https://flowerskitchen.co.uk" },
  { slug: "wisk", url: "https://wiskapp.com" },
  { slug: "blue-peak", url: "https://blue-peak-omega.vercel.app" },
];

const extraShots = [
  { slug: "flowers-kitchen", url: "https://flowerskitchen.co.uk/catering", name: "catering" },
  { slug: "blue-peak", url: "https://blue-peak-omega.vercel.app/quote", name: "quote" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const acceptLabel = /^(accept|accept all|allow all|allow cookies|i agree|got it|agree|ok|okay|accept cookies)$/i;

async function dismissCookies(page) {
  const buttons = page.locator("button, [role='button'], a");
  const count = await buttons.count();
  for (let index = 0; index < Math.min(count, 60); index += 1) {
    const button = buttons.nth(index);
    const visible = await button.isVisible().catch(() => false);
    if (!visible) continue;
    const text = ((await button.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
    if (!acceptLabel.test(text)) continue;
    await button.click({ timeout: 1500 }).catch(() => {});
    await page.waitForTimeout(300);
    break;
  }
  await page
    .addStyleTag({
      content: `
        [id*="cookie" i], [class*="cookie-banner" i], [class*="cookie-consent" i],
        [id*="onetrust" i], [class*="onetrust" i], [aria-label*="cookie" i] {
          display: none !important;
        }
      `,
    })
    .catch(() => {});
}

function rgbToHex(value) {
  const match = String(value || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return value;
  return `#${match
    .slice(1, 4)
    .map((part) => Number(part).toString(16).padStart(2, "0"))
    .join("")}`;
}

async function readTheme(page) {
  const theme = await page.evaluate(() => {
    const saturation = (value) => {
      const match = String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return 0;
      const [r, g, b] = match.slice(1).map((part) => Number(part) / 255);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max === min) return 0;
      const light = (max + min) / 2;
      const delta = max - min;
      return light > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    };
    const body = getComputedStyle(document.body);
    const h1 = document.querySelector("h1");
    const h1Style = h1 ? getComputedStyle(h1) : body;
    const candidates = [...document.querySelectorAll("a, button")]
      .map((element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return {
          area: box.width * box.height,
          bg: style.backgroundColor,
          score: saturation(style.backgroundColor),
        };
      })
      .filter((item) => item.area > 800 && item.area < 180000 && item.score > 0.35);
    candidates.sort((a, b) => b.score - a.score || b.area - a.area);
    return {
      bg: body.backgroundColor,
      fg: body.color,
      accent: candidates[0] ? candidates[0].bg : body.color,
      displayFont: h1Style.fontFamily,
      bodyFont: body.fontFamily,
    };
  });
  return {
    bg: rgbToHex(theme.bg),
    fg: rgbToHex(theme.fg),
    accent: rgbToHex(theme.accent),
    displayFont: theme.displayFont,
    bodyFont: theme.bodyFont,
  };
}

async function toWebp(png, dest) {
  let quality = 80;
  let buffer = await sharp(png).webp({ quality }).toBuffer();
  while (buffer.length > 300 * 1024 && quality > 40) {
    quality -= 8;
    buffer = await sharp(png).webp({ quality }).toBuffer();
  }
  fs.writeFileSync(dest, buffer);
  return { bytes: buffer.length, quality };
}

async function capture(page, job, viewport, fileName = viewport.name) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  try {
    await page.goto(job.url, { waitUntil: "networkidle", timeout: 45000 });
  } catch {
    await page.waitForLoadState("domcontentloaded");
  }
  await dismissCookies(page);
  await page.waitForTimeout(1000);
  const notes = await page.evaluate(() => {
    const text = document.body.innerText || "";
    return {
      photoToFollow: /photo to follow/i.test(text),
      testNumber: /01632/.test(text),
      placeholder: /placeholder/i.test(text),
      cookie: /cookie/i.test(text),
    };
  });
  const dir = path.join("public/images/work", job.slug);
  fs.mkdirSync(dir, { recursive: true });
  const pngPath = path.join(dir, `${fileName}.png`);
  const png = await page.screenshot({ type: "png" });
  fs.writeFileSync(pngPath, png);
  const webp = await toWebp(png, path.join(dir, `${fileName}.webp`));
  const theme = viewport.name === "desktop" ? await readTheme(page) : null;
  return { notes, webp, theme, pngBytes: png.length };
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const themes = {};
const report = [];

for (const job of jobs) {
  themes[job.slug] = {};
  for (const viewport of viewports) {
    const result = await capture(page, job, viewport);
    if (result.theme) {
      themes[job.slug] = {
        ...themes[job.slug],
        bg: result.theme.bg,
        fg: result.theme.fg,
        accent: result.theme.accent,
        displayFont: result.theme.displayFont,
        bodyFont: result.theme.bodyFont,
      };
    }
    report.push({
      slug: job.slug,
      viewport: viewport.name,
      webpKB: Math.round(result.webp.bytes / 1024),
      quality: result.webp.quality,
      notes: result.notes,
    });
    console.log(job.slug, viewport.name, result.webp, result.notes);
  }
}

for (const shot of extraShots) {
  const result = await capture(page, shot, viewports[0], shot.name);
  report.push({
    slug: shot.slug,
    viewport: shot.name,
    webpKB: Math.round(result.webp.bytes / 1024),
    quality: result.webp.quality,
    notes: result.notes,
  });
  console.log(shot.slug, shot.name, result.webp, result.notes);
}

await browser.close();
fs.mkdirSync("scripts", { recursive: true });
fs.writeFileSync("scripts/work-themes.json", `${JSON.stringify(themes, null, 2)}\n`);
fs.writeFileSync(".tmp-qa/capture-report.json", `${JSON.stringify(report, null, 2)}\n`);
fs.rmSync(".next/dev/cache/images", { recursive: true, force: true });
fs.rmSync(".next/cache/images", { recursive: true, force: true });
console.log("wrote scripts/work-themes.json");
console.log("cleared the Next image cache so replaced captures are not served stale");
