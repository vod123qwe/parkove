# Układ webowy: panel i mapa

Jarek, 2026-10-10: „Na webie ta aplikacja powinna inaczej wyglądać. Być może
powinna być na jakimś sidebarze. Pomyślmy o tym też jako o narzędziu
responsywnym na stronie WWW, fajnie podzielonym na sekcje. Mapa ma być kluczowa,
ale po kliknięciu mapy powinny pojawiać się jakieś małe okienka."

Decyzje z tego samego dnia (cztery pytania, cztery odpowiedzi):

- **Czym to jest na dużym ekranie**: narzędzie do planowania w domu. Nagrywanie
  wyprawy zostaje na telefonie, układ webowy nie musi go obsługiwać dobrze,
  tylko nie może go zepsuć.
- **Proporcje**: panel 440 px, mapa na całej reszcie. Nie pół na pół:
  mapa jest kluczowa, a 440 px to szerokość, przy której tekst karty czyta się
  jak na telefonie, bez rozciągania wierszy.
- **Strona**: mapa po lewej, panel po prawej (Jarek, po obejrzeniu pierwszej
  wersji z panelem po lewej: „mapa powinna być po lewej, a cały sidebar po
  prawej"). Mapa zaczyna się od krawędzi okna, panel domyka ekran z prawej.
- **Klik w pin**: małe okienko przy pinie (zdjęcie, nazwa, czas, dystans,
  przyciski). Szczegóły dopiero po kliknięciu w okienko, w panelu.
- **Próg**: od 900 px szerokości. Laptopy i tablety w poziomie dostają panel,
  telefony i tablety w pionie zostają przy obecnym układzie, bez zmian.
- **Zakres**: docelowo każdy ekran, w kilku sesjach.

## Stan wyjściowy

Apka nie ma ani jednej reguły `min-width`. Powłoka (`.app-shell`) jest
`position: fixed; inset: 0`, więc na monitorze to telefon rozciągnięty do
1440 px. Wszystko, co nie jest mapą, to nakładki:

| Rodzaj | Komponent DS | Gdzie stoi | Przykłady |
|---|---|---|---|
| arkusz nie-modalny nad mapą | `BottomSheet modal={false}` | fixed, dół, `width: min(100%, 560px)` | lista miejsc, karta miejsca, punkty wyprawy, karta w ekranie wyprawy |
| arkusz modalny (dialog) | `BottomSheet` | fixed, dół, ze scrimem | Filtry, Reveal, koniec wyprawy, daleko od parku, notatka głosowa |
| ekran pełny, push | `Modal presentation="push"` | portal do body, `inset: 0`, z-index 200 | Ty (profil), Moje liczby, Wygląd, O aplikacji, Parking, Dojście, Osiągnięcia, punkt, Pieczątka, udogodnienia |
| karta podglądu | `PeekCard` | fixed, dół środek, 480 px, z-index 90 | po kliknięciu pinu |
| ekran własny, pełny | `createPortal` + własna klasa | fixed `inset: 0`, z-index 110 do 210 | Pamiętnik (`.jrnl`), Dokąd dziś (`.mtch`), Odkrycia (`.discscreen`), wyprawa (`.jscreen`), odtwarzacz (`.memplay`), podgląd (`.memview`), edytor trasy (`.tedit`), kamera (`.plantcam`) |

Kadrowanie mapy zakłada, że coś zasłania dół: `focus.bottomPadding` jest
podawane w pikselach przez każde miejsce, które otwiera kartę (220, albo 42
procent wysokości okna).

## Mechanizm: jeden przełącznik, dwa światy

Jedna flaga na dokumencie, `html[data-pk-wide='on']`, ustawiana z
`matchMedia('(min-width: 900px)')` w `screen.ts`, tak samo jak symulacja
telefonu (`data-pk-sim`). CSS celuje w tę flagę, React czyta ją przez
`useWide()`.

Dlaczego flaga, a nie `@media` w każdym pliku: nakładki są portalowane do
`body`, więc nie dziedziczą niczego po powłoce, a próg ma być jeden i ma się
dać wymusić (`?wide=on`, `?wide=off`) do testów na telefonie i w podglądzie.

Poniżej 900 px **nic się nie zmienia**. Każda reguła webowa zaczyna się od
`html[data-pk-wide='on']`, więc telefon nie może dostać regresji z tej roboty
inaczej niż przez błąd w selektorze.

## Układ

```
+----------------------------------------------+------------------+
| mapa (reszta)                                | panel 440 px     |
|  [filtry]                           [menu]   |                  |
|                                              | lista miejsc     |
|          (pin) -> małe okienko               |  albo            |
|                                              | karta miejsca    |
|                                              |  albo            |
|                                              | Dokąd dziś       |
|                                              |  albo            |
|                                              | Pamiętnik, Ty... |
+----------------------------------------------+------------------+
```

- **Powłoka**: `.app-shell` zostaje `fixed; inset: 0`. Bez grida: wszystkie
  dzieci są pozycjonowane absolutnie, więc mapa dostaje `right: 440px`, a HUD
  (filtry, menu, pobieranie) i kontrolki mapy odsuwają się od prawej o
  szerokość panelu.
- **Panel** to nie nowy komponent, tylko **drugi tryb istniejących nakładek**.
  Arkusz nie-modalny i ekran push w trybie wide renderują się jako zawartość
  prawej kolumny: `fixed; right: 0; top: 0; bottom: 0; width: 440px`, bez
  zaokrągleń od góry, bez chwytu, bez zatrzasków, z własnym przewijaniem.
  Logika „jedna powierzchnia na raz" zostaje: gdy wybrane jest miejsce, lista
  znika i panel pokazuje kartę; gdy otwiera się profil, staje nad listą jak
  w nawigacji stosowej.
- **Dialogi** (arkusze modalne) zostają dialogami, tylko centrowane na ekranie
  zamiast przyklejone do dołu. To jedyny rodzaj nakładki, który na webie nie
  trafia do panelu, bo pytanie „kończymy wyprawę?" ma przerwać, a nie
  towarzyszyć.
- **Okienko przy pinie**: `PeekCard` dostaje `anchor` w pikselach ekranu
  (mapa zna `map.project(coords)` i odświeża go przy każdym ruchu). W trybie
  wide karta rysuje się nad pinem, z ogonkiem, z tą samą treścią i tymi samymi
  przyciskami co na telefonie. Przyciski prowadzą do panelu.
- **Kadrowanie mapy**: w trybie wide mapa niczego nie ma pod spodem, więc
  `bottomPadding` jest ignorowane w jednym miejscu, w `MapView`, zamiast
  poprawiania dwudziestu wywołań.

## Co z ekranami własnymi

| Ekran | Na webie |
|---|---|
| Pamiętnik (lista wspomnień) | w panelu |
| Odkrycia (mapa mgły) | w kolumnie mapy, zamiast zwykłej mapy, z zakładką w panelu |
| Dokąd dziś | w panelu: karty 440 px szerokie, wyniki pod spodem, klik otwiera miejsce na mapie obok |
| Wyprawa z pamiętnika (`JourneyScreen`) | mapa trasy w kolumnie mapy, karta w panelu |
| Odtwarzacz wspomnień, podgląd zdjęcia, kamera roślin, edytor trasy | pełny ekran, jak dziś; to są widoki immersyjne |

## Kolejność

1. **Fundament** (ta sesja): flaga `wide`, siatka powłoki, mapa w kolumnie,
   arkusz nie-modalny i ekran push jako panel, kadrowanie bez `bottomPadding`,
   HUD w kolumnie mapy. Po tym kroku lista, karta miejsca i wszystkie ekrany
   push już działają w panelu, choć bez szlifów.
2. **Okienko przy pinie** i dialogi na środku.
3. **Ekrany własne**: Pamiętnik i Odkrycia, Dokąd dziś, wyprawa z pamiętnika.
4. **Szlify**: skróty klawiszowe, podświetlenie pinu z listy, szersze galerie
   w karcie, stany pośrednie 900 do 1100 px.

## Czego nie robimy

- Nie przepisujemy ekranów na nowe komponenty. Każdy ekran zostaje tym, czym
  jest; zmienia się tylko to, gdzie DS go stawia.
- Nie dotykamy nagrywania wyprawy. Pasek wyprawy i wybór szlaku zostają nad
  mapą jak dziś, tylko przesunięte o szerokość panelu.
- Nie robimy osobnej „strony WWW" obok apki. To ta sama apka, ten sam adres,
  ten sam stan.
