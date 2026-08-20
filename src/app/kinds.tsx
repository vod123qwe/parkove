import { Flower2, Leaf, Mountain, Sprout, TreePine, Trees, Waves } from 'lucide-react'
import type { ReactNode } from 'react'

export const KIND_META: Record<string, { label: string; icon: ReactNode }> = {
  park: { label: 'Park', icon: <Trees /> },
  mound: { label: 'Kopiec', icon: <Mountain /> },
  forest: { label: 'Las', icon: <TreePine /> },
  meadow: { label: 'Łąki', icon: <Flower2 /> },
  nature: { label: 'Przyroda', icon: <Leaf /> },
  water: { label: 'Woda', icon: <Waves /> },
  garden: { label: 'Ogród', icon: <Sprout /> },
}
