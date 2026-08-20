// App icons for the installed PWA. One SVG mark, rendered to the sizes
// Android and iOS ask for. Run: npm run icons
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const GREEN = '#4c6540'
const CREAM = '#f6f8f5'

/** the mark: a small grove on a hill, in the flat style of the app icons */
function svg({ size, bleed }) {
  // bleed = maskable: keep the mark inside the safe circle (80% of the canvas)
  const s = size
  const k = (bleed ? 0.62 : 0.8) * s / 100 // one unit of the 100x100 mark grid
  const cx = s / 2
  const cy = s / 2
  const X = (v) => (cx + v * k).toFixed(1)
  const Y = (v) => (cy + v * k).toFixed(1)
  const L = (v) => (v * k).toFixed(1)
  const GROUND = 27
  const tree = (x, top, radius, trunk) => `
    <circle cx="${X(x)}" cy="${Y(top + radius)}" r="${L(radius)}"/>
    <rect x="${X(x - trunk / 2)}" y="${Y(top + radius)}" width="${L(trunk)}" height="${L(GROUND - top - radius + 1)}" rx="${L(trunk / 2)}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${bleed ? 0 : (s * 0.22).toFixed(1)}" fill="${GREEN}"/>
  <g fill="${CREAM}">${tree(14, -49, 25, 9)}${tree(-26, -24, 16, 7)}
    <rect x="${X(-42)}" y="${Y(GROUND)}" width="${L(84)}" height="${L(7)}" rx="${L(3.5)}" opacity="0.5"/>
  </g>
</svg>`
}

const out = 'public'
await mkdir(out, { recursive: true })
const jobs = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, false],
  ['favicon.png', 64, false],
]
for (const [name, size, bleed] of jobs) {
  await sharp(Buffer.from(svg({ size, bleed }))).png().toFile(`${out}/${name}`)
  console.log('  ' + name)
}
console.log('icons done')
