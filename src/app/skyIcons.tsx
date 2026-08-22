import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react'
import type { Sky } from './weather'

/**
 * Ikona dla stanu nieba. Osobny plik, bo pogodę pokazujemy w dwóch miejscach:
 * w karcie miejsca (pas godzin) i w liście miejsc (jedno spojrzenie na wiersz).
 * Dane (weather.ts) zostają czyste: trzymają sens, nie bibliotekę ikon.
 */
export const SKY_ICONS: Record<Sky, React.ReactNode> = {
  clear: <Sun />,
  'mostly-clear': <CloudSun />,
  cloudy: <CloudSun />,
  overcast: <Cloud />,
  fog: <CloudFog />,
  drizzle: <CloudDrizzle />,
  rain: <CloudRain />,
  downpour: <CloudRainWind />,
  snow: <CloudSnow />,
  storm: <CloudLightning />,
}
