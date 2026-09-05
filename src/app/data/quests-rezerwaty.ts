// Cztery rezerwaty w promieniu dwudziestu kilometrów od Rynku, wszystkie
// mniej znane niż Dolinki i wszystkie warte osobnego wyjazdu.
//
// Temat wspólny: SKAŁA JAKO POWÓD, ŻEBY GDZIEŚ POJECHAĆ. Raz jest to skała
// z legendą (Kmity), raz kamienne grzyby w wąwozie (Zimny Dół), raz kawałek
// skorupy ziemskiej, który został w górze, gdy sąsiedztwo zjechało w dół
// (Kajasówka), a raz las, który chroni się dla owadów (Skołczanka).
//
// Po trzy punkty na miejsce: to są wypady na dwie, trzy godziny, więc
// dłuższa lista tylko rozmyłaby wyprawę.
//
// Współrzędne to węzły OSM (skan Overpass 2026-09-05), obrysy z OSM przez
// scripts/add-places.mjs. Źródła faktów siedzą przy treści.

import type { Quest } from './quests'

export const REZERWATY_QUESTS: Quest[] = [
  {
    parkId: 'kmity',
    pois: [
      {
        id: 'skala',
        category: 'view',
        name: 'Skała Kmity',
        teaser: 'Dwadzieścia pięć metrów pionu nad Rudawą, z legendą o skoku.',
        description: [
          'Skała stoi tam, gdzie Rudawa przecina na wylot Garb Tenczyński. Rzeka nie opłynęła wzniesienia, tylko przepiłowała je w poprzek, a to, co zostało po jednej stronie, ma dziś około dwudziestu pięciu metrów prawie pionowej ściany.',
          'To wapień jurajski, ta sama skała co w całej Jurze, tylko tutaj odsłonięta przez wodę zamiast przez kamieniołom. Rezerwat krajobrazowy utworzono w 1959 roku.',
          'Pod skałą biegnie ścieżka dydaktyczna: dwa i pół kilometra, pięć przystanków, prowadzi stąd w Dolinę Grzybowską.',
        ],
        findHint:
          'Zabierzów, nad doliną Rudawy. Skała jest widoczna z drogi, wejście na górę ścieżką od parkingu.',
        reveal:
          'Legenda z początku szesnastego wieku mówi o rycerzu Stanisławie Kmicie, który kochał Olimpię Bonerównę, ale jej rodzina była przeciw. Miał rzucić się z tej skały razem z koniem i zginąć na miejscu. Bonerowie faktycznie byli wtedy właścicielami pobliskich Balic, więc przynajmniej tło legendy się zgadza.',
        legend: [
          'Kmita i Bonerówna kochali się mimo różnicy stanów: on rycerz starego rodu, ona córka bogatego mieszczańskiego domu z Balic. Rodzina dziewczyny nie zgodziła się na to małżeństwo.',
          'Z rozpaczy Kmita wjechał konno na skałę nad Rudawą i skoczył. Zginął razem z koniem. Miejsce nosi od tamtej pory jego nazwisko, a sąsiednia skała, dwieście metrów dalej, nazywa się Skałą Bonerówny.',
        ],
        sources: ['https://pl.wikipedia.org/wiki/Skała_Kmity'],
        photo: '/photos/kmity-a.jpg',
        photoCredit: 'Fot. Arkadiusz Markiewicz · CC BY-SA 3.0 · Wikimedia Commons',
        coords: [19.8115, 50.10063],
        radius: 55,
      },
      {
        id: 'bonerowny',
        category: 'view',
        name: 'Skała Bonerówny',
        teaser: 'Druga skała nad tą samą doliną, nazwana po dziewczynie z legendy.',
        description: [
          'Dwieście metrów na wschód od Skały Kmity stoi mniejsza skała nazwana imieniem Bonerówny. Nazwy nadano tak, żeby legenda miała w terenie dwie strony, a nie jedną.',
          'To dobre miejsce, żeby zobaczyć całą sytuację z boku: rzeka w dole, przecięty grzbiet i główna skała tuż obok.',
        ],
        findHint:
          'Dwieście metrów na wschód od Skały Kmity, tym samym zboczem. Mniejsza i mniej oblegana od tamtej.',
        reveal:
          'Podania rzadko zostawiają po sobie tak wygodny układ. Tutaj obie strony historii dostały własną skałę nad tą samą doliną, i tak już zostało w nazwach. Nikt nie wie, czy Kmita i Bonerówna w ogóle istnieli, ale ich nazwiska trzymają się tego miejsca od pięciuset lat.',
        sources: ['https://pl.wikipedia.org/wiki/Skała_Kmity'],
        coords: [19.81393, 50.09974],
        radius: 45,
      },
      {
        id: 'rosliny',
        category: 'nature',
        name: 'Osiemnaście gatunków pod ochroną',
        teaser: 'Na tej ścianie rośnie tojad, obuwik i ciemiężyca.',
        description: [
          'Rezerwat ma niecałe dwadzieścia hektarów, a rośnie w nim osiemnaście gatunków objętych ochroną, między innymi tojad, obuwik, kosatka i ciemiężyca. Wokół skał stoi las z przewagą dębu.',
          'Powód jest ten sam co w całej Jurze: wapień daje suche, zasadowe podłoże, a pionowa ściana daje pełne słońce i miejsca, do których nie sięgnie ani kosiarka, ani krowa.',
          'Tojad jest przy okazji najbardziej trującą rośliną w Polsce. Warto o tym wiedzieć, jeśli idziesz tu z dzieckiem.',
        ],
        findHint: 'Podnóże i szczeliny skały oraz las dookoła. Nie schodź ze ścieżki.',
        reveal:
          'Skała chroni te rośliny lepiej niż jakikolwiek przepis. Przez osiem wieków wypasu i wycinki w dolinie przetrwały dokładnie tam, gdzie nie dało się wejść z narzędziem: na półkach i w szczelinach ściany. Ochrona rezerwatowa z 1959 roku tylko przypieczętowała to, co zrobiła geologia.',
        sources: ['https://pl.wikipedia.org/wiki/Skała_Kmity'],
        coords: [19.8113, 50.09876],
        radius: 50,
      },
    ],
  },
  {
    parkId: 'zimny-dol',
    stampAt: 2,
    pois: [
      {
        id: 'grzyby',
        category: 'nature',
        name: 'Kamienne grzyby',
        teaser: 'Skały w kształcie grzybów, wyżarte od dołu przez wodę.',
        description: [
          'To najmniejszy rezerwat w okolicy: nieco ponad dwa hektary wschodniego zbocza wąwozu, który uchodzi do doliny Sanki. Chroni się tu formy skalne, jakie robi woda w wapieniu: bloki, korytarze, okapy, schroniska podskalne i skalne grzyby.',
          'Grzyb powstaje wtedy, gdy dół skały rozpuszcza się szybciej niż góra. Woda z gleby jest bardziej kwaśna niż deszcz, więc podgryza podstawę, aż zostaje cienka noga i szeroki kapelusz.',
          'Cały spacer to kilkaset metrów, więc to raczej przystanek po drodze niż osobna wyprawa. Dobrze łączy się z Doliną Mnikowską, która jest kwadrans stąd.',
        ],
        findHint: 'Dno i wschodnie zbocze wąwozu. Przy ścieżce stoi tablica rezerwatu.',
        reveal:
          'Wszystkie te kształty robi ta sama reakcja: woda z dwutlenkiem węgla rozpuszcza wapień i wynosi go w postaci roztworu. Nic tu nie zostało wyrzeźbione uderzeniem ani mrozem. Skała po prostu znika tam, gdzie woda stoi najdłużej, i zostaje tam, gdzie spływa najszybciej.',
        sources: ['https://pl.wikipedia.org/wiki/Rezerwat_przyrody_Zimny_Dół'],
        photo: '/photos/zimny-dol-a.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.67612, 50.0684],
        radius: 45,
      },
      {
        id: 'jaskinia',
        category: 'cave',
        name: 'Jaskinia ze strumieniem',
        teaser: 'Z otworu w skale wypływa woda. To nie jest sucha jaskinia.',
        description: [
          'W zboczu jest otwór jaskini, z którego wypływa strumień źródlany. Większość jaskiń w Jurze jest sucha: woda, która je wydrążyła, dawno spłynęła niżej. Tutaj wciąż płynie.',
          'To znaczy, że oglądasz jaskinię w trakcie powstawania, a nie po fakcie. Korytarz, którym idzie woda, jest w tej chwili poszerzany.',
        ],
        findHint:
          'Zbocze wąwozu, poniżej skałek. Idź za dźwiękiem wody, otwór jest niski i łatwo go minąć.',
        reveal:
          'Nazwa rezerwatu nie jest przypadkowa. W wąwozach o takim układzie zimne powietrze spływa na dno i tam zostaje, bo nie ma jak się wydostać. Latem różnica bywa odczuwalna od razu po zejściu ze ścieżki, a woda wypływająca ze skały ma przez cały rok mniej więcej tę samą temperaturę.',
        sources: ['https://pl.wikipedia.org/wiki/Rezerwat_przyrody_Zimny_Dół'],
        coords: [19.67461, 50.0663],
        radius: 40,
      },
      {
        id: 'niski-mur',
        category: 'climb',
        name: 'Niski Mur',
        teaser: 'Ściana, która wygląda jak zbudowana, choć nikt jej nie stawiał.',
        description: [
          'W górnej części wąwozu ciągnie się skalna ściana o nazwie Niski Mur. Wapień pęka tu wzdłuż prostych szczelin, więc z pewnej odległości wygląda to jak mur ułożony z bloków.',
          'Nazwa jest ludowa i starsza niż rezerwat. Ludzie nazywali skały tym, co im przypominały, a nie tym, czym są geologicznie.',
        ],
        findHint: 'Górna, północna część wąwozu. Ściana jest niska, ale ciągnie się długim pasem.',
        reveal:
          'Regularne bloki to zasługa spękań ciosowych: wapień pęka wzdłuż dwóch prostopadłych kierunków, ustalonych jeszcze wtedy, gdy skała leżała głęboko pod powierzchnią. Woda potem tylko poszerza gotowe szczeliny. Mur nie został ułożony, on się rozpadł na kostki wzdłuż linii, które były w nim od początku.',
        sources: ['https://pl.wikipedia.org/wiki/Rezerwat_przyrody_Zimny_Dół'],
        coords: [19.67659, 50.06919],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'kajasowka',
    stampAt: 2,
    pois: [
      {
        id: 'zrab',
        category: 'view',
        name: 'Zrąb tektoniczny',
        teaser: 'Ten grzbiet nie został wypiętrzony. To sąsiedztwo zjechało w dół.',
        description: [
          'Kajasówka to wąski wapienny grzbiet: dwa i pół kilometra długości, najwyżej trzysta metrów szerokości. Wygląda jak wzgórze, a jest czymś rzadszym.',
          'To zrąb tektoniczny, czyli kawałek skorupy ziemskiej ograniczony uskokami z obu stron. Kiedy okolica pękła i zaczęła się rozciągać, sąsiednie bloki obniżyły się, a ten został na miejscu. Nie urósł, tylko nie zjechał razem z resztą.',
          'Rezerwat utworzono w 1962 roku na niecałych dwunastu hektarach, w gminie Czernichów.',
        ],
        findHint:
          'Cały grzbiet, najlepiej z punktu widokowego przy Bustryku. Idąc nim, masz z obu stron obniżenia.',
        reveal:
          'Ten sam mechanizm co w rowie tektonicznym, tylko odwrotnie. Zrąb powstaje wtedy, gdy blok między dwoma uskokami zostaje wyżej niż sąsiedzi. W Polsce takich wyraźnych, dwustronnych zrębów jest niewiele, a ten jest na tyle wąski i długi, że widać go w terenie bez mapy geologicznej.',
        dilemma: {
          question:
            'Kajasówkę widać dobrze, dopóki jest łysa. Zarasta, bo nikt tu już nie wypasa. Kosić i wycinać, żeby zostały murawy i widok, czy zostawić las?',
          options: [
            'Kosić, murawy są tu rzadsze niż las',
            'Zostawić, niech rośnie',
            'Kosić tylko grzbiet, resztę zostawić',
          ],
          counterpoint:
            'Murawy kserotermiczne trzymają się w Polsce prawie wyłącznie tam, gdzie coś je zgryza albo kosi, a bez tego znikają w kilkanaście lat razem z motylami. Ale koszenie rezerwatu jest kosztowne i trzeba je powtarzać co roku, a las zostawiony sam sobie nie potrzebuje niczyjego budżetu.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Kajasówka'],
        photo: '/photos/kajasowka-b.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.66724, 50.03196],
        radius: 60,
      },
      {
        id: 'jaskinia-pregonska',
        category: 'cave',
        name: 'Jaskinia Przegińska',
        teaser: 'Mała jaskinia w grzbiecie, ślad po wodzie, która tędy przechodziła.',
        description: [
          'W grzbiecie jest niewielka Jaskinia Przegińska. Nie jest duża i nie wymaga sprzętu, ale mówi coś o tym, co się z tą skałą działo.',
          'Wapień Kajasówki jest pełen skamieniałości gąbek i liliowców. To znaczy, że powstał na dnie ciepłego morza jurajskiego, mniej więcej sto pięćdziesiąt milionów lat temu.',
        ],
        findHint: 'W okolicy szczytu, przy ścieżce dydaktycznej z tablicą o zjawiskach krasowych.',
        reveal:
          'Zestaw jest niecodzienny: skała powstała na dnie morza, potem została wyniesiona przez pękanie skorupy, a na końcu podziurawiona przez wodę deszczową od góry. Trzy zupełnie różne procesy, jeden wąski grzbiet, i wszystko widać z jednej ścieżki.',
        sources: ['https://pl.wikipedia.org/wiki/Kajasówka'],
        photo: '/photos/poi-kajasowka-jaskinia.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.66926, 50.03184],
        radius: 40,
      },
      {
        id: 'murawy',
        category: 'meadow',
        name: 'Murawy i skalnik driada',
        teaser: 'Motyl, którego w Polsce prawie nie ma, lata akurat tutaj.',
        description: [
          'Na słonecznych zboczach grzbietu trzymają się murawy kserotermiczne, czyli zbiorowiska roślin sucho i ciepłolubnych: dziewięćsił bezłodygowy, rojownik, kalina. Przy ścieżce stoją tablice, które je nazywają.',
          'W tych murawach lata skalnik driada, motyl rzadki w skali kraju. Duży, brązowy, z niebieskimi oczkami na skrzydłach, w locie wygląda jakby się zataczał.',
          'Murawy są tu jednak w odwrocie i mocno zubożały, bo zarastają.',
        ],
        findHint:
          'Południowe, nasłonecznione zbocza grzbietu, przy tablicach o murawach. Motyle najlepiej w lipcu i sierpniu, w pełnym słońcu.',
        reveal:
          'Te murawy nie są dziką przyrodą w czystej postaci. Powstały tam, gdzie ludzie przez wieki wypasali owce i kozy, a las nie miał szans wrócić. Kiedy wypas się skończył, zaczęły znikać, i razem z nimi motyle. Chronimy tu więc skutek uboczny dawnego rolnictwa.',
        sources: ['https://pl.wikipedia.org/wiki/Kajasówka'],
        coords: [19.66317, 50.02939],
        radius: 55,
      },
    ],
  },
  {
    parkId: 'skolczanka',
    stampAt: 2,
    pois: [
      {
        id: 'owady',
        category: 'nature',
        name: 'Rezerwat dla owadów',
        teaser: 'Chroni się tu las, ale tak naprawdę chodzi o pięćset gatunków motyli.',
        description: [
          'Skołczanka to rzadki przypadek: rezerwat faunistyczny, i to owadzi. Utworzono go w 1957 roku na prawie trzydziestu siedmiu hektarach Wzgórz Tynieckich, żeby chronić około pięciuset gatunków rzadkich motyli i błonkówek.',
          'Motyla nie da się ogrodzić, więc chroni się to, czego potrzebuje: las sosnowo-jodłowo-bukowy, ciepłolubne zarośla, a na ich obrzeżach murawy piaskowe i kserotermiczne.',
          'Teren leży w Bielańsko-Tynieckim Parku Krajobrazowym i w obszarze Natura 2000, kilometr od opactwa w Tyńcu.',
        ],
        findHint:
          'Wzgórza Tynieckie nad Tyńcem, na Dużej Kowodrzy. Najciekawsze są polany i brzegi lasu, nie jego środek.',
        reveal:
          'W 1957 roku ochrona owadów była pomysłem nietypowym: chroniło się głównie drzewa, ptaki i duże ssaki. Tutaj odwrócono kolejność i zaczęto od tego, co małe. Pięćset gatunków na trzydziestu siedmiu hektarach to więcej niż liczy sobie niejeden park narodowy w przeliczeniu na powierzchnię.',
        dilemma: {
          question:
            'Ochrona owadów kosztuje tyle samo co ochrona sarny, a nikt nie przyjeżdża oglądać błonkówek. Czy warto tworzyć rezerwaty dla gatunków, których i tak nie zobaczysz?',
          options: [
            'Tak, one trzymają całą resztę',
            'Lepiej chronić to, co ludzie widzą',
            'Tak, ale trzeba to umieć pokazać',
          ],
          counterpoint:
            'Bez owadów nie ma zapylania, rozkładu ściółki ani pożywienia dla ptaków, więc chroniąc je, chronisz wszystko powyżej. Ale ochrona, której nikt nie rozumie i nie widzi, jest krucha politycznie: przy pierwszym konflikcie o teren przegrywa z czymkolwiek, co da się sfotografować.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Rezerwat_przyrody_Skołczanka'],
        coords: [19.8296, 50.01378],
        radius: 70,
      },
      {
        id: 'kowodrza',
        category: 'view',
        name: 'Duża Kowodrza',
        teaser: 'Wzniesienie nad Wisłą, z opactwem tynieckim w zasięgu wzroku.',
        description: [
          'Rezerwat leży na wzniesieniu Duża Kowodrza. To jedno z Wzgórz Tynieckich, czyli wapiennych ostańców, które sterczą nad doliną Wisły tak samo jak skała, na której stoi opactwo.',
          'Z otwartych miejsc widać dolinę i okolice Tyńca. To ta sama geologia co pod klasztorem: gdyby nie te wapienie, opactwa nie byłoby gdzie postawić.',
        ],
        findHint: 'Wierzchowina wzniesienia, przy otwartych fragmentach i punkcie widokowym.',
        reveal:
          'Wisła ma tutaj przełom przez wapienne wzgórza, dokładnie tak jak Rudawa pod Skałą Kmity, tylko w innej skali. Klasztor postawiono na skale w tym przełomie, bo była to najlepiej broniona pozycja w okolicy. Rezerwat i opactwo stoją więc na dwóch kawałkach tej samej rafy sprzed stu pięćdziesięciu milionów lat.',
        sources: ['https://pl.wikipedia.org/wiki/Rezerwat_przyrody_Skołczanka'],
        coords: [19.82586, 50.01401],
        radius: 60,
      },
      {
        id: 'murawy-piaskowe',
        category: 'meadow',
        name: 'Polany i brzegi lasu',
        teaser: 'Najciekawsze jest tu nie w lesie, tylko na jego skraju.',
        description: [
          'Na polanach i obrzeżach zarośli są murawy piaskowe i kserotermiczne. To właśnie one, a nie las, żywią większość owadów, dla których powstał rezerwat: potrzebują słońca, kwiatów i gorącej ziemi.',
          'Brzeg lasu jest w przyrodzie miejscem najbogatszym, bo łączy warunki dwóch światów naraz. Dlatego opłaca się tu iść wolno i patrzeć pod nogi zamiast szukać widoku.',
        ],
        findHint: 'Polany i pasy między lasem a zaroślami. Najlepiej w ciepły, bezwietrzny dzień.',
        reveal:
          'Rezerwat ma problem, którego nie widać: las powoli zarasta polany, a razem z nimi znika baza pokarmowa motyli, dla których go założono. Ochrona ścisła zrobiłaby tu więcej szkody niż pożytku, bo to nie las jest zagrożony, tylko dziury w nim.',
        sources: ['https://pl.wikipedia.org/wiki/Rezerwat_przyrody_Skołczanka'],
        coords: [19.82789, 50.01537],
        radius: 55,
      },
    ],
  },
]
