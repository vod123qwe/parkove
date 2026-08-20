// Shrinks photos in public/photos to what the app actually shows: the hero is
// at most a phone width, the carousel thumbs are far smaller. Run after adding
// new photos: npm run photos:optimize

import sharp from 'sharp'
import { readdirSync, statSync, renameSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/photos')
const MAX_W = 1280
const QUALITY = 78

let before = 0
let after = 0
for (const file of readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f))) {
  const path = resolve(dir, file)
  const size = statSync(path).size
  before += size
  const meta = await sharp(path).metadata()
  if ((meta.width ?? 0) <= MAX_W && size < 260000) { after += size; continue }
  const tmp = path + '.tmp'
  await sharp(path)
    .resize({ width: Math.min(MAX_W, meta.width ?? MAX_W), withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tmp)
  const newSize = statSync(tmp).size
  if (newSize < size) {
    unlinkSync(path)
    renameSync(tmp, path)
    after += newSize
    console.log(`  ${file}: ${(size / 1024).toFixed(0)} -> ${(newSize / 1024).toFixed(0)} kB`)
  } else {
    unlinkSync(tmp)
    after += size
  }
}
console.log(`\nrazem: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`)
