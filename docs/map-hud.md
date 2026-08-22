# Co jest na mapie i co jest na wierzchu

Trzy rzeczy z 2026-08-22, wszystkie o tym samym: ile ekranu należy się mapie.

## Filtry mapy (lewy górny róg)

Ten narożnik był pusty od początku, bo procent odkrytego miasta to liczba, nie
powód, żeby wyjść. Filtry są pierwszą rzeczą, która na niego zasłużyła:
dotyczą mapy, nie ekranu.

- **Szlak**, **Parkingi**, **Place zabaw**, **Kawa i jedzenie**. Wszystkie
  domyślnie włączone.
- **Parkingi znaczą wszystkie**, nie tylko sugerowany. To był powód, dla którego
  filtry powstały. Każdy parking ma też swoją stronę w karcie podglądu, więc pin,
  który widzisz, ma gdzie się przedstawić.
- Pojawiają się razem z wybranym miejscem i razem z nim znikają: bez wybranego
  parku nie ma czego filtrować. **Ustawienia zostają zapisane**, więc następny
  park otwiera się tak, jak zostawiłeś poprzedni.
- W trakcie wyprawy są widoczne cały czas, bo wtedy najbardziej się przydają:
  to jedyny moment, gdy chcesz zdjąć z mapy wszystko poza szlakiem.
- Licznik na przycisku mówi, ile rzeczy zdjąłeś. Bez niego mapa mogłaby milczeć
  o czymś, o czym myślisz, że jej nie ma.

Podpisy pod nazwami zostały tylko przy „Parkingach". Cztery wiersze z podpisami
robiły panel na 280 px i ostatni wiersz wchodził pod kartę miejsca.

Nowy komponent systemu: **Switch** (`src/ds/components/Switch.tsx`, karta w
katalogu). Segmented wybiera jedno z kilku, Switch odpowiada na pytanie tak-nie.
Cały wiersz jest celem, bo sam suwak na 42 px to na telefonie pudło.

## Zwijanie karty wyprawy

Swipe w dół zabiera górę karty (kreski postępu, cel, dystans) i zostawia **sam
pasek z czasem, kilometrami i punktami**. Wysokość idzie za palcem, więc widać,
że to jedna rzecz, która się skraca, a nie dwie karty, które się podmieniają.

Szczegóły, które trzeba było rozstrzygnąć:

- **Przeciągnięcie nie jest dotknięciem.** Karta jest przyciskiem otwierającym
  listę punktów, więc ruch poniżej 6 px liczy się jako dotknięcie, a większy
  blokuje klik.
- Wysokość dostaje wartość w pikselach z palca, więc w trakcie przeciągania nie
  ma żadnego przejścia CSS. Klasa `-snap` włącza je tylko na czas dociągnięcia
  po puszczeniu (220 ms).
- Zwinięta karta traci kreskę nad statystykami: pasek to pasek, nie stopka.
- Stan **przeżywa przeładowanie** (`pk-exp-folded`), bo w terenie aplikacja
  może wstać od nowa, a decyzja „chcę więcej mapy" zostaje ta sama.

## Pogoda w karcie miejsca

Na dole, pod dojazdem: to ostatnia rzecz, którą sprawdzasz przed wyjściem, i
pierwsza, która decyduje, czy w ogóle.

- **Open-Meteo**, wybrane świadomie: nie wymaga klucza ani pośrednika, wysyła
  nagłówki CORS i jest darmowe do użytku niekomercyjnego. Wszystko inne
  (OpenWeather, WeatherAPI) wymaga klucza, a klucz w statycznej aplikacji jest
  publiczny, więc trzeba by go chować w Workerze jak przy roślinach.
- Teraz: temperatura, odczuwalna, wiatr i słowo („pochmurno", „ulewa").
- Pas godzin przewijany poziomo, **zaczyna się na „teraz"**. Bez tego pierwsze,
  co widać, to wyszarzony poranek, czyli godziny, na które nie masz już wpływu.
- Godziny, które minęły, zostają wyszarzone i dostępne po przewinięciu w lewo.
  Poranne lanie znaczy kałuże po południu, więc to informacja, nie balast.
- Szansa opadu pokazuje się od 20 procent. Niżej to szum, nie prognoza.
- Odstępy w pasie godzin podbite po uwadze Jarka („ciasno"): przerwa między
  kolumnami z 4 na 8 px, wewnątrz kolumny z 3 na 6, wysokość z 8 na 12, kolumna
  56 px szeroka. Wiersz z procentem opadu **jest zawsze**, choćby pusty, bo
  inaczej kolumny mają różne wysokości i pas traci rytm.
- Każda odpowiedź siedzi w `localStorage` per miejsce (30 minut świeżości). Bez
  zasięgu pokazujemy ostatnią znaną prognozę i mówimy, z której godziny jest.
  Stara prognoza jest w dolinie warta więcej niż puste pole, ale tylko wtedy,
  gdy widać, że jest stara.

### Okno pogodowe

Pas godzin mówi, **jak będzie**. Jedna linijka pod nim mówi, **o której wyjść**,
bo tego nikt nie chce sam wyliczać. Szukamy najdłuższego ciągu godzin z szansą
opadu poniżej 30 procent, w granicach dnia (7 do 20), zaczynając najwcześniej od
teraz.

Trzy odpowiedzi, trzy tony:

- **cały pozostały dzień suchy**: „Spokojnie do wieczora, 18 do 20 stopni."
- **jest lepsza pora**: „Najlepiej między 14 a 17, wtedy 19 do 20 stopni."
- **nigdzie nie jest sucho**: „Dziś leje. Najmniej między 19 a 20, i tak weź
  kurtkę." Wtedy tło linijki jest niebieskie, nie miętowe: zdanie nie udaje
  dobrej wiadomości.

Po dwudziestej linijka znika, bo okno na spacer się zamknęło i podpowiadanie
godziny byłoby udawaniem.

## Pogoda w liście miejsc

Wybierając w niedzielę rano między pięcioma dolinkami chcesz zobaczyć, gdzie o
czternastej nie leje, a nie otwierać pięciu kart po kolei. Dlatego każdy wiersz
listy ma po prawej **ikonę nieba, stopnie i procent opadu**, ten ostatni tylko
od 50 procent w najbliższych sześciu godzinach.

- **Jedno zapytanie na wszystkie miejsca.** Open-Meteo przyjmuje wiele
  współrzędnych naraz i odpowiada tablicą w tej samej kolejności, więc 56 miejsc
  to jedno zapytanie, nie 56. Płacimy za nie tylko wtedy, gdy lista jest otwarta,
  a wynik trzyma się 30 minut.
- **Pierścień postępu zniknął z wiersza.** Ten sam powód, co przy karcie
  podglądu: postęp stoi w tym samym wierszu słowami („2 z 5 punktów"), a pusty
  pierścień nie mówił nic o miejscu. Stopnie mówią.

## Język pinów: okrągłe kontra kwadratowe

Problem był taki, że parking, kawa i plac zabaw różniły się od punktów wyprawy
tylko odcieniem ciemnego krążka, a na zdjęciu satelitarnym lasu odcień widać
dopiero z bliska. Z daleka wszystko było „ciemnym kółkiem".

Zasada, od 2026-08-22:

- **Okrągłe jest to, po co przyszedłeś**: punkty wyprawy, pieczątki, twoje
  zdjęcia, notatki i auto.
- **Kwadratowe (mocno zaokrąglone) jest to, co ci służy**: parking, jedzenie,
  plac zabaw.

Kształt czyta się natychmiast i w każdym rozmiarze, więc niesie najważniejszy
podział, a odcień może dopowiadać resztę: niebieski parking, ambrowe jedzenie,
fioletowy plac zabaw. Znaki na pinach usług **rozjaśnione** (F75, Y78, B78
zamiast F88, Y88, B84), bo odcień ma być widoczny na kaflu, nie po powiększeniu.

**Rozmiar mówi, ile coś znaczy.** Parking był dotąd największą rzeczą na mapie,
większą od celu, po który się tu przyjechało. Usługi zjechały o krok w dół
(0,18 do 0,36 zamiast 0,24 do 0,46), punkty wyprawy zostały bez zmian.

## Ślad z białą obwódką

Ślad wyprawy jest ciemną oliwką (`--map-track`) i na zdjęciu satelitarnym lasu
po prostu ginął: ciemna linia na ciemnym tle. Pod nim leży teraz biała otoczka
(6,5 px, 70 procent), która czyta się na każdym podłożu. Sam kolor śladu zostaje,
więc nie miesza się z limonkowym szlakiem: **szlak to podpowiedź, ślad to zapis**.
