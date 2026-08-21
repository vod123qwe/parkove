// Suggested public transport per park. Stop names and bus numbers come from OSM
// route relations (2026-08-19); tram numbers are not tagged there, so a tram stop
// is named without numbers rather than guessed. Google Maps computes the actual
// route from the user's location, so this box is a hint, not a timetable.

export type TransitInfo = {
  /** nearest useful stop, as named on the sign */
  stop: string
  mode: 'tram' | 'bus' | 'both'
  /** confirmed line numbers, when known */
  lines?: string
  note?: string
  /** false until checked on site */
  verified?: boolean
}

export const TRANSIT: Record<string, TransitInfo> = {
  'kopiec-krakusa': {
    stop: 'Cmentarz Podgórski',
    mode: 'both',
    lines: '127, 143, 155, 158, 174, 178',
    note: 'Stąd pod kopiec około 10 minut w górę. Blisko też przystanek kolejowy Podgórze SKA.',
    verified: false,
  },
  zakrzowek: {
    stop: 'Kapelanka lub Zielińskiego',
    mode: 'both',
    lines: '112, 126, 162, 194, 219, 612',
    note: 'Od przystanku do wejścia od ul. Wyłom kilka minut spacerem.',
    verified: false,
  },
  'park-jordana': {
    stop: 'Park Jordana (tramwaj) lub Cracovia Błonia',
    mode: 'both',
    lines: 'autobusy 124, 134, 152, 164',
    note: 'Przystanek tramwajowy nosi nazwę parku i stoi przy samym wejściu.',
    verified: false,
  },
  'skalki-twardowskiego': {
    stop: 'Park "Skały Twardowskiego"',
    mode: 'bus',
    lines: '112, 162, 612',
    note: 'Przystanek nazwany od skałek, wejście w las tuż obok.',
    verified: false,
  },
  'skawina-pilsudskiego': {
    stop: 'Skawina Rynek',
    mode: 'bus',
    lines: '203, 223, 233, 243, 253, 293',
    note: 'Z Krakowa dojedziesz też koleją do stacji Skawina, potem 10 minut spacerem.',
    verified: false,
  },
  // Dolinki: to już nie MPK, a strefa aglomeracyjna. Numery bez potwierdzenia,
  // dlatego verified: false i nacisk na to, co pewne, czyli kolej do Zabierzowa.
  'dolina-bolechowicka': {
    stop: 'Bolechowice',
    mode: 'bus',
    note: 'Autobusy aglomeracyjne z Krakowa w stronę Zabierzowa i Bolechowic. Pewniejsza jest kolej: pociąg do Zabierzowa, potem około 4 km. Samochodem parking pod bramą.',
    verified: false,
  },
  'dolina-kobylanska': {
    stop: 'Kobylany',
    mode: 'bus',
    note: 'Autobusem w stronę Zabierzowa i Kobylan. Koleją do Zabierzowa i dalej około 5 km, więc tę dolinę najłatwiej zrobić samochodem.',
    verified: false,
  },
  'dolina-kluczwody': {
    stop: 'Biały Kościół',
    mode: 'bus',
    note: 'Autobusy w stronę Wielkiej Wsi i Olkusza zatrzymują się w Białym Kościele, stamtąd do doliny kilkanaście minut spacerem.',
    verified: false,
  },

  'dolina-bedkowska': {
    stop: 'Będkowice',
    mode: 'bus',
    note: 'Autobusy aglomeracyjne w stronę Bębła i Jerzmanowic. Będkowice to najwygodniejszy punkt startowy, bo stąd wchodzi się w środek doliny.',
    verified: false,
  },
  'dolina-raclawki': {
    stop: 'Dubie lub Krzeszowice',
    mode: 'both',
    note: 'Koleją do Krzeszowic, dalej autobusem albo kilka kilometrów spacerem do Dubia, gdzie zaczyna się dolina. Najdalsza z Dolinek, więc samochód mocno pomaga.',
    verified: false,
  },
  'dolina-eliaszowki': {
    stop: 'Czerna, klasztor',
    mode: 'both',
    note: 'Koleją do Krzeszowic, potem autobusem do Czernej. Od klasztoru wchodzi się prosto w dolinę.',
    verified: false,
  },
  'dolina-szklarki': {
    stop: 'Szklary',
    mode: 'bus',
    note: 'Autobusy w stronę Jerzmanowic i Olkusza. Dnem doliny biegnie droga, więc dojazd jest łatwy, a spacer mniej dziki niż w pozostałych dolinach.',
    verified: false,
  },

}

export const MODE_LABEL: Record<TransitInfo['mode'], string> = {
  tram: 'Tramwajem',
  bus: 'Autobusem',
  both: 'Komunikacją miejską',
}

/** Google Maps transit directions to a point; Maps fills in the user's location */
export const transitDirectionsUrl = ([lng, lat]: [number, number]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`
