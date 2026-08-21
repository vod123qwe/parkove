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
