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
        photo: '/photos/dolina-bolechowicka.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
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
        photo: '/photos/bolechowicka-mur.jpg',
        photoCredit: 'Fot. Wikipedysta Artur · CC BY 2.5 PL · Wikimedia Commons',
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
        photo: '/photos/bolechowicka-wodospad.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 3.0 · Wikimedia Commons',
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
        photo: '/photos/dolina-kobylanska.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
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
        photo: '/photos/poi-dolina-kobylanska-zrodlo-antoniego.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
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
        photo: '/photos/poi-dolina-kobylanska-cmentarz-choleryczny.jpg',
        photoCredit: 'Fot. Flyz1 · CC BY-SA 4.0 · Wikimedia Commons',
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
      {
        id: 'kapliczka',
        category: 'monument',
        name: 'Kapliczka i filarki',
        teaser: 'Kapliczka Matki Boskiej, a dwa kroki dalej skałki, które wspinacze nazwali od niej.',
        description: [
          'W środku doliny, przy ścieżce, stoi kapliczka Matki Boskiej. Zwykła, wiejska, jedna z tysięcy w Małopolsce, i przez to łatwa do przejścia obok.',
          'Ciekawe zaczyna się kilka metrów dalej. Skałki obok mają w przewodnikach wspinaczkowych nazwę Filarki obok kapliczki. Nie Filarki Zachodnie, nie Filarki Kobylańskie: obok kapliczki. Wspinacze wzięli za punkt odniesienia to, co i tak było tu pierwsze.',
          'To jedno miejsce, w którym widać, że dolina ma dwie warstwy: gospodarską, starszą, i sportową, młodszą o sto lat. Obie używają tych samych kamieni.',
        ],
        findHint: 'Środek doliny, przy ścieżce, po tej samej stronie co Źródło Antoniego.',
        reveal:
          'W nazwach skał w Kobylańskiej widać, kto tu przychodził i po co: Żabi Koń, Dziób Kobylański, Mnich, Dzwon, a obok Filarki obok kapliczki. Wspinacz nazywa to, co widzi z liny, a nie to, co widać z drogi.',
        dilemma: {
          question: 'Czy sport ma prawo zawłaszczać miejsca, które dla kogoś innego są święte?',
          options: ['Tak, jeśli nikomu nie przeszkadza', 'Nie, święte to święte', 'Zależy, kto był pierwszy'],
          counterpoint:
            'Skała nie należy do nikogo i wspinaczka jej nie ujmuje, a nazwa od kapliczki jest w tym raczej ukłonem niż zawłaszczeniem. Ale w niedzielę pod kapliczką stoi ktoś, kto przyszedł się modlić, i słyszy komendy z liny piętnaście metrów wyżej.',
        },
        sources: ['OpenStreetMap: kapliczka Matki Boskiej (wayside_shrine), Filarki obok kapliczki'],
        coords: [19.75616, 50.15563],
        radius: 45,
      },
      {
        id: 'wielblad',
        category: 'climb',
        name: 'Wielbłąd, Cycówka i Prawie K2',
        teaser: 'Wspinacze nazywają skały tak, jak im się skojarzy, i nikt tego nie poprawia.',
        description: [
          'W górnej części doliny stoją obok siebie: Wielbłąd, Cycówka, Prawie K2, Dzwon, Mnich, Piersiówka, Kopa Barana, Postrzępiona Turnia, Dwoista Turnia i Turnia z Krzyżem. Kilkaset metrów doliny, a taki spis nazw.',
          'Nazwy skał wspinaczkowych nie powstają w urzędzie. Wymyśla je ten, kto pierwszy wytyczył drogę, i zostają, jeśli inni zaczną ich używać. Dlatego obok siebie leżą Mnich i Cycówka, a jedna ze skał nazywa się Prawie K2, bo komuś wydała się prawie tak trudna jak ośmiotysięcznik.',
          'Jest tu jeszcze Ponad Gnój Turnia, i nazwa mówi dokładnie to, co myślisz. Ktoś stał pod nią, popatrzył na to, co ma pod butami, i tak już zostało.',
        ],
        findHint:
          'Górna część doliny, po obu stronach ścieżki. Wielbłąd ma dwa garby, więc rozpoznasz go bez tablicy.',
        reveal:
          'W polskiej Jurze jest ponad tysiąc nazwanych skał i prawie żadna nie ma nazwy urzędowej. Ta warstwa nazw istnieje tylko w przewodnikach wspinaczkowych, w mapie OpenStreetMap i w pamięci ludzi, którzy tu chodzą.',
        dilemma: {
          question: 'Kto powinien mieć prawo nadawać nazwy miejscom w terenie?',
          options: ['Ten, kto je odkrył', 'Mieszkańcy', 'Nikt, niech się przyjmą same'],
          counterpoint:
            'Nazwy, które przyjmują się same, są najuczciwsze, bo znaczą tyle, ile ktoś zechciał zapamiętać. Ale wtedy najgłośniejsza grupa nazywa wszystko, a Cycówka trafia na mapę, na którą patrzy z dzieckiem ktoś, kto o wspinaczce nie słyszał.',
        },
        sources: [
          'OpenStreetMap: Wielbłąd, Cycówka, Prawie K2, Dzwon, Mnich, Piersiówka, Kopa Barana, Postrzępiona Turnia, Dwoista Turnia, Turnia z Krzyżem, Ponad Gnój Turnia',
        ],
        coords: [19.75942, 50.15729],
        radius: 120,
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
        photo: '/photos/kluczwody-maczne.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
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
        photo: '/photos/poi-dolina-kluczwody-jaskinia-maczna.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
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
        photo: '/photos/kluczwody-zamkowa.jpg',
        photoCredit: 'Fot. Januszk Krzyżek · CC BY-SA 4.0 · Wikimedia Commons',
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
  {
    parkId: 'dolina-bedkowska',
    // 8 km doliny, więc pieczątka po trzech punktach, resztę zbierasz kiedyś potem
    stampAt: 3,
    pois: [
      {
        id: 'szum',
        category: 'water',
        name: 'Wodospad Szum',
        teaser: 'Najwyższy wodospad Jury, na progu, który zbudował mech.',
        description: [
          'Szum, zwany też Wodospadem Szerokim, jest jednym z niewielu i zarazem najwyższym wodospadem na Wyżynie Krakowsko-Częstochowskiej. Woda Będkówki spada tu z progu wysokiego na cztery metry.',
          'Ten próg nie jest zwykłą skałą. To martwica wapienna, czyli wapień, który osadził się na mchach i wątrobowcach: rośliny obrastały wodę, woda odkładała na nich wapń, a po nich został kamień w kształcie roślin.',
          'Progi w tej dolinie tworzyły się między ośmioma a sześcioma tysiącami lat temu, w cieplejszym okresie zwanym optimum atlantyckim. Stoisz przed czymś, co wyhodowała woda razem z mchem.',
        ],
        findHint: 'Dno doliny między schroniskiem Brandysówka a Brandysową Polaną. Słychać go, zanim się go zobaczy.',
        reveal:
          'Próg wodospadu jest zbudowany z martwicy wapiennej, którą osadziły mchy i wątrobowce od ośmiu tysięcy lat. Wodospad nie wyżarł tej skały, tylko na niej wyrósł.',
        dilemma: {
          question:
            'Ten próg powstał przez sześć tysięcy lat, warstwa po warstwie, na żywym mchu. Wystarczy chodzić po nim butami, żeby przestał rosnąć. Czy najciekawsze miejsca powinny być otwarte dla wszystkich?',
          options: ['Otwarte, ludzie to zrozumieją', 'Z barierką i ścieżką', 'Zamknięte, jeśli krucha'],
          counterpoint:
            'Miejsce, którego nikt nie widzi, nie ma nikogo, kto by go bronił. Ale rzecz, która rośnie milimetr na dekadę, nie odbuduje się przez to, że ktoś obiecał uważać. Ścieżka i barierka są nudnym kompromisem, który zwykle działa.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Szum_(wodospad)'],
        photo: '/photos/poi-dolina-bedkowska-szum.jpg',
        photoCredit: 'Fot. Łukasz Śmigasiewicz · CC BY-SA 3.0 pl · Wikimedia Commons',
        coords: [19.743411, 50.174809],
        radius: 40,
      },
      {
        id: 'sokolica',
        category: 'view',
        name: 'Sokolica',
        teaser: 'Najwyższa ściana Jury, a na jej szczycie gród z dziewiątego wieku.',
        description: [
          'Sokolica wznosi się sto metrów nad dnem doliny i ma najwyższą ścianę w całej Jurze. To jedna z niewielu skał w Polsce poza Tatrami, na której wytyczono drogi wielowyciągowe, czyli takie, na których wspinacz zatrzymuje się w połowie ściany i zaczyna od nowa.',
          'Dawniej nazywano ją Grodziskiem i nie bez powodu: na szczycie odkryto resztki dużego grodu z ósmego albo dziewiątego wieku. Wały wciąż są widoczne. Wykopaliska pokazały też ślady osadnictwa z neolitu i kultury łużyckiej, czyli ludzie wybierali to miejsce przez tysiące lat.',
          'U jej podnóża stoi Brandysówka: schronisko, pole namiotowe i baza polskich wspinaczy skałkowych. W pogodny weekend jest tu więcej lin niż ludzi na szlaku.',
        ],
        long: [
          'Sam kamień też ma historię i jest starsza od wszystkiego innego w tej dolinie. Tablica Małopolskiego Szlaku Geoturystycznego, opracowana przez geologów z AGH, mówi, że Sokolica jest budowlą mikrobialno-gąbkową: powstała ze struktur rafopodobnych w płytkim morzu szelfowym, które w górnej jurze zalewało ten teren.',
          'Znaczy to, że tę skałę zbudowały żywe organizmy: cyjanobakterie i gąbki, których szkielety wciąż można znaleźć w jej strukturze. Wspinacz łapie chwyty w czymś, co sto pięćdziesiąt milionów lat temu było dnem ciepłego morza.',
          'W Sokolicy są też dwie jaskinie: Jaskinia w Sokolicy i Komin w Sokolicy. Żadna nie jest udostępniona, ale ich otwory widać z dołu, jeśli wiesz, gdzie patrzyć.',
        ],
        findHint:
          'Środkowa część doliny, naprzeciw wylotu wąwozu Precówki, w miejscu gdzie Bedkówka zakręca w lewo. Nad Brandysówką, nie da się przegapić.',
        reveal:
          'To najwyższa ściana wspinaczkowa Jury i najwyższa w Polsce poza Tatrami. A na jej szczycie stał gród, więc ktoś tysiąc lat temu doszedł do tego samego wniosku co wspinacze: to najlepszy punkt w całej dolinie.',
        dilemma: {
          question:
            'Na szczycie Sokolicy leżą wały grodu z dziewiątego wieku, a jej ścianą codziennie wchodzą wspinacze. Wpuścić ich tam, gdzie leży stanowisko archeologiczne?',
          options: [
            'Tak, wspinaczka nie rusza wałów',
            'Nie, stanowisko jest ważniejsze',
            'Tak, ale bez wychodzenia na szczyt',
          ],
          counterpoint:
            'Wspinacze trzymają się ściany, a wały leżą na wierzchu, więc konflikt jest mniejszy, niż brzmi. Ale każdy szlak na szczyt to wydeptana ścieżka, a wydeptana ścieżka na grodzisku to warstwy, których nikt już nie odczyta. Archeolodzy nie boją się lin, boją się butów.',
        },
        sources: [
          'https://pl.wikipedia.org/wiki/Sokolica_(Dolina_Będkowska)',
          'https://zpkwm.pl/park/park-krajobrazowy-dolinki-krakowskie/turystyka/propozycje-wycieczek/bedkowska/',
        ],
        photo: '/photos/bedkowska-sokolica.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 3.0 · Wikimedia Commons',
        coords: [19.741829, 50.171904],
        radius: 60,
      },
      {
        id: 'nietoperzowa',
        category: 'cave',
        name: 'Jaskinia Nietoperzowa',
        teaser: 'Największa jaskinia Jury, nazwana od nietoperzy, których kości w niej znaleziono.',
        description: [
          'Jaskinia Nietoperzowa, zwana też Jaskinią Zygmunta, leży w górnej części Doliny Będkowskiej i jest największą jaskinią całej Wyżyny Krakowsko-Częstochowskiej.',
          'Nazwa nie jest przesadzona. Znaleziono tu bogate szczątki kopalnych nietoperzy i wciąż mieszkają tu gatunki żywe. Jaskinia jest jednym z tych miejsc, gdzie zwierzęta były wcześniej niż ludzie i zostały dłużej.',
          'Wejście jest udostępnione do zwiedzania, więc to jedyny punkt w naszych dolinach, do którego wchodzi się z przewodnikiem i biletem.',
        ],
        long: [
          'Korytarzy jest tu ponad kilometr, dokładnie 1047 metrów, a wejście ma pięć na pięć. Sale i duże korytarze powstały pod zwierciadłem wód podziemnych, więc to woda wypłukała je od środka, a nie żaden zawal.',
          'W początkowej części jest wodospad naciekowy, czyli ta sama martwica wapienna, która zrobiła próg Szumu na dworze. Dolina buduje wodospady z kamienia po obu stronach skały: jeden na słońcu, drugi w ciemności.',
          'W dziewiętnastym wieku namulisko jaskini wybierano na nawóz, a przemysłową eksploatację prowadzono w latach 1872 do 1879. Zniszczyło to pierwotne osady, ale przy okazji natrafiono na cztery tysiące kłów niedźwiedzi jaskiniowych. Systematyczne badania przeprowadził dopiero Waldemar Chmielewski w latach 1956 do 1963.',
          'Archeologicznie to stanowisko górnego paleolitu: obóz łowców mamutów sprzed blisko czterdziestu tysięcy lat. Filmowcy też ją znaleźli: kręcono tu między innymi zdjęcia do Ogniem i mieczem.',
        ],
        findHint: 'Górna część doliny, po stronie Jerzmanowic. Przy jaskini tablica i wejście dla zwiedzających.',
        reveal:
          'To największa jaskinia Wyżyny Krakowsko-Częstochowskiej: ponad kilometr korytarzy. Nazwę wzięła od nietoperzy, i tych kopalnych, i tych, które nadal tu zimują, a w dziewiętnastym wieku znaleziono w niej cztery tysiące kłów niedźwiedzi jaskiniowych.',
        dilemma: {
          question:
            'Namulisko tej jaskini wybrano na nawóz, zanim ktokolwiek je zbadał. Czy z miejscami, których wartości jeszcze nie znamy, trzeba obchodzić się jak z zabytkiem?',
          options: [
            'Tak, bo drugiego razu nie ma',
            'Nie, ludzie też muszą z czegoś żyć',
            'Tak, ale ktoś musi za tę ostrożność zapłacić',
          ],
          counterpoint:
            'Warstwy w jaskini czyta się jak strony: raz przemieszane, nie złożą się z powrotem, a razem z nimi znika czterdzieści tysięcy lat zapisów. Ale w 1872 roku nikt nie wiedział, że to zapis, a nawóz był potrzebny od zaraz. Dzisiejsza ostrożność jest tania dla nas, bo nie my musimy z niej rezygnować.',
        },
        sources: ['https://pl.wikipedia.org/wiki/Jaskinia_Nietoperzowa'],
        photo: '/photos/poi-dolina-bedkowska-nietoperzowa.jpg',
        photoCredit: 'Fot. Jakub Hałun · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.774532, 50.19395],
        radius: 45,
      },
      {
        id: 'dupa-slonia',
        category: 'climb',
        name: 'Dupa Słonia',
        teaser: 'Skała wspinaczkowa z nazwą, której nikt nie zapomina.',
        description: [
          'Nad Brandysową Polaną, kilkadziesiąt metrów od wodospadu, stoi skała o nazwie, która mówi wszystko o tym, jak wspinacze nazywają rzeczy: opisowo i bez ceremonii.',
          'Cała ta część doliny jest rejonem wspinaczkowym, a polana pod skałami służy jako baza. W pogodny weekend jest tu więcej lin niż ludzi na szlaku.',
        ],
        findHint: 'Skała nad Brandysową Polaną, zaraz przy wodospadzie Szum.',
        reveal:
          'Nazwy skał w tej dolinie wymyślali wspinacze i to widać: obok Dupy Słonia stoją Dupeczka i Babka, a dalej Czarcia Grań, Czarcie Wrota, Czarci Korytarz, Hades i Forteca. Cały diabelski kąt w jednej dolinie.',
        photo: '/photos/poi-dolina-bedkowska-dupa-slonia.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.743373, 50.175866],
        radius: 35,
      },
      {
        id: 'zrodlo-bedkowki',
        category: 'water',
        name: 'Źródło Będkówki',
        teaser: 'Miejsce, w którym zaczyna się potok, który wyżłobił całą dolinę.',
        description: [
          'Będkówka spływa z Wyżyny Olkuskiej do Rowu Krzeszowickiego i to ona zrobiła tę dolinę: siedem do ośmiu kilometrów, jedną z najdłuższych na Wyżynie Krakowsko-Częstochowskiej.',
          'Źródło jest zwykle niepozorne. Cała robota jest niewidoczna: dzieje się pod ziemią, w wapieniu, i trwa dłużej niż wszystko, co ma imię.',
        ],
        findHint: 'Dno doliny, powyżej Będkowic. Woda wychodzi przy ścieżce.',
        reveal:
          'Dolina Będkowska ciągnie się od obniżenia przy drodze krajowej z Krakowa do Olkusza aż do przysiółka Łączki. Wszystko to jest dzieło jednego potoku.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_B%C4%99dkowska'],
        coords: [19.753531, 50.181715],
        radius: 35,
      },
      {
        id: 'laczki',
        category: 'cave',
        name: 'Schroniska w Łączkach',
        teaser: 'Trzy skalne schroniska przy dolnym wylocie doliny.',
        description: [
          'Dolina kończy się w przysiółku Łączki, a przy jej wylocie, w skałach, otwierają się trzy niewielkie schroniska, oznaczone po prostu numerami.',
          'Takie schronisko to nie jaskinia z korytarzami, a wnęka wygryziona przez wodę w wapieniu. Dawniej pod nimi koczowano, bo dawały dach bez budowania go.',
        ],
        findHint: 'Dolny wylot doliny, po stronie Łączek. Otwory w skale kilka metrów nad ścieżką.',
        reveal:
          'W Dolinie Będkowskiej takich schronisk i jaskiń jest kilkadziesiąt. Nazwane są tylko te, które ktoś zmierzył i opisał.',
        photo: '/photos/poi-dolina-bedkowska-laczki.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.738284, 50.14893],
        radius: 40,
      },
      {
        id: 'wielka-turnia',
        category: 'climb',
        name: 'Grupa Wielkiej Turni',
        teaser: 'Drugie piętro wspinaczki w tej dolinie, a w skale obok pięciometrowy tunel na przejście.',
        description: [
          'Górna część doliny ma własny zespół skał, mniej znany od Sokolicy, a wcale nie mały. Wielka Turnia ma czterdzieści pięć metrów wysokości i pięćdziesiąt pięć dróg wspinaczkowych, w tym wielowyciągowe, czyli takie, na których zatrzymujesz się w połowie ściany i zaczynasz od nowa. Sąsiedni Średnik ma pięćdziesiąt metrów i dwanaście dróg.',
          'Wokół stoją mniejsze skały z nazwami, które wymyślili wspinacze: Mur Skwirczyńskiego, Dwie Wieże, Fraszka, Jebel, Misiaczek, Kurtyna. Każda ma swoje drogi i swoją trudność, od trzeciej po szóstą z plusami.',
          'W skale przy ścieżce jest Tunel pośredni w Wielkiej Skale: pięć metrów przejścia na wylot. Nie jest to jaskinia z przewodnikiem, tylko dziura, przez którą się przechodzi, i właśnie dlatego dzieci wracają do niej trzy razy.',
        ],
        findHint:
          'Górna część doliny, powyżej źródła Będkówki, przy ścieżce w stronę Bębła. Ściany widać z drogi, tunel jest w skale bliżej ścieżki.',
        reveal:
          'Wielowyciągowych dróg poza Tatrami jest w Polsce niewiele, a dwie z nich są tutaj, obok siebie: na Wielkiej Turni i na Średniku. Wspinacz spędza na tej ścianie więcej czasu niż ty na całym spacerze doliną.',
        dilemma: {
          question:
            'Skały mają nazwy nadane przez wspinaczy, nie przez mieszkańców. Czyja nazwa jest prawdziwa?',
          options: ['Tego, kto tu chodzi', 'Tego, kto tu mieszka', 'Obie, bo o innym mówią'],
          counterpoint:
            'Nazwa wspinaczkowa opisuje drogę, nie miejsce: mówi, gdzie zaczepić linę, i tylko dlatego przetrwała w przewodnikach. Nazwa gospodarska mówi, gdzie pasły się krowy. Jedna trafia do map, druga do pamięci, i żadna nie jest pełna.',
        },
        sources: [
          'OpenStreetMap: Wielka Turnia (45 m, 55 dróg), Średnik (50 m, 12 dróg), Mur Skwirczyńskiego (25 m, 21 dróg), Tunel pośredni w Wielkiej Skale (długość 5 m, J.Olk.I-07.42)',
          'topo.wspinka.org, grupa Wielkiej Turni',
        ],
        coords: [19.76959, 50.18942],
        radius: 90,
      },
      {
        id: 'labajowa',
        category: 'cave',
        name: 'Jaskinia Łabajowa',
        teaser: 'Jaskinia bez biletu i bez przewodnika, dwieście metrów od tej z biletem.',
        description: [
          'Nietoperzowa jest udostępniona: kasa, przewodnik, oświetlenie i godziny otwarcia. Łabajowa leży obok i nie ma nic z tych rzeczy. Wchodzisz z własną latarką albo nie wchodzisz wcale.',
          'To jedna z jaskiń, które wymienia się przy tej dolinie razem z Nietoperzową, tylko że w milczeniu: bez tablicy, bez opisu na miejscu, bez ścieżki, która by cię tam prowadziła za rękę.',
          'Dwie jaskinie dwieście metrów od siebie, a dwa różne sposoby zwiedzania. Jedna uczy, druga pozwala się bać.',
        ],
        findHint:
          'Górna część doliny, w skale Łabajowej, na zachód od Jaskini Nietoperzowej. Otwór jest w zboczu, bez tablicy.',
        reveal:
          'Jaskinia bez oświetlenia jest ciemna inaczej niż wszystko, co znasz z domu: po dwudziestu metrach oko przestaje się przyzwyczajać, bo nie ma do czego. To jedno z niewielu miejsc, w których można tego doświadczyć bez wyprawy w Tatry.',
        dilemma: {
          question:
            'Czy jaskinia bez przewodnika i bez oświetlenia powinna zostać otwarta dla każdego?',
          options: ['Tak, na własną odpowiedzialność', 'Nie, to prosi się o wypadek', 'Tak, ale z ostrzeżeniem'],
          counterpoint:
            'Zamknięcie chroni ludzi i nietoperze, ale zabiera jedyną rzecz, której udostępniona jaskinia dać nie może: wrażenie, że jesteś tam pierwszy. Otwarcie zostawia je w cenie potłuczonych kolan i zniszczonych nacieków.',
        },
        sources: [
          'Wikipedia: Dolina Będkowska, jaskinie doliny',
          'sktj.pl, opis Jaskini Łabajowej',
          'OpenStreetMap: Jaskinia Łabajowa',
        ],
        photo: '/photos/poi-dolina-bedkowska-labajowa.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.77273, 50.1906],
        radius: 60,
      },
      {
        id: 'stawy-pstragowe',
        category: 'water',
        name: 'Stawy pstrągowe',
        teaser: 'Stawy z pstrągami w dolnej części doliny, do popatrzenia i do zjedzenia.',
        description: [
          'Będkówka jest zimna, czysta i szybka, czyli dokładnie taka, jakiej potrzebuje pstrąg. Dlatego w dolnej części doliny stoi gospodarstwo rybackie z kilkoma stawami, w których ryby widać z brzegu bez żadnego sprzętu.',
          'Dla dziecka to najprostszy punkt w całej dolinie: woda, ryby i chleb. Dla dorosłego to dowód, jak czysta jest ta rzeka, bo pstrąg nie żyje w wodzie, która jest tylko trochę zanieczyszczona.',
          'Na miejscu jest też kuchnia, otwarta od dziewiątej do osiemnastej. Zamawianie ryby dwa kroki od stawu, w którym pływa, jest doświadczeniem osobnym i nie każdemu wychodzi na dobre.',
        ],
        findHint:
          'Dolna część doliny, przy drodze wzdłuż Będkówki, poniżej schronisk w Łączkach. Stawy widać z drogi.',
        reveal:
          'Pstrąg potrzebuje wody z dużą ilością tlenu i temperaturą poniżej dwudziestu stopni. Hodowla w tym miejscu jest więc świadectwem stanu rzeki: gdyby Będkówka się ociepliła albo zamuliła, gospodarstwo przestałoby istnieć.',
        dilemma: {
          question: 'Hodowla ryb w dolinie krajobrazowej: gospodarka czy ochrona?',
          options: ['Gospodarka, bo to hodowla', 'Ochrona, bo pilnuje wody', 'Jedno i drugie naraz'],
          counterpoint:
            'Ten, kto ma z rzeki pieniądze, ma też powód, żeby jej pilnować, i to działa lepiej niż wiele zakazów. Ale hodowla pobiera wodę i zwraca ją cieplejszą, więc ta sama rzeka jest tu chroniona i obciążana przez tego samego właściciela.',
        },
        sources: [
          'Wikipedia: Dolina Będkowska, stawy rybne z hodowlą pstrągów',
          'OpenStreetMap: Gospodarstwo rybackie Dolina Będkowska, stawy aquaculture=fish',
        ],
        coords: [19.73881, 50.15671],
        radius: 90,
      },
    ],
  },
  {
    parkId: 'dolina-raclawki',
    // 9 km i 474 ha, czyli najwieksze miejsce w calej apce
    stampAt: 3,
    pois: [
      {
        id: 'zamczysko',
        category: 'view',
        name: 'Zamczysko',
        teaser: 'Wzniesienie nad doliną, na którym coś stało, choć nie wiadomo dokładnie co.',
        description: [
          'W zboczach Doliny Racławki wznosi się kilka wzniesień: Komarówka, Widoma i Zamczysko. To ostatnie ma w nazwie zamek, a niedaleko leżą ruiny, które ludzie nazywają tak samo.',
          'Dolina jest tu krótka na spojrzenie i długa na nogi: ma dziewięć kilometrów krętego przebiegu i opada z północy na południe. Z Zamczyska widać, jak się wije.',
        ],
        findHint: 'Zbocze w środkowej części doliny, ścieżka w górę od dna.',
        reveal:
          'Wylot Doliny Racławki spotyka się w Dubiu z wylotem Doliny Szklarki, na wysokości około 275 metrów. Dwie doliny kończą się w jednym miejscu.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Rac%C5%82awki'],
        photo: '/photos/poi-dolina-raclawki-zamczysko.jpg',
        photoCredit: 'Fot. 13piotrek · CC BY 3.0 · Wikimedia Commons',
        coords: [19.683741, 50.163543],
        radius: 50,
      },
      {
        id: 'jaskinia-zarska',
        category: 'cave',
        name: 'Jaskinia Żarska',
        teaser: 'Zimna Grota Żarska w Wąwozie Żarskim, na końcu ścieżki edukacyjnej.',
        description: [
          'Jaskinia Żarska, zwana też Schroniskiem Żarskim Dużym albo Zimną Grotą Żarską, leży w Wąwozie Żarskim, jednym z kilku wąwozów wcinających się w zbocza Racławki.',
          'Prowadzi do niej ścieżka edukacyjna, więc to jedno z niewielu miejsc w naszych dolinach, gdzie ktoś przygotował drogę i opisał, co się po niej mija.',
          'Nazwa Zimna Grota nie jest poetycka. W jaskini trzyma się temperatura, która w lecie wydaje się lodowata.',
        ],
        findHint: 'Wąwóz Żarski, po wschodniej stronie doliny. Ścieżka edukacyjna prowadzi pod samo wejście.',
        reveal:
          'Do jaskini prowadzi ścieżka edukacyjna z numerowanymi przystankami. Ten wąwóz jest jej drugim przystankiem.',
        sources: ['https://pl.wikipedia.org/wiki/Jaskinia_%C5%BBarska'],
        photo: '/photos/poi-dolina-raclawki-jaskinia-zarska.jpg',
        photoCredit: 'Fot. Paweł Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.70363, 50.164977],
        radius: 40,
      },
      {
        id: 'lom-pisarski',
        category: 'history',
        name: 'Łom Pisarski',
        teaser: 'Stary kamieniołom, w którym widać cztery epoki geologiczne naraz.',
        description: [
          'Łom Pisarski to dawny kamieniołom i jeden z przystanków ścieżki edukacyjnej. Odsłonił coś, czego nie zobaczyłbyś w nietkniętym zboczu: warstwy skał ułożone jedna na drugiej.',
          'Dolina Racławki ma skomplikowaną budowę: wyżłobiona jest w wapieniach z dewonu, karbonu i górnej jury, a między nimi leżą pokłady piaskowców. To rzadkość, żeby na dziewięciu kilometrach spotkać tak różne epoki.',
          'Kamieniołom, który zwykle jest raną w krajobrazie, tutaj pełni rolę podręcznika.',
        ],
        findHint: 'Zachodnia strona doliny, przy ścieżce edukacyjnej. Przystanek numer 5.',
        reveal:
          'Skały tej doliny pochodzą z dewonu, karbonu i górnej jury, czyli z przedziału ponad trzystu milionów lat. W jednym kamieniołomie widać kilka z nich.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Rac%C5%82awki'],
        photo: '/photos/poi-dolina-raclawki-lom-pisarski.jpg',
        photoCredit: 'Fot. ARKADIUSZ MARKIEWICZ · CC BY-SA 3.0 · Wikimedia Commons',
        coords: [19.685259, 50.164414],
        radius: 40,
      },
      {
        id: 'martwica',
        category: 'nature',
        name: 'Martwica wapienna',
        teaser: 'Skała, którą zrobiły rośliny. Przystanek ścieżki edukacyjnej.',
        description: [
          'Martwica wapienna powstaje tam, gdzie woda bogata w wapń przepływa po mchach i wątrobowcach. Rośliny obrastają nurt, woda odkłada na nich wapń, a po roślinach zostaje kamień w ich kształcie.',
          'To ta sama skała, z której zbudowany jest próg wodospadu Szum w Dolinie Będkowskiej. Ten sam mechanizm, dwie doliny obok siebie.',
        ],
        findHint: 'Przystanek numer 5 ścieżki edukacyjnej w dolnej części doliny.',
        reveal:
          'Martwica rośnie milimetry na dekadę i zapisuje w sobie kształt roślin, na których się osadziła. To skała, która była kiedyś mchem.',
        coords: [19.684894, 50.168251],
        radius: 35,
      },
      {
        id: 'zrodlo-bazana',
        category: 'water',
        name: 'Źródło Bażana',
        teaser: 'Przystanek dziesiąty: woda wychodząca u wylotu Wąwozu Stradlina.',
        description: [
          'Źródło Bażana leży w górnej części doliny, przy wylocie Wąwozu Stradlina. Ścieżka edukacyjna traktuje je jako osobny przystanek, bo źródła w wapieniu są tu regułą, a nie wyjątkiem.',
          'Górna, bezleśna część doliny wygląda inaczej niż dolna: więcej nieba, mniej cienia i widać, skąd bierze się woda, która niżej rzeźbi wąwozy.',
        ],
        findHint: 'Górna część doliny, przy wylocie Wąwozu Stradlina. Przystanek numer 10.',
        reveal:
          'W zbocza Racławki wcina się kilka wąwozów: Stradlina, Żółtczany Dół, Żarnówczany Dół, Wąwóz Żarski i Zbrza. Każdy ma swoje źródła.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Rac%C5%82awki'],
        coords: [19.675727, 50.174174],
        radius: 40,
      },
    ],
  },
  {
    parkId: 'dolina-eliaszowki',
    stampAt: 3,
    pois: [
      {
        id: 'zrodlo-eliasza',
        category: 'water',
        name: 'Źródło świętego Eliasza',
        teaser: 'Źródło z imieniem proroka, w dolinie karmelitów.',
        description: [
          'Dolina Eliaszówki ciągnie się między Czerną a Paczółtowicami, a u jej wylotu stoi klasztor karmelitów bosych. To karmelici nazwali tutejsze źródła: świętego Eliasza, świętego Elizeusza, świętego Józefa.',
          'Eliasz jest dla karmelitów postacią założycielską, prorokiem z góry Karmel. Dolina nosi jego imię i to samo imię nosi płynący nią potok.',
          'Woda w wapieniu jest tu wszędzie, ale tylko tutaj każde źródło ma patrona.',
        ],
        findHint: 'Wschodnia część doliny, przy ścieżce. Obok tablica rezerwatu.',
        reveal:
          'Klasztor w Czernej jest podwójnym sanktuarium: Matki Bożej Szkaplerznej i świętego Rafała Kalinowskiego. Doliną chodzili pustelnicy, stąd nazwy źródeł.',
        sources: ['https://pl.wikipedia.org/wiki/Klasztor_Karmelit%C3%B3w_Bosych_w_Czernej'],
        photo: '/photos/poi-dolina-eliaszowki-zrodlo-eliasza.jpg',
        photoCredit: 'Fot. Kgbo · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.639918, 50.172953],
        radius: 35,
      },
      {
        id: 'sw-antoni',
        category: 'monument',
        name: 'Kapliczka świętego Antoniego',
        teaser: 'Jedna z kapliczek, które wyznaczają drogę doliną.',
        description: [
          'W dolinie stoi kilka kapliczek, między innymi świętego Antoniego i świętego Eliasza Proroka Karmelu. Nie są ozdobą krajobrazu, a jego znakami drogowymi: mówią, gdzie się zatrzymać.',
          'Ta dolina jest z tego zrobiona. Klasztor u wylotu, pustelnie w zboczach, źródła z patronami i kapliczki po drodze. Krajobraz, który został urządzony przez modlitwę, a nie przez turystykę.',
        ],
        findHint: 'Przy ścieżce w górnej części doliny.',
        reveal:
          'Nazwy w tej dolinie nadał zakon, nie wspinacze. To jedyna z Dolinek Krakowskich, w której skały nie mają śmiesznych imion.',
        coords: [19.639304, 50.174179],
        radius: 30,
      },
      {
        id: 'sknercza',
        category: 'cave',
        name: 'Jaskinia Sknercza',
        teaser: 'Niewielka jaskinia w zboczu, z nazwą, która brzmi jak zarzut.',
        description: [
          'Sknercza jest jedną z jaskiń tej doliny. Wapień jest tu przewiercony na wylot: część otworów ma nazwy, większość nie ma nic.',
          'Karmelici mieszkali w tych zboczach jako pustelnicy. Nie w tej konkretnej jaskini, ale w takim właśnie krajobrazie: skała, woda, cisza i klasztor na dole.',
        ],
        findHint: 'Zbocze w środkowej części doliny, otwór nad ścieżką.',
        reveal:
          'Dolina Eliaszówki jest najbardziej zabytkową z Dolinek: w promieniu kilkuset metrów mieszczą się ruiny mostów, dawna furta klasztorna i kilkadziesiąt obiektów historycznych.',
        coords: [19.633557, 50.170645],
        radius: 30,
      },
      {
        id: 'siedem-progow',
        category: 'cave',
        name: 'Jaskinia za Siedmioma Progami',
        teaser: 'Nazwa jak z bajki, a chodzi o siedem skalnych stopni.',
        description: [
          'Jaskinia za Siedmioma Progami leży w górnej części doliny. Nazwa jest opisem drogi: żeby do niej dojść, mija się kolejne skalne stopnie w dnie wąwozu.',
          'Progi w tych dolinach to zwykle martwica wapienna, ta sama skała, którą osadziły mchy nad wodą. Idziesz więc po stopniach, które wyhodowała roślina.',
        ],
        findHint: 'Górna część doliny, powyżej kapliczek. Trzeba iść wąwozem w górę.',
        reveal:
          'Progi w dnie tych dolin nie są wykute ani ułożone. To osad, który woda odłożyła na mchach i wątrobowcach przez tysiące lat.',
        coords: [19.636159, 50.175],
        radius: 35,
      },
    ],
  },
  {
    parkId: 'dolina-szklarki',
    // trzy punkty na dziewieciokilometrowej dolinie, wiec dwa wystarcza na pieczatke
    stampAt: 2,
    pois: [
      {
        id: 'brodlo',
        category: 'climb',
        name: 'Brodło',
        teaser: 'Największy ostaniec doliny, widoczny z drogi.',
        description: [
          'Brodło jest największym z ostańców wierzchowinowych Doliny Szklarki. Ostaniec to skała, która została, gdy wszystko wokół niej zostało rozpuszczone i zabrane przez wodę.',
          'W tej dolinie takich skał jest więcej: Witkowe Skały, Łyse Skały, Chochołowe Skały, Cisówki, Kozłowe Skały. Na części z nich wspinają się wspinacze.',
          'Uczciwie: dnem tej doliny biegnie asfaltowa droga i jest ona częściowo zabudowana. To najbardziej oswojona z naszych dolin, ale zbocza i skały nadrabiają.',
        ],
        findHint: 'Skała widoczna z drogi biegnącej dnem doliny, w jej dolnej części.',
        reveal:
          'Dolina Szklarki ma około dziewięciu kilometrów i ciągnie się od Jerzmanowic przez Szklary do Dubia, gdzie jej wylot spotyka się z wylotem Doliny Racławki.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Szklarki'],
        photo: '/photos/poi-dolina-szklarki-brodlo.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.717043, 50.17755],
        radius: 45,
      },
      {
        id: 'bukowe-skaly',
        category: 'nature',
        name: 'Bukowe Skały',
        teaser: 'Wapienne skałki w zboczu, w cieniu buczyny.',
        description: [
          'Zbocza Doliny Szklarki są zalesione i pełne wapiennych skałek. Bukowe Skały noszą nazwę od tego, co je otacza, a nie od tego, jak wyglądają.',
          'Dolina jest fragmentem Parku Krajobrazowego Dolinki Krakowskie i mimo asfaltu w dnie ma wszystko, co reszta: potok w wapieniu, skały w zboczach i ciszę kilka metrów od drogi.',
        ],
        findHint: 'Zbocze doliny, ścieżka w górę spod drogi.',
        reveal:
          'Potok Szklarka uchodzi do Racławki. Te dwie doliny są parą: kończą się w tym samym miejscu, w Dubiu.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Szklarki'],
        photo: '/photos/poi-dolina-szklarki-bukowe-skaly.jpg',
        photoCredit: 'Fot. Jvaclavik · CC0 · Wikimedia Commons',
        coords: [19.721044, 50.194597],
        radius: 70,
      },
      {
        id: 'zrodlo-pioro',
        category: 'water',
        name: 'Źródło Pióro',
        teaser: 'Woda wychodząca z wapienia w górnej części doliny.',
        description: [
          'Źródło Pióro leży w górnym odcinku doliny, po stronie Jerzmanowic. Nazwa jest stara i nikt już nie wie, od czego dokładnie pochodzi.',
          'Źródła są tu głównym bohaterem, choć najmniej efektownym. To one, kropla po kropli, zrobiły w płaskiej wyżynie dziewięć kilometrów doliny.',
        ],
        findHint: 'Górna część doliny, przy ścieżce w dnie.',
        reveal:
          'Dolinki Krakowskie to osiem dolin i wszystkie mają ten sam mechanizm: woda plus wapień plus czas. Różnią się tym, co po drodze zdążył postawić człowiek.',
        photo: '/photos/poi-dolina-szklarki-zrodlo-pioro.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [19.729485, 50.197518],
        radius: 35,
      },
    ],
  },
  {
    /* Mnikowska leży osobno od reszty Dolinek, 17 km na zachód od Rynku
       i po drugiej stronie autostrady, w Tenczyńskim Parku Krajobrazowym.
       Trafia tutaj, bo mechanizm ma ten sam: woda, wapień i czas. */
    parkId: 'mnikowska',
    stampAt: 3,
    pois: [
      {
        id: 'matka-boska',
        category: 'monument',
        name: 'Matka Boska Skalska',
        teaser: 'Pięciometrowy obraz namalowany wprost na skale, w roku powstania styczniowego.',
        description: [
          'W zakolu doliny, które nazywa się Cyrk, ściana cofa się i robi naturalną niszę. W tej niszy, prosto na wapieniu, namalowano pięciometrowy wizerunek Matki Boskiej. Miejscowi mówią na nią Matka Boska Skalska.',
          'Obraz powstał w 1863 roku, czyli w roku wybuchu powstania styczniowego, kilkanaście kilometrów od granicy zaboru rosyjskiego. Przed niszą zbudowano ołtarz i do dziś odprawia się tu msze pod gołym niebem.',
          'Malowidło na skale nie ma jak przetrwać samo. Deszcz i mróz zrobiły swoje: oryginał zniszczał, został odmalowany nieudolnie, potem odtworzony, a porządną renowację przeszedł dopiero w 2011 roku.',
        ],
        findHint:
          'Środkowa część doliny, po południowej stronie. Szukaj miejsca, gdzie ściana się rozstępuje w półkole. Prowadzą tam schody, a przed niszą stoi ołtarz i stacje drogi krzyżowej.',
        reveal:
          'Prawie wszędzie przeczytasz, że obraz namalował Walery Eljasz Radzikowski, malarz i taternik. Nowsze ustalenia wskazują na kogo innego: Izydora Jabłońskiego. Podpisu na skale nie ma, więc autorstwo wędrowało z ust do ust przez sto sześćdziesiąt lat i po drodze przykleiło się do bardziej znanego nazwiska.',
        dilemma: {
          question:
            'To rezerwat przyrody nieożywionej, a na jego głównej ścianie jest pięciometrowy obraz. Gdyby ktoś chciał namalować go dzisiaj, powinien dostać zgodę?',
          options: [
            'Nie, skała ma zostać skałą',
            'Tak, to już tradycja tego miejsca',
            'Nie dzisiaj, ale stary zostawić',
          ],
          counterpoint:
            'Malowanie po skałach w rezerwacie to dokładnie to, przed czym rezerwat ma chronić, a zgoda dla jednego otwiera drzwi kolejnym. Ale to właśnie ten obraz sprawił, że ludzie tu przyjeżdżają, pilnują doliny i wiedzą, jak się nazywa. Bez niego byłby to kolejny ładny wąwóz bez nazwiska.',
        },
        sources: [
          'https://pl.wikipedia.org/wiki/Dolina_Mnikowska',
          'https://dziennikpolski24.pl/niewlasciwa-matka-boska/ar/3037830',
        ],
        photo: '/photos/poi-mnikowska-matka-boska.jpg',
        photoCredit: 'Fot. Historia · CC BY 3.0 · Wikimedia Commons',
        coords: [19.70765, 50.06521],
        radius: 45,
      },
      {
        id: 'jaskinia',
        category: 'cave',
        name: 'Jaskinia nad Matką Boską',
        teaser: 'Osiemdziesiąt metrów korytarzy, a w środku znaleziono ludzkie kości.',
        description: [
          'Tuż nad niszą z obrazem jest otwór jaskini. Ma około osiemdziesięciu metrów korytarzy, co jak na Dolinki jest sporo, i drugie imię: Jaskinia doktora Mayera.',
          'W 1881 roku zbadał ją Gotfryd Ossowski, jeden z pierwszych polskich archeologów zajmujących się jaskiniami. Znalazł w środku kości zwierząt i kości ludzkie.',
          'W całej dolinie jest kilkanaście jaskiń i schronisk skalnych, a w części z nich są ślady obecności człowieka sprzed tysięcy lat. Wapień robi jamy, jamy robią dach nad głową.',
        ],
        findHint:
          'Nad niszą z obrazem, po tej samej stronie doliny. Wejście jest wyżej niż ścieżka, więc łatwo je minąć, patrząc pod nogi.',
        reveal:
          'Kolejność zdarzeń w tym jednym miejscu jest nie do pobicia. Najpierw jaskinia była schronieniem, potem grobem, potem obiektem badań archeologa, a na końcu ktoś namalował pod nią ołtarz. Ludzie wracają tu od tysięcy lat, tylko za każdym razem po coś innego.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Mnikowska'],
        coords: [19.70776, 50.06534],
        radius: 40,
      },
      {
        id: 'sciany',
        category: 'view',
        name: 'Ściany Cyrku',
        teaser: 'Osiemdziesiąt metrów pionu, wycięte przez rzeczkę, którą przeskoczysz.',
        description: [
          'Ściany doliny mają w najwyższych miejscach około osiemdziesięciu metrów. To wapienie jurajskie, ta sama skała co w całej Jurze, licząca około stu pięćdziesięciu milionów lat.',
          'Autorem wąwozu jest Sanka, czyli strumień, który płynie dnem i którego w wielu miejscach nie zauważysz, dopóki go nie usłyszysz. Woda przebiła się przez wapień i wynosiła go stąd ziarno po ziarnie.',
          'Dolina bywa nazywana małym Ojcowem i to nie jest przesada marketingowa: skalne bramy, iglice i urwiska są tu na dwóch kilometrach.',
        ],
        findHint: 'Dno doliny, w połowie długości. Zadrzyj głowę.',
        reveal:
          'Ten wąwóz jest wynikiem prostego rachunku: mały strumień razy bardzo dużo czasu. Gdyby Sanka pogłębiała dolinę o jeden milimetr rocznie, osiemdziesiąt metrów zajęłoby jej osiemdziesiąt tysięcy lat, czyli chwilę jak na wiek tych skał. W praktyce szło jej wolniej, a i tak zdążyła.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Mnikowska'],
        coords: [19.70630, 50.06673],
        radius: 60,
      },
      {
        id: 'zrodlo',
        category: 'water',
        name: 'Źródło w dolinie',
        teaser: 'Woda wychodzi tu z wapienia po podróży, której nie widać z powierzchni.',
        description: [
          'W zachodniej części doliny bije źródło. Stoi przy nim tablica, więc trudno je przegapić.',
          'W wapieniu woda nie płynie po powierzchni, tylko wsiąka i wędruje szczelinami pod ziemią, czasem kilometrami. Źródło to miejsce, w którym ta podziemna droga wychodzi z powrotem na światło.',
        ],
        findHint: 'Zachodnia część doliny, przy ścieżce. Obok stoi tablica informacyjna.',
        reveal:
          'To samo, co drąży jaskinie, robi też źródła. Woda z opadów rozpuszcza wapień, poszerza szczeliny w podziemne korytarze i tymi korytarzami płynie. Jaskinia nad obrazem i to źródło to dwa końce jednego procesu: jeden pusty, drugi z wodą.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Mnikowska'],
        coords: [19.7051, 50.06737],
        radius: 40,
      },
      {
        id: 'rosliny',
        category: 'meadow',
        name: 'Siedemnaście gatunków pod ochroną',
        teaser: 'Na tych zboczach rośnie obuwik, czyli największy dziki storczyk w Polsce.',
        description: [
          'Rezerwat utworzono w 1963 roku na niecałych dwudziestu jeden hektarach i chroni się tu nie tylko skały. Rośnie tutaj siedemnaście gatunków roślin objętych ochroną, między innymi obuwik pospolity, konwalia i naparstnica.',
          'Obuwik to nasz największy dziki storczyk, z żółtym kwiatem w kształcie pantofelka. Kwitnie krótko, na przełomie maja i czerwca, i jest rzadki, bo potrzebuje dokładnie takich warunków jak tutaj: wapiennego podłoża i widnego lasu.',
          'Najlepszy moment na dolinę to wczesna wiosna, kiedy dno lasu zakwita całe, zanim drzewa zdążą je zacienić.',
        ],
        findHint:
          'Zbocza i widne fragmenty lasu wzdłuż doliny. Nic nie zrywaj i nie schodź ze ścieżki, tu prawie wszystko jest pod ochroną.',
        reveal:
          'Storczyki nie mają zapasów w nasionach i bez pomocy grzybów w glebie nie wykiełkują. Obuwik potrafi też pierwsze lata przesiedzieć całkowicie pod ziemią, żywiąc się przez grzyb, i dopiero potem wypuścić liście. Kwiatu doczekasz się po kilkunastu latach od nasiona, więc każdy okaz, który tu widzisz, jest starszy niż większość drzew dookoła.',
        sources: ['https://pl.wikipedia.org/wiki/Dolina_Mnikowska'],
        coords: [19.70892, 50.06557],
        radius: 55,
      },
    ],
  },
]
