# Katalog design systemu i historia wydan

`catalog.html` -> `src/catalog/Catalog.tsx`. Osobne wejscie Vite, ta sama
biblioteka `src/ds`, ten sam plik tokenow, wiec katalog pokazuje DOKLADNIE to,
czego uzywa aplikacja, a nie kopie.

## Struktura (przebudowa 2026-08-25, 0.107.0)

Jarek: "zrob tak, zebym mogl dobrze przegladac design system, czyli przygotuj
jego strukture pod appke, bo teraz dziwnie to wyglada. Tak samo informacje o
updatach".

Bylo: plaska lista 25 pozycji w sidebarze i JEDNA strona ze wszystkimi
sekcjami pod soba. Zeby zobaczyc Switcha, trzeba bylo przewinac cala
typografie, wszystkie karty i arkusze. Changelog siedzial w BottomSheecie
schowanym pod numerkiem wersji.

Jest: katalog zachowuje sie jak aplikacja.

- **Piec dzialow** w nawigacji: Fundamenty (kolory, typografia, odstepy,
  ksztalt, ikony), Elementy (przyciski, chipy, odznaki, postep, przelacznik,
  wlacznik, liczby), Tresc (karty, wiersze, naglowek ze zdjeciem, slider,
  rozwijane, karuzela), Warstwy i nawigacja (pasek gorny, arkusz, modal,
  karta podgladu, toast, pasek akcji), Wydania.
- **Jedna sekcja na ekran**. Realizacja: `ActiveSection` (React context) +
  `Section` zwraca `null`, gdy jego `id` nie jest aktywne. Dzieki temu nie
  trzeba bylo przepisywac 25 wywolan `<Section>`.
- **Adres pamieta miejsce**: `#colors`, `#switch`, `#whatsnew`, obsluga
  `hashchange`, tytul dokumentu zmienia sie na nazwe dzialu.
- **Szukajka** filtruje pozycje nawigacji po nazwie.
- Na telefonie kazdy dzial to osobny rzad przewijany w bok; zawijanie
  wszystkiego w jedna chmure gubilo podzial.

## Co nowego (changelog)

Wydania maja wlasny dzial, nie okienko. Kazdy wpis: numer wersji, data,
plakietka "teraz" przy aktualnej, tytul, kursywa z jednozdaniowym
streszczeniem po polsku (to samo, ktore apka mowi po odswiezeniu wersji) i
lista zmian z tagiem NOWE / ZMIANA / POPRAWKA.

- filtr rodzaju zmian (wszystko / nowe / zmiany / poprawki),
- 20 wydan na start, przycisk dokłada 30 (historia ma ich 150, wiec jedna
  dluga strona byla nie do przegladania),
- `catalog.html#changelog` (stary link z ekranu "O aplikacji") jest aliasem
  na `#whatsnew`, wiec nie trzeba ruszac aplikacji.

Zrodlo: `src/changelog.ts`. Kazde wydanie dopisuje sie tam razem z bumpem
`VERSION` i `package.json`.

GOTCHA: apostrof w tekscie wpisu changeloga LAMIE BUILD (dwa razy nas to
przewrocilo, wersje 0.93.2 i 0.102.0). Pisz "the place" zamiast "place's".
