// Amenity points shown on the map: food and playgrounds, from OSM (2026-08-20).
// Curated: named eateries within 120 m of the park (six closest) and up to four
// playgrounds. Verified against park polygons; the comment says where each sits.

import { detailFor } from './amenity-details'

export type AmenityKind = 'cafe' | 'restaurant' | 'fast_food' | 'ice_cream' | 'playground'

export type AmenitySpot = {
  id: string
  name: string
  kind: AmenityKind
  coords: [number, number]
}

export const KIND_LABEL: Record<AmenityKind, string> = {
  cafe: 'Kawiarnia',
  restaurant: 'Restauracja',
  fast_food: 'Na szybko',
  ice_cream: 'Lody',
  playground: 'Plac zabaw',
}

export const AMENITIES: Record<string, AmenitySpot[]> = {
  'zalew-nowohucki': [
    { id: 'zalew-papa-gelato', name: 'Papa Gelato', kind: 'ice_cream', coords: [20.05104, 50.08127] },
    { id: 'zalew-szesze', name: 'Szesze truck', kind: 'fast_food', coords: [20.04997, 50.08065] },
    { id: 'zalew-conieco', name: 'Conieco', kind: 'fast_food', coords: [20.05003, 50.08063] },
    { id: 'zalew-coco', name: 'Coco Mexico', kind: 'fast_food', coords: [20.04989, 50.08067] },
    { id: 'zalew-plac-polnoc', name: 'Plac zabaw przy północnym brzegu', kind: 'playground', coords: [20.05213, 50.08138] },
    { id: 'zalew-plac-wschod', name: 'Plac zabaw od wschodu', kind: 'playground', coords: [20.0559, 50.08221] },
  ],
  blonia: [
    { id: 'trattoria-cichy-k-cik-0', name: "Trattoria Cichy Kącik", kind: 'restaurant', coords: [19.90426, 50.06283] }, // w parku
    { id: 'bistro-b-onia-1', name: "Bistro Błonia", kind: 'restaurant', coords: [19.9057, 50.06239] }, // w parku
    { id: 'sobremesa-2', name: "Sobremesa", kind: 'restaurant', coords: [19.90818, 50.06207] }, // w parku
    { id: 'gospoda-na-piastowskie-3', name: "Gospoda na Piastowskiej", kind: 'restaurant', coords: [19.90227, 50.06334] }, // w parku
    { id: 'pino-garden-4', name: "PINO Garden", kind: 'restaurant', coords: [19.9058, 50.05818] }, // w parku
    { id: 'koma-5', name: "Koma", kind: 'restaurant', coords: [19.908, 50.05668] }, // 40 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.90681, 50.06221] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.90161, 50.06382] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.90242, 50.06366] }, // w parku
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.90883, 50.05656] }, // 51 m od granicy
  ],
  'skawina-blonia': [
    { id: 'play-1', name: "Park Energii", kind: 'playground', coords: [19.81728, 49.97104] }, // w parku
  ],
  'kopiec-kosciuszki': [
    { id: 'panorama-0', name: "Panorama", kind: 'cafe', coords: [19.89413, 50.0556] }, // 19 m od granicy
    { id: 'bastion-cafe-1', name: "Bastion Cafe", kind: 'cafe', coords: [19.89428, 50.05424] }, // 21 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.89382, 50.05409] }, // 35 m od granicy
  ],
  'kopiec-pilsudskiego': [
    { id: 'play-1', name: "Skwer Antosia Petrykiewicza", kind: 'playground', coords: [19.84514, 50.05986] }, // 68 m od granicy
  ],
  'las-wolski': [
    { id: 'mech-0', name: "Mech", kind: 'cafe', coords: [19.85161, 50.05218] }, // w parku
    { id: 'franciszk-wka-1', name: "Franciszkówka", kind: 'restaurant', coords: [19.85431, 50.05493] }, // w parku
    { id: 'play-1', name: "Skwer Antosia Petrykiewicza", kind: 'playground', coords: [19.84514, 50.05986] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.84924, 50.05216] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.8514, 50.05206] }, // w parku
  ],
  'laki-nowohuckie': [
    { id: 'przestrzenie-nowohucki-0', name: "Przestrzenie Nowohuckie & Gruba buła", kind: 'restaurant', coords: [20.03457, 50.07025] }, // 36 m od granicy
    { id: 'ancafe-1', name: "Łancafe", kind: 'cafe', coords: [20.03726, 50.07011] }, // 60 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [20.04298, 50.06602] }, // 41 m od granicy
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [20.04271, 50.0661] }, // 45 m od granicy
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [20.02985, 50.0691] }, // 49 m od granicy
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [20.03365, 50.07083] }, // 51 m od granicy
  ],
  mlynowka: [
    { id: 'tazza-kebab-0', name: "Tazza Kebab", kind: 'fast_food', coords: [19.88856, 50.07733] }, // 62 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.89316, 50.07497] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.89164, 50.07705] }, // 69 m od granicy
  ],
  'ogrod-botaniczny': [
    { id: 'milin-cafe-0', name: "Milin Cafe", kind: 'cafe', coords: [19.95615, 50.06373] }, // w parku
    { id: 'prego-1', name: "Prego", kind: 'cafe', coords: [19.96047, 50.06395] }, // 90 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.96065, 50.06355] }, // 115 m od granicy
  ],
  aleksandry: [
    { id: 'sztuka-mi-sa-i-nie-tyl-0', name: "Sztuka Mięsa i Nie Tylko", kind: 'fast_food', coords: [20.01225, 50.01296] }, // 27 m od granicy
    { id: 'pepe-pizza-1', name: "PePe pizza", kind: 'restaurant', coords: [20.01201, 50.01582] }, // 52 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [20.01445, 50.01321] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [20.01465, 50.01304] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [20.01495, 50.01158] }, // w parku
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [20.01497, 50.01175] }, // w parku
  ],
  bednarskiego: [
    { id: 'mech-cafe-0', name: "Mech Cafe", kind: 'cafe', coords: [19.94837, 50.04168] }, // w parku
    { id: 'pokusa-1', name: "Pokusa", kind: 'restaurant', coords: [19.94845, 50.04307] }, // 33 m od granicy
    { id: 'fika-2', name: "Fika", kind: 'cafe', coords: [19.94813, 50.04319] }, // 59 m od granicy
    { id: 'cafe-lukier-3', name: "Cafe Lukier", kind: 'cafe', coords: [19.9499, 50.04376] }, // 96 m od granicy
    { id: 'zapiekanki-z-pieca-4', name: "zapiekanki z pieca", kind: 'fast_food', coords: [19.94653, 50.04322] }, // 98 m od granicy
    { id: 'parkowa-food-chill-out-5', name: "Parkowa | Food & Chill Out", kind: 'restaurant', coords: [19.95107, 50.04019] }, // 98 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.95035, 50.04133] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.95032, 50.04306] }, // 42 m od granicy
  ],
  decjusza: [
    { id: 'buczek-0', name: "Buczek", kind: 'ice_cream', coords: [19.87481, 50.06576] }, // 14 m od granicy
    { id: 'pizzeria-bella-antonin-1', name: "Pizzeria Bella Antonina", kind: 'restaurant', coords: [19.87055, 50.06421] }, // 29 m od granicy
    { id: 'villa-decius-2', name: "Villa Decius", kind: 'restaurant', coords: [19.87169, 50.06357] }, // 37 m od granicy
    { id: 'pomodorino-ristorante-3', name: "Pomodorino Ristorante", kind: 'restaurant', coords: [19.87504, 50.06559] }, // 39 m od granicy
    { id: 'gospoda-na-woli-4', name: "Gospoda na Woli", kind: 'restaurant', coords: [19.87503, 50.06622] }, // 51 m od granicy
    { id: 'portobello-5', name: "Portobello", kind: 'restaurant', coords: [19.87554, 50.06564] }, // 68 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.87243, 50.06585] }, // w parku
  ],
  duchacki: [
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.96684, 50.02109] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.96538, 50.02011] }, // 22 m od granicy
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.96838, 50.02183] }, // 118 m od granicy
  ],
  grzegorzecki: [
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.96541, 50.05572] }, // 43 m od granicy
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.96413, 50.05568] }, // 106 m od granicy
  ],
  'jalu-kurka': [
    { id: 'kraft-kebab-0', name: "Kraft Kebab", kind: 'fast_food', coords: [19.94351, 50.06989] }, // 26 m od granicy
    { id: 'cinnalove-1', name: "Cinnalove", kind: 'cafe', coords: [19.94348, 50.0698] }, // 29 m od granicy
    { id: 'soltan-kebab-2', name: "Soltan Kebab", kind: 'fast_food', coords: [19.94346, 50.06972] }, // 31 m od granicy
    { id: 'pokusa-lunch-bar-3', name: "Pokusa Lunch Bar", kind: 'fast_food', coords: [19.94356, 50.07012] }, // 35 m od granicy
    { id: 'punkt-4', name: "Punkt", kind: 'cafe', coords: [19.94359, 50.07025] }, // 46 m od granicy
    { id: 'ali-baba-5', name: "Ali Baba", kind: 'fast_food', coords: [19.94351, 50.07031] }, // 49 m od granicy
  ],
  jerzmanowskich: [
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.99486, 50.01768] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.99429, 50.01728] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.99436, 50.0174] }, // w parku
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.99815, 50.02048] }, // 53 m od granicy
  ],
  'park-jordana': [
    { id: 'organic-coffee-more-0', name: "Organic Coffee & more", kind: 'cafe', coords: [19.91932, 50.06085] }, // w parku
    { id: 'sto-wka-nawojka-1', name: "Stołówka Nawojka", kind: 'fast_food', coords: [19.9189, 50.06489] }, // 47 m od granicy
    { id: 'strefa-park-2', name: "Strefa Park", kind: 'cafe', coords: [19.91436, 50.06519] }, // 61 m od granicy
    { id: 'ris-bar-3', name: "RiS-Bar", kind: 'fast_food', coords: [19.91807, 50.06495] }, // 80 m od granicy
    { id: 'diamond-kebab-4', name: "Diamond Kebab", kind: 'fast_food', coords: [19.91326, 50.06557] }, // 92 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.91311, 50.06169] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.91662, 50.06126] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.91568, 50.06484] }, // w parku
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.91551, 50.06402] }, // w parku
  ],
  krakowski: [
    { id: 'kebab-cezar-0', name: "Kebab Cezar", kind: 'fast_food', coords: [19.92586, 50.06928] }, // w parku
    { id: 'bar-przygoda-1', name: "Bar Przygoda", kind: 'fast_food', coords: [19.92403, 50.06932] }, // w parku
    { id: 's-odko-i-czule-2', name: "Słodko i czule", kind: 'cafe', coords: [19.92353, 50.06951] }, // 19 m od granicy
    { id: 'spodek-3', name: "Spodek", kind: 'cafe', coords: [19.92267, 50.06657] }, // 21 m od granicy
    { id: 'bococa-bistro-4', name: "Bococa Bistro", kind: 'restaurant', coords: [19.92602, 50.06975] }, // 43 m od granicy
    { id: 'curry-box-indian-food-5', name: "Curry box Indian food", kind: 'fast_food', coords: [19.92701, 50.06936] }, // 77 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.92366, 50.06791] }, // w parku
  ],
  krowoderski: [
    { id: 'kfc-0', name: "KFC", kind: 'fast_food', coords: [19.92208, 50.09136] }, // 77 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.91973, 50.08835] }, // w parku
  ],
  kurdwanow: [
    { id: 'moza-kebab-0', name: "Moza Kebab", kind: 'fast_food', coords: [19.95568, 50.01076] }, // 24 m od granicy
    { id: 'byczek-kebab-1', name: "Byczek Kebab", kind: 'fast_food', coords: [19.95374, 50.00956] }, // 26 m od granicy
    { id: 'icy-2', name: "Icy", kind: 'ice_cream', coords: [19.95556, 50.01075] }, // 29 m od granicy
    { id: 'p-serio-3', name: "Pół Serio", kind: 'cafe', coords: [19.95629, 50.01068] }, // 31 m od granicy
    { id: 'hola-kurczak-4', name: "hOla Kurczak", kind: 'restaurant', coords: [19.9536, 50.00957] }, // 32 m od granicy
    { id: 'gohan-burger-5', name: "Gohan Burger", kind: 'fast_food', coords: [19.95361, 50.00951] }, // 36 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.95495, 50.01022] }, // w parku
    { id: 'play-2', name: "Smoczy Skwer", kind: 'playground', coords: [19.95661, 50.01022] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.9591, 50.01069] }, // 40 m od granicy
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.96032, 50.0111] }, // 103 m od granicy
  ],
  witkowice: [
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.94518, 50.10735] }, // w parku
  ],
  'lilli-wenedy': [
    { id: 'zapiekanki-0', name: "Zapiekanki", kind: 'fast_food', coords: [20.00435, 50.01857] }, // 64 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [20.00123, 50.01921] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [20.00631, 50.02116] }, // 30 m od granicy
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [20.00553, 50.01933] }, // 81 m od granicy
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [20.00514, 50.01866] }, // 94 m od granicy
  ],
  lotnikow: [
    { id: 'malediva-cafe-bar-0', name: "Malediva Cafe Bar", kind: 'cafe', coords: [19.99539, 50.06695] }, // w parku
    { id: 'wieczykanka-1', name: "Wieczykanka", kind: 'fast_food', coords: [19.98537, 50.07351] }, // 35 m od granicy
    { id: 'czekaj-na-mnie-pod-jab-2', name: "Czekaj na mnie pod jabłonią", kind: 'restaurant', coords: [19.99324, 50.06566] }, // 55 m od granicy
    { id: 'pierogi-3', name: "Pierogi", kind: 'fast_food', coords: [19.99405, 50.07467] }, // 80 m od granicy
    { id: 'arena-smak-w-4', name: "Arena Smaków", kind: 'cafe', coords: [19.98708, 50.07005] }, // 84 m od granicy
    { id: 'norma-5', name: "Norma", kind: 'restaurant', coords: [19.99476, 50.0749] }, // 106 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.9904, 50.07132] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.99323, 50.07014] }, // w parku
    { id: 'play-3', name: "Smoczy Skwer", kind: 'playground', coords: [19.99558, 50.06796] }, // w parku
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.9983, 50.06855] }, // w parku
  ],
  'macka-i-doroty': [
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.91039, 50.00235] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.91508, 50.00208] }, // w parku
    { id: 'play-3', name: "Smoczy skwer", kind: 'playground', coords: [19.91411, 50.00195] }, // w parku
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.91485, 50.0021] }, // w parku
  ],
  'skawina-pilsudskiego': [
    { id: 'biesiadowo-0', name: "Biesiadowo", kind: 'fast_food', coords: [19.82472, 49.97574] }, // 76 m od granicy
    { id: 'kinder-club-cafe-1', name: "Kinder Club & Cafe", kind: 'cafe', coords: [19.81805, 49.97582] }, // 83 m od granicy
    { id: 'kebab-2', name: "Kebab", kind: 'fast_food', coords: [19.82448, 49.97595] }, // 89 m od granicy
    { id: 'restauracja-stek-3', name: "Restauracja Stek", kind: 'restaurant', coords: [19.82135, 49.97607] }, // 107 m od granicy
    { id: 'pan-steskal-4', name: "Pan Steskal", kind: 'cafe', coords: [19.82573, 49.97468] }, // 111 m od granicy
    { id: 'mood-5', name: "Mood", kind: 'cafe', coords: [19.82507, 49.97354] }, // 113 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.82016, 49.97486] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.82275, 49.97342] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.82161, 49.97492] }, // 26 m od granicy
  ],
  ratuszowy: [
    { id: 'joker-food-friends-0', name: "Joker Food & Friends", kind: 'fast_food', coords: [20.04077, 50.07437] }, // 52 m od granicy
    { id: 'stylowa-1', name: "Stylowa", kind: 'restaurant', coords: [20.03788, 50.0747] }, // 62 m od granicy
    { id: 'nowa-2', name: "Nowa", kind: 'cafe', coords: [20.03804, 50.07631] }, // 69 m od granicy
    { id: 'zgoda-3', name: "Zgoda", kind: 'cafe', coords: [20.038, 50.07608] }, // 81 m od granicy
    { id: 'good-lood-4', name: "Good Lood", kind: 'ice_cream', coords: [20.03764, 50.07426] }, // 110 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [20.04112, 50.07391] }, // 109 m od granicy
  ],
  reduta: [
    { id: 'zielone-k-ty-0', name: "Zielone Kąty", kind: 'cafe', coords: [19.98672, 50.09636] }, // w parku
    { id: 'zielone-k-ty-1', name: "Zielone Kąty", kind: 'ice_cream', coords: [19.98668, 50.09647] }, // w parku
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.98746, 50.09659] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.98573, 50.09686] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.98303, 50.09467] }, // 80 m od granicy
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.98092, 50.09485] }, // 110 m od granicy
  ],
  rzaka: [
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [20.00845, 50.00829] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [20.00856, 50.00843] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [20.00979, 50.00792] }, // 25 m od granicy
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [20.00503, 50.00622] }, // 88 m od granicy
  ],
  solvay: [
    { id: 'good-lood-0', name: "Good Lood", kind: 'ice_cream', coords: [19.92741, 50.01927] }, // 60 m od granicy
    { id: 'pizzeria-rewolucja-1', name: "Pizzeria Rewolucja", kind: 'fast_food', coords: [19.92545, 50.01918] }, // 114 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.92315, 50.01621] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.92373, 50.01638] }, // 18 m od granicy
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.92528, 50.01584] }, // 20 m od granicy
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.91871, 50.014] }, // 120 m od granicy
  ],
  'stacja-wisla': [
    { id: 'nostra-napoletana-0', name: "Nostra Napoletana", kind: 'restaurant', coords: [19.95991, 50.05057] }, // w parku
    { id: 'talerz-1', name: "Talerz", kind: 'restaurant', coords: [19.95954, 50.05026] }, // 25 m od granicy
    { id: 'somnium-2', name: "Somnium", kind: 'cafe', coords: [19.95883, 50.05008] }, // 27 m od granicy
    { id: 'la-baguette-3', name: "La Baguette", kind: 'cafe', coords: [19.96007, 50.05036] }, // 32 m od granicy
    { id: 'flame-69-4', name: "Flame 69", kind: 'cafe', coords: [19.95986, 50.05031] }, // 41 m od granicy
    { id: 'hankki-5', name: "Hankki", kind: 'restaurant', coords: [19.95914, 50.04981] }, // 64 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.95939, 50.05085] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.96009, 50.05107] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.95922, 50.0501] }, // 38 m od granicy
  ],
  strzelecki: [
    { id: 'tawerna-la-capitana-0', name: "Tawerna La Capitana", kind: 'restaurant', coords: [19.95017, 50.06714] }, // 4 m od granicy
    { id: 'u-szwagra-1', name: "U Szwagra", kind: 'fast_food', coords: [19.94999, 50.06718] }, // 10 m od granicy
    { id: 'italianissimo-2', name: "Italianissimo", kind: 'fast_food', coords: [19.95009, 50.06511] }, // 15 m od granicy
    { id: 'stacja-bosacka-3', name: "Stacja Bosacka", kind: 'fast_food', coords: [19.9501, 50.06741] }, // 17 m od granicy
    { id: 'z-w-och-do-polski-4', name: "Z Włoch do Polski", kind: 'fast_food', coords: [19.9515, 50.06719] }, // 47 m od granicy
    { id: 'individual-5', name: "Individual", kind: 'cafe', coords: [19.94954, 50.0646] }, // 51 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.94882, 50.06402] }, // 120 m od granicy
  ],
  szwedzki: [
    { id: 'bar-orientalny-0', name: "Bar Orientalny", kind: 'restaurant', coords: [20.04236, 50.07413] }, // w parku
    { id: 'banolli-1', name: "Banolli", kind: 'restaurant', coords: [20.04189, 50.07373] }, // 44 m od granicy
    { id: 'pizza-point-2', name: "Pizza Point", kind: 'fast_food', coords: [20.04644, 50.07491] }, // 48 m od granicy
    { id: 'furiatti-3', name: "Furiatti", kind: 'fast_food', coords: [20.0468, 50.07439] }, // 78 m od granicy
    { id: 'joker-food-friends-4', name: "Joker Food & Friends", kind: 'fast_food', coords: [20.04077, 50.07437] }, // 91 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [20.04364, 50.07565] }, // 68 m od granicy
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [20.04112, 50.07391] }, // 98 m od granicy
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [20.04648, 50.07388] }, // 105 m od granicy
  ],
  tysiaclecia: [
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.99772, 50.09064] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.99821, 50.09212] }, // 36 m od granicy
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.99587, 50.09228] }, // 54 m od granicy
  ],
  szymborskiej: [
    { id: 'green-salad-cafe-0', name: "Green Salad Cafe", kind: 'cafe', coords: [19.9275, 50.06528] }, // 3 m od granicy
    { id: 'molam-thai-canteen-bar-1', name: "Molam Thai Canteen & Bar", kind: 'restaurant', coords: [19.92767, 50.06485] }, // 10 m od granicy
    { id: 'masala-madness-2', name: "Masala Madness", kind: 'fast_food', coords: [19.93054, 50.0658] }, // 22 m od granicy
    { id: 'n-pizza-3', name: "N' Pizza", kind: 'restaurant', coords: [19.92774, 50.06465] }, // 33 m od granicy
    { id: 'ali-baba-4', name: "Ali Baba", kind: 'fast_food', coords: [19.93106, 50.06511] }, // 46 m od granicy
    { id: 'raj-kebab-5', name: "Raj Kebab", kind: 'fast_food', coords: [19.92677, 50.06547] }, // 58 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.93026, 50.06527] }, // 21 m od granicy
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.93016, 50.06526] }, // 29 m od granicy
  ],
  'wisniowy-sad': [
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [20.02671, 50.07624] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [20.02597, 50.07606] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [20.02648, 50.07623] }, // w parku
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [20.02736, 50.07581] }, // w parku
  ],
  wyspianskiego: [
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.92111, 50.08645] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.91948, 50.086] }, // w parku
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.9216, 50.08624] }, // w parku
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.9186, 50.08671] }, // 88 m od granicy
  ],
  'zaczarowanej-dorozki': [
    { id: 'lodove-0', name: "Lodove", kind: 'ice_cream', coords: [19.96669, 50.08844] }, // 96 m od granicy
    { id: 'hallo-pizza-1', name: "Hallo Pizza", kind: 'restaurant', coords: [19.96716, 50.08848] }, // 104 m od granicy
    { id: 'andantino-2', name: "Andantino", kind: 'cafe', coords: [19.96278, 50.08691] }, // 106 m od granicy
    { id: 'muusisz-burgera-3', name: "Muusisz Burgera", kind: 'fast_food', coords: [19.9653, 50.08794] }, // 113 m od granicy
    { id: 'play-1', name: "Plac zabaw", kind: 'playground', coords: [19.9659, 50.08706] }, // w parku
    { id: 'play-2', name: "Plac zabaw", kind: 'playground', coords: [19.96458, 50.08703] }, // 10 m od granicy
    { id: 'play-3', name: "Plac zabaw", kind: 'playground', coords: [19.96652, 50.08608] }, // 60 m od granicy
    { id: 'play-4', name: "Plac zabaw", kind: 'playground', coords: [19.96326, 50.08635] }, // 80 m od granicy
  ],
  zakrzowek: [
    { id: 'caf-zakrz-wek-0', name: "Café Zakrzówek", kind: 'cafe', coords: [19.91304, 50.03505] }, // w parku
  ],
  planty: [
    { id: 'nakielny-0', name: "Nakielny", kind: 'cafe', coords: [19.93456, 50.06009] }, // 6 m od granicy
    { id: 'prosciuttko-1', name: "Prosciuttko", kind: 'fast_food', coords: [19.94105, 50.06039] }, // 6 m od granicy
    { id: 'zalipianki-2', name: "Zalipianki", kind: 'restaurant', coords: [19.93373, 50.06296] }, // 9 m od granicy
    { id: 'katan-3', name: "Katanè", kind: 'cafe', coords: [19.94091, 50.06042] }, // 15 m od granicy
    { id: 'costa-4', name: "Costa", kind: 'cafe', coords: [19.94139, 50.06472] }, // 16 m od granicy
    { id: 'szalone-widelce-5', name: "Szalone Widelce", kind: 'restaurant', coords: [19.94227, 50.06439] }, // 17 m od granicy
  ],
  'planty-bienczyckie': [
    { id: 'lodowa-hatka-nowa-huta-0', name: "Lodowa Hatka Nowa Huta", kind: 'ice_cream', coords: [20.02091, 50.08767] }, // 20 m od granicy
    { id: 'sigma-1', name: "Sigma", kind: 'fast_food', coords: [20.0198, 50.08783] }, // 23 m od granicy
  ],
  bagry: [
    { id: 'tawerna-horn-0', name: "Tawerna Horn", kind: 'restaurant', coords: [19.99554, 50.033] }, // w parku
    { id: 'good-lood-bagry-1', name: "Good Lood Bagry", kind: 'ice_cream', coords: [19.99477, 50.03308] }, // 15 m od granicy
    { id: 'frytki-belgijskie-2', name: "Frytki Belgijskie", kind: 'fast_food', coords: [19.99541, 50.03393] }, // 36 m od granicy
  ],
}

export const amenitiesFor = (parkId: string) => AMENITIES[parkId] ?? []
export const isFood = (k: AmenityKind) => k !== 'playground'

/**
 * Opinie i zdjęcia lokalu w Google.
 *
 * Nie ściągamy tych zdjęć do siebie: Places API wymaga klucza z billingiem (a klucz
 * w statycznej PWA jest publiczny) i zabrania trzymania zdjęć u siebie. Jedno
 * dotknięcie do galerii Google jest tanie, legalne i pokazuje więcej niż
 * kiedykolwiek zmieścilibyśmy na karcie. Współrzędne w zapytaniu, bo sama nazwa
 * trafia w inny lokal tej samej sieci.
 */
export const reviewsUrl = (name: string, [lng, lat]: [number, number]) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${lat},${lng}`)}`

/** walking directions to a spot */
export const walkUrl = ([lng, lat]: [number, number]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`

/* ── Co to za miejsce ─────────────────────────────────────────────────────────
 * Dane leżą w amenity-details.ts (generowane z OSM). Tutaj tylko czytanie ich
 * tak, żeby dało się je pokazać człowiekowi.
 */

const DAYS: Record<string, string> = {
  Mo: 'pn', Tu: 'wt', We: 'śr', Th: 'cz', Fr: 'pt', Sa: 'sb', Su: 'nd',
}

/**
 * `opening_hours` z OSM czyta się jak kod: „Mo-Su 12:00-23:30". Tłumaczymy na
 * polski i skracamy do dwóch członów, bo w karcie jest jedna linijka.
 */
export function fmtHours(raw: string): string {
  if (/^24\/7$/.test(raw.trim())) return 'całą dobę'
  const parts = raw.split(';').map((s) => s.trim()).filter(Boolean)
  const nice = parts.slice(0, 2).map((part) =>
    part
      .replace(/\bMo-Su\b/, 'codziennie')
      .replace(/\bMo-Fr\b/, 'pn–pt')
      .replace(/\bSa-Su\b/, 'weekend')
      .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/g, (d) => DAYS[d] ?? d)
      // zakres dni też z półpauzą, żeby nie wyglądał jak dywiz w kodzie
      .replace(/(pn|wt|śr|cz|pt|sb|nd)-(pn|wt|śr|cz|pt|sb|nd)/g, '$1–$2')
      .replace(/(\d{2}:\d{2})-(\d{2}:\d{2})/g, '$1–$2')
      .replace(/\boff\b/, 'zamknięte')
      .replace(/:00/g, ''),
  )
  return nice.join(', ') + (parts.length > 2 ? '…' : '')
}

/*
 * Zastrzeżenia jednego miejsca („plac przy restauracji, dla klientów") nie mogą
 * opisywać całego parku. Na kaflu pokazujemy tylko cechy, które da się
 * zobaczyć na miejscu; dostęp i udogodnienia zostają w wierszu i na karcie.
 */
const SKIP_ON_TILE = new Set(['dla klientów', 'prywatny', 'wózki ok', 'oświetlony'])

/**
 * Najczęstsze cechy miejsc danego typu w parku, na kafel w karcie parku:
 * „6 miejsc · pizza, ogródek". Bez zgadywania: jeśli nic nie wiemy, nic nie ma.
 */
export function topChips(parkId: string, food: boolean, limit = 2): string[] {
  const count = new Map<string, number>()
  for (const s of amenitiesFor(parkId)) {
    if (isFood(s.kind) !== food) continue
    for (const c of detailFor(parkId, s.id)?.chips ?? []) {
      if (SKIP_ON_TILE.has(c)) continue
      count.set(c, (count.get(c) ?? 0) + 1)
    }
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([c]) => c)
}
