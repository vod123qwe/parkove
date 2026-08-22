# Parkove: czym jest ta aplikacja

Materiał do wklejenia gdzie indziej. Stan na 2026-08-22, wersja 0.60.

## W jednym zdaniu

Gra terenowa o parkach i dolinkach pod Krakowem: aplikacja wyciąga cię z domu do
konkretnego miejsca, daje ci powód, żeby tam pójść, i opowiada historię dopiero
wtedy, gdy naprawdę tam stoisz.

## Dla kogo

Zrobiona dla jednej rodziny: dorosły plus dziecko, weekend, samochód albo
autobus, dwie do czterech godzin. Nie jest to przewodnik turystyczny ani
aplikacja fitness. Bliżej jej do pretekstu: coś musi wygrać z kanapą.

## Jak to działa

**Miejsca.** 55 miejsc: parki Krakowa, kopce, lasy, łąki, plus siedem Dolinek
Krakowskich i dwa parki w Skawinie. Każde ma obrys na mapie satelitarnej, opis
(dlaczego warto), zdjęcia i udogodnienia (plac zabaw, jedzenie) z podaniem, ile
ich jest i jakie.

**Wyprawa.** Startujesz w miejscu, aplikacja nagrywa ślad i czas. Pasek na dole
ekranu mówi jedną rzecz: co jest następne i jak daleko. Kreski pokazują postęp,
jedna kreska na punkt.

**Punkty (108 w 46 miejscach).** Punkt to konkretne miejsce w parku: pomnik,
skała, źródło, jaskinia, plac zabaw. Każdy ma:

- *teaser*: jedno zdanie na liście,
- *opis*: dwa, trzy akapity, czytelne w domu przy planowaniu,
- *wersję rozwiniętą* (wybrane punkty): pełna historia za przełącznikiem u góry,
- *legendę* (wybrane punkty): podanie w osobnym bloku i innym kroju, żeby nigdy
  nie udawało faktu,
- *puentę*: krótkie zdanie odblokowywane TYLKO na miejscu, przez GPS,
- *dylemat*: prawdziwe pytanie bez dobrej odpowiedzi, z kontrą do każdego wyboru.

**Dylematy** są sercem pomysłu. Nie quiz, nie ciekawostka. Przy wodospadzie, na
progu zbudowanym przez mech przez sześć tysięcy lat: „czy najciekawsze miejsca
powinny być otwarte dla wszystkich?", a pod odpowiedzią kontra, że miejsce, które
nikt nie widzi, nie ma nikogo, kto by go bronił. Przy placu zabaw sfinansowanym
przez elektrownię: „czy miasto powinno brać pieniądze od swojego największego
emitenta?". To materiał na rozmowę na ławce, nie na wynik.

**Pieczątki.** Za zebranie punktów dostajesz naklejkę miejsca, rysowaną osobno
dla każdego parku (19 gotowych). Miejsca za duże na jedno popołudnie mają próg
niższy niż komplet: pieczątka po trzech z sześciu, reszta zostaje jako
ciekawostki na kiedy indziej.

**Ślady.** W trakcie wyprawy zostawiasz sobie zdjęcia, notatki, nagrania głosowe
i miejsce, gdzie stoi auto. Po wyprawie da się to odtworzyć jako wspomnienie z
przewijaniem trasy.

**Szlaki.** Każde miejsce, w którym jest co chodzić, ma warianty przejścia:
pętlę przez wszystkie punkty, krótszą pętlę i prawdziwe szlaki znakowane, jeśli
przez nie przechodzą. Trasy liczone są routerem pieszym OpenStreetMap, szlaki
znakowane brane z relacji OSM i przycinane do granic miejsca, więc długość mówi
o tym odcinku, a nie o całym szlaku przez pół Jury. Wszystko policzone raz i
zapisane, bez edycji w aplikacji, bo w dolinie nie ma zasięgu. Wybrany szlak
rysuje się na mapie pod śladem GPS: to podpowiedź, gdzie iść, a nie zapis tego,
gdzie byłeś.

**Dojście.** Każdy parking ma swój kadr mapy satelitarnej z prawdziwą trasą
pieszo, policzoną routerem OpenStreetMap i zapisaną w danych, więc działa bez
sieci. Etykieta mówi, ile ścieżkami i ile minut do wejścia na szlak.

## Zasady, które trzymają całość

1. **Treść tylko na miejscu.** Puenta i dylemat odblokowują się przez GPS. Nie da
   się „przejść" aplikacji na kanapie i to jest cel.
2. **Nigdy nie udawać wiedzy.** Legenda ma własny blok i własny krój. Trasa pieszo
   mówi „ścieżkami", nie „łatwo". Zdjęcia niepasujące do miejsca są usuwane, a nie
   podmieniane na cokolwiek: 22 z 85 wyleciało po przeglądzie.
3. **Wszystko weryfikowane.** Współrzędne z OpenStreetMap, fakty ze źródeł
   zapisanych przy punkcie, dystanse mierzone, nie szacowane.
4. **Jedna decyzja na ekran.** Na dole zawsze jest jedna rzecz: albo karta „co
   dalej", albo karta wybranego miejsca, nigdy oba.
5. **Działa offline.** Kafle mapy, zdjęcia i dane są w pamięci telefonu, bo w
   dolinie nie ma zasięgu.

## Czym to nie jest

Nie ma rankingów, znajomych, punktów za aktywność, powiadomień „wróć do nas" ani
sklepu. Nie ma też trybu wyzwań na czas. Pieczątka jest jedyną nagrodą i jest
lokalna: leży w telefonie, nie na żadnym profilu.

## Stan techniczny

PWA (instalowana z ekranu głównego), React plus TypeScript, mapa MapLibre na
kaflach satelitarnych ArcGIS i wektorowych OpenFreeMap, dane w plikach TypeScript
(bez backendu), stan i zdjęcia w pamięci przeglądarki, service worker na offline.
Własny system projektowy z katalogiem komponentów. Wdrożenie z gałęzi main na
GitHub Pages.

## Otwarte pytania, nad którymi warto pomyśleć

- Co ma trzymać kogoś przy aplikacji między wyprawami, jeśli świadomie nie ma
  powiadomień ani rankingów?
- Jak zachęcić do drugiej wizyty w tym samym miejscu, gdy pieczątka jest już
  zdobyta? Dziś odpowiedzią są punkty opcjonalne, ale to słaby magnes.
- Jak wciągnąć dziecko, które nie czyta? Dziś treść jest tekstowa, a najlepiej
  działają nazwy w rodzaju „Dupa Słonia" i prawdziwa jaskinia z przewodnikiem.
- Czy dylematy mogą być czymś więcej niż pytaniem: zapisem stanowiska rodziny,
  wracaniem do własnych odpowiedzi po roku?
- Co z ludźmi, którzy nie mają auta? Dziś dojazd komunikacją jest opisany
  słowami, ale nie jest częścią rozgrywki.
