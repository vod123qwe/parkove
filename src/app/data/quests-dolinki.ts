// Dolinki Krakowskie: wyprawy za miasto, 14 do 16 km od Rynku.
//
// Inaczej niż park w mieście, dolina jest za duża na jedno wejście, więc każda
// ma `stampAt`: pieczątka przychodzi po trzech punktach, a reszta zostaje jako
// powód, żeby wrócić.
//
// Geometria wielokątów: rezerwaty Wąwóz Bolechowicki i Dolina Kluczwody wzięte
// z OSM przez Nominatim; Kobylańska nie jest rezerwatem, więc jej obszar to
// otoczka nazwanych obiektów w jarze. Współrzędne punktów to węzły OSM
// (Overpass, 2026-08-21). Fakty w opisach: polska Wikipedia, linki w `sources`.

import type { Quest } from './quests'

export const DOLINKI_QUESTS: Quest[] = [
  {
    parkId: 'dolina-bolechowicka',
    // 1,5 km wąwozu, ale i tak nie wymagamy zaliczenia wszystkiego naraz
    stampAt: 3,
    pois: [
      {
        id: 'brama',
        category: 'nature',
        name: 'Brama Bolechowicka',
        teaser: 'Dwie wapienne skały wysokie na 25 metrów, między którymi wchodzi się w dolinę.',
        description: [
          'Wylot Doliny Bolechowickiej zamykają dwie skały tworzące bramę: Filar Abazego po lewej stronie i Filar Pokutników po prawej, w Murze Pokutników. Mają około 25 metrów wysokości i widać je z daleka, jeszcze z drogi przez wieś.',
          'Bramy nikt nie wykuł. Zrobił ją kras: woda przez tysiące lat rozpuszczała wapień, aż z jednolitej skały został przewężony korytarz i dwa filary po bokach.',
          'Zaraz przed bramą i zaraz za nią zbocza się wypłaszczają w małe łąki. To naturalne miejsce na postój i tam zwykle siedzą wszyscy, którzy tu przyszli.',
        ],
        findHint:
          'Od Bolechowic idź na północ około 800 metrów. Bramy nie da się przegapić: droga wchodzi dokładnie między dwie skały.',
        reveal:
          'Nazwy filarom nadali wspinacze jeszcze przed drugą wojną światową i tak zostało do dziś. Cała brama leży w rezerwacie przyrody Wąwóz Bolechowicki.',
        sources: ['https://pl.wikipedia.org/wiki/Brama_Bolechowicka'],
        coords: [19.78474, 50.15271],
        radius: 60,
      },
      {
        id: 'mur-pokutnikow',
        category: 'climb',
        name: 'Mur Pokutników',
        teaser: 'Prawa strona bramy: pionowa i przewieszona, obwieszona wspinaczami.',
        description: [
          'Filar Pokutników stoi w Murze Pokutników, w prawym zboczu doliny. Skała jest stromo podcięta, miejscami pionowa, miejscami przewieszona, więc drogi wspinaczkowe idą tu do najwyższych stopni trudności, do VI.6 w skali Kurtyki.',
          'To jedno z tych miejsc, gdzie widowisko jest darmowe. Wystarczy stanąć na łące pod skałą i patrzeć, jak ktoś kilkanaście metrów wyżej szuka chwytu.',
          'Rezerwat nie zabrania wspinania, ale je porządkuje: wolno chodzić tylko wyznaczonymi drogami i tylko po zamontowanych już ringach. Nowych dziur w tej skale nikt nie zrobi.',
        ],
        findHint: 'Prawa, wschodnia skała bramy, patrząc od strony Bolechowic. Pod nią wydeptana łąka.',
        reveal:
          'Wspinanie jest tu dozwolone, ale tylko po istniejących ringach i wyznaczonymi drogami. Ten kompromis między sportem a ochroną przyrody obowiązuje w całym rezerwacie.',
        dilemma: {
          question:
            'W rezerwacie przyrody wolno się wspinać, ale tylko po drogach, które ktoś wyznaczył i uzbroił wcześniej. Czy sport ma prawo wchodzić do rezerwatu?',
          options: ['Ma, jeśli w ryzach', 'Nie ma, to rezerwat', 'Zależy od skały'],
          counterpoint:
            'Wspinacze byli tu przed rezerwatem: nazwy filarów są starsze niż ochrona. Z drugiej strony ściana obwieszona ludźmi to nie jest miejsce, w którym cokolwiek wysiaduje jaja. Dzisiejsza zasada jest próbą pogodzenia jednego z drugim, a nie zwycięstwem którejkolwiek strony.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Brama_Bolechowicka'],
        coords: [19.784335, 50.152757],
        radius: 40,
      },
      {
        id: 'wodospad',
        category: 'water',
        name: 'Dwustopniowy wodospad',
        teaser: 'Rzadkość w tej części Jury: woda spadająca dwoma progami.',
        description: [
          'Kilkaset metrów w głąb doliny, już w zalesionym parowie, Bolechówka spada dwoma progami. Na Jurze Krakowsko-Częstochowskiej wodospad to rzadkość, bo woda zwykle znika tu pod ziemią, w wapieniu, zamiast płynąć po nim.',
          'Nie jest wysoki i nie robi huku. Robi coś innego: w wąwozie, w którym poza tym słychać tylko własne kroki, pojawia się dźwięk wody.',
          'Ile go zobaczysz, zależy od pogody z poprzednich tygodni. Po suchym lipcu bywa cienką strużką, po roztopach potrafi zapełnić cały próg.',
        ],
        findHint:
          'Idź dnem doliny w głąb, za bramę. Wodospad jest przy potoku, słychać go przed zobaczeniem.',
        reveal:
          'Wodospady na Jurze są rzadkie, bo wapień przecieka: woda woli zniknąć w szczelinie niż spaść z progu. Ten się utrzymał.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Bolechowicka'],
        coords: [19.783778, 50.156439],
        radius: 40,
      },
      {
        id: 'krzyz',
        category: 'monument',
        name: 'Krzyż nad wąwozem',
        teaser: 'Krzyż milenijny na zboczu, postawiony na rok 2000.',
        description: [
          'Na zboczu nad wąwozem stoi krzyż milenijny. Takie krzyże stawiano w Polsce masowo na przełomie tysiącleci, zwykle na wzniesieniach, tam gdzie było je skąd widać.',
          'Ten stoi w miejscu, w którym i tak chce się zatrzymać: stąd dolina wygląda jak wcięcie w płaskowyżu, a nie jak wąwóz, w którym się właśnie idzie.',
        ],
        findHint: 'Zbocze kilkadziesiąt metrów nad dnem doliny. Ścieżka odbija w górę niedaleko bramy.',
        reveal:
          'Krzyże milenijne to najmłodsza warstwa krajobrazu tych dolin: młodsza od wszystkiego dookoła, w tym od nazw skał nadanych przez wspinaczy.',
        coords: [19.782035, 50.153544],
        radius: 35,
      },
      {
        id: 'taras',
        category: 'view',
        name: 'Widok z góry bramy',
        teaser: 'Punkt, z którego bramę widać z boku, a nie od dołu.',
        description: [
          'Ze zbocza nad bramą filary przestają być ścianą, a stają się dwiema osobnymi skałami stojącymi w wylocie doliny. Dopiero stąd widać, jak wąskie jest to przejście i jak płaska jest wyżyna, którą przecina.',
          'To także najlepsze miejsce, żeby zobaczyć, jak krótka jest ta dolina. Półtora kilometra widać w całości.',
        ],
        findHint: 'Ścieżka w górę zboczem, kilka minut od bramy. Uwaga na strome miejsca po deszczu.',
        reveal:
          'Dolina Bolechowicka ma około 1,5 km i jest jedną z najkrótszych podkrakowskich dolinek. Za to widokowo bije większość dłuższych.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Bolechowicka'],
        coords: [19.783529, 50.153078],
        radius: 35,
      },
    ],
  },
  {
    parkId: 'dolina-kobylanska',
    stampAt: 3,
    pois: [
      {
        id: 'zabi-kon',
        category: 'climb',
        name: 'Żabi Koń',
        teaser: 'Skała, której nazwę wymyślili wspinacze i nikt jej już nie zmieni.',
        description: [
          'Dolina Kobylańska to jedna wielka ściana wspinaczkowa rozbita na kilkadziesiąt skał po obu stronach jaru. Żabi Koń jest jedną z tych, których nazwę zna każdy, kto tu bywa.',
          'Nazwy w tej dolinie to osobna kolekcja: obok Żabiego Konia stoją Pieninki, Obelisk i Bodzio. Nadawali je wspinacze, więc opisują nie historię, a to, co skała komuś przypominała.',
          'Wapienie stoją tu blisko ścieżki, więc nie trzeba się wspinać, żeby je zobaczyć. Wystarczy iść dnem doliny i patrzeć w górę.',
        ],
        findHint: 'Idąc od wejścia z Kobylan, skała stoi tuż nad ścieżką.',
        reveal:
          'Dolina Kobylańska nosi też nazwy Dolina Karniowska i Jar Kobylański. Trzy nazwy na jedną dolinę, bo sąsiednie wsie nazywały ją każda po swojemu.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Kobyla%C5%84ska'],
        coords: [19.756272, 50.155951],
        radius: 40,
      },
      {
        id: 'zrodlo-antoniego',
        category: 'water',
        name: 'Źródło Antoniego',
        teaser: 'Woda wychodzi tu z wapienia i zaraz znów w nim znika.',
        description: [
          'Na Jurze woda prowadzi podwójne życie: część drogi płynie po powierzchni, część pod nią, w szczelinach rozpuszczonego wapienia. Źródła to miejsca, w których wraca na wierzch.',
          'Takie źródło jest też powodem, dla którego dolina wygląda tak, jak wygląda. To woda wyżarła ten jar w płaskowyżu, przez tysiące lat, po kropli.',
        ],
        findHint: 'Dno doliny, przy ścieżce. Szukaj miejsca, gdzie z ziemi wychodzi strumień.',
        reveal:
          'Ta sama woda, która wypływa ze źródła, wcześniej zniknęła gdzieś wyżej w skale. Na Jurze potoki potrafią po prostu przepaść i wrócić kilkaset metrów dalej.',
        coords: [19.755807, 50.155341],
        radius: 30,
      },
      {
        id: 'garaz',
        category: 'cave',
        name: 'Jaskinia Garaż',
        teaser: 'Mała jaskinia w skale przy ścieżce, z nazwą bez ambicji.',
        description: [
          'W ścianie doliny otwiera się niewielka jaskinia. Nazwa mówi wszystko o jej rozmiarach i o poczuciu humoru osób, które ją nazwały.',
          'Jaskinie w tych dolinach nie są dziurami wybitymi w skale, tylko śladem po wodzie: rozpuszczonym wapieniem. Każda z nich to kawałek dawnego podziemnego korytarza, który dolina rozcięła i otworzyła.',
        ],
        findHint: 'Skała po zachodniej stronie doliny, otwór na wysokości ścieżki.',
        reveal:
          'Największe jaskinie całej Jury są w sąsiedniej Dolinie Kluczwody, kilka kilometrów stąd: Wierzchowska Górna i Mamutowa.',
        coords: [19.754995, 50.156295],
        radius: 30,
      },
      {
        id: 'cmentarz-choleryczny',
        category: 'history',
        name: 'Cmentarz choleryczny',
        teaser: 'Kawałek ziemi na uboczu, gdzie chowano zmarłych z dala od wsi.',
        description: [
          'Na skraju doliny leży cmentarz choleryczny. W dziewiętnastym wieku, gdy przez te wsie przechodziły epidemie cholery, zmarłych chowano osobno i z dala od domów, poza wsią i poza zwykłym cmentarzem.',
          'Nie ma tu nazwisk ani rzeźb. Jest miejsce, o którym pamięta tylko nazwa i to, że przez pokolenia nikt go nie zaorał.',
        ],
        findHint: 'Zachodni skraj doliny, na uboczu ścieżki. Miejsce jest ciche i łatwo je minąć.',
        reveal:
          'Cmentarze choleryczne zakładano poza wsią, bo bano się, że choroba wraca razem z ciałem. Dziś to jedne z najspokojniejszych miejsc w krajobrazie tych wsi.',
        dilemma: {
          question:
            'To miejsce nie ma nazwisk, tablicy ani ścieżki. Czy takie miejsca powinniśmy oznaczać i pokazywać, czy zostawić im ciszę?',
          options: ['Oznaczać, żeby pamiętać', 'Zostawić w ciszy', 'Oznaczać dyskretnie'],
          counterpoint:
            'Bez tablicy o cmentarzu wie tylko ten, kto tu mieszka od pokoleń, a to znaczy, że za jedno pokolenie nie będzie wiedział nikt. Z tablicą przychodzą też ludzie, którzy przyszli dla atrakcji, a nie dla pamięci. Trzecia droga, mała informacja bez wielkiego szyldu, próbuje mieć jedno bez drugiego.',
        },
        coords: [19.749801, 50.152418],
        radius: 40,
      },
      {
        id: 'widok',
        category: 'view',
        name: 'Widok na jar',
        teaser: 'Miejsce, z którego widać cały jar razem ze skałami po obu stronach.',
        description: [
          'Ze zbocza dolina przestaje być ścieżką między skałami i staje się tym, czym jest: wąskim wcięciem w płaskiej wyżynie, obstawionym wapiennymi skałami po obu stronach.',
          'Stąd też najlepiej widać, ile tych skał tu jest. Z dna doliny widzisz kilka, z góry kilkanaście.',
        ],
        findHint: 'Ścieżka odbijająca w górę zboczem, po zachodniej stronie doliny.',
        reveal:
          'Dolina Kobylańska jest jedną z ośmiu dolin Parku Krajobrazowego Dolinki Krakowskie. Każda następna wygląda inaczej, choć wszystkie zrobiła ta sama woda.',
        coords: [19.754366, 50.153675],
        radius: 35,
      },
    ],
  },
  {
    parkId: 'dolina-kluczwody',
    stampAt: 3,
    pois: [
      {
        id: 'slupy-graniczne',
        category: 'history',
        name: 'Słupy graniczne',
        teaser: 'Zrekonstruowane słupy w miejscu, gdzie kończyło się jedno państwo.',
        description: [
          'Stoją tu zrekonstruowane słupy graniczne. W czasie rozbiorów granica między zaborem rosyjskim i austriackim przechodziła przez te okolice: sąsiednie Będkowice leżały po stronie rosyjskiej, tuż przy granicy z Austrią.',
          'Dla ludzi z tych wsi nie była to linia na mapie, a codzienność: inne pieniądze, inny język urzędu i inna armia po drugiej stronie pola.',
          'Dolina wygląda dziś jak spokojne miejsce na spacer. Sto lat temu spacer w tę stronę mógł się skończyć rozmową ze strażnikiem.',
        ],
        findHint: 'Górna część doliny, przy ścieżce, w otwartym miejscu.',
        reveal:
          'Granica zaborów szła przez te dolinki. Szczyt sąsiedniego Kopca Bzowskich służył wtedy rosyjskim służbom granicznym jako punkt obserwacyjny.',
        dilemma: {
          question:
            'Odbudowano słupy, które dzieliły te wsie na dwa państwa. Czy warto odtwarzać znaki granicy, której już nie ma?',
          options: ['Warto, to nasza historia', 'Nie, to znak podziału', 'Zależy, jak się opowiada'],
          counterpoint:
            'Słup bez opowieści jest tylko kawałkiem drewna i łatwo go pomylić z ozdobą. Ale granica, o której nikt nie pamięta, zamienia się w płaską historię, w której nic nikogo nie kosztowało. Ten słup jest pretekstem, żeby ktoś opowiedział, co znaczyło mieszkać przy nim.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Kopiec_Bzowskich'],
        coords: [19.817802, 50.164218],
        radius: 40,
      },
      {
        id: 'maczne-skaly',
        category: 'view',
        name: 'Mączne Skały',
        teaser: 'Panorama górnego odcinka doliny z wapiennych skał na wschodnim zboczu.',
        description: [
          'Mączne Skały wznoszą się na wschodnim zboczu doliny, między drogą z Białego Kościoła do Zelkowa a Zamkową Skałą. To z nich widać cały górny odcinek Kluczwody.',
          'Dolina ma około sześciu kilometrów, więc z dna widzisz zawsze tylko jej fragment. Stąd widać, jak się wije i jak wąsko wcina się w wyżynę.',
        ],
        findHint: 'Wschodnie zbocze, ścieżka w górę od dna doliny. Skały stoją nad drogą do Zelkowa.',
        reveal:
          'Dolina Kluczwody nazywana jest też Doliną Wierzchówki. Płynący jej dnem potok Kluczwoda kończy bieg w Rudawie.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Kluczwody'],
        coords: [19.818716, 50.164246],
        radius: 60,
      },
      {
        id: 'jaskinia-maczna',
        category: 'cave',
        name: 'Jaskinia w Mącznej Skale',
        teaser: 'Otwór w skale, w dolinie, która ma największe jaskinie Jury.',
        description: [
          'W Mącznej Skale otwierają się dwie jaskinie, duża i mała. Nie trzeba do nich wchodzić, żeby zrozumieć, jak powstała ta dolina: to ta sama woda, która rozpuściła wapień pod ziemią, rozcięła go potem od góry.',
          'Górna część Kluczwody, koło Wierzchowia, ma największe jaskinie całej Jury Krakowsko-Częstochowskiej: Wierzchowską Górną, najdłuższą udostępnioną do zwiedzania, i Mamutową.',
        ],
        findHint: 'Ściana Mącznej Skały, otwory na wysokości ścieżki i nieco nad nią.',
        reveal:
          'Jaskinia Mamutowa w tej samej dolinie jest dziś celem wspinaczy: drogi w jej ścianach dochodzą do VI.8.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Kluczwody'],
        coords: [19.81962, 50.163992],
        radius: 30,
      },
      {
        id: 'zamkowa-straznica',
        category: 'history',
        name: 'Zamkowa Strażnica',
        teaser: 'Skała, której nazwa pamięta wartę, choć z warty nic nie zostało.',
        description: [
          'Grupa skał na wschodnim zboczu nosi nazwy Zamkowa Skała i Zamkowa Strażnica. To najwyższe i najbardziej strome miejsce w tej części doliny, czyli dokładnie takie, jakie wybiera się, gdy chce się widzieć, kto nadchodzi.',
          'Nie ma tu murów ani fundamentów do pokazania. Została nazwa, którą ludzie z okolicy przekazywali sobie tak długo, że przetrwała to, co nazywała.',
        ],
        findHint: 'Wschodnie zbocze w dolnej części rezerwatu. Skały widać z dna doliny.',
        reveal:
          'Nazwy skał w tych dolinach mają dwie warstwy: starszą od okolicznych wsi, mówiącą o zamkach i strażnicach, i młodszą od wspinaczy, mówiącą o filarach i turniach.',
        coords: [19.829182, 50.160463],
        radius: 45,
      },
      {
        id: 'szczelina',
        category: 'cave',
        name: 'Szczelina w Szerokiej',
        teaser: 'Wąska szpara w skale, przez którą dolina oddycha.',
        description: [
          'Szczelina w Szerokiej to nie jaskinia z komorami, a wąska szpara w wapieniu. Takich w tej dolinie są dziesiątki i większość nie ma nazwy.',
          'Zimą z takich szczelin idzie para, bo w skale jest cieplej niż na powierzchni. Lato robi to samo w drugą stronę: w środku wieje chłodem.',
        ],
        findHint: 'Dolna część doliny, skała przy ścieżce.',
        reveal:
          'Skały tej doliny są przewiercone szczelinami na wylot. To one prowadzą wodę, która przez miliony lat zrobiła z płaskowyżu dolinę.',
        coords: [19.819667, 50.154667],
        radius: 30,
      },
    ],
  },
]
