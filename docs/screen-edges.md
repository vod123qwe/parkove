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

## Rozstrzygnięcie: `env()` nie opisuje tej przestrzeni

Diagnostyka z telefonu Jarka zamknęła sprawę, która wracała cztery razy:

```
okno 797 · ekran 844 · widok 797 · safe 34 · fixed-dol 797 · dpr 3 · standalone tak
```

Czyta się to tak: **widok ma 797, ekran 844, a iOS przyznaje się do wcięcia 34.**
Brakuje 47, a system mówi o 34. Element z `bottom: 0` kończy się na 797, czyli
47 px nad fizycznym dołem ekranu.

To wyjaśnia, dlaczego wszystkie poprzednie podejścia były skazane: każde z nich
dopisywało `env(safe-area-inset-bottom)` do odstępu, a **ta liczba nie opisuje
tej przestrzeni**. Można było dopisywać ją wszędzie i pas zostawał.

Magentowy pas na zrzucie to zresztą nie awaria, a diagnostyka robiąca swoje:
podłoże dokumentu było pomalowane na magentę i pokazało dokładnie, gdzie żadna
warstwa nie dosięga.

## Co z tym zrobiliśmy

Podpowiedź przyszła od Jarka: „poprzednio mieliśmy problem, że status bar u góry
zasłaniał część mapy, a teraz mapa jest za status barem i to jest super, tak to
się udało naprawić". Na górze zadziałało **wejście pod** systemowy element, a nie
kończenie się przed nim. Na dole robimy to samo.

**`--sa-bleed`: zmierzona różnica, nie zapytana.** `trackScreenHeight` liczy
`screen.height - innerHeight` i wpisuje wynik do zmiennej. Powierzchnie
pełnoekranowe (`.app-shell`, `.pk-modal__panel`, `.jscreen`) wychodzą o tyle pod
dolną krawędź widoku. Treść ma własne odstępy z `--sa-bottom` w środku, więc nic
nie jest przycięte: dokładamy tylko tło tam, gdzie go nie było.

Dwa zabezpieczenia, bo `screen.height` to nie okno przeglądarki:

- liczy się **tylko w aplikacji z ekranu domowego** (`navigator.standalone`),
- i tylko gdy różnica jest wielkości wcięcia (do 96 px). Na komputerze różnica to
  setki pikseli, a w poziomie iOS podaje `screen.height` z pionu; jedno i drugie
  odpada jako bezsens i wtedy wylewki nie ma.

**Mapa straciła własną wylewkę.** Wylewa się cała powłoka, a mapa jest w niej, więc
druga wylewka liczyła szparę dwa razy: zmierzone 906 zamiast 859 przy oknie 812.

Symulator dostał te same 47, więc pasiasty pas u dołu pokazuje teraz **realną
szparę**, a nie zgłaszane wcięcie.

## Sprawdzone

Z symulacją 47 px: powłoka i mapa kończą się na 859 przy oknie 812, panel modala
też, a w ostatnim pikselu ekranu jest **biel panelu**, nie podłoże dokumentu.
