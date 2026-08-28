import { Flower2, Home, Leaf, Mountain, MountainSnow, Sprout, TreePine, Trees, Waves } from 'lucide-react'
import type { ReactNode } from 'react'

export const KIND_META: Record<string, { label: string; icon: ReactNode }> = {
  park: { label: 'Park', icon: <Trees /> },
  mound: { label: 'Kopiec', icon: <Mountain /> },
  forest: { label: 'Las', icon: <TreePine /> },
  meadow: { label: 'Łąki', icon: <Flower2 /> },
  nature: { label: 'Przyroda', icon: <Leaf /> },
  water: { label: 'Woda', icon: <Waves /> },
  garden: { label: 'Ogród', icon: <Sprout /> },
  valley: { label: 'Dolina', icon: <MountainSnow /> },
  village: { label: 'Wieś', icon: <Home /> },
}

/**
 * Ikona rodzaju miejsca jako zastępstwo brakującej pieczątki.
 *
 * Gablota pokazywała przy braku pliku samą przerywaną ramkę, a pozostałe
 * ekrany zawsze drzewko, co przy wsi w Portugalii albo przy ujściu rzeki
 * mówiło nieprawdę. Placeholder ma mówić, jakiego rodzaju miejsce czeka na
 * naklejkę.
 */
export const kindIcon = (kind: string): ReactNode => KIND_META[kind]?.icon ?? <Trees />
