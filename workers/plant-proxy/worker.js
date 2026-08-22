/**
 * Pośrednik do rozpoznawania roślin (Pl@ntNet).
 *
 * Po co on jest: Parkove to statyczna strona na GitHub Pages, więc każdy klucz
 * wpisany w kod aplikacji jest publiczny i pierwsza osoba, która zajrzy w źródła,
 * może wyczerpać dzienny limit. Klucz siedzi więc tutaj, w zmiennej środowiskowej
 * Workera, a aplikacja wysyła zdjęcie na ten adres.
 *
 * Limit Pl@ntNet: 500 identyfikacji na dobę na darmowym koncie, do 5 zdjęć w
 * jednym zapytaniu, JPG albo PNG, razem najwyżej 50 MB. Odpowiedź zawiera pole
 * remainingIdentificationRequests, więc przekazujemy je dalej i aplikacja może
 * powiedzieć, ile zostało.
 *
 * Wdrożenie (raz):
 *   1. npm i -g wrangler   (albo użyj panelu Cloudflare)
 *   2. wrangler login
 *   3. wrangler secret put PLANTNET_KEY     ← klucz z my.plantnet.org
 *   4. wrangler deploy
 *   5. adres, który wypisze wrangler, wklej do src/app/plant.ts
 *
 * Bezpieczeństwo: sprawdzamy nagłówek Origin. To nie jest szczelne (Origin da się
 * podrobić poza przeglądarką), ale odsiewa przypadkowe użycie z cudzej strony.
 * Klucz nigdy nie opuszcza Workera, a to jest tu najważniejsze.
 */

const ALLOWED = [
  'https://vod123qwe.github.io',
  'http://localhost:5183',
  'http://127.0.0.1:5183',
]

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

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? ''

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
    if (request.method !== 'POST') return json({ error: 'Tylko POST' }, 405, origin)
    if (origin && !ALLOWED.includes(origin)) return json({ error: 'Nie ten adres' }, 403, origin)
    if (!env.PLANTNET_KEY) return json({ error: 'Brak klucza w Workerze' }, 500, origin)

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
    if (res.status === 429)
      return json({ error: 'Dzienny limit wyczerpany, wróć jutro' }, 429, origin)
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
  },
}
