// Parkove color tokens generator.
// Source of truth for color: HCT seed -> tonal palettes -> semantic roles.
// Adjust hue/chroma here (top of the chain), not in the emitted CSS.
// Run: npm run tokens  ->  src/ds/tokens/colors.css

// File-path imports: the package's index.js pulls in dynamiccolor/color_spec_2025.js,
// which has extensionless imports that plain Node ESM cannot resolve (broken in 0.4.0),
// and its exports map blocks package subpath imports. Direct file paths bypass both.
import { TonalPalette } from '../node_modules/@material/material-color-utilities/palettes/tonal_palette.js'
import { hexFromArgb } from '../node_modules/@material/material-color-utilities/utils/string_utils.js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HUE = 140 // forest green

const palettes = {
  P: TonalPalette.fromHueAndChroma(HUE, 30), // primary, deep forest: fills are near black
  // true greys: on white paper a tinted neutral reads as dirt, not as calm
  N: TonalPalette.fromHueAndChroma(HUE, 0),
  NV: TonalPalette.fromHueAndChroma(HUE, 3), // neutral variant, borders and muted content
  L: TonalPalette.fromHueAndChroma(124, 68), // lime, the one loud voice, only on dark
  LS: TonalPalette.fromHueAndChroma(124, 26), // the same lime, whispered: tinted surfaces
  G: TonalPalette.fromHueAndChroma(84, 46), // gold, the collection and nothing else
  E: TonalPalette.fromHueAndChroma(25, 70), // error
  B: TonalPalette.fromHueAndChroma(250, 34), // calm blue, practical info (parking)
  F: TonalPalette.fromHueAndChroma(52, 52), // warm amber, food and drink
  Y: TonalPalette.fromHueAndChroma(320, 40), // playful magenta, playgrounds
}

const t = (palette, tone) => ({ palette, tone })

// Semantic roles: [light, dark]. Tone pairs follow M3 contrast logic (AA).
const roles = {
  // background: white paper, neutral grey fills
  'bg-page': [t('N', 100), t('N', 6)],
  'bg-surface': [t('N', 100), t('N', 12)],
  'bg-surface-raised': [t('N', 100), t('N', 17)],
  'bg-surface-sunken': [t('N', 96), t('N', 4)],
  'bg-primary': [t('P', 20), t('P', 80)],
  'bg-primary-subtle': [t('N', 96), t('P', 25)],
  'bg-lime': [t('L', 88), t('L', 80)],
  // a surface that belongs to the app rather than to the paper: questions,
  // stats, anything that should read as "ours" without shouting
  'bg-mint': [t('LS', 96), t('P', 22)],
  'border-mint': [t('LS', 86), t('P', 32)],
  'bg-gold': [t('G', 85), t('G', 30)],
  'bg-error-subtle': [t('E', 95), t('E', 20)],

  // content
  'content-primary': [t('N', 10), t('N', 95)],
  'content-secondary': [t('NV', 30), t('NV', 80)],
  'content-tertiary': [t('NV', 50), t('NV', 60)],
  'content-disabled': [t('N', 62), t('N', 40)],
  'content-accent': [t('P', 25), t('P', 80)],
  // lime on the deep green: the pairing the whole palette is built around
  'content-on-primary': [t('L', 90), t('P', 20)],
  'content-on-lime': [t('P', 15), t('P', 15)],
  'content-on-gold': [t('G', 20), t('G', 90)],
  'content-error': [t('E', 40), t('E', 80)],

  // border
  'border-subtle': [t('NV', 90), t('NV', 25)],
  'border-default': [t('NV', 80), t('NV', 30)],
  'border-focus': [t('P', 30), t('P', 80)],

  // map, the fog of war
  'map-visited-fill': [t('P', 92), t('P', 25)],
  'map-visited-stroke': [t('P', 30), t('P', 70)],
  'map-unvisited-fill': [t('N', 92), t('N', 20)],
  'map-unvisited-stroke': [t('N', 75), t('N', 35)],
  'map-track': [t('P', 25), t('P', 80)],

  // practical info, set apart from the green of nature
  'bg-info-subtle': [t('B', 96), t('B', 22)],
  'content-info': [t('B', 42), t('B', 82)],
  'border-info': [t('B', 55), t('B', 65)],
  // pin parkingu w nowym języku mapy: ciemny krążek, jasny znak w środku
  'map-parking-fill': [t('B', 28), t('B', 24)],
  'map-parking-icon': [t('B', 84), t('B', 80)],

  // food and drink
  'bg-food-subtle': [t('F', 95), t('F', 22)],
  'content-food': [t('F', 38), t('F', 82)],
  'border-food': [t('F', 50), t('F', 65)],
  /*
   * Piny na mapie mówią innym rejestrem niż karty: ciemny krążek, biała
   * obwódka, jasny znak. Pastelowe tło z karty ginęło na zdjęciu satelitarnym,
   * więc jedzenie i place zabaw dostają ten sam układ co parking, tylko w swoim
   * odcieniu: ciepły amber i magenta zamiast błękitu.
   */
  'map-food-fill': [t('F', 30), t('F', 26)],
  'map-food-icon': [t('F', 88), t('F', 84)],

  // playgrounds
  'bg-play-subtle': [t('Y', 95), t('Y', 22)],
  'content-play': [t('Y', 42), t('Y', 84)],
  'border-play': [t('Y', 55), t('Y', 68)],
  'map-play-fill': [t('Y', 32), t('Y', 26)],
  'map-play-icon': [t('Y', 88), t('Y', 84)],
}

// Not tonal: overlays.
const statics = {
  'bg-scrim': ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.55)'],
}

const line = (name, spec) =>
  `  --${name}: ${hexFromArgb(palettes[spec.palette].tone(spec.tone))}; /* ${spec.palette}${spec.tone} */`

const block = (mode) => {
  const i = mode === 'light' ? 0 : 1
  return [
    ...Object.entries(roles).map(([name, pair]) => line(name, pair[i])),
    ...Object.entries(statics).map(([name, pair]) => `  --${name}: ${pair[i]};`),
  ].join('\n')
}

const css = `/* GENERATED by scripts/generate-colors.mjs. Do not edit by hand: edit the seed and roles there. */

:root {
${block('light')}
}

[data-theme='dark'] {
${block('dark')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${block('dark')
  .split('\n')
  .map((l) => '  ' + l)
  .join('\n')}
  }
}
`

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/ds/tokens/colors.css')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, css)
console.log('written', out)
