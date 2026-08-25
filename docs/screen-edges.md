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

## Korekta: wylewka nie mogła zadziałać

Poprzednia wersja tego dokumentu twierdziła, że powierzchnie pełnoekranowe
„wylewają się" pod dolną krawędź widoku i tym zakrywają pas. **Nie działa i nie
mogło.** Zrzut Jarka po wdrożeniu pokazał pas dokładnie tam, gdzie był.

Powód: `html` i `body` mają `overflow: hidden`, a widok ma 797 przy ekranie 844.
Wszystko namalowane poniżej 797 leży **poza widokiem** i jest obcięte. Nie ma
takiego elementu, który by tam cokolwiek namalował.

Ten pas maluje **płótno przeglądarki**, a jego kolor bierze się wyłącznie z tła
`html`/`body`. To jedyna dźwignia, jaka istnieje.

## Jak to działa naprawdę

Tło dokumentu jest **ciemne**, bo pod spodem leży ciemne zdjęcie lotnicze i
ciemny pas jest wtedy niewidoczny. Jasne powierzchnie **zgłaszają się same**
(`data-pk-light`), bo pod białą kartą ciemny pas widać jak nic innego.

Zgłaszają się dwie rzeczy, i to nie przypadkowe: **modal** i **arkusz dolny**. To
dokładnie te, które dotykają dolnej krawędzi widoku. Karta podglądu miejsca ma
margines, więc pod nią jest mapa i pas ma zostać ciemny.

Pułapka po drodze, warta zapamiętania: **hook wykonuje się przy każdym renderze,
także wtedy, gdy komponent zaraz zwróci `null`.** Pierwsza wersja zgłaszała jasny
ekran także dla wszystkich zamkniętych modali, więc znacznik siedział na
dokumencie od pierwszej sekundy i pas był jasny nawet pod mapą. Warunek musi być
w środku hooka, nie u wołającego.

Ekrany naprawdę ciemne (odtwarzanie wspomnienia, podgląd zdjęć) mówią o sobie
osobno (`data-pk-dark`) i wygrywają z jasnymi, bo ich reguła stoi w pliku niżej.

## O symulatorze

Symulator jest narzędziem **na komputer**. Na telefonie nadpisuje wcięcia
wartościami iPhone'a, a te już tam są, więc treść się przesuwa: 47 zamienia się w
59 i wszystko schodzi o 12 px w dół. Nie jest zepsuty, po prostu nie jest do tego.
Opis wiersza w „O aplikacji" mówi to teraz wprost.

## Powłoka nie może być przesuwana ani filtrowana

Jarek, 2026-08-24: „wracam na ekran główny i po chwili znika ten dolny bottom
sheet z miejscami, a funkcjonowanie ekranu wraca dopiero, gdy klikam randomowo".

Winna była dekoracja. Na czas otwartej podstrony cała powłoka apki dostawała
`transform: translateX(-22px)` i `filter: brightness(0.94)`, jako sygnał „wszedłeś
o poziom głębiej".

Obie te własności czynią element **blokiem kontenerowym dla potomków
`position: fixed`**. Arkusz miejsc jest `fixed` i leży wewnątrz powłoki, więc:

1. otwierasz podstronę, powłoka dostaje transform, arkusz przestaje być
   pozycjonowany względem OKNA i zaczyna względem POWŁOKI,
2. zamykasz podstronę, własność znika, blok kontenerowy wraca do okna,
3. iOS nie przelicza wtedy layoutu, dopóki coś go nie zmusi. Dotknięcie ekranu
   zmusza, więc „randomowe klikanie" naprawiało widok.

Sprawdzone w kodzie, nie zgadnięte: `.pk-sheet` ma `position: fixed`, a jego
rodzicem jest `.app-shell`, i to jedyny `fixed` wewnątrz powłoki.

Do tego `filter` przepuszczał przez warstwę filtrowaną **całą apkę razem z
płótnem WebGL mapy**, przy każdym wejściu i wyjściu z podstrony. Na telefonie to
najdroższa rzecz, jaką dało się tam animować, za ruch widoczny przez ćwierć
sekundy, zanim podstrona i tak zakryła ekran.

**Zasada:** powłoka, wewnątrz której siedzi cokolwiek `position: fixed`, nie
dostaje ani `transform`, ani `filter`, ani `backdrop-filter`, ani `perspective`,
ani `contain: paint`. Efekt „pchnięcia" zostaje na ekranach i panelach, czyli na
warstwach, które same nie zawierają niczego `fixed`.

## O widoczności nie może decydować animacja

Ciąg dalszy tej samej sprawy, 2026-08-24. Po zdjęciu transformu z powłoki Jarek
zobaczył arkusz „Wszystkie parki" NA ekranie wyprawy z dziennika. Przy okazji
szukania tego wyszła rzecz ważniejsza.

**Zła kolejność warstw, ukryta przez kontekst stosu.** Ekran wyprawy miał
`z-index: 80`, arkusze mają 100. Kolejność była zła od dawna i nikt tego nie
widział, bo transform na powłoce tworzył kontekst stosu i cała jej zawartość
malowała się jako jedna warstwa pod tym ekranem. Zdjęcie transformu (konieczne z
innego powodu) odsłoniło błąd. Wniosek: **kontekst stosu ukrywa błędy w
kolejności, a nie je naprawia.** Drabinka warstw stoi teraz opisana w jednym
miejscu, przy `.jscreen` w `app.css`.

**Animacja wejścia decydowała o tym, czy arkusz istnieje.** Panel dostaje pozycję
inline transformem, ale:

- `@keyframes pk-sheet-up` ma jedną klatkę, `from { translateY(100%) }`, czyli
  panel dokładnie pod ekranem,
- a przy `transition: transform` samo ustawienie pozycji staje się przejściem z
  `none` do wartości docelowej.

Dopóki jedno albo drugie trwa, **o pozycji decyduje animacja, a nie wartość
końcowa**. Przeglądarka, która nie rysuje klatek, trzyma pierwszą klatkę. Zmierzone
wprost: `CSSTransition` w stanie `running` z `currentTime: 0`, computed transform
`none` przy inline `translateY(457px)`, panel na pełnej wysokości; a z animacją
klatkową computed `translateY(747px)`, czyli arkusz pod ekranem, przy tym samym
inline. Safari na iOS potrafi przestać rysować na moment po zamknięciu
pełnoekranowego ekranu i dokładnie wtedy arkusz „znikał", a dotknięcie budziło
rysowanie.

**Zasada:** pierwsze ustawienie pozycji nigdy nie jest animowane, a powierzchnia,
która pojawia się BEZ dotknięcia użytkownika, nie ma animacji wejścia. Ruch
zostaje tam, gdzie zawsze poprzedza go dotknięcie: przy zmianie zatrzasku i przy
arkuszach modalnych.

---

## Nagrobek teorii "bleed" (2026-08-25, 0.110.0)

Przerwa nad wskaznikiem domu wracala w zgloszeniach od tygodni. Rozstrzygnal
ja Jarek jednym porownaniem: **Portfel (wallet) na tym samym telefonie stoi
na pelna wysokosc** z samym `env(safe-area-inset-bottom)`.

Co bylo nie tak: `--sa-gap = max(sa-bottom, sa-bleed)`, gdzie sa-bleed to
zmierzone `screen.height - innerHeight` (844-797=47). Interpretowalismy 47
jako "dolne piksele, ktorych nie widac". Niemal na pewno bylo odwrotnie:
**47 to wysokosc GORNEGO paska statusu iPhone'a z wyspa**, zmierzona zanim
mety (viewport-fit=cover, black-translucent) byly poprawne, i doliczona
omylkowo do DOLU. Skutek: kazdy dolny odstep (pasek akcji, arkusze, modale,
peek, toast) byl o 13 px za duzy.

Naprawa: `--sa-gap: var(--sa-bottom)` i koniec. Pomiar bleed wyciety ze
screen.ts (zostaje --screen-h, ktory jest zdrowy). Pas w symulacji telefonu
pokazuje systemowe 34, nie wymyslone 47.

Pomiar w symulacji po naprawie: przycisk paska akcji konczy sie 8 px nad
linia wskaznika, tlo paska wypelnia strefe 34 px do samego dolu.

GDYBY na jakims urzadzeniu naprawde brakowalo dolu: mierzyc pozycje dolnej
krawedzi przez visualViewport (offsetTop+height vs innerHeight), NIGDY przez
screen.height, bo ta wartosc nie wie nic o orientacji, zoomie i paskach.

Czego symulacja NIE pokrywa (uczciwie): dynamiczne kurczenie dvh w Safari,
pierwsza klatka po starcie standalone, rubber-banding. Final judge = telefon.

### Ostatni element ukladanki: iOS ZAMRAZA mety przy instalacji (0.110.1)

Jarek porownal trzy nasze apki na jednym telefonie:

- Portfel: pelna wysokosc, wszystko dobrze (swieza instalacja, poprawne mety),
- Velo: dol dobry, ale STATUS BAR lezy na tresci (translucent jest, brakuje
  padding-top: env(safe-area-inset-top) w tamtej apce),
- Parkove: dol wciaz z przerwa mimo poprawnych met w kodzie.

Wyjasnienie: iOS zapisuje `apple-mobile-web-app-status-bar-style` (i spolke)
W CHWILI DODANIA IKONY do ekranu glownego. Instalacja Parkove u Jarka jest
sprzed black-translucent, wiec jej okno ma 797 pkt zamiast 844: system
trzyma na dole pas, ktorego zadna zmiana w kodzie nie zamaluje. Dawny
"bleed 47" leczyl objaw dokladnie tej instalacji, psujac swieze.

JEDYNA naprawa: usunac ikone z ekranu glownego i dodac ja ponownie z Safari.

Diagnostyka ekranu (O aplikacji) stawia teraz WERDYKT wprost:
- standalone + okno nizsze od ekranu o 20-96 px + safe=0
  -> "instalacja sprzed pelnego ekranu, przeinstaluj ikone",
- standalone + safe>0 + okno=ekran -> "uklad zdrowy".

### Sprostowanie nagrobka: bleed byl PRAWDZIWY, tylko rola odwrotna (0.110.2)

Swieza instalacja u Jarka obalila teorie zamrozonych met: okno 797 przy
ekranie 844, safe 34, fixed-dol 797, magenta debug WEWNATRZ ekranu.

Prawdziwy model (potwierdzony zrzutem):
- w tym trybie iOS PRZYBITE elementy koncza sie 47 px nad fizycznym dolem
  ekranu (fixed viewport 797); pas 47 umie pomalowac tylko tlo dokumentu;
- env(safe-area-inset-bottom)=34 dotyczy DOKUMENTU, nie fixed: wskaznik
  domu lezy w pasie, do ktorego fixed i tak nie siega;
- wiec dodawanie 34 wewnatrz fixed odsuwalo przyciski o 47+34+zapas od
  dolu ekranu. Wciecie trzeba o bleed POMNIEJSZYC:
  --sa-gap: max(0px, calc(var(--sa-bottom) - var(--sa-bleed))).

U Jarka: gap=0, przycisk 8 px nad dolem okna = ~55 pt nad dolem ekranu,
tuz nad wskaznikiem. Na zdrowych viewportach bleed=0 i zostaje czyste 34.

Trzy akty tej sagi (dodawanie bleed -> nagrobek -> odejmowanie) sa opisane
przy --sa-gap w ds.css. LEKCJA: fixed-dol z diagnostyki to najwazniejsza
liczba; env() nie opisuje fixed viewportu na iOS.

"Portfel na pelna wysokosc" to zludzenie dobrze zgranego tla dokumentu,
nie inny viewport: te same mety, ten sam telefon.

### Nowe okno dziala; gora idzie za theme-color (0.110.4)

Eksperyment 0.110.3 WYGRAL dol: po reinstalacji ikony okno ma pelna
wysokosc. Natychmiast odezwala sie gora ("czyli te elementy sa polaczone"
- Jarek): w nowym trybie okna iOS maluje pas statusu KOLOREM theme-color,
a statyczny jasny wariant z eksperymentu robil jasna przerwe nad ciemna
mapa.

Naprawa: jeden <meta name="theme-color">, sterowany z updateChromeColor()
w ds/useLightChrome, sprzezony z tym samym licznikiem jasnych ekranow, co
tlo dokumentu: jasna karta na wierzchu -> #f6f8f5, mapa/ciemne -> #0b1207.
Gorny pas i dolny pas zyja teraz z jednego stanu.
