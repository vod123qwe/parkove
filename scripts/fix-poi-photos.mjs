// Usuwa zdjęcia punktów, które przedstawiają coś innego niż punkt, i zamienia
// parę Jordana. Lista pochodzi z przeglądu WSZYSTKICH 85 zdjęć punktów na
// arkuszach stykowych (2026-08-22): dopasowanie po nazwie pliku nie potrafi
// wyłapać przypadku, w którym plik ma w tytule właściwy park, a przedstawia
// inne miejsce w tym parku.
//
// Uruchomienie: node scripts/fix-poi-photos.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** punkt -> co jest na zdjęciu (powód usunięcia) */
const WRONG = {
  'skalki-twardowskiego/sciany-wspinaczkowe': 'widok przez otwór jaskini, nie ściany',
  'planty/skrzynecki': 'zwykła alejka Plant, bez ławki Skrzyneckiego',
  'planty/collegium-novum': 'wnętrze korytarza, nie budynek od Plant',
  'planty/brama-rzeznicza': 'zwykły budynek, nie relikt bramy',
  'las-wolski/kopiec-pilsudskiego-poi': 'trawiaste zagłębienie, nie kopiec',
  'strzelecki/sobieski': 'ozdobny talerz z portretem, nie pomnik',
  'ogrod-botaniczny/poludnik': 'wnętrze lokalu z czerwoną linią, nie południk w ogrodzie',
  'mlynowka/kosciol-wojciecha': 'kościół świętego Wojciecha z Rynku Głównego, czyli inny',
  'kopiec-kosciuszki/kaplica-bronislawy': 'stary sztych kopca, nie kaplica',
  'planty-bienczyckie/gitara': 'zdjęcie muzyka na scenie, nie rzeźba gitary',
  'reduta/staw-reduta': 'stara pocztówka z jeziorem i zamkiem, nie ten staw',
  'aleksandry/smok-aleksandry': 'ten sam smok co w Parku Bednarskiego',
  'dolina-bolechowicka/taras': 'bloki mieszkalne, nie widok z góry bramy',
  'dolina-kluczwody/slupy-graniczne': 'plakat propagandowy, nie słupy',
  'dolina-szklarki/brodlo': 'ptak na gałęzi, nie największy ostaniec doliny',
  'dolina-bedkowska/zrodlo-bedkowki': 'tablica informacyjna, nie źródło',
  'decjusza/flamingi': 'żywe flamingi, prawdopodobnie z zoo',
  'szwedzki/stara-kaplica': 'współczesny budynek, nie stara kaplica',
  'stacja-wisla/stacja': 'biurowiec i chodnik, nie budynek stacji',
  'zielony-jar/kosciol-milosierdzia': 'zabytkowy kościół, a ten jest współczesny',
  'kopiec-wandy/wanda-matejko': 'metalowa rzeźba, nie kolumna Matejki',
  'bagry/kosciol-trojcy': 'detal wnętrza (krucyfiks), nie kościół',
}

/** para do zamiany: zdjęcie pomnika wisiało przy alei popiersi */
const SWAP = ['park-jordana/pomnik-jordana', 'park-jordana/popiersia']

const files = ['src/app/data/quests.ts', 'src/app/data/quests-dolinki.ts']

/** granice bloku jednego punktu w pliku */
function poiBlocks(src) {
  const out = []
  const re = /\n(\s+)id: '([^']+)',\n[\s\S]*?radius: \d+,\n\s+\},/g
  let m
  while ((m = re.exec(src))) {
    const park = [...src.slice(0, m.index).matchAll(/parkId: '([^']+)'/g)].pop()?.[1]
    out.push({ key: `${park}/${m[2]}`, start: m.index, end: m.index + m[0].length, text: m[0] })
  }
  return out
}

const photoOf = (text) => ({
  photo: (text.match(/\n\s+photo: '([^']+)',/) ?? [])[1],
  credit: (text.match(/\n\s+photoCredit: '([^']*)',/) ?? text.match(/\n\s+photoCredit: "([^"]*)",/) ?? [])[1],
})

let removed = 0
let swapped = 0
for (const file of files) {
  const path = resolve(root, file)
  let src = readFileSync(path, 'utf8')

  // 1) zamiana pary (tylko gdy oba punkty są w tym pliku)
  const blocks = poiBlocks(src)
  const a = blocks.find((b) => b.key === SWAP[0])
  const b = blocks.find((b) => b.key === SWAP[1])
  if (a && b) {
    const pa = photoOf(a.text)
    const pb = photoOf(b.text)
    if (pa.photo && pb.photo) {
      const setPhoto = (text, photo, credit) =>
        text
          .replace(/\n(\s+)photo: '[^']+',/, `\n$1photo: '${photo}',`)
          .replace(/\n(\s+)photoCredit: ('[^']*'|"[^"]*"),/, `\n$1photoCredit: ${JSON.stringify(credit ?? '')},`)
      const newA = setPhoto(a.text, pb.photo, pb.credit)
      const newB = setPhoto(b.text, pa.photo, pa.credit)
      // podmieniamy od końca, żeby indeksy się nie przesunęły
      const [first, second] = a.start < b.start ? [a, b] : [b, a]
      const [firstNew, secondNew] = a.start < b.start ? [newA, newB] : [newB, newA]
      src = src.slice(0, second.start) + secondNew + src.slice(second.end)
      src = src.slice(0, first.start) + firstNew + src.slice(first.end)
      swapped = 1
      console.log(`zamienione: ${SWAP[0]} <-> ${SWAP[1]}`)
    }
  }

  // 2) usuwanie błędnych
  for (const [key, why] of Object.entries(WRONG)) {
    const block = poiBlocks(src).find((b) => b.key === key)
    if (!block) continue
    if (!/\n\s+photo: '/.test(block.text)) continue
    const cleaned = block.text
      .replace(/\n\s+photo: '[^']+',/, '')
      .replace(/\n\s+photoCredit: ('[^']*'|"[^"]*"),/, '')
    src = src.slice(0, block.start) + cleaned + src.slice(block.end)
    removed++
    console.log(`usunięte: ${key.padEnd(44)} ${why}`)
  }
  writeFileSync(path, src)
}
console.log(`\nusuniętych zdjęć: ${removed}, zamian: ${swapped}`)
