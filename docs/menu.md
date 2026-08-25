# Menu, profil i ustawienia

Przebudowa z 2026-08-22. Jarek: „całe to menu do przebudowy, bo mam wrażenie, że
trzymamy trochę legacy, które jest bez sensu poukładane".

## Co było nie tak (nie wrażenie, konkret)

Pięć płaskich wierszy w menu, a pod nimi profil będący workiem na wszystko. Do
tego duplikaty:

- **Pieczątki** miały wiersz w menu **i** sekcję w profilu.
- **Wygląd mapy** i **wygląd aplikacji** miały po dwa wejścia: wiersz w menu
  **i** „Ustawienia" wewnątrz profilu.
- **Numer wersji, odświeżanie i katalog komponentów** siedziały w profilu, między
  pieczątkami a zdjęciami, choć profil jest o tym, co zrobiłeś.
- **„Dokąd dziś"**, czyli jedna z niewielu rzeczy, która realnie wyciąga z domu,
  była zakopana na samym dole profilu.

## Trzy przestrzenie

Menu jest hubem z trzema półkami. Każda odpowiada na inne pytanie:

| Półka | Pytanie | Co zawiera |
| --- | --- | --- |
| **Ty** | co zrobiłem | Moje liczby, Album |
| **Wyprawy** | gdzie iść i gdzie byłem | Miejsca do odkrycia, Moje wyprawy |
| **Ustawienia** | jak to wygląda i czym jest | Wygląd, O aplikacji |

## Nazwy, które się zmieniły

**„Pieczątki" to teraz „Wyzwania"**, po drodze przez „Album". Album był krokiem
w pół drogi: obiecywał miejsce do patrzenia i tyle, a siatka pieczątek nie mówiła
nic o tym, co można zrobić dalej. Jarek: „zamiast albumu powinny być wyzwania".

Docelowa nazwa to jednak **„Osiągnięcia"**, a w środku dwie zakładki: pieczątki i
wyzwania. Jarek: „to też powinny być taby, pierwszy to pieczątki, a drugi
wyzwania, a zakładka powinna nazywać się osiągnięcia".

To jest właściwa hierarchia i obie wcześniejsze nazwy były złe w ten sam sposób:
**nazywały jedną z dwóch rzeczy, które tam są**. Osiągnięcie jest parasolem, a
pieczątka i wyzwanie to dwa jego rodzaje, równe sobie.

Wersja z pieczątkami dorzuconymi jako ostatnia sekcja Wyzwań była przy tym gorsza,
niż wyglądała: jedna z dwóch równych rzeczy była **schowana pod drugą**, bo trzeba
było przewinąć 26 wierszy, żeby zobaczyć naklejki.

Pieczątki są pierwsze, bo są obrazkiem: wchodzisz tu, żeby popatrzeć, a lista z
paskami postępu jest do czytania. Każda zakładka nosi swoją liczbę, więc wybór nie
jest w ciemno.

Wyzwań jest 26, w czterech grupach: miejsca, punkty, wyprawy, ślady.

Dwie decyzje warte zapisania:

- **każde wyzwanie jest funkcją tego, co apka i tak wie** (odwiedziny, punkty,
  wyprawy, zdjęcia, notatki, nagrania, odpowiedzi na dylematy). Nic nie jest
  liczone osobno, więc nie ma czego zapominać ani psuć przy migracji, a wyzwania
  **działają wstecz**: to, co przeszliście wcześniej, liczy się od pierwszego
  wejścia,
- **nic nie wygasa.** Wyzwanie, które przepada w niedzielę, zamienia zabawę w
  obowiązek. Przy dziecku to ważne: można wrócić po miesiącu i doliczyć swoje.

**„Hej [imię]" to teraz „Moje liczby"**, a profil-worek przestał istnieć. Jego
zawartość rozeszła się tam, gdzie należy: liczby i zdjęcia do „Moich liczb",
wyprawy do „Moich wypraw", naklejki do Albumu, ustawienia do menu, wersja do „O
aplikacji".

## Moje liczby: zasada wyboru

Każda liczba ma **coś mówić o tobie**, a nie tylko rosnąć:

- **kilometry, wyprawy, czas w terenie, naklejki** to skala,
- **odkryte** (miejsca z 55, punkty z 152) to postęp,
- **co lubicie**: rozkład odkrytych punktów po kategoriach jako słupki. To
  najciekawsza liczba w całym ekranie, bo mówi, po co tam chodzicie, a nie ile,
- **rekordy i nawyki**: najdłuższa wyprawa, miejsce, do którego wracacie
  najczęściej, godzina, o której zwykle wychodzicie, od kiedy chodzicie,
- **najbliżej naklejki**: jedyna liczba, która jest zaproszeniem, bo da się ją
  zmienić dzisiaj. Nazwa miejsca jest klikalna i pokazuje je na mapie,
- **zostawione ślady**: zdjęcia, notatki, nagrania, odpowiedzi na dylematy.

Czego tu nie ma: rankingów i porównań z kimkolwiek. Ta aplikacja nie ma innych
ludzi i nie będzie mieć.

Polska odmiana nazw własnych nie da się zrobić szablonem („do Dolina
Będkowska"), więc nazwy stawiamy po dwukropku: „Najczęściej wracacie: **Dolina
Będkowska**, 3 razy".

Odmiana liczebników ma za to jedno miejsce: `naming.ts`. Rozsypywała się po
ekranach jako `n < 5 ? 'wyprawy' : 'wypraw'` i wychodziło z tego „1 wypraw" oraz
„1 zapisanych" w menu, a przy 22 „22 wypraw" zamiast „22 wyprawy". Reguła jest
prosta: jeden to liczba pojedyncza, końcówka 2, 3, 4 (ale nie 12, 13, 14) to
forma bliska, resztę bierze dopełniacz.

## Moje wyprawy: ślad jako miniatura

Wcześniej były wierszami w profilu: ikona, nazwa i sucha linijka liczb. Teraz
każdy wiersz pokazuje **kształt Twojej drogi**, rysowany z zapisanego przebiegu
(`journey.track`), ze złotą kropką na starcie. Każda wyprawa ma inny kształt, więc
rozpoznajesz ją z odległości metra, tak jak zdjęcie rozpoznaje się szybciej niż
podpis. Bez mapy pod spodem: dwadzieścia miniatur to byłoby dwadzieścia
kontekstów graficznych, a liczy się sam kształt.

**Wiersze z dywizorami, nie kafle w pudełkach** (Jarek: „moje wyprawy powinny
być bardziej oddzielone jak miejsca do odkrycia dywizorami ale w większym
spacingu i też popraw tam hovery, bo są jakby z takiego boxowego vibe"). Wiersz
jest przezroczysty, oddziela go włos `--border-subtle` zaczynający się za
miniaturą, a powietrza jest więcej niż w liście miejsc, bo ślad sam zajmuje
wysokość. Dwie pułapki po drodze:

- dywizor jako `border-top` rysowałby się **pod** podświetleniem hovera, więc
  jest pseudoelementem `.jrn + .jrn::before`,
- miniatura i pastylki stały na `--bg-surface-sunken`, czyli na tym samym tle,
  którym podświetla się wiersz, i na hoverze znikały. Na podświetlonym wierszu
  wchodzą o stopień wyżej, na `--bg-surface`: hover ma podnosić cały wiersz, a
  nie zjadać z niego elementy.

**Lista miejsc zostaje w menu**, choć ma też przycisk na mapie, i to nie jest
duplikat, tylko dwa konteksty: przycisk na mapie **nie istnieje w trakcie
wyprawy** (jego miejsce zajmuje pasek wyprawy), więc menu jest wtedy jedyną
drogą do listy. Jarek zapytał o to wprost i to pytanie było odpowiedzią.

## Wygląd: kafle z podglądem, nie nazwy

Motyw i styl mapy to to samo pytanie („jak ma wyglądać"), więc mieszkają na
jednym ekranie. Wybór idzie **przez podgląd**, bo przy trzech stylach mapy nazwy
nic nie mówią, dopóki się ich nie spróbuje.

Podglądy są **rysowane, nie fotografowane**. Prawdziwy kadr wymagałby albo trzech
instancji mapy GL naraz (drogo, patrz komentarz w TileMap.tsx), albo zdjęć w
repozytorium, które martwieją przy każdej zmianie palety. Rysunek bierze kolory z
tej samej definicji stylu (`MAP_STYLES.swatch`), więc zawsze zgadza się z tym, co
zobaczysz. Motyw „auto" jest przecięty po skosie: pół jasnego, pół ciemnego.

Uwaga na nazwy w kodzie: `looksModalOpen` to ten ekran, a `looksOpen` to szybki
przełącznik stylu **na mapie**, pod przyciskiem warstw. Dwie różne rzeczy.

## O aplikacji

Rzeczy o samej apce, nie o Tobie: odświeżenie wersji (service worker podaje pliki
z pamięci, więc po wdrożeniu trzeba raz pobrać ręcznie), historia zmian, katalog
komponentów i **diagnostyka ekranu**. Diagnostyka jest tu jawnym wierszem, a nie
sekretem pod trzema dotknięciami numeru wersji: ta aplikacja ma jednego
użytkownika i to on ją debuguje.

## Czego nie ma

**„Dokąd dziś"** wypadło na życzenie Jarka. Było krótko w menu jako podpowiedź
dnia; wróci, jeśli kiedyś będzie po co.

**Profil** jako osobny ekran przestał istnieć. To była ostatnia rzecz z legacy:
worek, w którym leżały obok siebie statystyki, naklejki, zdjęcia, wyprawy,
ustawienia i numer wersji.

## Arkusz miejsc na ekranie głównym

Nie mieszka już za przyciskiem: wystaje na dole i rozwija się w górę (Jarek,
2026-08-22). Wystawanie ma **290 px** i jest liczone składnik po składniku, bo
prośba była konkretna: „tytuł, search, taby i jeden kolejny park".

| Składnik | Wysokość |
| --- | --- |
| nagłówek arkusza | 84 |
| pole szukania z odstępami | 70 |
| zakładki | 44 |
| jeden wiersz miejsca | 76 |
| **razem** | **274 → 290** |

Dlaczego 290, a nie 274: przy 274 pomiar pokazał 60 widocznych pikseli z 76, więc
park nie był całym parkiem.

Nagłówki grup (Zaczęte, Nietknięte, Zdobyte) czekają do rozwinięcia. Bez tego
widoczny wiersz byłby tytułem grupy, a nie miejscem.

Ta sama liczba jedzie do `--pk-bottom-taken`, czyli do zmiennej mówiącej, ile u
dołu jest zajęte. Dzięki temu komunikaty same wiedzą, gdzie się zatrzymać, i nie
trzeba pamiętać o drugim miejscu przy każdej zmianie wysokości.

## Trzy półki po przebudowie z 2026-08-23

| Półka | Co zawiera |
| --- | --- |
| **Ty** | Moje liczby, Osiągnięcia, Moje wyprawy |
| **Miejsca** | Wszystkie parki |
| **Ustawienia** | Wygląd, O aplikacji |

„Moje wyprawy" przeszły do **Ty** na życzenie Jarka, a półka, która po nich
została, nazywa się teraz **Miejsca**, bo jej jedyne wejście jest o miejscach, a
nie o wyprawach. Nazwa poszła za treścią, nie odwrotnie.

„Miejsca do odkrycia" to teraz **„Wszystkie parki"**, i tak samo nazywa się
arkusz, który ten wiersz rozwija: obiecywanie „do odkrycia" było nieuczciwe, bo
lista pokazuje wszystkie, także zdobyte.

## Arkusz miejsc: widoczność jest wyliczana, nie przełączana

Jarek: „gdy zakończyłem wyprawę, to zniknęły miejsca do odkrycia i musiałem wejść
w menu".

Widoczność arkusza była **stanem**, gaszonym przy wejściu w miejsce z listy i przy
pokazywaniu czegoś na mapie, a zapalanym tylko z menu. Po zakończeniu wyprawy
arkusz nie wracał, bo ktoś go wcześniej zgasił i nikt nie zapalił.

Teraz jest **wyliczana** z tego, co zajmuje dół: `!selected && !expedition`. Nie ma
tam żadnego stanu, który mógłby zostać w złej pozycji.

Został osobny znacznik na to, czy arkusz stoi **rozwinięty** (menu prosi o pełną
listę, dotknięcie wyszukiwarki też), i przy nim wyszła pułapka warta zapisania:
DS zgłaszał zatrzask przy **każdym renderze**, a nie przy zmianie, bo wołający
podaje funkcję tworzoną w locie. Cokolwiek wołający na tej podstawie ustawiał,
kasowało się w następnej klatce. Każda prośba o rozwinięcie ginęła cicho.
Zdarzenie zmiany musi się dziać przy zmianie: w DS pilnuje tego referencja.

---

## Menu jako pelny ekran profilu (2026-08-25, 0.109.0)

Jarek: "moglby byc full screen, gdzie u gory sa jakies podstawowe info o
mnie, najwazniejsze, a pod spodem odpowiednio podzielone linki (...)
normalne cellki: ikonka i tekst i chevron, z wiekszymi spacerami".

- **ProfileScreen.tsx**: Modal push "Ty". U gory pierscien postepu
  (odkryte/56) + linia "X z 56 miejsc odkrytych" + StatGrid 3: wyprawy,
  km w nogach, zlote. Nizej sekcje Ty / Miejsca / Ustawienia jako
  ListItemy z chevronem (klasa .prof-cells podbija pion do 15 px).
- Wejscia do modalow NIE zamykaja profilu: wstecz z Moich liczb wraca do
  profilu, nie na mape. Wyjatek: Wszystkie parki (zamyka i rozklada liste).
- **JournalScreen.tsx**: "Wyprawy i odkrycia" pod jednym dachem,
  Segmented u gory. Wyprawy = lista sladow (przeniesiona z JourneysModal,
  plik skasowany) + StatGrid podsumowania (wypraw, km razem, w drodze).
  Odkrycia = DiscoveriesScreen z propem `embedded` (bez wlasnego NavBara
  i tytulu, position absolute w rodzicu).
- **LooksModal**: radiowiersze (ikona po lewej, kolko po prawej) zamiast
  kafli z rysowanymi podgladami; ThemeArt/MapArt skasowane.

GOTCHA (drabina z-index, znowu): JournalScreen renderowany w .app-shell
z z-index 210 i tak ladowal POD modalem profilu (200), bo **.app-shell ma
position: fixed, a Chromium robi z fixed kontekst stosu** - 210 liczylo
sie tylko wewnatrz shella. Kazdy pelnoekranowy widok otwierany nad
modalami MUSI isc przez createPortal(document.body) (tak jak edytor
trasy). Zmierzone elementFromPoint przed i po.

Druga wpadka dnia: sprzatanie CSS w 0.106 przypadkiem wycielo style
.app-searchrow i .app-fbtn (okragly przycisk filtrow przy wyszukiwarce);
przywrocone tutaj.
