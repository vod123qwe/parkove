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

## Dojazd: tylko autem (v0.48.0)

Decyzja Jarka: skoro do Dolinek nie dojeżdża MPK, a numery linii
aglomeracyjnych były moim zgadywaniem, wpisy komunikacji **wylatują**. Zostaje
dojazd autem.

Wszystkie siedem dolin ma teraz parking ze **współrzędnych węzłów
`amenity=parking` z OSM**, wybranych jako najbliższe wejściu do doliny, z
odległością podaną w podpowiedzi. Dwie doliny mają po dwa parkingi.

Arkusz miejsca sam ukrywa sekcję komunikacji, gdy nie ma wpisu w `TRANSIT`,
więc nie było potrzeby ruszać kodu.

## Błędne współrzędne punktów: audyt

Jarek w terenie: „w parku w Skawinie pomnik jest gdzie indziej, tak samo dąb,
Zakrzówek gdzie indziej ma baseny". Sprawdzone i potwierdzone wobec OSM:

| Punkt | Było | Jest | Błąd |
|---|---|---|---|
| skawina `dab-pomnik` | 49,97284 / 19,82392 | 49,97394 / 19,82162 (drzewo z tagiem pomnika przyrody) | 205 m |
| skawina `sokol` | 49,9733 / 19,8238 | 49,97458 / 19,82325 (między Pałacykiem Sokół i Pomnikiem Kazimierza Wielkiego), promień 55 | 130-165 m |
| skawina `starorzecze` | 49,97363 / 19,82175 | 49,9736 / 19,81908 (zachodnia granica parku) | 276 m |
| zakrzowek `kapielisko` | 50,0407 / 19,9135 | 50,0341 / 19,9115 (skupisko pomostów w OSM), promień 70 | **760 m** |

Uwaga do starorzecza: najbliższa woda w OSM leży **poza** wielobokiem parku, więc
punkt stoi teraz na granicy parku najbliżej wody. Do sprawdzenia w terenie, czy
ta treść w ogóle należy do tego parku.

### Narzędzie: `scripts/audit-poi-coords.mjs`

Dwa tryby:

- `--precision` (bez sieci): wypisuje punkty wpisane z ręki. Trop: współrzędne
  z OSM mają 5 do 6 miejsc po przecinku, wpisane z palca 3 do 4. **22 z 136
  punktów** ma najwyżej 4 miejsca, czyli siatkę 11 m lub gorszą. Wśród nich były
  oba zgłoszone przez Jarka.
- bez flagi: dla każdego punktu szuka w OSM obiektu tej samej klasy (pomnik,
  drzewo, pomost, woda, jaskinia, skała, budynek z nazwą) w granicach parku i
  liczy odległość. Flaguje powyżej 60 m. Cache per park w `.tmp/osm-cache.json`,
  więc można dokończyć w kolejnych podejściach.

**Blokada 2026-08-21:** Overpass przestał odpowiadać w trakcie (najpierw 504, potem
timeouty), więc pełny audyt 136 punktów nie został dokończony. Skrypt jest gotowy
i pomija parki już zapisane w cache.

### Lista 22 punktów wpisanych z ręki (do weryfikacji)

3 miejsca po przecinku: `dolina-eliaszowki/siedem-progow`,
`kopiec-kosciuszki/raclawice-armata`, `wisniowy-sad/flirt-wodorostow`,
`wyspianskiego/pomnik-nowakowskiego`.

4 miejsca: `jalu-kurka/palac-tarnowskich`, `kopiec-krakusa/azymut`,
`kopiec-krakusa/rekawka`, `kopiec-wandy/kumir`, `krakowski/swiatowid`,
`laki-nowohuckie/storczyki`, `mlynowka/kosciol-wojciecha`,
`park-jordana/popiersia`, `planty/ginczanka`, `planty/narcyz-wiatr`,
`planty-bienczyckie/gitara`, `planty-bienczyckie/lawendowy-ogrod`,
`przylasek-rusiecki/zbiornik-1`, `reduta/staw-reduta`, `solvay/dom-lazarza`,
`szymborskiej/park-kieszonkowy`.

Uwaga: precyzja nie łapie wszystkiego. Skawiński dąb miał 5 miejsc po przecinku
i mimo to stał 205 m obok.

## Audyt dokończony (v0.48.1)

Overpass nie wstał, ale **Nominatim w trybie przestrzennym** okazał się lepszym
narzędziem: szuka nazwy punktu ograniczony do prostokąta parku (`viewbox` +
`bounded=1`), czyli po nazwie i po miejscu naraz. 136 punktów, jedno zapytanie na
punkt, 1,3 s przerwy.

**Wynik: 77 punktów ma trafienie po nazwie w OSM, 76 z nich zgadza się co do
0 do 9 metrów.** Reszta (59) ma nasze własne, opisowe nazwy („Stok Rękawki",
„Linia dwóch kopców"), których w OSM nie ma, więc tą metodą się ich nie sprawdzi.

### Poprawione współrzędne (6 punktów)

| Punkt | Błąd | Źródło prawdy |
|---|---|---|
| `zakrzowek/kapielisko` | 760 m | skupisko `man_made=pier` w OSM |
| `planty/matejko` | 459 m | `historic=memorial` „Jan Matejko", Zaułek Książąt Czartoryskich. Nasz własny opis mówił „między Barbakanem a Bramą Floriańską", a współrzędna wskazywała zachodnie Planty |
| `skawina/starorzecze` | 276 m, potem jeszcze 102 m | Nominatim zna obiekt „Starorzecze Skawinki". Moja pierwsza poprawka (granica parku najbliżej wody) też była zgadywaniem i też była zła |
| `skawina/dab-pomnik` | 205 m | drzewo z `denotation=natural_monument` |
| `skawina/sokol` | 165 m | Pałacyk „Sokół" + Pomnik Kazimierza Wielkiego, promień 55 żeby objąć oba |
| `dolina-szklarki/bukowe-skaly` | 70 m | kanoniczny punkt OSM, promień podniesiony do 70, bo to grupa skał |

### Wnioski metodologiczne

1. **Precyzja współrzędnych to słaby trop.** Z 22 punktów o 3-4 miejscach po
   przecinku większość okazała się poprawna (Pałac Tarnowskich na `19.9423`
   trafia co do metra, bo to `19.94230` z obciętym zerem). Odwrotnie też:
   skawiński dąb miał 5 miejsc i stał 205 m obok.
2. **Dopasowanie po nazwie musi wymagać wspólnego słowa.** Nominatim w trybie
   `bounded` dopasowuje na siłę: na „Pomnik Kraka" oddał „Jan Matejko" 500 m
   dalej i audyt krzyknął fałszywie. Po dodaniu warunku wspólnego znaczącego
   słowa fałszywy alarm zniknął, a Krak potwierdził się na 1 m.
3. **Pusta baza udaje poprawną odpowiedź.** `overpass.osm.ch` odpowiada 200 i
   pustą listą na każde pytanie, bo nie ma danych (`timestamp_osm_base` to numer,
   nie data). Zapisało mi 44 „sprawdzone" parki z zerem obiektów, czyli audyt
   raportował sukces, nie sprawdziwszy niczego. Skrypt waliduje teraz znacznik
   czasu i obecność `remark`.

### Zostało: 16 par punktów zaliczanych jednym staniem

`node` sprawdza też, które punkty leżą bliżej siebie niż ich promienie. Takich par
jest 16, w tym `kopiec-wandy/szczyt-wandy` i `wanda-matejko` **metr od siebie**.
To nie błąd współrzędnych, a pytanie projektowe: dwa punkty na jednym miejscu dają
dwa odkrycia naraz i psują rytm zbierania. Do decyzji Jarka: scalić, rozsunąć albo
zostawić.

Pary: krakusa (szczyt/azymut 20 m), jordana (pomnik/popiersia 32), krakowski
(swiatowid/pocalunek 23, pocalunek/zafrasowanie 23), bednarskiego 35, kopiec-wandy
**1**, bagry 22, wyspianskiego 32, kosciuszki (szczyt/fort 25, fort/kaplica 25),
panienskie-skaly 39, szwedzki 59, stacja-wisla 76, szymborskiej 13, zielony-jar 64,
bolechowicka (brama/mur 29, tu akurat słusznie, bo to sąsiadujące skały).


## Co to za miejsce: etykiety z OSM

Kawiarnia nazywała się tylko „Kawiarnia", a plac zabaw „Plac zabaw". Nazwa nie
odpowiadała na pytanie, które Jarek zadaje patrząc na kafel: **czy warto tam
iść?** Dociągnięte z Nominatim `extratags` (210 sprawdzonych miejsc, 162
trafienia, 128 z tagami) i przetłumaczone na etykiety: `surface=woodchips` →
„zrębki", `cuisine=pizza;coffee_shop` → „pizza, kawa", `outdoor_seating=yes` →
„ogródek". Godziny z `opening_hours` tłumaczy `fmtHours`: „Mo-Su 12:00-23:30"
czyta się jako „codziennie 12–23:30".

Trę decyzje warte zapamiętania:

1. **Tłumaczenie w skrypcie, nie w aplikacji.** `scripts/build-amenity-details.mjs`
   generuje `src/app/data/amenity-details.ts`. To decyzja redakcyjna, więc ma
   mieszkać w słowniku, który się poprawia i puszcza od nowa.
2. **Zastrzeżenia jednego miejsca nie opisują parku.** Kafel Parku Bednarskiego
   pokazał „dla klientów", bo taki jest jeden z dwóch placów. Na kaflu zostają
   tylko cechy widoczne na miejscu (`SKIP_ON_TILE`); dostęp i udogodnienia
   żyją w wierszu listy i na karcie miejsca.
3. **Nie powtarzamy nazwy w podpisie.** Bezimienny plac nazywa się „Plac zabaw",
   więc podpis „Plac zabaw · Plac zabaw" był echem. Podpis dodaje cechy albo nic.

### Zdjęcia lokali: dlaczego linkiem, a nie miniaturką

Jarek chciał miniaturki wnętrza i dań. Google Places API wymaga klucza z
billingiem, a w statycznej PWA na GitHub Pages każdy klucz jest publiczny; licencja
zabrania też trzymania tych zdjęć u siebie. Commons ma zabytki, nie kawiarnie.
Stąd dwie pastylki-linki na karcie miejsca: **Zdjęcia i opinie** (Google Maps z
nazwą i współrzędnymi, bo sama nazwa trafia w inny lokal tej samej sieci) oraz
**Strona**, gdy OSM zna `website`. Dla bezimiennego placu zabaw linku nie ma,
bo nie ma czego szukać.

### Karta miejsca: skąd się brała krzywizna

Akapity w karcie miały **domyślne marginesy przeglądarki** (16 px nad nazwą,
12 pod podpisem), więc blok tekstu miał 84 px zamiast 40 i ikony wisiały w
połowie niczego. Po wyzerowaniu: nagłówek 44 px (równo z wysokością przycisku),
cechy pełną szerokością pod nim. Linki dostały 32 px wysokości i pole dotyku
44 px pseudoelementem, bo 22-px pastylka jest nietrafialna palcem.

## Odlożone na później (prośby Jarka)

- **Karta szczegółów parku, nowy układ:** tytuł **nad** zdjęciami (nie na nich),
  pod tytułem slider zdjęć, gdzie jedno zdjęcie ma szerokość kontenera minus
  marginesy i jest zaokrąglone, a pod tym reszta treści.
- **Swipe na module live** podczas wyprawy: zwija kartę „następny punkt" do
  samego paska statystyk (minuty, km, punkty).
- **Ładniejsze kolory ikon** placu zabaw i kawiarni w nowym stylu pinów.
