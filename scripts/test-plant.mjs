// Sprawdzenie, czy pośrednik do rozpoznawania roślin działa.
//
// Po co osobny skrypt: jeśli coś nie zadziała w aplikacji, chcemy wiedzieć, czy
// wina jest po stronie Workera, klucza, czy interfejsu. Ten skrypt pomija
// aplikację i pyta Workera wprost.
//
// Uruchomienie:
//   npm run plant:test                          adres bierze z src/app/plant.ts
//   npm run plant:test -- https://...workers.dev  albo podany wprost
//   npm run plant:test -- https://...  public/photos/blonia.jpg   z innym zdjęciem

import { readFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)

const fromCode = () => {
  const src = readFileSync(resolve(root, 'src/app/plant.ts'), 'utf8')
  return src.match(/export const PLANT_PROXY = '([^']*)'/)?.[1] ?? ''
}

const url = args.find((a) => a.startsWith('http')) ?? fromCode()
const photo = args.find((a) => !a.startsWith('http')) ?? 'public/photos/dolina-kobylanska.jpg'

if (!url) {
  console.error('Nie ma adresu Workera. Wklej go do PLANT_PROXY w src/app/plant.ts')
  console.error('albo podaj tutaj: npm run plant:test -- https://parkove-plant.xxx.workers.dev')
  process.exit(1)
}

const bytes = readFileSync(resolve(root, photo))
const form = new FormData()
form.append('images', new Blob([bytes], { type: 'image/jpeg' }), basename(photo))
form.append('organs', 'auto')

console.log(`pytam ${url}`)
console.log(`zdjęciem ${photo} (${Math.round(bytes.length / 1024)} kB)`)

/*
 * Origin ustawiamy ręcznie, bo Worker przepuszcza tylko swoje adresy, a skrypt
 * w Node żadnego Origina sam nie wysyła. To ten sam adres, z którego strzela
 * aplikacja w trybie deweloperskim.
 */
const res = await fetch(url, {
  method: 'POST',
  headers: { Origin: 'http://localhost:5183' },
  body: form,
}).catch((e) => {
  console.error('nie udało się połączyć:', e.cause?.code ?? e.message)
  process.exit(1)
})

const text = await res.text()
console.log(`odpowiedź ${res.status}`)
try {
  const d = JSON.parse(text)
  if (d.error) console.log('błąd:', d.error)
  for (const g of d.results ?? [])
    console.log(` - ${Math.round(g.score * 100)}%  ${g.common || '(bez nazwy potocznej)'}  [${g.latin}]`)
  if (!d.results?.length && !d.error) console.log('bez rozpoznania:', d.note ?? '(pusto)')
  if (d.left != null) console.log(`zostało dziś: ${d.left} zapytań`)
} catch {
  console.log(text.slice(0, 400))
}
