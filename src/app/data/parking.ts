// Suggested parking per park: the FIRST entry is the suggested one (map pin),
// the full list shows in the parking modal. Fees stay generic until verified
// on site; occupancy gets filled during curation. OSM check 2026-08-19.

export type ParkingInfo = {
  id: string
  name: string
  hint: string
  fee: string
  coords: [number, number]
  /** filled during curation: how crowded it usually is */
  occupancy?: 'low' | 'medium' | 'high'
}

export const OCCUPANCY_LABEL: Record<NonNullable<ParkingInfo['occupancy']>, string> = {
  low: 'zwykle luźno',
  medium: 'bywa średnio',
  high: 'zwykle tłoczno',
}

export const PARKING: Record<string, ParkingInfo[]> = {
  'kopiec-krakusa': [
    {
      id: 'krakus-powstancow',
      name: 'Parking przy al. Powstańców Śląskich',
      hint: 'Bezpłatne miejsca od wschodniej strony wzgórza, przy cmentarzu Podgórskim. Pod kopiec 5 minut spacerem.',
      fee: 'Bezpłatny',
      coords: [19.9584, 50.0406],
    },
    {
      id: 'krakus-za-torem',
      name: 'Parking od strony ul. Za Torem',
      hint: 'Mniejszy plac na południowy wschód od kopca, blisko zejścia do kamieniołomu Liban.',
      fee: 'Bezpłatny',
      coords: [19.9633, 50.0381],
    },
  ],
  zakrzowek: [
    {
      id: 'zakrzowek-jacka',
      name: 'Ulice przy wejściu od św. Jacka',
      hint: 'Parkowanie uliczne przy ul. św. Jacka i Wyłom. W pogodne weekendy ciasno, celuj przed południem.',
      fee: 'Bezpłatne (uliczne)',
      coords: [19.9169, 50.0433],
    },
  ],
  'park-jordana': [
    {
      id: 'jordana-3maja',
      name: 'Parking przy al. 3 Maja',
      hint: 'Miejski parking wzdłuż Błoń, wejście do parku po drugiej stronie alei.',
      fee: 'Płatny (parkomat)',
      coords: [19.9118, 50.0619],
    },
    {
      id: 'jordana-oleandry',
      name: 'Parking przy ul. Oleandry',
      hint: 'Od północnej strony parku, obok Muzeum Czynu Niepodległościowego.',
      fee: 'Płatny (parkomat)',
      coords: [19.9125, 50.0657],
    },
  ],
}

export const suggestedParking = (parkId: string) => PARKING[parkId]?.[0] ?? null
