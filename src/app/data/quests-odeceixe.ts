// Wyprawa tymczasowa: Odeceixe, Costa Vicentina (Portugalia).
//
// Temat: MORZE, KTÓRE ODESZŁO. Cała wyprawa jest jednym pytaniem: dlaczego
// z wioski na plażę idzie się cztery kilometry. Odpowiedź leży w kopcu muszli
// nad doliną i rozwija się punkt po punkcie, od mostu przez muszlowisko aż po
// punkt widokowy, z którego widać zamuloną dolinę na własne oczy.
//
// Współrzędne: węzły OSM ze skanu Overpass w promieniu 5 km od wsi
// (2026-08-28), nie z oka. Promienie większe niż w Krakowie, bo to teren
// otwarty i nikt tu nie stoi między kamienicami.
//
// Fakty: portugalska Wikipedia, Atlas do Sudoeste Português (baza dziedzictwa
// archeologicznego regionu) i OSM. Linki w `sources` przy każdym punkcie.
// Tam, gdzie podaję interpretację badaczy zamiast twardego ustalenia, mówię
// to wprost w tekście: to wyprawa o czytaniu śladów, więc różnica między
// „wiemy" a „tak to tłumaczymy" jest tu częścią treści, nie drobiazgiem.

import type { Quest } from './quests'

export const ODECEIXE_QUESTS: Quest[] = [
  {
    parkId: 'odeceixe-vila',
    /* muszlowisko leży 800 m za wsią, więc pieczątka nie może go wymagać
       od kogoś, kto wpadł na kawę: trzy punkty wystarczą */
    stampAt: 3,
    pois: [
      {
        id: 'ponte-seixe',
        category: 'water',
        name: 'Most graniczny',
        teaser: 'Jeden most, dwie prowincje i nazwa wsi, która jest zdaniem w dwóch językach.',
        description: [
          'Rzeka pod tym mostem nazywa się Seixe i robi w tym miejscu coś więcej niż płynie: wyznacza granicę między Algarve a Alentejo. Odeceixe leży na południowym brzegu, więc jest pierwszą algarvijską wsią, jaką spotyka ktoś idący wybrzeżem z północy.',
          'Nazwa wsi też jest graniczna, tylko w innym sensie. Przedrostek „Ode" w toponimach Algarve to arabskie wād, czyli rzeka albo dolina. To samo słowo, które w Hiszpanii dało Guadalquivir i Guadianę. Odeceixe znaczy więc mniej więcej „rzeka Seixe": pierwsza połowa po arabsku, druga po portugalsku.',
          'Osiem wieków muzułmańskiej obecności na tym wybrzeżu zostawiło po sobie mniej murów niż nazw. Budynki przechodziły z rąk do rąk i były przebudowywane, a nazwy rzek przetrwały, bo ludzie musieli jakoś mówić, dokąd idą po wodę.',
        ],
        findHint:
          'Most drogi krajowej EN 120, kilkaset metrów na północ od centrum wsi. Stań przy barierce i spójrz w dół rzeki, w stronę oceanu.',
        reveal:
          'Przechodząc tym mostem zmieniasz prowincję: północny brzeg to już Alentejo, południowy to Algarve. Granica biegnie środkiem wody, którą widzisz pod sobą. A nazwa wsi jest zapisem po dwóch cywilizacjach naraz: arabskie wād, czyli rzeka, plus portugalskie Seixe. Ta granica nie jest zresztą pomysłem nowoczesnej administracji: kilometr w górę doliny stoją resztki wieży z dwunastego wieku, która pilnowała tego przejścia, a potem pobierała tu myto.',
        dilemma: {
          question:
            'Granicę poprowadzono rzeką. Rzeka jest jednak tym, co obie strony łączy: ta sama woda, te same ryby, ten sam most, po którym się chodzi do sąsiada. Co właściwie robi rzeka na mapie?',
          options: ['Dzieli, i słusznie', 'Łączy, granica to sztuczność', 'Jedno i drugie naraz'],
          counterpoint:
            'Granice na rzekach są wygodne dla kartografa i kłopotliwe dla mieszkańca. Woda jest widoczna z daleka i trudno się o nią spierać, więc urzędy ją lubią. Ale rzeka to także jedyna droga, przy której opłacało się mieszkać, więc ludzie osiedlali się po obu stronach i traktowali ją jak wspólne podwórko. Odeceixe do dziś ma na drugim brzegu pola, do których jeździ się przez ten most, i mieszkańców, którzy formalnie żyją w innej prowincji.',
        },
        sources: ['https://en.wikipedia.org/wiki/Odeceixe'],
        coords: [-8.76549, 37.43445],
        radius: 45,
      },
      {
        id: 'torre',
        category: 'history',
        name: 'Wieża nad rzeką',
        teaser: 'Granica na tej rzece jest pilnowana od ośmiuset lat.',
        description: [
          'Nad doliną Seixe, kilometr od mostu, leżą resztki średniowiecznej wieży. Znaleziono ją dopiero w 1988 roku podczas prospekcji terenowej, a wykopaliska ruszyły w 2007.',
          'Główna budowla miała plan kolisty i wchodziła w skład obwodu murowanego z małymi pomieszczeniami, prawdopodobnie dla załogi. Znalezione przedmioty datują się na dwunasty i trzynasty wiek. Obok są jeszcze ślady drugiej wieży.',
          'Wieża należała do sieci fortyfikacji, która pilnowała tego skrawka wybrzeża przed nadchodzącymi wojskami. Archeolodzy zastanawiają się nawet, czy nie jest to nowy, nieopisany dotąd typ budowli obronnej.',
        ],
        findHint:
          'Zbocze nad rzeką po wschodniej stronie doliny, około kilometra w górę od mostu. To stanowisko archeologiczne, nie ruina do wejścia: szukaj resztek murów w trawie.',
        reveal:
          'Po chrześcijańskim podboju wieża dostała nowe zadanie: prawdopodobnie pobierano tu myto, zanim ją porzucono na dobre. To znaczy, że granica, którą dziś wyznacza rzeka pod mostem, była tu pilnowana i opłacana już osiemset lat temu, tylko wtedy nie dzieliła prowincji, a dwa różne światy.',
        dilemma: {
          question:
            'Wieża pilnowała granicy, potem brała myto, w końcu została porzucona. Dziś granica jest tylko linią na mapie, po której nikt nie pobiera opłat. Co się właściwie zmieniło?',
          options: ['Granice zmiękły', 'Zmienił się tylko sposób poboru', 'Granica przeniosła się dalej'],
          counterpoint:
            'Można powiedzieć, że nic: myto wciąż istnieje, tylko pobiera się je na autostradzie i w podatku, a nie przy brodzie. Ale różnica jest odczuwalna dla przechodnia: tę granicę przekracza się dziś na piechotę, nie zauważając, i to jest zmiana, o którą ludzie po obu stronach tej rzeki bili się przez kilka stuleci.',
        },
        sources: [
          'https://atlas.cimal.pt/drupal/?q=pt-pt%2Fnode%2F248',
          'https://www.academia.edu/1556971/Trabalhos_arqueol%C3%B3gicos_na_Torre_de_Odeceixe_Aljezur_Primeiros_resultados_2007_2009_',
        ],
        coords: [-8.75362, 37.42801],
        radius: 70,
      },
      {
        id: 'concheiro',
        category: 'history',
        name: 'Muszlowisko Montes de Baixo',
        teaser: 'Kopiec muszli sprzed pięciu tysięcy lat, w którym zapisało się cofające ujście.',
        description: [
          'Nad doliną, kawałek za wsią, leży stanowisko archeologiczne o nazwie Concheiro de Montes de Baixo. „Concheiro" to po portugalsku muszlowisko: miejsce, gdzie przez pokolenia wyrzucano skorupy po zjedzonych małżach i ślimakach morskich. Nikt tego nie usypał celowo. To kuchenne resztki, tyle że bardzo stare.',
          'Znaleziono tu ślady dwóch epok: mezolitu, czyli czasów łowców i zbieraczy, oraz chalkolitu, gdy w okolicy żyli już rolnicy. Datowanie węglowe wykonano na muszlach ślimaka Monodonta lineata, a warstwy ceramiki wskazują na pierwszą połowę trzeciego tysiąclecia przed naszą erą.',
          'I tu zaczyna się rzecz najciekawsza. Kości i muszle z warstwy mezolitycznej pochodzą z najbliższego sąsiedztwa obozu, z samej doliny. W warstwie chalkolitycznej te same rodzaje zdobyczy pochodzą już z miejsca oddalonego o dwa do dwóch i pół kilometra, przy ujściu rzeki. Ludzie mieszkali tam gdzie wcześniej, a po jedzenie musieli chodzić coraz dalej.',
          'Warto zauważyć, gdzie to leży: na północnym brzegu, czyli po stronie, która dziś nazywa się Alentejo. Pierwsi mieszkańcy tej doliny osiedlili się naprzeciwko miejsca, w którym stoi dzisiejsza wieś, a granica, którą wyznacza rzeka, jest od nich młodsza o kilka tysięcy lat.',
        ],
        findHint:
          'Po DRUGIEJ stronie rzeki, czyli już w Alentejo. Jedyne dojście prowadzi przez most drogi EN 120: z centrum wsi około pół godziny marszu, w sumie niecałe dwa kilometry. Stanowisko nie jest zagospodarowane, więc szukaj miejsca, nie tablicy.',
        reveal:
          'Ten kopiec to zapis przesuwającej się linii wody. Między jedną epoką a drugą droga po obiad wydłużyła się z kilkuset metrów do dwóch i pół kilometra. Najprostsze wyjaśnienie, jakie proponują badacze, jest takie, że rzeka wypełniła dolinę osadami i odsunęła ujście w stronę morza. Idąc dziś z wioski na plażę, powtarzasz dokładnie tę drogę, którą krajobraz komuś tutaj wydłużył.',
        dilemma: {
          question:
            'To stanowisko jest w istocie prehistorycznym śmietnikiem: kupą skorup po posiłkach. Dziś jest wpisane do rejestru dziedzictwa i chronione. Czy śmieci mogą być zabytkiem?',
          options: ['Tak, śmieci mówią najwięcej', 'Nie, zabytek to dzieło', 'Zależy, ile mają lat'],
          counterpoint:
            'Archeolodzy powiedzieliby, że śmietniki są najuczciwszym źródłem, jakie mamy. Grobowiec pokazuje, jak ludzie chcieli być zapamiętani, a odpadki pokazują, co naprawdę jedli, kiedy i skąd to brali. Z drugiej strony sama trwałość nie czyni jeszcze wartości: gdyby tak było, każde wysypisko wystarczyłoby zostawić na pięć tysięcy lat. Różnicę robi to, że tamtych ludzi nie ma już kogo zapytać.',
        },
        sources: ['https://atlas.cimal.pt/drupal/?q=pt-pt%2Fnode%2F315'],
        coords: [-8.78054, 37.43692],
        radius: 70,
      },
      {
        id: 'moinho',
        category: 'monument',
        name: 'Młyn wiatrowy',
        teaser: 'Zbudowany w 1898, dziś muzeum, w którym mielenie jest pokazem.',
        description: [
          'Biały młyn nad wsią postawiono w 1898 roku. To młyn typu śródziemnomorskiego, z okrągłą wieżą i płóciennymi skrzydłami, jakich stały tu kiedyś dziesiątki. Dzisiaj mieści się w nim mały oddział muzealny i można obejrzeć, jak wyglądało mielenie zboża, zanim mąkę zaczęto przywozić.',
          'Miejsce wybrano pod wiatr, ale skutek uboczny jest taki, że to najlepszy punkt widokowy w okolicy. Widać stąd całą wieś rozłożoną na zboczu i dolinę Ribeira de Seixe aż po miejsce, w którym rzeka znika za zakrętem w stronę oceanu.',
          'Według władz gminy Aljezur młyn odwiedza w sezonie letnim cztery do pięciu tysięcy osób rocznie. Jak na wieś, która ma niecały tysiąc mieszkańców, to spora publiczność dla jednego budynku.',
        ],
        findHint:
          'Najwyższy punkt wsi, biała wieża widoczna praktycznie zewsząd. Podejście wąskimi uliczkami w górę, kilka minut od centrum.',
        reveal:
          'Ten młyn jest ostatnim ogniwem długiego łańcucha: najpierw zbierano tu muszle w dolinie, potem uprawiano zboże na zboczach, a wiatr mielił je na mąkę dla wsi. Kiedy mąkę zaczęto przywozić, praca się skończyła. Młyn stoi dalej i dalej się kręci, tylko teraz mieli dla widzów.',
        dilemma: {
          question:
            'Młyn działa, ale nikt nie potrzebuje jego mąki. Zwiedzający patrzą na czynność, która straciła powód. Czy taki zabytek nadal pracuje, czy tylko udaje pracę?',
          options: ['Pracuje, uczy jak to było', 'Udaje, to inscenizacja', 'To nowa praca, nie ta sama'],
          counterpoint:
            'Można powiedzieć, że młyn dostał drugi zawód: kiedyś karmił wieś mąką, dziś karmi ją turystami, i w obu przypadkach jest źródłem utrzymania. Można też powiedzieć, że różnica jest zasadnicza, bo dawniej maszyna odpowiadała na potrzebę, a teraz potrzeba jest tworzona po to, by maszyna miała co robić. Obie odpowiedzi są uczciwe i obie dotyczą połowy portugalskich zabytków techniki.',
        },
        photo: '/photos/odeceixe-moinho-b.jpg',
        photoCredit: 'Fot. Geerd-Olaf Freyer · CC BY-SA 2.0 · Wikimedia Commons',
        sources: ['https://pt.wikipedia.org/wiki/Moinho_de_Vento_de_Odeceixe'],
        coords: [-8.7718, 37.43118],
        radius: 40,
      },
      {
        id: 'igreja',
        category: 'history',
        name: 'Kościół parafialny',
        teaser: 'Nossa Senhora da Piedade i srebrna korona starsza niż większość domów we wsi.',
        description: [
          'Igreja Matriz de Odeceixe jest poświęcony Nossa Senhora da Piedade, patronce wsi. Budowano go od początku czternastego do końca piętnastego wieku, a późniejsze rozbudowy dały mu dzisiejsze rozmiary.',
          'Wnętrze jest surowe: dwa ołtarze boczne i prezbiterium w stylu neoklasycznym. Najciekawszy element architektury to łuk tęczowy w stylu manuelińskim, czyli portugalskiej odmianie późnego gotyku, którą rozpoznaje się po morskich motywach: linach, węzłach i sferach.',
          'Dwa przedmioty w środku są warte uwagi bardziej niż mury. Korona Nossa Senhora da Piedade z kutego srebra powstała w latach 1564 i 1565. Srebrna monstrancja pochodzi z końca siedemnastego wieku.',
        ],
        findHint: 'W centrum wsi, poniżej młyna. Biała fasada przy placyku, trudno przeoczyć.',
        reveal:
          'Ta srebrna korona ma ponad czterysta pięćdziesiąt lat i jest prawdopodobnie najstarszym przedmiotem we wsi, który wciąż pełni swoją pierwotną funkcję. Młyn przestał mielić, rzeka zmieniła bieg, ujście się cofnęło, a korona nadal jest koroną tej samej figury.',
        photo: '/photos/odeceixe-igreja.jpg',
        photoCredit: 'Fot. RHaworth · CC BY-SA 3.0 · Wikimedia Commons',
        sources: ['https://pt.wikipedia.org/wiki/Igreja_Matriz_de_Odeceixe'],
        coords: [-8.77097, 37.43237],
        radius: 35,
      },
    ],
  },
  {
    parkId: 'odeceixe-foz',
    pois: [
      {
        id: 'maravilha',
        category: 'view',
        name: 'Miradouro da Maravilha',
        teaser: 'Punkt, z którego widać dokładnie to, o czym mówią muszle.',
        description: [
          'Punkt widokowy nad ujściem Seixe. Nazwa znaczy po prostu „cud" i nie jest przesadzona: z jednej strony masz ocean i klify, z drugiej rzekę wijącą się szeroką, płaską doliną.',
          'Ta płaska dolina to nie jest naturalny kształt terenu. To osady, które rzeka znosiła tu przez tysiące lat i którymi stopniowo wypełniła dawną zatokę. Miejsce, gdzie dziś rosną trzciny i pasą się krowy, było kiedyś wodą.',
          'Stąd najlepiej widać skalę tej zmiany. Od muszlowiska na zboczu za wsią do dzisiejszej linii wody jest kilka kilometrów niemal płaskiego dna. Kiedyś nie trzeba było ich przechodzić.',
        ],
        findHint:
          'Nad drogą schodzącą do plaży, po południowej stronie ujścia. Szukaj miejsca, z którego widać jednocześnie ocean i zakole rzeki.',
        reveal:
          'To jest widok, który tłumaczy całą wyprawę. Szeroka zielona dolina pod tobą jest wypełnioną zatoką. Ludzie z muszlowiska patrzyli na wodę tam, gdzie ty patrzysz na łąki, i dlatego nie musieli nigdzie chodzić po kolację.',
        photo: '/photos/odeceixe-praia-b.jpg',
        photoCredit: 'Fot. Beeston · CC BY 3.0 · Wikimedia Commons',
        sources: ['https://en.wikipedia.org/wiki/Odeceixe'],
        coords: [-8.79831, 37.44079],
        radius: 45,
      },
      {
        id: 'praia',
        category: 'water',
        name: 'Plaża w ujściu',
        teaser: 'Rzeka po jednej stronie, ocean po drugiej, cztery kilometry od wsi.',
        description: [
          'Praia de Odeceixe leży w samym ujściu rzeki, około czterech kilometrów od wsi, i to sąsiedztwo dwóch rodzajów wody jest jej największą zaletą. Od strony lądu rzeka rozlewa się płytko i spokojnie, od strony oceanu wchodzi fala, po którą przyjeżdżają surferzy. Można wybrać, w czym się kąpie, i zmienić zdanie po przejściu trzydziestu metrów.',
          'Plażę zamykają z obu stron wysokie klify, więc z wody wygląda jak wnętrze muszli. Cały ten odcinek wybrzeża leży w Parku Przyrody Południowo-Zachodniego Alentejo i Costa Vicentina, co jest powodem, dla którego nad plażą nie wyrósł kurort.',
          'To także kraniec etapu szlaku: przez wieś przechodzi Rota Vicentina, a lokalny szlak Odeceixe-ao-Rio prowadzi z centrum dokładnie tutaj, doliną wzdłuż wody.',
        ],
        findHint:
          'Koniec drogi z wioski wzdłuż rzeki. Pieszo doliną około czterech kilometrów, cały czas z wodą po lewej ręce.',
        reveal:
          'Stoisz na końcu tej samej trasy, którą pięć tysięcy lat temu ktoś pokonywał nie dla widoku, tylko dlatego, że tu przeniosły się małże. Dla nich to była praca i dwie i pół godziny drogi w obie strony. Dla ciebie to spacer z ręcznikiem.',
        dilemma: {
          question:
            'Ta sama droga: kiedyś konieczność, dziś przyjemność. Czy to znaczy, że mamy lepiej, czy tylko inaczej?',
          options: ['Zdecydowanie lepiej', 'Inaczej, nie lepiej', 'Lepiej, ale coś straciliśmy'],
          counterpoint:
            'Trudno tęsknić za chodzeniem po jedzenie, zwłaszcza w latach, gdy małży było mało. Ale warto zauważyć, że oni znali tę dolinę tak dokładnie, jak my znamy własną kuchnię: gdzie co rośnie, kiedy przypływ, po czym poznać, że nie warto iść. My idziemy tą samą doliną i nie wiemy o niej prawie nic, bo nie musimy.',
        },
        photo: '/photos/odeceixe-praia-a.jpg',
        photoCredit: 'Fot. Vítor Oliveira · CC BY-SA 2.0 · Wikimedia Commons',
        sources: ['https://en.wikipedia.org/wiki/Odeceixe'],
        coords: [-8.79785, 37.44214],
        radius: 80,
      },
      {
        id: 'adegas',
        category: 'water',
        name: 'Praia das Adegas',
        teaser: 'Sąsiednia plaża, oficjalnie naturystyczna. Warto wiedzieć przed wyjściem zza skały.',
        description: [
          'Tuż na południe od plaży w ujściu, za skalnym cyplem, leży Praia das Adegas. Jest to jedna z niewielu oficjalnie wyznaczonych plaż naturystycznych w Portugalii i tak też jest oznaczona w terenie oraz na mapach.',
          'Nazwa nie ma z tym nic wspólnego i mówi o czymś zupełnie innym: „adega" to po portugalsku piwnica na wino. W Odeceixe działało ich kiedyś siedemnaście naraz, a od 1992 roku jedna z nich jest muzeum, w którym odtworzono wnętrze z lat dwudziestych i czterdziestych, razem z beczkami i narzędziami zebranymi ze starych domów w okolicy.',
          'Wyznaczanie takich plaż jest w Portugalii uregulowane, więc nie jest to zwyczaj, który się przyjął, tylko decyzja z tabliczką. Dzięki temu wiadomo, gdzie się kończy jedna konwencja, a zaczyna druga, i nikt nikogo nie zaskakuje.',
          'Dojście prowadzi ścieżką po klifie, z górnego parkingu, i jest bardziej strome niż zejście na plażę główną.',
        ],
        findHint:
          'Za skałą na południe od plaży w ujściu. Zejście ścieżką od strony klifu, oznaczone.',
        reveal:
          'Praia das Adegas jest oficjalną plażą naturystyczną, jedną z niewielu w kraju. Sąsiaduje bezpośrednio z rodzinną plażą w ujściu, więc jeśli idziesz z dziećmi wzdłuż brzegu, warto wiedzieć, gdzie kończy się jedna, a zaczyna druga.',
        sources: ['https://en.wikipedia.org/wiki/Praia_de_Odeceixe_Mar'],
        coords: [-8.80054, 37.43918],
        radius: 60,
      },
    ],
  },
]
