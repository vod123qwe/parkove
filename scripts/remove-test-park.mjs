// Usuwa poligon testowy razem z jego trescia. Uruchom, gdy test w terenie sie
// skonczyl:
//
//   npm run test-park:remove              usuwa KAZDY poligon testowy
//   npm run test-park:remove -- test-x    usuwa wskazany
//
// Id bylo tu kiedys wpisane na sztywno jako 'test-ruczaj', a poligon dawno
// nazywal sie 'test-piltza': skrypt konczyl sie wtedy komunikatem o sukcesie
// i liczba "59 -> 59", czyli nie robil nic. Teraz bierze wszystkie miejsca
// z prefiksem test- (albo z properties.test) i mowi, ktore usunal. Czysci
// takze trasy, o ktorych stara wersja w ogole nie wiedziala.

import { readFileSync, writeFileSync } from 'node:fs'

const parksPath = 'src/app/data/parks.json'
const parks = JSON.parse(readFileSync(parksPath, 'utf8'))

const wanted = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const IDS = wanted.length
  ? wanted
  : parks.features.filter((f) => f.id.startsWith('test-') || f.properties?.test).map((f) => f.id)

if (!IDS.length) {
  console.log('nie ma czego usuwac: zaden poligon testowy nie siedzi w danych')
  process.exit(0)
}

const before = parks.features.length
parks.features = parks.features.filter((f) => !IDS.includes(f.id))
/* z wcieciem, jak reszta skryptow: minifikacja robila z kazdej zmiany
   diff na 11 tysiecy linii */
writeFileSync(parksPath, JSON.stringify(parks, null, 2) + String.fromCharCode(10))

/** wycina blok zaczynajacy sie w linii z `at`, liczac nawiasy `open`/`close` */
function cutBlock(text, at, open, close) {
  let depth = 0
  let end = -1
  for (let i = text.indexOf(open, at); i < text.length; i++) {
    if (text[i] === open) depth++
    else if (text[i] === close) {
      depth--
      if (depth === 0) {
        end = i + 1
        break
      }
    }
  }
  if (end < 0) return null
  const lineStart = text.lastIndexOf('\n', at) + 1
  return text.slice(0, lineStart) + text.slice(end).replace(/^,\s*\n/, '\n')
}

for (const ID of IDS) {
  const questsPath = 'src/app/data/quests.ts'
  const quests = readFileSync(questsPath, 'utf8')
  const at = quests.indexOf(`parkId: '${ID}'`)
  if (at >= 0) {
    const start = quests.lastIndexOf('  {', at)
    const next = cutBlock(quests, start, '{', '}')
    if (next) writeFileSync(questsPath, next)
  }

  for (const [path, key, open, close] of [
    ['src/app/data/parkinfo.ts', `'${ID}': {`, '{', '}'],
    ['src/app/data/trails.ts', `'${ID}': [`, '[', ']'],
  ]) {
    const text = readFileSync(path, 'utf8')
    const iAt = text.indexOf(key)
    if (iAt < 0) continue
    const next = cutBlock(text, iAt, open, close)
    if (next) writeFileSync(path, next)
  }
}

console.log(`usuniete: ${IDS.join(', ')} (miejsc: ${before} -> ${parks.features.length})`)
