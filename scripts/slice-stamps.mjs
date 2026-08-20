// Slices a sticker sheet into one transparent PNG per park.
// Usage: node scripts/slice-stamps.mjs assets-in/stamps-01.png [startIndex]
//
// Expects stickers on a plain light background, laid out in rows (a shorter
// last row may be centered). Rows and columns are found from pixel projections,
// then background connected to the frame edge is made transparent, so the
// sticker's own cream outline survives.

import sharp from 'sharp'
import { mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// order must match docs/content/parks-list.md
const IDS = [
  'blonia',
  'kopiec-kosciuszki',
  'kopiec-krakusa',
  'kopiec-pilsudskiego',
  'kopiec-wandy',
  'las-wolski',
  'lasek-mogilski',
  'laki-nowohuckie',
  'mlynowka',
  'ogrod-botaniczny',
  'skawina-blonia',
  'panienskie-skaly',
  'aleksandry',
  'bednarskiego',
  'decjusza',
  'duchacki',
  'grzegorzecki',
  'jalu-kurka',
  'jerzmanowskich',
  'park-jordana',
  'krakowski',
  'krowoderski',
  'kurdwanow',
  'witkowice',
  'lilli-wenedy',
  'lotnikow',
  'macka-i-doroty',
  'skawina-pilsudskiego',
  'ratuszowy',
  'reduta',
  'rzaka',
  'solvay',
  'stacja-wisla',
  'strzelecki',
  'szwedzki',
  'tysiaclecia',
  'szymborskiej',
  'wisniowy-sad',
  'wyspianskiego',
  'zaczarowanej-dorozki',
  'zakrzowek',
  'zielony-jar',
  'zeromskiego',
  'planty',
  'planty-bienczyckie',
  'przylasek-rusiecki',
  'skalki-twardowskiego',
  'bagry',
]

const OUT_SIZE = 512
const BG_TOLERANCE = 18 // how far from pure white still counts as background
const MIN_BLOB = 24 // ignore projection noise thinner than this

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const input = process.argv[2]
const startIndex = Number(process.argv[3] ?? 0)
if (!input) {
  console.error('usage: node scripts/slice-stamps.mjs <sheet.png> [startIndex]')
  process.exit(1)
}
const inPath = resolve(root, input)
if (!existsSync(inPath)) {
  console.error(`not found: ${inPath}`)
  process.exit(1)
}

const outDir = resolve(root, 'public/stamps')
mkdirSync(outDir, { recursive: true })

const img = sharp(inPath).ensureAlpha()
const { width, height } = await img.metadata()
const raw = await img.raw().toBuffer()
const at = (x, y) => (y * width + x) * 4

const isBg = (x, y) => {
  const i = at(x, y)
  if (raw[i + 3] < 12) return true // already transparent
  return raw[i] > 255 - BG_TOLERANCE && raw[i + 1] > 255 - BG_TOLERANCE && raw[i + 2] > 255 - BG_TOLERANCE
}

/** ranges of consecutive indexes that contain content */
const bands = (length, hasContent) => {
  const out = []
  let start = -1
  for (let i = 0; i < length; i++) {
    if (hasContent(i)) {
      if (start < 0) start = i
    } else if (start >= 0) {
      if (i - start >= MIN_BLOB) out.push([start, i - 1])
      start = -1
    }
  }
  if (start >= 0 && length - start >= MIN_BLOB) out.push([start, length - 1])
  return out
}

const rowHasContent = (y) => {
  for (let x = 0; x < width; x++) if (!isBg(x, y)) return true
  return false
}
const rows = bands(height, rowHasContent)
console.log(`sheet ${width}x${height}, rows: ${rows.length}`)

const cells = []
for (const [y0, y1] of rows) {
  const colHasContent = (x) => {
    for (let y = y0; y <= y1; y++) if (!isBg(x, y)) return true
    return false
  }
  const cols = bands(width, colHasContent)
  for (const [x0, x1] of cols) cells.push({ x0, y0, x1, y1 })
}
console.log(`found ${cells.length} stickers`)

/** transparent background: flood fill light pixels from the cell border */
function cutout(cell) {
  const w = cell.x1 - cell.x0 + 1
  const h = cell.y1 - cell.y0 + 1
  const buf = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = at(cell.x0 + x, cell.y0 + y)
      const d = (y * w + x) * 4
      buf[d] = raw[s]
      buf[d + 1] = raw[s + 1]
      buf[d + 2] = raw[s + 2]
      buf[d + 3] = raw[s + 3]
    }
  }
  const seen = new Uint8Array(w * h)
  const stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const k = y * w + x
    if (seen[k]) return
    const d = k * 4
    const light = buf[d] > 255 - BG_TOLERANCE && buf[d + 1] > 255 - BG_TOLERANCE && buf[d + 2] > 255 - BG_TOLERANCE
    if (!light && buf[d + 3] > 12) return
    seen[k] = 1
    buf[d + 3] = 0
    stack.push(k)
  }
  for (let x = 0; x < w; x++) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    push(0, y)
    push(w - 1, y)
  }
  while (stack.length) {
    const k = stack.pop()
    const x = k % w
    const y = (k - x) / w
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }
  return { buf, w, h }
}

let i = 0
for (const cell of cells) {
  const id = IDS[startIndex + i]
  if (!id) {
    console.log(`no id for sticker #${startIndex + i + 1}, stopping`)
    break
  }
  const { buf, w, h } = cutout(cell)
  await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .resize(OUT_SIZE, OUT_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(resolve(outDir, `${id}.png`))
  console.log(`  ${id}.png  (from ${w}x${h})`)
  i++
}
console.log(`done: ${i} stamps in public/stamps/`)
