# Krawędzie ekranu: szpara u dołu

Jarek, wielokrotnie, ostatnio 2026-08-22 ze zrzutem: „dalej na dole jest przerwa
na telefonie, jak możemy to rozwiązać? możesz zasymulować taką przestrzeń? i
naprawić".

## Najpierw symulacja, potem naprawa

Ta szpara wracała dlatego, że próbowałem ją naprawiać z opisu. Zrzut Jarka dał
wreszcie liczbę: czarny pas u samego dołu, wysokości mniej więcej wcięcia
wskaźnika domu, czyli 34 punkty.

Więc najpierw narzędzie. **Wszystkie 43 wystąpienia `env(safe-area-inset-*)`
przeszły na zmienne `--sa-top` / `--sa-bottom` / `--sa-left` / `--sa-right`.** Trzy
powody, w kolejności wagi:

1. **da się je nadpisać**, więc telefon odtwarza się na komputerze,
2. jedno miejsce, w którym widać wszystkie odstępy od krawędzi,
3. 43 wystąpienia `env()` to 43 miejsca, w których można zapomnieć wartości
   domyślnej.

Tryb symulacji (`?sim=phone`, albo wiersz „Symuluj telefon" w O aplikacji)
ustawia wcięcia iPhone'a (59 i 34) i rysuje **dwa przezroczyste, pasiaste pasy**
dokładnie tam, gdzie na telefonie jest wyspa i wskaźnik domu. Przezroczyste, bo
o to chodzi: przez pas widać, co jest pod spodem.

## Co było naprawdę nie tak

Dwie przyczyny, obie własne.

**Pierwsza: podłoże dokumentu było na stałe ciemne.** Zrobiłem to świadomie, z
komentarzem „lepiej ciemny pasek pod ciemną mapą niż biały". Miało to sens dla
mapy i było fatalne dla wszystkiego innego: na jasnym ekranie wyprawy ta sama
czerń robiła się **czarną szparą pod białą kartą**. Teraz dokument ma kolor
strony (`--bg-page`), a ciemność przeniosła się na `.app-shell`, czyli pod mapę,
gdzie była potrzebna. Konsekwencja jest prosta: niedosięgnięcie krawędzi ma
zawsze kolor tego, co jest nad nim, więc go nie widać.

**Druga: ekrany mierzyły wysokość zmienną, która może być krótsza od ekranu.**
`--screen-h` bierze się z `window.innerHeight`, a to na telefonie w niektórych
układach bywa mniejsze od realnego okna. Każde `min-height: var(--screen-h)`
zmieniło się na `min-height: max(var(--screen-h), 100dvh)`: teraz zmienna może
tylko **powiększyć** ekran, nigdy go skrócić.

## Sprawdzone

Z sztucznie skróconą zmienną (778 przy oknie 812, czyli dokładnie zły przypadek
z telefonu):

- panel modala: **812**, nie 778,
- powłoka: **812**, nie 778,
- podłoże dokumentu: biel strony, nie czerń,
- dół ekranu mapy: ciemność powłoki, tak jak ma być pod zdjęciem lotniczym.

## Co zostało z poprzednich podejść

`overflow-x: clip` na powłoce (zamiast `hidden`, które dawało wyliczone
`overflow-y: auto` i obcinało wylewkę mapy) oraz `data-pk-dark` dla ekranów, które
naprawdę są ciemne. Oba dalej potrzebne, oba za mało same.
