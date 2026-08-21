// Map pin artwork: the same Lucide icons the UI uses, drawn into a round badge
// and handed to MapLibre as images. Icons are inlined as path data so no React
// renderer is needed at map time.

import type { PoiCategory } from './data/quests'

/** 24x24 viewBox path data, taken from the Lucide icons used across the UI */
const ICONS: Record<
  PoiCategory | 'parking' | 'stamp' | 'food' | 'playground' | 'audio' | 'note' | 'car',
  string[]
> = {
  // eye
  view: ['M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
  // landmark
  monument: ['M10 18v-7', 'M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z', 'M14 18v-7', 'M18 18v-7', 'M3 22h18', 'M6 18v-7'],
  // waves
  water: ['M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1', 'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1', 'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'],
  // leaf
  nature: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
  // mountain
  cave: ['m8 3 4 8 5-5 5 15H2L8 3z'],
  // scroll-text
  history: ['M15 12h-5', 'M15 8h-5', 'M19 17V5a2 2 0 0 0-2-2H4', 'M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3'],
  // flower-2
  meadow: ['M12 5a3 3 0 1 1 3 3M12 5a3 3 0 1 0-3 3M12 19a3 3 0 1 0 3-3M12 19a3 3 0 1 1-3-3', 'M9 8a3 3 0 1 0 3 3M15 8a3 3 0 1 1-3 3M9 16a3 3 0 1 1 3-3M15 16a3 3 0 1 0-3-3', 'M12 22v-6'],
  // move-up-right, reads as a climbing route
  climb: ['M13 5H19V11', 'M19 5 5 19'],
  // circle-parking
  parking: ['M9 17V7h4a3 3 0 0 1 0 6H9'],
  // coffee
  food: ['M10 2v2', 'M14 2v2', 'M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1', 'M6 2v2'],
  // blocks: te same klocki dla punktu wyprawy i dla udogodnienia
  play: ['M10 22V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z', 'M20 14h-6a1 1 0 0 0-1 1v7h8v-7a1 1 0 0 0-1-1', 'M14 6V3a1 1 0 0 0-1-1h-2'],
  // blocks, reads as a playground
  playground: ['M10 22V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z', 'M20 14h-6a1 1 0 0 0-1 1v7h8v-7a1 1 0 0 0-1-1', 'M14 6V3a1 1 0 0 0-1-1h-2'],
  // mic, a voice note left on the way
  audio: ['M12 19v3', 'M19 10v2a7 7 0 0 1-14 0v-2', 'M8 5a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0z'],
  // car-front: gdzie zostawiłeś auto, żeby nie szukać go po ciemku
  car: ['M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2', 'M9 17h6', 'M7 17a2 2 0 1 0 0 .01', 'M17 17a2 2 0 1 0 0 .01'],
  // sticky-note, a thought pinned to a place
  note: ['M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5z', 'M15 3v6h6'],
  // award, generic
  stamp: ['m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526', 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z'],
}

export type PinVariant =
  | 'open'
  | 'done'
  | 'active'
  | 'parking'
  | 'food'
  | 'playground'
  | 'audio'
  | 'note'
  | 'car'
  | 'replay'

const SIZE = 96 // rendered at 2x of the on-map size

/** an SVG pin: round badge with the category icon, styled from DS colours */
function pinSvg(paths: string[], variant: PinVariant, colors: Record<string, string>) {
  // practical categories get their own hue so they read apart from nature green
  const themed: Record<string, [string, string, string]> = {
    // parking mówi niebieskim, ale tym samym kształtem: ciemny krążek, biała obwódka
    parking: [colors.parkingFill, colors.paper, colors.parkingIcon],
    /*
     * Jedzenie i place zabaw dostały ten sam układ co parking. Wcześniej niosły
     * pastele z kart (jasne tło, kolorowa obwódka), które na zdjęciu satelitarnym
     * robiły się białymi plamkami bez tożsamości. Teraz krążek jest ciemny w swoim
     * odcieniu, obwódka biała, znak jasny: amber dla jedzenia, magenta dla placów.
     */
    food: [colors.mapFoodFill, colors.paper, colors.mapFoodIcon],
    playground: [colors.mapPlayFill, colors.paper, colors.mapPlayIcon],
    // things you left yourself, told apart from the game and from the collection:
    // gold now belongs to the collection alone
    audio: [colors.accentStrong, colors.accentStrong, colors.lime],
    note: [colors.paper, colors.accentStrong, colors.ink],
  }
  /*
   * Jeden język dla całej mapy: ciemny krążek, biała obwódka, limonkowy znak.
   * Wcześniej ekran startowy miał białe krążki z zieloną obwódką, a wspomnienia
   * ciemne, więc ta sama trasa wyglądała jak dwie różne aplikacje. Stan nadal
   * widać: zaliczony punkt nosi ptaszka, aktywny grubszą obwódkę.
   */
  const [fill, stroke, icon] =
    themed[variant] ?? [colors.trailFill, colors.paper, colors.trailIcon]
  const ring = variant === 'active' ? 6 : 4.5
  const r = SIZE / 2 - ring
  // mniejszy znak w tym samym krążku: spokojniej czyta się na zdjęciu
  const iconScale = 1.72
  const iconOffset = (SIZE - 24 * iconScale) / 2
  // a collected point wears a tick: gold alone did not read as "done"
  // ptaszek na złocie, bo złoto należy do kolekcji: to znak zdobycia
  const tick =
    variant === 'done'
      ? `<g transform="translate(${SIZE - 30} 6)">
    <circle cx="12" cy="12" r="12" fill="${colors.gold}" stroke="${colors.paper}" stroke-width="2"/>
    <path d="M6.5 12.5l3.5 3.5 7-7" fill="none" stroke="${colors.onGold}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`
      : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${ring * 1.6}"/>
  <g transform="translate(${iconOffset} ${iconOffset}) scale(${iconScale})" fill="none" stroke="${icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${paths.map((d) => `<path d="${d}"/>`).join('')}
  </g>
  ${tick}
</svg>`
}

export const pinImageId = (category: string, variant: PinVariant) => `pin-${category}-${variant}`

/** SVG has to go through an <img> first: createImageBitmap cannot decode it */
async function rasterise(svg: string) {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  const img = new Image(SIZE, SIZE)
  img.src = url
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, SIZE, SIZE)
  return ctx.getImageData(0, 0, SIZE, SIZE)
}

/** rasterise every pin the map needs; returns [imageId, ImageData] pairs */
export async function buildPinImages(colors: Record<string, string>) {
  const out: Array<[string, ImageData]> = []
  for (const [category, paths] of Object.entries(ICONS)) {
    const own = ['parking', 'food', 'playground', 'audio', 'note', 'car']
    const variants: PinVariant[] = own.includes(category)
      ? [category as PinVariant, 'replay']
      : ['open', 'done', 'active', 'replay']
    for (const variant of variants) {
      try {
        out.push([pinImageId(category, variant), await rasterise(pinSvg(paths, variant, colors))])
      } catch {
        // a pin that fails to draw simply stays absent from the map
      }
    }
  }
  return out
}

/**
 * A walk photo drawn as a round pin: the picture itself, cropped to a circle
 * with a light ring, so a route reads as "here is where I stopped".
 */
export async function buildPhotoImage(blob: Blob, ring: string) {
  const bmp = await createImageBitmap(blob)
  const size = 88
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const r = size / 2
  ctx.save()
  ctx.beginPath()
  ctx.arc(r, r, r - 6, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  // cover: fill the circle without squashing the photo
  const scale = Math.max(size / bmp.width, size / bmp.height)
  const w = bmp.width * scale
  const h = bmp.height * scale
  ctx.drawImage(bmp, (size - w) / 2, (size - h) / 2, w, h)
  ctx.restore()
  ctx.lineWidth = 6
  ctx.strokeStyle = ring
  ctx.beginPath()
  ctx.arc(r, r, r - 3, 0, Math.PI * 2)
  ctx.stroke()
  bmp.close?.()
  return ctx.getImageData(0, 0, size, size)
}

/** pin colours read from the live tokens, so both maps draw the same artwork */
export function pinColors() {
  const cs = getComputedStyle(document.documentElement)
  const v = (n: string) => cs.getPropertyValue(n).trim()
  return {
    surface: v('--bg-surface'),
    accent: v('--map-visited-stroke'),
    accentStrong: v('--content-accent'),
    gold: v('--bg-gold'),
    onGold: v('--content-on-gold'),
    lime: v('--bg-lime'),
    deep: v('--bg-primary'),
    trailFill: v('--trail-fill'),
    trailEdge: v('--trail-edge'),
    trailIcon: v('--trail-icon'),
    trailMe: v('--trail-me'),
    onPrimary: v('--content-on-primary'),
    paper: v('--bg-surface'),
    ink: v('--content-primary'),
    parkingFill: v('--map-parking-fill'),
    parkingIcon: v('--map-parking-icon'),
    infoSubtle: v('--bg-info-subtle'),
    info: v('--content-info'),
    infoBorder: v('--border-info'),
    foodSubtle: v('--bg-food-subtle'),
    food: v('--content-food'),
    foodBorder: v('--border-food'),
    playSubtle: v('--bg-play-subtle'),
    play: v('--content-play'),
    playBorder: v('--border-play'),
    mapFoodFill: v('--map-food-fill'),
    mapFoodIcon: v('--map-food-icon'),
    mapPlayFill: v('--map-play-fill'),
    mapPlayIcon: v('--map-play-icon'),
  }
}
