// Fetches CC photos for quest POIs from Wikimedia Commons into public/photos/.
// Best effort: takes the top search hit per query; the report lists file titles,
// authors and licenses so a human can validate the picks and prune misses.
// Run: node scripts/fetch-photos.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const QUERIES = [
  ['skalki-sciany', 'Skałki Twardowskiego Kraków'],
  ['jordana-pomnik', 'Park Jordana Kraków'],
  ['jordana-wojtek', 'Wojtek bear monument Kraków'],
  ['skawina-park', 'Skawina park miejski'],
  ['skawina-sokol', 'Skawina budynek Sokoła'],
]

const UA = { 'User-Agent': 'Parkove/0.4 (personal Krakow parks project)' }
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/photos')
mkdirSync(outDir, { recursive: true })

const strip = (html) => (html ?? '').replace(/<[^>]*>/g, '').trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

for (const [id, query] of QUERIES) {
  await sleep(2500) // Commons rate-limits bursts: pace the queries
  const api = new URL('https://commons.wikimedia.org/w/api.php')
  api.search = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: '1',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '900',
    format: 'json',
  }).toString()
  try {
    const res = await fetch(api, { headers: UA })
    const data = await res.json()
    const page = Object.values(data.query?.pages ?? {})[0]
    const info = page?.imageinfo?.[0]
    if (!info) {
      console.log(`MISS  ${id} (${query})`)
      continue
    }
    const meta = info.extmetadata ?? {}
    const author = strip(meta.Artist?.value) || 'unknown'
    const license = meta.LicenseShortName?.value ?? '?'
    // a suspiciously tiny response means the thumbnailer failed: take the original
    let img = await fetch(info.thumburl ?? info.url, { headers: UA })
    let buf = Buffer.from(await img.arrayBuffer())
    if (buf.length < 8000 && info.url && info.url !== info.thumburl) {
      img = await fetch(info.url, { headers: UA })
      const full = Buffer.from(await img.arrayBuffer())
      if (full.length > buf.length) buf = full
    }
    if (buf.length < 8000) {
      console.log(`THIN  ${id} (${(buf.length / 1024).toFixed(0)} KB, skipped)`)
      continue
    }
    writeFileSync(resolve(outDir, `${id}.jpg`), buf)
    console.log(
      `OK    ${id}  <- ${page.title}  |  ${author.slice(0, 40)}  |  ${license}  |  ${(buf.length / 1024).toFixed(0)} KB`,
    )
  } catch (e) {
    console.log(`FAIL  ${id}: ${e.message}`)
  }
}
