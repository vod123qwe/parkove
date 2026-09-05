// Kamionna, gmina Trzciana, powiat bocheński: pierwsza góra Beskidu
// Wyspowego od północy, plus wieś u jej podnóża.
//
// Miejsce ma trzy osobne wątki i dlatego dostaje trzy trasy tematyczne
// (docs w scripts/build-trails.mjs, sekcja ORDERED): legendy, historia,
// lasy i widoki. Punkty świadomie należą do więcej niż jednej trasy, bo
// kolumna Lubomirskiego jest i faktem, i podaniem naraz.
//
// Obszar jest duży (koło o promieniu dwóch kilometrów), bo wątki są
// rozrzucone: szczyt z wieżą na południu, kościół i kolumna we wsi
// półtora kilometra niżej.
//
// Współrzędne to węzły OSM (skan Overpass 2026-09-05). Fakty: polska
// Wikipedia oraz przewodnik Czasu Bocheńskiego, linki w `sources`.

import type { Quest } from './quests'

export const KAMIONNA_QUESTS: Quest[] = [
  {
    parkId: 'kamionna',
    /* góra i wieś w jednym: pieczątka po trzech punktach, reszta jako powód,
       żeby wrócić po inny wątek */
    stampAt: 3,
    pois: [
      {
        id: 'wieza',
        category: 'view',
        name: 'Dwie wieże na jednym szczycie',
        teaser: 'Szczyt nazywa się Patria od wieży, której już nie ma. Nowa stoi od 2023 roku.',
        description: [
          'Kamionna ma 801 metrów i jest pierwszym szczytem Beskidu Wyspowego, jeśli iść od północy. To znaczy, że stoisz na granicy dwóch krain: za plecami masz łagodne Pogórze Wiśnickie, przed sobą kopulaste szczyty Beskidu.',
          'W 2023 roku stanęła tu stalowa wieża widokowa o wysokości dwudziestu dziewięciu metrów, najwyższa w Beskidzie Wyspowym. Z góry widać na południe Ostrą, Cichoń i Mogielicę, a na północ pofalowane Pogórze.',
          'Obok jest podszczytowa polana z miejscami na piknik, więc to naturalne miejsce na dłuższy postój.',
        ],
        findHint:
          'Sam wierzchołek. Wieżę widać z daleka, a przy niej stoi tablica i miejsca piknikowe.',
        reveal:
          'To nie pierwsza wieża na tym szczycie. Wcześniej stała tu wieża triangulacyjna, używana do pomiarów geodezyjnych, i od niej wzięła się druga nazwa szczytu: Patria. Wieży dawno nie ma, nazwa została, a po stu latach postawiono tu wieżę zupełnie w innym celu: żeby patrzeć dla przyjemności, a nie mierzyć.',
        sources: [
          'https://pl.wikipedia.org/wiki/Kamionna_(Beskid_Wyspowy)',
          'https://www.czasbochenski.pl/portal/przewodnik-krajoznawczy/kamionna-gora-najwyzsza/17018/',
        ],
        photo: '/photos/kamionna-c.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [20.39628, 49.77867],
        radius: 70,
      },
      {
        id: 'jeziorko',
        category: 'water',
        name: 'Jezioro na szczycie',
        teaser: 'Ta góra przez siedemset lat nazywała się Jeziernik. Woda wciąż tu bywa.',
        description: [
          'Pod samym wierzchołkiem jest płytkie zagłębienie. Przez większość roku wygląda jak zwykła podmokła polana i łatwo przejść obok, nie zauważając niczego.',
          'A jednak to po nim góra nosiła swoje najstarsze nazwy. W dokumentach z 1262 roku i późniejszych wraca jako „na Jeziorkach", „Jeziernik" i „Jeziornik".',
          'Zagłębienie powstało po osunięciu się fragmentu grzbietu. Takie niecki osuwiskowe potrafią trzymać wodę, bo pod spodem zostaje nieprzepuszczalna warstwa.',
        ],
        findHint:
          'Podszczytowe zagłębienie tuż pod wierzchołkiem. Szukaj płytkiej niecki z inną roślinnością niż dookoła. Tafli wody nie zobaczysz na sucho.',
        reveal:
          'Jeziorko wciąż istnieje, tylko w zaawansowanym zarastaniu, i lustro wody pojawia się tu dopiero po ulewach. Nazwa jest więc starsza niż wszystko inne w tej okolicy i dokładniejsza niż wygląd: ktoś w trzynastym wieku widział tu wodę i nazwał górę po tym, co widział. Nazwa przetrwała samo jezioro o siedemset lat.',
        dilemma: {
          question:
            'Góra nazywała się Jeziernik przez siedem wieków, a dziś prawie nikt tej nazwy nie zna. Czy warto przywracać stare nazwy miejsc, czy niech żyją te, których ludzie używają?',
          options: [
            'Przywracać, niosą informację',
            'Zostawić te używane',
            'Pokazywać obie obok siebie',
          ],
          counterpoint:
            'Stara nazwa jest tu dowodem: mówi, że na szczycie stała woda, i to na długo przed jakimikolwiek badaniami. Ale nazwa, której nikt nie używa, nie działa jako nazwa, tylko jako ciekawostka, a zmienianie tabliczek na siłę kończy się tym, że ludzie i tak mówią po swojemu.',
        },
        sources: [
          'https://www.czasbochenski.pl/portal/przewodnik-krajoznawczy/kamionna-gora-najwyzsza/17018/',
        ],
        coords: [20.39553, 49.77843],
        radius: 60,
      },
      {
        id: 'rezerwat',
        category: 'nature',
        name: 'Buczyna karpacka',
        teaser: 'Las, który wygląda tak, jak wyglądałby bez nas.',
        description: [
          'Północne zbocze góry zajmuje rezerwat przyrody Kamionna, utworzony 25 lipca 1997 roku. Chroni zespoły buczyny karpackiej i jedliny o naturalnym charakterze.',
          'Buczyna karpacka to las, w którym rządzi buk: wysoki, gładki, z koroną tak gęstą, że w środku lata na dnie jest półmrok i prawie nic nie rośnie. Wiosną, zanim buki wypuszczą liście, dno lasu zakwita całe naraz i to najlepszy moment na tę ścieżkę.',
          'Przy szlaku stoją tablice rezerwatu, więc granicę poznasz bez mapy.',
        ],
        findHint:
          'Północne i zachodnie zbocze, między wsią a wierzchołkiem. Tablice rezerwatu stoją przy ścieżce.',
        reveal:
          'Określenie „o naturalnym charakterze" znaczy w praktyce, że tego kawałka lasu nikt porządnie nie przebudował: rosną tu drzewa w różnym wieku, leży martwe drewno, a odnowienie idzie samo, bez sadzenia. W Karpatach polskich takich fragmentów zostało niewiele, bo prawie wszystko było w którymś momencie wycięte i posadzone od nowa.',
        sources: [
          'https://archiwum.zegocina.pl/przyroda/rezerwat.htm',
          'https://pl.wikipedia.org/wiki/Kamionna_(Beskid_Wyspowy)',
        ],
        coords: [20.38868, 49.78398],
        radius: 80,
      },
      {
        id: 'pasierbiecka',
        category: 'view',
        name: 'Pasierbiecka Góra',
        teaser: 'Sąsiedni szczyt, 764 metry, bez wieży i bez tłumu.',
        description: [
          'Kilometr na zachód od Kamionnej stoi Pasierbiecka Góra, 764 metry. Ma własną tabliczkę szczytową i jest naturalnym przedłużeniem spaceru dla tych, którym mało jednego wierzchołka.',
          'Beskid Wyspowy nazywa się tak dlatego, że jego szczyty nie tworzą grzbietów, tylko sterczą pojedynczo nad dolinami jak wyspy. Kamionna i Pasierbiecka są dwiema takimi wyspami obok siebie, a przejście między nimi pokazuje ten układ lepiej niż jakikolwiek opis.',
        ],
        findHint: 'Kilometr na zachód od wierzchołka Kamionnej, ścieżką grzbietem.',
        reveal:
          'Wyspowość tych gór to skutek erozji: potoki rozcięły dawniej ciągły masyw na osobne kopce, zostawiając między nimi szerokie obniżenia. Idąc z Kamionnej na Pasierbiecką, schodzisz w takie właśnie obniżenie i wchodzisz z powrotem. Każde takie zejście to miejsce, w którym woda wygrała ze skałą.',
        sources: ['https://pl.wikipedia.org/wiki/Kamionna_(Beskid_Wyspowy)'],
        photo: '/photos/kamionna-a.jpg',
        photoCredit: 'Fot. Jerzy Opioła · CC BY-SA 4.0 · Wikimedia Commons',
        coords: [20.37796, 49.78138],
        radius: 60,
      },
      {
        id: 'kolumna',
        category: 'monument',
        name: 'Kolumna Lubomirskiego',
        teaser: 'Kamienny słup postawiony na pamiątkę potyczki ze Szwedami.',
        description: [
          'We wsi, przy drodze, stoi kamienny obelisk zwany Kolumną Szwedzką. Wystawił go książę Jerzy Lubomirski na pamiątkę zwycięskiej potyczki ze Szwedami.',
          'Potop szwedzki zostawił w tej okolicy więcej śladów niż jeden kamień. W sąsiedniej Trzcianie zniszczono wtedy kościół, który trzeba było odbudowywać, a pamięć o tamtych latach obrosła podaniami, które opowiada się do dziś.',
          'Sam obelisk jest skromny i łatwo go minąć jadąc samochodem.',
        ],
        findHint: 'We wsi Kamionna, przy drodze w zachodniej części. Niski kamienny słup.',
        reveal:
          'Upamiętnianie potyczki kamiennym słupem było w siedemnastym wieku czymś w rodzaju dzisiejszej tablicy pamiątkowej: tanie, trwałe i widoczne dla każdego, kto tędy przejeżdżał. Że stoi do dziś, a nazwiska poległych nie zachowały się nigdzie, mówi sporo o tym, co się w historii utrwala, a co znika.',
        legend: [
          'Z tamtego czasu pochodzi też podanie o Diabelskim Kamieniu w pobliskiej Trzcianie. Mieszkańcy odbudowali kościół zniszczony w czasie potopu, co nie spodobało się mocom piekielnym. Diabeł postanowił zburzyć go ogromnym głazem.',
          'Niósł kamień nocą nad okolicą, ale nad wzgórzem Wichraz ukazała mu się Biała Pani w powłóczystych szatach, z jasną poświatą wokół głowy. Diabeł przestraszył się tak, że wypuścił głaz z rąk. Kamień wbił się w ziemię i nikomu nie zrobił krzywdy, a leży tam do dziś.',
        ],
        sources: [
          'https://www.czasbochenski.pl/portal/przewodnik-krajoznawczy/kamionna-gora-najwyzsza/17018/',
          'https://pl.wikipedia.org/wiki/Diabelski_Kamień_w_Trzcianie',
        ],
        coords: [20.36396, 49.80069],
        radius: 55,
      },
      {
        id: 'kosciol',
        category: 'monument',
        name: 'Kościół, który udaje starszy',
        teaser: 'Wygląda na dawny drewniany kościół małopolski. Ma niecałe sto lat.',
        description: [
          'Kościół pod wezwaniem Najświętszej Maryi Panny Królowej Polski powstał razem z parafią w 1934 roku. Jest trójnawowy, w konstrukcji szkieletowej, i celowo nawiązuje do dawnych drewnianych kościołów Małopolski.',
          'To ciekawy przypadek: budynek świadomie zaprojektowany tak, żeby wyglądał na starszy niż jest. W dwudziestoleciu międzywojennym był to popularny sposób budowania w Polsce, bo szukano stylu, który wyglądałby na rodzimy.',
        ],
        findHint: 'Środek wsi Kamionna, przy głównej drodze. Obok stoi wieża.',
        reveal:
          'Kamionna jest wsią starą, wzmiankowaną w dokumentach już w trzynastym wieku, ale własną parafię dostała dopiero w 1934 roku. Przez siedemset lat mieszkańcy chodzili do kościoła gdzie indziej. Ten budynek jest więc młody, choć wieś, która go postawiła, jest od niego starsza o siedem stuleci, i chyba dlatego zbudowano go tak, żeby na to wyglądał.',
        sources: [
          'https://www.czasbochenski.pl/portal/przewodnik-krajoznawczy/kamionna-gora-najwyzsza/17018/',
        ],
        coords: [20.37521, 49.7994],
        radius: 55,
      },
    ],
  },
]
