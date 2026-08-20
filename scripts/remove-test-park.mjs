// Removes the Ruczaj test polygon and its quest. Run when the field test is done:
// node scripts/remove-test-park.mjs

import { readFileSync, writeFileSync } from 'node:fs'

const ID = 'test-ruczaj'

const parksPath = 'src/app/data/parks.json'
const parks = JSON.parse(readFileSync(parksPath, 'utf8'))
const before = parks.features.length
parks.features = parks.features.filter((f) => f.id !== ID)
writeFileSync(parksPath, JSON.stringify(parks))

const questsPath = 'src/app/data/quests.ts'
let quests = readFileSync(questsPath, 'utf8')
const at = quests.indexOf(`parkId: '${ID}'`)
if (at >= 0) {
  const start = quests.lastIndexOf('  {', at)
  // walk braces from the quest object to find its end
  let depth = 0
  let end = -1
  for (let i = start; i < quests.length; i++) {
    if (quests[i] === '{') depth++
    else if (quests[i] === '}') { depth--; if (depth === 0) { end = i + 1; break } }
  }
  const tail = quests.slice(end).replace(/^,\s*\n/, '\n')
  quests = quests.slice(0, start) + tail
  writeFileSync(questsPath, quests)
}

const infoPath = 'src/app/data/parkinfo.ts'
let info = readFileSync(infoPath, 'utf8')
const iAt = info.indexOf(`'${ID}': {`)
if (iAt >= 0) {
  let depth = 0
  let end = -1
  for (let i = info.indexOf('{', iAt); i < info.length; i++) {
    if (info[i] === '{') depth++
    else if (info[i] === '}') { depth--; if (depth === 0) { end = i + 1; break } }
  }
  const lineStart = info.lastIndexOf('\n', iAt) + 1
  const tail = info.slice(end).replace(/^,\s*\n/, '\n')
  info = info.slice(0, lineStart) + tail
  writeFileSync(infoPath, info)
}

console.log(`usunieto poligon testowy (parkow: ${before} -> ${parks.features.length})`)
