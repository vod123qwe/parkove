// Pilot quests: Kopiec Krakusa, Park Zakrzówek, Park Jordana.
// Content model (decided 2026-08-19): `description` is public and rich, it
// sells the visit and can be read anytime; `reveal` is the short punchline
// unlocked only on site. Coordinates from OSM nodes; radii tuned for urban
// GPS drift. [w terenie] = position to fine-tune on the first real visit.

/**
 * A question the app asks after the reveal: a real dilemma tied to this place,
 * meant to start a conversation on the bench. The counterpoint argues the
 * other side whichever option you pick, so nobody "wins" the question.
 */
import { DOLINKI_QUESTS } from './quests-dolinki'

export type PoiDilemma = {
  question: string
  options: string[]
  counterpoint: string
}

export type PoiCategory =
  | 'view'
  | 'monument'
  | 'water'
  | 'nature'
  | 'cave'
  | 'history'
  | 'meadow'
  | 'climb'
  | 'play'

/** krótka etykieta kategorii, na listy: pin mówi ikoną, lista mówi słowem */
export const CATEGORY_LABEL: Record<PoiCategory, string> = {
  view: 'widok',
  monument: 'pomnik',
  water: 'woda',
  nature: 'przyroda',
  cave: 'jaskinia',
  history: 'historia',
  meadow: 'łąka',
  climb: 'skała',
  play: 'plac zabaw',
}

export type QuestPoi = {
  id: string
  name: string
  /** drives the map pin icon */
  category: PoiCategory
  /** public: what is here, one sentence (list rows, map) */
  teaser: string
  /** public: the full story that invites the visit, paragraphs */
  description: string[]
  /**
   * Wersja rozwinięta, za przyciskiem „Czytaj dalej". Krótka zostaje domyślną,
   * żeby chodzenie po parku nie zamieniło się w czytanie. Tylko dla miejsc, których
   * historii nie da się domknąć trzema akapitami.
   */
  long?: string[]
  /**
   * Podanie, legenda, opowieść ludowa. Świadomie OSOBNE pole, bo w apce ma leżeć
   * pod własnym nagłówkiem i w innym kroju: podanie nigdy nie ma udawać faktu.
   */
  legend?: string[]
  /** public: how to find the spot */
  findHint?: string
  /** hidden: the punchline, unlocked on site */
  reveal: string
  /** hidden: the dilemma, shown under the reveal */
  dilemma?: PoiDilemma
  /** photo url (public/photos), added when assets are fetched */
  photo?: string
  photoCredit?: string
  sources?: string[]
  /** [lng, lat] */
  coords: [number, number]
  /** meters */
  radius: number
}

export type Quest = {
  parkId: string
  pois: QuestPoi[]
  /**
   * How many points earn the stamp. Missing means all of them, which is right
   * for a park you can finish in an afternoon. A place too big for one visit,
   * like a valley in the Jura, sets a lower bar and keeps the rest of the
   * points as a reason to come back.
   */
  stampAt?: number
}

const KRAKOW_QUESTS: Quest[] = [
  {
    parkId: 'kopiec-krakusa',
    pois: [
      {
        id: 'szczyt',
        category: 'view',
        name: 'Szczyt kopca',
        teaser: 'Punkt widokowy na Wawel, centrum i pozostałe kopce.',
        description: [
          'Kopiec Krakusa to najstarsza budowla Krakowa: 16 metrów usypanej ziemi na szczycie wzgórza Lasoty, starsza niż państwo polskie. Badania wskazują na VI-VIII wiek, ale ani twórcy, ani cel usypania nie są znane do dziś.',
          'Ze szczytu rozciąga się najlepsza darmowa panorama miasta: Wawel, Stare Miasto, a przy dobrej pogodzie Tatry na południu. To także jedyne miejsce, z którego widać pozostałe trzy krakowskie kopce jednocześnie.',
          'W latach 1934-37 archeolodzy rozkopali fragment kopca, licząc na grób legendarnego Kraka. Znaleźli awarską skuwkę, czeski denar i ślady konstrukcji z wikliny, które pozwoliły datować budowlę. Grobu nie znaleziono.',
        ],
        findHint: 'Wejście od ul. Maryewskiego, potem ścieżką serpentyną na szczyt. Około 10 minut pod górę.',
        reveal:
          'Według Jana Długosza to grób Kraka, założyciela miasta. Wykopaliska z lat 1934-37 znalazły awarską skuwkę i czeski denar, ale grobu nie było. Kopiec ma ponad 1200 lat i wciąż nie wiemy, kto go usypał.',
        dilemma: {
          question:
            'Kopiec stał nietknięty 1200 lat. W 1934 rozkopano jego wnętrze, szukając grobu Kraka. Grobu nie znaleziono, a kopiec został naruszony na zawsze. Czy warto było?',
          options: ['Warto, wiedza jest ważniejsza', 'Nie warto, to był grób', 'Zależy, kto i jak kopie'],
          counterpoint:
            'Bez tych wykopalisk nie wiedzielibyśmy nawet, ile kopiec ma lat: datowanie oparto na znalezionych w środku przedmiotach. Ale gdyby to był grób, byłaby to ostatnia rzecz, jaką ktoś mu zrobił. Dziś archeolodzy wolą metody nieniszczące i czekają z łopatą na lepsze czasy.',
        },
        photo: '/photos/krakus-szczyt.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        sources: ['https://pl.wikipedia.org/wiki/Kopiec_Krakusa'],
        coords: [19.95844, 50.03808],
        radius: 30,
      },
      {
        id: 'azymut',
        category: 'view',
        name: 'Linia dwóch kopców',
        teaser: 'Stąd, przy dobrej pogodzie, widać Kopiec Wandy w Nowej Hucie.',
        description: [
          'Stań na wschodniej krawędzi szczytu i spójrz w stronę Nowej Huty: 10 kilometrów dalej stoi Kopiec Wandy, bliźniak Krakusa. Według legendy usypano go nad grobem córki Kraka, tej, która nie chciała Niemca.',
          'Oba kopce łączy coś więcej niż legenda. Linia poprowadzona z Krakusa na Wandę wskazuje punkt, w którym słońce wschodzi 1 maja, w celtyckie święto Beltane. W drugą stronę: zachód słońca w Samhain, na początku listopada.',
          'Stąd teoria, że kopce były częścią pogańskiego kalendarza astronomicznego. Dowodów brak, ale precyzja tego ustawienia robi wrażenie do dziś.',
        ],
        findHint: 'Wschodnia strona szczytu. Szukaj wzrokiem komina elektrociepłowni, kopiec Wandy jest na lewo od niego.',
        reveal:
          'Azymut z Kopca Krakusa na Kopiec Wandy pokrywa się ze wschodem słońca 1 maja, w celtyckie święto Beltane. Jedna z teorii mówi, że kopce były pogańskim obserwatorium astronomicznym.',
        dilemma: {
          question:
            'Dwa kopce, jedna linia i data pogańskiego święta. Czy to dowód na starożytne obserwatorium, czy przypadek, w którym chcemy widzieć sens?',
          options: ['To zaplanowane', 'To przypadek', 'Nie da się rozstrzygnąć'],
          counterpoint:
            'Ludzki mózg jest mistrzem w znajdowaniu wzorów tam, gdzie ich nie ma: na mapie miasta znajdziesz setki linii pasujących do jakiejś daty. Ale pogańska Europa naprawdę budowała obiekty ustawione na przesilenia, więc sam pomysł nie jest fantazją. Brakuje po prostu dowodu.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Kopiec_Krakusa'],
        coords: [19.9587, 50.03815],
        radius: 35,
      },
      {
        id: 'rekawka',
        category: 'meadow',
        name: 'Stok Rękawki',
        teaser: 'Łąka pod kopcem, miejsce wiosennego festynu.',
        description: [
          'Łąka na stoku wzgórza Lasoty to scena jednego z najstarszych krakowskich zwyczajów. Rękawka, obchodzona we wtorek po Wielkanocy, ma korzenie w słowiańskich obrzędach zadusznych: wiosennym święcie ku czci zmarłych.',
          'Przez wieki z kopca toczono w dół jajka, symbol odradzającego się życia, a biedocie zrzucano jedzenie i drobne monety. Dziś Rękawka to festyn z rekonstruktorami: wioska wojów, walki, ogień i słowiańskie rytuały.',
        ],
        findHint: 'Południowo-wschodni stok, między kopcem a kościółkiem św. Benedykta.',
        reveal:
          'We wtorek po Wielkanocy odbywa się tu Rękawka: tradycja toczenia jajek ze stoku, echo słowiańskich obrzędów zadusznych. Nazwa wzięła się z legendy, że ziemię na kopiec noszono w rękawach.',
        dilemma: {
          question:
            'Rękawka to pogański obrzęd, który przetrwał, bo Kościół wpisał go w kalendarz Wielkanocy. Czy tradycja, która zmienia znaczenie, żeby przeżyć, jest jeszcze tą samą tradycją?',
          options: ['Tak, forma została', 'Nie, sens się zmienił', 'To już nowa tradycja'],
          counterpoint:
            'Zwyczaj bez ludzi umiera, więc kompromis go uratował: gest toczenia jajka jest ten sam po tysiącu lat. Ale nikt tu dziś nie karmi zmarłych, a to był cały pierwotny sens. Dziś Rękawka jest festynem z rekonstruktorami, czyli trzecią wersją tej samej rzeczy.',
        },
        photo: '/photos/krakus-rekawka.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        sources: ['https://pl.wikipedia.org/wiki/Kopiec_Krakusa'],
        coords: [19.9577, 50.0376],
        radius: 60,
      },
      {
        id: 'macewy',
        category: 'history',
        name: 'Droga z macew',
        teaser: 'Ścieżka przy dawnym kamieniołomie Liban, u stóp wzgórza.',
        description: [
          'Kamieniołom Liban u stóp kopca to miejsce o dwóch mrocznych historiach: jednej prawdziwej i jednej filmowej. W latach 1942-44 Niemcy prowadzili tu karny obóz pracy, przez który przeszło ponad dwa tysiące więźniów.',
          'Pół wieku później Steven Spielberg wybrał Liban na plan "Listy Schindlera". Zbudowano tu pełną rekonstrukcję obozu Płaszów: 34 baraki, siedem wież strażniczych, willę komendanta Götha i obozową drogę wyłożoną betonowymi replikami macew, żydowskich nagrobków.',
          'Po zdjęciach większość scenografii rozebrano, ale fragmenty drogi z macew zostały. Leżą wśród zieleni zarastającego kamieniołomu do dziś, filmowa fikcja, która stała się częścią prawdziwego krajobrazu pamięci.',
        ],
        findHint: 'Ścieżka wzdłuż zachodniej krawędzi kamieniołomu, poniżej kopca. Punkt przy zejściu do wyrobiska.',
        reveal:
          'To pozostałość scenografii "Listy Schindlera". Spielberg odtworzył w Libanie obóz Płaszów: 34 baraki, wieże i drogę z betonowych replik macew, której fragmenty leżą tu do dziś. W latach 1942-44 działał w kamieniołomie prawdziwy niemiecki obóz karny.',
        dilemma: {
          question:
            'Filmowa scenografia obozu została w kamieniołomie i zarasta. Zostawić ją jako świadka pamięci, czy usunąć, bo to tylko rekwizyt na terenie prawdziwego obozu?',
          options: ['Zostawić, ludzie tu przychodzą', 'Usunąć, to dekoracja', 'Zostawić, ale opisać wprost'],
          counterpoint:
            'Ta droga przyprowadza tu ludzi, którzy o obozie Płaszów nigdy by nie usłyszeli. Ale betonowe macewy nie są nagrobkami: prawdziwe niemcy wybrukowali nimi obóz, a tu leży kopia zrobiona do filmu. Bez tabliczki historia zamienia się w atrakcję.',
        },
        photo: '/photos/krakus-macewy.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        sources: [
          'https://krakow.travel/22735-krakow-steinbruch-liban',
          'https://dziennikpolski24.pl/krakowska-mapa-listy-schindlera-w-tych-miejscach-steven-spielberg-krecil-swoj-slynny-film/gh/c13-18343591/4',
        ],
        coords: [19.95657, 50.03675],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'zakrzowek',
    pois: [
      {
        id: 'kapielisko',
        category: 'water',
        name: 'Kąpielisko na pomostach',
        teaser: 'Ażurowe baseny na tafli zalewu, od brodzika po 3,4 m głębokości.',
        description: [
          'Zakrzówek to zalany w 1990 roku kamieniołom wapienia: skalna niecka wypełniona wodą o karaibskim, turkusowym odcieniu, który zawdzięcza właśnie wapieniowi. Głębokość sięga trzydziestu kilku metrów.',
          'Od 2023 roku na tafli pływają ażurowe baseny: cztery niecki o głębokościach od 40 cm do 3,4 m, spięte pomostami. Kąpiesz się w środku zalewu, nie dotykając jego dzikiego dna, a pomosty działają jako deptak przez cały rok.',
          'Pod wodą Zakrzówek żyje drugim życiem: to jedno z najpopularniejszych miejsc nurkowych w Polsce, z widocznością sięgającą 15 metrów.',
        ],
        findHint: 'Wejście do parku od ul. Wyłom, pomosty w północnej zatoce zalewu.',
        reveal:
          'Kilkanaście metrów pod pomostami leżą Fiat 125p i autobus, celowo zatopione atrakcje dla nurków. Toniesz wzrokiem w jednej z najczystszych wód w Polsce.',
        dilemma: {
          question:
            'Zakrzówek był dziką, niebezpieczną wyrwą, w której tonęli ludzie. Dziś ma pomosty, ratowników i bilety. Zyskaliśmy czy straciliśmy?',
          options: ['Zyskaliśmy, jest bezpiecznie', 'Straciliśmy dzikość', 'Da się mieć oba, ale nie tutaj'],
          counterpoint:
            'W dawnym Zakrzówku utonęło kilkadziesiąt osób i nikt nie miał prawa tam wchodzić, choć wchodzili wszyscy. Ale to samo miejsce było ostatnim kawałkiem miasta, w którym nikt nie mówił Ci, gdzie możesz iść. Bezpieczeństwo zawsze coś kosztuje, tylko rzadko liczymy co.',
        },
        photo: '/photos/zakrzowek-kapielisko.jpg',
        photoCredit: 'Fot. Paul Siarkowski · CC BY 2.0 · Wikimedia Commons',
        sources: [
          'https://zzm.krakow.pl/aktualnosci/1375-park-zakrzowek-dostepny-dla-mieszkancow.html',
          'https://www.razemwpodrozy.pl/park-zakrzowek-w-krakowie',
        ],
        coords: [19.9115, 50.0341],
        radius: 70,
      },
      {
        id: 'urwiska',
        category: 'view',
        name: 'Punkt widokowy nad zalewem',
        teaser: 'Wapienne urwiska nad turkusową wodą.',
        description: [
          'Trzydziestometrowe białe ściany nad turkusową wodą to najbardziej "niekrakowski" widok w Krakowie. Jeszcze w latach 80. jeździły tu wywrotki: kamieniołom Zakrzówek dostarczał wapień między innymi dla pobliskiego Solvayu.',
          'W czasie okupacji, od września 1940 do października 1941, w kamieniołomie pracował jako robotnik młody Karol Wojtyła. Ta praca chroniła go przed wywózką i została w jego pamięci na zawsze: wspominał ją nawet jako papież.',
          'Dziś krawędzie urwisk to ciąg punktów widokowych połączonych ścieżkami parku.',
        ],
        findHint: 'Ścieżka wzdłuż wschodniej krawędzi zalewu, punkt z barierkami nad najwyższą ścianą.',
        reveal:
          'W kamieniołomie pracował Karol Wojtyła. Druga tablica ku jego pamięci stoi na dnie zalewu i mijają ją wyłącznie nurkowie.',
        dilemma: {
          question:
            'Tablica pamiątkowa leży na dnie, gdzie zobaczy ją może kilkuset nurków rocznie. Czy pomnik, którego prawie nikt nie widzi, ma sens?',
          options: ['Tak, liczy się sam gest', 'Nie, pomnik ma być widziany', 'To raczej sekret niż pomnik'],
          counterpoint:
            'Pomnik w ukryciu przypomina, że pamięć nie jest po to, żeby robić wrażenie. Ale upamiętnienie, o którym nikt nie wie, nie przekazuje niczego dalej: za dwa pokolenia zostanie z niej płyta w mule. Może właśnie o to chodzi, że są rzeczy tylko dla tych, którzy zejdą po nie głębiej.',
        },
        photo: '/photos/zakrzowek-urwiska.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        sources: ['https://www.razemwpodrozy.pl/park-zakrzowek-w-krakowie'],
        coords: [19.91527, 50.03994],
        radius: 40,
      },
      {
        id: 'urwiska-zachod',
        category: 'nature',
        name: 'Zachodni brzeg',
        teaser: 'Skalne ściany od zachodniej strony zalewu, najspokojniejszy kawałek parku.',
        description: [
          'Zachodni brzeg jest cichszy od pomostów: wąska ścieżka, wapienne ściany po jednej stronie, turkusowa woda po drugiej. To najlepsze miejsce, żeby zobaczyć skalę wyrobiska bez tłumu.',
          'Stąd widać też, jak kamieniołom był cięty: poziome ławice wapienia jurajskiego, sprzed 150 milionów lat, kiedy w miejscu Krakowa było ciepłe morze pełne gąbek i koralowców.',
        ],
        findHint: 'Zachodni brzeg zalewu, ścieżką od strony ul. św. Jacka.',
        reveal:
          'Stoisz na dnie dawnego morza. Wapień, który tu wycięto, to sprasowane szkielety morskich organizmów z okresu jurajskiego: skała, z której zbudowano pół Krakowa, powstała z życia.',
        dilemma: {
          question:
            'Ten krajobraz istnieje tylko dlatego, że ludzie wycięli tu dziurę w ziemi. Czy blizna po przemysłowej dewastacji może być pięknem?',
          options: ['Tak, natura ją przejęła', 'Nie, to wciąż rana', 'Piękno nie zmienia szkody'],
          counterpoint:
            'Zakrzówek jest dziś cenniejszy przyrodniczo niż łąka, która była tu przed kamieniołomem: mieszkają w nim gatunki lubiące skały i ciepło. Ale wystarczyło kilkadziesiąt lat wydobycia, żeby zniknął fragment doliny Wisły, którego nikt już nie odtworzy. Piękno powyrobiskowe zawsze jest piękne cudzym kosztem.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Zakrz%C3%B3wek_(Krak%C3%B3w)'],
        coords: [19.91138, 50.03987],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'skalki-twardowskiego',
    pois: [
      {
        id: 'grota',
        category: 'cave',
        name: 'Grota Twardowskiego',
        teaser: 'Wejście do największej jaskini w skałkach, sercem legendy o czarnoksiężniku.',
        description: [
          'Grota Twardowskiego to najsłynniejsza jaskinia Krakowa: korytarze o łącznej długości około 500 metrów, zbadane i udrożnione dopiero w 2019 roku przez grotołazów. Wejście odsłonięto przypadkiem w drugiej połowie XIX wieku, przy pracach w kamieniołomie.',
          'Całe Skałki wzięły nazwę od legendy, która właśnie tutaj umieszcza pracownię czarnoksiężnika. Opowieść masz niżej, w swoim własnym miejscu, bo nie jest faktem i nie ma udawać faktu.',
          'Wejście jest dziś zakratowane, bo wewnątrz zimują nietoperze. Skałę zbudowało ciepłe morze późnej jury: wapienie mają tu do 230 metrów miąższości, siedzą w nich konkrecje krzemionkowe, a miejscami widać ślady drążenia ich powierzchni przez jeżowce.',
        ],
        long: [
          'Wzgórze wygląda dziko, ale prawie cały jego kształt jest robotą ludzi. Działały tu cztery kamieniołomy: Łom Bergera, Skałki Twardowskiego, Kapelanka i Zakrzówek. Wapień szło najpierw pod budownictwo, potem na drogi i do wapienników, a na końcu do zakładów produkujących sodę.',
          'Zalew Zakrzówek nie jest jeziorem: to wyrobisko jednego z tych kamieniołomów, które wypełniła woda deszczowa. Stąd ta głębokość i przejrzystość, i stąd nurkowie w miejscu, gdzie sto lat temu strzelano dynamitem.',
          'Grota nie jest tu sama. Na wzgórzu jest kilkanaście jaskiń i schronisk, a ich nazwy są osobną przyjemnością: Jaskinia Jasna, Koguta, Musza, Niska, Pychowicka, Jaskinia w Anastomozach, Jaskinia z Kulkami i Okienko Zbójnickie.',
          'Warto zatrzymać się nad rokiem 2019. Najsłynniejsza jaskinia Krakowa, ta z legendy znanej każdemu dziecku, została porządnie zbadana i udrożniona mniej niż dekadę temu. Miasto potrafi nie znać swojego najbardziej opowiedzianego miejsca.',
        ],
        legend: [
          'Twardowski był czarnoksiężnikiem na dworze Zygmunta Augusta i to on miał wywołać dla króla duszę Barbary Radziwiłłówny. Cenę znał z góry, bo podpisał cyrograf z diabłem. Wpisał do niego tylko jeden warunek: czart może go zabrać wyłącznie w Rzymie. Do Rzymu, rzecz jasna, nie zamierzał jechać nigdy.',
          'Diabeł był cierpliwszy. Dopadł go w karczmie, która nazywała się Rzym. Karczmę z tej opowieści można zresztą odwiedzić: drewniana, z początku osiemnastego wieku, stoi przy rynku w Suchej Beskidzkiej i pod koniec lat sześćdziesiątych nadano jej właśnie tę nazwę, na pamiątkę spotkania Twardowskiego z Mefistofelesem.',
          'W drodze do piekła Twardowski zaczął śpiewać pieśń do Matki Boskiej. Diabeł nie mógł go dalej nieść i puścił. Twardowski zawisł między niebem a piekłem i został na Księżycu. Podobno pajak spuszcza się od niego na nitce do Krakowa i wraca z wiadomościami, co się w mieście dzieje.',
          'A krakowski rozdział tej historii jest właśnie tutaj: na tym wzgórzu miał stać jego pracownia. Pewnego dnia laboratorium wyleciało w powietrze, a odłamki skał rozsypane po zboczu to jego resztki. Dlatego to Skałki Twardowskiego, a nie żaden Zakrzówek Górny.',
        ],
        findHint: 'Zbocze nad ul. Norymberską, ścieżką w górę od strony zalewu. Wejście zakratowane, oglądasz z zewnątrz.',
        reveal:
          'Jaskinia ma około 500 metrów korytarzy i 13 metrów głębokości. W środku zimują nietoperze, dlatego krata: to nie zakaz wstępu dla ludzi, a sypialnia dla zwierząt, których w mieście prawie nie ma gdzie spać.',
        dilemma: {
          question:
            'Jaskinia jest zamknięta kratą, żeby chronić nietoperze. Czy miasto powinno zamykać swoje najciekawsze miejsca dla dobra zwierząt?',
          options: ['Tak, one były tu pierwsze', 'Nie, ludzie też mają prawo', 'Otwierać sezonowo'],
          counterpoint:
            'Nietoperze budzone w czasie zimowania często tego nie przeżywają, a w mieście nie mają alternatywy. Ale miejsce, do którego nikt nie może wejść, powoli przestaje istnieć w głowach ludzi, a rzeczy nieistniejące łatwiej potem zabetonować.',
        },
        photo: '/photos/skalki-grota.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        sources: [
          'https://www.klubpodroznikow.com/jaskinia-twardowskiego/',
          'https://pl.wikipedia.org/wiki/Ska%C5%82ki_Twardowskiego',
          'https://pl.wikipedia.org/wiki/Karczma_Rzym',
        ],
        coords: [19.90245, 50.03892],
        radius: 45,
      },
      {
        id: 'sciany-wspinaczkowe',
        category: 'climb',
        name: 'Ściany wspinaczkowe',
        teaser: 'Poligon krakowskich wspinaczy z ponad stuletnią tradycją.',
        description: [
          'Skałki są szkołą wspinania od ponad stu lat. Na tych ścianach uczyły się pokolenia taterników i himalaistów, zanim ruszyły w wyższe góry, a drogi mają swoje nazwy-legendy: Freney, Baba Jaga, Problemówka, Szara Ścianka.',
          'W pogodny dzień zobaczysz tu ludzi z linami na kilku ścianach jednocześnie, a niżej, w zatokach zalewu, freediverów. To najbardziej "górskie" miejsce w Krakowie: pełnoprawny teren wspinaczkowy dwadzieścia minut od Rynku.',
        ],
        findHint: 'Wschodnia część grzbietu, ściany nad ścieżką od strony zalewu. Szukaj wzrokiem ludzi w kaskach.',
        reveal:
          'Nazwy dróg na tych ścianach to mapa polskich marzeń o górach: Freney to filar Mont Blanc, na którym w 1961 zginęła słynna wyprawa. Ktoś wracał stamtąd do Krakowa i nazwał tak kawałek skały nad Wisłą.',
        dilemma: {
          question:
            'Wspinaczka na skałkach ściera skałę, wybija chwyty i płoszy ptaki. Czy sport ma pierwszeństwo przed przyrodą w miejscu, które jest rezerwatem krajobrazowym?',
          options: ['Tak, to tradycja tego miejsca', 'Nie, przyroda przede wszystkim', 'Tylko na wyznaczonych ścianach'],
          counterpoint:
            'Wspinacze byli tu wcześniej niż ochrona i to oni pilnują, żeby skałek nikt nie zasypał ani nie zabudował. Ale sto lat butów na tej samej ścianie zostawia ślad, a sokoły i nietoperze nie mają gdzie się przenieść.',
        },
        sources: ['https://mynaszlaku.pl/zakrzowek-skalki-twardowskiego-dojazd-cennik-i-godziny-otwarcia/'],
        coords: [19.90844, 50.03908],
        radius: 45,
      },
      {
        id: 'uroczysko',
        category: 'nature',
        name: 'Uroczysko Skałki Twardowskiego',
        teaser: 'Tablica przyrodnicza w środku miejskiego lasu, początek szlaku po skałkach.',
        description: [
          'Uroczysko to fragment lasów miejskich Krakowa: ścieżki, tablice przyrodnicze i zielony szlak prowadzący przez cały grzbiet skałek. Rośnie tu roślinność ciepłolubna, typowa dla wapiennych zboczy Jury, tuż obok bloków Ruczaju.',
          'To najlepsze miejsce na start wyprawy: stąd ścieżki rozchodzą się do groty, na ściany wspinaczkowe i w dół, na brzeg zalewu.',
        ],
        findHint: 'Tablica informacyjna przy głównym wejściu do uroczyska, od strony ul. Norymberskiej.',
        reveal:
          'Cały ten grzbiet to pozostałość kilku osobnych kamieniołomów: Łom Bergera, Skałki, Kapelanka i Zakrzówek. Miasto najpierw zjadło tu wzgórze, a potem zrobiło z resztek rezerwat i las miejski.',
        dilemma: {
          question:
            'Miasto rośnie i potrzebuje mieszkań. Ruczaj podchodzi pod same skałki. Gdzie postawiłbyś granicę: chronić dziką zieleń czy budować dla ludzi?',
          options: ['Chronić, zieleni nie odtworzysz', 'Budować, ludzie potrzebują domów', 'Zabudowa tak, ale niżej'],
          counterpoint:
            'Każdy hektar niezabudowany tutaj to mieszkania, które powstaną dalej od centrum, czyli więcej samochodów i betonu gdzie indziej. Ale skałki mają 150 milionów lat i jedno pokolenie deweloperów wystarczy, żeby zostały z nich widoki z okien.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Ska%C5%82ki_Twardowskiego'],
        coords: [19.90908, 50.04302],
        radius: 50,
      },
    ],
  },
  {
    parkId: 'skawina-pilsudskiego',
    /* tężnia doszła jako czwarty punkt, ale pieczątka zostaje za trzy: kto ma
       ochotę, dobiera ciekawostkę, kto nie, kończy wyprawę tak jak dotąd */
    stampAt: 3,
    pois: [
      {
        id: 'dab-pomnik',
        category: 'nature',
        name: 'Stary dąb',
        teaser: 'Pomnik przyrody w środku parku, starszy od samego parku.',
        description: [
          'Park Miejski w Skawinie założono w 1927 roku na 2,5 hektara w samym centrum miasta, trzy minuty od rynku. Rośnie tu około 60 gatunków drzew, a najstarszy dąb jest pomnikiem przyrody: stał tu, zanim ktokolwiek pomyślał o parku.',
          'To park kieszonkowy w najlepszym sensie: mały, gęsty i codzienny, z alejkami asfaltowymi pod rolki i wózki, amfiteatrem na koncerty i miejscem na miejskie święta.',
        ],
        findHint: 'Środek parku, największe drzewo przy głównej alei.',
        reveal:
          'Dąb ma tabliczkę pomnika przyrody, czyli status prawny silniejszy niż większość budynków w mieście. Drzewo można obalić tylko za zgodą urzędu, a budynek obok wyburzy się szybciej.',
        dilemma: {
          question:
            'Stare drzewo w centrum z czasem zaczyna przeszkadzać: gałęzie nad alejką, korzenie pod chodnikiem. Ciąć czy przebudować to, co wokół?',
          options: [
            'Przebudować otoczenie, dąb był tu pierwszy',
            'Ciąć, bezpieczeństwo ludzi jest ważniejsze',
            'Dopiero po ekspertyzie dendrologa',
          ],
          counterpoint:
            'Stustuletniego dębu nie odtworzysz w ciągu życia: nowe drzewo daje ten sam cień po trzydziestu latach. Ale spadająca gałąź to realne ryzyko, a odszkodowanie płaci miasto. Dendrolog zwykle potrafi uratować drzewo cięciem i przesunięciem alejki, tylko to droższe od piły, i dlatego drzewa padają.',
        },
        sources: ['https://www.nawycieczke.pl/pl/atrakcja/park-miejski-w-skawinie'],
        coords: [19.82162, 49.97394],
        radius: 40,
      },
      {
        id: 'sokol',
        category: 'history',
        name: 'Sokół i pomnik króla',
        teaser: 'Budynek Towarzystwa Gimnastycznego Sokół z 1906 i pomnik założyciela miasta.',
        description: [
          'W północnej części parku stoi dawny budynek Towarzystwa Gimnastycznego "Sokół" z 1906 roku, dziś Centrum Kultury i Sportu. Obok pomnik Kazimierza Wielkiego, który nadał Skawinie prawa miejskie w 1364 roku.',
          '"Sokół" to była sieć polskich towarzystw gimnastycznych z czasów zaborów: ćwiczono w nich ciało, ale prawdziwym celem było utrzymanie polskości i przygotowanie ludzi do walki o niepodległość.',
        ],
        findHint: 'Północna część parku, budynek z charakterystyczną wieżyczką i pomnik przed nim.',
        reveal:
          'Skawina powstała z decyzji jednego króla w 1364 roku, w tym samym czasie, gdy zakładał Akademię Krakowską. Sokół obok jest o 542 lata młodszy, a oba obiekty stoją w parku wielkości dwóch boisk.',
        dilemma: {
          question:
            'Towarzystwa "Sokół" uczyły gimnastyki, żeby przygotować młodych do walki o Polskę. Czy sport powinien służyć polityce, jeśli sprawa jest słuszna?',
          options: ['Tak, wtedy było trzeba', 'Nie, sport ma być wolny', 'Zależy, kto o tym decyduje'],
          counterpoint:
            'Bez tych organizacji nie byłoby kadr Legionów ani wielu polskich instytucji po 1918. Ale ten sam mechanizm, sport jako narzędzie ideologii, w XX wieku obsługiwał także reżimy, którym nikt nie kibicuje. Narzędzie jest to samo, różni się cel.',
        },
        photo: '/photos/skawina-sokol.jpg',
        photoCredit: 'Fot. Januszk57 · CC BY-SA 3.0 pl · Wikimedia Commons',
        sources: ['https://www.metropoliakrakowska.pl/obiekt-szczegoly/park-miejski-im-marszalka-jozefa-pilsudskiego_aekXoTd423GWh738VCGJ'],
        coords: [19.82325, 49.97458],
        radius: 55,
      },
      {
        id: 'starorzecze',
        category: 'water',
        name: 'Starorzecze Skawinki',
        teaser: 'Malownicze stare zakole rzeki na skraju parku.',
        description: [
          'Skawinka kiedyś płynęła inaczej: to zakole zostało po jej dawnym biegu, gdy rzekę przekierowano. Dziś jest najbardziej "dzikim" fragmentem parku, z wodą, ptakami i innym mikroklimatem niż alejki obok.',
          'Starorzecza to typowe pamiątki po regulowaniu rzek: przez sto lat prostowaliśmy je w całej Polsce, żeby chronić się od powodzi, a dziś przywracamy im meandry, bo okazało się, że proste rzeki płyną szybciej i topią mocniej.',
        ],
        findHint: 'Skraj parku od strony rzeki, ścieżka wzdłuż wody.',
        reveal:
          'To zakole jest świadkiem eksperymentu, który Polska prowadziła sto lat: wyprostować każdą rzekę. Dziś kosztem miliardów przywracamy meandry, bo prosta rzeka to szybsza fala powodziowa.',
        dilemma: {
          question:
            'Sto lat prostowaliśmy rzeki, teraz kosztem miliardów robimy z nich znów meandry. Czy powinniśmy naprawiać błędy poprzednich pokoleń, czy dostosować się do tego, co zostało?',
          options: ['Naprawiać, mamy dowody', 'Dostosować się, to za drogie', 'Naprawiać tam, gdzie grozi powódź'],
          counterpoint:
            'Renaturyzacja realnie obniża fale powodziowe, więc wydatek zwraca się przy pierwszej dużej wodzie. Ale każde pokolenie jest przekonane, że wie lepiej niż poprzednie, a nasze wnuki będą oglądać nasze decyzje z takim samym zdziwieniem.',
        },
        /* Zdjęcie bez współrzędnych, ale kładka nad starym korytem jest w OSM
           zmapowana tylko w tym parku, więc to ten sam obiekt, kilkadziesiąt
           metrów dalej wzdłuż wody */
        photo: '/photos/poi-skawina-pilsudskiego-starorzecze.jpg',
        photoCredit: 'Fot. Anka Małota · CC BY-SA 3.0 · Wikimedia Commons',
        sources: ['https://skawina.tv/skawina-odkryj-piekno-przyrody-i-parki/'],
        coords: [19.82035, 49.97402],
        radius: 45,
      },
      {
        id: 'teznia',
        category: 'water',
        name: 'Tężnia solankowa',
        teaser: 'Solanka spływa po tarninie i robi morskie powietrze. [ciekawostka]',
        description: [
          'Najnowszy obiekt w parku: tężnia otwarta w kwietniu 2026 roku, postawiona przy starym korycie Skawinki. Solanka spływa po ścianach z gałęzi tarniny, rozbija się na mgłę i robi wokół siebie aerozol, którym się oddycha jak nad morzem.',
          'Projekt wyszedł z pracowni architektury krajobrazu LandLAB, a bryła jest świadomym nawiązaniem do komory solnej. Budowa kosztowała 485 300 złotych, z czego 242 788 dołożyło Województwo Małopolskie z programu „Małopolskie tężnie solankowe”.',
          'Punkt dodatkowy: pieczątkę parku dostaniesz za trzy pozostałe.',
        ],
        findHint: 'Północna część parku, przy starorzeczu, drewniana konstrukcja z kapiącą wodą.',
        reveal:
          'Tężnia nie leczy powietrza w mieście, robi jedną małą chmurę czystego. Skawina, którą Światowa Organizacja Zdrowia wpisała w 2016 roku na dwunaste miejsce najbardziej zanieczyszczonych miast Unii, wydała na tę chmurę pół miliona złotych.',
        dilemma: {
          question:
            'Pół miliona na tężnię w mieście z problemem powietrza: leczyć objaw, czy przyczynę?',
          options: [
            'Przyczynę: te pieniądze to filtry i wymiana pieców',
            'Objaw też się liczy: ludzie oddychają dziś, nie w 2035',
            'Jedno i drugie, ale najpierw powiedzcie mieszkańcom, co jest czym',
          ],
          counterpoint:
            'Tężnia daje realną ulgę drogom oddechowym i ściąga ludzi do parku, więc nie jest fikcją. Ale kosztuje tyle, co kilkadziesiąt wymian pieca, a te działają cały rok i na całą dzielnicę. Kłopot w tym, że tężnię widać na zdjęciu z otwarcia, a wymienionego pieca nie.',
        },
        sources: [
          'https://www.malopolskie24info.pl/2026/04/27/teznia-solankowa-w-skawinie-oficjalnie-otwarta-nowe-miejsce-relaksu-dla-mieszkancow/',
          'https://skawina24.com/wspolczesna-interpretacja-komory-solnej-teznia-w-parku/',
          'https://pl.wikipedia.org/wiki/Skawina',
        ],
        coords: [19.82082, 49.97406],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'park-jordana',
    pois: [
      {
        id: 'pomnik-jordana',
        category: 'monument',
        name: 'Pomnik Henryka Jordana',
        teaser: 'Pomnik twórcy parku, w głównej alei od 1914 roku.',
        description: [
          'Henryk Jordan był krakowskim lekarzem-położnikiem, który w 1889 roku zrobił coś w Europie niemal niesłychanego: założył publiczny park przeznaczony do zabawy i ćwiczeń dzieci. Boiska, przyrządy gimnastyczne, mleczarnia z darmowym mlekiem — i wstęp bez opłat.',
          'Jordan nie był sponsorem-figurantem: osobiście dobierał przewodników zabaw, organizował grupy i prowadził dzieciom pogadanki o polskiej historii, w czasach, gdy Polski nie było na mapie.',
          'Pomnik twórcy stanął w parku w 1914 roku i patrzy na główną aleję do dziś. Od nazwiska doktora pochodzą "ogródki jordanowskie", które znasz z każdego polskiego miasta.',
        ],
        findHint: 'Główna aleja, w połowie drogi między wejściem od al. 3 Maja a stawem.',
        reveal:
                    'Jordan, lekarz i społecznik, stworzył pionierski w Europie park zabaw. Osobiście dobierał przewodników i prowadził dzieciom pogadanki o polskiej historii. Wstęp od początku był bezpłatny.',
        dilemma: {
          question:
            'Jordan zbudował park dla dzieci, ale organizował im zabawę według własnego programu: ćwiczenia, grupy, pogadanki. Czy dzieci potrzebują zaplanowanej zabawy, czy raczej wolnej przestrzeni i nudy?',
          options: ['Zaplanowanej, uczy więcej', 'Wolnej, nuda tworzy wyobraźnię', 'Po połowie'],
          counterpoint:
            'W czasach Jordana alternatywą dla parku była praca dzieci i podwórko przy rynsztoku, więc program był łaską. Ale badania nad rozwojem mówią dziś, że dzieci najwięcej wynoszą z zabawy, której nikt nie prowadzi, a współczesne dziecko ma kalendarz gęstszy niż dorosły.',
        },
        photo: '/photos/jordana-popiersia.jpg',
        photoCredit: "Fot. Januszk57 · CC BY-SA 3.0 pl · Wikimedia Commons",
        sources: ['https://pl.wikipedia.org/wiki/Park_im._Henryka_Jordana_w_Krakowie'],
        coords: [19.91747, 50.06275],
        radius: 35,
      },
      {
        id: 'popiersia',
        category: 'monument',
        name: 'Aleja popiersi',
        teaser: 'Kilkadziesiąt marmurowych popiersi sławnych Polaków wokół rond parku.',
        description: [
          'Wokół parkowych rond stoi kilkadziesiąt marmurowych popiersi wielkich Polaków: od Kopernika i Kochanowskiego, przez Skłodowską i Piłsudskiego, po Pileckiego, Herberta i Andersa. Kolekcję zaczął sam Jordan, a miasto uzupełnia ją do dziś.',
          'Popiersia wykonano z jasnego marmuru z alpejskiego Laas, wybranego, bo dobrze znosi krakowski klimat. Galeria miała być lekcją historii pod gołym niebem: Jordan chciał, żeby dzieci bawiły się wśród twarzy tych, o których im opowiadał.',
          'W czasie okupacji część rzeźb zniknęła z parku w tajemniczych okolicznościach. Wyjaśnienie znajdziesz na miejscu.',
        ],
        findHint: 'Ronda w centralnej i południowej części parku, popiersia stoją w kręgach wokół alejek.',
        reveal:
          'W czasie okupacji rzeźbiarz Kazimierz Łuczywo ukrywał popiersia we własnej pracowni, ratując je przed zniszczeniem. Dzięki niemu galeria przetrwała wojnę.',
        dilemma: {
          question:
            'Kolekcja rośnie: miasto dodaje kolejne popiersia wybranych postaci. Kto powinien decydować, czyja twarz stoi w parku, gdzie bawią się dzieci?',
          options: ['Historycy i eksperci', 'Mieszkańcy w głosowaniu', 'Nikt, wystarczy ta kolekcja'],
          counterpoint:
            'Eksperci nie ulegają modzie, ale wybierają w swoim gronie i za zamkniętymi drzwiami. Mieszkańcy mają prawo do swojego panteonu, tylko że plebiscyt wybiera to, co popularne dzisiaj, a pomnik stoi sto lat.',
        },
        photo: '/photos/jordana-pomnik.jpg',
        photoCredit: "Fot. Magdalia25 · CC BY-SA 3.0 pl · Wikimedia Commons",
        sources: ['https://pl.wikipedia.org/wiki/Park_im._Henryka_Jordana_w_Krakowie'],
        coords: [19.9177, 50.0625],
        radius: 45,
      },
      {
        id: 'wojtek',
        category: 'monument',
        name: 'Niedźwiedź Wojtek',
        teaser: 'Pomnik niedźwiedzia w północnej części parku.',
        description: [
          'Wojtek trafił do polskiego wojska w Iranie w 1942 roku jako osierocony niedźwiadek kupiony od pastuszka. Dorastał wśród żołnierzy 2. Korpusu generała Andersa: pił piwo, siłował się z żołnierzami i jeździł w szoferce ciężarówek.',
          'Żeby mógł płynąć z armią do Włoch, został oficjalnie wcielony do 22. Kompanii Zaopatrywania Artylerii, z żołdem i książeczką wojskową. Pod Monte Cassino nosił skrzynki z pociskami artyleryjskimi, a kompania ma go w emblemacie do dziś.',
          'Pomnik w parku Jordana odsłonięto w 2014 roku, w rocznicę bitwy.',
        ],
        findHint: 'Północna część parku, przy alejce od strony ul. Reymonta.',
        reveal:
          'Po wojnie Wojtek zamieszkał w zoo w Edynburgu. Polscy weterani przeskakiwali płot wybiegu, żeby go uściskać i zawołać po polsku. Podobno do końca życia reagował na polską mowę.',
        dilemma: {
          question:
            'Wojtek był niedźwiedziem wcielonym do armii, wożonym po froncie i pojonym piwem, a potem oddanym do zoo. Bohater czy zwierzę, które wykorzystaliśmy do naszej historii?',
          options: ['Bohater, kochali go', 'Zwierzę bez wyboru', 'Jedno i drugie naraz'],
          counterpoint:
            'Dla żołnierzy bez domu Wojtek był rodziną i to widać w każdym wspomnieniu. Ale niedźwiedź nigdy nie wybrał ani wojny, ani klatki w Edynburgu, w której spędził resztę życia bez ludzi, których znał. Dobre intencje nie zmieniają tego, że decydowaliśmy za niego.',
        },
        photo: '/photos/jordana-wojtek.jpg',
        photoCredit: 'Fot. Skabiczewski · CC BY-SA 4.0 · Wikimedia Commons',
        sources: ['https://pl.wikipedia.org/wiki/Park_im._Henryka_Jordana_w_Krakowie'],
        coords: [19.91635, 50.06424],
        radius: 35,
      },
      {
        id: 'banach',
        category: 'monument',
        name: 'Pomnik Stefana Banacha',
        teaser: 'Pomnik matematyka przy wschodniej alei.',
        description: [
          'Stefan Banach to największe nazwisko polskiej matematyki: twórca analizy funkcjonalnej, człowiek, od którego nazwiska pochodzą przestrzenie Banacha, znane każdemu studentowi matematyki na świecie.',
          'Nie miał ukończonych studiów, gdy w 1916 roku wydarzył się jeden z najsłynniejszych przypadków w historii nauki: profesor Hugo Steinhaus, spacerując przez krakowskie Planty, usłyszał dwóch młodych ludzi rozmawiających o całce Lebesgue’a, temacie tak niszowym, że aż przystanął.',
          'Jednym z rozmówców był Banach. Steinhaus mówił potem, że Banach był jego "największym odkryciem matematycznym".',
        ],
        findHint: 'Wschodnia aleja parku, bliżej ul. Reymonta.',
        reveal:
          'Banacha odkryto przez podsłuchaną rozmowę: w 1916 Steinhaus usłyszał na Plantach studentów rozmawiających o całce Lebesgue’a. Przystanął. Tak zaczęła się kariera geniusza bez dyplomu.',
        dilemma: {
          question:
            'Banach nie miał ukończonych studiów; karierę zaczął dzięki przypadkowemu spotkaniu. Ilu takich ludzi przegapiamy dzisiaj, gdy wszystko idzie przez dyplomy i rekrutacje?',
          options: ['Bardzo wielu', 'Niewielu, systemy działają', 'Dziś ma szansę, ale w internecie'],
          counterpoint:
            'Systemy formalne dały szansę milionom, których wcześniej nikt nie usłyszałby na spacerze, bo nie mieli znajomych profesorów. Ale sito, które przepuszcza tylko papier, gubi dokładnie ten typ człowieka, którym był Banach.',
        },
        photo: '/photos/jordana-banach.jpg',
        photoCredit: 'Fot. Pawel Swiegoda (Paberu) · CC BY 3.0 · Wikimedia Commons',
        sources: ['https://pl.wikipedia.org/wiki/Park_im._Henryka_Jordana_w_Krakowie'],
        coords: [19.91866, 50.06381],
        radius: 35,
      },
    ],
  },
  {
    parkId: 'planty',
    pois: [
      {
        id: 'kopernik',
        category: 'monument',
        name: "Pomnik Kopernika",
        teaser: "Astronom z globusem, przy Collegium Novum.",
        description: [
          "Mikołaj Kopernik stoi tu jako student, nie jako sławny astronom: pomnik pokazuje młodego człowieka, który właśnie skończył studia w Krakowie i trzyma sferę armilarną, przyrząd do obserwacji nieba.",
          "Rzeźbę wykonał Cyprian Godebski, a odsłonięto ją w 1900 roku na dziedzińcu Collegium Maius. Na Planty przeniesiono ją w latach pięćdziesiątych, gdy uniwersytet potrzebował miejsca.",
          "To jeden z tych pomników, przy których warto stanąć i policzyć: Kopernik studiował w Krakowie w latach 1491-1495, czyli pół wieku przed publikacją dzieła, które przestawiło Ziemię z centrum świata.",
        ],
        findHint: "Przy Collegium Novum, po stronie ul. Gołębiej. Szukaj postaci z metalową kulą w dłoni.",
        reveal: "Pomnik stał pierwotnie na dziedzińcu Collegium Maius i patrzył na mury, w których Kopernik faktycznie się uczył. Przeprowadzka na Planty w 1953 roku miała być tymczasowa.",
        dilemma: {
          question: "Pomnik zabrano z miejsca, które miało znaczenie, i postawiono tam, gdzie było wygodniej. Czy pomnik znaczy to samo w nowym miejscu?",
          options: ["Znaczy to samo", "Traci sens", "Zyskuje nowy sens"],
          counterpoint: "Na Plantach widzi go dziennie tysiąc razy więcej ludzi niż na zamkniętym dziedzińcu, więc jako przypomnienie działa lepiej. Ale pomnik przy Collegium Maius mówił coś konkretnego: tu chodził. Tutaj mówi już tylko: był ważny.",
        },
        photo: '/photos/poi-planty-kopernik.jpg',
        photoCredit: 'Fot. unknown · CC BY 2.5 · Wikimedia Commons',
        coords: [19.93276, 50.06132],
        radius: 30,
      },
      {
        id: 'chopin',
        category: 'monument',
        name: "Chopin Marii Jaremy",
        teaser: "Nietypowy pomnik kompozytora w ogrodzie przy Wawelu.",
        description: [
          "Ten Chopin nie ma fraka ani fortepianu. Rzeźba Marii Jaremy z 1949 roku pokazuje muzykę jako formę, nie postać, i była jak na swoje czasy odważnie nowoczesna.",
          "Jarema była jedną z najważniejszych polskich artystek awangardy, współzałożycielką Grupy Krakowskiej i Teatru Cricot. W czasie, gdy oficjalna sztuka szła w socrealizm, ona rzeźbiła abstrakcję.",
          "Warto obejść pomnik z każdej strony: zmienia się z każdym krokiem, co było zamierzone. To rzeźba do chodzenia wokół, nie do zdjęcia z jednego ujęcia.",
        ],
        findHint: "Ogród Plant przy Wawelu, blisko ul. Podzamcze.",
        reveal: "Maria Jarema wykonała tę rzeźbę w roku, w którym w Polsce ogłoszono socrealizm jako obowiązujący styl. Abstrakcyjny Chopin był więc cichym akt oporu, przemyconym do parku.",
        dilemma: {
          question: "Czy pomnik ma przypominać, jak ktoś wyglądał, czy oddawać to, co po nim zostało?",
          options: ["Ma przypominać osobę", "Ma oddawać dzieło", "Ma być piękny sam w sobie"],
          counterpoint: "Realistyczny pomnik rozpoznaje każdy, także dziecko: to najprostszy sposób, żeby przekazać pamięć dalej. Ale muzyki nie da się pokazać twarzą, a Jarema próbowała pokazać właśnie muzykę. Cena jest taka, że wielu przechodzących nie wie, kogo mija.",
        },
        coords: [19.93403, 50.05932],
        radius: 30,
      },
      {
        id: 'matejko',
        category: 'monument',
        name: "Pomnik Matejki",
        teaser: "Malarz historii Polski, w ogrodzie przy Barbakanie.",
        description: [
          "Jan Matejko namalował Polskę taką, jaką chciał, żeby pamiętano: z Grunwaldem, hołdem pruskim i Batorym pod Pskowem. Robił to w czasach, gdy Polski nie było na mapie, a jego obrazy były jedyną wersją historii, jaką widziały całe pokolenia.",
          "Mieszkał kilka minut stąd, przy ul. Floriańskiej, gdzie dziś działa jego dom-muzeum. Uczył w krakowskiej Szkole Sztuk Pięknych, a jego uczniami byli Wyspiański, Mehoffer i Malczewski.",
          "Pomnik stoi w tej części Plant, w której najwięcej wycieczek: między Barbakanem a Bramą Floriańską. Matejko patrzy dokładnie na trasę, którą wchodzą do miasta turyści.",
        ],
        findHint: "Ogród Barbakan, blisko Bramy Floriańskiej.",
        reveal: "Matejko sam ratował krakowskie zabytki: interweniował w sprawie murów, Sukiennic i kościoła Mariackiego. Gdy miasto chciało wyburzyć kolejne fragmenty fortyfikacji, jego głos ważył więcej niż urzędowe opinie.",
        dilemma: {
          question: "Matejko malował historię tak, żeby budowała dumę, czasem naciągając fakty. Czy sztuce wolno poprawiać przeszłość, jeśli robi to dla dobrego celu?",
          options: ["Wolno, to sztuka", "Nie, to zniekształca pamięć", "Zależy, czy widz o tym wie"],
          counterpoint: "Bez tych obrazów pokolenia pod zaborami nie miałyby wspólnego wyobrażenia o własnym kraju, a to trzymało naród razem. Ale dziś większość ludzi pamięta Grunwald właśnie jako scenę Matejki, nie jako bitwę, o której wiemy niewiele.",
        },
        coords: [19.94105, 50.06539],
        radius: 30,
      },
      {
        id: 'skrzynecki',
        category: 'history',
        name: "Skwer Piotra Skrzyneckiego",
        teaser: "Miejsce pamięci twórcy Piwnicy pod Baranami.",
        description: [
          "Piotr Skrzynecki prowadził Piwnicę pod Baranami przez czterdzieści lat, od 1956 roku aż do śmierci w 1997. Kabaret w piwnicy przy Rynku był w czasach PRL wyspą wolnego słowa, na którą przychodziło całe artystyczne Kraków.",
          "Sam Skrzynecki nie śpiewał ani nie pisał tekstów. Był konferansjerem i duszą całości: chodził po mieście w kapeluszu z kwiatkiem, z dzwonkiem i papierosem, i każdemu mówił, że jest genialny.",
          "Ten skwer to jedno z kilku miejsc w mieście, które o nim przypominają. Drugie jest w Parku Decjusza, a trzecim jest po prostu jego stolik w Vis-à-vis przy Rynku.",
        ],
        findHint: "Planty przy ul. Franciszkańskiej, w stronę Wawelu.",
        reveal: "Skrzynecki nie miał etatu ani pensji z Piwnicy. Utrzymywał się z pracy w muzeum i zajęć zleconych, a kabaret prowadził za darmo, przez cztery dekady.",
        dilemma: {
          question: "Piwnica działała w państwie, które cenzurowało wszystko, a jednak pozwalano jej istnieć. Czy taka wolność w klatce była zwycięstwem, czy wentylem bezpieczeństwa dla władzy?",
          options: ["Zwycięstwem wolności", "Wentylem dla władzy", "Jednym i drugim"],
          counterpoint: "Władza zyskiwała dowód, że w Polsce można żartować, i miała artystów w jednym miejscu, pod okiem. Ale ludzie wychodzili stamtąd z poczuciem, że wolno myśleć inaczej, a tego nie da się cofnąć.",
        },
        coords: [19.93429, 50.05836],
        radius: 30,
      },
          {
        id: 'krak',
        category: 'monument',
        name: "Pomnik Kraka",
        teaser: "Legendarny założyciel miasta, w ogrodzie przy Wawelu.",
        description: [
          "Krak jest postacią, której najprawdopodobniej nigdy nie było, a mimo to ma w Krakowie pomnik, kopiec i nazwę miasta. To dobry przykład na to, że legenda potrafi zostawić więcej śladów niż wielu realnych ludzi.",
          "Najstarsza wersja opowieści pochodzi z XIII wieku, od Wincentego Kadłubka: Krak miał zabić smoka i zbudować gród na Wawelu. Sto lat później Jan Długosz dopisał, że pochowano go w kopcu na Wzgórzu Lasoty.",
          "Ten punkt najlepiej zaliczyć w parze z Kopcem Krakusa, po drugiej stronie Wisły. To ta sama historia, tylko opowiedziana raz w kamieniu, a raz w ziemi.",
        ],
        findHint: "Planty w stronę Wawelu, przy ul. Bernardyńskiej.",
        reveal: "Kraków jest jednym z niewielu miast w Europie, którego nazwa pochodzi od postaci z legendy, a nie od króla, świętego czy rzeki. Miasto istnieje, założyciel prawdopodobnie nie.",
        dilemma: {
          question: "Miasto nosi imię człowieka, który być może nigdy nie żył. Czy legenda jest gorszym fundamentem niż historia?",
          options: ["Gorszym, liczą się fakty", "Równie dobrym", "Lepszym, bo łączy ludzi"],
          counterpoint: "Legenda nie musi być prawdziwa, żeby robić robotę: daje wspólną opowieść, w której każdy mieszkaniec ma udział. Ale wspólnota zbudowana na opowieści jest krucha, gdy ktoś zacznie sprawdzać, co w niej faktycznie się zdarzyło.",
        },
        photo: '/photos/poi-planty-krak.jpg',
        photoCredit: 'Fot. Zygmunt Put Zetpe0202 · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.94117, 50.06074],
        radius: 30,
      },
      {
        id: 'collegium-novum',
        category: 'history',
        name: "Collegium Novum",
        teaser: "Gmach uniwersytetu, w którym Niemcy aresztowali profesorów.",
        description: [
          "Sześć listopada 1939 roku Niemcy zwołali w tym budynku zebranie kadry Uniwersytetu Jagiellońskiego, zapowiadając wykład o polityce oświatowej. Zamiast wykładu weszło gestapo.",
          "Aresztowano 183 osoby: profesorów, docentów i asystentów, i wywieziono ich do Sachsenhausen. Kilkanaście osób zmarło w obozie, kilku po zwolnieniu. Akcja miała nazwę Sonderaktion Krakau i była częścią planu likwidacji polskiej inteligencji.",
          "Uniwersytet działał potem w konspiracji: tajne wykłady, egzaminy w mieszkaniach, dyplomy wypisywane po wojnie. Collegium Novum stoi dziś jak stało, z tablicą przy wejściu.",
        ],
        findHint: "Neogotycki gmach przy ul. Gołębiej, tuż przy Plantach i pomniku Kopernika.",
        reveal: "Zebranie zwołano oficjalnym pismem, więc profesorowie przyszli sami, w garniturach, z notatnikami. Niemcy nie musieli nikogo szukać po domach.",
        dilemma: {
          question: "Profesorowie przyszli, bo wezwał ich urząd. Czy w państwie, które okazuje się wrogiem, posłuszeństwo instytucjom jest naiwnością?",
          options: ["Naiwnością", "Rozsądkiem w tamtym momencie", "Nie mieli wyboru"],
          counterpoint: "W listopadzie 1939 nikt jeszcze nie wiedział, do czego zdolna jest ta władza, a odmowa oznaczała pewne represje: przyjście było racjonalne. Ale to właśnie pokazuje, jak łatwo aparat państwa może użyć zwykłej urzędowej rutyny do rzeczy, której nikt się nie spodziewa.",
        },
        coords: [19.93311, 50.06087],
        radius: 55,
      },
      {
        id: 'ginczanka',
        category: 'monument',
        name: "Tablica Zuzanny Ginczanki",
        teaser: "Pamięć o poetce zamordowanej w Krakowie w 1944 roku.",
        description: [
          "Zuzanna Ginczanka była jedną z najbardziej obiecujących poetek międzywojnia: debiutowała jako nastolatka, pisała wiersze pełne życia i ironii, była gwiazdą warszawskich kawiarni literackich.",
          "W czasie okupacji ukrywała się we Lwowie, a potem w Krakowie. Została wydana przez donos, aresztowana i zamordowana w 1944, kilka miesięcy przed końcem wojny. Miała dwadzieścia siedem lat.",
          "Jej najbardziej znany wiersz, Non omnis moriar, jest oskarżeniem osoby, która ją wydała, wypowiedzianym z góry i bez złudzeń. Po wojnie stał się dowodem w procesie.",
        ],
        findHint: "Planty po stronie ul. Mikołajskiej, blisko Teatru Słowackiego.",
        reveal: "Wiersz Non omnis moriar wymienia z nazwiska osobę, która ją wydała, i wylicza jej, co po niej odziedziczy. Po wojnie użyto go w sądzie: jeden z niewielu przypadków, gdy wiersz był dowodem w sprawie.",
        dilemma: {
          question: "Poetka oskarżyła swoją donosicielkę w wierszu, a wiersz trafił do sądu. Czy literatura powinna być dowodem?",
          options: ["Powinna, to świadectwo", "Nie, to sztuka", "Tylko razem z innymi dowodami"],
          counterpoint: "Ofiara zostawiła jedyne świadectwo, jakie mogła zostawić, i byłoby okrutne je zignorować. Ale wiersz jest formą, w której wolno przesadzać i zmyślać, a sąd musi opierać się na czymś, co da się sprawdzić.",
        },
        coords: [19.94259, 50.0615],
        radius: 70,
      },
      {
        id: 'teatr-slowackiego',
        category: 'history',
        name: "Teatr im. Słowackiego",
        teaser: "Gmach, dla którego wyburzono klasztor, dziś duma miasta.",
        description: [
          "Teatr otwarto w 1893 roku i był wtedy jednym z najnowocześniejszych w Europie: miał oświetlenie elektryczne i żelazną kurtynę przeciwpożarową, gdy w innych miastach wciąż grano przy gazie.",
          "Budowa wywołała jeden z największych sporów w historii miasta, bo pod teatr wyburzono zabytkowy klasztor i kościół Duchaków. Protestował między innymi Jan Matejko, który w geście sprzeciwu oddał honorowe obywatelstwo Krakowa.",
          "Tu miała premierę Wesele Wyspiańskiego w 1901 roku, przedstawienie, które zmieniło polski teatr. Fasada wzorowana jest na Operze Paryskiej.",
        ],
        findHint: "Plac św. Ducha, na skraju Plant przy Bramie Floriańskiej.",
        reveal: "Matejko był tak przeciwny wyburzeniu klasztoru, że zwrócił miastu honorowe obywatelstwo i zerwał kontakty z radą. Dziś teatr jest wizytówką Krakowa, a kościoła nikt nie pamięta.",
        dilemma: {
          question: "Zburzono zabytek, żeby zbudować teatr, który dziś jest chwałą miasta. Czy cel usprawiedliwił stratę?",
          options: ["Usprawiedliwił", "Nie, strata jest trwała", "Ocenimy za sto lat"],
          counterpoint: "Teatr dał miastu scenę, na której zdarzył się przełom w polskiej kulturze, a klasztor był jednym z wielu. Ale dokładnie tak brzmi każde uzasadnienie wyburzenia, także te, których dziś żałujemy, i nikt nie pyta budynków o zgodę.",
        },
        photo: '/photos/poi-planty-teatr-slowackiego.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.94305, 50.06395],
        radius: 65,
      },
      {
        id: 'brama-rzeznicza',
        category: 'history',
        name: "Brama Rzeźnicza",
        teaser: "Ślad jednej z bram, które zniknęły z murów miasta.",
        description: [
          "Kraków miał osiem bram miejskich. Została jedna: Floriańska. Reszta padła na początku XIX wieku, gdy Austriacy zdecydowali rozebrać fortyfikacje i zrobić na ich miejscu ogród, czyli dzisiejsze Planty.",
          "Brama Rzeźnicza stała po wschodniej stronie miasta, przy dzisiejszym Teatrze Słowackiego. Nazwa wzięła się z prozaicznego powodu: obok pracowali rzeźnicy.",
          "Dziś zostały fragmenty i oznaczenia w bruku. Idąc Plantami, przechodzisz przez linię murów kilkanaście razy, nie zauważając ani razu.",
        ],
        findHint: "Okolice Teatru Słowackiego i placu św. Ducha, szukaj oznaczeń w nawierzchni.",
        reveal: "Mury ocalały tylko dzięki jednemu człowiekowi: profesor Feliks Radwański przekonał władze, że fragment z Bramą Floriańską i Barbakanem chroni miasto od północnych wiatrów i zdrowia mieszkańców. Argument był naciągany, ale zadziałał.",
        dilemma: {
          question: "Mury ocalono, podając powód, w który sam autor nie wierzył. Czy wolno kłamać, żeby ratować zabytek?",
          options: ["Wolno, cel był dobry", "Nie, to podstęp", "To była retoryka, nie kłamstwo"],
          counterpoint: "Dzięki temu argumentowi Kraków ma dziś Barbakan i najbardziej rozpoznawalną bramę w Polsce, więc trudno żałować. Ale ten sam mechanizm, czyli wymyślony powód podany urzędowi, działa równie dobrze przy wyburzaniu jak przy ratowaniu.",
        },
        coords: [19.94328, 50.06091],
        radius: 35,
      },
      {
        id: 'narcyz-wiatr',
        category: 'monument',
        name: "Pomnik Narcyza Wiatra",
        teaser: "Dowódca Batalionów Chłopskich, zastrzelony po wojnie.",
        description: [
          "Narcyz Wiatr dowodził Batalionami Chłopskimi w Okręgu Krakowskim, jednej z największych formacji podziemia. W czasie wojny działał w konspiracji, po wojnie nie złożył broni ideowo i został wrogiem nowej władzy.",
          "Zginął w Krakowie 21 kwietnia 1945 roku, zastrzelony przez funkcjonariusza Urzędu Bezpieczeństwa na ulicy, gdy wojna w Europie jeszcze trwała.",
          "To jeden z tych pomników, przy których warto przystanąć, bo mówi o czasie, którego w szkole uczy się najkrócej: pierwszych miesiącach po wyzwoleniu, gdy dla wielu ludzi wojna się nie skończyła.",
        ],
        findHint: "Planty na odcinku wzdłuż ul. Westerplatte.",
        reveal: "Zginął dwa i pół tygodnia przed kapitulacją Niemiec. Dla żołnierzy podziemia niepodległościowego rok 1945 nie był końcem wojny, tylko zmianą przeciwnika.",
        dilemma: {
          question: "Dla jednych wojna skończyła się w maju 1945, dla innych trwała jeszcze lata. Czy kraj może mieć dwie różne daty końca wojny?",
          options: ["Tak, zależy kto pamięta", "Nie, fakty są jedne", "Historia to zawsze wiele historii"],
          counterpoint: "Data kapitulacji jest faktem i nie zależy od czyjejś biografii, więc wspólny kalendarz ma sens. Ale człowiek, który w 1946 ukrywał się w lasach przed własnym państwem, miał prawo nie czuć, że pokój go dotyczy.",
        },
        photo: '/photos/poi-planty-narcyz-wiatr.jpg',
        photoCredit: 'Fot. Januszk57 · CC BY-SA 3.0 pl · Wikimedia Commons',
        coords: [19.94115, 50.0593],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'las-wolski',
    pois: [
      {
        id: 'kopiec-pilsudskiego-poi',
        category: 'view',
        name: "Kopiec Piłsudskiego",
        teaser: "Najwyższy kopiec w Polsce, na szczycie Sowińca.",
        description: [
          "Trzydzieści pięć metrów ziemi na najwyższym wzgórzu Lasu Wolskiego, usypane w latach trzydziestych rękami ochotników z całej Polski. Oficjalna nazwa to Mogiła Mogił, bo zsypywano tu ziemię z pól bitewnych, na których walczyli Polacy.",
          "Po wojnie kopiec stał się problemem politycznym: władze go zaniedbywały, ziemia się osypywała, a nazwiska Piłsudskiego nie wolno było na nim wypisać. Odbudowano go czynami społecznymi w latach osiemdziesiątych.",
          "Ze szczytu widać całą panoramę: kopiec Kościuszki, Wawel, kominy Nowej Huty, a przy dobrej pogodzie Tatry. To najwyżej położony punkt widokowy w granicach miasta.",
        ],
        findHint: "Szczyt wzgórza Sowiniec, dojście czerwonym szlakiem od Woli Justowskiej albo od zoo.",
        reveal: "W kopcu jest ziemia z kilkuset pól bitewnych, także z Monte Cassino, dowieziona po wojnie. To grób bez ciała: pamięć zmieszana dosłownie z ziemi wielu miejsc.",
        dilemma: {
          question: "Kopiec zaczął się jako hołd dla jednego człowieka, a stał się pomnikiem wszystkich poległych. Czy pomnik powinien należeć do osoby, czy do sprawy?",
          options: ["Do osoby, tak zaplanowano", "Do sprawy, tak wyszło", "Do tych, którzy go usypali"],
          counterpoint: "Piłsudski był dla budujących kimś konkretnym i to jego nazwisko przyciągnęło ochotników z całego kraju. Ale ziemia w środku pochodzi z bitew ludzi, których nikt nie zna, i to ona nadaje kopcowi znaczenie, gdy spory o wodza dawno wygasły.",
        },
        coords: [19.84717, 50.06005],
        radius: 45,
      },
      {
        id: 'dab-smolensk',
        category: 'nature',
        name: "Dąb Pamięci",
        teaser: "Drzewo posadzone ku pamięci ofiar katastrofy smoleńskiej.",
        description: [
          "Młody dąb u podnóża kopca, jeden z tysięcy Dębów Pamięci sadzonych w Polsce po 2010 roku. Idea jest prosta: jedno drzewo za jedno nazwisko, żywy pomnik zamiast kamiennego.",
          "Dąb rośnie długo i wolno, więc taki pomnik z każdą dekadą staje się większy, nie mniejszy. Za sto lat będzie potężnym drzewem, a tabliczka przy nim wciąż będzie mówiła, dlaczego stanął.",
          "To dobre miejsce na przerwę w drodze na kopiec: kilka minut ciszy w lesie, zanim ruszysz na szczyt.",
        ],
        findHint: "Przy ścieżce prowadzącej na kopiec, od strony zachodniej. Szukaj młodego dębu z tabliczką.",
        reveal: "Akcja Dębów Pamięci wzięła wzór ze starszej tradycji: dębów wolności sadzonych w 1918 roku po odzyskaniu niepodległości. Jeden z nich rośnie na krakowskich Plantach do dziś.",
        dilemma: {
          question: "Drzewo jako pomnik kiedyś umrze, kamień przetrwa wieki. Co lepiej upamiętnia człowieka?",
          options: ["Drzewo, bo żyje", "Kamień, bo trwa", "Imię wypowiadane przez ludzi"],
          counterpoint: "Drzewo trzeba podlewać i pilnować, więc pamięć wymaga pracy, a to samo w sobie jest formą hołdu. Kamień nie potrzebuje nikogo, ale właśnie dlatego łatwo obok niego przejść, nie patrząc.",
        },
        coords: [19.84484, 50.05957],
        radius: 35,
      },
      {
        id: 'ostra-gora',
        category: 'view',
        name: "Ostra Góra",
        teaser: "Jedno z czterech wzgórz Lasu Wolskiego, na trasie szlaków.",
        description: [
          "Las Wolski nie jest płaski: ma cztery wyraźne wzgórza, a różnice wysokości sięgają stu metrów. Ostra Góra jest jednym z nich i najlepiej czuć ją w nogach, gdy wchodzi się od strony Przegorzał.",
          "Podłoże jest tu wapienne, dlatego zbocza są strome i miejscami skaliste, a las bukowy wygląda bardziej jak w Beskidach niż w mieście.",
          "Punkt jest po prostu przystankiem na trasie: potwierdzeniem, że przeszedłeś przez środek lasu, nie tylko po jego brzegu.",
        ],
        findHint: "Szlak między Panieńskimi Skałami a Polaną Lea, w środkowej części lasu.",
        reveal: "Ten las mógł zniknąć: w XIX wieku był wyrębywany, a na początku XX planowano tu parcelację pod domy. Miasto kupiło go w 1917 roku, żeby ocalić i udostępnić mieszkańcom.",
        dilemma: {
          question: "Miasto kupiło las, żeby ludzie mogli w nim być. Im więcej ludzi, tym mniej lasu w lesie. Gdzie postawić granicę?",
          options: ["Wpuszczać wszystkich", "Ograniczać ruch", "Zamykać najcenniejsze fragmenty"],
          counterpoint: "Las bez ludzi nikogo nie obchodzi i pierwszy pójdzie pod inwestycję, bo nikt się o niego nie ujmie. Ale ścieżki wydeptane w bukowym runie odrastają dziesiątki lat, a rezerwaty istnieją właśnie dlatego, że ktoś kiedyś przesadził.",
        },
        photo: '/photos/poi-las-wolski-ostra-gora.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.84364, 50.05332],
        radius: 60,
      },
      {
        id: 'zoo',
        category: 'history',
        name: "Zoo w środku lasu",
        teaser: "Ogród zoologiczny ukryty pośrodku Lasu Wolskiego.",
        description: [
          "Krakowskie zoo działa od 1929 roku i jest jedynym w Polsce położonym w środku lasu, dwadzieścia minut jazdy od Rynku i zupełnie poza miastem.",
          "Powstało z inicjatywy Towarzystwa Przyjaciół Zwierząt, na terenie podarowanym przez miasto. Dziś specjalizuje się w hodowli gatunków zagrożonych, w tym pingwinów i kotów drapieżnych.",
          "Nawet jeśli nie wchodzisz do środka, to dobry punkt orientacyjny wyprawy: stąd rozchodzą się ścieżki na kopiec, do klasztoru Kamedułów i na Panieńskie Skały.",
        ],
        findHint: "Główna brama zoo przy al. Kasy Oszczędności Miasta Krakowa, w centrum lasu.",
        reveal: "W czasie okupacji zoo przetrwało tylko dzięki pracownikom, którzy karmili zwierzęta czym się dało, a część wywieźli i ukryli. Po wojnie odbudowa zaczęła się od kilkudziesięciu ocalałych zwierząt.",
        dilemma: {
          question: "Zoo ratuje gatunki zagrożone, ale robi to, trzymając pojedyncze zwierzęta w zamknięciu. Czy to uczciwa wymiana?",
          options: ["Tak, ratuje gatunki", "Nie, cena jest za wysoka", "Tylko dla gatunków bez szans na wolności"],
          counterpoint: "Bez hodowli w ogrodach kilka gatunków nie istniałoby dziś nigdzie, a niektóre wróciły do natury właśnie z takich programów. Ale wilk w wybiegu nie przestaje być wilkiem, któremu odebrano las, i żadna tabliczka o ochronie gatunku tego nie zmienia.",
        },
        coords: [19.85063, 50.05258],
        radius: 60,
      },
    ],
  },
  {
    parkId: 'krakowski',
    pois: [
      {
        id: 'swiatowid',
        category: 'monument',
        name: "Światowid",
        teaser: "Kamienna rzeźba z lat siedemdziesiątych przy głównej alei.",
        description: [
          "Park Krakowski jest jedyną plenerową galerią rzeźby w tej części miasta: stoi tu kilkanaście prac powstałych głównie w latach sześćdziesiątych i siedemdziesiątych, gdy modne były parkowe wystawy sztuki.",
          "Światowid Tadeusza Mazurka odwołuje się do słowiańskiego posągu o czterech twarzach, patrzącego w cztery strony świata. To temat, który w PRL wracał często, bo pozwalał mówić o dawnej Polsce bez polityki.",
          "Rzeźby w tym parku nie mają tabliczek z opisami, więc większość spacerujących mija je bez świadomości, że idzie przez galerię.",
        ],
        findHint: "Przy głównej alei parku, w północnej części.",
        reveal: "Kolekcja rzeźb w Parku Krakowskim powstała z plenerów artystycznych, na których twórcy pracowali na miejscu. Dlatego prace są z kamienia i nie da się ich łatwo przenieść: powstały dokładnie tam, gdzie stoją.",
        dilemma: {
          question: "Rzeźby stoją bez podpisów, więc mijamy je jak elementy parku. Czy sztuka w przestrzeni publicznej potrzebuje wyjaśnienia?",
          options: ["Potrzebuje opisu", "Ma działać sama", "Wystarczy nazwa i autor"],
          counterpoint: "Bez podpisu każdy widzi to, co widzi, i nikt mu nie mówi, co ma czuć: to najczystszy kontakt ze sztuką. Ale bez nazwiska autora rzeźba przestaje być czyjąś pracą i staje się parkowym meblem.",
        },
        photo: '/photos/poi-krakowski-swiatowid.jpg',
        photoCredit: 'Fot. Lestat (Jan Mehlich) · CC BY-SA 3.0 · Wikimedia Commons',
        coords: [19.9243, 50.06708],
        radius: 25,
      },
      {
        id: 'pocalunek',
        category: 'monument',
        name: "Pocałunek",
        teaser: "Rzeźba Tadeusza Mazurka z 1967 roku.",
        description: [
          "Dwie formy zwrócone do siebie, z których dopiero po chwili wyłania się temat. Mazurek rzeźbił abstrakcyjnie, ale zostawiał tyle tropów, żeby widz sam dokończył obraz.",
          "Rok 1967 to szczyt mody na sztukę w przestrzeni publicznej: w całej Polsce stawiano wtedy rzeźby w parkach i na osiedlach, często wprost z plenerów artystycznych.",
          "To dobry punkt, żeby sprawdzić, jak działa abstrakcja: podejdź, potem odejdź dwadzieścia metrów i spójrz jeszcze raz.",
        ],
        findHint: "Środkowa część parku, blisko alejki od strony ul. Karmelickiej.",
        reveal: "Wiele parkowych rzeźb z tego okresu zniknęło: kradziono je na złom albo usuwano przy remontach. Ta kolekcja przetrwała, bo prace są kamienne i za ciężkie, żeby je wynieść.",
        dilemma: {
          question: "Kamień przetrwał, brąz szedł na złom. Czy dzieło sztuki powinno być projektowane tak, żeby nie dało się go ukraść?",
          options: ["Tak, trwałość to część projektu", "Nie, to ograniczanie artysty", "Lepiej pilnować niż ograniczać"],
          counterpoint: "Rzeźba w parku ma stać dekady, więc materiał jest realną decyzją, nie kaprysem. Ale gdyby wszyscy twórcy myśleli o złomiarzach, nie mielibyśmy ani brązów, ani niczego lekkiego i delikatnego w przestrzeni publicznej.",
        },
        photo: '/photos/poi-krakowski-pocalunek.jpg',
        photoCredit: 'Fot. Mach240390 · CC BY 4.0 · Wikimedia Commons',
        coords: [19.92462, 50.06712],
        radius: 25,
      },
      {
        id: 'zafrasowanie',
        category: 'monument',
        name: "Zafrasowanie",
        teaser: "Rzeźba Romana Tarkowskiego w głębi parku.",
        description: [
          "Tarkowski ma w tym parku kilka prac, w tym Ptaka i Postać kobiecą. Jego rzeźby są zwarte i ciężkie, jakby wyrastały z ziemi, a nie były na niej postawione.",
          "Tytuł jest tu ważny: zafrasowanie to stary, ludowy sposób mówienia o zatroskaniu. W polskiej sztuce ludowej figura Chrystusa Frasobliwego siedzi z głową opartą na dłoni i myśli.",
          "Warto poszukać w parku pozostałych prac tego samego autora. Są rozrzucone po alejkach, bez oznaczeń, jak zadanie do wykonania.",
        ],
        findHint: "W głębi parku, między alejkami w północnej części.",
        reveal: "Chrystus Frasobliwy to najbardziej polski motyw w rzeźbie ludowej: bóg, który nie osądza, tylko siedzi i się martwi. Współczesne parkowe zafrasowanie jest jego dalekim echem.",
        dilemma: {
          question: "Rzeźba nazwana Zafrasowanie stoi w parku, do którego ludzie przychodzą odpocząć. Czy sztuka w miejscu wypoczynku powinna być pogodna?",
          options: ["Powinna być pogodna", "Może być trudna", "Im ciszej, tym lepiej"],
          counterpoint: "Park jest jednym z niewielu miejsc, gdzie człowiek zwalnia i ma czas na cokolwiek trudniejszego, więc to dobry moment na sztukę, która nie schlebia. Ale ktoś, kto przyszedł tu odetchnąć po ciężkim dniu, nie ma obowiązku spotykać się z czyimś smutkiem.",
        },
        photo: '/photos/poi-krakowski-zafrasowanie.jpg',
        photoCredit: 'Fot. Mach240390 · CC BY 4.0 · Wikimedia Commons',
        coords: [19.92443, 50.06729],
        radius: 25,
      },
    ],
  },
  {
    parkId: 'strzelecki',
    pois: [
      {
        id: 'ksiega-kurkowa',
        category: 'history',
        name: "Księga Królów Kurkowych",
        teaser: "Kamienna księga z nazwiskami królów kurkowych.",
        description: [
          "Krakowskie Bractwo Kurkowe istnieje od średniowiecza i jest jednym z najstarszych stowarzyszeń w Polsce. Mieszczanie ćwiczyli w nim strzelanie, bo w razie oblężenia to oni obsadzali mury.",
          "Raz w roku strzelano do drewnianego kura na drągu. Kto go zestrzelił, zostawał królem kurkowym na rok: był zwolniony z podatków miejskich i chodził na czele procesji.",
          "Ta kamienna księga wypisuje nazwiska królów z ostatnich stuleci. To lista mieszczan, którzy w danym roku strzelali najlepiej w mieście.",
        ],
        findHint: "Park Strzelecki przy Celestacie, po stronie ul. Lubicz.",
        reveal: "Srebrny kur bractwa pochodzi z XVI wieku i jest jednym z najcenniejszych zabytków złotnictwa w Polsce. Przetrwał zabory, dwie wojny i PRL, bo bractwo ukrywało go za każdym razem.",
        dilemma: {
          question: "Bractwo istnieje od setek lat, ale dziś nikt nie obsadza już murów. Czy tradycja bez pierwotnej funkcji powinna trwać?",
          options: ["Tak, tradycja ma wartość", "Nie, to skansen", "Tylko jeśli komuś służy"],
          counterpoint: "Bractwo utrzymuje muzeum, ratowało zabytki i trzyma ciągłość, której nie da się odtworzyć po zerwaniu. Ale strzelanie do drewnianego kura w mieście z policją i wojskiem jest już tylko kostiumem, i warto to nazywać wprost.",
        },
        photo: '/photos/poi-strzelecki-ksiega-kurkowa.jpg',
        photoCredit: 'Fot. Mach240390 · CC BY 4.0 · Wikimedia Commons',
        coords: [19.94957, 50.06531],
        radius: 30,
      },
      {
        id: 'sobieski',
        category: 'monument',
        name: "Jan III Sobieski",
        teaser: "Popiersie króla wśród drzew parku.",
        description: [
          "Sobieski był królem kurkowym Krakowa, co brzmi jak ciekawostka, a mówi wiele o tym, jak blisko władza była wtedy mieszczan. Bractwa strzeleckie były siłą, o którą królowie zabiegali.",
          "W parku stoi kilka popiersi władców i bohaterów, ustawionych wśród starych kasztanowców. Razem tworzą galerię, którą łatwo przejść w kwadrans.",
          "Popiersia są niewielkie i łatwo je przegapić, gdy idzie się szybko. To punkt do zwolnienia kroku.",
        ],
        findHint: "Alejka w środkowej części parku, obok pozostałych popiersi.",
        reveal: "Bractwa strzeleckie w polskich miastach miały prawo do własnych chorągwi i sądów, a król przyjmował od nich honorowe tytuły. Mieszczanin, który dobrze strzelał, siadał raz w roku obok władcy.",
        dilemma: {
          question: "Pamiętamy Sobieskiego jako zwycięzcę spod Wiedna, a nie jako króla, który zabiegał o mieszczan. Czy historia powinna pamiętać ludzi po jednym czynie?",
          options: ["Tak, liczy się to największe", "Nie, to spłaszcza", "Zależy, komu to służy"],
          counterpoint: "Jeden mocny obraz sprawia, że postać przetrwa w pamięci setki lat, a bez tego zostają tylko nazwiska w podręczniku. Ale każdy, kogo pamiętamy z jednej scenie, przestaje być człowiekiem i zamienia się w pomnik, także dosłownie.",
        },
        coords: [19.94986, 50.06557],
        radius: 25,
      },
      {
        id: 'paderewski',
        category: 'monument',
        name: "Ignacy Jan Paderewski",
        teaser: "Pianista i polityk, pomnik z 2010 roku.",
        description: [
          "Paderewski był najsłynniejszym pianistą świata, a potem premierem Polski. Zebrał na sprawę polską pieniądze i uwagę, których nie zdobyłby żaden dyplomata: grał koncerty, po których publiczność w Ameryce dowiadywała się, że taki kraj kiedyś istniał.",
          "To on doprowadził do wpisania sprawy polskiej do orędzia prezydenta Wilsona, a w 1919 roku podpisywał traktat wersalski w imieniu Polski.",
          "Pomnik wykonał Czesław Dźwigaj, autor kilkuset rzeźb sakralnych i pomników w całej Polsce.",
        ],
        findHint: "Północna część parku, blisko wejścia od ul. Warszawskiej.",
        reveal: "Paderewski zapłacił też z własnej kieszeni za pomnik grunwaldzki w Krakowie, odsłonięty w 1910 roku na 500-lecie bitwy. Zniszczyli go Niemcy w 1939, odbudowano w 1976.",
        dilemma: {
          question: "Paderewski porzucił karierę muzyczną dla polityki i nigdy nie wrócił do dawnej formy. Czy talent zobowiązuje do jego rozwijania?",
          options: ["Talent zobowiązuje", "Człowiek wybiera sam", "Sprawa była ważniejsza"],
          counterpoint: "Wielki talent jest rzadki i marnowanie go boli wszystkich, którzy mogliby go usłyszeć. Ale sprawa niepodległości nie miała drugiej osoby z takim dostępem do salonów świata, a fortepianów było wtedy więcej niż takich szans.",
        },
        photo: '/photos/poi-strzelecki-paderewski.jpg',
        photoCredit: 'Fot. Zygmunt Put Zetpe0202 · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.95021, 50.06629],
        radius: 25,
      },
    ],
  },
  {
    parkId: 'ogrod-botaniczny',
    pois: [
      {
        id: 'dab-jagiellonski',
        category: 'nature',
        name: "Dąb Jagielloński",
        teaser: "Pomnik przyrody, najstarsze drzewo ogrodu.",
        description: [
          "Ten dąb rósł tu, gdy ogród jeszcze nie istniał: ma ponad dwieście lat i jest pomnikiem przyrody. Gdy zakładano ogród w 1783 roku, był już dojrzałym drzewem.",
          "Obwód pnia mierzy kilka metrów, więc żeby go objąć, potrzeba kilku osób. Dęby szypułkowe potrafią żyć kilkaset lat, więc ten ma jeszcze zapas.",
          "To najlepsze miejsce w ogrodzie na chwilę bez pośpiechu: cień jest gęsty, a wokół prawie zawsze cicho.",
        ],
        findHint: "Środkowa część ogrodu, przy głównej alei. Największe drzewo w okolicy.",
        reveal: "Nazwa nie ma nic wspólnego z Jagiellonami jako dynastią: drzewo nazwano od Uniwersytetu Jagiellońskiego, który jest właścicielem ogrodu od jego założenia.",
        dilemma: {
          question: "Drzewo jest starsze niż ogród i przetrwa większość ludzi, którzy je dziś oglądają. Czy stare drzewo zasługuje na taką samą ochronę jak zabytkowy budynek?",
          options: ["Tak, to też zabytek", "Nie, to przyroda", "Zasługuje na większą"],
          counterpoint: "Zabytkowy dom można odbudować z planów, drzewa nie da się przywrócić: dwustuletniego dębu nie dosadzisz. Ale drzewo choruje, próchnieje i kiedyś spadnie, a prawo ochrony zabytków nie umie z tym pracować.",
        },
        photo: '/photos/poi-ogrod-botaniczny-dab-jagiellonski.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.95728, 50.06286],
        radius: 25,
      },
      {
        id: 'poludnik',
        category: 'history',
        name: "Południk Krakowski",
        teaser: "Ślad linii, po której odmierzano czas w mieście.",
        description: [
          "Zanim istniały strefy czasowe, każde miasto miało własny czas, wyznaczany z momentu, gdy słońce przechodziło przez lokalny południk. W Krakowie robiono to właśnie tutaj, w obserwatorium przy ogrodzie.",
          "Południk krakowski był podstawą polskich pomiarów astronomicznych i długo służył jako punkt odniesienia dla map. Dziś zostało oznaczenie i pamięć po dawnym obserwatorium.",
          "To punkt dla tych, którzy lubią miejsca ważne z niewidocznych powodów: nie ma tu nic spektakularnego, jest za to początek czasu w tym mieście.",
        ],
        findHint: "Przy Collegium Śniadeckiego, w zachodniej części ogrodu.",
        reveal: "Czas kolejowy zabił czas lokalny: kolej potrzebowała jednego rozkładu dla wielu miast, więc w drugiej połowie XIX wieku miejskie południki straciły sens. Kraków przeszedł na czas środkowoeuropejski w 1891 roku.",
        dilemma: {
          question: "Każde miasto miało swój czas, dopóki kolej nie wymusiła wspólnego. Czy warto było oddać własny czas za wygodę podróży?",
          options: ["Warto, wspólny czas łączy", "Szkoda lokalności", "Nie było wyboru"],
          counterpoint: "Bez wspólnego czasu nie da się prowadzić kolei, telegrafu ani niczego, co łączy ludzi na odległość, więc to była cena nowoczesności. Ale zegar przestał wtedy pokazywać cokolwiek o miejscu, w którym stoisz, i południe w Krakowie nie jest już naprawdę południem.",
        },
        coords: [19.95589, 50.06384],
        radius: 25,
      },
      {
        id: 'warszewicz',
        category: 'monument',
        name: "Józef Warszewicz",
        teaser: "Popiersie ogrodnika, który zbierał storczyki w Ameryce.",
        description: [
          "Warszewicz był jednym z najsłynniejszych zbieraczy roślin XIX wieku. Przez lata przemierzał Amerykę Środkową i Południową, wysyłając do Europy tysiące okazów, w tym storczyki, które wcześniej nie miały nawet nazwy.",
          "Wrócił do Krakowa i został inspektorem tego ogrodu. Kilkanaście gatunków nosi jego nazwisko, bo botanicy nazywali nowe rośliny po tym, kto je znalazł.",
          "Popiersie wykonał Franciszek Wyspiański w 1862 roku, ojciec Stanisława. Warto o tym pamiętać, patrząc na kamień: to rzeźba z rodziny, która dała Polsce inną wielką postać.",
        ],
        findHint: "Przy ścieżce w północnej części ogrodu, blisko szklarni.",
        reveal: "Warszewicz zbierał rośliny w czasach, gdy taka podróż była wyprawą bez powrotu dla wielu jego kolegów: umierali na malarię, febrę albo z wycieńczenia. On przeżył kilkanaście lat w tropikach i wrócił.",
        dilemma: {
          question: "Europejscy zbieracze wywozili rośliny z całego świata, żeby je badać i pokazywać w ogrodach. Czy to była nauka, czy zabieranie?",
          options: ["Nauka", "Zabieranie", "Jedno i drugie"],
          counterpoint: "Bez tych kolekcji nie wiedzielibyśmy, jak różnorodny jest świat, a wiele gatunków opisano tylko dzięki nim. Ale rośliny, nazwy i wiedza trafiały do Europy, a ludzie, którzy żyli z tymi roślinami od zawsze, nie dostawali nic.",
        },
        photo: '/photos/poi-ogrod-botaniczny-warszewicz.jpg',
        photoCredit: 'Fot. No machine-readable author provided. Mac · CC BY 2.5 · Wikimedia Commons',
        coords: [19.95634, 50.06331],
        radius: 25,
      },
    ],
  },
  {
    parkId: 'lotnikow',
    pois: [
      {
        id: 'zyroskop',
        category: 'history',
        name: "Żyroskop",
        teaser: "Wielki żyroskop w Ogrodzie Doświadczeń im. Lema.",
        description: [
          "W parku działa Ogród Doświadczeń im. Stanisława Lema: kilkadziesiąt urządzeń, na których można sprawdzić prawa fizyki własnymi rękami. Żyroskop jest jednym z najbardziej wciągających.",
          "Zasada jest prosta i zupełnie nieoczywista dla ciała: wirujące koło stawia opór, gdy próbujesz zmienić jego oś. To samo zjawisko trzyma w pionie rower, statek kosmiczny i pocisk.",
          "Cały ogród jest zewnętrzny, więc działa od wiosny do jesieni. Najlepsza pora to ranek w tygodniu, gdy nie ma kolejek do urządzeń.",
        ],
        findHint: "Ogród Doświadczeń w północnej części parku, przy al. Pokoju.",
        reveal: "Patron ogrodu nie jest ozdobą: Lem pisał o technice, która wymyka się twórcom, i o granicach ludzkiego poznania. Urządzenie, które nie chce zmienić osi, gdy je popychasz, jest dobrą lekcją takiej pokory.",
        dilemma: {
          question: "Fizyki można uczyć się z podręcznika albo z korby w parku. Czy wiedza zdobyta rękami jest lepsza od tej z książki?",
          options: ["Lepsza, bo zostaje", "Gorsza, bo powierzchowna", "Potrzebne są obie"],
          counterpoint: "To, co przejdzie przez ręce, pamięta się dekady, a wzory z tablicy wylatują po wakacjach. Ale bez teorii zostaje wrażenie, a nie zrozumienie: żyroskop kręcony bez wiedzy o momencie pędu to tylko fajna zabawka.",
        },
        coords: [19.99805, 50.06852],
        radius: 30,
      },
      {
        id: 'akustyka',
        category: 'history',
        name: "Stanowisko akustyki",
        teaser: "Urządzenia, na których słychać, jak działa dźwięk.",
        description: [
          "Sekcja akustyczna ogrodu to zestaw urządzeń pokazujących, że dźwięk jest po prostu drganiem powietrza: rury, membrany, talerze i tuby, w których można usłyszeć własny głos z opóźnieniem.",
          "Najlepsze są te, które wymagają dwóch osób po dwóch stronach parku: mówisz szeptem do czaszy, a ktoś kilkadziesiąt metrów dalej słyszy każde słowo.",
          "To najlepsza część ogrodu do wypraw z dzieckiem, bo efekt jest natychmiastowy i nie da się go zepsuć.",
        ],
        findHint: "Środek Ogrodu Doświadczeń, szukaj metalowych czasz i rur.",
        reveal: "Czasze szeptane działają dzięki temu, że dźwięk odbija się od paraboli i skupia w jednym punkcie. Tę samą zasadę wykorzystywano w dawnych fortyfikacjach do nasłuchu, na długo przed elektroniką.",
        dilemma: {
          question: "Ogród Doświadczeń ma bawić i uczyć naraz. Czy nauka musi być zabawna, żeby dotarła?",
          options: ["Musi, inaczej nikt nie słucha", "Nie, wiedza ma być rzetelna", "Zabawa to tylko wejście"],
          counterpoint: "Bez emocji nic nie zostaje w pamięci, a dzieci uczą się właśnie przez zabawę: to nie ustępstwo, tylko sposób działania mózgu. Ale wiedza, która musi bawić, gubi wszystko, co jest trudne i nudne, a nauka w dużej części właśnie taka jest.",
        },
        coords: [19.99643, 50.06821],
        radius: 30,
      },
      {
        id: 'optyka',
        category: 'history',
        name: "Stanowisko optyki",
        teaser: "Lustra i pryzmaty, które psują poczucie przestrzeni.",
        description: [
          "Sekcja optyczna to lustra, kalejdoskopy i pryzmaty rozkładające światło na kolory. Wszystko można obracać, więc każdy patrzy na swoją wersję efektu.",
          "Najciekawsze są zwierciadła wklęsłe, w których obraz wisi w powietrzu przed lustrem. Ludzie odruchowo próbują go złapać, i to jest właśnie ta lekcja.",
          "Punkt jest szczególnie dobry w słońcu: bez światła połowa urządzeń nie ma czym pracować.",
        ],
        findHint: "Południowa część Ogrodu Doświadczeń, przy urządzeniach z lustrami.",
        reveal: "Obraz, który wisi w powietrzu, nazywa się rzeczywistym i można go rzutować na kartkę. To nie iluzja: światło faktycznie zbiega się w tym punkcie, twoje ręce po prostu nie mają czego chwycić.",
        dilemma: {
          question: "Widzisz coś, czego nie da się dotknąć, i mózg każe ci po to sięgnąć. Czy warto ufać własnym oczom?",
          options: ["Warto, zwykle mają rację", "Nie, łatwo je oszukać", "Tylko z drugim źródłem"],
          counterpoint: "Wzrok jest naszym najdokładniejszym zmysłem i przez tysiące lat wystarczał do przeżycia, więc odruch zaufania jest sensowny. Ale każda iluzja optyczna pokazuje, że mózg dopisuje to, czego nie widzi, a my nie zauważamy momentu, w którym to robi.",
        },
        coords: [19.99729, 50.06768],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'bednarskiego',
    pois: [
      {
        id: 'pomnik-bednarskiego',
        category: 'monument',
        name: "Pomnik Wojciecha Bednarskiego",
        teaser: "Twórca parku, upamiętniony w środku swojego dzieła.",
        description: [
          "Wojciech Bednarski był nauczycielem i radnym Podgórza, który uparł się, żeby z wyeksploatowanego kamieniołomu zrobić park. Wszyscy mówili, że na skale bez gleby nic nie wyrośnie.",
          "Zaczął od własnych pieniędzy: kupił pierwsze drzewa i ławki, a potem przekonał miasto, żeby dowoziło ziemię. Park otwarto w 1896 roku, a jego imię nosi od 1907.",
          "Pomnik odsłonięto w 1937 roku. Bednarski patrzy z niego na skalne ściany, których nikt nie chciał, i na drzewa, które jednak urosły.",
        ],
        findHint: "Środkowa część parku, przy głównej alei nad amfiteatrem.",
        reveal: "Bednarski wyłożył na start 734 złote reńskie, czyli wielokrotność swojej rocznej pensji nauczyciela. Nie odzyskał tych pieniędzy nigdy i nigdy ich nie żądał.",
        dilemma: {
          question: "Bednarski zrobił rzecz publiczną z własnych pieniędzy, bo miasto nie chciało. Czy dobrze, gdy dobro wspólne zależy od uporu jednej osoby?",
          options: ["Dobrze, ktoś musi zacząć", "Źle, to zadanie miasta", "Dobrze na start, potem miasto"],
          counterpoint: "Bez takich ludzi nie byłoby połowy parków, szkół i bibliotek w tym kraju, bo instytucje ruszają dopiero, gdy sprawa już istnieje. Ale jeśli dobro wspólne stoi na czyjejś kieszeni, to znika, gdy ta osoba się zmęczy albo zbankrutuje.",
        },
        photo: '/photos/poi-bednarskiego-pomnik-bednarskiego.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.94873, 50.04078],
        radius: 30,
      },
      {
        id: 'smok-turysta',
        category: 'monument',
        name: "Smok Turysta",
        teaser: "Nowa rzeźba w parku, z 2023 roku.",
        description: [
          "Smok z plecakiem, postawiony po wielkiej rewitalizacji parku. To rzadki przypadek rzeźby, która nie upamiętnia nikogo, a po prostu ma bawić dzieci i robić dobre zdjęcia.",
          "Kraków ma dziesiątki smoków, od wawelskiego Chromego po figury w przedszkolach, ale ten jest turystą: przyszedł tu na wycieczkę, tak jak ty.",
          "Punkt najlepiej zaliczyć z dzieckiem, bo smok jest dokładnie w rozmiarze do wspinania i przytulania.",
        ],
        findHint: "Dolna część parku, blisko placu zabaw po rewitalizacji.",
        reveal: "Park po remoncie dostał ścieżkę edukacyjną o Panu Twardowskim, bo Krzemionki to według legendy jego szkoła magii. Smok Turysta jest jej najbardziej lubianym elementem, choć z legendą nie ma nic wspólnego.",
        dilemma: {
          question: "Nowa rzeźba w zabytkowym parku nie upamiętnia nikogo i nawiązuje do popkultury. Czy takie rzeczy pasują do miejsca z historią?",
          options: ["Pasują, park ma żyć", "Nie, to kicz", "Zależy, czy nie zasłaniają historii"],
          counterpoint: "Park bez dzieci to muzeum, a smok przyciąga rodziny, które potem czytają tablice o Bednarskim. Ale linia między żywym parkiem a parkiem rozrywki jest cienka, a raz przekroczona rzadko wraca.",
        },
        photo: '/photos/poi-bednarskiego-smok-turysta.jpg',
        photoCredit: 'Fot. Dwxn · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.95121, 50.04213],
        radius: 35,
      },
      {
        id: 'dembowski',
        category: 'history',
        name: "Pomnik Dembowskiego",
        teaser: "Miejsce pamięci przywódcy powstania krakowskiego.",
        description: [
          "Edward Dembowski był arystokratą, który przeszedł na stronę chłopów: agitował za zniesieniem pańszczyzny i został jednym z przywódców powstania krakowskiego w 1846 roku.",
          "Zginął pod Podgórzem, prowadząc procesję z krzyżem w stronę austriackich żołnierzy. Miał dwadzieścia trzy lata i przekonanie, że można powstanie zrobić razem z chłopami, nie ponad nimi.",
          "Pomnik z 1966 roku stoi na skraju parku, w miejscu związanym z tymi wydarzeniami. Jest surowy i mało znany, więc łatwo go przegapić.",
        ],
        findHint: "Wschodni skraj parku, po stronie ul. Krzemionki.",
        reveal: "Dembowski szedł na austriackie bagnety z procesją i krzyżem, bo wierzył, że żołnierze nie strzelą do ludzi z krzyżem. Strzelili.",
        dilemma: {
          question: "Dembowski poszedł na pewną śmierć, licząc na ludzką przyzwoitość przeciwnika. Odwaga czy nieodpowiedzialność?",
          options: ["Odwaga", "Nieodpowiedzialność", "Rozpacz, nie wybór"],
          counterpoint: "Gesty, w których ktoś stawia własne życie za ideę, poruszają ludzi mocniej niż wygrane bitwy i przeżywają dekady. Ale za nim szli inni ludzie, którzy też zginęli, i oni nie podejmowali tej decyzji.",
        },
        photo: '/photos/poi-bednarskiego-dembowski.jpg',
        photoCredit: 'Fot. bartek444 · CC BY-SA 3.0 pl · Wikimedia Commons',
        coords: [19.95161, 50.04195],
        radius: 35,
      },
    ],
  },
  {
    parkId: 'blonia',
    pois: [
      {
        id: 'glaz-papieski',
        category: 'monument',
        name: "Głaz papieski",
        teaser: "Kamień w miejscu papieskich mszy na Błoniach.",
        description: [
          "Na Błoniach odbyły się największe zgromadzenia w historii Krakowa: msze Jana Pawła II, na które przychodziło ponad milion ludzi. Głaz upamiętnia właśnie te wydarzenia.",
          "Skala jest trudna do wyobrażenia: milion osób na czterdziestu ośmiu hektarach oznacza, że na jednym metrze kwadratowym stały dwie osoby, przez wiele godzin.",
          "Dziś w tym samym miejscu grają koncerty i odbywają się festiwale. To jedyny plac w mieście, który potrafi pomieścić tłum tej wielkości.",
        ],
        findHint: "Wschodnia część Błoń, blisko ul. Focha. Duży kamień z tablicą.",
        reveal: "Podczas największej mszy na Błoniach obliczano, że była to jedna z najliczniejszych mszy w historii świata. Organizacja opierała się głównie na wolontariuszach z krakowskich parafii.",
        dilemma: {
          question: "To samo miejsce służy dziś modlitwie, koncertom i piknikom. Czy przestrzeń upamiętniająca coś ważnego może być używana do zabawy?",
          options: ["Może, ma żyć", "Nie, należy jej się szacunek", "Zależy od skali wydarzenia"],
          counterpoint: "Miejsce, do którego ludzie przychodzą codziennie, zostaje w pamięci, a odgrodzone pomniki znikają z życia miasta. Ale ktoś, dla kogo ten kamień jest osobisty, ma prawo poczuć się dziwnie na koncercie w tym samym punkcie.",
        },
        coords: [19.91072, 50.06102],
        radius: 40,
      },
      {
        id: 'fort-n4',
        category: 'history',
        name: "Ruiny fortu N-4",
        teaser: "Resztki austriackiego fortu na skraju Błoń.",
        description: [
          "Kraków był twierdzą: Austriacy otoczyli miasto pierścieniem kilkudziesięciu fortów, z których część stoi do dziś. Fort N-4 Błonia pilnował właśnie tego kierunku.",
          "Twierdza Kraków była jedną z największych w Europie i nigdy nie została zdobyta. Po pierwszej wojnie straciła sens i zaczęła zamieniać się w ruiny, magazyny i place zabaw.",
          "Z fortu zostały resztki, w które wrosła zieleń. To dobry punkt, żeby zobaczyć, jak miasto przetrawia własną historię wojskową.",
        ],
        findHint: "Zachodnia krawędź Błoń, w stronę Cichego Kącika. Szukaj ceglanych fragmentów wśród drzew.",
        reveal: "Twierdza Kraków miała blisko sto obiektów i zatrudniała tysiące ludzi. To ona uratowała Błonia od zabudowy: teren przed fortami musiał zostać pusty, żeby dawał pole ostrzału.",
        dilemma: {
          question: "Błonia są dziś pustą łąką w środku miasta, bo wojsko zabroniło tu budować. Czy przypadek może być lepszym planistą niż człowiek?",
          options: ["Bywa, że tak", "Nie, to tylko szczęście", "Dobre miasto uczy się z przypadków"],
          counterpoint: "Historia miast jest pełna cennych miejsc, które ocalały przez przypadek: nakaz wojskowy, spór własnościowy, zbyt podmokły grunt. Ale liczyć na to nie można, bo tysiąc innych miejsc zniknęło bez śladu i nikt o nich nie pisze.",
        },
        coords: [19.90083, 50.06261],
        radius: 45,
      },
      {
        id: 'kuznowicz',
        category: 'monument',
        name: "Pomnik ks. Kuznowicza",
        teaser: "Jezuita, który zajął się losem terminatorów i rzemieślników.",
        description: [
          "Ksiądz Mieczysław Kuznowicz prowadził w Krakowie pracę z młodymi rzemieślnikami: zakładał bursy, szkoły i związki, żeby chłopcy z terminu mieli gdzie mieszkać i uczyć się poza warsztatem.",
          "Na początku XX wieku terminator był często tanią siłą roboczą bez praw. Kuznowicz zbudował dla nich system wsparcia, który obejmował tysiące osób.",
          "Pomnik stoi na skraju Błoń, przy trasie, którą codziennie przechodzą tysiące ludzi, z których większość nie wie, kto to był.",
        ],
        findHint: "Południowa część Błoń, w stronę al. 3 Maja.",
        reveal: "Kuznowicz stworzył sieć bursz i szkół, w których przez lata mieszkały i uczyły się tysiące młodych rzemieślników. Robił to w czasach, gdy państwo takich zadań nie widziało.",
        dilemma: {
          question: "Największy pomnik na Błoniach ma papież, a ksiądz, który zajmował się codziennym losem biednych chłopców, ma mały kamień w krzakach. Czy pamięć jest sprawiedliwa?",
          options: ["Nie jest i nigdy nie będzie", "Powinniśmy ją poprawiać", "Skala czynu ma znaczenie"],
          counterpoint: "Pamięć zbiorowa działa na rozpoznawalność, więc zawsze wygrywają postacie wielkie i widoczne: to naturalne, nie złośliwe. Ale to znaczy, że praca u podstaw, która realnie zmieniła setki życia, przepada, a my potem dziwimy się, że nikt nie chce jej wykonywać.",
        },
        photo: '/photos/poi-blonia-kuznowicz.jpg',
        photoCredit: 'Fot. Zygmunt Put · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.90604, 50.05804],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'kopiec-wandy',
    pois: [
      {
        id: 'szczyt-wandy',
        category: 'view',
        name: "Szczyt kopca",
        teaser: "Najstarszy zabytek Nowej Huty, z widokiem na kombinat.",
        description: [
          "Kopiec Wandy ma czternaście metrów i według badań pochodzi z wczesnego średniowiecza, może nawet z VII wieku. Jest starszy od Nowej Huty o kilkanaście stuleci i od samego Krakowa jako miasta.",
          "Ze szczytu widać dwa światy naraz: średniowieczne opactwo Cystersów w Mogile i kominy kombinatu. Trudno o lepszy obraz tego, jak ta część miasta powstawała warstwami.",
          "Wejście zajmuje dwie minuty, więc wyprawa jest krótka. To punkt na trasie, nie cel na cały dzień.",
        ],
        findHint: "Kopiec przy ul. Ujastek, obok klasztoru Cystersów w Mogile.",
        reveal: "Legenda mówi, że to grób Wandy, córki Kraka, która rzuciła się do Wisły, żeby nie wyjść za niemieckiego księcia. Historycy widzą raczej kopiec kultowy albo graniczny, ale nikt nie wie, kto go usypał.",
        dilemma: {
          question: "Kopiec przetrwał tysiąc lat, a potem obok niego zbudowano kombinat, który zmienił tu wszystko. Czy nowe zawsze musi wygrać ze starym?",
          options: ["Musi, miasta rosną", "Nie, dziedzictwo jest ważniejsze", "Da się pogodzić"],
          counterpoint: "Kombinat dał pracę dziesiątkom tysięcy ludzi i zbudował całą dzielnicę z mieszkaniami, szkołami i teatrem: to też dziedzictwo. Ale kopiec stał tu tysiąc lat i przez pół wieku był traktowany jak przeszkoda w krajobrazie przemysłowym.",
        },
        coords: [20.06808, 50.07023],
        radius: 35,
      },
      {
        id: 'wanda-matejko',
        category: 'monument',
        name: "Rzeźba Wandy",
        teaser: "Figura na kopcu, projektowana przez Jana Matejkę.",
        description: [
          "Na szczycie kopca stoi kamienna figura z wizerunkiem Wandy, według projektu Jana Matejki. Malarz historii Polski zajmował się nie tylko obrazami: doradzał też przy pomnikach i renowacjach.",
          "Figurę postawiono w XIX wieku, gdy legenda o Wandzie była w Krakowie żywa i chętnie przypominana: opowieść o kobiecie, która wybiera śmierć zamiast obcego panowania, brzmiała wtedy bardzo aktualnie.",
          "Warto podejść blisko i przeczytać, co zostało z inskrypcji. Kamień na otwartym wzgórzu przez sto pięćdziesiąt lat nie ma łatwego życia.",
        ],
        findHint: "Na samym szczycie kopca, obok punktu widokowego.",
        reveal: "Matejko projektował ten pomnik w czasach zaborów, gdy każda opowieść o wyborze śmierci zamiast obcej władzy była czytana politycznie. Legenda o Wandzie była wtedy tak samo o Wandzie, jak o Polsce.",
        dilemma: {
          question: "Legendę wykorzystano, żeby mówić o polityce swoich czasów. Czy wolno używać dawnych opowieści do dzisiejszych celów?",
          options: ["Wolno, tak żyją legendy", "Nie, to manipulacja", "Wolno, jeśli się to mówi wprost"],
          counterpoint: "Legendy zawsze były opowiadane po coś i tylko dlatego przetrwały: opowieść bez zastosowania umiera w jednym pokoleniu. Ale gdy raz przypniesz do niej polityczną tezę, trudno potem oddzielić, co w niej dawne, a co dopisane wczoraj.",
        },
        coords: [20.06808, 50.07022],
        radius: 25,
      },
      {
        id: 'kumir',
        category: 'history',
        name: "Kumir Dziadów",
        teaser: "Współczesny słowiański posąg u stóp kopca.",
        description: [
          "Kumir to słowiańskie słowo na posąg bóstwa albo przodka. Ten stoi u stóp kopca i jest współczesny: postawiony przez ludzi, którzy odtwarzają dawne słowiańskie obrzędy.",
          "Wokół kopców Krakusa i Wandy od lat gromadzą się grupy rekonstrukcyjne i rodzimowiercy, bo są to najstarsze ślady obecności ludzi w tej okolicy.",
          "To ciekawy punkt, bo pokazuje rzecz rzadką: dziedzictwo, które nie leży w muzeum, ale jest wciąż używane, także w sposób, którego nikt nie zaplanował.",
        ],
        findHint: "U podnóża kopca, przy ścieżce od strony wschodniej.",
        reveal: "Przy kopcach Krakusa i Wandy nadal odbywają się obrzędy nawiązujące do słowiańskich święt, w tym te związane z Rękawką. Najstarsze budowle miasta wciąż mają swoich wyznawców.",
        dilemma: {
          question: "Ktoś stawia dziś posąg dawnego bóstwa przy tysiącletnim kopcu. Czy to szacunek dla dziedzictwa, czy jego przebranie?",
          options: ["Szacunek", "Przebranie", "Nowa tradycja, ma prawo być"],
          counterpoint: "Miejsca kultu żyją tylko wtedy, gdy ktoś do nich przychodzi, a nikt nie ma monopolu na to, jak wygląda pamięć. Ale o dawnych Słowianach wiemy tak niewiele, że każda rekonstrukcja jest głównie wyobrażeniem współczesnych ludzi o przeszłości.",
        },
        coords: [20.06859, 50.0696],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'decjusza',
    pois: [
      {
        id: 'piwnica',
        category: 'monument',
        name: "Pomnik Piwnicy pod Baranami",
        teaser: "Rzeźba Bronisława Chromego dla legendarnego kabaretu.",
        description: [
          "Pomnik z 2000 roku, autorstwa Bronisława Chromego, upamiętnia Piwnicę pod Baranami i Piotra Skrzyneckiego. Chromy był z Piwnicą związany i zrobił ten pomnik jako swój, nie zamówiony.",
          "Piwnica działała od 1956 roku w piwnicy pałacu przy Rynku i była najdłużej działającym kabaretem literackim w Europie. Przeszli przez nią Grechuta, Demarczyk, Zygmunt Konieczny.",
          "Pomnik stoi w parku, w którym Piwnica grywała plenerowe koncerty. To nie przypadkowe miejsce.",
        ],
        findHint: "Środkowa część parku, blisko Villi Decius.",
        reveal: "Bronisław Chromy jest też autorem ziejącego ogniem Smoka Wawelskiego, Sów na Plantach i Flamingów, które stoją kilkadziesiąt metrów stąd. Ten park to prawie jego prywatna galeria.",
        dilemma: {
          question: "Kabaret w piwnicy trwał czterdzieści lat i zniknął wraz ze swoim konferansjerem. Czy instytucja powinna przeżyć swojego twórcę?",
          options: ["Powinna trwać dalej", "Lepiej skończyć w porę", "Zależy, czy ma co powiedzieć"],
          counterpoint: "Instytucja z historią daje młodym scenę i publiczność, których sami nie zbudują, więc szkoda ją zamykać. Ale Piwnica była w dużej mierze jednym człowiekiem chodzącym po mieście z dzwonkiem, a tego nie da się odziedziczyć.",
        },
        photo: '/photos/poi-decjusza-piwnica.jpg',
        photoCredit: 'Fot. Zygmunt Put Zetpe0202 · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.87153, 50.06527],
        radius: 30,
      },
      {
        id: 'flamingi',
        category: 'monument',
        name: "Flamingi",
        teaser: "Rzeźba Chromego z 1996 roku wśród drzew.",
        description: [
          "Chromy rzeźbił zwierzęta całe życie i robił to w sposób, który dzieciom podoba się od razu, a dorosłym po chwili. Flamingi są tego dobrym przykładem: proste formy, rozpoznawalne w sekundę.",
          "W parku stoi kilka jego prac, w tym Kolarze z 1993 roku. Warto poszukać wszystkich, bo są rozstawione bez oznaczeń.",
          "To najlepsza część tego parku dla dzieci: rzeźby są w rozmiarze, przy którym można stanąć obok i porównać się wzrostem.",
        ],
        findHint: "Zachodnia część parku, przy alejce w stronę Woli Justowskiej.",
        reveal: "Chromy urodził się w Leńczach pod Krakowem i całe życie pracował w tym mieście. Zostawił po sobie kilkaset rzeźb, z czego kilkanaście w krakowskich parkach, i mówił, że rzeźba w parku to jedyna sztuka, którą ludzie oglądają przez przypadek.",
        dilemma: {
          question: "Sztuka w parku spotyka ludzi, którzy jej nie szukali. Czy to lepszy sposób pokazywania sztuki niż galeria?",
          options: ["Lepszy, dociera dalej", "Gorszy, brak uwagi", "Inny, nie lepszy"],
          counterpoint: "W parku rzeźbę widzą tysiące osób, które nigdy nie kupią biletu do galerii, a dzieci dorastają z nią jak z drzewem. Ale w galerii patrzy się na dzieło uważnie, a w parku najczęściej mija się je w drodze po lody.",
        },
        coords: [19.87075, 50.06536],
        radius: 30,
      },
      {
        id: 'chopin-decjusza',
        category: 'monument',
        name: "Pomnik Chopina",
        teaser: "Kompozytor w parku, w którym latem grają koncerty.",
        description: [
          "Chopin nigdy nie mieszkał w Krakowie, ale bywał tu w podróżach i grywał w salonach. Pomnik w tym parku nawiązuje raczej do muzycznej funkcji miejsca niż do biografii.",
          "Villa Decius i park co roku goszczą koncerty i festiwale, także muzyki klasycznej. Popiersie stoi więc na scenie, która działa do dziś.",
          "Dobre miejsce, żeby zakończyć wyprawę po tym parku: stąd blisko do wyjścia w stronę Woli Justowskiej i pierwszej kawiarni.",
        ],
        findHint: "Alejka w środkowej części parku, w stronę stawu.",
        reveal: "Do Krakowa Chopin przyjechał jako dziewiętnastolatek i był zachwycony: zwiedzał Wawel, chodził po Plantach i pisał o mieście listy pełne entuzjazmu. Kilka tygodni później wyjechał z Polski na zawsze.",
        dilemma: {
          question: "Chopin bywał w Krakowie kilka dni, a ma tu pomniki. Czy miasto może upamiętniać kogoś, kto był tu tylko przelotem?",
          options: ["Może, kultura nie ma granic", "Nie, to pożyczanie cudzej sławy", "Zależy, czy jest z czym połączyć"],
          counterpoint: "Muzyka nie należy do miast, a pomnik w parku, w którym grają koncerty, ma sens funkcjonalny, nie biograficzny. Ale gdy każde miasto stawia pomniki tym samym kilku wielkim nazwiskom, przestajemy pamiętać tych, którzy naprawdę stąd byli.",
        },
        photo: '/photos/poi-decjusza-chopin-decjusza.jpg',
        photoCredit: 'Fot. Zygmunt Put Zetpe0202 · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.87229, 50.06446],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'jerzmanowskich',
    pois: [
      {
        id: 'palac',
        category: 'history',
        name: "Pałac Jerzmanowskich",
        teaser: "Neogotycki pałac z 1895 roku w środku parku.",
        description: [
          "Pałac kupił Erazm Jerzmanowski, człowiek o biografii jak z powieści: powstaniec styczniowy, emigrant, inżynier, który w Ameryce zbił majątek na oświetleniu gazowym miast. Wrócił do Polski jako milioner i osiadł właśnie tutaj, w Prokocimiu.",
          "Budynek przechodził różne role: dom, szpital, dom kultury. Dziś działa w nim instytucja kultury, więc bywa otwarty na koncerty i wystawy, a park wokół jest publiczny.",
          "Warto obejść pałac dookoła: od strony parku wygląda inaczej niż od podjazdu, a detale neogotyckie są najlepiej widoczne z bliska.",
        ],
        findHint: "Środek parku, główny budynek. Wejście do parku od ul. Wielickiej albo Bieżanowskiej.",
        reveal: "Jerzmanowski przeznaczył większość majątku na fundusz nagród dla Polaków wybitnych w nauce i sztuce, wypłacanych co roku. Nazywano to polskim Noblem, a fundusz działał do wybuchu wojny.",
        dilemma: {
          question: "Jerzmanowski oddał niemal cały majątek na nagrody dla innych, nic nie zostawiając na spadek. Czy tak należy postępować z wielkim majątkiem?",
          options: ["Tak, majątek zobowiązuje", "Nie, rodzina ma pierwszeństwo", "To był jego wybór, nie wzór"],
          counterpoint: "Fundusz wsparł ludzi, którzy zostawili po sobie dzieła, więc te pieniądze pracowały długo po jego śmierci. Ale takie decyzje łatwo zamienić w oczekiwanie wobec innych bogatych, a filantropia z przymusu przestaje być darem.",
        },
        photo: '/photos/poi-jerzmanowskich-palac.jpg',
        photoCredit: 'Fot. Daniel.zolopa · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.99484, 50.01948],
        radius: 35,
      },
      {
        id: 'fontanna-zina',
        category: 'monument',
        name: "Fontanna profesora Zina",
        teaser: "Fontanna projektowana przez Wiktora Zina.",
        description: [
          "Wiktor Zin był architektem i konserwatorem zabytków, ale Polska pokochała go za coś innego: przez ćwierć wieku prowadził w telewizji program, w którym rysował węglem i opowiadał o architekturze tak, że słuchały go całe rodziny.",
          "Fontanna w tym parku jest jednym z jego drobniejszych dzieł, ale dobrze pokazuje jego podejście: prosta forma, ludzka skala, nic na pokaz.",
          "To dobry punkt na przystanek: fontanna działa w sezonie, a wokół stoją ławki w cieniu starych drzew.",
        ],
        findHint: "Południowa część parku, blisko wejścia od ul. Wielickiej.",
        reveal: "Zin rysował swoje programy na żywo, bez montażu, węglem na papierze, jednocześnie mówiąc do kamery. Nagrał tak kilkaset odcinków, ucząc kilka pokoleń patrzenia na budynki.",
        dilemma: {
          question: "Zin uczył o architekturze prosto i przystępnie, przez co część kolegów zarzucała mu spłycanie tematu. Czy popularyzacja szkodzi nauce?",
          options: ["Szkodzi, spłyca", "Pomaga, otwiera drzwi", "Zależy od uczciwości"],
          counterpoint: "Bez popularyzatorów wiedza zostaje w wąskim kręgu i nikt jej nie broni, gdy przychodzi po nią buldożer. Ale każde uproszczenie coś gubi, a widz zostaje z poczuciem, że rozumie więcej, niż rozumie.",
        },
        coords: [19.99515, 50.01805],
        radius: 30,
      },
      {
        id: 'dab-jerzmanowskich',
        category: 'nature',
        name: "Dąb pomnik przyrody",
        teaser: "Najstarsze drzewo parku, objęte ochroną.",
        description: [
          "Ten dąb jest starszy niż pałac: rósł tu, gdy Prokocim był jeszcze wsią pod Krakowem, a Jerzmanowski dopiero wyjeżdżał do Ameryki.",
          "Pomnik przyrody to formalna ochrona: takiego drzewa nie można wyciąć ani przyciąć bez zgody, a jego stan jest kontrolowany. W Krakowie jest ich kilkaset.",
          "Stań pod koroną i spójrz w górę: dęby mają charakterystyczny, poszarpany kontur liści, po którym rozpoznasz je z każdej odległości.",
        ],
        findHint: "Przy alejce w środkowej części parku, największe drzewo w okolicy.",
        reveal: "Dąb w wieku dwustu lat jest dopiero w średnim wieku: te drzewa dożywają kilkuset lat, a rekordziści w Polsce mają ponad siedemset. Dąb Bartek w Zagnańsku pamięta czasy Piastów.",
        dilemma: {
          question: "Stare drzewo w mieście bywa niebezpieczne: gałęzie spadają, korzenie podnoszą chodnik. Kiedy bezpieczeństwo powinno wygrać z drzewem?",
          options: ["Gdy realnie zagraża", "Niemal nigdy", "Zawsze, ludzie są ważniejsi"],
          counterpoint: "Konar spadający na alejkę może zabić, a miasto odpowiada za to prawnie, więc ostrożność jest zrozumiała. Ale dwustuletnie drzewo wycina się w godzinę, a odtworzyć je można tylko czekając dwieście lat.",
        },
        photo: '/photos/poi-jerzmanowskich-dab-jerzmanowskich.jpg',
        photoCredit: 'Fot. Janusz Krzyżek (Januszk57) · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.99477, 50.01846],
        radius: 30,
      },
      {
        id: 'lotnicy-prokocim',
        category: 'monument',
        name: "W hołdzie lotnikom z Prokocimia",
        teaser: "Kamień pamięci lotników z tej dzielnicy.",
        description: [
          "Tablica upamiętnia lotników związanych z Prokocimiem, którzy walczyli w czasie drugiej wojny światowej. Wielu polskich pilotów trafiło wtedy do dywizjonów w Wielkiej Brytanii.",
          "Prokocim był wsią, potem dzielnicą kolejarzy i robotników, więc każde nazwisko na takiej tablicy oznacza kogoś, kto wyszedł stąd i nie wrócił.",
          "To niepozorny punkt przy alejce, obok którego większość spacerujących przechodzi bez zatrzymania.",
        ],
        findHint: "Północna część parku, przy ścieżce w stronę ul. Bieżanowskiej.",
        reveal: "Polscy lotnicy w bitwie o Anglię mieli jeden z najwyższych wskaźników skuteczności wśród wszystkich narodowości: dywizjon 303 zestrzelił najwięcej samolotów spośród wszystkich dywizjonów RAF w tej kampanii.",
        dilemma: {
          question: "Lokalne tablice upamiętniają kilka nazwisk, a wielkie pomniki tysiące. Czy pamięć powinna być lokalna, czy zbiorcza?",
          options: ["Lokalna, bo konkretna", "Zbiorcza, bo widoczna", "Potrzebne obie"],
          counterpoint: "Nazwisko z twojej ulicy działa mocniej niż liczba na cokole, bo ktoś z sąsiedztwa jeszcze pamięta tę rodzinę. Ale takie tablice znikają razem z pamięcią dzielnicy, a wielki pomnik przetrwa i przypomni, że to była wojna milionów.",
        },
        coords: [19.99551, 50.02085],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'bagry',
    pois: [
      {
        id: 'tafla',
        category: 'water',
        name: "Bagry Wielkie",
        teaser: "Trzydzieści hektarów wody, plaże i pomosty.",
        description: [
          "Bagry są dziełem przypadku: żwir wybierano tu od międzywojnia, a gdy koparki dotarły poniżej poziomu wód gruntowych, wyrobisko zaczęło samo się zalewać. Tak Kraków dostał jezioro.",
          "Woda ma miejscami kilkanaście metrów głębokości, jest przejrzysta i chłodna, bo zasilana ze źródeł podziemnych. Latem działa tu kąpielisko z ratownikami, a przez cały rok przystań żeglarska.",
          "Wieczorem warto zostać na zachód słońca: z pomostu widać panoramę Podgórza, a przy dobrej pogodzie tafla odbija całe niebo.",
        ],
        findHint: "Bulwar nad wodą od strony ul. Kozłówek, przy pomostach.",
        reveal: "Bagry nie były planowane jako miejsce rekreacji: przez lata to była dziura po żwirowni, w której kąpano się nielegalnie. Miasto uznało je za teren wypoczynkowy dopiero po fakcie, gdy ludzie i tak już tu przychodzili.",
        dilemma: {
          question: "Miasto uznało Bagry za miejsce rekreacji, bo ludzie już się tu kąpali. Czy to dobra kolejność: najpierw mieszkańcy, potem plan?",
          options: ["Dobra, ludzie wiedzą lepiej", "Zła, potrzebny plan", "Dobra, jeśli miasto potem nadąży"],
          counterpoint: "Miejsca, które ludzie wybierają sami, są używane naprawdę, a nie tylko na wizualizacjach: to najlepszy dowód potrzeby. Ale zanim miasto nadąży, ktoś tonie w niepilnowanej wodzie, a odpowiedzialność zaczyna się dopiero po wypadku.",
        },
        coords: [19.99077, 50.03287],
        radius: 60,
      },
      {
        id: 'jan-de-matha',
        category: 'monument',
        name: "Święty Jan de Matha",
        teaser: "Rzeźba przy kościele nad zalewem.",
        description: [
          "Jan de Matha założył w XII wieku zakon trynitarzy, którego zadaniem było wykupywanie chrześcijańskich jeńców z niewoli. Zakonnicy zbierali pieniądze w Europie, płynęli do Afryki Północnej i wracali z ludźmi.",
          "Reguła zakonu przewidywała rzecz radykalną: jeśli zabrakło pieniędzy, zakonnik mógł zostać w niewoli w zamian za jeńca, którego wypuszczano.",
          "Rzeźba stoi przy kościele Przenajświętszej Trójcy, kilka minut od wody, więc łatwo połączyć oba punkty w jeden spacer.",
        ],
        findHint: "Przy kościele Przenajświętszej Trójcy, od strony ul. Krzemienieckiej.",
        reveal: "Trynitarze wykupili z niewoli dziesiątki tysięcy ludzi w ciągu kilku stuleci. W Polsce nazywano ich trynitarzami od odkupywania jeńców, a ich klasztory stały przy szlakach, którymi wracali wykupieni.",
        dilemma: {
          question: "Zakon płacił porywaczom za uwolnienie ludzi. Czy płacenie okupu ratuje, czy napędza porwania?",
          options: ["Ratuje konkretnych ludzi", "Napędza problem", "Ratuje, ale ma koszt"],
          counterpoint: "Człowiek wykupiony wraca do rodziny natychmiast, a nikt inny mu nie pomoże: to twardy, wymierny efekt. Ale jeśli porywanie ludzi staje się opłacalne, kolejni porywacze wybierają ten sam interes, i tak działo się przez wieki.",
        },
        coords: [19.98688, 50.03568],
        radius: 35,
      },
      {
        id: 'kosciol-trojcy',
        category: 'history',
        name: "Kościół Przenajświętszej Trójcy",
        teaser: "Kościół nad zalewem, punkt orientacyjny okolicy.",
        description: [
          "Kościół stoi na skraju dzielnicy, przy dawnej wsi Płaszów, którą Kraków wchłonął w XX wieku. Dla mieszkańców Bagier to najbardziej rozpoznawalny punkt w okolicy.",
          "Płaszów ma trudną historię: w czasie okupacji Niemcy zbudowali tu obóz koncentracyjny, którego teren leży kilka kilometrów dalej. Ta okolica pamięta więcej, niż pokazuje.",
          "Punkt jest dobry na koniec wyprawy: od wody kilka minut w górę, a stąd blisko do przystanków komunikacji.",
        ],
        findHint: "Ul. Krzemieniecka, na skraju terenu rekreacyjnego Bagry.",
        reveal: "Obóz Płaszów, znany z Listy Schindlera, działał kilka kilometrów stąd, na terenie dwóch żydowskich cmentarzy. Dzisiejsze spacerowe Bagry i tamten obóz to ta sama dzielnica.",
        dilemma: {
          question: "Ludzie odpoczywają nad wodą kilka kilometrów od terenu byłego obozu. Czy dzielnica ma obowiązek pamiętać na co dzień?",
          options: ["Ma obowiązek", "Życie musi iść dalej", "Wystarczy pamiętać w miejscu"],
          counterpoint: "Bez codziennej pamięci historia zostaje w muzeum, a dzielnica traci związek z własną przeszłością. Ale nikt nie jest w stanie żyć w ciągłej żałobie, a dzieci mają prawo do zwyczajnego lata nad wodą.",
        },
        coords: [19.98689, 50.03548],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'wyspianskiego',
    pois: [
      {
        id: 'fort-krowodrza',
        category: 'history',
        name: "Relikty fortu 9 Krowodrza",
        teaser: "Resztki austriackiego fortu w parku.",
        description: [
          "Fort 9 Krowodrza był częścią Twierdzy Kraków, pierścienia umocnień, którymi Austriacy otoczyli miasto w XIX wieku. Cała twierdza liczyła około stu obiektów i była jedną z największych w Europie.",
          "Forty miały pola ostrzału, więc wokół nich nie wolno było budować. To dlatego wiele krakowskich parków i łąk istnieje do dziś: były przedpolem wojskowym.",
          "Z fortu zostały fragmenty murów i wałów, w które wrosła zieleń. Trzeba się rozejrzeć, bo natura zrobiła swoje.",
        ],
        findHint: "Północna część parku, szukaj ceglanych fragmentów i wałów wśród drzew.",
        reveal: "Twierdza Kraków nigdy nie została zdobyta, a w 1914 roku odparła rosyjskie natarcie. Kilka lat później straciła sens militarny i miasto zaczęło ją rozbierać albo zamieniać na magazyny.",
        dilemma: {
          question: "Twierdza chroniła miasto i jednocześnie hamowała jego rozwój przez dekady. Co miasto z niej wyniosło?",
          options: ["Głównie zieleń", "Głównie stratę", "Ochronę wartą ceny"],
          counterpoint: "Bez zakazu zabudowy nie byłoby Błoń, wielu parków i klinów zieleni, które dziś są największym skarbem Krakowa. Ale przez pół wieku miasto nie mogło rosnąć normalnie, a mieszkania budowano ciasno i za murami.",
        },
        photo: '/photos/poi-wyspianskiego-fort-krowodrza.jpg',
        photoCredit: 'Fot. Mach240390 · CC BY 4.0 · Wikimedia Commons',
        coords: [19.92115, 50.08626],
        radius: 40,
      },
      {
        id: 'pomnik-nowakowskiego',
        category: 'monument',
        name: "Pomnik Jerzego Nowakowskiego",
        teaser: "Rzeźba w parku, autorstwa krakowskiego artysty.",
        description: [
          "Pomnik jest dziełem Jerzego Nowakowskiego, rzeźbiarza związanego z Krakowem, którego prace stoją w kilku miejscach miasta. Ta jest kameralna i wtopiona w zieleń.",
          "Rzeźba w parku osiedlowym ma inne zadanie niż na placu: nie ma nikogo onieśmielać, ma być punktem, przy którym się siada.",
          "Warto porównać ją z rzeźbami w Parku Krakowskim albo u Decjusza: to trzy różne pomysły na to samo.",
        ],
        findHint: "Przy alejce blisko reliktów fortu, w północnej części parku.",
        reveal: "Kraków ma jedną z największych w Polsce kolekcji rzeźby plenerowej rozproszonej po parkach i osiedlach. Powstała głównie w latach sześćdziesiątych i siedemdziesiątych, gdy przy inwestycjach obowiązywał odpis na sztukę.",
        dilemma: {
          question: "Rzeźby w parkach powstały, bo przepis kazał przeznaczać procent budowy na sztukę. Czy sztuka z nakazu jest prawdziwą sztuką?",
          options: ["Jest, liczy się efekt", "Nie, brak wolności", "Efekt bywa lepszy niż intencja"],
          counterpoint: "Ten przepis dał Polsce tysiące dzieł w miejscach, gdzie sztuki nigdy by nie było, i dziś je odkrywamy na nowo. Ale zamówienie z urzędu wybierało też bezpiecznych wykonawców, a niejedna taka rzeźba to po prostu wypełnienie normy.",
        },
        coords: [19.92095, 50.086],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'solvay',
    pois: [
      {
        id: 'kaplica-teresy',
        category: 'history',
        name: "Kaplica świętej Teresy",
        teaser: "Kaplica w Borku Fałęckim, blisko dawnej fabryki.",
        description: [
          "Ta kaplica należy do parafii w Borku Fałęckim, dzielnicy, która wyrosła wokół zakładów sodowych Solvay. Fabryka dawała pracę tysiącom ludzi i ukształtowała całą okolicę.",
          "W czasie okupacji w Solvayu pracował Karol Wojtyła: najpierw w kamieniołomie na Zakrzówku, potem w oczyszczalni wody w samym zakładzie. Ta praca dawała mu zatrudnienie chroniące od wywózki.",
          "Zakłady zamknięto w latach osiemdziesiątych, a teren rozebrano. Park, po którym idziesz, powstał na dawnym zapleczu fabryki.",
        ],
        findHint: "Południowo-zachodni skraj parku, w stronę Borku Fałęckiego.",
        reveal: "Wojtyła pracował na nocnych zmianach i w przerwach czytał: to w tym czasie zdecydował, że wstąpi do seminarium. Zakład, którego już nie ma, zmienił bieg historii Kościoła.",
        dilemma: {
          question: "Fabryka dawała pracę tysiącom ludzi i truła całą okolicę. Jak dziś oceniać takie miejsca?",
          options: ["Po ludziach, którym dała życie", "Po szkodach, które zostawiła", "Nie da się oddzielić"],
          counterpoint: "Dla rodzin z Borku Fałęckiego Solvay był stabilnym życiem, mieszkaniem i szkołą dla dzieci: to nie abstrakcja. Ale pyły i ścieki zostawiły po sobie zdrowie, którego nikt nie policzył, i ziemię, którą trzeba było uprzątnąć.",
        },
        coords: [19.92029, 50.01522],
        radius: 40,
      },
      {
        id: 'dom-lazarza',
        category: 'history',
        name: "Zbór Dom Łazarza",
        teaser: "Niekatolicka świątynia na skraju parku.",
        description: [
          "Zbór Dom Łazarza to ślad rzeczy rzadkiej w Krakowie: religijnej różnorodności. Miasto kojarzy się z katolicyzmem, ale ma też parafie prawosławne, protestanckie, zbory zielonoświątkowe i historię wielkiej społeczności żydowskiej.",
          "Takie miejsca zwykle nie są zabytkami i nie trafiają do przewodników, więc łatwo przejść obok, nie wiedząc, co to jest.",
          "Punkt jest właśnie o tym: żeby zobaczyć, że dzielnica ma więcej warstw, niż widać z alejki parku.",
        ],
        findHint: "Wschodni skraj parku, przy ulicy w stronę Łagiewnik.",
        reveal: "Kraków przed wojną był miastem, w którym co czwarty mieszkaniec był Żydem, a w mieście działały też parafie greckokatolickie, ewangelickie i prawosławne. Dzisiejsza jednorodność jest skutkiem wojny, nie tradycji.",
        dilemma: {
          question: "Miasto jest dziś religijnie jednorodne, bo jego różnorodność zniszczyła wojna. Czy warto o tym przypominać w codziennej przestrzeni?",
          options: ["Warto, to część historii", "Lepiej patrzeć w przyszłość", "Warto, ale bez moralizowania"],
          counterpoint: "Miasto, które nie wie, że było inne, uznaje swój obecny stan za naturalny i wieczny, a to nieprawda. Ale ciągłe przypominanie o stratach potrafi zamienić miasto w muzeum żałoby, w którym trudno mieszkać.",
        },
        coords: [19.9246, 50.01685],
        radius: 35,
      },
    ],
  },
  {
    parkId: 'mlynowka',
    pois: [
      {
        id: 'kolumna-1776',
        category: 'history',
        name: "Kolumna z krzyżem z 1776 roku",
        teaser: "Najstarszy obiekt na trasie parku.",
        description: [
          "Ta kolumna stoi tu od 1776 roku, czyli od czasów przed rozbiorami. Wtedy Młynówka Królewska była żywym kanałem, a wokół rozciągały się pola i młyny.",
          "Takie kolumny stawiano na rozstajach i przy drogach: jako znak, punkt orientacyjny i miejsce, w którym można się przeżegnać przed dalszą drogą. Były wtedy tym, czym dziś drogowskaz.",
          "Idąc parkiem, mijasz dwa i pół wieku historii w jednym obiekcie: kanał zniknął, młyny zniknęły, kolumna stoi.",
        ],
        findHint: "Zachodni odcinek parku, przy przecięciu z ulicą.",
        reveal: "Młynówka Królewska była sztucznym kanałem, który od XIV wieku prowadził wodę z Rudawy do krakowskich młynów. Działała ponad pięćset lat, a zasypano ją dopiero w XX wieku.",
        dilemma: {
          question: "Kanał, który działał pięćset lat, zasypano w ciągu kilku dekad, bo przestał być potrzebny. Czy tak należy postępować z infrastrukturą, która się przeżyła?",
          options: ["Tak, miasto się zmienia", "Nie, szkoda dziedzictwa", "Można było zostawić wodę"],
          counterpoint: "Zasypany kanał dał miastu kilkukilometrowy zielony korytarz, którym dziś chodzą tysiące ludzi: to dobre wykorzystanie. Ale woda w mieście jest dziś na wagę złota, a odtworzyć taki kanał kosztowałoby dziesiątki milionów.",
        },
        coords: [19.88911, 50.07578],
        radius: 30,
      },
      {
        id: 'kosciol-wojciecha',
        category: 'history',
        name: "Kościół świętego Wojciecha",
        teaser: "Kościół przy trasie dawnego kanału.",
        description: [
          "Kościół stoi przy trasie Młynówki, w dawnej wsi Krowodrza, którą Kraków wchłonął na początku XX wieku. Wieś miała młyny napędzane właśnie tą wodą.",
          "Wezwanie świętego Wojciecha jest jednym z najstarszych w Polsce: misjonarz zginął w 997 roku, a jego kult był narzędziem budowania chrześcijańskiego państwa.",
          "To dobry punkt orientacyjny w środku parku liniowego, który łatwo pomylić na całej długości.",
        ],
        findHint: "Środkowy odcinek parku, przy ul. Racławickiej.",
        reveal: "Krowodrza była osobną wsią z młynami, karczmą i własnym kościołem, a jej mieszkańcy przez wieki żyli z wody, którą prowadziła Młynówka. Miasto wchłonęło ją w 1910 roku.",
        dilemma: {
          question: "Wsie wokół Krakowa zniknęły jako osobne miejscowości, ale ich nazwy i kościoły zostały. Czy to jeszcze te same miejsca?",
          options: ["Tak, mają ciągłość", "Nie, to już dzielnice", "Zależy od mieszkańców"],
          counterpoint: "Nazwa, kościół i układ ulic potrafią przetrwać sto lat urbanizacji, a ludzie nadal mówią, że mieszkają na Krowodrzy. Ale wieś to była wspólnota gospodarcza z młynem i polami, a tego nie ma i nie wróci.",
        },
        coords: [19.8953, 50.07438],
        radius: 35,
      },
    ],
  },
  {
    parkId: 'kopiec-kosciuszki',
    pois: [
      {
        id: 'szczyt-kosciuszki',
        category: 'view',
        name: "Szczyt kopca",
        teaser: "Najlepsza panorama Krakowa, 34 metry nad fortem.",
        description: [
          "Kopiec usypano w latach 1820-23, cztery lata po śmierci Kościuszki, i zrobili to mieszkańcy: kobiety, dzieci, chłopi i mieszczanie, którzy przynosili ziemię w koszach i taczkach.",
          "Do środka wmurowano ziemię z pól bitewnych, na których walczył: z Racławic, Dubienki, Maciejowic, a także z Ameryki, gdzie był bohaterem wojny o niepodległość.",
          "Ze szczytu widać cały Kraków, dolinę Wisły i przy dobrej pogodzie Tatry. Wejście prowadzi spiralną ścieżką po zewnętrznej stronie stożka.",
        ],
        findHint: "Wejście przez fort od strony al. Waszyngtona, potem spiralną ścieżką na szczyt.",
        reveal: "Kopiec był budowany bez planów inżynierskich, siłą społecznego zapału, i dwa razy niemal się osunął. Dopiero w latach dwutysięcznych dostał drenaż i stabilizację, które trzymają go do dziś.",
        dilemma: {
          question: "Kopiec zbudowali zwykli ludzie bez inżynierów, a potem państwo musiało go ratować przed osunięciem. Czy społeczny zapał wystarcza do wielkich rzeczy?",
          options: ["Wystarcza, ważny jest gest", "Nie, potrzeba fachowców", "Zapał zaczyna, fachowcy kończą"],
          counterpoint: "Bez tego zapału kopca by nie było w ogóle: żaden urząd nie sfinansowałby wtedy pomnika przeciwnika zaborców. Ale gdyby nie późniejsze wiercenia i drenaże, dziś mielibyśmy po nim rozmytą górkę.",
        },
        coords: [19.89335, 50.05492],
        radius: 35,
      },
      {
        id: 'fort-2',
        category: 'history',
        name: "Fort 2 Kościuszko",
        teaser: "Austriacki fort, który otoczył polski pomnik.",
        description: [
          "Austriacy zrobili rzecz przewrotną: otoczyli polski pomnik narodowy własną fortyfikacją. Fort 2 Kościuszko powstał w połowie XIX wieku i wchłonął kopiec w system Twierdzy Kraków.",
          "Z jednej strony to była kontrola nad miejscem, w którym Polacy się zbierali. Z drugiej fort uratował kopiec: w czasie budowy umocnień zakazano jakichkolwiek prac, które mogłyby go naruszyć.",
          "Dziś w murach fortu działają hotel, restauracja i muzeum, a na dziedzińcu stoją armaty. Wejście na kopiec prowadzi przez fort.",
        ],
        findHint: "Mury i dziedziniec u podstawy kopca, wejście od al. Waszyngtona.",
        reveal: "Zaborca, który otoczył kopiec fortem, jednocześnie zabronił go tykać, bo stał się częścią umocnień wojskowych. Dzięki temu polski pomnik przetrwał w środku austriackiej twierdzy.",
        dilemma: {
          question: "Pomnik narodowy przetrwał, bo zaborca uczynił z niego element własnej fortyfikacji. Czy taka ochrona to ironia, czy szczęście?",
          options: ["Ironia losu", "Szczęście w nieszczęściu", "Zwykły pragmatyzm wojskowy"],
          counterpoint: "Wojsko myślało o polu ostrzału, nie o polskiej pamięci, więc żadnej życzliwości tu nie było. Ale efekt jest taki, że dzięki austriackiemu regulaminowi mamy dziś nietknięty kopiec, gdy inne pomniki z tej epoki zniknęły.",
        },
        photo: '/photos/poi-kopiec-kosciuszki-fort-2.jpg',
        photoCredit: 'Fot. Pudelek (Marcin Szala) · CC BY-SA 3.0 · Wikimedia Commons',
        coords: [19.89304, 50.05481],
        radius: 30,
      },
      {
        id: 'kaplica-bronislawy',
        category: 'history',
        name: "Kaplica błogosławionej Bronisławy",
        teaser: "Neogotycka kaplica u podnóża kopca.",
        description: [
          "Bronisława była norbertanką ze Zwierzyńca, która według tradycji w czasie najazdu tatarskiego ukrywała się i modliła na tym wzgórzu. Od niej wzięła nazwę cała góra.",
          "Kaplica z połowy XIX wieku stoi w miejscu starszej, drewnianej. Jest niewielka i łatwo ją przegapić, wchodząc na kopiec od strony fortu.",
          "To spokojny punkt na trasie: kilkanaście metrów od głównego wejścia, a prawie nikt tam nie zagląda.",
        ],
        findHint: "Przy ścieżce u podnóża kopca, po zachodniej stronie fortu.",
        reveal: "Legenda o Bronisławie mówi, że skały na Zwierzyńcu rozstąpiły się, by ukryć siostry norbertanki przed Tatarami. To ta sama opowieść, która dała nazwę Panieńskim Skałom w Lesie Wolskim.",
        dilemma: {
          question: "Ta sama legenda tłumaczy nazwy dwóch różnych miejsc po dwóch stronach miasta. Czy to osłabia opowieść, czy pokazuje jej siłę?",
          options: ["Osłabia, to znak zmyślenia", "Pokazuje siłę", "Legendy tak właśnie działają"],
          counterpoint: "Powtarzalność jest znakiem, że historia była opowiadana wszędzie i przez każdego, a to jej największa siła. Ale dwa różne miejsca cudu w jednej opowieści oznaczają, że przynajmniej jedno z nich zostało dopisane później.",
        },
        coords: [19.89271, 50.05489],
        radius: 30,
      },
      {
        id: 'raclawice-armata',
        category: 'monument',
        name: "Armata Racławicka",
        teaser: "Działo upamiętniające bitwę pod Racławicami.",
        description: [
          "Kościuszko wygrał pod Racławicami w 1794 roku bitwę, która weszła do legendy dzięki kosynierom: chłopom uzbrojonym w kosy postawione na sztorc, którzy zdobyli rosyjskie armaty.",
          "Sam Kościuszko szedł wtedy w chłopskiej sukmanie i to była decyzja polityczna: pokazywał, że powstanie ma być sprawą wszystkich stanów, nie tylko szlachty.",
          "Armata na dziedzińcu upamiętnia rocznicę bitwy. Warto stanąć obok i porównać skalę: to przeciwko takim działom szło się z kosą.",
        ],
        findHint: "Dziedziniec fortu, przy tablicy rocznicowej.",
        reveal: "Po Racławicach Kościuszko nadał chłopom, którzy przystąpili do powstania, ograniczoną wolność w tak zwanym uniwersale połanieckim. Szlachta w większości go nie wykonała.",
        dilemma: {
          question: "Kościuszko obiecał chłopom wolność za udział w powstaniu, a szlachta obietnicy nie dotrzymała. Czy warto obiecywać coś, czego nie da się wymusić?",
          options: ["Warto, to zmienia myślenie", "Nie, to oszustwo", "Warto, ale trzeba mówić prawdę o ryzyku"],
          counterpoint: "Ta obietnica pierwsza raz postawiła sprawę chłopską w centrum polityki i wróciła po latach jako realna reforma. Ale ludzie, którzy szli wtedy z kosami, zapłacili życiem za wolność, której nie dostali.",
        },
        coords: [19.894, 50.05449],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'panienskie-skaly',
    pois: [
      {
        id: 'wawoz',
        category: 'nature',
        name: "Wąwóz Panieńskich Skał",
        teaser: "Rezerwat z wapiennymi ścianami w środku lasu.",
        description: [
          "Wąwóz ma kilkanaście metrów głębokości, a jego ściany zbudowane są z wapienia jurajskiego, tej samej skały, z której zrobiony jest Wawel i cała Jura Krakowsko-Częstochowska.",
          "Rezerwat utworzono w 1917 roku i jest jednym z najstarszych w Polsce. Chroni nie tylko skały, ale też las bukowy, który tu rośnie: gęsty, ciemny i pełny wykrotów.",
          "Ścieżka biegnie dnem wąwozu, więc idzie się między ścianami. To najbardziej górskie miejsce w granicach Krakowa.",
        ],
        findHint: "Dno wąwozu, szlak z Woli Justowskiej albo od strony zoo.",
        reveal: "Nazwa pochodzi z legendy: skały miały się rozstąpić, żeby ukryć norbertanki uciekające przed Tatarami, a potem zamknąć nad nimi. To ta sama opowieść, co przy kaplicy błogosławionej Bronisławy pod Kopcem Kościuszki.",
        dilemma: {
          question: "Rezerwat chroni miejsce, ale ścieżka prowadzi jego środkiem i wydeptuje runo. Czy przyroda w mieście powinna być dostępna?",
          options: ["Tak, inaczej nikt jej nie obroni", "Nie, ochrona jest ważniejsza", "Tylko wyznaczonymi ścieżkami"],
          counterpoint: "Miejsce, do którego nikt nie chodzi, nie ma obrońców, gdy przychodzi decyzja o wycince albo drodze. Ale bukowe runo regeneruje się dekadami, a każdy skrót wydeptany obok ścieżki zostaje na lata.",
        },
        coords: [19.86212, 50.06381],
        radius: 50,
      },
      {
        id: 'spichlerz',
        category: 'history',
        name: "Mały spichlerz",
        teaser: "Stary budynek gospodarczy przy granicy rezerwatu.",
        description: [
          "Zanim Las Wolski stał się parkiem miejskim, były to tereny folwarczne i klasztorne: pola, sady i budynki gospodarcze. Ten spichlerz jest jednym z niewielu śladów tego okresu.",
          "Spichlerze budowano solidnie, bo chroniły plony przez zimę: grube mury, mała liczba okien, dobra wentylacja. Dlatego przetrwały dłużej niż inne wiejskie budynki.",
          "To punkt dla tych, którzy lubią zauważać rzeczy, obok których wszyscy przechodzą, uznając je za szopę.",
        ],
        findHint: "Przy drodze na skraju rezerwatu, w stronę Woli Justowskiej.",
        reveal: "Zwierzyniec i okoliczne wsie należały przez wieki do norbertanek, których klasztor stoi nad Wisłą do dziś. To one gospodarowały tymi ziemiami, gdy Kraków był jeszcze małym miastem za murami.",
        dilemma: {
          question: "Budynki gospodarcze rzadko uznajemy za zabytki, choć mówią o codziennym życiu więcej niż pałace. Co warto chronić?",
          options: ["Pałace, mają wartość artystyczną", "Zwykłe budynki, mówią prawdę", "Jedno i drugie po równo"],
          counterpoint: "Pałac jest dziełem sztuki i świadectwem najwyższych umiejętności epoki, więc jego ochrona nie budzi wątpliwości. Ale w pałacu mieszkało kilkanaście osób, a w takich budynkach pracowały tysiące, i po nich nie zostaje nic.",
        },
        coords: [19.86233, 50.06413],
        radius: 60,
      },
    ],
  },
  {
    parkId: 'jalu-kurka',
    pois: [
      {
        id: 'palac-tarnowskich',
        category: 'history',
        name: "Pałac Tarnowskich",
        teaser: "Miejska rezydencja z 1878 roku przy parku.",
        description: [
          "Pałac zbudowano w 1878 roku, gdy Kraków wychodził za mury i bogate rodziny stawiały rezydencje przy nowych ulicach. Dziś mieści instytucje, a nie mieszkańców.",
          "Ta okolica to dawne przedmieście Wesoła: teren szpitali, ogrodów i pierwszych kamienic czynszowych. Park Jalu Kurka jest resztką dawnej zieleni między nimi.",
          "Warto spojrzeć na detale elewacji: gzymsy, obramienia okien i sztukaterie robiono wtedy na miejscu, ręcznie, i każda kamienica miała inne.",
        ],
        findHint: "Przy ul. Lubomirskiego, tuż obok parku.",
        reveal: "Jalu Kurek, patron parku, był pierwszym polskim futurystą i pisał manifesty przeciw tradycji. Park jego imienia leży dokładnie pod okami dziewiętnastowiecznego pałacu.",
        dilemma: {
          question: "Park nazwano imieniem futurysty, który walczył z przywiązaniem do przeszłości, i umieszczono go wśród zabytków. Czy patron powinien pasować do miejsca?",
          options: ["Powinien", "Kontrast jest lepszy", "To bez znaczenia"],
          counterpoint: "Nazwa, która pasuje do miejsca, tłumaczy się sama i łatwo ją zapamiętać. Ale najciekawsze nazwy to te, które zmuszają do pytania, i akurat futurysta pod pałacem takie pytanie zadaje.",
        },
        photo: '/photos/poi-jalu-kurka-palac-tarnowskich.jpg',
        photoCredit: 'Fot. Zygmunt Put · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.9423, 50.07042],
        radius: 65,
      },
      {
        id: 'kosciol-nspj',
        category: 'history',
        name: "Kościół Najświętszego Serca Pana Jezusa",
        teaser: "Jezuicka bazylika kilka kroków od parku.",
        description: [
          "Bazylika jezuitów przy ul. Kopernika to jeden z najciekawszych kościołów Krakowa z początku XX wieku: modernistyczna bryła, mozaiki i rzeźby wykonane przez najlepszych artystów epoki.",
          "Budowano ją w latach 1909-21, więc powstawała przez pierwszą wojnę światową. Nad wystrojem pracował między innymi Xawery Dunikowski.",
          "Wejście jest zwykle otwarte, a wnętrze zaskakuje: mało kto spodziewa się tu tak nowoczesnej architektury sakralnej.",
        ],
        findHint: "Ul. Kopernika, dwie minuty od parku.",
        reveal: "Jezuici prowadzili w tej okolicy Bratnią Pomoc dla młodych rzemieślników, którą organizował ksiądz Kuznowicz, upamiętniony pomnikiem na Błoniach. Ta dzielnica była centrum pracy społecznej zakonu.",
        dilemma: {
          question: "Kościół z początku XX wieku wygląda nowocześnie i to bywało zarzutem. Czy świątynia powinna trzymać się tradycyjnych form?",
          options: ["Powinna, forma nosi treść", "Nie, każda epoka ma swoją", "Ważne, żeby była dobra architektonicznie"],
          counterpoint: "Tradycyjne formy są od razu czytelne i łączą z pokoleniami, które modliły się tak samo. Ale każda z tych form była kiedyś nowa i szokowała, więc trzymanie się jednego stylu zatrzymuje architekturę w wybranym stuleciu.",
        },
        photo: '/photos/poi-jalu-kurka-kosciol-nspj.jpg',
        photoCredit: 'Fot. Magdalia25 · CC BY-SA 3.0 pl · Wikimedia Commons',
        coords: [19.94272, 50.06876],
        radius: 35,
      },
    ],
  },
  {
    parkId: 'wisniowy-sad',
    pois: [
      {
        id: 'flirt-wodorostow',
        category: 'monument',
        name: "Flirt wodorostów z muszlą",
        teaser: "Rzeźba z najbardziej zaskakującym tytułem w mieście.",
        description: [
          "Tytuł tej rzeźby jest lepszy niż większość tytułów w krakowskich parkach i sam w sobie jest powodem, żeby tu przyjść. Forma jest abstrakcyjna, więc każdy widzi coś innego.",
          "Park Wiśniowy Sad powstał na terenie dawnych sadów w Czyżynach, a rzeźby dodano jako element nowego zagospodarowania. To rzadki przypadek, gdy nowy park od razu dostaje sztukę.",
          "Podejdź blisko i spróbuj znaleźć w formie i wodorosty, i muszlę. To zadanie na kilka minut i działa lepiej z dzieckiem.",
        ],
        findHint: "Alejka w środkowej części parku.",
        reveal: "Nowe krakowskie parki dostają dziś rzeźby z konkursów i budżetów obywatelskich, więc o tym, co stoi w parku, decydują często sami mieszkańcy dzielnicy.",
        dilemma: {
          question: "O sztuce w parku decydują dziś głosowania mieszkańców, nie kuratorzy. Czy to dobry sposób wybierania sztuki?",
          options: ["Dobry, to ich park", "Zły, potrzebna wiedza", "Dobry z kuratorskim filtrem"],
          counterpoint: "Ludzie żyją z tą rzeźbą codziennie, więc mają prawo wybrać, co widzą pod oknem, a frekwencja daje jej realną akceptację. Ale głosowania wybierają to, co najłatwiej polubić od razu, a sztuka bywa trudna właśnie na starcie.",
        },
        photo: '/photos/poi-wisniowy-sad-flirt-wodorostow.jpg',
        photoCredit: 'Fot. Mach240390 · CC BY 4.0 · Wikimedia Commons',
        coords: [20.027, 50.07637],
        radius: 30,
      },
      {
        id: 'syrenka',
        category: 'monument',
        name: "Syrenka",
        teaser: "Druga rzeźba parku, przy wschodniej alejce.",
        description: [
          "Syrenka w Czyżynach nie ma nic wspólnego z warszawską: to lokalna rzeźba w nowym parku, jedna z tych, przy których dzieci robią sobie zdjęcia.",
          "Park jest młody, więc drzewa są jeszcze niewysokie, a rzeźby dobrze widoczne z daleka. Za dwadzieścia lat trzeba ich będzie szukać w cieniu.",
          "To dobry punkt na koniec spaceru: stąd blisko do wyjścia w stronę al. Pokoju i przystanków.",
        ],
        findHint: "Wschodnia część parku, przy głównej alejce.",
        reveal: "Czyżyny były wsią z sadami, a potem terenem lotniska Rakowice-Czyżyny. Park Wiśniowy Sad nosi nazwę od tych sadów, a nie od sztuki Czechowa, choć skojarzenie samo się narzuca.",
        dilemma: {
          question: "Nazwa parku odsyła do sadów, których już nie ma. Czy nazwy powinny upamiętniać to, co zniknęło?",
          options: ["Powinny, to pamięć miejsca", "Nie, mylą", "Tylko jeśli ktoś to wyjaśnia"],
          counterpoint: "Nazwa jest często ostatnim śladem tego, co było, i dzięki niej ktoś kiedyś zapyta o sady. Ale mieszkaniec nowego bloku słyszy tylko ładne słowo, bo nikt mu nie powie, że stały tu drzewa owocowe.",
        },
        photo: '/photos/poi-wisniowy-sad-syrenka.jpg',
        photoCredit: 'Fot. Emka57 · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [20.02952, 50.07576],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'planty-bienczyckie',
    pois: [
      {
        id: 'lawendowy-ogrod',
        category: 'meadow',
        name: "Lawendowe Planty",
        teaser: "Lawendowy ogród w środku nowohuckich Plant.",
        description: [
          "Ktoś tu wpadł na dobry pomysł: w środku zielonego pasa przez Bieńczyce urządzono ogród lawendowy, który w lipcu pachnie na cały skwer i wygląda jak fragment Prowansji.",
          "Lawenda jest rośliną wdzięczną w mieście: znosi suszę, nie wymaga koszenia i przyciąga pszczoły, których w Nowej Hucie jest zaskakująco dużo dzięki pasiekom miejskim.",
          "Najlepszy moment to pełnia lipca, ale nawet zimą widać układ ogrodu i ścieżki.",
        ],
        findHint: "Środkowa część Plant Bieńczyckich, przy alejce.",
        reveal: "Planty Bieńczyckie zaprojektowano razem z całą dzielnicą w latach pięćdziesiątych, jako zielony kręgosłup Nowej Huty. Lawendowy ogród jest dopisany współcześnie, przez mieszkańców i dzielnicę.",
        dilemma: {
          question: "Socrealistyczny plan dzielnicy przewidział zieleń dla wszystkich, dziś mieszkańcy dopisują do niego własne pomysły. Kto powinien decydować o kształcie parku?",
          options: ["Projektant, ma całość w głowie", "Mieszkańcy, oni tu żyją", "Projektant ramy, ludzie detale"],
          counterpoint: "Wielki plan dał Nowej Hucie zieleni więcej niż jakiejkolwiek innej dzielnicy Krakowa, i tego nie zrobiłyby oddolne inicjatywy. Ale plan nie wie, że komuś brakuje ogrodu lawendowego pod domem, i nigdy tego nie dopisze.",
        },
        coords: [20.02661, 50.0847],
        radius: 35,
      },
      {
        id: 'gitara',
        category: 'monument',
        name: "Gitara",
        teaser: "Rzeźba przy alejkach Bieńczyc.",
        description: [
          "Gitara w środku osiedlowego parku wygląda jak żart, a jest dokładnie tym, czym powinna być sztuka w takim miejscu: rozpoznawalna od pierwszego spojrzenia i lubiana przez dzieci.",
          "Nowa Huta ma mocną tradycję muzyczną: kluby, zespoły i sale prób w piwnicach bloków. To dzielnica, w której na gitarze grał co drugi nastolatek.",
          "Punkt jest krótki, ale przyjemny: dobrze wypada na zdjęciu i łatwo go połączyć z ogrodem lawendowym.",
        ],
        findHint: "Przy alejce w środkowej części Plant, w stronę os. Kalinowego.",
        reveal: "W Nowej Hucie działał w latach osiemdziesiątych jeden z najważniejszych ośrodków polskiej muzyki alternatywnej, a kluby osiedlowe miały sale prób, w których zaczynały zespoły znane potem w całym kraju.",
        dilemma: {
          question: "Nowa Huta bywa opisywana wyłącznie przez stal i politykę, choć miała też własną kulturę. Czy dzielnica ma prawo do innej opowieści o sobie?",
          options: ["Ma, każda ma", "Historia jest jaka jest", "Zależy, kto opowiada"],
          counterpoint: "Miejsce, które zna tylko swoją najgłośniejszą wersję, traci wszystko, co ludzie w nim naprawdę robili: muzykę, sport, sąsiedztwo. Ale kombinat i decyzje polityczne stworzyły tę dzielnicę i bez nich nie da się jej wytłumaczyć.",
        },
        coords: [20.02712, 50.0837],
        radius: 30,
      },
    ],
  },
  {
    parkId: 'szwedzki',
    pois: [
      {
        id: 'stara-kaplica',
        category: 'history',
        name: "Stara kaplica",
        teaser: "Najstarszy budynek w okolicy parku.",
        description: [
          "Kaplica jest starsza niż wszystko wokół: pamięta czasy, gdy była to podkrakowska wieś, a nie osiedle. Takie budynki zostawiano, gdy budowano Nową Hutę, bo były w użyciu.",
          "Nazwa parku, Szwedzki, przypomina o potopie szwedzkim i walkach o Kraków w XVII wieku. W tej części miasta stały wtedy wojska i obozy.",
          "Punkt dobry na chwilę zastanowienia nad warstwami: wieś, wojna, kombinat, osiedle, park.",
        ],
        findHint: "Przy kościele na skraju parku.",
        reveal: "Szwedzi zajęli Kraków w 1655 roku po kilkutygodniowym oblężeniu i trzymali miasto ponad dwa lata. Wychodząc, wywieźli lub zniszczyli znaczną część miejskich zbiorów i archiwów.",
        dilemma: {
          question: "Nazwa parku upamiętnia najeźdźcę, nie obrońców. Czy tak powinny działać nazwy miejsc?",
          options: ["To po prostu nazwa historyczna", "Powinna upamiętniać obrońców", "Nazwa ma przypominać, nie oceniać"],
          counterpoint: "Nazwa od wydarzenia jest neutralna i przypomina, że tu coś się stało, bez rozdawania medali. Ale język kształtuje pamięć, a nazwa od najeźdźcy sprawia, że pierwsze skojarzenie dotyczy jego, nie ludzi, którzy się bronili.",
        },
        coords: [20.04601, 50.07519],
        radius: 35,
      },
      {
        id: 'kosciol-czestochowskiej',
        category: 'history',
        name: "Kościół Matki Boskiej Częstochowskiej",
        teaser: "Kościół przy parku, w dzielnicy budowanej bez kościołów.",
        description: [
          "Nowa Huta była projektowana jako miasto bez kościoła: w pierwotnym planie nie przewidziano ani jednej świątyni. Mieszkańcy walczyli o nie przez dekady.",
          "Najgłośniejsza była walka o Arkę Pana w Bieńczycach, gdzie w 1960 roku doszło do starć w obronie krzyża. Kościoły w tej dzielnicy są więc pomnikami uporu, nie tylko budynkami sakralnymi.",
          "Ten kościół stoi przy parku i dla okolicy jest naturalnym punktem orientacyjnym.",
        ],
        findHint: "Na skraju parku, obok starej kaplicy.",
        reveal: "W 1960 roku w Nowej Hucie doszło do wielodniowych zamieszek w obronie krzyża postawionego na placu pod przyszły kościół. Zatrzymano kilkaset osób, a plan dzielnicy bez świątyń ostatecznie upadł.",
        dilemma: {
          question: "Dzielnicę zaprojektowano bez miejsc kultu, bo tak chciała władza. Czy plan miasta powinien przewidywać takie potrzeby, czy zostawiać je ludziom?",
          options: ["Powinien przewidywać", "Ludzie sami dopiszą", "Plan nie powinien zakazywać"],
          counterpoint: "Miasto, które nie zaplanuje miejsca na to, czego ludzie potrzebują, dostaje potem chaos i walkę o każdą działkę. Ale planista nie powinien decydować, w co ludzie wierzą, a właśnie taką decyzję próbowano tu podjąć za nich.",
        },
        photo: '/photos/poi-szwedzki-kosciol-czestochowskiej.jpg',
        photoCredit: 'Fot. Zygmunt Put Zetpe0202 · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [20.04541, 50.07555],
        radius: 90,
      },
    ],
  },
  {
    parkId: 'stacja-wisla',
    pois: [
      {
        id: 'tunel-balki',
        category: 'monument',
        name: "Tunel Mirosława Bałki",
        teaser: "Instalacja jednego z najważniejszych polskich artystów.",
        description: [
          "Mirosław Bałka jest artystą znanym na całym świecie: jego wielka instalacja How It Is stanęła w Tate Modern w Londynie. Pracuje głównie z pamięcią, ciałem i przestrzenią, często dotykając historii Zagłady.",
          "Ta praca odwołuje się do kolejowej przeszłości miejsca i do transportów, które przechodziły przez Kraków. Tytuł zestawia dwie nazwy stacji, między którymi jechały pociągi z ludźmi.",
          "Instalacji nie da się zobaczyć w przelocie: trzeba w nią wejść, stanąć w środku i chwilę zostać. To nie rzeźba do zdjęcia, a przestrzeń do przejścia.",
        ],
        findHint: "Park przy dawnej stacji kolejowej, instalacja przy alejce.",
        reveal: "Bałka konsekwentnie nie tłumaczy swoich prac. Uważa, że praca ma działać na ciało widza: przez ciasnotę, ciemność albo dźwięk, a nie przez opis na tabliczce.",
        dilemma: {
          question: "Artysta nie wyjaśnia pracy o Zagładzie, zostawiając widza samego z odczuciem. Czy trudne tematy potrzebują wyjaśnienia?",
          options: ["Potrzebują, żeby nie zniknęły", "Nie, doświadczenie wystarczy", "Wyjaśnienie tylko dla tych, którzy chcą"],
          counterpoint: "Bez kontekstu młody widz nie skojarzy tytułu z niczym i przejdzie obok betonowej formy. Ale każdy opis narzuca jedną interpretację, a przy tym temacie łatwo zamienić pamięć w lekcję do zaliczenia.",
        },
        coords: [19.96147, 50.05088],
        radius: 80,
      },
      {
        id: 'stacja',
        category: 'history',
        name: "Dawna stacja kolejowa",
        teaser: "Tory i peron, od których park wziął nazwę.",
        description: [
          "Kraków był węzłem kolejowym od połowy XIX wieku i miał wiele małych stacji towarowych, o których dziś prawie nikt nie pamięta. Stacja Wisła obsługiwała ruch przy rzece.",
          "Kolej zmieniła to miasto mocniej niż cokolwiek innego: wyznaczyła granice dzielnic, przyniosła przemysł i zabrała miejski czas, zastępując go rozkładem jazdy.",
          "Dziś zostały tory, nazwa i park. To najmniejsze miejsce w całej kolekcji, ale z jedną z najmocniejszych historii.",
        ],
        findHint: "Skraj parku po stronie torów.",
        reveal: "Przez krakowskie stacje przechodziły w czasie okupacji transporty do obozów. Zwykła bocznica kolejowa bywała częścią najgorszych wydarzeń tego stulecia, a potem wracała do przewożenia węgla.",
        dilemma: {
          question: "Infrastruktura jest neutralna, dopóki ktoś jej nie użyje. Czy tory kolejowe mogą być winne?",
          options: ["Nie, winni są ludzie", "Tak, są częścią systemu", "Wina nie, ale pamięć tak"],
          counterpoint: "Szyny nie decydują, co nimi jedzie, a obwinianie rzeczy zdejmuje odpowiedzialność z ludzi. Ale bez kolei ta skala zbrodni nie byłaby możliwa, a inżynierowie, którzy planowali rozkłady transportów, byli konkretnymi ludźmi.",
        },
        coords: [19.96041, 50.05084],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'grzegorzecki',
    pois: [
      {
        id: 'luneta',
        category: 'history',
        name: "Relikty Lunety Grzegórzeckiej",
        teaser: "Ślad fortu 17 z pierścienia Twierdzy Kraków.",
        description: [
          "Luneta Grzegórzecka była dziełem obronnym z połowy XIX wieku, częścią wewnętrznego pierścienia Twierdzy Kraków. Pilnowała podejścia od wschodu, wzdłuż Wisły.",
          "Nazwa luneta w fortyfikacji nie ma nic wspólnego z optyką: to niewielkie, samodzielne dzieło obronne o charakterystycznym kształcie strzały.",
          "Z fortu zostały fragmenty murów i wałów, wtopione w park. Wielu mieszkańców Grzegórzek nie wie, że codziennie przechodzi obok fortyfikacji.",
        ],
        findHint: "Wschodnia część parku, szukaj ceglanych fragmentów i nasypów.",
        reveal: "Twierdza Kraków miała dwa pierścienie: wewnętrzny, przy samym mieście, i zewnętrzny, kilkanaście kilometrów dalej. Wewnętrzny wchłonęło miasto, a jego forty stoją dziś wśród bloków, garaży i parków.",
        dilemma: {
          question: "Forty w mieście są ruinami: kosztowne w remoncie, kłopotliwe w użyciu, ale to zabytki. Co z nimi robić?",
          options: ["Remontować za każdą cenę", "Zostawić jako ruiny", "Adaptować na nowe funkcje"],
          counterpoint: "Fort zamieniony w kawiarnię albo klub przeżyje, bo ktoś będzie miał interes w naprawie dachu. Ale adaptacja zawsze coś wycina, a ruina, w której nie ma windy i toalet, mówi prawdę o tym, czym to miejsce było.",
        },
        coords: [19.96856, 50.05453],
        radius: 40,
      },
      {
        id: 'bulwary-grzegorzki',
        category: 'water',
        name: "Zejście na bulwary",
        teaser: "Stąd kilka minut do Wisły i bulwarów.",
        description: [
          "Grzegórzki leżą w dawnej dolinie zalewowej Wisły. Rzeka wielokrotnie przesuwała tu swoje koryto, a miasto walczyło z powodziami przez stulecia, aż w XIX wieku uregulowano brzegi.",
          "Dziś z parku jest kilka minut do bulwarów wiślanych, najdłuższego ciągu spacerowego w Krakowie. Można iść stąd wzdłuż wody aż pod Wawel.",
          "Ten punkt jest zaproszeniem do przedłużenia wyprawy: park to tylko początek trasy.",
        ],
        findHint: "Południowa krawędź parku, w stronę ul. Kotlarskiej i rzeki.",
        reveal: "Wisła w Krakowie miała kilka odnóg i wysp, a dzisiejsze koryto jest w dużej mierze dziełem inżynierów. Stare Podgórze i Kazimierz były przez wieki oddzielone wodą, której już nie ma.",
        dilemma: {
          question: "Miasto wyprostowało rzekę, żeby przestała zalewać domy, i straciło jej naturalny charakter. Dobry interes?",
          options: ["Dobry, powodzie zabijały", "Zły, zabetonowaliśmy rzekę", "Konieczny, ale zrobiony zbyt brutalnie"],
          counterpoint: "Regulacja uratowała dzielnice, które co dekadę stały pod wodą, i pozwoliła miastu rosnąć nad rzeką. Ale rzeka w betonowym korycie płynie szybciej, jest uboższa biologicznie, a wielka woda i tak przychodzi, tylko dalej w dół.",
        },
        coords: [19.96654, 50.05372],
        radius: 60,
      },
    ],
  },
  {
    parkId: 'witkowice',
    pois: [
      {
        id: 'kawerna',
        category: 'cave',
        name: "Kawerna Witkowice",
        teaser: "Wejście do podziemnego schronu w lesie.",
        description: [
          "Kawerna to podziemne pomieszczenie wykute w skale albo wybetonowane pod ziemią, część systemu fortyfikacji. W okolicy Witkowic zachowały się takie obiekty z czasów Twierdzy Kraków.",
          "Wejście jest zabezpieczone, bo w takich miejscach zimują nietoperze, a niekontrolowane wejście grozi zawaleniem. Widać jednak konstrukcję i wlot.",
          "Sam las jest równie ciekawy: sosnowy, z runem typowym dla borów, zupełnie inny od miejskich parków z trawnikiem.",
        ],
        findHint: "Ścieżka w środku lasu, szukaj betonowej konstrukcji przy zboczu.",
        reveal: "Opuszczone fortyfikacje są dziś jednym z najważniejszych schronień dla nietoperzy w miastach: stała temperatura i wilgotność robią z nich idealne zimowisko. W krakowskich fortach zimuje kilka gatunków objętych ochroną.",
        dilemma: {
          question: "Fort jest jednocześnie zabytkiem i domem chronionych zwierząt, a te dwie ochrony sobie przeszkadzają. Co ma pierwszeństwo?",
          options: ["Zabytek", "Nietoperze", "Ten, kto był pierwszy"],
          counterpoint: "Zabytek bez remontu rozpada się i za pięćdziesiąt lat nie będzie już czego chronić. Ale prace budowlane w zimie potrafią wybić całą kolonię, a nietoperze nie mają gdzie się przenieść, bo innych takich miejsc w mieście nie ma.",
        },
        coords: [19.94639, 50.10605],
        radius: 40,
      },
      {
        id: 'bor-witkowice',
        category: 'nature',
        name: "Sosnowy bór",
        teaser: "Najbardziej leśny fragment północnego Krakowa.",
        description: [
          "Park Leśny Witkowice to nie park z alejkami, a piętnaście hektarów prawdziwego lasu: sosny, brzozy, ścieżki gruntowe i runo, którego nikt nie kosi.",
          "Taki las robi coś, czego trawnik nie potrafi: filtruje powietrze, zatrzymuje wodę i obniża temperaturę w upał o kilka stopni. W mieście to nie estetyka, a infrastruktura.",
          "Idź ścieżką w głąb, aż przestanie być słychać ulicę. To zwykle wystarcza kilkaset metrów.",
        ],
        findHint: "Ścieżki w środku lasu, wejście od strony osiedla Witkowice.",
        reveal: "Drzewa w mieście obniżają temperaturę odczuwalną nawet o kilka stopni, głównie przez parowanie wody z liści. Jedno duże drzewo w upalny dzień działa jak kilka klimatyzatorów, tylko cicho i za darmo.",
        dilemma: {
          question: "Miejski las daje cień, wodę i chłód, ale zajmuje działki warte miliony. Czym miasto powinno się kierować?",
          options: ["Ceną gruntu", "Klimatem i zdrowiem", "Bilansem obu"],
          counterpoint: "Mieszkania są potrzebne i każda niezabudowana działka podnosi ceny w całym mieście. Ale w upalne lata to właśnie takie fragmenty decydują, czy dzielnica jest do życia, a wyciętego lasu nie da się kupić z powrotem.",
        },
        coords: [19.94566, 50.10538],
        radius: 70,
      },
    ],
  },
  {
    parkId: 'reduta',
    pois: [
      {
        id: 'szaniec',
        category: 'history',
        name: "Szaniec IS V-6",
        teaser: "Umocnienie z 1887 roku ukryte w parku.",
        description: [
          "Szaniec to prostsze i tańsze dzieło obronne niż fort: nasypy ziemne z okopami, budowane szybciej i na czas wojny. Ten pochodzi z 1887 roku i należał do Twierdzy Kraków.",
          "Nazwa parku, Reduta, też jest wojskowa: reduta to samodzielne umocnienie polowe. Cała ta okolica była kiedyś przedpolem twierdzy.",
          "Z szańca zostały nasypy, w które wrosły drzewa. Trzeba wiedzieć, że tam są, żeby zauważyć, że wzniesienie nie jest naturalne.",
        ],
        findHint: "Wschodnia część parku, nasypy wśród drzew.",
        reveal: "Nazwy krakowskich ulic i parków w tej okolicy to gotowa lekcja fortyfikacji: Reduta, Szaniec, Fort, Bastion. Cała dzielnica nosi nazwy po umocnieniach, których już nie widać.",
        dilemma: {
          question: "Nazwy przechowały pamięć o umocnieniach, których nie ma. Czy nazwa jest wystarczającą formą pamięci?",
          options: ["Wystarczającą", "Za słabą", "Wystarczającą, jeśli ktoś jeszcze wie dlaczego"],
          counterpoint: "Nazwa przetrwa dłużej niż mur i nie wymaga budżetu na konserwację: to najtrwalszy pomnik, jaki mamy. Ale nazwa bez wyjaśnienia staje się dźwiękiem, a Reduta brzmi dziś dla większości jak nazwa przystanku.",
        },
        photo: '/photos/poi-reduta-szaniec.jpg',
        photoCredit: 'Fot. Mach240390 · CC BY 4.0 · Wikimedia Commons',
        coords: [19.98474, 50.09588],
        radius: 45,
      },
      {
        id: 'staw-reduta',
        category: 'water',
        name: "Staw w parku",
        teaser: "Woda, kaczki i wędkarze w środku Mistrzejowic.",
        description: [
          "Staw jest sercem tego parku: gromadzi kaczki, czasem czaplę, a przy ciepłej pogodzie ludzi z wędkami i aparatami. Woda w mieście działa jak magnes.",
          "Zbiorniki w takich parkach mają też zadanie techniczne: zbierają wodę z okolicznych osiedli i spowalniają jej odpływ, co przy nawalnych deszczach ratuje piwnice.",
          "Warto obejść staw wokół: z każdej strony wygląda inaczej, a najlepsze światło jest wieczorem od zachodniej strony.",
        ],
        findHint: "Środek parku, główna alejka prowadzi wokół wody.",
        reveal: "Miejskie stawy retencyjne stały się w ostatnich latach jednym z głównych sposobów walki z podtopieniami: zamiast szybko odprowadzać wodę rurami, miasta uczą się ją zatrzymywać i przetrzymywać na miejscu.",
        dilemma: {
          question: "Zbiornik w parku jest jednocześnie urządzeniem technicznym i miejscem wypoczynku. Czy infrastruktura powinna udawać przyrodę?",
          options: ["Powinna, tak jest przyjaźniej", "Nie, to nieuczciwe", "Ważne, żeby działała i była ładna"],
          counterpoint: "Zbiornik z trzciną, kaczkami i ławkami służy ludziom przez cały rok, a betonowy basen tylko podczas ulewy: to lepsze wykorzystanie miejsca. Ale ludzie zaczynają traktować takie miejsca jak naturalne stawy i protestują, gdy trzeba je wyczyścić albo opuścić.",
        },
        coords: [19.98399, 50.09550],
        radius: 50,
      },
    ],
  },
  {
    parkId: 'szymborskiej',
    pois: [
      {
        id: 'nic-dwa-razy',
        category: 'monument',
        name: "Nic dwa razy",
        teaser: "Instalacja z wierszem noblistki.",
        description: [
          "Wisława Szymborska mieszkała kilka minut od tego parku i była częścią tej okolicy: chodziła po Karmelickiej, siadała w kawiarniach, unikała rozgłosu tak skutecznie, że po Noblu wprowadziła pojęcie tragedii stockholmskiej.",
          "Nic dwa razy to jeden z jej najbardziej znanych wierszy: o tym, że każdy dzień jest jedyny, bo powtórzenia nie ma. Trafna myśl na park, do którego wpada się na kwadrans.",
          "Sam park powstał w 2015 roku i jest kieszonkowy: mieści trawnik, kilka ławek i sporo bylin.",
        ],
        findHint: "Instalacja przy alejce w środku parku.",
        reveal: "Szymborska po Noblu mówiła, że nagroda odebrała jej spokój, i nazwała ten stan tragedią stockholmską. Do końca życia sama odbierała telefony i sama parzyła herbatę gościom.",
        dilemma: {
          question: "Poetka unikała rozgłosu, a miasto nazwało jej imieniem park i wypisało jej wiersz na instalacji. Czy upamiętnianie wbrew czyjejś naturze jest w porządku?",
          options: ["W porządku, to hołd", "Nie, trzeba szanować dyskrecję", "W porządku po śmierci"],
          counterpoint: "Wiersze przestają być prywatne w chwili publikacji i należą też do czytelników, którzy chcą je mieć w mieście. Ale człowiek, który przez całe życie unikał świateł, dostał w końcu tabliczkę z nazwiskiem na skwerze, o którą nie prosił.",
        },
        photo: '/photos/poi-szymborskiej-nic-dwa-razy.jpg',
        photoCredit: 'Fot. Andrzej Otrębski · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.93029, 50.06565],
        radius: 30,
      },
      {
        id: 'park-kieszonkowy',
        category: 'meadow',
        name: "Park kieszonkowy",
        teaser: "Najmniejszy typ parku, który zmienia całą ulicę.",
        description: [
          "Park kieszonkowy to pomysł na miasto gęste: zamiast jednego wielkiego parku na obrzeżu, dziesiątki małych na miejscu podwórek, parkingów i nieużytków. Ten powstał na zaniedbanym skwerze.",
          "Kraków ma dziś kilkadziesiąt takich miejsc i przybywają co roku, często z budżetu obywatelskiego. Każde ma kilkaset metrów kwadratowych i obsługuje kilka okolicznych kamienic.",
          "Zwróć uwagę na obsadzenie: byliny zamiast trawnika, bo nie wymagają koszenia, kwitną kilka miesięcy i lepiej znoszą suszę.",
        ],
        findHint: "Cały park, przy ul. Karmelickiej.",
        reveal: "Badania nad miastami pokazują rzecz zaskakującą: dostęp do małego parku w promieniu kilku minut spaceru wpływa na zdrowie mieszkańców bardziej niż istnienie dużego parku, do którego trzeba jechać.",
        dilemma: {
          question: "Miasto może zrobić jeden duży park albo dwadzieścia kieszonkowych za te same pieniądze. Co wybrać?",
          options: ["Jeden duży", "Wiele małych", "Zależy od dzielnicy"],
          counterpoint: "Duży park daje to, czego mały nigdy nie da: przestrzeń, ciszę, las, miejsce na sport i ucieczkę od miasta. Ale do dużego trzeba dojechać, a mały mija się codziennie w drodze do sklepu, i to on realnie zmienia jakość życia.",
        },
        coords: [19.93012, 50.0656],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'zaczarowanej-dorozki',
    pois: [
      {
        id: 'zabi-mlyn',
        category: 'history',
        name: "Żabi Młyn",
        teaser: "Ślad dawnego młyna nad wodą.",
        description: [
          "Zanim Azory stały się osiedlem, była to okolica pól, wody i młynów. Żabi Młyn to jeden z tych, które napędzała woda z Młynówki Królewskiej i okolicznych cieków.",
          "Młyn był dla wsi centrum życia gospodarczego: mieliło się tu zboże z całej okolicy, a młynarz był jednym z najważniejszych ludzi we wsi.",
          "Dziś zostały nazwa i resztki zabudowy. Warto stanąć i wyobrazić sobie wodę, która tu płynęła.",
        ],
        findHint: "Skraj parku po stronie ul. Weissa.",
        reveal: "Nazwa parku pochodzi od wiersza Konstantego Ildefonsa Gałczyńskiego o zaczarowanej dorożce, zaczarowanym dorożkarzu i zaczarowanym koniu. Wiersz powstał w Krakowie w 1946 roku, w kilka dni po powrocie poety do Polski.",
        dilemma: {
          question: "Park nosi nazwę od wiersza, a miejsce ma własną historię młyna i wody. Która opowieść powinna być pierwsza?",
          options: ["Wiersz, jest piękny", "Historia miejsca", "Obie, w tej kolejności co kto woli"],
          counterpoint: "Wiersz przyciąga i zostaje w pamięci, a nazwa z poezji jest lepsza niż numer działki. Ale przez ładną nazwę nikt nie pyta, dlaczego to miejsce nazywa się Żabi Młyn, i historia wody znika.",
        },
        coords: [19.96747, 50.08643],
        radius: 40,
      },
      {
        id: 'stawek-dorozki',
        category: 'water',
        name: "Stawek i mostek",
        teaser: "Woda w środku małego parku, z żabami w tle.",
        description: [
          "Stawek z mostkiem to serce tego parku i powód, dla którego wieczorami słychać tu żaby, co w mieście jest luksusem.",
          "Małe zbiorniki są dla przyrody nieproporcjonalnie ważne: żaby, ważki i ptaki potrzebują wody, a w gęstej zabudowie nie mają jej gdzie znaleźć.",
          "Najlepiej przyjść tu ciepłym wieczorem w maju albo czerwcu, gdy chór żab jest w pełni formy.",
        ],
        findHint: "Środek parku, mostek nad wodą.",
        reveal: "Żaby wracają do miast szybciej, niż się wydaje: wystarczy zbiornik z łagodnym brzegiem i roślinnością, żeby w drugim albo trzecim roku pojawiło się skrzeczenie. Kluczem jest brak rybek, które zjadają kijanki.",
        dilemma: {
          question: "W miejskich stawach ludzie wypuszczają rybki, co likwiduje żaby i ważki. Czy miasto ma prawo tego zakazać?",
          options: ["Ma, chroni przyrodę", "Nie, to drobnostka", "Powinno raczej wyjaśniać"],
          counterpoint: "Jedna wypuszczona rybka potrafi wyczyścić cały staw z kijanek, a ludzie robią to z dobrymi intencjami, nie wiedząc nic o skutkach. Ale zakazy w parku, których nikt nie tłumaczy, budują tylko poczucie, że miasto się czepia.",
        },
        coords: [19.96712, 50.08607],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'laki-nowohuckie',
    pois: [
      {
        id: 'storczyki',
        category: 'meadow',
        name: "Łąka storczykowa",
        teaser: "Rzadkie storczyki kilkaset metrów od bloków.",
        description: [
          "Na tych łąkach rosną dzikie storczyki, w tym kruszczyk błotny i storczyk krwisty, a także mieczyk dachówkowaty. To gatunki, które w Polsce są chronione i znikają wraz z osuszaniem terenów podmokłych.",
          "Kwitną od maja do lipca i trzeba ich szukać uważnie: są niepozorne w porównaniu ze sklepowymi storczykami, ale to właśnie one są tu w domu.",
          "Nie zbieraj i nie wchodź w głąb łąki. Storczyki potrzebują konkretnych grzybów w glebie i przeniesione po prostu umierają.",
        ],
        findHint: "Ścieżki przez środek łąk, od strony Bulwarowej.",
        reveal: "Te łąki przetrwały, bo były zbyt podmokłe pod zabudowę, a przez dekady kosiła je woda i przypadek. Rezerwatowy charakter dostały dopiero, gdy ktoś sprawdził, co tu rośnie.",
        dilemma: {
          question: "Cenna przyroda ocalała, bo terenu nie dało się zabudować. Czy ochrona przyrody potrzebuje wiedzy, czy szczęścia?",
          options: ["Wiedzy", "Szczęścia", "Szczęścia, które ktoś w końcu zauważy"],
          counterpoint: "Bez badań nikt nie wiedziałby, że rosną tu storczyki, i teren dawno by osuszono pod inwestycję. Ale to nie wiedza uratowała łąki przez pięćdziesiąt lat, a woda w gruncie i brak pomysłu, co z tym zrobić.",
        },
        coords: [20.0333, 50.06776],
        radius: 70,
      },
      {
        id: 'widok-kombinat',
        category: 'view',
        name: "Widok na kombinat",
        teaser: "Łąka na pierwszym planie, huta na drugim.",
        description: [
          "Z łąk widać kominy i hale kombinatu, dziś należącego do międzynarodowego koncernu. To najlepszy widok na sprzeczność, z której zrobiona jest ta dzielnica: rezerwat przyrody i wielki przemysł w jednym kadrze.",
          "Kombinat zbudowano w latach pięćdziesiątych i przez dekady zatrudniał kilkadziesiąt tysięcy ludzi. Nowa Huta powstała dla niego i wraz z nim się zmieniała.",
          "Najlepsze światło jest wieczorem, gdy słońce zachodzi za halami. To widok, którego nie ma nigdzie indziej w Polsce.",
        ],
        findHint: "Wschodnia część łąk, w stronę Bulwarowej i huty.",
        reveal: "Zanieczyszczenia z kombinatu były przez dekady tak duże, że niszczyły elewacje w centrum Krakowa, kilkanaście kilometrów dalej. Ograniczono je dopiero po 1990 roku, gdy wygaszono najbardziej trujące instalacje.",
        dilemma: {
          question: "Kombinat dał życie całej dzielnicy i zatruwał ją przez pół wieku. Jak zapisać taki bilans?",
          options: ["Na plus, dał pracę i domy", "Na minus, koszt był zdrowotny", "Bez podsumowania, oba fakty naraz"],
          counterpoint: "Dla dziesiątek tysięcy rodzin huta oznaczała mieszkanie, szkołę i awans społeczny, którego nie mieli w rodzinnych wsiach. Ale te same rodziny wdychały pyły, których skutki widać w statystykach zdrowia dzielnicy do dziś.",
        },
        photo: '/photos/poi-laki-nowohuckie-widok-kombinat.jpg',
        photoCredit: 'Fot. Piotr Tomaszewski fly4pix.pl · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [20.03883, 50.06617],
        radius: 70,
      },
    ],
  },
  {
    parkId: 'duchacki',
    pois: [
      {
        id: 'dwor-duchacki',
        category: 'history',
        name: "Dwór Duchacki",
        teaser: "Zabytkowy dwór przy stawie, po remoncie.",
        description: [
          "Dwór stoi tu od stuleci i pamięta czasy, gdy Wola Duchacka była wsią należącą do zakonu duchaków, czyli Bożogrobców Ducha Świętego. Od nich wzięła się nazwa dzielnicy.",
          "Zakon prowadził w Krakowie szpitale i przytułki, a majątki wiejskie miały je utrzymywać. Dwór był więc częścią systemu, który dziś nazwalibyśmy opieką społeczną.",
          "Po latach niszczenia dwór odremontowano i dziś służy jako miejsce kultury dla dzielnicy.",
        ],
        findHint: "Przy stawie w środkowej części parku.",
        reveal: "Duchacy prowadzili w Krakowie szpital Świętego Ducha, który stał tam, gdzie dziś Teatr Słowackiego. To ten sam zakon, którego zabudowania wyburzono pod budowę teatru.",
        dilemma: {
          question: "Zakon, który przez wieki prowadził szpitale, zniknął z miasta, a jego ślady zostały w nazwach dzielnic. Czy pamięć o instytucjach jest ważna?",
          options: ["Ważna, to fundament miasta", "Ważniejsze, co działa dziś", "Ważna, jeśli czegoś uczy"],
          counterpoint: "Bez pamięci o tym, kto prowadził szpitale przed państwem, nie rozumiemy, skąd wzięły się dzisiejsze instytucje. Ale miasto nie jest muzeum i najbardziej potrzebuje tego, żeby opieka działała teraz, a nie żeby dobrze pamiętać dawną.",
        },
        coords: [19.96632, 50.02039],
        radius: 40,
      },
      {
        id: 'staw-duchacki',
        category: 'water',
        name: "Staw Duchacki",
        teaser: "Woda z pomostami, po rewitalizacji parku.",
        description: [
          "Staw był kiedyś zaniedbany i zarośnięty, a park uchodził za miejsce, do którego się nie chodzi. Rewitalizacja zmieniła to całkowicie: doszły pomosty, ścieżki i oświetlenie.",
          "Tego typu odnowa jest w Krakowie widoczna w kilkunastu parkach ostatnich lat. Zmienia się schemat: zamiast trawnika i płotu buduje się dostęp do wody i miejsca do siedzenia.",
          "Wieczorami to jedno z najprzyjemniejszych miejsc w tej części miasta, także dlatego, że mało kto o nim wie poza dzielnicą.",
        ],
        findHint: "Pomosty nad wodą w środku parku.",
        reveal: "Wolę Duchacką przez lata wskazywano jako przykład dzielnicy bez centrum: dużo bloków, mało miejsc spotkań. Park ze stawem stał się właśnie takim centrum, którego brakowało.",
        dilemma: {
          question: "Dzielnica bez centrum dostała je dopiero, gdy odnowiono park. Czy park może być centrum dzielnicy?",
          options: ["Może i często jest", "Nie, potrzebny rynek i usługi", "Park plus usługi wokół"],
          counterpoint: "Park jest dostępny dla wszystkich, bez biletu i konsumpcji, więc spotyka się w nim więcej ludzi niż w jakimkolwiek lokalu. Ale centrum żyje z ruchu, sklepów i pracy, a sam park zamyka się po zmroku i zimą świeci pustkami.",
        },
        coords: [19.96684, 50.02109],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'przylasek-rusiecki',
    pois: [
      {
        id: 'zbiornik-1',
        category: 'water',
        name: "Zbiornik numer 1",
        teaser: "Kąpielisko z plażą na wschodnim skraju miasta.",
        description: [
          "Przylasek Rusiecki to zespół kilkunastu stawów, które powstały po wybieraniu żwiru na budowę Nowej Huty. Zbiornik numer 1 jest tym, który latem działa jako kąpielisko.",
          "Woda jest tu czysta i chłodna, bo zbiorniki zasilają wody gruntowe. Wokół rosną łąki i zarośla, a ptaków jest tyle, że przyjeżdżają tu obserwatorzy z lornetkami.",
          "To najdalszy punkt kolekcji: pół godziny jazdy z centrum, a klimat jak nad jeziorem daleko od miasta.",
        ],
        findHint: "Plaża i pomost przy zbiorniku numer 1, wejście od ul. Rzepakowej.",
        reveal: "Żwir z tych wyrobisk poszedł na budowę Nowej Huty: dzielnica dosłownie stoi na materiale wyjętym z tego miejsca. Dziura, która została, wypełniła się wodą i jest dziś terenem rekreacyjnym.",
        dilemma: {
          question: "Wyrobisko po eksploatacji zamieniło się w kąpielisko, więc szkoda przyrodnicza dała nową wartość. Czy tak można usprawiedliwiać wydobycie?",
          options: ["Można, efekt jest dobry", "Nie, to przypadek", "Można, jeśli rekultywacja jest planowana"],
          counterpoint: "Dobrze zrekultywowane wyrobiska bywają cenniejsze przyrodniczo niż pola, które tam były wcześniej, i to fakt. Ale nikt tego wtedy nie planował: te stawy powstały same, a w wielu innych miejscach po wydobyciu zostały tylko hałdy.",
        },
        coords: [20.1588, 50.04991],
        radius: 70,
      },
      {
        id: 'ptaki-przylasek',
        category: 'nature',
        name: "Ostoja ptaków",
        teaser: "Jedno z najlepszych miejsc na ptaki w Krakowie.",
        description: [
          "Zespół stawów, trzcinowisk i łąk to dla ptaków idealny układ: woda, osłona i pokarm. Obserwatorzy notują tu kilkadziesiąt gatunków, w tym perkozy, czaple i rybitwy.",
          "Najlepsza pora to wczesny ranek i okresy przelotów, czyli wiosna i koniec lata, gdy zatrzymują się tu ptaki wędrujące.",
          "Wystarczy stanąć cicho na kilka minut przy trzcinach, żeby usłyszeć więcej, niż widać.",
        ],
        findHint: "Ścieżki między zbiornikami, przy trzcinowiskach.",
        reveal: "Ptaki wędrujące potrzebują łańcucha miejsc do odpoczynku, oddalonych o kilkadziesiąt kilometrów. Zniknięcie jednego takiego stawu wyłącza cały odcinek trasy, choć wydaje się drobną zmianą.",
        dilemma: {
          question: "Miejsca odpoczynku ptaków to zwykłe stawy, które łatwo zabudować, bo nie wyglądają na cenne. Jak chronić coś, czego nie widać?",
          options: ["Prawem i mapami", "Edukacją", "Nie da się bez konfliktu"],
          counterpoint: "Mapy siedlisk i ochrona prawna działają, gdy ktoś je respektuje i kontroluje: to jedyne twarde narzędzie. Ale prawo przegrywa z presją inwestycyjną, jeśli lokalna społeczność nie widzi w stawie niczego wartego obrony.",
        },
        coords: [20.15764, 50.05028],
        radius: 70,
      },
    ],
  },
  {
    parkId: 'aleksandry',
    pois: [
      {
        id: 'smok-aleksandry',
        category: 'monument',
        name: "Smok",
        teaser: "Rzeźba smoka w środku osiedlowego parku.",
        description: [
          "Krakowski smok jest wszędzie: na Wawelu, w herbach, na pamiątkach i w kilkunastu parkach. Ten stoi w Bieżanowie i jest w rozmiarze do wspinania, więc dzieci traktują go jak sprzęt do zabawy.",
          "Legenda o smoku wawelskim jest jedną z najstarszych polskich opowieści: pojawia się już u Kadłubka w XIII wieku, w wersji, w której smoka zabija Krak podstępem, a nie w walce.",
          "To dobry punkt na wyprawę z dzieckiem: krótki, konkretny i z bohaterem, którego zna każde dziecko w Krakowie.",
        ],
        findHint: "Przy placu zabaw w środkowej części parku.",
        reveal: "W najstarszej wersji legendy smoka nie zabija rycerz, a szewczyk albo sam Krak, podając mu owcę wypełnioną siarką. Zwycięstwo należy więc do sprytu, nie do siły.",
        dilemma: {
          question: "Polska legenda założycielska premiuje spryt, nie odwagę w walce. Czy to dobra opowieść dla dzieci?",
          options: ["Dobra, uczy myślenia", "Zła, uczy podstępu", "Dobra, jeśli ktoś to omówi"],
          counterpoint: "Opowieść, w której słabszy wygrywa głową, daje dziecku poczucie, że nie trzeba być najsilniejszym: to zdrowa lekcja. Ale w tej wersji bohater zabija zwierzę podstępem i nikt w bajce nie pyta, czy dało się inaczej.",
        },
        coords: [20.01095, 50.00982],
        radius: 60,
      },
      {
        id: 'zbiornik-aleksandry',
        category: 'water',
        name: "Zbiornik w parku",
        teaser: "Woda, która chroni osiedle przed podtopieniem.",
        description: [
          "Ten zbiornik nie jest ozdobą: zbiera wodę z okolicznych osiedli i spowalnia jej odpływ przy nawalnych deszczach. Bez niego woda szłaby wprost do kanalizacji i piwnic.",
          "Kraków w ostatnich latach buduje takie miejsca celowo, bo ulewy są gwałtowniejsze niż kiedyś, a betonowe dzielnice nie wchłaniają wody.",
          "Przy wodzie zawsze coś się dzieje: kaczki, ważki, czasem czapla. To najbardziej żywa część tego parku.",
        ],
        findHint: "Środkowa część parku, alejka wokół wody.",
        reveal: "Jedna ulewa w mieście potrafi zrzucić w godzinę tyle wody, ile normalnie spada w miesiąc. Zbiorniki i tak zwane ogrody deszczowe są dziś tańsze i skuteczniejsze niż powiększanie rur.",
        dilemma: {
          question: "Miasto może wydać pieniądze na grubsze rury albo na zieleń, która wchłania wodę. Co wybrać?",
          options: ["Rury, są pewne", "Zieleń, działa szerzej", "Jedno i drugie, po kolei"],
          counterpoint: "Rura działa niezależnie od pogody i nikt jej nie zadepcze: to inżynierska pewność. Ale rura tylko przenosi problem dalej w dół rzeki, a zieleń zatrzymuje wodę na miejscu i przy okazji daje cień.",
        },
        coords: [20.01296, 50.01249],
        radius: 50,
      },
    ],
  },
  {
    parkId: 'zielony-jar',
    pois: [
      {
        id: 'jar',
        category: 'nature',
        name: "Dno jaru",
        teaser: "Naturalne obniżenie terenu w środku dzielnicy.",
        description: [
          "Jar Wandy to naturalne wcięcie w lessowym podłożu Wzgórz Krzesławickich. Takie formy powstają przez erozję: woda wypłukuje miękki less i po latach zostaje wąwóz o stromych zboczach.",
          "Idąc dnem, czujesz różnicę wysokości, rzadką w tej części Krakowa. Zbocza są strome, więc park ma charakter zupełnie inny niż płaskie osiedlowe zielenie.",
          "Ta okolica to dawne wsie: Krzesławice, Wadów, Łuczanowice, wchłonięte przez miasto w połowie XX wieku.",
        ],
        findHint: "Ścieżka dnem jaru, wejście od strony osiedla.",
        reveal: "Wzgórza Krzesławickie zbudowane są z lessu, tego samego materiału, który tworzy żyzne ziemie na Wyżynie Małopolskiej. Dlatego były tu wsie rolnicze, a nie las: gleba była zbyt dobra, by jej nie uprawiać.",
        dilemma: {
          question: "Miasto wchłonęło wsie z najlepszymi glebami w okolicy i postawiło na nich bloki. Czy grunty rolne w mieście warto chronić?",
          options: ["Warto, to zasób", "Nie, miasto musi rosnąć", "Warto te najlepsze"],
          counterpoint: "Dobrej gleby nie da się odtworzyć, a lokalna żywność będzie coraz ważniejsza: to argument twardy. Ale ludzie muszą gdzieś mieszkać, a rozlewanie miasta na dalsze pola oznacza dojazdy, spaliny i jeszcze więcej betonu.",
        },
        coords: [20.05747, 50.09215],
        radius: 60,
      },
      {
        id: 'kosciol-milosierdzia',
        category: 'history',
        name: "Kościół Miłosierdzia Bożego",
        teaser: "Współczesny kościół nad jarem.",
        description: [
          "Kościół stoi nad jarem i jest jednym z tych obiektów, które w Nowej Hucie powstawały po latach osiemdziesiątych, gdy walka o świątynie w dzielnicy była już wygrana.",
          "Architektura kościołów z tego okresu w Polsce to osobny temat: budowano je często siłami parafian, z materiałów, jakie udało się zdobyć, więc każdy jest inny.",
          "Punkt jest dobry na koniec spaceru jarem: stąd blisko do przystanków i sklepów.",
        ],
        findHint: "Na skraju parku, nad jarem.",
        reveal: "W latach osiemdziesiątych w Polsce powstawało kilkaset kościołów rocznie, głównie pracą parafian po godzinach. To jedno z największych oddolnych przedsięwzięć budowlanych w historii kraju.",
        dilemma: {
          question: "Setki kościołów zbudowano oddolnie, w czasach kryzysu i braku materiałów. Czy energię społeczną można kierować?",
          options: ["Można, przez wspólny cel", "Nie, bierze się sama", "Można, ale nie na rozkaz"],
          counterpoint: "Ludzie potrafią zbudować rzecz wielką, jeśli uznają ją za własną, i tego nie zastąpi żaden budżet. Ale energia idzie tam, gdzie jest wspólnota i sprzeciw, a nie tam, gdzie planista uzna, że jest potrzebna.",
        },
        coords: [20.05822, 50.09246],
        radius: 75,
      },
    ],
  },
  {
    parkId: 'test-piltza',
    pois: [
      {
        id: "dom-43",
        category: "history",
        name: "Bruksela, czyli Piltza 43",
        teaser: "Start trasy. Twój blok ma imię stolicy.",
        description: [
        "Osiedle Europejskie nie numeruje budynków byle jak: każdy nosi imię europejskiej stolicy, a ten, w którym stoisz, to Bruksela. Deweloper sprzedawał w ten sposób obietnicę bycia częścią Europy, w mieście, które właśnie do niej wchodziło.",
        "To pierwszy punkt kontrolny: sprawdza, czy aplikacja łapie pozycję jeszcze przed wyjściem. Jeśli zalicza się sam, GPS i promienie działają. Jeśli nie, wyjdź przed budynek: między blokami sygnał odbija się od ścian.",
        "Cała trasa to około pół kilometra w jedną stronę, sześć punktów, około kwadrans spokojnym krokiem.",
        ],
        findHint: "Wejście do budynku Bruksela przy ul. Piltza 43.",
        reveal: "Nazwy stolic na blokach to chwyt starszy niż się wydaje: pierwsze osiedla nazywane od miast pojawiły się w Polsce w latach sześćdziesiątych, tylko wtedy patronowały im miasta zaprzyjaźnione z blokiem wschodnim. Adres zawsze coś ogłasza.",
        dilemma: {
          question: "Nazwa bloku wpływa na to, jak się w nim mieszka?",
          options: [
          "Tak, nazwa buduje wspólnotę: łatwiej powiedzieć „mieszkam w Brukseli” niż „w bloku numer 43”",
          "Nie, to marketing dewelopera, po roku i tak wszyscy mówią „u mnie”",
          "Nazwa robi robotę tylko wtedy, gdy trafia w coś prawdziwego: rzekę, dawny folwark, człowieka",
          ],
          counterpoint: "Badania nad przywiązaniem do miejsca sugerują, że najsilniej działają nazwy odnoszące się do lokalnej historii, a nie do aspiracji. Bruksela brzmi dobrze, ale nic tu nie znaczy: dwa kilometry dalej jest Kobierzyn, wieś z dokumentów z XIV wieku.",
        },
        coords: [19.89016, 50.01436],
        radius: 28,
      },
      {
        id: "parter-uslugowy",
        category: "monument",
        name: "Przedszkole i siłownia na parterze",
        teaser: "Kilkadziesiąt metrów niżej blok przestaje być tylko blokiem.",
        description: [
        "Na parterze stoją obok siebie przedszkole Happy Kids i klub Power Zone. To niepozorny szczegół, a decyduje o tym, czy osiedle jest sypialnią, czy miejscem, w którym da się żyć bez samochodu.",
        "Ruczaj ma tego dużo, bo powstawał już po zmianie prawa i mody: parter oddany usługom, mieszkania od pierwszego piętra. Starsze osiedla Krakowa dostawały zamiast tego wolnostojące pawilony, które dziś stoją puste.",
        "Punkt testowy: idąc od poprzedniego zobaczysz najpierw delikatną wibrację i podpowiedź „blisko”, a dopiero potem zaliczenie. Sprawdź, czy tak jest.",
        ],
        findHint: "Parter bloku po zachodniej stronie Piltza, szyldy przedszkola i siłowni.",
        reveal: "Jan Gehl mierzył to prosto: policz drzwi na sto metrów pierzei. Poniżej pięciu ulica jest martwa, powyżej dziesięciu żyje. Ten fragment Piltza ma ich tyle, że spacer nie nudzi się nawet w listopadzie.",
        dilemma: {
          question: "Wolisz mieszkać nad usługami, czy w cichym bloku bez nich?",
          options: [
          "Nad usługami: sklep i kawiarnia pod nosem są warte trochę hałasu",
          "W cichym: po usługi mogę przejść dwie minuty, ciszy nie da się dokupić",
          "Zależy od usługi: przedszkole tak, klub nocny nie",
          ],
          counterpoint: "To prawdziwy konflikt, nie kwestia gustu. Mieszkańcy pierwszych pięter płacą hałasem i dostawami za wygodę całego osiedla. W Wiedniu rozwiązuje się to inaczej: usługi idą do jednej pierzei kwartału, druga zostaje cicha.",
        },
        coords: [19.89016, 50.01386],
        radius: 25,
      },
      {
        id: "trzy-zlobki",
        category: "meadow",
        name: "Trzy żłobki na dwustu metrach",
        teaser: "Policz szyldy z dziećmi. Nie przypadek.",
        description: [
        "HooplaKid, LogoSens, Happy Kids: na krótkim odcinku Piltza działa kilka żłobków i przedszkoli, a między blokami rozsiane są place zabaw. Tak wygląda dzielnica, do której wprowadzili się głównie ludzie po trzydziestce.",
        "Ruczaj rósł wokół kampusu i firm z Zabłocia oraz Bonarki. Mieszkania kupowali tu ludzie na początku dorosłego życia, więc dziesięć lat później osiedle dostało falę dzieci, a razem z nią kolejki do przedszkoli.",
        "Za kilkanaście lat te lokale zamienią się w coś innego. Osiedla starzeją się razem z pierwszymi mieszkańcami, tylko rzadko ktoś planuje to z wyprzedzeniem.",
        ],
        findHint: "Szyldy żłobków po wschodniej stronie ulicy, przy skrzyżowaniu.",
        reveal: "Demografowie nazywają to falą kohortową: jednorodne wiekowo osiedle przeżywa boom przedszkolny, potem szkolny, a po trzech dekadach nagle potrzebuje opieki dla seniorów. Kraków zna to z Nowej Huty, która przeszła cały cykl w pięćdziesiąt lat.",
        dilemma: {
          question: "Osiedle powinno być projektowane pod obecnych mieszkańców, czy pod ich przyszłość?",
          options: [
          "Pod obecnych: potrzeby są dziś, a przyszłość i tak zaskoczy",
          "Pod przyszłość: lokale i parter da się zaprojektować tak, by zmieniały funkcję",
          "Pod różnorodność: wymieszać wiek mieszkańców od początku, wtedy nie ma fal",
          ],
          counterpoint: "Mieszanie wieku brzmi rozsądnie, ale rynek robi odwrotnie: identyczne mieszkania w identycznej cenie przyciągają identycznych ludzi. Żeby osiedle było różnorodne, ktoś musi celowo zbudować różne mieszkania, a to jest droższe.",
        },
        coords: [19.89069, 50.0135],
        radius: 30,
      },
      {
        id: "pomnik-1942",
        category: "history",
        name: "Pomnik pacjentów Kobierzyna",
        teaser: "Najcichszy punkt tej trasy. Warto tu stanąć dłużej.",
        description: [
        "Kilkaset metrów od bloków, w parku dawnego szpitala w Kobierzynie, stoi pomnik pacjentów zamordowanych w 1942 roku. Szpital działa do dziś, nosi imię doktora Jana Babińskiego, a jego pawilony rozsiane w zieleni wyglądają jak małe miasto.",
        "I takie miały być. Zakład otwarty na początku XX wieku projektowano jako miasto-ogród dla chorych: osobne pawilony, własne gospodarstwo, kościół, kotłownia, park. Leczenie miało polegać na spokoju, pracy i przestrzeni, a nie na zamknięciu w jednym gmachu.",
        "W czerwcu 1942 Niemcy zlikwidowali szpital. Część pacjentów zamordowano na miejscu, pozostałych wywieziono do Auschwitz. Zginęło kilkuset ludzi, których jedyną winą była choroba.",
        ],
        findHint: "Idź alejką w głąb parku szpitalnego, pomnik stoi przy głównej ścieżce.",
        reveal: "Zbrodnia w Kobierzynie nie była wybuchem szału, a procedurą. Wpisywała się w niemiecki program mordowania chorych psychicznie, prowadzony wcześniej pod nazwą Akcji T4, w którym lekarze podpisywali listy pacjentów jak dokumenty magazynowe. Najtrudniejsze w tej historii jest to, że wykonali ją ludzie z dyplomami zawodu, który miał leczyć.",
        dilemma: {
          question: "Szpital w miejscu takiej zbrodni: leczyć dalej, czy zamienić w miejsce pamięci?",
          options: [
          "Leczyć dalej: najlepszą odpowiedzią na mord chorych jest opieka nad chorymi",
          "Zrobić muzeum: takie miejsce powinno uczyć, a pacjenci zasługują na nowy budynek",
          "Jedno i drugie: szpital działa, ale pamięć nie może być tylko tablicą przy alejce",
          ],
          counterpoint: "Pacjenci nie mieli tu wyboru i nadal go nie mają: przychodzą się leczyć, a mieszkają w krajobrazie cudzej tragedii. Z drugiej strony przeniesienie szpitala oznaczałoby, że po ofiarach zostaje tylko pomnik, a po sprawcach pusty park.",
        },
        coords: [19.88854, 50.01244],
        radius: 60,
      },
      {
        id: "kwiaty-i-kawa",
        category: "monument",
        name: "Kwiaty i Kawa",
        teaser: "Kwiaciarnia z ekspresem. Dokładnie to, czego brakuje osiedlom.",
        description: [
        "Lokal łączy dwie rzeczy, które osobno na osiedlu nie mają szans: kwiaciarnię, do której wpada się cztery razy w roku, i kawę, po którą przychodzi się codziennie. Razem wychodzi miejsce, które utrzymuje się z sąsiadów, a nie z turystów.",
        "Obok stoi Dary Posejdona, sklep z rybami. To już nie jest sypialnia: to zestaw sklepów, który daje się obsłużyć pieszo, bez wyprawy do galerii.",
        "Sprawdź tu, czy działa zapis notatki i zdjęcia w konkretnym miejscu. Zostaw pina z podpisem albo notatkę głosową i zobacz, czy stanął tam, gdzie stoisz.",
        ],
        findHint: "Witryna z kwiatami po wschodniej stronie Piltza, kilkadziesiąt metrów przed numerem 34.",
        reveal: "Socjolog Ray Oldenburg nazwał takie lokale trzecim miejscem: nie dom, nie praca, tylko przestrzeń, w której bywa się bez powodu. Jego teza jest niewygodna dla deweloperów: osiedle bez trzeciego miejsca może mieć wszystko inne i nadal pozostać noclegownią.",
        dilemma: {
          question: "Wolisz jedną dobrą kawiarnię blisko, czy pięć sieciówek w centrum?",
          options: [
          "Jedną blisko: znają zamówienie i wiedzą, kiedy nie zagadywać",
          "Sieciówki: przewidywalna jakość i otwarte, gdy naprawdę potrzebuję",
          "Wolę jedno i drugie i płacić różnicę w odpowiednim miejscu",
          ],
          counterpoint: "Lokalna kawiarnia bywa romantyzowana, ale bez ruchu z dwóch, trzech tysięcy mieszkańców po prostu nie utrzyma się w czynszu. Kiedy narzekamy, że zamknęła, zwykle sami byliśmy tam raz na miesiąc.",
        },
        coords: [19.89068, 50.01224],
        radius: 25,
      },
      {
        id: "piltza-34",
        category: "monument",
        name: "Piltza 34, koniec trasy",
        teaser: "Kto to był Piltz, wyjaśnia się dopiero tutaj.",
        description: [
        "Doszedłeś. Wokół są drzewa, ławki i plac zabaw, czyli dokładnie to, po co wychodzi się z domu na kwadrans. To dobre miejsce, żeby usiąść i zamknąć wyprawę.",
        "Ulica nosi imię Jana Piltza, psychiatry i neurologa, profesora Uniwersytetu Jagiellońskiego z przełomu XIX i XX wieku. To on należał do tych, którzy wywalczyli budowę nowoczesnego zakładu w Kobierzynie, tego samego, którego pomnik minąłeś po drodze.",
        "Sprawdź tu ostatnie rzeczy: czy licznik pokazuje sensowny dystans, czy ślad na mapie trzyma się ulicy, i co się dzieje, gdy zaliczysz komplet punktów. Wyprawa ma się skończyć wtedy, kiedy Ty klikniesz koniec, nie wcześniej.",
        ],
        findHint: "Wejście do budynku numer 34, obok ławki i drzewa.",
        reveal: "Piltz zmarł w 1930 roku, dwanaście lat przed zbrodnią w szpitalu, o który walczył. Nazwa ulicy powstała później i nikt jej nie planował jako komentarza, a jednak trasa, którą właśnie przeszedłeś, zaczyna się przy jego nazwisku i kończy przy jego nazwisku, z pomnikiem ofiar w środku.",
        dilemma: {
          question: "Nazwa ulicy to forma pamięci, czy tylko adres?",
          options: [
          "Pamięć: dopóki nazwa istnieje, ktoś kiedyś sprawdzi, kim był ten człowiek",
          "Adres: mieszkańcy nie znają patronów swoich ulic i to nic złego",
          "Pamięć wtedy, gdy stoi przy niej wyjaśnienie: sama tabliczka z nazwiskiem to za mało",
          ],
          counterpoint: "Kraków ma kilkaset ulic z patronami i garść tabliczek z wyjaśnieniem. Można to uznać za zaniedbanie, ale też za rozsądek: kto chciałby mieszkać w mieście, które na każdym rogu tłumaczy, dlaczego coś jest ważne?",
        },
        coords: [19.89069, 50.01174],
        radius: 28,
      },
    ],
  },
  {
    /*
     * Błonia Skawińskie: pierwsza wyprawa z punktem CIEKAWOSTKĄ. Pieczątka
     * wymaga dwóch punktów z trzech (`stampAt`), więc stacja Miast Partnerskich
     * jest w pełni opcjonalna: kto chce, ten ją znajdzie, kto nie chce, kończy
     * wyprawę bez poczucia braku.
     */
    parkId: 'skawina-blonia',
    stampAt: 2,
    pois: [
      {
        id: 'park-energii',
        category: 'play',
        name: 'Park Energii',
        teaser: 'Plac zabaw, za który zapłaciła elektrownia.',
        description: [
          'Osiem urządzeń, ścianka wspinaczkowa z kolorowymi chwytami, tyrolka, bujaki i huśtawki, wszystko ogrodzone i na bezpiecznej nawierzchni. Otwarty 31 sierpnia 2015 roku jako najnowsza wtedy atrakcja miasta.',
          'Nazwa nie jest przypadkowa: plac zabaw sfinansowała elektrownia CEZ Skawina, największy w regionie producent energii elektrycznej i ciepła. Miasto dało teren, elektrownia sprzęt, dzieci dostały tyrolkę.',
        ],
        findHint: 'Zachodnia część Błoń, ogrodzony plac przy alejce.',
        reveal:
          'Ta sama instalacja, która grzeje pół Skawiny, kupiła miastu plac zabaw. Rok później Światowa Organizacja Zdrowia umieściła Skawinę na dwunastym miejscu listy najbardziej zanieczyszczonych miast Unii Europejskiej.',
        dilemma: {
          question:
            'Czy miasto powinno brać pieniądze na plac zabaw od swojego największego emitenta?',
          options: [
            'Tak, lepiej niech płaci niż tylko dymi',
            'Nie, to kupowanie spokoju za drobne',
            'Tak, ale z jawną umową i twardymi normami',
          ],
          counterpoint:
            'Pieniądze są realne i plac zabaw stoi, a bez nich nie stałby. Ale sponsoring buduje wdzięczność, a wdzięczne miasto trudniej naciska na filtry i normy. Prawnicy nazywają to miękkim wpływem: nikt nikogo nie przekupił, a rozmowa i tak toczy się inaczej.',
        },
        /* Commons nie ma ani jednego zdjęcia tego placu; kadr z galerii, ktą
           wskazał Jarek, użyty z podpisem, ale bez wolnej licencji */
        photo: '/photos/poi-skawina-blonia-park-energii.jpg',
        photoCredit: 'Fot. Jarosław Karasiński · dobrefotografie.pl',
        sources: [
          'https://www.cezpolska.pl/pl/dla-mediow/centrum-prasowe/cez-skawina-zaprasza-do-parku-energii-juz-wkrotce-wielkie-otwarcie-placu-zabaw-z-pozytywna-energia-58614',
          'https://pl.wikipedia.org/wiki/Skawina',
          'https://dobrefotografie.pl/2020/09/16/park-energii-skawina/',
        ],
        coords: [19.81728, 49.97104],
        radius: 45,
      },
      {
        id: 'starorzecze-blon',
        category: 'water',
        name: 'Stare koryto i nowe',
        teaser: 'Sierp stojącej wody, a obok czynne koryto Skawinki.',
        description: [
          'Dwie wody kilkadziesiąt metrów od siebie i to jest cała atrakcja. Sierp stojącej wody to dawny bieg Skawinki, a rzeka płynie dziś prosto przez środek tej pętli, którą sama porzuciła.',
          'Nazwa rzeki mówi dokładnie o tym, co tu widzisz. W staropolszczyźnie „skać” znaczyło kręcić się, toczyć się, a Skawinka wije się meandrami przez cały swój bieg. Rzeka nazwana od kręcenia zostawiła po sobie zakręt.',
          'Starorzecze żyje inaczej niż rzeka: woda stoi, roślin jest więcej, ptaki inne. Za kilkadziesiąt lat zarośnie całkiem i zostanie z niego wilgotna łąka.',
        ],
        findHint:
          'Północny koniec sierpa, między zagajnikiem a rzeką: po jednej stronie woda stoi, po drugiej płynie.',
        reveal:
          'Meander odcina się sam: rzeka podmywa zewnętrzny brzeg zakrętu, aż przerwie szyję pętli i pójdzie na skróty. Tutaj skrót jest świeży na tyle, że stoisz między starym i nowym korytem naraz.',
        dilemma: {
          question:
            'Starorzecze to woda stojąca: komary, szuwary, bałagan. Zostawić dzikie, czy przerobić na zadbany staw z pomostem?',
          options: [
            'Zostawić dzikie, to ostatni taki fragment',
            'Przerobić, ludzie chcą tam siedzieć',
            'Podzielić: pomost z jednej strony, dzicz z drugiej',
          ],
          counterpoint:
            'Dzikie starorzecze trzyma gatunki, które z zadbanego stawu znikają w jednym sezonie, i przyjmuje wodę przy wysokim stanie rzeki. Ale miejsce, z którego nikt nie korzysta, traci obrońców przy cięciu budżetu: zadbany staw ma swoich ludzi, dzicz ma tylko przyrodników.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Skawina'],
        /*
         * Punkt stał wcześniej na środku obiektu `water=oxbow` z OSM i to był błąd,
         * który Jarek wyłapał: starorzecze jest wygiętym sierpem, więc środek jego
         * obwódki wypadał na CZYNNYM korycie, 17 m od rzeki i 51 m od właściwej
         * wody. Teraz punkt stoi na północnym brzegu sierpa: 6 m od starorzecza,
         * 27 m od rzeki, czyli tam, gdzie widzisz oba koryta.
         */
        coords: [19.8172, 49.97202],
        radius: 45,
      },
      {
        id: 'miasta-partnerskie',
        category: 'history',
        name: 'Stacja Miast Partnerskich',
        teaser: 'Siedem tablic, siedem miast, przy każdej drzewo. [ciekawostka]',
        description: [
          'Stację Miast Partnerskich odsłonięto na Błoniach 15 maja 2014 roku, w czasie Dni Partnerstwa Miast i jubileuszu 650-lecia Skawiny. Przy tablicach z nazwami partnerów posadzono drzewa, po jednym na miasto.',
          'Skawina ma siedmiu partnerów i każdy ma datę: Hürth w Niemczech od 1996, Turčianske Teplice na Słowacji od 1999, Thetford w Anglii od 2004, Roztoky w Czechach i Civitanova Marche we Włoszech od 2005, Przemyślany na Ukrainie od 2008, Holešov w Czechach od 2017.',
          'To punkt dodatkowy: pieczątkę Błoń dostaniesz i bez niego.',
        ],
        findHint:
          'Wschodnia część Błoń, wzdłuż alejki przy strefie sportowej: tablice stoją przy pojedynczych drzewach. [w terenie]',
        reveal:
          'Przemyślany zostały partnerem Skawiny w 2008 roku, czternaście lat przed wojną, która z tego kanału zrobiła drogę transportu pomocy. Umowy podpisane bez powodu okazują się gotowe, kiedy powód się znajdzie.',
        dilemma: {
          question: 'Partnerstwa miast to folklor z wymianą delegacji, czy realna polityka?',
          options: [
            'Realna: kontakty ratują skórę, gdy przychodzi kryzys',
            'Folklor: wycieczki dla urzędników za publiczne pieniądze',
            'Zależy, czy poza delegacjami jeżdżą też ludzie',
          ],
          counterpoint:
            'Po 2022 roku partnerstwa gminne przewiozły na Ukrainę konkretne transporty, bo istniały numery telefonów i zaufanie. Ale te same umowy w wielu miastach przez dwie dekady nie zrobiły nic poza obiadem raz w roku. Narzędzie jest dobre tyle, ile ludzie, którzy je trzymają.',
        },
        sources: [
          'https://partnerstwo-skawina.pl/o-nas/',
          'https://partnerstwo-skawina.pl/miasta-partnerskie/',
        ],
        coords: [19.8195, 49.97105],
        radius: 80,
      },
    ],
  },
]

/** miasto plus wypady za miasto, w jednej liście, bo mechanika jest ta sama */
export const QUESTS: Quest[] = [...KRAKOW_QUESTS, ...DOLINKI_QUESTS]


export const questForPark = (parkId: string) => QUESTS.find((q) => q.parkId === parkId)

/** total collectible points for a park: quest POIs, or 1 (the entry) without a quest */
/**
 * Zdjęcia punktów tego miejsca, jako zapas dla nagłówka karty. Park bez własnego
 * zdjęcia, ale z opisanymi punktami, nie musi pokazywać pustej ikony: to, co
 * zobaczysz na miejscu, jest już sfotografowane w jego punktach.
 */
export const photosForPark = (parkId: string) =>
  (questForPark(parkId)?.pois ?? [])
    .filter((poi) => poi.photo)
    .map((poi) => ({ src: poi.photo as string, credit: poi.photoCredit }))

export const pointsTotal = (parkId: string) => questForPark(parkId)?.pois.length ?? 1
