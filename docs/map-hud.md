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
