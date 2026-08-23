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
  'zalew-nowohucki': [
    {
      id: 'zalew-bulwarowa',
      name: 'Bulwarowa, duży plac',
      hint: 'Dwadzieścia miejsc na utwardzonym placu, zaraz przy Bulwarowej. Stąd nad wodę pięć minut, obok wejście od strony boisk.',
      fee: 'bezpłatnie',
      coords: [20.04849, 50.07944],
    },
    {
      id: 'zalew-bulwarowa-mala',
      name: 'Bulwarowa, przy samej jezdni',
      hint: 'Trzynaście miejsc wzdłuż drogi, bliżej wody niż duży plac. Pierwszy wybór, gdy jedziesz na krótko.',
      fee: 'bezpłatnie',
      coords: [20.04926, 50.07986],
    },
    {
      id: 'zalew-wojciechowskiego',
      name: 'Wojciechowskiego, od północy',
      hint: 'Najbliżej tężni, placu zabaw i piaskowych boisk. Wjazd od ulicy, nie od parku.',
      fee: 'bezpłatnie',
      coords: [20.0488, 50.08159],
    },
    {
      id: 'zalew-smorawinskiego',
      name: 'Smorawińskiego, od wschodu',
      hint: 'Po drugiej stronie zalewu, przy siłowni i wybiegu dla psów. Blisko miejsca, w którym Dłubnia wypływa.',
      fee: 'bezpłatnie',
      coords: [20.05743, 50.07895],
    },
  ],
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
  /*
   * Zakrzówek ma trzy różne wejścia i każde ma swój parking, więc „najlepszy”
   * zależy od tego, po co jedziesz. Dystanse zmierzone od parkingów z OSM do
   * naszych punktów (2026-08-22): kąpielisko, punkt widokowy nad zalewem i Grota
   * Twardowskiego leżą po trzech różnych stronach wzgórza.
   */
  zakrzowek: [
    {
      id: 'zakrzowek-jacka-parking',
      name: 'Parking przy św. Jacka',
      hint: 'Prawdziwy parking, nie ulica: 460 m do punktu widokowego nad zalewem i 680 m do kąpieliska. Najlepszy, gdy jedziesz na wodę i widoki.',
      fee: 'Bezpłatny',
      coords: [19.920035, 50.039169],
    },
    {
      id: 'zakrzowek-kaufland',
      name: 'Przy Kauflandzie, Kamieniarska',
      hint: 'Najbliżej samego kąpieliska, 560 m, i 126 miejsc, więc zwykle jest gdzie stanąć. To parking sklepowy dla klientów i płatny, więc uczciwie: albo zakupy, albo opłata.',
      fee: 'Płatny (sklepowy)',
      coords: [19.911063, 50.030166],
    },
    {
      id: 'zakrzowek-norymberska',
      name: 'Norymberska, przy jednostce',
      hint: 'Zachodnie wejście, obok jednostki wojskowej: tylko 285 m do Groty Twardowskiego i najbliżej skałek. Do kąpieliska stąd 800 m.',
      fee: 'Bezpłatny',
      coords: [19.902069, 50.036365],
    },
    {
      id: 'zakrzowek-jacka',
      name: 'Ulice przy św. Jacka i Wyłom',
      hint: 'Zapas, gdy parking przy św. Jacka jest pełny. Parkowanie uliczne, w pogodne weekendy ciasno, celuj przed południem.',
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
  // Dolinki: dojazd autem, bo linie aglomeracyjne są niepotwierdzone. Wszystkie
  // współrzędne to węzły amenity=parking z OSM, wybrane jako najbliższe wejściu
  // do doliny. Odległość od środka doliny podana w podpowiedzi.
  'dolina-bolechowicka': [
    {
      id: 'bolechowicka-brama',
      name: 'Parking pod Bramą Bolechowicką',
      hint: 'Kilka miejsc przy drodze od strony Karniowic, 400 m od bramy. W pogodny weekend zajmuje się szybko.',
      fee: 'Bezpłatny',
      coords: [19.780403, 50.154033],
    },
    {
      id: 'bolechowicka-polnoc',
      name: 'Parking od północy',
      hint: 'Bezpłatny, po drugiej stronie doliny, około 850 m od bramy.',
      fee: 'Bezpłatny',
      coords: [19.785601, 50.163921],
    },
  ],
  'dolina-kobylanska': [
    {
      id: 'kobylanska-wejscie',
      name: 'Parking przy wejściu do doliny',
      hint: 'Bezpłatny, od strony Kobylan, około 600 m do pierwszych skał.',
      fee: 'Bezpłatny',
      coords: [19.748789, 50.156541],
    },
    {
      id: 'kobylanska-tablica',
      name: 'Parking przy tablicy doliny',
      hint: 'Przy wjeździe od ulicy Turystycznej, obok tablicy informacyjnej doliny.',
      fee: 'Nieznana',
      coords: [19.761612, 50.150110],
    },
  ],
  'dolina-kluczwody': [
    {
      id: 'kluczwody-gora',
      name: 'Parking w górnej części doliny',
      hint: 'Od strony Białego Kościoła, około 700 m od Mącznych Skał.',
      fee: 'Nieznana',
      coords: [19.816998, 50.164623],
    },
  ],
  /*
   * Uwaga na geografię tej doliny: wodospad Szum z Sokolicą leżą w jej środku, a
   * Jaskinia Nietoperzowa trzy kilometry wyżej, po stronie Jerzmanowic. To dwa
   * osobne wypady i dwa osobne parkingi. Odległości zmierzone od punktów wyprawy
   * do parkingów z OSM (2026-08-22).
   */
  'dolina-bedkowska': [
    {
      id: 'bedkowska-brandysowka',
      name: 'Brandysówka, środek doliny',
      hint: 'Najbliżej tego, po co się tu jedzie: szlak zaczyna się przy samym parkingu, wodospad Szum kilkaset metrów dalej asfaltem, więc da się z wózkiem. Płatny, 15 zł, przy schronisku, które daje pierogi i bigos.',
      fee: 'Płatny',
      coords: [19.740535, 50.172941],
    },
    {
      id: 'bedkowska-nietoperzowa',
      name: 'Przy Jaskini Nietoperzowej',
      hint: 'Osobny wypad, górny koniec doliny po stronie Jerzmanowic: 50 m do wejścia na ścieżkę, jaskinia obok. Żwirowy, bez opłaty. Od Brandysówki idąc szutrówką to godzina, dlatego lepiej podjechać.',
      fee: 'Bezpłatny',
      coords: [19.775846, 50.193216],
    },
    {
      id: 'bedkowska-srodek',
      name: 'Parking w środku doliny',
      hint: 'Zapas, gdy przy Brandysówce nie ma miejsca: ścieżkami 840 m i czternaście minut do pierwszego punktu. W OSM bez żadnych tagów, więc opłaty nie znamy.',
      fee: 'Nieznana',
      coords: [19.748334, 50.172255],
    },
    {
      id: 'bedkowska-bedkowice',
      name: 'Łazy, przy kościele',
      hint: 'Spory i bezpłatny, przy kościele w Łazach, kilometr od wodospadu. Od tej strony wchodzi się w dolinę wzdłuż potoku, co samo w sobie jest spacerem. Autobusem: 210, nocą 910.',
      fee: 'Nieznana',
      coords: [19.752579, 50.167952],
    },
  ],
  'dolina-raclawki': [
    {
      id: 'raclawki-parking',
      name: 'Parking w Dolinie Racławki',
      hint: 'Bezpłatny, oznaczony w OSM z nazwy, przy dolnym wylocie doliny w Dubiu.',
      fee: 'Bezpłatny',
      coords: [19.691404, 50.159506],
    },
    {
      id: 'raclawki-polnoc',
      name: 'Parking od północy',
      hint: 'Bezpłatny, bliżej Racławic i górnej, bezleśnej części doliny.',
      fee: 'Bezpłatny',
      coords: [19.693714, 50.172152],
    },
  ],
  'dolina-eliaszowki': [
    {
      id: 'eliaszowki-klasztor',
      name: 'Parking przy klasztorze w Czernej',
      hint: 'Bezpłatny, 150 m od wejścia w dolinę. Od klasztoru wchodzi się prosto w rezerwat.',
      fee: 'Bezpłatny',
      coords: [19.635141, 50.169012],
    },
  ],
  'dolina-szklarki': [
    {
      id: 'szklarki-parking',
      name: 'Parking przy drodze przez dolinę',
      hint: 'Dnem doliny biegnie asfalt, więc miejsca są po drodze. Około 600 m od Brodła.',
      fee: 'Nieznana',
      coords: [19.712197, 50.183042],
    },
  ],

}

export const suggestedParking = (parkId: string) => PARKING[parkId]?.[0] ?? null
