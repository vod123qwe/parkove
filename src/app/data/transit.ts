// Suggested public transport per park. Only inside Kraków: the valleys are in
// other communes, served by agglomeration lines whose numbers we have not
// checked, so they get a car and a parking instead of a guess.
// Stop names and bus numbers come from OSM
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
  'zalew-nowohucki': {
    stop: 'Zalew Nowohucki',
    mode: 'both',
    note: 'Przystanek nazwany od tego miejsca, przy południowym krańcu parku: tramwaj i autobus stają kilkadziesiąt metrów od wody. Od północy jest jeszcze przystanek Krzesławice Młyn, nazwany od młyna, którego ruiny stoją nad zalewem.',
    verified: false,
  },
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


}

export const MODE_LABEL: Record<TransitInfo['mode'], string> = {
  tram: 'Tramwajem',
  bus: 'Autobusem',
  both: 'Komunikacją miejską',
}

/** Google Maps transit directions to a point; Maps fills in the user's location */
export const transitDirectionsUrl = ([lng, lat]: [number, number]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`
