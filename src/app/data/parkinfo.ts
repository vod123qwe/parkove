// Park pages: what the place is, why go, and the two amenities that decide a
// family Saturday (playground, coffee/food). Curated per park, pilots first.
// `verified: false` means the amenity is inferred from OSM and needs a real visit.

export type ParkInfo = {
  /** hero photo, then the gallery */
  photos?: Array<{ src: string; credit?: string }>
  /** why go there, 2-3 paragraphs */
  description?: string[]
  amenities?: {
    /** playground row: is there one, plus a short line about it */
    playground?: { has: boolean; note: string }
    /** cafe or restaurant in the park or right by the entrance */
    food?: { has: boolean; note: string }
    /** false until checked on site */
    verified?: boolean
  }
}

export const PARK_INFO: Record<string, ParkInfo> = {
  miechow: {
    photos: [
      { src: '/photos/miechow-dworek-a.jpg', credit: 'Fot. Januszk57 · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/miechow-dworek-c.jpg', credit: 'Fot. Januszk57 · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/miechow-dworek-b.jpg', credit: 'Fot. Januszk57 · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/miechow-miasto.jpg', credit: 'Fot. Adam Maś · CC BY-SA 3.0 · Wikimedia Commons' },
    ],
    description: [
      'Park Miejski w Miechowie, trzydzieści kilometrów na północ od Krakowa, czyli wypad na pół dnia. Dwanaście hektarów po rewitalizacji za dwadzieścia milionów: fontanny, alejki, leżaki, stoły piknikowe, plenerowa biblioteczka i osobno ogrodzony Ogród Zen.',
      'Ciekawsze jest to, czego nie widać. Park leży na terenie dawnego majątku Wielko-Zagórze i to właśnie tutaj kończyły się wyjścia ze średniowiecznych podziemi, które zakonnicy sprowadzeni z Jerozolimy poprowadzili spod klasztoru na skarpie. Badacze szacują ich długość nawet na półtora kilometra.',
      'Sam park istnieje dlatego, że stojącego tu dworu nigdy nie odbudowano po tym, jak spłonął w 1863 roku. Przy jego południowej granicy stoi za to modrzewiowy Dworek Zacisze z 1784 roku, jeden z najcenniejszych drewnianych zabytków w Małopolsce. Bazylika z kopią Grobu Bożego, przez którą Miechów nazywano Polską Jerozolimą, stoi niecały kilometr stąd i jest naturalnym przedłużeniem spaceru.',
    ],
    amenities: {
      food: { has: true, note: 'Kawiarnie i restauracje przy rynku, kilkanaście minut spacerem.' },
      verified: false,
    },
  },
  /* Wyprawa tymczasowa: Costa Vicentina. Usuwana razem z miejscami przez
     scripts/trip-odeceixe.mjs --remove */
  'odeceixe-vila': {
    photos: [
      { src: '/photos/odeceixe-vila-b.jpg', credit: 'Fot. Vítor Oliveira · CC BY-SA 2.0 · Wikimedia Commons' },
      { src: '/photos/odeceixe-vila-a.jpg', credit: 'Fot. Lacobrigo · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/odeceixe-moinho-b.jpg', credit: 'Fot. Geerd-Olaf Freyer · CC BY-SA 2.0 · Wikimedia Commons' },
      { src: '/photos/odeceixe-igreja.jpg', credit: 'Fot. RHaworth · CC BY-SA 3.0 · Wikimedia Commons' },
    ],
    description: [
      'Odeceixe to niecały tysiąc mieszkańców na zboczu nad rzeką Seixe, w Parku Przyrody Południowo-Zachodniego Alentejo i Costa Vicentina. Rzeka pod wsią wyznacza granicę Algarve i Alentejo, więc jest to pierwsza algarvijska wieś, jaką spotyka ktoś idący wybrzeżem z północy.',
      'Chodzi się tu wąskimi uliczkami w górę, do białego młyna wiatrowego z 1898 roku, i w dół, do doliny. Przez wieś przechodzi Rota Vicentina, a lokalny szlak Odeceixe-ao-Rio prowadzi doliną prosto do oceanu, cztery kilometry stąd.',
      'Ta droga na plażę jest właściwym powodem, dla którego warto tu przyjść pieszo. Idąc do wody, powtarzasz spacer, który krajobraz kiedyś komuś wydłużył: na drugim brzegu rzeki leży muszlowisko sprzed pięciu tysięcy lat, a w nim zapis tego, jak ujście odsuwało się od ludzi.',
    ],
    amenities: {
      food: { has: true, note: 'Kilka restauracji i kawiarni w centrum wsi, kuchnia prosta i rybna.' },
      verified: false,
    },
  },
  'odeceixe-foz': {
    photos: [
      { src: '/photos/odeceixe-praia-a.jpg', credit: 'Fot. Vítor Oliveira · CC BY-SA 2.0 · Wikimedia Commons' },
      { src: '/photos/odeceixe-praia-b.jpg', credit: 'Fot. Beeston · CC BY 3.0 · Wikimedia Commons' },
    ],
    description: [
      'Ujście Ribeira de Seixe: plaża zamknięta z obu stron wysokimi klifami, z rzeką po jednej stronie i oceanem po drugiej. Rzeka rozlewa się płytko i spokojnie, ocean daje falę, po którą przyjeżdżają surferzy.',
      'Nad zejściem na plażę stoi Miradouro da Maravilha, punkt widokowy na całe ujście. To stąd najlepiej widać szeroką, płaską dolinę, którą rzeka wypełniła osadami przez tysiące lat.',
      'Tuż za skalnym cyplem na południe leży Praia das Adegas, jedna z niewielu oficjalnie wyznaczonych plaż naturystycznych w Portugalii. Warto o tym wiedzieć, idąc brzegiem z dziećmi.',
    ],
    amenities: {
      food: { has: true, note: 'Sezonowe bary przy zejściu na plażę, poza sezonem bywa zamknięte.' },
      verified: false,
    },
  },
  'zalew-nowohucki': {
    photos: [
      { src: '/photos/park-zalew-nowohucki-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-zalew-nowohucki-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      'Piętnaście hektarów parku wokół siedmiu hektarów wody, w środku Nowej Huty, dwadzieścia minut tramwajem od Rynku. Pętla brzegiem ma dwa i pół kilometra i nadaje się na spacer z wózkiem: asfalt, ławki co kilkadziesiąt metrów i cień od strony wschodniej.',
      'Rzeczy, dla których warto tu przyjechać, są rozłożone wokół wody, więc żadnej nie da się zwiedzić bez obejścia zalewu. Od północy stoi tężnia solankowa, bezpłatna i otwarta bez godzin, obok niej plac zabaw. W północno-zachodnim narożniku jest piasek: cztery boiska do siatkówki plażowej, drugi plac zabaw i food trucki. Na tafli pływają podświetlane fontanny, widoczne z każdego brzegu. Nad wodę wychodzą dwa drewniane pomosty. Od wschodu jest siłownia plenerowa z FlowParkiem i wybieg dla psów.',
      'Kąpieliska tu nie ma i nigdy nie było, więc woda jest do patrzenia. Park założono w 1957 roku, razem z dzielnicą, i do dziś prowadzi go miejski Zarząd Zieleni.',
      'Najciekawsze jest to, czego na pierwszy rzut oka nie widać: ta woda pracowała tu na długo przed hutą. Dłubnia napędzała młyny, a kanał, który do jednego z nich prowadził, nazywa się Młynówka i wciąż jest na mapie. Nad zalewem stoją jeszcze ruiny młyna, a kawałek dalej dworek, w którym mieszkał Jan Matejko.',
    ],
    amenities: {
      playground: { has: true, note: 'Dwa place zabaw przy wodzie, cztery piaskowe boiska do siatkówki, siłownia plenerowa i FlowPark od wschodu.' },
      food: { has: true, note: 'Food trucki w północno-zachodnim narożniku (Huta Wita Food Truck Park), lody i kilka bud przy samym brzegu.' },
      verified: false,
    },
  },

  blonia: {
    photos: [
      { src: '/photos/park-blonia-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Czterdzieści osiem hektarów łąki w środku miasta, dwadzieścia minut od Rynku. Największa taka przestrzeń w Polsce i jedyne miejsce w Krakowie, gdzie stajesz na trawie i nie masz przed sobą żadnego budynku.",
      "Błonia należą do miasta od 1366 roku, gdy klasztor Norbertanek oddał je w zamian za kamienicę. Przez wieki pasły się tu krowy, a prawo wypasu obowiązywało jeszcze w XX wieku.",
      "Dziś to scena największych wydarzeń w mieście: koncertów, mszy papieskich i festiwali. Zimą Błonia zamieniają się w najbardziej demokratyczny stok w Krakowie, na którym zjeżdża się na czym kto ma.",
    ],
    amenities: {
      playground: { has: true, note: "Place zabaw przy wschodniej i zachodniej krawędzi łąki, blisko wejść od Piastowskiej i 3 Maja." },
      food: { has: true, note: "Restauracje i bistra po stronie Cichego Kącika oraz przy al. 3 Maja." },
      verified: false,
    },
  },
  'skawina-pilsudskiego': {
    photos: [
      { src: '/photos/park-skawina-miejski.jpg', credit: "Fot. Januszk57 · CC BY-SA 3.0 pl · Wikimedia Commons" },
      // pomnik Kazimierza Wielkiego: stał podpisany jako Błonia, a jest tutaj
      { src: '/photos/park-skawina-pilsudskiego-2.jpg', credit: "Fot. Januszk57 · CC BY-SA 3.0 pl · Wikimedia Commons" },
    ],
    description: [
      "Park kieszonkowy w najlepszym sensie: dwa i pół hektara w samym centrum Skawiny, trzy minuty od rynku. Założony w 1927 roku, nosi imię marszałka Piłsudskiego.",
      "Rośnie tu około sześćdziesięciu gatunków drzew, a najstarszy dąb jest pomnikiem przyrody i stał tu, zanim ktokolwiek pomyślał o parku. Alejki są asfaltowe, więc jedźdą po nich wózki i rolki, a w środku stoi amfiteatr na miejskie koncerty.",
      "Od północy park zamyka budynek Towarzystwa Gimnastycznego „Sokół” z 1906 roku, dziś Centrum Kultury i Sportu, z pomnikiem Kazimierza Wielkiego przed wejściem. Od strony rzeki zostało stare zakole Skawinki: najdzikszy fragment parku, z wodą i ptakami.",
    ],
    amenities: {
      playground: { has: true, note: "Dwa place zabaw w środku parku." },
      food: { has: true, note: "Kinder Club & Cafe, Pan Steskal i Mood w kilku krokach od granicy parku." },
      verified: false,
    },
  },
  'skawina-blonia': {
    /*
     * Zdjęcie nie jest z Commons: Wikimedia nie ma ani jednej fotografii Błoń.
     * To kadr Jarosława Karasińskiego z dobrefotografie.pl, wskazany przez Jarka,
     * użyty z widocznym podpisem, ale BEZ wolnej licencji. Do wymiany, gdy
     * będzie własne zdjęcie z wyprawy albo pisemna zgoda autora.
     * źródło: https://dobrefotografie.pl (Skawina, ścieżka rekreacyjna, 2020-09-16)
     */
    photos: [
      {
        src: '/photos/park-skawina-blonia-1.jpg',
        credit: 'Fot. Jarosław Karasiński · dobrefotografie.pl',
      },
    ],
    description: [
      "Błonia Skawińskie to zielona przestrzeń na skraju miasta, blisko starorzecza Skawinki. Sześć hektarów łąk i alejek, które lokalnie pełnią rolę i parku, i terenu rekreacyjnego.",
      "Największy atut to otwarta przestrzeń i widok na dolinę rzeki, rzadki w gęsto zabudowanej Skawinie. Wiosną łąki się zielenią, a nad wodą pojawiają się ptaki.",
      "Dobre uzupełnienie wyprawy do Parku Miejskiego: oba miejsca dzieli kwadrans spacerem, a charakter mają zupełnie inny.",
    ],
    amenities: {
      playground: { has: true, note: "Park Energii ze strefą zabaw i urządzeniami plenerowymi." },
      food: { has: false, note: "Bez gastronomii na łąkach. Najbliżej: rynek w Skawinie." },
      verified: false,
    },
  },
  'kopiec-kosciuszki': {
    photos: [
      { src: '/photos/park-kopiec-kosciuszki-1.jpg', credit: "Fot. Dariusz.Biegacz · CC BY-SA 4.0 · Wikimedia Commons" },
      { src: '/photos/park-kopiec-kosciuszki-2.jpg', credit: "Fot. Dariusz.Biegacz · CC BY-SA 4.0 · Wikimedia Commons" },
    ],
    description: [
      "Najbardziej okazały z krakowskich kopców: trzydzieści cztery metry ziemi na wzgórzu świętej Bronisławy, usypane w latach 1820-23 w hołdzie Tadeuszowi Kościuszce. Ziemię przywożono z pól bitewnych, także z Ameryki.",
      "Austriacy otoczyli kopiec fortem, który dziś nadaje mu wygląd cytadeli i mieści hotel, restaurację oraz muzeum. Na szczyt prowadzi spiralna ścieżka, a widok obejmuje całe miasto, a przy dobrej pogodzie Tatry.",
      "To jedyny kopiec z biletem wstępu i jedyny, na którym zjesz obiad z widokiem na Wawel. Wieczorem podświetlony fort widać z drugiego brzegu Wisły.",
    ],
    amenities: {
      playground: { has: false, note: "Bez placu zabaw, ale dojście od Woli Justowskiej prowadzi przez las." },
      food: { has: true, note: "Bastion Cafe i restauracja Panorama w murach fortu, tuż przy wejściu." },
      verified: false,
    },
  },
  'park-jordana': {
    photos: [
      { src: '/photos/park-park-jordana-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-park-jordana-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park, od którego wzięły nazwę wszystkie ogrody jordanowskie w Polsce. Doktor Henryk Jordan założył go w 1889 roku na terenie wystawy rolniczo-przemysłowej i od początku był to park do ruchu, nie do spacerów: boiska, przyrządy gimnastyczne i place do zabaw. Jordan sam ustalał plan zajęć, dobierał przewodników grup i prowadził pogadanki o historii Polski.",
      "Pomysł skopiowały Sanok, Jarosław, Lwów, Nowy Sącz, Tarnopól i Warszawa, a nazwa przylgnęła do wszystkich takich miejsc. Dziś „ogródek jordanowski” to zwykłe polskie słowo na plac zabaw i niewielu pamięta, że pochodzi od nazwiska krakowskiego lekarza.",
      "Na dwudziestu jeden hektarach jest wszystko, czym park miał być: boiska do siatkówki, piłki i koszykówki, skatepark, wodny plac zabaw, miasteczko ruchu drogowego dla dzieci, staw, górka na sanki i muszla koncertowa. Wzdłuż alei stoi kilkadziesiąt marmurowych popiersi sławnych Polaków: w czasie wojny uratował je Kazimierz Łuczywo, ukrywając w swojej pracowni.",
    ],
    amenities: {
      playground: { has: true, note: "Kilka placów zabaw, do tego wodny plac zabaw i miasteczko ruchu drogowego." },
      food: { has: true, note: "Organic Coffee & more w parku, a przy Reymonta bary i stołówki studenckie." },
      verified: false,
    },
  },
  'kopiec-krakusa': {
    photos: [
      { src: '/photos/park-kopiec-krakusa-2.jpg', credit: "Fot. Dawid Galus · CC BY-SA 3.0 pl · Wikimedia Commons" },
    ],
  },
  'kopiec-pilsudskiego': {
    photos: [
      { src: '/photos/park-kopiec-pilsudskiego-1.jpg', credit: "Fot. Dawid Galus · CC BY-SA 3.0 pl · Wikimedia Commons" },
    ],
    description: [
      "Najwyższy kopiec w Polsce: trzydzieści pięć metrów na szczycie wzgórza Sowiniec, w środku Lasu Wolskiego. Nosi też nazwę Mogiła Mogił, bo zsypywano tu ziemię z pól bitewnych, na których walczyli Polacy.",
      "Budowę prowadził w latach trzydziestych Związek Legionistów, a pracowali przy niej ochotnicy z całego kraju. Po wojnie władze próbowały wymazać kopiec z pamięci, uratowały go czyny społeczne mieszkańców.",
      "Dojście z Woli Justowskiej albo od zoo zajmuje pół godziny w górę. Ze szczytu widać panoramę od Tatr po kominy Nowej Huty.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw przy Skwerze Antosia Petrykiewicza, po drodze z Woli Justowskiej." },
      food: { has: false, note: "Bez gastronomii na szczycie. Najbliżej: kawiarnia Mech i Franciszkówka w Lesie Wolskim." },
      verified: false,
    },
  },
  'kopiec-wandy': {
    photos: [
      { src: '/photos/park-kopiec-wandy-1.jpg', credit: "Fot. Mach240390 · CC BY-SA 3.0 · Wikimedia Commons" },
      { src: '/photos/park-kopiec-wandy-2.jpg', credit: "Fot. Mach240390 · CC BY-SA 3.0 · Wikimedia Commons" },
    ],
    description: [
      "Najstarszy zabytek Nowej Huty, starszy od niej o kilkanaście wieków. Kopiec ma czternaście metrów i według legendy skrywa grób Wandy, córki Kraka, która wolała utopić się w Wiśle niż wyjść za niemieckiego księcia.",
      "Stoi na terenie dawnej wsi Mogiła, obok opactwa Cystersów, dziś w cieniu kombinatu. Ze szczytu widać oba światy Nowej Huty naraz: dwunastowieczny klasztor i przemysłowe kominy.",
      "Kopiec tworzy parę z Kopcem Krakusa po drugiej stronie miasta. Linia między nimi celuje w punkt wschodu słońca na początku maja, co od lat karmi teorie o pogańskim kalendarzu.",
    ],
    amenities: {
      playground: { has: false, note: "Kopiec stoi na łące bez infrastruktury. Place zabaw są w osiedlach Nowej Huty." },
      food: { has: false, note: "Bez gastronomii pod kopcem. Najbliżej: okolice Placu Centralnego." },
      verified: false,
    },
  },
  'las-wolski': {
    photos: [
      { src: '/photos/park-las-wolski-2.jpg', credit: "Fot. Mateusz Giełczyński · CC BY-SA 4.0 · Wikimedia Commons" },
    ],
    description: [
      "Największy las miejski w Polsce: ponad czterysta hektarów, czterdzieści kilometrów ścieżek i cztery wzgórza, w tym Srebrna Góra z klasztorem Kamedułów. Miasto kupiło go w 1917 roku, żeby zrobić z niego park ludowy.",
      "W środku lasu mieszczą się ogród zoologiczny, Kopiec Piłsudskiego i rezerwat Panieńskie Skały. Na polanach stoją stoły piknikowe, a między drzewami chodzą sarny i dziki, całkiem obojętne na spacerowiczów.",
      "Na wyprawę trzeba tu przyjechać z zapasem czasu: przejście z jednego końca na drugi zajmuje ponad dwie godziny, a różnice wysokości sięgają stu metrów.",
    ],
    amenities: {
      playground: { has: true, note: "Place zabaw przy polanach i przy wejściu od strony zoo." },
      food: { has: true, note: "Kawiarnia Mech i Franciszkówka w środku lasu, dodatkowo gastronomia przy zoo." },
      verified: false,
    },
  },
  'lasek-mogilski': {
    photos: [
      { src: '/photos/park-lasek-mogilski-1.jpg', credit: "Fot. Zygmunt Put Zetpe0202 · CC BY-SA 4.0 · Wikimedia Commons" },
      { src: '/photos/park-lasek-mogilski-2.jpg', credit: "Fot. Zygmunt Put Zetpe0202 · CC BY-SA 4.0 · Wikimedia Commons" },
    ],
    description: [
      "Dwadzieścia sześć hektarów lasu przy Mogile, jeden z niewielu prawdziwych lasów w prawobrzeżnym Krakowie. Rosną tu dęby, brzozy i sosny, a runo ma leśny, nie parkowy charakter.",
      "Ścieżki są gruntowe i poplątane, więc łatwo znaleźć fragment, w którym nikogo nie ma. Blisko stąd do opactwa Cystersów i kopca Wandy, więc wyprawę można łatwo wydłużyć.",
      "To dobre miejsce na spacer w ciszy, jeśli nie masz ochoty jechać przez pół miasta do Lasu Wolskiego.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw przy wejściu od strony osiedla Mogiła." },
      food: { has: false, note: "Bez gastronomii w lasku. Najbliżej: lokale przy ul. Klasztornej." },
      verified: false,
    },
  },
  'laki-nowohuckie': {
    photos: [
      { src: '/photos/park-laki-nowohuckie-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Pięćdziesiąt siedem hektarów dzikiej łąki tuż za blokami Nowej Huty. Rosną tu storczyki i mieczyk dachówkowaty, a wiosną słychać chór ptaków, jakiego nie usłyszysz w żadnym miejskim parku.",
      "To ocalały fragment doliny Wisły, który uratował przypadek: teren był zbyt podmokły, żeby cokolwiek na nim postawić. Dzięki temu w granicach miasta przetrwały torfowiska z własną florą.",
      "Ścieżki są gruntowe, więc po deszczu potrzebne są porządne buty. W zamian dostajesz najbardziej naturalny krajobraz w Krakowie i widok na kombinat z drugiej strony łąk.",
    ],
    amenities: {
      playground: { has: true, note: "Place zabaw w osiedlach na skraju łąk, od strony Bulwarowej i os. Szkolnego." },
      food: { has: true, note: "Przestrzenie Nowohuckie z bułą i Łancafe przy wejściu od Bulwarowej." },
      verified: false,
    },
  },
  mlynowka: {
    photos: [
      { src: '/photos/park-mlynowka-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park liniowy na śladzie Młynówki Królewskiej, kanału, który od średniowiecza prowadził wodę z Rudawy do młynów w mieście. Woda zniknęła w XX wieku, została zielona wstęga przez pół Krowodrzy.",
      "Idzie się tu jak korytarzem: kilka kilometrów alejek między drzewami, z placami zabaw i siłowniami po drodze. To najdłuższy park w Krakowie, choć w najwęższym miejscu ma kilkadziesiąt metrów.",
      "Idealny na spacer z punktu A do B, na przykład z Bronowic do centrum, bez oddychania spalinami.",
    ],
    amenities: {
      playground: { has: true, note: "Kilka placów zabaw wzdłuż całej trasy parku." },
      food: { has: true, note: "Lokale przy przecinających ulicach, w tym kebab przy ul. Wrocławskiej." },
      verified: false,
    },
  },
  'ogrod-botaniczny': {
    photos: [
      { src: '/photos/park-ogrod-botaniczny-1.jpg', credit: "Fot. Iwona Grabska · CC BY 2.5 · Wikimedia Commons" },
      { src: '/photos/park-ogrod-botaniczny-2.jpg', credit: "Fot. Andrzej Harassek · CC BY-SA 3.0 · Wikimedia Commons" },
    ],
    description: [
      "Najstarszy ogród botaniczny w Polsce, założony w 1783 roku przy Uniwersytecie Jagiellońskim. Na dziewięciu hektarach rośnie kilka tysięcy gatunków, od alpejskich skalnic po palmy w zabytkowych szklarniach.",
      "Największe gwiazdy to ponad dwustuletni dąb, kolekcja storczyków i wiktoria królewska, której liść wytrzyma ciężar dziecka. W palmiarni rosną rośliny starsze niż sam budynek.",
      "Ogród jest biletowany i zimą zamknięty, ale od wiosny to najspokojniejsze zielone miejsce w centrum: bez rowerów, bez psów, bez muzyki.",
    ],
    amenities: {
      playground: { has: false, note: "Ogród naukowy bez placu zabaw, obowiązuje spokojne zwiedzanie." },
      food: { has: true, note: "Milin Cafe przy ogrodzie i kawiarnie przy ul. Kopernika." },
      verified: false,
    },
  },
  'panienskie-skaly': {
    photos: [
      { src: '/photos/park-panienskie-skaly-2.jpg', credit: "Fot. Platanacero · CC BY-SA 4.0 · Wikimedia Commons" },
    ],
    description: [
      "Rezerwat w środku Lasu Wolskiego: wąwóz z wapiennymi skałami, po których pnie się bukowy las. Nazwa pochodzi od legendy o norbertankach, przed którymi skały rozstąpiły się, gdy uciekały przed Tatarami.",
      "Ścieżka biegnie dnem wąwozu, między ścianami wysokimi na kilkanaście metrów. To najbardziej górski krajobraz w granicach Krakowa i jedno z niewielu miejsc, gdzie zapomina się, że jest się w mieście.",
      "Rezerwat jest mały, więc wyprawę warto połączyć z Kopcem Piłsudskiego albo klasztorem Kamedułów. Ścieżki bywają śliskie po deszczu.",
    ],
    amenities: {
      playground: { has: false, note: "Rezerwat przyrody bez infrastruktury. Najbliższy plac zabaw przy polanach Lasu Wolskiego." },
      food: { has: false, note: "Bez gastronomii w rezerwacie. Najbliżej: kawiarnia Mech i Franciszkówka." },
      verified: false,
    },
  },
  aleksandry: {
    photos: [
      { src: '/photos/park-aleksandry-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-aleksandry-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Największy park Bieżanowa i Prokocimia, piętnaście hektarów zieleni wciśniętych między osiedla. Nazwa pochodzi od ulicy Aleksandry, a ta od imienia, nie od żadnej historycznej postaci.",
      "Sercem parku jest rozległy trawnik z alejkami i zbiornik wodny, przy którym zbierają się kaczki i wędkarze. Wokół rosną szpalery drzew, które w pełni lata dają solidny cień.",
      "To park codzienny, bez zabytków: przychodzi się tu z psem, wózkiem albo piłką i zostaje na godzinę. Największa zaleta to skala, bo można iść długo bez zawracania.",
    ],
    amenities: {
      playground: { has: true, note: "Cztery place zabaw w różnych częściach parku, w tym duży przy zbiorniku." },
      food: { has: true, note: "Fast food i pizzeria przy wejściu od ul. Aleksandry." },
      verified: false,
    },
  },
  bednarskiego: {
    photos: [
      { src: '/photos/park-bednarskiego-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w wyrobisku kamieniołomu na Krzemionkach, otwarty w 1896 roku dzięki uporowi jednego człowieka: Wojciecha Bednarskiego, nauczyciela i radnego, który sam wyłożył pieniądze na pierwsze drzewa.",
      "Skalne ściany dawnego kamieniołomu tworzą naturalny amfiteatr, a tarasy nad nimi dają widok na dachy Podgórza. Po remoncie zakończonym w 2023 roku wróciły alejki, Domek Ogrodnika i ścieżka o Panu Twardowskim.",
      "To najbardziej kameralny z dużych parków Krakowa i jeden z niewielu, do którego wchodzi się w dół, nie w górę.",
    ],
    amenities: {
      playground: { has: true, note: "Duży plac zabaw po rewitalizacji, w dolnej części parku." },
      food: { has: true, note: "Mech Cafe w parku, a przy Rynku Podgórskim kawiarnie i cukiernie." },
      verified: false,
    },
  },
  decjusza: {
    photos: [
      { src: '/photos/park-decjusza-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w stylu angielskim wokół renesansowej Villi Decius, letniej rezydencji sekretarza króla Zygmunta Starego. Starszy niż większość krakowskich parków, bo zaczynał jako ogród przy pałacu w XVI wieku.",
      "Rosną tu potężne stare drzewa, w tym pomnikowe dęby, a alejki prowadzą do polany, na której latem grają koncerty. Sama willa działa jako instytucja kultury i można wejść na dziedziniec.",
      "To najbardziej dostojny park w mieście: cisza, stare drzewa i architektura, przy której nawet bieganie wydaje się nie na miejscu.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw w środkowej części parku, blisko willi." },
      food: { has: true, note: "Restauracja w Villi Decius, lodziarnia Buczek i pizzeria przy wejściu od Woli Justowskiej." },
      verified: false,
    },
  },
  duchacki: {
    photos: [
      { src: '/photos/park-duchacki-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-duchacki-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park na Woli Duchackiej ze stawem i dworem, który pamięta czasy, gdy była to podkrakowska wieś. Nazwa pochodzi od zakonu duchaków, dawnych właścicieli tych ziem.",
      "Po latach zaniedbania park przeszedł rewitalizację: uporządkowano staw, dosadzono zieleń i zrobiono nowe alejki. Wokół wody krążą kaczki, a nad stawem stoją pomosty widokowe.",
      "Dobre miejsce na krótki spacer z dzieckiem: mały, uporządkowany i cichy, mimo że osiedla są dosłownie za drzewami.",
    ],
    amenities: {
      playground: { has: true, note: "Trzy place zabaw, największy od strony ul. Estońskiej." },
      food: { has: false, note: "Bez gastronomii w parku. Najbliżej: lokale przy ul. Malborskiej." },
      verified: false,
    },
  },
  grzegorzecki: {
    photos: [
      { src: '/photos/park-grzegorzecki-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-grzegorzecki-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w Grzegórzkach, zielony klin między blokami i ruchliwymi ulicami. Powstał wraz z osiedlami, na terenach, które wcześniej należały do zalewowej doliny Wisły.",
      "Ma prosty układ: szerokie alejki, sporo trawy i stare drzewa, które skutecznie tłumią hałas z Kotlarskiej. To jeden z tych parków, które ratują całą okolicę.",
      "Świetny punkt na przerwę w drodze nad Wisłę: stąd do bulwarów jest kilka minut spacerem.",
    ],
    amenities: {
      playground: { has: true, note: "Place zabaw przy krawędzi parku, od strony osiedla." },
      food: { has: false, note: "Bez gastronomii w parku. Najbliżej: lokale przy ul. Grzegórzeckiej." },
      verified: false,
    },
  },
  'jalu-kurka': {
    photos: [
      { src: '/photos/park-jalu-kurka-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-jalu-kurka-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Mały park przy ul. Lubomirskiego, nazwany imieniem Jalu Kurka, pisarza i pierwszego polskiego futurysty. Trudno o lepszego patrona dla parku wciśniętego między kamienice i torowisko.",
      "Po rewitalizacji dostał nowe alejki, fontannę i sporo bylin, więc z zapomnianego skwerku zrobiło się miejsce, w którym siada się na dłużej.",
      "To park sąsiedzki: nie ma tu atrakcji, jest cień, woda i ławki. Dobre miejsce, żeby przeczekać upał między sprawami w centrum.",
    ],
    amenities: {
      playground: { has: false, note: "Bez placu zabaw, park jest niewielki i spacerowy." },
      food: { has: true, note: "Kebaby, kawiarnie i cukiernia przy ul. Lubomirskiego, tuż obok wejścia." },
      verified: false,
    },
  },
  jerzmanowskich: {
    photos: [
      { src: '/photos/park-jerzmanowskich-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w Prokocimiu z pałacem Jerzmanowskich w środku, jeden z najładniejszych zespołów pałacowo-parkowych w Krakowie. Erazm Jerzmanowski, przemysłowiec i filantrop, zbił majątek w Ameryce na lampach gazowych i wrócił, żeby rozdać go na cele społeczne.",
      "Wokół pałacu rosną stare drzewa, a alejki prowadzą do stawu i polany. Sam pałac ma dziś funkcję kulturalną, więc bywa otwarty na koncerty i wystawy.",
      "To park z klasą i historią, którego wielu krakowian jeszcze nie zna. Dobra wyprawa, jeśli lubisz miejsca z biografią.",
    ],
    amenities: {
      playground: { has: true, note: "Place zabaw w kilku miejscach parku, także w części od strony osiedla." },
      food: { has: true, note: "Kawiarnia przy parku i lokale przy ul. Wielickiej." },
      verified: false,
    },
  },
  krakowski: {
    photos: [
      { src: '/photos/park-krakowski-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park z 1885 roku, kiedyś modny salon Krakowa z mleczarnią, muszlą koncertową i stawem, po którym pływano łódkami. Z pierwotnych piętnastu hektarów zostało pięć, resztę zabrała rozbudowa miasta.",
      "Do dziś stoi tu fontanna i wielkie stare drzewa, a alejki mają układ z czasów, gdy chodziło się tu w kapeluszu. To najbardziej mieszczański park w mieście: mały, elegancki i pełen ludzi z książkami.",
      "Idealny na przerwę między sprawami w centrum: dziesięć minut od Rynku, a hałas ulicy zostaje za drzewami.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw w środku parku, pod okiem starych drzew." },
      food: { has: true, note: "Bary i kawiarnie po stronie ul. Karmelickiej i Krupniczej, kilka kroków od alejek." },
      verified: false,
    },
  },
  krowoderski: {
    photos: [
      { src: '/photos/park-krowoderski-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park powstały na miejscu dawnych ogrodów działkowych, jeden z młodszych w mieście i najbardziej sąsiedzki. Mieszkańcy Krowodrzy wywalczyli go zamiast kolejnej inwestycji.",
      "Ma dużo trawy, wybieg dla psów i alejki, po których w niedzielę jeździ pół dzielnicy na rowerkach. Nie ma tu zabytków ani legend, jest przestrzeń do oddychania.",
      "To dobry przykład parku bez historii, ale z funkcją: powstał, bo ludzie go potrzebowali, i dokładnie tak jest używany.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw i wybieg dla psów w środkowej części parku." },
      food: { has: true, note: "Lokale przy ul. Wybickiego i Opolskiej, w tym fast food za rogiem." },
      verified: false,
    },
  },
  kurdwanow: {
    photos: [
      { src: '/photos/park-kurdwanow-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-kurdwanow-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park na Kurdwanowie, sześć hektarów zieleni z placami zabaw i boiskami, oaza w gęstej zabudowie osiedla. Powstał jako element planu dzielnicy, nie jako pałacowy ogród.",
      "Środek zajmuje otwarta przestrzeń z alejkami, a wzdłuż krawędzi rosną szpalery drzew. Popołudniami park zamienia się w największy plac zabaw okolicy.",
      "Nie ma tu historii do zwiedzania, jest dobrze utrzymana zieleń w miejscu, gdzie każda taka działka to skarb.",
    ],
    amenities: {
      playground: { has: true, note: "Cztery place zabaw i strefy aktywności, jeden z najlepiej wyposażonych parków osiedlowych." },
      food: { has: true, note: "Kebaby i lodziarnia przy ul. Wysłouchów, kilka kroków od parku." },
      verified: false,
    },
  },
  witkowice: {
    photos: [
      { src: '/photos/park-witkowice-1.jpg', credit: "Fot. Mach240390 · CC BY 4.0 · Wikimedia Commons" },
    ],
    description: [
      "Park leśny na północnym skraju miasta, piętnaście hektarów prawdziwego lasu zamiast trawników. Rosną tu głównie sosny i brzozy, a runo wygląda jak w podmiejskim borze.",
      "Nie ma tu alejek z kostki ani fontann, są ścieżki gruntowe i cisza. To najbliższy centrum fragment Krakowa, w którym można pobyć w lesie bez jazdy do Lasu Wolskiego.",
      "Dobre miejsce na spacer, gdy chcesz zapachu igliwia zamiast koszonej trawy. Po deszczu przydają się porządne buty.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw przy wejściu od strony osiedla Witkowice." },
      food: { has: false, note: "Bez gastronomii w lesie. Najbliżej: sklepy i lokale przy ul. Siewnej." },
      verified: false,
    },
  },
  'lilli-wenedy': {
    photos: [
      { src: '/photos/park-lilli-wenedy-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park na Bieńczycach nazwany od bohaterki dramatu Słowackiego, dziesięć hektarów zieleni z alejkami i stawem. Powstał razem z osiedlami Nowej Huty, więc jego układ jest z tej samej epoki.",
      "Ma dużo starych drzew, sporo cienia i sieć ścieżek, po których wieczorami krąży pół dzielnicy. Przy stawie stoją ławki, z których widać kaczki i czaple.",
      "To spokojny park sąsiedzki, dobry na długi spacer, gdy chcesz uniknąć tłumów z centrum.",
    ],
    amenities: {
      playground: { has: true, note: "Kilka placów zabaw wzdłuż alejek, także od strony os. Kalinowego." },
      food: { has: true, note: "Zapiekanki i bary w pawilonach osiedlowych przy parku." },
      verified: false,
    },
  },
  lotnikow: {
    photos: [
      { src: '/photos/park-lotnikow-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Największy park Nowej Huty: pięćdziesiąt dwa hektary na terenie dawnego lotniska Rakowice-Czyżyny, z którego samoloty startowały jeszcze w latach sześćdziesiątych.",
      "Po pasach startowych zostały szerokie alejki, po lotnictwie muzeum tuż obok, a po latach zaniedbania nic: park przeszedł wielką rewitalizację i dostał tor rolkowy, boiska, siłownie i place zabaw.",
      "To park do aktywności, nie do zadumy. Najlepiej wpaść tu z rolkami, rowerem albo piłką i zostać do wieczora.",
    ],
    amenities: {
      playground: { has: true, note: "Kilkanaście placów zabaw i stref aktywności, największe skupisko w mieście." },
      food: { has: true, note: "Arena Garden Street Food Market i kawiarnie przy wejściu od al. Jana Pawła II." },
      verified: false,
    },
  },
  'macka-i-doroty': {
    photos: [
      { src: '/photos/park-macka-i-doroty-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w Bieżanowie Nowym z nazwą, która brzmi jak z bajki, i taką też ma atmosferę: dużo trawy, sporo placów zabaw i osiedlowe życie na alejkach.",
      "Dziewięć hektarów daje miejsce na boiska, siłownię plenerową i długie ścieżki. Wokół rosną młode drzewa, więc cienia z każdym rokiem jest więcej.",
      "To park dla rodzin, bez atrakcji turystycznych, ale z najlepszym w okolicy zapleczem dla dzieci.",
    ],
    amenities: {
      playground: { has: true, note: "Sześć placów zabaw i strefy aktywności, najwięcej w tej części miasta." },
      food: { has: false, note: "Bez gastronomii w parku. Najbliżej: pawilony przy ul. Aleksandry." },
      verified: false,
    },
  },
  ratuszowy: {
    photos: [
      { src: '/photos/park-ratuszowy-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-ratuszowy-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w samym środku Nowej Huty, przy placu Centralnym, założony razem z dzielnicą w latach pięćdziesiątych. Nazwa pochodzi od ratusza, który miał tu stanąć, ale nigdy nie powstał.",
      "Do dziś zostały monumentalne alejki, szpalery drzew i przestrzeń zaprojektowana pod defilady, dziś używana do spacerów. Socrealistyczny układ widać najlepiej z góry i z lotu ptaka.",
      "To najlepszy punkt startowy do zwiedzania Nowej Huty: stąd rozchodzą się wszystkie główne alejki dzielnicy.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw przy alei od strony osiedla Centrum." },
      food: { has: true, note: "Stylowa i kilka lokali przy placu Centralnym, minutę od parku." },
      verified: false,
    },
  },
  reduta: {
    photos: [
      { src: '/photos/park-reduta-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-reduta-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w Mistrzejowicach nazwany od ulicy, przy której leży, z rozległym trawnikiem i stawem. Powstał wraz z osiedlami, więc jego historia jest krótka, ale za to codzienna.",
      "Największą zaletą jest woda: nad stawem gromadzą się kaczki, wędkarze i ludzie z aparatami. Alejki są szerokie i asfaltowe, dobre pod wózek i rolki.",
      "To park użytkowy z dobrym powietrzem i sporą przestrzenią, w którym nikt nie robi zdjęć do przewodników, ale wszyscy przychodzą po pracy.",
    ],
    amenities: {
      playground: { has: true, note: "Kilka placów zabaw wzdłuż głównej alei." },
      food: { has: true, note: "Zielone Kąty przy parku i lokale w osiedlowych pawilonach." },
      verified: false,
    },
  },
  rzaka: {
    photos: [
      { src: '/photos/park-rzaka-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-rzaka-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w Prokocimiu z boiskami i szeroką przestrzenią, powstały na terenie dawnych pól. Nazwa pochodzi od Rżąki, dawnej wsi, którą wchłonął Kraków.",
      "Ma prosty, użytkowy charakter: trawa, boiska, alejki i place zabaw. To miejsce, w którym po pracy gra się w piłkę, a nie fotografuje zabytki.",
      "Zaleta jest oczywista: dużo otwartego nieba i mało ludzi w porównaniu z parkami w centrum.",
    ],
    amenities: {
      playground: { has: true, note: "Pięć placów zabaw i boiska w różnych częściach parku." },
      food: { has: false, note: "Bez gastronomii w parku. Najbliżej: lokale przy ul. Wielickiej." },
      verified: false,
    },
  },
  solvay: {
    photos: [
      { src: '/photos/park-solvay-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park na terenie dawnych zakładów sodowych Solvay, w których w czasie okupacji pracował Karol Wojtyła. Z fabryki nie ma już śladu, została nazwa i zielony klin między Borkiem Fałęckim a Łagiewnikami.",
      "Siedemnaście hektarów daje miejsce na długie alejki, boiska i sporo dzikiej zieleni. Wiosną park zamienia się w łąkę kwietną, a jesienią w tunel z liści.",
      "To park do biegania i jazdy rowerem, wygodny, cichy i wystarczająco duży, żeby nie robić kółek.",
    ],
    amenities: {
      playground: { has: true, note: "Place zabaw i strefy aktywności w kilku punktach parku." },
      food: { has: true, note: "Lodziarnia Good Lood i pizzeria przy wejściu od strony Zakopiańskiej." },
      verified: false,
    },
  },
  'stacja-wisla': {
    photos: [
      { src: '/photos/park-stacja-wisla-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-stacja-wisla-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Najmniejszy park w kolekcji i jeden z najciekawszych pomysłowo: powstał przy dawnej stacji kolejowej, z której dziś zostały tory i klimat. Nazwa nie jest metaforą, to naprawdę była stacja.",
      "Na niespełna hektarze zmieściły się alejki, ławki i zieleń, która zasłania ruch miasta. To park kieszonkowy, jakich w Krakowie powstaje coraz więcej.",
      "Wpada się tu na kwadrans, nie na wyprawę. W kolekcji liczy się tak samo jak Las Wolski, co ma swój urok.",
    ],
    amenities: {
      playground: { has: true, note: "Mały plac zabaw przy alejce." },
      food: { has: true, note: "Kilka lokali w okolicy, w tym pizzeria i bar tuż przy parku." },
      verified: false,
    },
  },
  strzelecki: {
    photos: [
      { src: '/photos/park-strzelecki-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-strzelecki-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Najstarszy park spacerowy Krakowa poza Plantami, założony w 1837 roku przez Towarzystwo Strzeleckie. Nazwa nie jest przypadkowa: mieszczanie ćwiczyli tu strzelanie do kurka, a najlepszy zostawał królem kurkowym na rok.",
      "W parku stoi Celestat, dawna siedziba bractwa, dziś muzeum ze skarbem: srebrnym kurem z XVI wieku. Wokół rosną stare kasztanowce, a alejki zbiegają się na placyku z fontanną.",
      "Dziś to zielona wyspa na Kleparzu, otoczona kamienicami. Popołudniami należy do dzieci i szachistów, wieczorami do studentów.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw w północnej części parku." },
      food: { has: true, note: "Gęsto: kawiarnie i restauracje przy ul. Warszawskiej i Lubicz, dosłownie za bramą." },
      verified: false,
    },
  },
  szwedzki: {
    photos: [
      { src: '/photos/park-szwedzki-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-szwedzki-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w Podgórzu, którego nazwa upamiętnia szwedzkie oblężenie miasta w XVII wieku. Niewielki, ale z prawdziwym starym drzewostanem i spokojnym układem alejek.",
      "Ma dwa hektary, fontannę i sporo cienia, więc w upał robi się tu przyjemniej niż na Rynku Podgórskim. Wokół stoją kamienice, które pamiętają czasy osobnego miasta.",
      "Dobre miejsce na przystanek w drodze między kopcem Krakusa a Bednarskim: oba są kilkanaście minut spacerem.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw w środku parku." },
      food: { has: true, note: "Bary i pizzeria przy ul. Limanowskiego, minutę od parku." },
      verified: false,
    },
  },
  tysiaclecia: {
    photos: [
      { src: '/photos/park-tysiaclecia-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-tysiaclecia-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park na Prądniku o nazwie od tysiąclecia państwa polskiego, dwanaście hektarów zieleni między blokami. Ma to, co w takich miejscach najcenniejsze: dużo drzew i mało asfaltu.",
      "Środek zajmuje rozległy trawnik, wokół biegną alejki i ścieżki rowerowe, a przy krawędziach ukryte są place zabaw i boiska. W weekend słychać tu głównie dzieci i piłkę.",
      "Świetne miejsce na spokojny, długi spacer bez tłumów, jeśli chcesz zieleni bez wycieczek i pamiątek.",
    ],
    amenities: {
      playground: { has: true, note: "Kilka placów zabaw, największy w środkowej części parku." },
      food: { has: false, note: "Bez gastronomii w parku. Najbliżej: pawilony i lokale przy ul. Krowoderskich Zuchów." },
      verified: false,
    },
  },
  szymborskiej: {
    photos: [
      { src: '/photos/park-szymborskiej-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-szymborskiej-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Najmłodszy i jeden z najmniejszych parków w centrum, otwarty w 2015 roku i nazwany imieniem noblistki, która mieszkała kilka minut stąd. Powstał na miejscu zaniedbanego skwerku przy ul. Karmelickiej.",
      "Jest kieszonkowy, ale zaprojektowany z pomysłem: trawnik do leżenia, ławki wśród bylin i sporo cienia. W ciepłe dni bywa pełen ludzi z laptopami i lodami.",
      "Nie przyjeżdża się tu na wyprawę, wpada się na kwadrans. To dowód, że park nie musi mieć hektarów, żeby zmienić okolicę.",
    ],
    amenities: {
      playground: { has: false, note: "Bez placu zabaw, park jest mały i spacerowy. Najbliższy w Parku Krakowskim." },
      food: { has: true, note: "Kilkadziesiąt lokali w promieniu paru minut, bo to samo serce Piasku." },
      verified: false,
    },
  },
  'wisniowy-sad': {
    photos: [
      { src: '/photos/park-wisniowy-sad-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-wisniowy-sad-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w Czyżynach o nazwie z Czechowa, powstały na terenie dawnych sadów, które faktycznie tu rosły. Nowy, jasny i zaprojektowany pod codzienne życie osiedla.",
      "Rosną tu młode drzewa i łąki kwietne, a alejki są szerokie i gładkie, więc dobrze jeżdżą po nich wózki i rowerki. Wieczorami park zapala się latarniami wzdłuż głównej osi.",
      "To dowód, że nowe parki w Krakowie potrafią być dobre od pierwszego dnia: dużo miejsca, mało betonu, sensowne place zabaw.",
    ],
    amenities: {
      playground: { has: true, note: "Sześć placów zabaw i stref aktywności, park jest wyraźnie rodzinny." },
      food: { has: false, note: "Bez gastronomii w parku. Najbliżej: galeria i lokale przy al. Pokoju." },
      verified: false,
    },
  },
  wyspianskiego: {
    photos: [
      { src: '/photos/park-wyspianskiego-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-wyspianskiego-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park nad Wisłą w Dębnikach, po drugiej stronie rzeki niż Wawel. Nazwany imieniem Stanisława Wyspiańskiego, który patrzył na tę okolicę z drugiego brzegu.",
      "Ma to, czego brakuje wielu parkom w centrum: przestrzeń i wodę. Alejki prowadzą wzdłuż wału, a z bulwaru widać sylwetę Skałki i Wawelu.",
      "Najlepiej wpaść tu rowerem, bo park leży na trasie nadwiślańskich bulwarów. Przy dobrej pogodzie widok na zachód słońca nad rzeką wygrywa z każdą kawiarnią.",
    ],
    amenities: {
      playground: { has: true, note: "Place zabaw i strefy aktywności w środkowej części parku." },
      food: { has: false, note: "Bez gastronomii w parku. Najbliżej: lokale przy ul. Kapelanka i Dębnickiej." },
      verified: false,
    },
  },
  'zaczarowanej-dorozki': {
    photos: [
      { src: '/photos/park-zaczarowanej-dorozki-1.jpg', credit: "Fot. Mach240390 · CC BY 4.0 · Wikimedia Commons" },
      { src: '/photos/park-zaczarowanej-dorozki-2.jpg', credit: "Fot. Mach240390 · CC BY 4.0 · Wikimedia Commons" },
    ],
    description: [
      "Park nazwany od wiersza Konstantego Ildefonsa Gałczyńskiego, mały i zaskakująco urokliwy zakątek Azorów. Powstał z terenu, który miał być zabudowany, a został zielony dzięki mieszkańcom.",
      "Ma stawek, mostek i sporo bylin, więc mimo niewielkiej powierzchni ciągle coś się tu dzieje. Wieczorami słychać żaby, co w mieście brzmi jak luksus.",
      "Nazwa zobowiązuje: to park, w którym najlepiej po prostu posiedzieć i pozwolić sobie na kwadrans bez telefonu.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw przy głównym wejściu." },
      food: { has: true, note: "Lodziarnia i pizzeria przy ul. Weissa, kilka kroków dalej." },
      verified: false,
    },
  },
  zakrzowek: {
    photos: [
      { src: '/photos/park-zakrzowek-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-zakrzowek-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
  },
  'zielony-jar': {
    photos: [
      { src: '/photos/park-zielony-jar-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-zielony-jar-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w jarze Wandy w Nowej Hucie, poprowadzony wzdłuż naturalnego obniżenia terenu. Sześć hektarów zieleni w miejscu, które przez lata było dzikim nieużytkiem.",
      "Ukształtowanie robi robotę: idzie się dołem jaru, między zboczami, więc czuć zmianę wysokości, rzadką w tej części miasta. Wzdłuż ścieżek posadzono nową zieleń i postawiono ławki.",
      "Spokojna, mało znana wyprawa, dobra dla tych, którzy lubią parki bez tłumów i z własnym mikroklimatem.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw przy wejściu od strony osiedla." },
      food: { has: false, note: "Bez gastronomii w parku. Najbliżej: pawilony na os. Na Stoku." },
      verified: false,
    },
  },
  zeromskiego: {
    photos: [
      { src: '/photos/park-zeromskiego-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-zeromskiego-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Park w Podgórzu z aleją starych kasztanowców i podniszczonym urokiem dawnego miasta. Powstał na przełomie XIX i XX wieku, gdy Podgórze było jeszcze osobnym miastem z własnym ratuszem.",
      "Sercem parku jest fontanna i szeroka aleja, a wokół gęsta zieleń, która skutecznie zasłania ruch. Rosną tu drzewa starsze niż większość okolicznych kamienic.",
      "Dobre miejsce, żeby zacząć spacer po Podgórzu: stąd blisko do Rynku Podgórskiego, Parku Bednarskiego i kopca Krakusa.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw przy głównej alei." },
      food: { has: true, note: "Kawiarnie i piekarnie przy Rynku Podgórskim, pięć minut spacerem." },
      verified: false,
    },
  },
  planty: {
    photos: [
      { src: '/photos/park-planty-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-planty-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Zielony pierścień wokół Starego Miasta: cztery kilometry alejek dokładnie tam, gdzie stały mury obronne, zburzone na początku XIX wieku. Nazwa nie pochodzi od roślin, a od splantowania, czyli wyrównania gruzu po fortyfikacjach.",
      "Planty to osiem ogrodów o własnych nazwach i charakterze, od Wawelu przez Uniwersytet po Barbakan. Stoi tu ponad sto pomników i fontann, a między nimi ławki z tabliczkami dedykowanymi pisarzom.",
      "Najlepsza pora to wczesny poranek, gdy alejki należą do biegaczy i ludzi z psami, albo późny wieczór, gdy latarnie zapalają się nad stawem z secesyjnym mostkiem.",
    ],
    amenities: {
      playground: { has: false, note: "Planty to park spacerowy bez placów zabaw. Najbliższe są w Parku Krakowskim i Strzeleckim." },
      food: { has: true, note: "Kawiarnie i restauracje na każdym kroku, bo park otacza całe Stare Miasto." },
      verified: false,
    },
  },
  'planty-bienczyckie': {
    photos: [
      { src: '/photos/park-planty-bienczyckie-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-planty-bienczyckie-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Zielony pas przez środek Bieńczyc, siedemnaście hektarów alejek, trawników i starych drzew. Nazwa nawiązuje do krakowskich Plant, a układ do socrealistycznego planu dzielnicy.",
      "To park do przechodzenia i siedzenia: prowadzi przez pół Nowej Huty, więc codziennie przecinają go tysiące ludzi w drodze do pracy i szkoły. Latem drzewa dają tunel cienia.",
      "Ciekawostka: w środku parku znajdziesz lawendowy ogród kwiatowy, mały fragment zrobiony z pomysłem i pachnący na cały skwer.",
    ],
    amenities: {
      playground: { has: false, note: "Planty to park spacerowy, place zabaw są w osiedlach obok." },
      food: { has: true, note: "Lodowa Hatka i lokale przy alejach Bieńczyc." },
      verified: false,
    },
  },
  'przylasek-rusiecki': {
    photos: [
      { src: '/photos/park-przylasek-rusiecki-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-przylasek-rusiecki-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Zespół stawów na wschodnim skraju Krakowa, powstałych po wybieraniu żwiru. Woda, plaża, wędkarze i cisza, jakiej nie znajdziesz w żadnym parku w centrum.",
      "Latem jeden ze stawów działa jako kąpielisko z ratownikami, pozostałe zostają dla wędkarzy i ptaków. Wokół rosną łąki i zarośla, w których gniazduje sporo gatunków.",
      "To najdalszy punkt kolekcji i najbardziej wakacyjny: pół godziny jazdy z centrum, a klimat jak nad jeziorem w Polsce środkowej.",
          "Warto wiedzieć dwie rzeczy przed wyjazdem. Kąpielisko jest strzeżone i czynne od dziesiątej do osiemnastej, a w sezonie dojeżdża tu specjalna linia autobusowa spod dworca w Czyżynach, więc nie trzeba mieć auta. Przy plaży stoją sezonowe budki z jedzeniem i lodami, a obok jest plac zabaw.",
      "Sam zespół liczy czternaście zbiorników i to jest właściwy powód, żeby zostać dłużej niż na plażowanie. Ścieżki między nimi dają godzinną pętlę, na której mija się i zagospodarowany brzeg, i ciche lustra wody w trzcinach.",
],
    amenities: {
      playground: { has: true, note: "Plac zabaw przy kąpielisku, po stronie plaży." },
      food: { has: true, note: "Sezonowe bary i lodziarnia przy kąpielisku." },
      verified: false,
    },
  },
  'skalki-twardowskiego': {
    photos: [
      { src: '/photos/park-skalki-twardowskiego-1.jpg', credit: "Fot. MartinVeselka · CC BY-SA 4.0 · Wikimedia Commons" },
      { src: '/photos/park-skalki-twardowskiego-2.jpg', credit: "Fot. MartinVeselka · CC BY-SA 4.0 · Wikimedia Commons" },
    ],
  },
  bagry: {
    photos: [
      { src: '/photos/park-bagry-zzm-1.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
      { src: '/photos/park-bagry-zzm-2.jpg', credit: 'Fot. ZZM Kraków · zzm.krakow.pl' },
    ],
    description: [
      "Krakowskie morze: trzydzieści hektarów wody w dawnym wyrobisku żwiru, z plażami, pomostami i przystanią żeglarską. W upalny weekend zalew wygląda jak nadmorski kurort, tylko bez soli w powietrzu.",
      "Bagry powstały przez przypadek. Żwir wybierano tu od międzywojnia, a wyrobisko zalała woda gruntowa. Dziś jest tu bulwar, boiska i wypożyczalnia sprzętu wodnego, a woda ma miejscami kilkanaście metrów głębokości.",
      "Warto zostać do zachodu słońca: tafla odbija panoramę Podgórza, a nad wodą robi się cicho, gdy plażowicze się rozejdą.",
    ],
    amenities: {
      playground: { has: true, note: "Plac zabaw i siłownia plenerowa przy bulwarze od strony Kozłówka." },
      food: { has: true, note: "Tawerna Horn nad wodą, lodziarnia Good Lood i sezonowe bary przy plaży." },
      verified: false,
    },
  },
  'dolina-bolechowicka': {
    photos: [
      { src: '/photos/dolina-bolechowicka.jpg', credit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/bolechowicka-wodospad.jpg', credit: 'Fot. Jerzy Opioła · CC BY-SA 3.0 · Wikimedia Commons' },
      { src: '/photos/bolechowicka-mur.jpg', credit: 'Fot. Wikipedysta Artur · CC BY 2.5 PL · Wikimedia Commons' },
    ],
    description: [
      "Rezerwat Wąwóz Bolechowicki, jedna z ośmiu dolin Parku Krajobrazowego Dolinki Krakowskie, około 15 km od Rynku. Wejście zamyka Brama Bolechowicka: dwie wapienne skały wysokie na 25 metrów, widoczne z daleka.",
      "To najkrótsza z podkrakowskich dolinek, około 1,5 kilometra, i najbardziej efektowna na wejściu. Dnem płynie potok Bolechówka, a kilkaset metrów za bramą jest dwustopniowy wodospad, rzadkość na Jurze.",
      "Na spacer w obie strony wystarczy godzina, więc to najlżejsza z trzech dolin. Skały nad ścieżką są rejonem wspinaczkowym, więc przy dobrej pogodzie zawsze ktoś tu wisi na linie.",
    ],
    amenities: {
      playground: { has: false, note: "Placu zabaw nie ma. Łąki przed bramą i za nią nadrabiają z nawiązką." },
      food: { has: false, note: "W dolinie nic nie kupisz. Woda i kanapki z domu, sklep w Bolechowicach." },
      verified: false,
    },
  },
  'dolina-kobylanska': {
    photos: [
      { src: '/photos/dolina-kobylanska.jpg', credit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons' },
    ],
    description: [
      "Jar Kobylański, zwany też Doliną Karniowską, około 16 km od Rynku. Najbardziej wspinaczkowa z trzech dolin: kilkadziesiąt wapiennych skał po obu stronach, z nazwami wymyślonymi przez wspinaczy.",
      "Dno doliny jest łagodne i szerokie, więc idzie się wygodnie, a skały ma się nad głową po obu stronach. Po drodze źródło, mała jaskinia i miejsca na piknik.",
      "Na uboczu, na zachodnim skraju, leży cmentarz choleryczny z dziewiętnastego wieku. Cicha rzecz, o której nie mówi żadna tablica.",
    ],
    amenities: {
      playground: { has: false, note: "Bez placu zabaw, ale są miejsca piknikowe i zadaszenia w dnie doliny." },
      food: { has: false, note: "Nic na miejscu. Najbliżej w Kobylanach." },
      verified: false,
    },
  },
  'dolina-kluczwody': {
    photos: [
      { src: '/photos/dolina-kluczwody.jpg', credit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/kluczwody-maczne.jpg', credit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/kluczwody-zamkowa.jpg', credit: 'Fot. Januszk Krzyżek · CC BY-SA 4.0 · Wikimedia Commons' },
    ],
    description: [
      "Rezerwat Dolina Kluczwody, nazywanej też Doliną Wierzchówki, około 14 km od Rynku, czyli najbliżej z całych Dolinek. Dolina ma około sześciu kilometrów, rezerwat obejmuje jej najciekawszy odcinek.",
      "Tu jest najwięcej historii: zrekonstruowane słupy graniczne z czasów rozbiorów, skały o nazwach Zamkowa Skała i Zamkowa Strażnica, i jaskinie w Mącznej Skale. Górny odcinek doliny, koło Wierzchowia, ma największe jaskinie całej Jury.",
      "Ze wschodniego zbocza, z Mącznych Skał, widać cały górny odcinek doliny. To najlepszy punkt na przerwę.",
    ],
    amenities: {
      playground: { has: false, note: "Placu zabaw nie ma." },
      food: { has: false, note: "Nic w dolinie. Sklep w Białym Kościele albo w Wierzchowiu." },
      verified: false,
    },
  },

  'dolina-bedkowska': {
    photos: [
      { src: '/photos/dolina-bedkowska.jpg', credit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/bedkowska-sokolica.jpg', credit: 'Fot. Jerzy Opioła · CC BY-SA 3.0 · Wikimedia Commons' },
    ],
    description: [
      "Najdłuższa z Dolinek Krakowskich: siedem do ośmiu kilometrów doliny potoku Będkówka, od drogi z Krakowa do Olkusza aż do przysiółka Łączki. Jedna z najdłuższych dolin całej Wyżyny Krakowsko-Częstochowskiej.",
      "Tu są trzy rekordy naraz. Wodospad Szum jest najwyższym wodospadem Jury, Jaskinia Nietoperzowa jej największą jaskinią, a Sokolica ma najwyższą ścianę wspinaczkową w Polsce poza Tatrami. Na szczycie Sokolicy leżą jeszcze wały grodu z dziewiątego wieku.",
      "Ośmiu kilometrów nie robi się w jedno popołudnie i nie trzeba: pieczątka przychodzi po trzech punktach. Najwygodniej zwiedzać ją od Będkowic.",
    ],
    amenities: {
      playground: { has: false, note: "Placu zabaw nie ma, ale polany nad potokiem robią swoje." },
      food: { has: true, note: "Schronisko Brandysówka w dnie doliny, blisko wodospadu Szum." },
      verified: false,
    },
  },
  'dolina-raclawki': {
    photos: [
      { src: '/photos/dolina-raclawki.jpg', credit: 'Fot. Jerzy Opioła · CC BY-SA 3.0 · Wikimedia Commons' },
    ],
    description: [
      "Największe miejsce w całej apce: rezerwat o powierzchni prawie 474 hektarów, dolina długa na dziewięć kilometrów, między Racławicami a Dubiem. Najdalsza z naszych dolin, około 22 km od Rynku.",
      "To dolina do czytania. Biegnie nią ścieżka edukacyjna z numerowanymi przystankami: budowa geologiczna, łęg olszowy, martwica wapienna, buczyna karpacka, chronione gatunki. Ktoś włożył w to pracę i widać ją na miejscu.",
      "Geologicznie jest tu najciekawiej z całej Jury: wapienie z dewonu, karbonu i górnej jury plus pokłady piaskowców, a w zboczach kilka wąwozów z własnymi nazwami i źródłami.",
    ],
    amenities: {
      playground: { has: false, note: "Bez placu zabaw. To rezerwat, nie park." },
      food: { has: false, note: "Nic w dolinie. Najbliżej w Dubiu albo Krzeszowicach." },
      verified: false,
    },
  },
  'dolina-eliaszowki': {
    photos: [
      { src: '/photos/park-eliaszowki-zrodlo.jpg', credit: 'Fot. Kgbo · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/dolina-eliaszowki.jpg', credit: 'Fot. Kgbo · CC BY-SA 4.0 · Wikimedia Commons' },
      { src: '/photos/eliaszowki-czerna.jpg', credit: 'Fot. Cancre · CC BY-SA 4.0 · Wikimedia Commons' },
    ],
    description: [
      "Dolina między Czerną a Paczółtowicami, około 25 km od Rynku, z klasztorem karmelitów bosych u wylotu. Najbardziej zabytkowa z Dolinek i jedyna, w której nazwy nadał zakon, a nie wspinacze.",
      "Źródła mają tu patronów: świętego Eliasza, świętego Elizeusza, świętego Józefa. W zboczach jaskinie, po drodze kapliczki, a niżej ruiny mostów i dawnej furty klasztornej.",
      "Klasztor w Czernej jest podwójnym sanktuarium: Matki Bożej Szkaplerznej i świętego Rafała Kalinowskiego. Warto go dołożyć do wyprawy, choć leży już poza rezerwatem.",
    ],
    amenities: {
      playground: { has: false, note: "Placu zabaw nie ma." },
      food: { has: false, note: "W dolinie nic. Zaplecze przy klasztorze w Czernej." },
      verified: false,
    },
  },
  'dolina-szklarki': {
    photos: [
      { src: '/photos/dolina-szklarki.jpg', credit: 'Fot. marek7400 · CC BY 3.0 · Wikimedia Commons' },
    ],
    description: [
      "Dolina potoku Szklarka, dziewięć kilometrów od Jerzmanowic przez Szklary do Dubia, gdzie jej wylot spotyka się z wylotem Doliny Racławki. Około 21 km od Rynku.",
      "Uczciwie: dnem biegnie asfaltowa droga i dolina jest częściowo zabudowana. To najbardziej oswojona z Dolinek. Ratują ją zalesione zbocza pełne wapiennych skałek i ostańców.",
      "Największe z nich to Brodło, Witkowe Skały, Łyse Skały, Chochołowe Skały, Cisówki i Kozłowe Skały. Na części z nich wspinają się wspinacze.",
    ],
    amenities: {
      playground: { has: false, note: "Placu zabaw nie ma." },
      food: { has: false, note: "Wsie w dnie doliny, więc sklep bywa po drodze." },
      verified: false,
    },
  },

}

/** pierwsze zdjęcie miejsca, do miniatury na liście */
export const heroPhoto = (parkId: string) => PARK_INFO[parkId]?.photos?.[0]?.src
