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


## Przebudowa 2: mobilny storybook z drawerem (2026-08-25, 0.108.0)

Jarek o wersji z sidebar em: "nawigacja jest bardzo webowa, pomysl o tym
jak o storybooku w aplikacji mobilnej z odpowiednimi zagniezdzonymi
nawigacjami, zrob to od nowa" + "wybieralka do kolorow niech bedzie pod
jakims dropdownem, te menu bardziej zagniezdzone albo w menu na sidebarze
po swipe" + "zastanow sie".

DECYZJA (rozwazone dwa modele):

- drill-down stack jak Ustawienia iOS (home -> dzial -> sekcja, back w
  pasku): ODRZUCONY. Katalog to narzedzie referencyjne, glowna czynnosc to
  skakanie miedzy sekcjami, a stack kosztuje 3-4 tapniecia na kazdy skok
  i gubi kontekst calosci;
- DRAWER jak Storybook mobile: tresc na pelnym ekranie, spis wysuwany z
  lewej (hamburger albo swipe od krawedzi), w spisie zagniezdzone dzialy.
  WYBRANY: 2 tapniecia na skok, cale drzewo naraz.

Elementy:

- shell to jedna kolumna max 640 px (na desktopie stoi na srodku i udaje
  telefon), NavBar z DS na sticky gorze: wstecz wychodzi do aplikacji,
  tytul = aktywna sekcja, hamburger w trailing otwiera spis;
- drawer: panel min(84vw, 330px), scrim, Escape i tap w scrim zamykaja,
  swipe od lewej krawedzi (<28 px, dx>48) otwiera, swipe w lewo zamyka,
  body overflow hidden gdy otwarty;
- dzialy ZWIJANE (chevron; na starcie rozwiniety tylko dzial aktywnej
  sekcji, useEffect dorozwija przy zmianie), pozycje z wcieciem i kreska
  po lewej = widoczne zagniezdzenie; aktywna pozycja wypelniona;
- szukajka splaszcza drzewo do listy trafien z okruszkiem dzialu;
- motyw NA DOLE drawera pod dropdownem (natywny select w pigulce, na
  telefonie otwiera systemowa wybieralke): Systemowy / Jasny / Ciemny.

GOTCHA TESTOWA: `location.href = '...#hash'` NIE przeladowuje strony,
gdy rozni sie tylko hashem. Test "stanu po reloadzie" ogladal wtedy stary
stan komponentu i wygladalo, jakby wszystkie dzialy byly rozwiniete na
starcie. Prawdziwy swiezy start wymusza sie zmiana query stringa.
