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
