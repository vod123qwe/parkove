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

**„Pieczątki" to teraz „Album"** (Jarek pytał o inną nazwę). Pieczątki opisują
mechanikę, czyli że coś przybijasz. Album obiecuje miejsce, do którego się wraca
i **patrzy**, a te ilustracje są właśnie do patrzenia, nie do odhaczania. Przy
okazji album kojarzy się z naklejkami z dzieciństwa, co jest tonem, o który
chodzi przy dziecku. Podpis: „Naklejki z odwiedzonych miejsc".

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
