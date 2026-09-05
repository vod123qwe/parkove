// Zdjecia trzech miejsc dodanych 2026-09-05: Kamieniolom Libana, rezerwat
// Bonarka i Dolina Mnikowska.
//
// Ta sama metoda co przy Odeceixe (najpierw obejrzyj kandydatow, potem pobierz
// wybrane), z jedna roznica: oprocz szukania po nazwie pytamy tez GEOSEARCH,
// czyli po wspolrzednych. Przy Miechowie to wlasnie geosearch znalazl zdjecia,
// ktorych szukanie po nazwie nie widzialo.
//
//   node scripts/photos-nowe.mjs --search    lista kandydatow z metadanymi
//   node scripts/photos-nowe.mjs             pobiera pliki z PICKS
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

/** szukanie po nazwie */
const QUERIES = [
  'Skała Kmity Zabierzów',
  'Rezerwat Zimny Dół Czułów',
  'Kajasówka rezerwat',
  'Rezerwat Skołczanka Tyniec',
  'Kamionna Beskid Wyspowy wieża',
  'Kamionna Trzciana kościół',
]

/** szukanie po wspolrzednych: [etykieta, lat, lng, promien w metrach] */
const GEO = [
  ['kmity', 50.09873, 19.81492, 500],
  ['zimny-dol', 50.06699, 19.67537, 400],
  ['kajasowka', 50.03047, 19.66643, 900],
  ['skolczanka', 50.01378, 19.8296, 700],
  ['kamionna-szczyt', 49.77867, 20.39628, 900],
  ['kamionna-wies', 49.7994, 20.37521, 900],
]

/** wybrane recznie po obejrzeniu: [nazwa pliku w apce, dokladny tytul z Commons] */
const PICKS_DONE = [
  ['liban-a', 'File:20200808 Kamieniołom Liban rano z Kopca Krakusa 0544 0788.jpg'],
  ['liban-b', "File:Liban's Quarry, former WWII German Nazi Labour Camp, Za Torem street, Krakow, Poland.jpg"],
  ['liban-c', 'File:Kraków Kamieniołom Libana 19.jpg'],
  ['poi-liban-macewy', "File:Schindler's List scenography - matzev.JPG"],
  ['poi-liban-natura', 'File:Liban quarry - flora 2015.JPG'],
  ['bonarka-a', 'File:Rezerwat przyrody Bonarka DK47 (3).jpg'],
  ['bonarka-b', 'File:Nature reserve Bonarka.jpg'],
  ['bonarka-c', 'File:Rezerwat Bonarka tablica.jpg'],
  ['poi-bonarka-cement', 'File:Kamieniołom Bonarka DK47 (7).jpg'],
  ['mnikowska-a', 'File:Dolina Mnikowska, 20211023 1025 3336.jpg'],
  ['mnikowska-b', 'File:20200612 Dolina Mnikowska 1503 0300.jpg'],
  ['mnikowska-c', 'File:Dolina Mnikowska DK7.jpg'],
  ['poi-mnikowska-matka-boska', 'File:W malowniczej Dolinie Mnikowskiej - panoramio.jpg'],
]

const PICKS = [
  ['kmity-a', 'File:Skała Kmity - panoramio.jpg'],
  ['kmity-b', 'File:Skała Kmity - panoramio (1).jpg'],
  ['kmity-c', 'File:Skała Kmity - panoramio (2).jpg'],
  ['zimny-dol-a', 'File:Rezerwat przyrody ZimnyDół DK37 (2).jpg'],
  ['zimny-dol-b', 'File:Rezerwat przyrody ZimnyDół DK37 (4).jpg'],
  ['zimny-dol-c', 'File:Rezerwat Zimny Dół a2.jpg'],
  ['kajasowka-a', 'File:Rezerwat przyrody Kajasówka pod Krakowem, 20240317 0755 6729.jpg'],
  ['kajasowka-b', 'File:Widok na Tatry ze wzgórza Kajasówka pod Krakowem, 20211204 0828 3913.jpg'],
  ['kajasowka-c', 'File:Rezerwat przyrody Kajasówka, 20210117 1036 5372.jpg'],
  ['poi-kajasowka-jaskinia', 'File:20200427 Wejście do Jaskini Przegińskiej 1451 9874 DxO.jpg'],
  ['skolczanka-a', 'File:Rezerwat Skołczanka.JPG'],
  ['skolczanka-b', 'File:Nature reserve Skołczanka 3.jpg'],
  ['skolczanka-c', 'File:Nature reserve Skołczanka 10.jpg'],
  ['kamionna-a', 'File:Kamionna i Pasierbiecka Góra.jpg'],
  ['kamionna-b', 'File:Kamionna z Rozdziela.jpg'],
  ['kamionna-c', 'File:Kamionna G44.jpg'],
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

function show(data) {
  const pages = Object.values(data.query?.pages ?? {})
  if (!pages.length) {
    console.log('  brak wynikow')
    return
  }
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    if (!info) continue
    const meta = info.extmetadata ?? {}
    console.log(
      `  ${page.title}\n     ${info.width}x${info.height}  ${strip(meta.LicenseShortName?.value) || '?'}  aut. ${strip(meta.Artist?.value).slice(0, 60) || '?'}`,
    )
  }
}

if (process.argv.includes('--search')) {
  for (const query of QUERIES) {
    await sleep(2500) // Commons dlawi serie zapytan
    console.log(`\n=== nazwa: ${query}`)
    try {
      show(
        await commons({
          action: 'query',
          generator: 'search',
          gsrsearch: `filetype:bitmap ${query}`,
          gsrnamespace: '6',
          gsrlimit: '8',
          prop: 'imageinfo',
          iiprop: 'url|size|extmetadata',
          iiurlwidth: '1280',
        }),
      )
    } catch (e) {
      console.log('  blad:', e.message)
    }
  }
  for (const [label, lat, lng, radius] of GEO) {
    await sleep(2500)
    console.log(`\n=== geo: ${label} (${radius} m)`)
    try {
      show(
        await commons({
          action: 'query',
          generator: 'geosearch',
          ggscoord: `${lat}|${lng}`,
          ggsradius: String(radius),
          ggslimit: '20',
          ggsnamespace: '6',
          prop: 'imageinfo',
          iiprop: 'url|size|extmetadata',
          iiurlwidth: '1280',
        }),
      )
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
for (const [file, title] of PICKS) {
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
    console.log(`${file}: NIE ZNALEZIONO ${title}`)
    continue
  }
  const meta = info.extmetadata ?? {}
  const author = strip(meta.Artist?.value) || 'nieznany autor'
  const licence = strip(meta.LicenseShortName?.value) || 'zob. Commons'
  const bin = await fetch(info.thumburl, { headers: UA })
  const buf = Buffer.from(await bin.arrayBuffer())
  /* 429 z Commons wraca jako mala strona HTML, nie jako obrazek */
  if (buf.length < 22000) {
    console.log(`${file}: podejrzanie maly plik (${buf.length} B), pomijam`)
    continue
  }
  const name = `${file}.jpg`
  writeFileSync(resolve(outDir, name), buf)
  const credit = `Fot. ${author} · ${licence} · Wikimedia Commons`
  report.push({ file: name, credit, title })
  console.log(`${name}  ${Math.round(buf.length / 1024)} kB  ${credit}`)
}
writeFileSync(resolve(root, '.tmp-nowe-photos.json'), JSON.stringify(report, null, 2))
console.log(`\ngotowe: ${report.length} zdjec, opisy w .tmp-nowe-photos.json`)
