// Park Miejski w Miechowie, 30 km na północ od Krakowa.
//
// Temat: CO JEST POD SPODEM I CO BYŁO WCZEŚNIEJ. Park wygląda na świeżo
// odnowiony skwer powiatowego miasta, a stoi na miejscu spalonego dworu
// i jest końcem półtorakilometrowego systemu średniowiecznych tuneli.
//
// Zakres celowo ograniczony do samego parku (decyzja Jarka): klasztor
// bożogrobców i Polska Jerozolima zostają w treści jako to, DOKĄD prowadzą
// podziemia, a nie jako osobne punkty rozsiane po mieście.
//
// Współrzędne to węzły OSM (skan Overpass 2026-08-28). Fakty: National
// Geographic i strona gminy (podziemia), miechow.info oraz Dziennik Polski
// (dwór, rewitalizacja), dzieje.pl (bożogrobcy).

import type { Quest } from './quests'

export const MIECHOW_QUESTS: Quest[] = [
  {
    parkId: 'miechow',
    pois: [
      {
        id: 'podziemia',
        category: 'history',
        name: 'Wyjście z tuneli',
        teaser: 'Pod tym parkiem kończy się półtora kilometra średniowiecznych podziemi.',
        description: [
          'Park leży na terenie dawnego majątku Wielko-Zagórze. Wygląda jak każdy odnowiony park w mieście powiatowym: alejki, fontanny, leżaki. Nie widać po nim, że jest końcem czegoś, co zaczyna się siedemset metrów stąd, pod klasztorem na skarpie.',
          'Pod Miechowem biegnie system średniowiecznych podziemi zbudowany przez zakonników sprowadzonych z Jerozolimy w 1163 roku. Badacze szacują jego długość nawet na półtora kilometra, co czyni go czymś wyjątkowym w skali kraju. Powstał po to, żeby w razie napadu dało się opuścić miasto, nie wychodząc na powierzchnię.',
          'To nie jest opowieść przekazywana z ust do ust. Jeszcze w latach dwudziestych XX wieku mieszkańcy wchodzili do korytarzy przez kościół, przechodzili pod rynkiem i wracali do świątyni inną odnogą.',
        ],
        findHint:
          'Gdziekolwiek w parku. Nie ma tu tablicy ani wejścia: podziemia są pod spodem, nie na widoku.',
        reveal:
          'Wyjścia z podziemi znajdowały się właśnie tutaj, w dawnym Wielko-Zagórzu, oraz pod skarpą klasztoru. Drugi ich koniec to bazylika, w której bożogrobcy postawili kopię Grobu Bożego i rozsypali pod fundamenty ziemię przywiezioną z Jerozolimy. W 1981 roku, przy pracach nad ogrzewaniem kościoła, wejścia zamurowano, a część korytarzy przerobiono na komory grzejne. Droga ucieczki sprzed ośmiuset lat jest dziś kotłownią.',
        dilemma: {
          question:
            'Podziemia zamurowano, a ich część zamieniono w instalację grzewczą. Kościół da się ogrzać, nikt nie wpadnie do korytarza. Czy tak się powinno traktować zabytek, którego nie da się zwiedzać?',
          options: ['Bezpieczeństwo najpierw', 'Trzeba było udostępnić', 'Zamurować, ale najpierw zbadać'],
          counterpoint:
            'Udostępnienie średniowiecznych korytarzy kosztuje tyle, co niejeden budżet gminy: trzeba je odwodnić, zabezpieczyć strop, doprowadzić prąd i mieć kogoś, kto za to odpowiada. Z drugiej strony obiekt zamurowany przestaje istnieć dla wszystkich poza dokumentacją, a to, czego nikt nie widział, łatwo potem przeoczyć przy kolejnym remoncie.',
        },
        sources: [
          'https://www.national-geographic.pl/historia/pod-polskim-miastem-odkryto-ogromna-siec-sredniowiecznych-tuneli-legendy-o-zakonnikach-okazaly-sie-prawda/',
          'https://www.miechow.eu/turystyka/warto-zobaczyc/zespol-poklasztorny-bozogrobcow-z-bazylika-grobu-bozego/',
        ],
        coords: [20.03692, 50.35716],
        radius: 90,
      },
      {
        id: 'dwor',
        category: 'history',
        name: 'Dwór, którego nie ma',
        teaser: 'Ten park istnieje dlatego, że stojącego tu dworu nigdy nie odbudowano.',
        description: [
          'Zanim powstał park miejski, było tu co innego: park dworski majątku Wielkozagórze, założony przy dworze, którego dziś nie ma.',
          'Dwór spłonął po powstaniu styczniowym. Siedemnastego lutego 1863 roku oddział pułkownika Apolinarego Kurowskiego, liczący około dwóch i pół tysiąca ludzi, uderzył na Miechów, licząc na zaskoczenie. Zaskoczenia nie było, bo Rosjanie zostali uprzedzeni i dzień wcześniej wzmocnili garnizon. Po trzech godzinach walk na ulicach i klęsce powstańców miasto zostało podpalone.',
          'Budynków dworu nigdy nie odbudowano. Ocalała jedna rzecz: budynek oficyny dworskiej, który stoi do dziś. Sam park przetrwał jako park i przez następne sto lat po prostu rósł.',
        ],
        findHint:
          'Środkowa część parku, tam gdzie starodrzew. Po dworze nie ma śladu, więc szukaj raczej starych drzew niż fundamentów.',
        reveal:
          'Gdyby dwór odbudowano, tego parku by nie było: teren wróciłby do właścicieli razem z budynkami i płotem. Miechowianie chodzą dziś po ogrodzie, który został publiczny dlatego, że w 1863 roku ktoś podpalił dom.',
        dilemma: {
          question:
            'Miejsce publiczne powstało tu z cudzej straty. Podobnie jest z wieloma parkami: dawne majątki, cmentarze, tereny po fabrykach. Czy warto o tym mówić na tablicach, czy lepiej zostawić park parkiem?',
          options: ['Mówić wprost', 'Zostawić park parkiem', 'Mówić, ale bez patosu'],
          counterpoint:
            'Tablica z historią zmienia spacer w lekcję, a ludzie przychodzą tu odpocząć, nie czytać. Ale miejsce bez opowieści jest wymienne: równie dobrze mogłoby być każdym innym trawnikiem, a wtedy nikt nie stanie w jego obronie, gdy przyjdzie pomysł na parking.',
        },
        sources: [
          'http://miechow.info/zabytki-miechowskie/',
          'https://pl.wikipedia.org/wiki/Bitwa_pod_Miechowem_(1863)',
        ],
        photo: '/photos/miechow-dworek-c.jpg',
        photoCredit: 'Fot. Januszk57 · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [20.03674, 50.35765],
        radius: 60,
      },
      {
        id: 'dworek',
        category: 'monument',
        name: 'Dworek Zacisze',
        teaser: 'Modrzewiowy dwór z 1784 roku, z datą wyciętą na belce stropowej.',
        description: [
          'Przy Racławickiej, po południowej stronie parku, stoi parterowy dwór z modrzewia, w konstrukcji zrębowej, kryty łamanym dachem polskim. Uchodzi za jeden z najcenniejszych zabytków architektury staropolskiej w Małopolsce i należy do Szlaku Architektury Drewnianej.',
          'Wiek budynku nie jest domysłem konserwatora. W izbie frontowej zachowała się belka stropowa z wyciętą datą: szesnasty sierpnia 1784 roku.',
          'W latach 1981 do 1994 mieściło się tu Muzeum Kościuszkowskie, oddział muzeum regionalnego PTTK, ze zbiorami o Kościuszce i bitwie pod Racławicami z 1794 roku. Od 2011 roku budynkiem opiekuje się Biuro Wystaw Artystycznych „U Jaksy".',
        ],
        findHint:
          'Ulica Racławicka 26, przy południowej granicy parku. Drewniany dom za białym płotem, trudno pomylić.',
        reveal:
          'Ten dom jest starszy od Stanów Zjednoczonych i stał tu już, gdy sto lat później palił się dwór w Wielkozagórzu, na terenie dzisiejszego parku. Tamten zniknął bez śladu, ten stoi dalej z datą na belce. Nazwa galerii, która dziś w nim mieszka, wraca zresztą do samego początku miasta: „U Jaksy", od rycerza, który w 1163 roku sprowadził tu bożogrobców.',
        sources: [
          'https://zabytek.pl/en/obiekty/miechow-dworek-zacisze-2',
          'https://www.miechow.eu/kultura-rozrywka/biuro-wystaw-artystycznych-u-jaksy/dworek-zacisze/',
        ],
        photo: '/photos/miechow-dworek-a.jpg',
        photoCredit: 'Fot. Januszk57 · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [20.0376, 50.35515],
        radius: 45,
      },
      {
        id: 'ogrod-zen',
        category: 'nature',
        name: 'Ogród Zen',
        teaser: 'Kawałek Japonii w parku, osiemset lat po kawałku Jerozolimy.',
        description: [
          'Przy wschodnim skraju parku leży niecały hektar ogrodu w stylu japońskim. Nie ma w nim nic wielkiego: kamienie, woda i rośliny ułożone tak, żeby patrzeć, a nie zwiedzać.',
          'W mieście, które przez siedem wieków żyło jednym tematem, to zaskakujące miejsce. Dlatego najlepiej wejść tu zaraz po parku: kontrast robi połowę wrażenia.',
        ],
        findHint: 'Wschodnia część parku, osobno ogrodzony fragment.',
        reveal:
          'W tym mieście przywożenie kawałków świata ma długą tradycję. W dwunastym wieku rycerz Jaksa przywiózł z Jerozolimy worki ziemi z Grobu Bożego i zbudował wokół nich klasztor. Osiemset lat później ktoś przywiózł tu pomysł na ogród z drugiego końca Azji. Za każdym razem chodziło o to samo: mieć u siebie miejsce, do którego nie da się pojechać.',
        sources: ['https://www.openstreetmap.org/'],
        coords: [20.03783, 50.35699],
        radius: 45,
      },
      {
        id: 'rewitalizacja',
        category: 'monument',
        name: 'Park za dwadzieścia milionów',
        teaser: 'Fontanny, leżaki i biblioteczka pod chmurką: wszystko z jednego remontu.',
        description: [
          'To, co widzisz dookoła, jest nowe. Park przez lata podupadał: do lat dziewięćdziesiątych dbały o niego władze miejskie, potem jego stan pogarszał się z roku na rok. Przygotowania do rewitalizacji ruszyły w 2014, a przebudowa w maju 2019 roku.',
          'Rachunek wyniósł 20,4 miliona złotych, z czego 12,8 miliona to dofinansowanie z Regionalnego Programu Operacyjnego. Za te pieniądze stanęły fontanny, alejki, leżaki, stoły piknikowe, toalety i plenerowa biblioteczka.',
          'Dla porównania: to mniej więcej tyle, ile kosztuje kilometr zwykłej drogi wojewódzkiej.',
        ],
        findHint: 'Środek parku, przy fontannach i leżakach.',
        reveal:
          'Park miał już kiedyś swój renesans. W latach siedemdziesiątych zaopiekował się nim Zakład Zieleni: powstały rabaty kwiatowe, nowe alejki i ławki, a miejsce tętniło życiem i było sceną miejskich imprez. Potem opieka się skończyła i park zdążył podupaść. Dwadzieścia milionów kupuje więc nie tyle nowy park, ile kolejne kilkadziesiąt lat, o które ktoś będzie musiał dbać.',
        dilemma: {
          question:
            'Dwadzieścia milionów na park w mieście, w którym mieszka kilkanaście tysięcy osób. Dobra inwestycja?',
          options: ['Tak, to zwraca się jakością życia', 'Za dużo jak na jeden park', 'Zależy, czy utrzymają'],
          counterpoint:
            'Park służy wszystkim i codziennie, czego nie da się powiedzieć o większości inwestycji za podobne pieniądze. Ale historia tego samego parku pokazuje, że najdroższy jest nie remont, tylko dwadzieścia lat później: jeśli nie ma stałego budżetu na utrzymanie, świeże alejki zestarzeją się dokładnie tak samo jak poprzednie.',
        },
        sources: [
          'https://www.miechow.eu/kultura-rozrywka/Park-Miejski-po-Rewitalizacji/',
          'https://dziennikpolski24.pl/miechow-w-sobote-zostal-udostepniony-mieszkancom-park-miejski-po-rewitalizacji-zdjecia/ar/c13-15637636',
        ],
        coords: [20.03657, 50.35727],
        radius: 55,
      },
    ],
  },
]
