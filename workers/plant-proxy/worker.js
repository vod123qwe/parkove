/**
 * Pośrednik Parkove: dwie ścieżki, jeden Worker.
 *
 *   POST /plant   zdjęcie w multipart -> rozpoznanie rośliny (Pl@ntNet)
 *   POST /ask     pytanie o punkt     -> odpowiedź modelu (Gemini)
 *
 * Po co on jest: Parkove to statyczna strona na GitHub Pages, więc każdy klucz
 * wpisany w kod aplikacji jest publiczny i pierwsza osoba, która zajrzy w źródła,
 * może wyczerpać limit. Klucze siedzą tu, w zmiennych środowiskowych Workera.
 *
 * Limity, żeby nie było niespodzianek:
 *   Pl@ntNet, darmowe konto: 500 identyfikacji na dobę, do 5 zdjęć na zapytanie,
 *   JPG albo PNG, razem najwyżej 50 MB. Odpowiedź zawiera
 *   remainingIdentificationRequests, więc przekazujemy je dalej.
 *   Gemini: Google nie publikuje już tabeli darmowego progu (widać ją tylko w
 *   panelu konta), a doniesienia mówią o rzędzie dwudziestu zapytań na dobę dla
 *   modeli Flash. Dlatego /ask ma własny dzienny limit po tej stronie:
 *   przekroczony zwraca uprzejmą odmowę, a nie rachunek.
 *
 * Wdrożenie (raz):
 *   npm run plant:login
 *   npm run plant:deploy
 *   npm run plant:key         (klucz Pl@ntNet)
 *   npx wrangler secret put GEMINI_KEY -c workers/plant-proxy/wrangler.toml
 *   adres z deployu wklej do PROXY w src/app/proxy.ts
 *
 * Bezpieczeństwo: sprawdzamy nagłówek Origin. To nie jest szczelne (Origin da
 * się podrobić poza przeglądarką), ale odsiewa przypadkowe użycie z cudzej
 * strony. Klucze nigdy nie opuszczają Workera i to jest tu najważniejsze.
 */

const ALLOWED = [
  'https://vod123qwe.github.io',
  'http://localhost:5183',
  'http://127.0.0.1:5183',
]

/** dzienny limit pytań do modelu; wyżej i tak zaczyna kosztować */
const ASK_LIMIT = 60

const cors = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
})

const json = (body, status, origin) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  })

/* ---------- rozpoznawanie roślin ---------- */

async function plant(request, env, origin) {
  if (!env.PLANTNET_KEY) return json({ error: 'Brak klucza Pl@ntNet w Workerze' }, 500, origin)

  // 8 MB: jedno zdjęcie z telefonu po zmniejszeniu waży ułamek tego
  const len = Number(request.headers.get('Content-Length') ?? 0)
  if (len > 8 * 1024 * 1024) return json({ error: 'Zdjęcie za duże' }, 413, origin)

  let form
  try {
    form = await request.formData()
  } catch {
    return json({ error: 'Nie umiem odczytać zdjęcia' }, 400, origin)
  }
  const images = form.getAll('images').filter((f) => typeof f !== 'string')
  if (!images.length) return json({ error: 'Nie ma zdjęcia' }, 400, origin)

  const out = new FormData()
  for (const img of images.slice(0, 5)) out.append('images', img)
  for (const organ of form.getAll('organs')) out.append('organs', organ)

  const url = new URL('https://my-api.plantnet.org/v2/identify/all')
  url.searchParams.set('api-key', env.PLANTNET_KEY)
  url.searchParams.set('lang', 'pl')
  url.searchParams.set('nb-results', '3')

  let res
  try {
    res = await fetch(url, { method: 'POST', body: out })
  } catch {
    return json({ error: 'Pl@ntNet nie odpowiada' }, 502, origin)
  }

  if (res.status === 404) return json({ results: [], note: 'To chyba nie roślina' }, 200, origin)
  if (res.status === 429) return json({ error: 'Dzienny limit wyczerpany, wróć jutro' }, 429, origin)
  if (!res.ok) return json({ error: `Pl@ntNet odpowiedział ${res.status}` }, 502, origin)

  const data = await res.json()
  // przekazujemy tylko to, co aplikacja pokazuje: bez surowych danych o gatunku
  return json(
    {
      results: (data.results ?? []).slice(0, 3).map((r) => ({
        score: r.score,
        latin: r.species?.scientificNameWithoutAuthor ?? r.species?.scientificName ?? '',
        common: r.species?.commonNames?.[0] ?? '',
        family: r.species?.family?.scientificNameWithoutAuthor ?? '',
      })),
      left: data.remainingIdentificationRequests ?? null,
    },
    200,
    origin,
  )
}

/* ---------- pytania o punkt ---------- */

/*
 * Instrukcja systemowa siedzi TUTAJ, nie w aplikacji, i to jest cała różnica:
 * gdyby leżała w kodzie strony, każdy mógłby ją podmienić i użyć naszego klucza
 * do czegokolwiek. Aplikacja przysyła tylko pytanie i kontekst punktu.
 */
const RULES = `Jesteś towarzyszem spaceru w aplikacji Parkove: gra terenowa o parkach Krakowa i Dolinkach Krakowskich, dla rodziny z dzieckiem.

Zasady odpowiedzi:
- Po polsku, prostym językiem, dwa do czterech zdań. Bez list, bez nagłówków.
- Trzymaj się miejsca, o które pyta użytkownik. Jeśli pytanie odchodzi daleko od tematu, odpowiedz krótko i wróć do miejsca.
- NIE WYMYŚLAJ. Nie podawaj dat, nazwisk, wysokości ani legend, których nie jesteś pewien. Gdy nie wiesz, powiedz wprost "nie wiem" albo "tego nie jestem pewien".
- Legendę zawsze nazywaj legendą, nigdy faktem.
- Nie doradzaj jedzenia roślin ani grzybów i nie oceniaj bezpieczeństwa jaskiń, skał czy kąpieli: odeślij do oznaczeń na miejscu.
- Mów o tym, co widać i co da się zrobić na miejscu, bo użytkownik czyta to stojąc w terenie.`

async function ask(request, env, origin) {
  if (!env.GEMINI_KEY) return json({ error: 'Brak klucza Gemini w Workerze' }, 500, origin)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Nie umiem odczytać pytania' }, 400, origin)
  }
  const q = String(body.q ?? '').slice(0, 400).trim()
  if (!q) return json({ error: 'Puste pytanie' }, 400, origin)

  /* kontekst przycięty: nazwa miejsca, nazwa punktu i jego opis z aplikacji */
  const place = String(body.place ?? '').slice(0, 120)
  const point = String(body.point ?? '').slice(0, 120)
  const story = String(body.story ?? '').slice(0, 2400)
  const asked = Number(body.asked ?? 0)
  if (asked >= ASK_LIMIT)
    return json({ error: `Dzienny limit ${ASK_LIMIT} pytań wyczerpany, wróć jutro` }, 429, origin)

  const input = [
    place && `Miejsce: ${place}`,
    point && `Punkt: ${point}`,
    story && `Co aplikacja o nim mówi:\n${story}`,
    `Pytanie: ${q}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  let res
  try {
    res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_KEY },
      body: JSON.stringify({
        model: env.GEMINI_MODEL ?? 'gemini-3.7-flash',
        input,
        system_instruction: RULES,
        generation_config: { temperature: 0.4, thinking_level: 'low' },
      }),
    })
  } catch {
    return json({ error: 'Model nie odpowiada' }, 502, origin)
  }

  if (res.status === 429) return json({ error: 'Limit modelu na dziś wyczerpany' }, 429, origin)
  if (!res.ok) {
    const detail = await res.text()
    return json({ error: `Model odpowiedział ${res.status}`, detail: detail.slice(0, 200) }, 502, origin)
  }

  const data = await res.json()
  /*
   * Odpowiedź czytamy odpornie na wersję API: nowe interactions zwracają kroki z
   * treścią, starsze generateContent kandydatów z częściami. Bierzemy pierwszy
   * tekst, jaki znajdziemy, żeby zmiana kształtu nie ubiła funkcji.
   */
  const fromSteps = (data.steps ?? [])
    .filter((s) => s.type === 'model_output')
    .flatMap((s) => s.content ?? [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n')
    .trim()
  const fromCandidates = (data.candidates ?? [])
    .flatMap((c) => c.content?.parts ?? [])
    .map((p) => p.text)
    .filter(Boolean)
    .join('\n')
    .trim()
  const text = fromSteps || fromCandidates || String(data.output_text ?? '').trim()

  if (!text) return json({ error: 'Model nic nie odpowiedział' }, 502, origin)
  return json({ text }, 200, origin)
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? ''
    const path = new URL(request.url).pathname.replace(/\/+$/, '')

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
    if (request.method !== 'POST') return json({ error: 'Tylko POST' }, 405, origin)
    if (origin && !ALLOWED.includes(origin)) return json({ error: 'Nie ten adres' }, 403, origin)

    // '' zostaje przy roślinach: taki był pierwszy adres i nie chcę psuć testów
    if (path === '/plant' || path === '') return plant(request, env, origin)
    if (path === '/ask') return ask(request, env, origin)
    return json({ error: 'Nie ma takiej ścieżki' }, 404, origin)
  },
}
