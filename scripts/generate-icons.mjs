// Generates PWA icons from an inline SVG using sharp.
// Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "icons");
mkdirSync(outDir, { recursive: true });

function svg({ size = 512, bg = true, radius = 96 } = {}) {
  const pad = 0;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2f6fd0"/>
      <stop offset="100%" stop-color="#1f5bbf"/>
    </linearGradient>
  </defs>
  ${bg ? `<rect x="${pad}" y="${pad}" width="${512 - pad * 2}" height="${512 - pad * 2}" rx="${radius}" fill="url(#g)"/>` : ""}
  <!-- heart -->
  <path d="M256 380c-10 0-19-4-26-11-48-46-114-84-114-158 0-50 38-88 86-88 26 0 49 12 64 32 15-20 38-32 64-32 48 0 86 38 86 88 0 74-66 112-114 158-7 7-16 11-26 11z"
        fill="#ffffff" opacity="0.98"/>
  <!-- pulse line -->
  <path d="M150 258 h44 l22 -44 l34 92 l24 -60 l16 24 h72"
        fill="none" stroke="#2f6fd0" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, bg: true, radius: 40 },
  { name: "icon-512.png", size: 512, bg: true, radius: 96 },
  { name: "maskable-512.png", size: 512, bg: true, radius: 0 },
  { name: "apple-touch-icon.png", size: 180, bg: true, radius: 0 },
];

for (const t of targets) {
  const buf = Buffer.from(svg({ size: 512, bg: t.bg, radius: t.radius }));
  await sharp(buf).resize(t.size, t.size).png().toFile(join(outDir, t.name));
  console.log("wrote", t.name);
}

// Favicon (32) into public/
await sharp(Buffer.from(svg({ size: 512, bg: true, radius: 96 })))
  .resize(32, 32)
  .png()
  .toFile(join(process.cwd(), "public", "favicon.png"));
console.log("done");
