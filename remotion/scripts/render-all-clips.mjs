import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUT_DIR = "/mnt/documents";
fs.mkdirSync(OUT_DIR, { recursive: true });

const CLIP_IDS = [
  "01-intro",
  "02-login",
  "03-intake",
  "04-triage",
  "05-case-result",
  "06-dashboard",
  "07-architecture",
  "08-closing",
];

// Render only a subset if `node render-all-clips.mjs 01-intro 02-login`
const requested = process.argv.slice(2);
const ids = requested.length ? requested : CLIP_IDS;

console.log("[render] Bundling…");
const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

console.log("[render] Launching browser…");
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

try {
  for (const id of ids) {
    const out = path.join(OUT_DIR, `clinic-copilot-${id}.mp4`);
    console.log(`[render] ${id} → ${out}`);
    const composition = await selectComposition({
      serveUrl: bundled,
      id,
      puppeteerInstance: browser,
    });
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: out,
      puppeteerInstance: browser,
      muted: true,
      concurrency: 2,
    });
    const stat = fs.statSync(out);
    console.log(`[render] ✓ ${id}  ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  }
} finally {
  await browser.close({ silent: false });
}

console.log("[render] Done.");
