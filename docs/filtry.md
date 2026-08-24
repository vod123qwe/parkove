# Filtry miejsc: intencje na wierzchu, fasety pod spodem

Stan: koncepcja z 2026-08-24, makiety 12a i 12b w Figmie (sekcja
„Parkove × Benchmark — makiety"). Decyzja Jarka: wdrażamy razem z ocenami D/O
z makiet 10a/10b, łącznie z widokiem celek na listingu i w szczegółach miejsca.

## Zasada

Pierwszy rząd filtrów to INTENCJE: pytania, które naprawdę zadajemy przed
wyjściem, nie cechy bazy danych. Jedna intencja ustawia kilka fasetek naraz.
Pełny zestaw fasetek czeka pod przyciskiem „Więcej", dla dociekliwych.

Przykład definicji: „Deszczowa sobota" znaczy dojście ≤ ●●, spacer do ~40 minut
i coś pod dachem albo blisko auta. Definicje intencji są danymi, nie kodem,
więc można je stroić bez wydania.

## Intencje na start

| intencja | co ustawia |
| --- | --- |
| ☔ Deszczowa sobota | D ≤ 2, krótka pętla, parking blisko |
| Cały dzień | duży teren albo D+O wysokie, pętla, jedzenie na miejscu |
| Z wózkiem | D = 1, parking, bez schodów (ocena ręczna przy D) |
| Bez auta | przystanek tramwaju albo autobusu w danych transit |

## Fasety (arkusz „Filtry", cztery grupy)

1. **Na dziś**: intencje jak wyżej.
2. **Co na miejscu**: plac zabaw, lody i kawa, woda, pętla wokół, parking.
3. **Trudność**: Dojście (suwak ≤ ●●), Odkrywanie (dowolne albo próg).
4. **Nasza kolekcja**: nowe dla nas, prawie złote, dawno nas nie było.

## Skąd się to liczy (bez nowych zbiorów danych)

| faseta | źródło |
| --- | --- |
| plac zabaw, lody i kawa | amenities.ts |
| parking | parking.ts |
| tramwajem | transit.ts |
| pętla wokół | trails.ts (id wokol / wokol-wody) |
| woda | kind=water albo punkty kategorii water |
| nowe dla nas, prawie złote, dawno nie byliśmy | stan gry (parks, journeys) |
| D i O | dwa NOWE pola na miejsce, ocenione ręcznie raz (57 miejsc = jeden wieczór) |

## Dwie twarde zasady UX

1. **Zero pustych wyników.** Licznik trafień żyje na przycisku („Pokaż 8
   miejsc") i przy zerze arkusz podpowiada, którą fasetę poluzować, zamiast
   pokazać pustkę.
2. **Filtr to nie wyszukiwarka.** Wyszukiwarka zostaje osobno, nad chipami,
   i działa zawsze na pełnej liście.

## Decyzje z grilla (2026-08-24) i stan wdrożenia

- **Rząd chipów (etap 1, WDROŻONE w 0.94.0):** Dolinki, Parki, ☔ Deszczowa
  sobota, Z wózkiem, 🛝 Plac zabaw, 🍦 Lody. Rodzaje wykluczają się nawzajem,
  reszta składa się przez I. Zakładki Wszystkie/Dolinki/Parki zniknęły.
- **Definicja ☔:** D ≤ 2 + pętla do 40 min + parking. Miejsce bez policzonych
  tras dostaje zapasowo próg powierzchni ≤ 12 ha (małe parki nie mają tras, a
  spacer i tak jest krótki).
- **Z wózkiem:** D = 1 + parking.
- **Oceny D/O:** Jarek sam, w trybie ocen w apce (docs/oceny-do.md).
- **Etap 2 (arkusz wszystkich faset): WDROŻONY w 0.95.0.** Grupy: Na dziś,
  Co na miejscu, Trudność (progi ≤ ●● i ≥ ●●●● na obu osiach), Nasza kolekcja
  (Nowe dla nas; Prawie złote = brakuje ≤ 2 punktów; Dawno nas nie było =
  pół roku bez wizyty). Cały dzień = ≥ 30 ha albo pętla ≥ 90 min albo D+O ≥ 7.
  Chipy w arkuszu i w rzędzie to ten sam stan; licznik na przycisku żywy.
  Następne wg kontraktu: podmiana zdjęć ze strony
  ZZM (wszystkie od razu, plus odświeżenie reszty z Commons), dopiero potem
  odkrycia pod chmurami i przebudowa revealu.
- Filtry są sesyjne: świeże otwarcie apki startuje bez aktywnych chipów.


---

## 0.99.0: uproszczenie (decyzja Jarka, 2026-08-24)

Chipy intencji, arkusz Filtry i suwaki D/O poszly w calosci do kosza.
Jarek: "usun ocenianie d/o i zmien filtrowanie na prostsze, czyli taby
i czas podrozy (...) tez dropdown do km".

Nowy model (App.tsx + data/visit.ts):

- **Zakladki**: Wszystkie / Parki / Dolinki (pole `group` z parks.json).
- **Czas zwiedzania** (dropdown): dowolny / do 30 min / do 1 godz. / do 2 godz.
- **Dystans** (dropdown): dowolny / do 2 km / do 5 km / 5 km i wiecej.
  Ostatnia opcja jest odwrotna (dla szukajacych dlugiej trasy) i lapie
  dokladnie 3 dolinki: Bedkowska 14,9 km, Raclawki 12,1 km, Szklarki 6,6 km.

Szacunek (visit.ts): trasa points -> minuty petli + 3 min na punkt wyprawy;
bez trasy -> obwod 4*sqrt(A), 14 min/km, +8 min bazy. Progi dobrane z
rozkladu: "do 30 min" lapie 36 z 57 miejsc.

Skasowane pliki: data/difficulty.ts, data/facets.ts. Dropdowny to natywne
selecty przebrane za pigulki (`.app-fselect`): telefon otwiera systemowy
picker, wybrana opcje pokazuje span, bo select ma opacity 0.
