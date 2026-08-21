# Decyzje sesji 2026-08-21

Runda grillowa po dwóch tygodniach testów w terenie. Stan wdrożenia oznaczony.

## Licznik „% Krakowa" — USUNIĘTY (v0.44.0)

Jarek: „ten procentowy licznik nie za wiele znaczy, trochę to teraz bajer".

Zniknął pierścień i napis z lewego górnego róg mapy oraz duże „5%" z profilu.
Nic **nie** wstawiamy na to miejsce. Świadoma decyzja: krok w tył, żeby potem
zrobić dwa w przód.

Zaparkowane pomysły na ten róg (do rozważenia, gdy sam się poprosi):

- **mgła wojny** — mapa przygaszona tam, gdzie nie byłeś, odsłaniana kwadratami
  ~50 m ze śladu GPS, który już zapisujemy w każdej wyprawie. Bez mianownika,
  więc dorzucanie miejsc niczego nie psuje. Było w pierwotnym briefie i nigdy
  nie powstało. Implementacja bez zależności: kratka przyciągana do siatki
  (kwadraty nigdy się nie nachodzą) jako dziury w ciemnym wieloboku.
- rytm: ostatnia wyprawa, seria tygodni
- „gdzie dalej": najbliższe miejsce, w którym nie byłeś

## Dolinki Krakowskie — WCHODZĄ

Kontekst: `polskapogodzinach.pl/dolinki-krakowskie`. Park **krajobrazowy**, nie
miejski. Zmierzone odległości od Rynku (Nominatim) i zawartość (Overpass):

| Dolina | Od Rynku | Gmina | Ścieżki | Szlaki | Skały/wspin. | Jaskinie | Zabytki |
|---|---|---|---|---|---|---|---|
| Kluczwody | 13,9 km | Wielka Wieś | ~124 odc. | — | — | — | — |
| Bolechowicka | 14,9 km | Zabierzów | 179 odc. | 6 | 17 / 21 | 6 | 7 |
| Kobylańska | 15,9 km | Zabierzów | — | — | — | — | — |
| Będkowska | 18,7 km | Jerzmanowice-Przeginia | 132 odc. | 3 | 62 / 108 | 6 | 1 |
| Szklarki | 20,8 km | Jerzmanowice-Przeginia | — | — | — | — | — |
| Racławki | 21,7 km | Krzeszowice | — | — | — | — | — |
| Eliaszówki | 24,6 km | Krzeszowice | 727 odc. | 4 | 15 / 0 | 0 | 42 |

Długość osi Doliny Będkowskiej z OSM: **8,1 km**. Bolechowicka to ~1,5 km
wąwozu, najdłuższy odcinek ścieżki 0,6 km, czyli spacer do godziny.

Wniosek: to **nie są proste szlaki**. Przez każdą dolinę idzie kilka
znakowanych szlaków, a nazwane rzeczy leżą po obu stronach.

### Ustalenia

1. **Model: obszar z punktami.** Bez poziomu „wybierz szlak", bez dzielenia
   długich dolin na odcinki. To jest dokładnie ten model, który już mamy
   (wielobok + POI), więc zero nowego modelu danych.
2. **Zakres pierwszej partii: trzy najbliższe** — Kluczwody, Bolechowicka,
   Kobylańska. Wszystkie w promieniu 16 km, pociągiem do Zabierzowa plus
   spacer. Po nich ocena, zanim ruszymy pozostałe cztery.
3. **Pieczątka z progiem w danych** (`stampAt`, np. 3 z 6). Jedna mechanika dla
   całej apki, tylko z pokrętłem. Parki zostają na „wszystkie punkty".
4. **Zakładki w liście miejsc:** Wszystkie / Dolinki Krakowskie / Parki
   Krakowskie. Filtrują listę, nie mapę. Filtry rozwiniemy później.
5. Do każdej doliny dochodzi linijka „jak dojechać" (stacja, parking), bo to
   jest prawdziwy próg wejścia dla wyprawy z dzieckiem.

## Kolejność prac

Najpierw **przegląd i sprzątanie interfejsu**, potem Dolinki. Powód: mniej
powierzchni do rozbudowy i nie dokładamy zakładek do ekranów, które i tak
chcemy przerzedzić.

## Co zbudowane (v0.46.0)

- `src/app/data/quests-dolinki.ts`: trzy wyprawy, po 5 punktów, `stampAt: 3`.
  Współrzędne punktów to węzły OSM (Overpass), fakty w opisach z polskiej
  Wikipedii, linki w `sources`.
- `parks.json`: trzy wieloboki. Bolechowicka 21,3 ha i Kluczwody 34,9 ha to
  granice rezerwatów z OSM (Nominatim, `polygon_geojson`). Kobylańska nie jest
  rezerwatem, więc jej 72,7 ha to otoczka wypukła nazwanych obiektów w jarze,
  rozepchnięta o 90 m. Nowy `kind: 'valley'` i `group: 'dolinki'`.
- `parkinfo.ts`, `transit.ts`, `parking.ts`: opisy, dojazd (numery autobusów
  NIEPOTWIERDZONE, dlatego nacisk na kolej do Zabierzowa), parking pod Bramą
  Bolechowicką ze współrzędnych OSM.
- Zakładki w liście miejsc: Wszystkie / Dolinki / Parki. Krótkie etykiety, bo
  „Dolinki Krakowskie" i „Parki Krakowskie" nie mieszczą się w segmentowanym
  przełączniku na 375 px.
- Jedna definicja pieczątki (`progress.ts`): próg z danych, domyślnie wszystkie
  punkty. Profil przestał liczyć pieczątkę za samo wejście.

### Zostało do zrobienia

- **Zdjęcia**: żadna dolina nie ma zdjęcia, więc hero pokazuje ikonę zamiast
  obrazu. Do zrobienia jak przy parkach, z Wikimedia Commons.
- **Kopiec Bzowskich** (50,1639 / 19,7549) i **Schronisko na Kawcu**
  (50,1625 / 19,7661) leżą poza jarem Kobylańskiej, więc nie weszły. Kopiec ma
  mocną historię (mogiła dwóch Bzowskich, 200-letni krzyż, punkt obserwacyjny
  rosyjskich służb granicznych, panorama Krakowa i Tatr) i zasługuje na osobne
  miejsce przy Będkowicach.
- Cztery dalsze doliny: Będkowska (8,1 km, więc raczej dwa miejsca), Szklarki,
  Racławki, Eliaszówki (727 odcinków ścieżek i 42 obiekty historyczne).
- Numery linii autobusowych do sprawdzenia w terenie (`verified: false`).

## Runda druga (v0.47.0): pozostałe cztery doliny i zdjęcia

Siedem dolin z ośmiu wchodzących w skład Parku Krajobrazowego Dolinki
Krakowskie. Brakuje Doliny Czubrówki, która jest kontynuacją Racławki i nie ma
własnego rezerwatu ani osobnego zestawu nazwanych obiektów.

| Dolina | Obszar | Skąd granica | Punkty | Pieczątka |
|---|---|---|---|---|
| Kluczwody | 34,9 ha | rezerwat (OSM) | 5 | 3 |
| Bolechowicka | 21,3 ha | rezerwat (OSM) | 5 | 3 |
| Kobylańska | 72,7 ha | otoczka obiektów w jarze | 5 | 3 |
| Będkowska | 268,8 ha | korytarz 170 m wokół osi doliny | 5 | 3 |
| Racławki | 473,9 ha | rezerwat (OSM) | 5 | 3 |
| Eliaszówki | 109,2 ha | rezerwat (OSM) | 4 | 3 |
| Szklarki | 169,4 ha | korytarz 200 m wokół potoku | 3 | 2 |

Wieloboki uproszczone algorytmem Douglasa-Peuckera z tolerancją 0,00012 stopnia
(ok. 13 m): Racławki 445 → 174 punkty, Będkowska 338 → 190. `parks.json` waży
68 KB. **Gotcha:** DP na zamkniętym pierścieniu zwija go do jednego punktu, bo
pierwszy punkt równa się ostatniemu i wszystkie odległości wychodzą zerowe.
Trzeba ciąć pierścień na dwie połówki i upraszczać każdą osobno.

### Zdjęcia

`scripts/fetch-photos-dolinki.mjs`, 15 zdjęć z Wikimedia Commons, wszystkie z
podpisem i licencją w danych. Każde miejsce ma hero, siedem punktów ma własne
zdjęcie. Odrzucone: „Jaz górecko kościelne" przyszedł na zapytanie o wodospad
Szum i był z zupełnie innego regionu, więc wyleciał. Commons rate-limituje
serie, przy większej liczbie zapytań trzeba 9 sekund przerwy.

### Czego nadal nie ma

- Wodospad **Szum** i **Sokolica** bez własnych zdjęć (Sokolica jest w galerii
  Będkowskiej, ale nie jako punkt).
- **Kopiec Bzowskich** (50,1639 / 19,7549) leży poza wszystkimi wielobokami,
  ma zdjęcie i mocną historię. Kandydat na osobne miejsce przy Będkowicach.
- **Diabelski Most** i **klasztor w Czernej** leżą poza rezerwatem Eliaszówki,
  więc są tylko w opisie i w galerii.
- Numery linii autobusowych: wszystkie wpisy `verified: false`.
