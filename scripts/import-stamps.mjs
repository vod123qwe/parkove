// Imports single-file stamps: drop one PNG per park into assets-in/stamps/,
// named exactly like the park id (blonia.png, kopiec-krakusa.png, ...).
// Usage: npm run stamps:files            (whole folder)
//        npm run stamps:files blonia     (one park)
//
// Each file is trimmed, its background made transparent (flood fill from the
// edge, so the sticker's cream outline survives) and written square at 768 px.
//
// Output stays true-colour RGBA. Palette quantisation can turn fully transparent
// pixels into alpha 1-2, which leaves an invisible but technically rectangular
// bitmap. Exact alpha is more important here than the small extra file saving.

import sharp from 'sharp'
import { readdirSync, mkdirSync, existsSync, statSync, copyFileSync, unlinkSync } from 'node:fs'
import { resolve, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_SIZE = 768 // 2x what the largest on-map pin needs
const BG_TOLERANCE = 20

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const inDir = resolve(root, 'assets-in/stamps')
const outDir = resolve(root, 'public/stamps')
mkdirSync(inDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const only = process.argv[2]
const files = readdirSync(inDir)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .filter((f) => !only || basename(f, extname(f)) === only)

if (!files.length) {
  console.log(`nothing to import from ${inDir}`)
  console.log('name each file after the park id, e.g. kopiec-krakusa.png')
  process.exit(0)
}

/** make edge-connected light pixels transparent */
function cutout(buf, w, h) {
  const seen = new Uint8Array(w * h)
  const stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const k = y * w + x
    if (seen[k]) return
    const d = k * 4
    const light =
      buf[d] > 255 - BG_TOLERANCE && buf[d + 1] > 255 - BG_TOLERANCE && buf[d + 2] > 255 - BG_TOLERANCE
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
  return buf
}

/** refuse a stamp that would ship with a rectangular background */
async function verifyTransparency(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const alphaAt = (x, y) => data[(y * info.width + x) * 4 + 3]
  const corners = [
    alphaAt(0, 0),
    alphaAt(info.width - 1, 0),
    alphaAt(0, info.height - 1),
    alphaAt(info.width - 1, info.height - 1),
  ]
  let transparent = 0
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) transparent++
  }
  const ratio = transparent / (info.width * info.height)
  if (corners.some((alpha) => alpha !== 0) || ratio < 0.05) {
    throw new Error(
      `stamp has no clean transparent surround (corners: ${corners.join(', ')}, transparent: ${(ratio * 100).toFixed(1)}%)`,
    )
  }
  return ratio
}

for (const file of files) {
  const id = basename(file, extname(file))
  const src = resolve(inDir, file)
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const cut = cutout(Buffer.from(data), info.width, info.height)
  const out = resolve(outDir, `${id}.png`)
  const candidate = resolve(outDir, `.${id}.candidate.png`)
  const existed = existsSync(out)
  await sharp(cut, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer()
    .then((png) =>
      sharp(png)
        .trim({ threshold: 1 }) // drop the now-transparent margin
        .resize(OUT_SIZE, OUT_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9, effort: 10 })
        .toFile(candidate),
    )
  let alphaRatio
  try {
    alphaRatio = await verifyTransparency(candidate)
    copyFileSync(candidate, out)
  } finally {
    if (existsSync(candidate)) unlinkSync(candidate)
  }
  const kb = Math.round(statSync(out).size / 1024)
  console.log(
    `  ${existed ? 'updated' : 'added  '} ${id}.png  ${String(kb).padStart(4)} kB  ` +
      `(source ${info.width}x${info.height}, transparent ${(alphaRatio * 100).toFixed(1)}%)`,
  )
}
console.log(`done: ${files.length} stamps in public/stamps/`)
