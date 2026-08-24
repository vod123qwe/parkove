# Questy miejskie i spacery audio (runda 2)

Siedem platform, których jedynym zadaniem jest **podać opowieść w terenie**. To najbliższy
nam gatunek w całym benchmarku, bo wszystkie mają ten sam problem co my: treść ma się
pokazać na miejscu, a telefon nie zawsze wie, gdzie jest.

Najważniejsza obserwacja z góry: **żadna dojrzała platforma nie stawia wszystkiego na
bliskość GPS.** Każda ma co najmniej jedną furtkę awaryjną — QR, kod z klawiatury, beacon
albo rozpoznanie obiektu. Im starsza i im bardziej „instytucjonalna" platforma, tym więcej
furtek.

Kolejność: od najbardziej przydatnych dla nas.

---

## 1. Actionbound (Niemcy)

**Co to jest.** Berlińska platforma do „bounds" — mobilnych rajdów i podchodów, robiona
głównie pod szkoły, muzea i biblioteki, z drugim życiem w team-buildingu (z opisu). Trzy
licencje: **Personal darmowa** dla użytku prywatnego, **EDU** dla edukacji, **PRO** dla
firm (pewne). EDU liczy się od liczby graczy: **50 graczy = 83,19 €, 100 = 117,65 €,
200 = 201,68 €, 300 = 252,10 €, 500 = 348,74 €**, a ryczałt **EDU Flat do 5 000 graczy
= 500 €** (pewne). PRO drożej: **50 = 350 €, 100 = 600 €, 200 = 900 €, 500 = 1 500 €**,
Enterprise Flat do 2 500 graczy = 2 250 € (pewne). Licencja żyje rok albo do wyczerpania
graczy; **gracze w trybie testowym nie kosztują nic** (pewne). Sekretne bounds to
dopłata **7 € za bounda** (pewne). Gracz nie płaci nic, apka jest bez reklam (pewne).

**Co jest na mapie.** Punkty GPS na mapie OpenStreetMap plus strzałka kierunku; mapy
można preloadować, żeby zadanie „znajdź miejsce" działało bez internetu (z opisu).

**Czym wciąga na starcie.** Skan kodu QR albo wpisanie nazwy bounda w apce — bez
zakładania konta gracza (z opisu). Start to pobranie całej treści bounda na telefon.

**Czym trzyma w terenie.** Dziesięć typów elementów: punkt GPS („Find spot"), QR, quiz,
zadanie foto/wideo, media, oraz **„Switch"** czyli rozgałęzienie ścieżki (z opisu).
Najciekawsze są dwie rzeczy. Pierwsza: **wokół współrzędnych automatycznie rysuje się
promień 20 m** i wejście w niego oznacza „znalezione", właśnie po to, żeby dało się dojść
przy słabym sygnale (pewne). Druga: element może zostać pokazany **gdy dotarto na miejsce
albo gdy zeskanowano kod QR** — jedna treść, dwa warunki (z opisu, help „Reference
element"). Dokumentacja sama ostrzega, że punkt postawiony w budynku albo na środku jeziora
oznacza, że gracz **nigdy** nie wejdzie w promień (z opisu). Offline: treść, pytania i
obrazki pobierają się na start, potem internet nie jest potrzebny; wyjątkiem są
zewnętrzne media typu YouTube, których nie da się preloadować (pewne, FAQ).

**Co zostaje po wyprawie.** **Strona wyników**: podsumowanie rundy, ranking i wgrane
zdjęcia oraz wideo — dokładnie ta sama strona, którą gracz może dostać na koniec do
siebie (z opisu). Wyniki są **domyślnie prywatne** i pojawiają się publicznie tylko wtedy,
gdy gracz sam potwierdzi publikację (pewne, FAQ). Autor widzi u siebie tabelę: liczba
rozegranych przejść, liczba graczy, data ostatniej gry, średni czas, średni wynik
(z opisu).

**Rywalizacja.** Miękka i opt-in: na publicznej stronie bounda wisi high score z **top 5**
(z opisu). Brak synchronizacji kilku telefonów w jednej drużynie (z opisu, recenzja).

**Co mówią użytkownicy.** Chwalą działanie offline i szkolne zastosowania (z opisu).
Zarzuty: trzeba zainstalować apkę zamiast wejść przez przeglądarkę, brak team-sync na
wiele urządzeń, preload psuje spontaniczność, brak rozpoznawania obrazu (z opisu,
recenzja Spotix). Długość jednej gry: od kwadransa w budynku do ok. 2,5 godziny na
jedenastu stacjach w terenie (z opisu).

**Co z tego dla nas.** To najbliższy nam wzorzec techniczny: **stały automatyczny promień
20 m zamiast promienia dobieranego per punkt** plus zasada „element odpala się po dotarciu
**albo** po zeskanowaniu kodu". Drugie do skopiowania: wyniki prywatne domyślnie,
publikacja tylko za świadomym kliknięciem — u nas rodzina i tak nie chce rankingu.

---

## 2. Loquiz (Estonia)

**Co to jest.** Estońska platforma do budowania gier terenowych, kreator przeglądarkowy
plus apka dla gracza, sprzedawana firmom i organizatorom (z opisu). Cennik jest
niezwykle konkretny: **plan miesięczny 9 €/mies. + 9 € za urządzenie**, **roczny 600 €/rok
+ 5 € za urządzenie**, trial 14 dni z limitem 10 graczy i 10 zadań, plany płatne
200 graczy i 200 zadań na grę (pewne). Do tego **pay-per-use: 9 € za każdego gracza**,
który w danym miesiącu dał co najmniej 5 odpowiedzi (pewne). Jeden gracz = jedno
aktywowane urządzenie (pewne).

**Co jest na mapie.** Piny zadań z **widocznym kołem promienia**, którego kolor autor sam
ustawia (domyślnie szary) (pewne).

**Czym wciąga na starcie.** Kreator drag-and-drop i 11 typów zadań, w tym opcja „survey",
gdzie każda odpowiedź jest poprawna (z opisu).

**Czym trzyma w terenie.** Tu jest najlepsza inżynieria w całym rozdziale. Zadanie można
aktywować na **pięć sposobów: GPS, QR, iBeacon, kod kreskowy EAN i „clue-code"** (pewne).
Promień: **domyślnie 10 m**, a zadania z promieniem **5 m lub mniej są w praktyce
nieaktywowalne** przez niedokładność GPS (pewne). I sztuczka, którą warto zapamiętać:
**promień 0 m całkowicie wyłącza aktywację GPS, ale zadanie nadal odpala się z beacona
albo QR** (pewne) — czyli jednym ustawieniem zamieniasz punkt „na bliskość" w punkt „na
kod". Do tego twarde progi: **jeśli dokładność pozycji jest gorsza niż 100 m, Loquiz nie
liczy pozycji wcale**; fix wymaga minimum 4 satelitów; sieć komórkowa to ok. 1000 m,
WiFi ok. 100 m, GPS ok. 10 m (pewne). O ciasnych miejscach mówią wprost: GPS „works poorly
on narrow streets and near large objects", a rada brzmi używać większych promieni i
stawiać punkty na otwartym (pewne, [Loquiz GPS reception](https://loquiz.com/support/gps-reception/)).
Offline: gra pobiera się na start i **aktywacje, odpowiedzi, punkty, podpowiedzi, intro i
QR działają bez internetu**, ale zdjęcia, obrazy, wideo i strony w zadaniach są
streamowane i wymagają sieci; wgranie zrobionych zdjęć też (pewne).

**Co zostaje po wyprawie.** Strona wyników z **nazwą drużyny, wynikiem, liczbą
odpowiedzi, przebytym dystansem i czasem gry**, sortowalna po kolumnach, plus osobna
zakładka „Photos and videos" ze wszystkim, co drużyny nafotografowały (pewne). Tabela
jest wprost projektowana jako narzędzie do ogłoszenia zwycięzcy na miejscu (pewne).

**Rywalizacja.** Rdzeń produktu. Tabela drużyn z punktami, czasem i dystansem (pewne).

**Co mówią użytkownicy.** Nie sprawdzone (opinie na Capterra/G2 istnieją, nie czytałem ich
w tej rundzie).

**Co z tego dla nas.** Trzy liczby do zapisania na ścianie: **10 m to sensowny domyślny
promień, poniżej 5 m nie działa, powyżej 100 m niedokładności nie ma sensu nic liczyć.**
A „promień 0 = tylko kod" to gotowy mechanizm dla punktu w wąskiej alejce albo pod gęstymi
drzewami.

---

## 3. ECHOES.xyz (Wielka Brytania) — pogłębione

**Co to jest.** „geoCMS", czyli system zarządzania treścią przypiętą do miejsc, robiony
pod **dźwiękowe spacery**: twórca wgrywa audio, obrazy i tekst, obrysowuje kształty na
mapie i publikuje (pewne). Skala: **ponad 10 000 członków i ponad 3 000 publicznych
spacerów audio** (z opisu). Pieniądze: plan darmowy z pełną funkcjonalnością, bez reklam,
**nieograniczona liczba spacerów i przystanków**, wgrywanie obrazów, **unikalny kod QR na
każdy spacer**, wsparcie mailowe (pewne). Płatne poziomy nazywają się **ESSENTIAL** i
**EXTRA**, ale **cen nie podają publicznie — nie sprawdzone**. Za spacery płatne platforma
bierze **15% prowizji**, a strona wspomina też o podziale zysku **50/50** — jak się te dwie
liczby składają, nie sprawdzone (pewne, że tak pisze cennik).

**Co jest na mapie.** „Echa" — ścieżki dźwiękowe (albo kilka nałożonych) zamknięte w
**kształtach** na mapie, które tworzą strefy geofence (pewne). Spacer można wyświetlić
jako mapę, listę albo widok „immersive" (pewne, docs). Kształt, a nie okrąg, to istotna
różnica wobec Loquiz i Actionbound.

**Czym wciąga na starcie.** Tym, że to dźwięk, nie tekst, i że **można warstwować dowolnie
wiele ścieżek** — narracja i tło osobno (z opisu).

**Czym trzyma w terenie.** Treść startuje, gdy słuchacz **fizycznie wejdzie do środka
kształtu**, przez GPS albo **iBeacon** (pewne). I tu zaczyna się najciekawsza część, bo
ECHOES ma **najbardziej uczciwą dokumentację problemów GPS** w całym badaniu. Wymieniają
wprost, co psuje dokładność: **różnice chipów GPS między Androidem i iOS oraz między samymi
Androidami**, różne konstelacje satelitów (GPS/GNSS/Galileo), „line of sight to the sky",
pogoda, obecność wież komórkowych, WiFi i Bluetooth, tryb samolotowy i wyłączone dane,
a także **czas — im dłużej GPS pracuje, tym lepszy wynik** (pewne,
[ECHOES GPS docs](https://docs.echoes.xyz/docs/creator/gps/)). Piszą też wprost, że bez
zasięgu i danych „GPS will work, but not as accurately in urban areas" (pewne). Do tego
różnica platform: **Android korzysta z „fused location"** (łączy kilka źródeł), a **iOS
oszczędza baterię i podnosi dokładność tylko dla spacerów 3D** (pewne).

Druga warstwa problemów przychodzi z opinii graczy w sklepach: skargi na konieczność
ponownego pobierania trasy z powodu błędów jakości dźwięku, przypadki, w których apka
**wcale nie geolokalizuje**, oraz zawieszony komunikat o wczytywaniu odtwarzacza bez
odtworzenia dźwięku; jedna opinia mówi wprost, że apka jest „really buggy, not viable for
live production" (z opisu, opinie w App Store). Historia wersji zawiera poprawki
niemożności wystartowania spaceru na części urządzeń (z opisu).

Czego **nie** znalazłem, choć szukałem celowo: **zalecanego minimalnego promienia/rozmiaru
kształtu — nie sprawdzone** (i to znaczący brak, bo Loquiz i Actionbound liczbę podają).
**Pobieranie spaceru do trybu offline — nie sprawdzone.**

**Co zostaje po wyprawie.** **Nie sprawdzone** — dokumentacja nie opisuje ekranu końca
spaceru.

**Rywalizacja.** Brak, to nie gra (z opisu).

**Co mówią użytkownicy.** Dwa bieguny. Twórcy w środowisku sound-walk chwalą, że jest
„free and simple to use" i że wystarczy „construct shapes on a map" (z opisu,
walk·listen·create). Słuchacze zgłaszają awarie odtwarzania i geolokalizacji (z opisu).

**Co z tego dla nas.** Jednocześnie wzór i ostrzeżenie. Wzór: **geofence jako kształt, nie
okrąg** — w wąskiej alei parkowej albo na moście obrys jest po prostu prawdziwszy niż
promień. Ostrzeżenie: **reveal, który jest tylko dźwiękiem, przy awarii nie zostawia
niczego** — nasz reveal musi być czytelny tekstem, żeby cisza nie oznaczała pustego ekranu.

---

## 4. Smartify (Wielka Brytania)

**Co to jest.** Social enterprise, „Shazam dla sztuki": celujesz kamerą w obraz i
dostajesz opis oraz audio (z opisu). **Ponad 700 partnerów kulturalnych** (z opisu). Apka
dla zwiedzającego darmowa (z opisu). Instytucja płaci: **Free = 0 £** (strona miejsca,
mapa, jedna trasa), **Starter = 1 800 £/rok** (do 3 tras audio, max 500 obiektów, gry,
quizy i odznaki), **Branded = 3 500 £/rok** (własna markowa web-apka, tłumaczenia AI,
7 tras, 1 000 obiektów), **Premium = 9 500 £/rok** (bez limitu tras i obiektów, trasy
personalizowane AI, własne powiadomienia), **Bespoke** na zapytanie (pewne). Ceny podawane
także w EUR i USD (pewne).

**Co jest na mapie.** Mapa miejsca, nie miasta — Smartify to przede wszystkim wnętrza
(z opisu).

**Czym wciąga na starcie.** Skanem. Nie trzeba wiedzieć, na co się patrzy, żeby się
dowiedzieć (z opisu).

**Czym trzyma w terenie.** Najbogatszy zestaw furtek w całym rozdziale: **cztery drogi do
tej samej treści — rozpoznanie obiektu kamerą, numpad (wpisanie numeru), wyszukiwanie i
kod QR** (pewne, strona produktu Smartify). To jest dokładnie odpowiedź na pytanie „a co,
jeśli główny warunek nie zadziała": nie jedna furtka awaryjna, a trzy. Offline: pobrane
trasy i przewodniki działają bez internetu (z opisu). Dostępność jest u nich osią sprzedaży:
audiodeskrypcja, trasy w języku migowym (z opisu).

**Co zostaje po wyprawie.** **Własna kolekcja**: każdy zeskanowany obiekt można do niej
dodać, a apka pamięta, co już zostało zeskanowane, i na tej podstawie podpowiada, co
zobaczyć dalej (z opisu).

**Rywalizacja.** W rdzeniu brak. Gry, quizy i **odznaki** pojawiają się od planu Starter
w górę, czyli rywalizacja jest tu funkcją płatną dla instytucji, nie mechaniką dla gracza
(pewne, z cennika).

**Co mówią użytkownicy.** Chwalą darmowość i dostęp do materiałów muzealnych (z opisu).
Reszta nie sprawdzone.

**Co z tego dla nas.** **„Cztery drogi do tej samej treści"** to najlepsza pojedyncza myśl
z tego rozdziału: nasz reveal powinien mieć obok bliskości furtkę „wpisz numer z tabliczki".
A „apka pamięta, co już zeskanowałeś, i podpowiada, co dalej" to nasz dziennik odwiedzonych
punktów opisany jednym zdaniem.

---

## 5. izi.TRAVEL (Holandia) — wariant dla samorządów i muzeów

**Co to jest.** Otwarta platforma audio-przewodników dla miast i muzeów, prowadzona przez
Informap. Skala z ich własnych materiałów: **25 000 tras audio, 2 500 miast, 137 krajów,
ponad 50 języków, ponad 3 000 muzeów** (z opisu). Model pieniędzy jest tu najciekawszy dla
gminy: **CMS, apki, szablony i dokumentacja są udostępniane dostawcy treści bezpłatnie, a
treść tworzy sam dostawca, bez udziału operatora platformy** (pewne, dokument
BalticMuseums cytujący warunki izi). Platforma zarabia obok: subskrypcje enterprise,
sprzedaż przez web, resellerzy, afiliacja, API, oraz **program sprzedaży tras z prowizją
10–20%** (z opisu).

**Co jest na mapie.** Trasy miejskie i muzealne w jednej apce, więc po muzeum wychodzi się
na miasto bez zmiany narzędzia (z opisu).

**Czym wciąga na starcie.** Darmowość, brak konta, 50+ języków (z opisu).

**Czym trzyma w terenie.** Trzy warunki uruchomienia historii: **QR, NumPad (wpisany
numer) i GPS** (z opisu). Do tego **„Free Walking Mode"**, w którym apka sama znajduje
najbliższe atrakcje i **auto-odtwarza** historie w miarę chodzenia (z opisu) — czyli nie
tylko „wejdź w punkt", ale też „idź, a my Cię dogonimy". Offline: trasy pobiera się po
WiFi i słucha bez internetu, żeby uniknąć roamingu; mapy i treść też offline (z opisu).

**Co zostaje po wyprawie.** Dla wydawcy: statystyki — ile razy element wyświetlono, z
jakich systemów, z jakich krajów i miast (z opisu). Dla gracza: **nie sprawdzone**.

**Rywalizacja.** Brak (domysł — to przewodnik, nie gra). Są natomiast oceny i recenzje tras
(z opisu).

**Co mówią użytkownicy.** Nie sprawdzone.

**Co z tego dla nas.** **NumPad to najtańsza furtka awaryjna, jaką widziałem.** Tabliczka
w parku z trzycyfrowym numerem odblokowuje reveal, gdy GPS zawiedzie — bez kamery, bez QR,
bez kodu drukowanego w kolorze, który wyblaknie. Drugi pomysł: **tryb „idź, a historia
sama Cię znajdzie"** jako alternatywa dla listy punktów do odhaczenia.

---

## 6. STQRY (Nowa Zelandia / USA) — wariant dla samorządów i muzeów

**Co to jest.** Kreator tras dla **muzeów, miast i parków**, bez kodowania; klientami są
m.in. biblioteki publiczne i operatorzy szlaków rowerowych (z opisu). Cennik z ich bloga:
**Standard 199 $/mies. albo 2 295 $/rok** (10 tras na apkę, nielimitowane pobrania),
**Pro** 25 tras plus własne integracje za **dodatkowe 100 $/mies.**, a publikacja do
wspólnej apki-portalu **STQRY Guide od 495 $/rok** (z opisu). Jest też marketplace, gdzie
autor ustawia własne progi cenowe za przewodnik (z opisu). Zwiedzający zwykle nie płaci
(domysł).

**Co jest na mapie.** Wiele tras w jednej apce: przewodniki po wystawach, spacery miejskie,
ścieżki rowerowe, nawet trasy łodzią — jedna gmina obsługuje kilka publiczności bez
osobnych aplikacji (z opisu).

**Czym wciąga na starcie.** Gmina nie musi wydawać własnej apki: publikuje do wspólnego
portalu, w którym ludzie i tak już szukają tras (z opisu).

**Czym trzyma w terenie.** **Trasy odpalane GPS-em albo ręcznie: klawiaturą numeryczną
lub kodem QR**, a treść da się pobrać z wyprzedzeniem i zwiedzać bez internetu (z opisu).
Dodatki: AR, gry, quizy i systemy nagród (z opisu). Najcenniejsze są ich zalecenia
redakcyjne: **3–7 minut audio na przystanek**, **5–15 przystanków na trasę**, a im dłuższy
odcinek marszu między przystankami, tym dłuższa może być ścieżka audio (z opisu).
Ciekawostka: sami sugerują **Bluetooth na krótkich dystansach, GPS na długich** (z opisu).

**Co zostaje po wyprawie.** Nie sprawdzone.

**Rywalizacja.** Nagrody i odznaki jako opcja, nie rdzeń (z opisu).

**Co mówią użytkownicy.** Nie sprawdzone.

**Co z tego dla nas.** Gotowa miara długości wyprawy: **5–15 punktów, 3–7 minut treści na
punkt**. Przy naszych parkach to znaczy, że jeden park powinien mieć raczej sześć-osiem
punktów niż dwadzieścia, a reveal ma być na jedno przeczytanie na stojąco.

---

## 7. CluedUpp (Wielka Brytania)

**Co to jest.** Jednodniowe wydarzenia detektywistyczne: firma sprzedaje bilet na
konkretną datę i miasto, a **setki drużyn grają jednocześnie w tym samym miejscu**
(z opisu). Bilet: **od 36 £ (earlybird) do 46 £ za drużynę do 6 osób**, w USA od 40 $ do
80 $ za drużynę, zależnie od wydarzenia (z opisu, różne relacje z różnych lat). Nie ma
otwartego edytora — treść robi wyłącznie firma (domysł).

**Co jest na mapie.** Wirtualni świadkowie i postacie z fabuły, rozstawieni po ulicach
miasta (z opisu).

**Czym wciąga na starcie.** Fabuła kryminalna i przebrania. Nagrody idą nie tylko za
szybkość: **najlepszy strój, najlepsza nazwa drużyny, najlepsze zdjęcie, „best little
detective" dla dzieciaka i „best K9" dla psa** (z opisu).

**Czym trzyma w terenie.** Dochodzisz GPS-em do świadka i odbierasz zeznanie, a potem —
i to jest dobry pomysł — **raz odwiedzony świadek zostaje dostępny zdalnie, nie trzeba do
niego wracać** (z opisu). Cena tego modelu: przed wyjściem trzeba pobrać po WiFi
**ponad 240 assetów** wraz z wideo, a mimo to **internet w telefonie musi być włączony
przez całą grę** (z opisu). Jedna relacja opisuje absurd: apka radzi połączyć się z WiFi,
a start jest na środku parku (z opisu). Okno czasowe: **start między 10:00 a 13:00,
rozwiązanie do 17:00** (z opisu). Czas jednej gry: **od 1,5 do 3 godzin**, w relacjach
około 2,5 godziny i blisko 5 km marszu (z opisu).

**Co zostaje po wyprawie.** Wskazujesz sprawcę w apce, a **zwycięzcy są ogłaszani o 17:00
na Facebooku wydarzenia**, nie w apce (z opisu). Nagroda to darmowy voucher na inne
wydarzenie CluedUpp (z opisu). Czyli ekran końca praktycznie nie istnieje — finał jest
poza produktem.

**Rywalizacja.** Najmocniejsza z całej siódemki i publiczna: nagroda za najszybsze
rozwiązanie dnia (z opisu).

**Co mówią użytkownicy.** Podzieleni, i to konkretnie. Na plus: „something new and
different" i dobra zabawa z zagadkami (z opisu). Na minus, i to nas dotyczy najbardziej:
**„The location is highly inaccurate, and often shows users at the far end of a street"**
(z opisu, opinia użytkownika) — plus skargi, że apka nie loguje aktywności drużyny do
wymuszonego restartu, że telefon się grzeje i pada bateria, bo internet musi być włączony
cały czas, oraz zarzut fałszywej reklamy: trailer obiecuje uliczny escape room, a dostajesz
chodzenie za apką bez żywych aktorów (z opisu).

**Co z tego dla nas.** To studium **progu bólu**: kiedy reveal zależy wyłącznie od GPS, a
GPS pokazuje gracza na końcu ulicy, gracz nie mówi „słaby sygnał", mówi „zła apka". Za to
jedną zasadę bierzemy żywcem: **punkt raz odblokowany zostaje odblokowany na zawsze i
dostępny z domu.**

---

## Warunki odblokowania treści — zbiorczo

| Warunek | Kto tak robi | Uwagi liczbowe |
|---|---|---|
| Bliskość GPS, promień stały automatyczny | Actionbound | **20 m** wokół współrzędnych (pewne) |
| Bliskość GPS, promień ustawiany przez autora | Loquiz, STQRY | domyślnie **10 m**; **≤5 m nieaktywowalne**; **>100 m niedokładności = brak pozycji** (pewne) |
| Wejście w **kształt** geofence (nie okrąg) | ECHOES | brak zalecanego minimum — nie sprawdzone |
| iBeacon / Bluetooth | ECHOES, Loquiz, STQRY | STQRY: Bluetooth na krótkich, GPS na długich (z opisu) |
| Skan kodu QR | Actionbound, Loquiz, izi.TRAVEL, Smartify, STQRY, ECHOES (QR na spacer) | najpowszechniejsza furtka |
| **Kod wpisany z klawiatury (numpad)** | izi.TRAVEL, Smartify, STQRY, Loquiz („clue-code") | najtańsza furtka awaryjna |
| Kod kreskowy EAN | Loquiz | (pewne) |
| Rozpoznanie obiektu kamerą | Smartify | jedna z czterech dróg (pewne) |
| Wyszukanie po nazwie | Smartify | de facto brak warunku (pewne) |
| Poprawna odpowiedź / rozgałęzienie | Actionbound („Switch"), Loquiz | (z opisu) |
| Zdjęcie/wideo jako dowód obecności | Actionbound, Loquiz | (z opisu) |
| Auto-odtworzenie najbliższej historii | izi.TRAVEL („Free Walking Mode") | (z opisu) |
| Odwiedzone raz = dostępne na zawsze, także z domu | CluedUpp | (z opisu) |

## Krótko o Questo i VoiceMap (opisane osobno)

Dla porządku: obie są w tej samej rodzinie, ale rozstrzygają inaczej. Wobec tej siódemki
wyróżnia je to, że **sprzedają pojedynczą trasę graczowi**, a nie licencję autorowi
albo instytucji — czyli koszt spada na gracza, nie na twórcę treści (domysł na podstawie
modelu obu). Dla nas nieistotne, bo Parkove nie sprzedaje niczego.

---

## Źródła

**Actionbound**
- [Actionbound — Pricing](https://en.actionbound.com/pricing)
- [Actionbound — licencje EDU (ceny)](https://en.actionbound.com/license/edu/1)
- [Actionbound — licencje PRO (ceny)](https://en.actionbound.com/license/business/1)
- [Actionbound — FAQ (offline, publikacja wyników, licencje)](https://en.actionbound.com/faq)
- [Actionbound — help: Find spot](https://de.actionbound.com/help/article/find-spot)
- [Actionbound — blog: Ort finden, GPS und Kompass (promień 20 m)](https://de.actionbound.com/blog/58dbb769569d657256627cc6)
- [Actionbound — help: Results](https://en.actionbound.com/help/article/results)
- [Actionbound — help: Testing bounds](https://en.actionbound.com/help/article/testing-bounds)
- [Actionbound — blog: Maps in Actionbound (mapy offline)](https://en.actionbound.com/blog/58bd7e414bbb147c30dc7778)
- [Spotix — Actionbound Scavenger Hunt: Full Platform Review](https://next.spotix.app/en/blog/actionbound-scavenger-hunt-review)

**Loquiz**
- [Loquiz — Pricing](https://loquiz.com/pricing/)
- [Loquiz — Pay per use](https://loquiz.com/support/pay-per-use/)
- [Loquiz — GPS reception](https://loquiz.com/support/gps-reception/)
- [Loquiz — Task location, pin and radius](https://loquiz.com/support/task-location/)
- [Loquiz — Task types and points](https://loquiz.com/support/task-types/)
- [Loquiz — Mobile data connection (offline)](https://loquiz.com/support/mobile-data-connection/)
- [Loquiz — Results page](https://loquiz.com/support/event-results/)

**ECHOES.xyz**
- [ECHOES — Pricing](https://echoes.xyz/pricing)
- [ECHOES — Creator docs: Intro](https://docs.echoes.xyz/docs/creator/intro/)
- [ECHOES — Creator docs: GPS](https://docs.echoes.xyz/docs/creator/gps/)
- [ECHOES — Creator docs: Walks](https://docs.echoes.xyz/docs/creator/walks/)
- [ECHOES — App Store (opinie)](https://apps.apple.com/gb/app/echoes-interactive-sound-walks/id1021511722)
- [ECHOES — Google Play](https://play.google.com/store/apps/details?id=xyz.echoes.android)
- [walk·listen·create — A DIY toolkit for digital sound walks](https://walklistencreate.org/2021/01/21/a-diy-toolkit-for-digital-sound-walks/)

**Smartify**
- [Smartify — Pricing (partnerzy)](https://smartify.org/partners/pricing)
- [Smartify — Content management & analytics (CMS)](https://smartify.org/partners/products/cms)
- [Smartify — Products (numpad, QR, rozpoznanie obiektu, wyszukiwanie)](https://smartify.org/partners/products)
- [Smartify — App Store](https://apps.apple.com/us/app/smartify-arts-and-culture/id1102736524)

**izi.TRAVEL**
- [izi.TRAVEL — Audio guide app](https://izi.travel/en/app)
- [izi.TRAVEL — CMS for Museums](https://izi.travel/en/help/production/cms-for-museums)
- [BalticMuseums — izi.TRAVEL (warunki: platforma bezpłatna dla dostawcy treści, PDF)](http://knowledge.balticmuseums.info/wp-content/uploads/2018/06/izi_TRAVEL_OksanaTourskaja_S.pdf)
- [izi.TRAVEL — Tour Sales Partner Program (prowizja 10–20%)](https://izi.travel/en/tour-sales-partner-program)

**STQRY**
- [STQRY — How to Create a Walking Tour App (3–7 min, 5–15 przystanków)](https://www.stqry.com/blog/walking-tour-app)
- [STQRY — What Is STQRY Guide (portal dla instytucji)](https://www.stqry.com/blog/what-is-stqry-guide-a-portal-app-for-location-based-tours-museums-and-cultural-experiences)
- [STQRY — How much does it cost to create a professional tour guide app](https://www.stqry.com/blog/how-much-does-it-cost-to-create-a-professional)

**CluedUpp**
- [CluedUpp — FAQs](https://www.cluedupp.com/pages/faqs)
- [CluedUpp — How To Play](https://www.cluedupp.com/pages/how-to-play)
- [My Kind of Meeple — CluedUpp Review](https://mykindofmeeple.com/cluedupp-review/)
- [Whimsy Soul — CluedUpp Detective Day: 6 Essential Things To Know](https://whimsysoul.com/cluedupp-detective-day/)
- [Trustpilot — CluedUpp Games](https://www.trustpilot.com/review/www.cluedupp.com)
- [JustUseApp — CluedUpp GeoGames reviews (niedokładność lokalizacji, bateria)](https://justuseapp.com/en/app/1495022341/cluedupp-geogames/reviews)
