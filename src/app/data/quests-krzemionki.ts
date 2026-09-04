// Krzemionki Podgórskie: dwa dawne kamieniołomy w środku Krakowa.
//
// Temat wspólny: MIEJSCA, KTÓRE PRZEMYSŁ ROZKOPAŁ, A POTEM ZOSTAWIŁ.
// W Kamieniołomie Libana wapno ustąpiło obozowi, obóz filmowi, a film
// przyrodzie. W Bonarce wybieranie margla na cement przypadkiem odsłoniło
// dno morza sprzed osiemdziesięciu kilku milionów lat.
//
// Oba miejsca leżą kilometr od siebie i chodzi się je w jedno popołudnie,
// więc Bonarka celowo ma tylko trzy punkty: cały rezerwat to niecałe
// dwa i pół hektara i jedna ścieżka.
//
// Współrzędne to węzły OSM (skan Overpass 2026-09-05), obrysy z OSM przez
// scripts/add-places.mjs. Źródła faktów siedzą przy treści.

import type { Quest } from './quests'

export const KRZEMIONKI_QUESTS: Quest[] = [
  {
    parkId: 'liban',
    pois: [
      {
        id: 'macewy',
        category: 'history',
        name: 'Droga z macew',
        teaser: 'Nagrobki, po których tu chodzisz, są rekwizytem. Nazwiska na nich też.',
        description: [
          'Przez dno wyrobiska biegnie droga wyłożona płytami, które wyglądają jak żydowskie macewy. Leżą krzywo, wrastają w trawę, są na nich hebrajskie litery i nazwiska. Ludzie zostawiają na nich kamyki i znicze.',
          'Żadna z nich nie jest prawdziwa. To scenografia do „Listy Schindlera", którą zbudowano tu wiosną 1993 roku. Steven Spielberg kręcił w kamieniołomie od pierwszego marca do dwudziestego trzeciego maja, a jego ekipa postawiła na dnie trzydzieści cztery baraki, siedem wież strażniczych, replikę willi Amona Götha i właśnie tę drogę.',
          'Wybrali to miejsce, bo prawdziwy obóz Płaszów leży siedemset metrów stąd i jest dziś pustym, chronionym terenem, na którym nie stawia się dekoracji. Kamieniołom był podobny, pusty i wolny.',
        ],
        findHint:
          'Środkowa część dna kamieniołomu, na głównej drodze. Płyty leżą w ziemi, część już zarosła. Przy nich stoją dwujęzyczne tabliczki.',
        reveal:
          'Nazwiska na tych płytach wymyślili scenografowie. Prawdziwa droga z macew istniała, ale w obozie Płaszów obok, gdzie Niemcy rozebrali cmentarz żydowski i wybrukowali nagrobkami drogę obozową. Przez lata ludzie przychodzili tu zapalać znicze pod rekwizytami. Dopiero tabliczki zaczęły to prostować, a i tak kamyki leżą na płytach dalej.',
        dilemma: {
          question:
            'Filmowe macewy zostały tu ponad trzydzieści lat i część odwiedzających bierze je za prawdziwe groby. Usunąć je czy zostawić?',
          options: [
            'Zostawić, to już część historii',
            'Usunąć, bo wprowadzają w błąd',
            'Zostawić, ale wyraźnie opisać',
          ],
          counterpoint:
            'Usunięcie kończy pomyłkę raz na zawsze i przywraca miejscu jego własną historię, bo obóz był tutaj naprawdę, tylko inny. Z drugiej strony te płyty same stały się już zabytkiem, tyle że filmu, a ludzie przychodzą tu i milkną niezależnie od tego, czy pod spodem ktoś leży.',
        },
        sources: [
          'https://pl.wikipedia.org/wiki/Kamieniołom_Libana',
          'https://pl.wikipedia.org/wiki/Lista_Schindlera',
        ],
        photo: '/photos/poi-liban-macewy.jpg',
        photoCredit: 'Fot. Mateusz Giełczyński · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.95657, 50.03675],
        radius: 70,
      },
      {
        id: 'brama',
        category: 'history',
        name: 'Brama obozu karnego',
        teaser: 'Tędy wchodziło się do obozu, który nie był filmowy.',
        description: [
          'Przy północnym wejściu w wyrobisko stoją resztki bramy. Nie jest z filmu. W październiku 1942 roku Niemcy założyli w czynnym kamieniołomie obóz karny Służby Budowlanej, po niemiecku Baudienst, i to jest jego wejście.',
          'Trafiali tu Polacy, którzy uchylali się od przymusowej pracy albo z niej uciekli. Przez obóz przewinęło się około dwóch tysięcy osób. Warunki i praca w kamieniołomie zabiły wielu z nich.',
          'Kamieniołom przez cały ten czas pracował normalnie. Wapień kuto dalej, tylko rękami więźniów.',
        ],
        findHint:
          'Północne wejście na teren, od strony ulicy Za Torem. Idąc od Kopca Krakusa masz je po drodze w dół.',
        reveal:
          'Pięćdziesiąt lat później ekipa filmowa wybrała ten kamieniołom, żeby zagrał obóz z sąsiedztwa. Miejsce zagrało samo siebie, tylko pod cudzą nazwą.',
        sources: ['https://pl.wikipedia.org/wiki/Kamieniołom_Libana'],
        coords: [19.95669, 50.03849],
        radius: 70,
      },
      {
        id: 'pomnik',
        category: 'monument',
        name: 'Pomnik Martyrologii',
        teaser: 'Jedyna rzecz na tym terenie postawiona po to, żeby pamiętać.',
        description: [
          'W północnej części wyrobiska stoi pomnik poświęcony ofiarom obozu. Jest skromny i łatwo go minąć, zwłaszcza że wszystko dookoła zarosło.',
          'Warto przy nim stanąć choćby dla proporcji. Filmowa scenografia z 1993 roku zajmowała całe dno kamieniołomu i miała trzydzieści cztery baraki. Upamiętnienie prawdziwego obozu to jeden obiekt.',
        ],
        findHint: 'Północna część dna, blisko wejścia i bramy.',
        reveal:
          'Przez lata to miejsce było znane głównie jako plan filmowy i jako skrót na Krzemionki. Dopiero w sierpniu 2022 roku miasto objęło je ochroną jako użytek ekologiczny, czyli formalnie chroni tu przyrodę, a nie pamięć. Historia obozu wciąż trzyma się na jednym pomniku i kilku tabliczkach.',
        dilemma: {
          question:
            'To samo miejsce jest planem filmowym, obozem, kamieniołomem i rezerwatem przyrody. Którą z tych historii opowiadać najgłośniej?',
          options: [
            'Obóz, bo tu naprawdę ginęli ludzie',
            'Wszystkie po kolei',
            'Przyrodę, bo to ona tu została',
          ],
          counterpoint:
            'Jedna wyraźna opowieść zapada w pamięć, cztery naraz rozmywają się w tablicę, której nikt nie czyta do końca. Ale wybierając jedną, kasujesz pozostałe: dla wielu ludzi to po prostu dziki teren na spacer i to też jest prawda o tym miejscu.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Kamieniołom_Libana'],
        coords: [19.95649, 50.03906],
        radius: 60,
      },
      {
        id: 'sciana',
        category: 'climb',
        name: 'Ściana wyrobiska',
        teaser: 'Ta dziura w ziemi zaczęła się od wapna, w 1872 roku.',
        description: [
          'Ściany wokół Ciebie nie są naturalne. To, co zostało po fabryce wapna, którą Bernard Liban założył tu w 1872 roku. Pod koniec dziewiętnastego wieku był to największy zakład wapienniczy w Krakowie, a wyrobisko rosło razem z nim aż do 1941 roku.',
          'Wapień z Krzemionek szedł na zaprawę, więc spory kawałek starego Podgórza i Krakowa stoi dosłownie na tym, czego tutaj brakuje.',
          'Dziś ściany służą do czegoś innego: są tu wyznaczone drogi wspinaczkowe, jedna z nich nazywa się El Pułkownik.',
        ],
        findHint: 'Wschodnia i południowa ściana wyrobiska. Idź dnem, ściany masz cały czas nad sobą.',
        reveal:
          'Zakład zniknął w czasie wojny, a nazwisko założyciela zostało na całym terenie i trzyma się od ponad stu pięćdziesięciu lat. Mało która firma zostawia po sobie tyle: kamieniołom, dzielnicowy skrót, plan filmowy i użytek ekologiczny, wszystko pod jednym nazwiskiem.',
        sources: ['https://pl.wikipedia.org/wiki/Kamieniołom_Libana'],
        photo: '/photos/liban-c.jpg',
        photoCredit: 'Fot. Zala · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.95706, 50.03803],
        radius: 65,
      },
      {
        id: 'natura',
        category: 'nature',
        name: 'Co tu wyrosło samo',
        teaser: 'Nikt tego nie sadził. Kilkadziesiąt lat bez opieki wystarczyło.',
        description: [
          'Od zamknięcia kamieniołomu nikt się tym terenem nie zajmował i to okazało się najlepsze, co mogło mu się przydarzyć. Na wapiennym gruzie, w pełnym słońcu i bez podlewania, wyrosło siedlisko, jakiego w mieście prawie nie ma.',
          'Wapienne podłoże jest suche i zasadowe, więc trzymają się na nim gatunki ciepłolubne, które przegrywają wszędzie tam, gdzie ziemia jest żyzna. Do tego są tu strome ściany, woda i sterty kamieni, czyli komplet kryjówek.',
          'W sierpniu 2022 roku Kraków objął teren ochroną jako użytek ekologiczny „Kamieniołom Libana".',
        ],
        findHint: 'Tablica z nazwą użytku stoi przy głównej drodze na dnie wyrobiska.',
        reveal:
          'Kolejność jest tu odwrotna niż zwykle. Zwykle chronimy to, co zostało z dzikiej przyrody mimo człowieka. Tutaj chronimy przyrodę, która powstała dzięki temu, że człowiek rozkopał wzgórze, a potem sobie poszedł. Wapienne rumowisko po fabryce jest dla tych roślin lepsze niż jakikolwiek trawnik, który ktoś by tu założył.',
        dilemma: {
          question:
            'Co jakiś czas wraca pomysł, żeby uporządkować ten teren: ścieżki, oświetlenie, tablice, barierki. Robić?',
          options: [
            'Tak, inaczej mało kto tu wejdzie',
            'Nie, dzikość jest tu wartością',
            'Tylko wejścia i nic więcej',
          ],
          counterpoint:
            'Bez ścieżek i światła większość ludzi nigdy tu nie zajrzy, a miejsce, którego nikt nie zna, nikt też nie obroni przed deweloperem. Ale każde utwardzenie zabiera kawałek dokładnie tego siedliska, dla którego teren objęto ochroną, a barierka nad urwiskiem zmienia kamieniołom w park.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Kamieniołom_Libana'],
        photo: '/photos/poi-liban-natura.jpg',
        photoCredit: 'Fot. Mateusz Giełczyński · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.95619, 50.03777],
        radius: 60,
      },
    ],
  },
  {
    parkId: 'bonarka',
    pois: [
      {
        id: 'dno-morza',
        category: 'nature',
        name: 'Dno morza',
        teaser: 'Ta gładka półka skalna to plaża sprzed osiemdziesięciu kilku milionów lat.',
        description: [
          'Najważniejsza rzecz w tym rezerwacie leży poziomo pod nogami i wygląda jak zwykła kamienna półka. To powierzchnia abrazyjna: fragment dna morza wyszlifowany przez fale, które biły w skałę tak długo, aż zrobiły z niej równię.',
          'Morze przyszło tu w kredzie, mniej więcej osiemdziesiąt kilka milionów lat temu. Zalało wapienne wzgórza i zaczęło je zdzierać od góry, dokładnie tak, jak dzisiejsze fale ścinają klify.',
          'Takich miejsc w Polsce jest niewiele, bo żeby je zobaczyć, ktoś musi najpierw usunąć wszystko, co się na nich przez miliony lat nazbierało.',
        ],
        findHint:
          'Główna odkrywka rezerwatu, przy ścieżce dydaktycznej. Szukaj gładkiej, poziomej powierzchni u podstawy ściany, nie samej ściany.',
        reveal:
          'Skała pod tą półką ma około stu pięćdziesięciu milionów lat, a fale, które ją wygładziły, biły tu jakieś osiemdziesiąt kilka milionów lat temu. Między jednym a drugim nie ma nic: kilkadziesiąt milionów lat historii tej ziemi po prostu nie zapisało się w tym miejscu, bo morze zdarło wszystko, co powstało wcześniej. Stoisz na styku dwóch epok, między którymi jest dziura.',
        sources: [
          'https://pl.wikipedia.org/wiki/Rezerwat_przyrody_Bonarka',
          'https://www.krakow.pl/instcbi/243244/inst/68343/2576/Rezerwat-Bonarka.html',
        ],
        photo: '/photos/bonarka-a.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.95947, 50.02943],
        radius: 45,
      },
      {
        id: 'uskoki',
        category: 'nature',
        name: 'Progi uskokowe',
        teaser: 'Widać tu miejsce, w którym ziemia pękła i jedna jej połowa zjechała w dół.',
        description: [
          'W ścianie odkrywki widać pęknięcia, wzdłuż których warstwy skalne nie pasują już do siebie: po jednej stronie leżą wyżej, po drugiej niżej. To uskoki, czyli ślad po tym, jak skorupa ziemska tu się rozciągała i pękała.',
          'Rezerwat chroni progi uskokowe, w tym uskok nożycowy. Nożycowy znaczy, że przesunięcie nie jest wszędzie takie samo: z jednej strony rośnie, z drugiej maleje do zera, jakby skała obracała się wokół punktu.',
          'Zwykle takie rzeczy ogląda się na przekrojach w podręczniku. Tu jest to ściana, do której można podejść.',
        ],
        findHint:
          'Ściana odkrywki, przy tablicach ścieżki dydaktycznej. Patrz na warstwy: tam, gdzie się nagle rozjeżdżają, biegnie uskok.',
        reveal:
          'Te pęknięcia są młodsze niż samo dno morza. Najpierw powstał wapień, potem morze wyszlifowało z niego równię, a dopiero na końcu ruchy górotwórcze połamały gotową całość. Kolejność da się odczytać z jednej ściany, w środku miasta, bez żadnego sprzętu.',
        sources: ['https://pl.wikipedia.org/wiki/Rezerwat_przyrody_Bonarka'],
        photo: '/photos/bonarka-b.jpg',
        photoCredit: 'Fot. Mateusz Giełczyński · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.95837, 50.02971],
        radius: 40,
      },
      {
        id: 'cement',
        category: 'history',
        name: 'Kamieniołom, który to odsłonił',
        teaser: 'Rezerwat istnieje dlatego, że ktoś tu przez czterdzieści lat kopał na cement.',
        description: [
          'To wyrobisko to jeden z siedmiu nieczynnych kamieniołomów na Krzemionkach Podgórskich. W latach 1885 do 1929 wybierano tu margle senońskie, czyli skałę z okresu kredy, i wożono je do produkcji cementu.',
          'Margiel leżał dokładnie na tym, co dziś jest chronione. Żeby się do niego dostać, trzeba go było zdjąć w całości, warstwa po warstwie, aż do twardego wapienia pod spodem.',
          'Rezerwat utworzono w 1961 roku, na niecałych dwóch i pół hektara. Zwiedza się go ścieżką dydaktyczną długości trzystu metrów.',
        ],
        findHint: 'Gdziekolwiek w rezerwacie. Cały teren to dawne wyrobisko.',
        reveal:
          'Gdyby nikt tu nie kopał, nie byłoby czego chronić: dno morza sprzed osiemdziesięciu kilku milionów lat leżałoby dalej pod grubą warstwą margla i nikt by o nim nie wiedział. Rezerwat powstał w 1961 roku na tym, co odsłonił przemysł, który skończył trzydzieści dwa lata wcześniej.',
        dilemma: {
          question:
            'Najciekawsze geologicznie miejsca w Polsce to najczęściej stare kamieniołomy. Czy to znaczy, że kopanie w ziemi bywa dla nauki dobre?',
          options: [
            'Tak, inaczej byśmy tego nie zobaczyli',
            'Nie, to przypadek a nie zasługa',
            'Dobre dopiero po zamknięciu',
          ],
          counterpoint:
            'Bez wyrobisk połowy wiedzy o skałach Polski by nie było, bo nikt nie zdejmie kilkunastu metrów nadkładu dla samej ciekawości. Ale kamieniołom niszczy dokładnie tyle, ile odsłania, i zwykle nie ma nikogo, kto decyduje, w którym momencie przestać kopać, żeby zostało coś do oglądania.',
        },
        sources: [
          'https://pl.wikipedia.org/wiki/Rezerwat_przyrody_Bonarka',
          'https://www.krakow.pl/instcbi/243244/inst/68343/2576/Rezerwat-Bonarka.html',
        ],
        photo: '/photos/poi-bonarka-cement.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.95905, 50.02905],
        radius: 45,
      },
    ],
  },
]
