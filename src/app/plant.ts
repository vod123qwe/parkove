/**
 * Rozpoznawanie roślin ze zdjęcia.
 *
 * Dlaczego nie „zapytaj Google": publicznego darmowego API, które ze zdjęcia
 * powie gatunek rośliny, Google nie ma. Cloud Vision daje etykiety w rodzaju
 * „plant, leaf, green" i tysiąc jednostek na miesiąc, a to nie odpowiedź na
 * pytanie „co to jest". Pl@ntNet jest zrobiony dokładnie do tego, ma model na
 * florze świata i 500 identyfikacji na dobę bezpłatnie.
 *
 * Klucz nie może leżeć w aplikacji, bo to statyczna strona: kod jest publiczny.
 * Dlatego zdjęcie leci do naszego Workera (workers/plant-proxy), który trzyma
 * klucz u siebie. Bez wpisanego adresu funkcja jest wyłączona i przycisk w
 * ogóle się nie pokazuje.
 *
 * Sieć jest wymagana. W dolinie bez zasięgu to nie zadziała i tak ma być: nie
 * udajemy, że telefon rozpoznaje rośliny sam.
 */

/**
 * Adres Workera. Wklej po `wrangler deploy`, na przykład
 * 'https://parkove-plant.twoj-login.workers.dev'. Pusty = funkcja wyłączona.
 */
export const PLANT_PROXY = ''

export const plantEnabled = () => PLANT_PROXY.length > 0

export type PlantGuess = {
  /** 0 do 1, jak pewny jest model */
  score: number
  latin: string
  common: string
  family: string
}

export type PlantAnswer = {
  guesses: PlantGuess[]
  /** ile identyfikacji zostało na dziś, gdy Pl@ntNet to podał */
  left: number | null
  /** komunikat zamiast wyniku: nie roślina, brak sieci, limit */
  note?: string
}

/**
 * Zmniejsz zdjęcie przed wysłaniem. Zdjęcie z telefonu to kilka megabajtów, a
 * modelowi wystarcza 1024 px dłuższego boku. W terenie liczy się każdy kilobajt.
 */
async function shrink(blob: Blob, max = 1024): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob)
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
    if (scale === 1) return blob
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return blob
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const out = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), 'image/jpeg', 0.82),
    )
    return out ?? blob
  } catch {
    // stary silnik albo dziwny format: wyślij, co jest
    return blob
  }
}

/** Co widać na zdjęciu, gdy wiesz: podpowiedź poprawia trafność */
export type Organ = 'auto' | 'leaf' | 'flower' | 'fruit' | 'bark'

export async function identifyPlant(blob: Blob, organ: Organ = 'auto'): Promise<PlantAnswer> {
  if (!plantEnabled()) return { guesses: [], left: null, note: 'Rozpoznawanie nie jest włączone' }
  if (!navigator.onLine) return { guesses: [], left: null, note: 'Bez sieci nie rozpoznam' }

  const form = new FormData()
  form.append('images', await shrink(blob), 'photo.jpg')
  form.append('organs', organ)

  let res: Response
  try {
    res = await fetch(PLANT_PROXY, { method: 'POST', body: form })
  } catch {
    return { guesses: [], left: null, note: 'Nie udało się połączyć' }
  }

  const data = (await res.json().catch(() => null)) as
    | { results?: PlantGuess[]; left?: number | null; note?: string; error?: string }
    | null
  if (!res.ok || !data) return { guesses: [], left: null, note: data?.error ?? 'Coś nie wyszło' }
  return { guesses: data.results ?? [], left: data.left ?? null, note: data.note }
}

/** „Klon zwyczajny (Acer platanoides), pewność 87%" */
export const plantLabel = (g: PlantGuess) =>
  [g.common || g.latin, g.common && g.latin ? `(${g.latin})` : null].filter(Boolean).join(' ')
