# Wyprawa tymczasowa: Odeceixe (Costa Vicentina)

Dodana 2026-08-28 na prośbę Jarka: miejsce do testów dla kogoś, kto jest
w Portugalii. Ma się **nie liczyć do kolekcji Krakowa**, ale zaliczać trasy,
punkty i pieczątki normalnie.

## Temat: morze, które odeszło

Cała wyprawa jest jednym pytaniem: dlaczego z wioski na plażę idzie się cztery
kilometry. Odpowiedź leży w muszlowisku nad doliną i rozwija się punkt po
punkcie. To nie jest zbiór ciekawostek, tylko jedna opowieść w siedmiu
odsłonach.

Oś: **most** (nazwa wsi i granica) → **kościół i młyn** (życie z ziemi) →
**muszlowisko** (pytanie) → **miradouro** (odpowiedź widoczna gołym okiem) →
**plaża** (puenta: idziesz tą samą drogą, tylko dla przyjemności).

## Fakty, na których to stoi

- **Concheiro de Montes de Baixo**: muszlowisko ze śladami mezolitu
  i chalkolitu, datowanie węglowe na muszlach *Monodonta lineata*, ceramika
  z pierwszej połowy III tysiąclecia p.n.e. W mezolicie zdobycz pochodziła
  z najbliższego otoczenia obozu, w chalkolicie z miejsca oddalonego o 2 do
  2,5 km, przy ujściu. Źródło: Atlas do Sudoeste Português.
- **Nazwa**: „Ode" w toponimach Algarve to arabskie *wād*, rzeka albo dolina
  (to samo słowo dało Guadalquivir). Odeceixe = „rzeka Seixe", pół po arabsku.
- **Młyn**: 1898, typ śródziemnomorski, dziś oddział muzealny; gmina Aljezur
  podaje 4 do 5 tysięcy odwiedzających w sezonie.
- **Kościół**: Nossa Senhora da Piedade, budowany od początku XIV do końca XV
  wieku, manueliński łuk tęczowy, srebrna korona z lat 1564-1565.
- **Praia das Adegas**: oficjalna plaża naturystyczna, jedna z niewielu w kraju.

## ODKRYCIE, które zmieniło trasy

Muszlowisko leży na **drugim brzegu Seixe, czyli już w Alentejo**, a most
EN 120 jest jedyną przeprawą. Zmierzone routerem: młyn → muszlowisko to 3103 m
pieszo przy 1001 m w linii prostej, i dokładnie tyle, ile wynosi suma
młyn → most (1312 m) plus most → muszlowisko (1791 m).

Skutek: prehistoria dostała **własną trasę**, zamiast psuć marsz do oceanu
nadłożeniem pięciu kilometrów. Poprawione też findHint i opisy, bo mówiły
„zbocze za wsią", co było nieprawdą.

## Dwa sugerowane szlaki

Myśl Jarka, która ukształtowała ich projekt: *planując szlak wiesz, że coś
możesz dopowiedzieć w danym momencie, bo wiesz, jak idzie szlak*. Kolejność
punktów jest więc kolejnością opowieści, nie geograficznym skrótem.

| Trasa | Długość | Co opowiada |
|---|---|---|
| Do morza doliną | 4,8 km | most → kościół → młyn → miradouro → plaża, jedną linią w dół doliny |
| Spacer za rzekę, do muszlowiska | 3,6 km | most → muszlowisko → most, wyprawa do prehistorii przez granicę |

Prefiks „Spacer" to konwencja UI (`TrailModal.shape`): tak oznaczamy trasy tam
i z powrotem, żeby opis mówił prawdę o zawracaniu.

Do tego generator dokłada trasę przez wszystkie punkty i trzy odcinki Rota
Vicentina znalezione w OSM. Każdą można edytować w kreatorze („Ułóż własną
trasę").

## Jak to jest wpięte

- `scripts/trip-odeceixe.mjs` dodaje dwa miejsca do `parks.json` z flagą
  `properties.trip = 'costa-vicentina'`. Ta sama komenda z `--remove` kasuje
  całość. Geometria to koła obejmujące punkty wyprawy (jak kopce w Krakowie).
- `src/app/data/trip.ts` trzyma jedną zasadę: `countsForKrakow()`. Procent
  miasta, plansza odkryć i cele w profilu pomijają wyprawę, reszta mechaniki
  jej nie odróżnia.
- **Link dla testera**: `…/parkove/?trip=costa-vicentina` ustawia dom mapy na
  Portugalię (zapisane w localStorage, przetrwa zamknięcie). `?trip=off`
  wraca do Krakowa. Świadomie bez pytania o GPS przy starcie.
- Zdjęcia: `scripts/photos-odeceixe.mjs`, tryb `--search` wypisuje kandydatów
  z Commons z licencjami, dopiero potem pobiera się wybrane. Sześć zdjęć,
  wszystkie CC z podpisami.

## Pułapki, które to wyciągnęło

- `build-trails.mjs` czytał **zahardkodowaną listę dwóch plików questów**,
  więc trzeci plik nie istniał dla generatora: trasy się nie liczyły, a skrypt
  kończył się sukcesem. Teraz czyta wszystkie `quests*.ts`.
- Generator układa trasy wewnątrz jednego miejsca, więc droga **między**
  miejscami nie mogła powstać. Stąd `ORDERED` w generatorze: trasy zamówione,
  liczone routerem po zadanej kolejności, odtwarzane przy każdej regeneracji.
- Commons dławi serie zapytań: przy 2 s pauzy połowa plików wróciła jako
  1964-bajtowy HTML z 429. Pauza 5 s załatwiła sprawę.
- Overpass odrzuca żądania bez `User-Agent` błędem 406 z Apache (nie z samego
  Overpassa), co wygląda jak błąd składni zapytania.
