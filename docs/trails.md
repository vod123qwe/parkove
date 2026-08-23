# Szlaki na wyprawie

Decyzje z 2026-08-22 i to, co z nich wyszło w kodzie.

## Trzy pytania, trzy odpowiedzi Jarka

1. **Skąd brać szlaki?** Jedno i drugie: prawdziwy szlak znakowany z
   OpenStreetMap, gdy przez miejsce jakiś przechodzi, plus trasa policzona
   routerem pieszym przez punkty wyprawy.
2. **Jak daleko ma iść edytowalność?** Kilka gotowych wariantów, bez edycji.
3. **Dlaczego tak?** Bo w dolinie nie ma zasięgu. Router bez sieci nie policzy
   nowej trasy, a linia rysowana palcem po mapie przestaje być trasą i staje się
   rysunkiem. Wariant policzony w domu i zapisany w danych działa wszędzie.

## Co powstaje dla jednego miejsca

`scripts/build-trails.mjs` → `src/app/data/trails.ts`

| wariant | skąd | uwagi |
| --- | --- | --- |
| Pętla przez wszystkie punkty | OSRM `trip`, profil foot, start na sugerowanym parkingu, `roundtrip=true` | kolejność punktów układa router, nie kolejność opisu |
| Krótka pętla | te same trzy punkty najbliższe parkingowi | tylko gdy pełna pętla ma ponad 2,5 km, a krótka co najmniej 700 m |
| Szlak znakowany | relacje `type=route` + `route=hiking\|foot` z Overpass, przycięte do obrysu miejsca | do trzech najdłuższych, bliźniaki po długości i starcie odsiane |

Progi wzięły się z pierwszego biegu: Kopiec Wandy dostał „trasę" na 200 m, a
Skawina „krótką pętlę" na 200 m przy pełnej 500 m. Przejście między dwoma
punktami na kopcu nie jest szlakiem, więc małe miejsca po prostu nie mają
wariantów i wiersz szlaku w karcie się nie pokazuje.

## Nazwy

Szlak znakowany nazywamy **kolorem** („Szlak żółty"), a nazwę z OSM
(„Szlak Warowni Jurajskich", „MP-241-y") wrzucamy do podpisu. W terenie szukasz
znaku w kolorze, nie tabliczki z nazwą.

## Długość szlaku znakowanego

Liczona **tylko w granicach miejsca**. Szlak Warowni Jurajskich ma
kilkadziesiąt kilometrów, ale przez Dolinę Będkowską przechodzi 5,9 km i to jest
liczba, która coś mówi. Podpis kadru mówi to wprost: „odcinek w granicach
miejsca".

Czas dla szlaków z OSM to długość dzielona przez 4,2 km/h. Dla tras liczonych
routerem bierzemy czas od routera.

## Gdzie to widać w aplikacji

- **Karta miejsca**: jeden wiersz zaraz po punktach („Szlaki i trasy, 5 wariantów
  do wyboru" albo nazwa wybranego z długością i czasem). Zaraz po punktach, bo to
  odpowiedź na pytanie, które rodzi się od razu po ich zobaczeniu.
- **Widok wyboru** (`TrailModal`): kafle jak przy parkingach, każdy ze swoim
  kadrem mapy satelitarnej i narysowaną trasą, plus znaczniki długości, czasu i
  liczby punktów. Dotknięcie wybiera i zamyka, dotknięcie wybranego zdejmuje.
- **Duża mapa**: wybrany szlak jako linia limonkowa (trasa liczona) albo w
  kolorze szlaku (znakowany), z ciemną obwódką, żeby nie ginęła w lesie.
  Rysowana **pod** śladem GPS i pod pinami: to podpowiedź, gdzie iść, a nie
  zapis tego, gdzie byłeś.
- **Lista punktów w trakcie wyprawy**: ten sam wiersz na górze, żeby zmiana
  wariantu w terenie była jednym dotknięciem.

Wybór jest zapisywany na stałe (`state.trails`, klucz `parkove-v1`), bo robi się
go w domu przy planowaniu, a w dolinie aplikacja może zostać przeładowana.

## Czego tu nie ma

- Rysowania i edycji tras w aplikacji (decyzja: gotowe warianty).
- Nawigowania po szlaku krok po kroku. Szlak jest linią na mapie, a nie
  prowadzeniem za rękę.
- Szlaków rowerowych i konnych. Router chodzi profilem pieszym, a relacje
  bierzemy tylko `hiking` i `foot`.

## Pętla prowadzona ręcznie (RINGS w build-trails.mjs)

Jarek o zalewie: „szlak jest dziwny, powinien kierować wokół jeziora,
uwzględniając też ew. place zabaw".

Pierwsze podejście było oczywiste i błędne: ułożyć pętlę z punktów wyprawy, po
kolei, brzegiem. Wyszło 3,5 km zygzaka, bo **router łączy dwa sąsiednie
przystanki najkrótszą drogą, a najkrótsza droga między dwoma punktami tego samego
brzegu nigdy nie prowadzi wokół wody**. Trasa sklejała się do brzegu zachodniego
i chodziła po nim tam i z powrotem.

Miara, która to pokazała: ile procent długości trasy przebiega bliżej niż 12 m od
jej własnego, niesąsiedniego kawałka.

| trasa | długość | zawracanie |
| --- | --- | --- |
| pętla brzegiem (kontrola, bez przystanków) | 2545 m | 20% |
| od parkingu przez wschód i zachód | 2761 m | 27% |
| moja pętla z 9 przystanków po kolei | 3557 m | 41% |
| to samo z punktem kierunkowym na wschodzie | 3742 m | 42% |
| tam i z powrotem (kontrola dolna) | 1117 m | 89% |

Kontrola jest tu ważniejsza od pomiaru. Bez niej 41% wyglądało na katastrofę, a
20% dla prawdziwej pętli mówi, że część zawracania jest nieusuwalna: dojście od
parkingu chodzi się w obie strony.

**Wniosek i mechanizm:** w RINGS nie podajemy przystanków, tylko `via`, czyli
kilka punktów wyznaczających KSZTAŁT. Przystanki wychodzą potem z tego, co gotowa
trasa mija bliżej niż `stopWithin`. Zalety są dwie i obie praktyczne:

1. żaden punkt nie wykrzywia pętli, bo pętla nie musi go dotknąć,
2. lista przystanków nie kłamie: mówi, co się zobaczy, a nie co chcieliśmy zobaczyć.

Punkt na slepym zaułku po prostu nie trafia na listę. Dla zalewu wciągnięcie
piaskowych boisk i ruin młyna wydłużało pętlę z 2,8 do 3,8 km i podnosiło
zawracanie do 52%, bo w północno-zachodni narożnik wchodzi się i wychodzi tą samą
ścieżką. Te punkty zostają w „pętli przez wszystkie punkty", która po to jest.

Gdy miejsce ma pętlę ręczną, nie generujemy już „krótkiej pętli": to byłby drugi
raz ten sam pomysł.
