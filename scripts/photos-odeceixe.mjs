// Zdjecia wyprawy Odeceixe z Wikimedia Commons.
//
// Inaczej niz fetch-photos.mjs, ktory bierze pierwszy trafiony wynik: tutaj
// najpierw OGLADAMY kandydatow, potem pobieramy wybrane. Przy wyprawie, ktora
// ma byc opakowana ladnymi wizualiami, pierwszy wynik wyszukiwarki to za malo.
//
//   node scripts/photos-odeceixe.mjs --search    lista kandydatow z metadanymi
//   node scripts/photos-odeceixe.mjs             pobiera pliki z PICKS
//
// Licencje: skrypt wypisuje autora i licencje kazdego pliku, a podpisy trafiaja
// do danych (photoCredit). Bez tego nie wolno tego uzyc.

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const UA = { 'User-Agent': 'Parkove/0.4 (personal Krakow parks project)' }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/photos')
mkdirSync(outDir, { recursive: true })

const QUERIES = [
  'Odeceixe',
  'Praia de Odeceixe',
  'Moinho de Odeceixe',
  'Igreja Matriz de Odeceixe',
  'Ribeira de Seixe',
  'Praia das Adegas Odeceixe',
]

/** wybrane recznie po obejrzeniu: [id pliku w apce, dokladny tytul z Commons] */
const PICKS = [
  ['igreja', 'File:Odeceixe 155.jpg'],
  ['praia-b', 'File:Praia de Odeceixe Mar 11 November 2013 (2).JPG'],
  ['adegas', 'File:Praia das Adegas - Odeceixe - Portugal (5993756384).jpg'],
]

const strip = (html) => (html ?? '').replace(/<[^>]*>/g, '').trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function commons(params) {
  const api = new URL('https://commons.wikimedia.org/w/api.php')
  api.search = new URLSearchParams({ format: 'json', ...params }).toString()
  const res = await fetch(api, { headers: UA })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

if (process.argv.includes('--search')) {
  for (const query of QUERIES) {
    await sleep(2500) // Commons dlawi serie zapytan
    console.log(`\n=== ${query}`)
    try {
      const data = await commons({
        action: 'query',
        generator: 'search',
        gsrsearch: `filetype:bitmap ${query}`,
        gsrnamespace: '6',
        gsrlimit: '8',
        prop: 'imageinfo',
        iiprop: 'url|size|extmetadata',
        iiurlwidth: '1280',
      })
      const pages = Object.values(data.query?.pages ?? {})
      if (!pages.length) {
        console.log('  brak wynikow')
        continue
      }
      for (const page of pages) {
        const info = page.imageinfo?.[0]
        if (!info) continue
        const meta = info.extmetadata ?? {}
        console.log(
          `  ${page.title}\n     ${info.width}x${info.height}  ${strip(meta.LicenseShortName?.value) || '?'}  aut. ${strip(meta.Artist?.value).slice(0, 60) || '?'}\n     ${info.thumburl}`,
        )
      }
    } catch (e) {
      console.log('  blad:', e.message)
    }
  }
  process.exit(0)
}

if (!PICKS.length) {
  console.log('PICKS jest puste: najpierw uruchom z --search i wybierz pliki')
  process.exit(1)
}

const report = []
for (const [id, title] of PICKS) {
  await sleep(5000)
  const data = await commons({
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '1400',
  })
  const page = Object.values(data.query?.pages ?? {})[0]
  const info = page?.imageinfo?.[0]
  if (!info) {
    console.log(`${id}: NIE ZNALEZIONO ${title}`)
    continue
  }
  const meta = info.extmetadata ?? {}
  const author = strip(meta.Artist?.value) || 'nieznany autor'
  const licence = strip(meta.LicenseShortName?.value) || 'zob. Commons'
  const bin = await fetch(info.thumburl, { headers: UA })
  const buf = Buffer.from(await bin.arrayBuffer())
  /* 429 z Commons wraca jako mala strona HTML, nie jako obrazek */
  if (buf.length < 22000) {
    console.log(`${id}: podejrzanie maly plik (${buf.length} B), pomijam`)
    continue
  }
  const file = `odeceixe-${id}.jpg`
  writeFileSync(resolve(outDir, file), buf)
  const credit = `Fot. ${author} · ${licence} · Wikimedia Commons`
  report.push({ id, file, credit, title })
  console.log(`${id}: ${file}  ${Math.round(buf.length / 1024)} kB  ${credit}`)
}
writeFileSync(resolve(root, '.tmp-odeceixe-photos.json'), JSON.stringify(report, null, 2))
console.log(`\ngotowe: ${report.length} zdjec, opisy w .tmp-odeceixe-photos.json`)
