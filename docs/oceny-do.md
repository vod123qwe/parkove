# Oceny D i O: rubryka i tryb ocen

Decyzja z grilla 2026-08-24: **Jarek ocenia wszystkie 57 miejsc sam, w aplikacji.**

## Rubryka

**D, Dojście** (teren pod nogami i kołami wózka):

1. płasko, wózek przejedzie
2. zwykły teren
3. nierówno albo schody
4. podejścia
5. górski charakter

**O, Odkrywanie** (jak trudno zaliczyć punkty wyprawy):

1. punkty przy głównej alei
2. punkty blisko ścieżek
3. trzeba zboczyć ze ścieżki
4. trzeba poszukać
5. łatwo przegapić bez wskazówek

## Jak działa tryb ocen

1. O aplikacji, wiersz „Tryb ocen D i O" (w dev zawsze włączony).
2. Na karcie miejsca kropki obu osi stają się przyciskami; pod kropkami widać
   podpis wybranego poziomu, więc rubryki nie trzeba pamiętać.
3. Oceny zbierają się w telefonie jako szkic (localStorage) i od razu działają:
   celki na liście, zdanie na karcie, filtry Deszczowa sobota i Z wózkiem.
4. Przycisk „Kopiuj oceny (n)" oddaje szkic jako JSON. Wysyłasz go mnie, wchodzi
   do `DIFFICULTY` w `src/app/data/difficulty.ts` i od tej pory jest w danych na
   stałe, dla wszystkich urządzeń. Szkic ma pierwszeństwo przed danymi, więc
   poprawka w terenie działa natychmiast.

## Co czyta oceny

- karta miejsca: dwie osie + zdanie z pary (np. „dojście łatwe, odkrywanie
  trudne: dobre na deszczową sobotę"),
- lista: para `D ●○○○○ O ●●○○○` w wierszu,
- intencje: Z wózkiem = D1 + parking; Deszczowa sobota = D ≤ 2 + pętla do
  40 min + parking.

Miejsce bez ocen po prostu nie pokazuje celek i wypada z intencji czytających D;
zero-guard w liście mówi o tym wprost.

---

## WYCOFANE w 0.99.0 (2026-08-24)

Jarek: "usun ocenianie d/o". Caly system (difficulty.ts, tryb ocen w
O aplikacji, kropki na kartach i suwaki w filtrach) usuniety z kodu.
Zastapstwo: szacowany czas zwiedzania i kilometry z danych (data/visit.ts),
opisane w docs/filtry.md. Ten plik zostaje jako zapis rubryki, gdyby
oceny mialy kiedys wrocic w innej formie.
