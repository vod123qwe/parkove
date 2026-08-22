// Sprawdzenie, co dokładnie nie działa w pośredniku.
//
// Zamiast zgadywać, pytamy Workera po kolei i mówimy, który element jest gotowy,
// a który nie: adres w kodzie, Worker w sieci, klucz Pl@ntNet, klucz Gemini.
//
// Uruchomienie:
//   npm run proxy:check
//   npm run proxy:check -- https://parkove-plant.twoj-login.workers.dev

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = process.argv.slice(2).find((a) => a.startsWith('http'))

const fromCode = () => {
  const src = readFileSync(resolve(root, 'src/app/proxy.ts'), 'utf8')
  return src.match(/export const PROXY: string = '([^']*)'/)?.[1] ?? ''
}

const inCode = fromCode()
const base = (arg || inCode).replace(/\/$/, '')

const ok = (s) => `  OK    ${s}`
const no = (s) => `  BRAK  ${s}`
const hm = (s) => `  ?     ${s}`

console.log('\nPOSREDNIK PARKOVE\n')

console.log(inCode ? ok(`adres w src/app/proxy.ts: ${inCode}`) : no('adres w src/app/proxy.ts jest pusty'))
if (!inCode && !arg) {
  console.log('\nBez adresu nie ma czego sprawdzac. Kolejnosc jest taka:')
  console.log('  1. npm run plant:login     laczy terminal z kontem Cloudflare')
  console.log('  2. npm run plant:deploy    wypuszcza Workera i wypisuje adres')
  console.log('  3. npm run plant:key       klucz Pl@ntNet (rosliny)')
  console.log('  4. npm run ask:key         klucz Gemini (pytania o punkt)')
  console.log('  5. adres z kroku 2 wklej do PROXY w src/app/proxy.ts')
  process.exit(0)
}
if (!base) process.exit(0)

/** jedno zapytanie i tyle informacji, ile z niego wyciagniemy */
async function probe(path, init) {
  try {
    const res = await fetch(`${base}/${path}`, {
      ...init,
      headers: { Origin: 'http://localhost:5183', ...(init.headers ?? {}) },
    })
    const text = await res.text()
    let body = null
    try {
      body = JSON.parse(text)
    } catch {
      /* nie JSON: pokazemy surowo */
    }
    return { status: res.status, body, text }
  } catch (e) {
    return { error: e.cause?.code ?? e.message }
  }
}

/* 1. czy Worker w ogole odpowiada: pytamy /plant BEZ zdjecia */
const plant = await probe('plant', { method: 'POST', body: new FormData() })
if (plant.error) {
  console.log(no(`Worker nie odpowiada (${plant.error})`))
  console.log('\n  Adres jest zly albo deploy nie przeszedl. Sprawdz: npm run plant:deploy')
  process.exit(0)
}
console.log(ok(`Worker odpowiada (HTTP ${plant.status})`))

const plantMsg = plant.body?.error ?? plant.body?.note ?? plant.text.slice(0, 90)
if (plant.status === 400) console.log(ok('klucz Pl@ntNet jest w Workerze (odmowa dotyczy braku zdjecia)'))
else if (/Brak klucza Pl@ntNet/i.test(plantMsg)) console.log(no('klucz Pl@ntNet: uruchom npm run plant:key'))
else if (plant.status === 404) console.log(no('sciezka /plant nie istnieje: wypusc Workera od nowa (npm run plant:deploy)'))
else console.log(hm(`Pl@ntNet: HTTP ${plant.status}, ${plantMsg}`))

/* 2. pytanie o punkt: krotkie i tanie, zeby nie palic limitu */
const ask = await probe('ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ q: 'Odpowiedz jednym slowem: dziala?', place: 'test', point: 'test', story: '' }),
})
if (ask.error) console.log(no(`/ask nie odpowiada (${ask.error})`))
else {
  const askMsg = ask.body?.error ?? ask.body?.text ?? ask.text.slice(0, 120)
  if (ask.body?.text) console.log(ok(`Gemini odpowiada: "${String(ask.body.text).slice(0, 60)}"`))
  else if (/Brak klucza Gemini/i.test(askMsg)) console.log(no('klucz Gemini: uruchom npm run ask:key'))
  else if (ask.status === 404) console.log(no('sciezka /ask nie istnieje: wypusc Workera od nowa'))
  else console.log(hm(`Gemini: HTTP ${ask.status}, ${askMsg}`))
}

console.log('\nGdy cos jest BRAK, komenda stoi obok. Log Workera na zywo: npm run plant:log\n')
