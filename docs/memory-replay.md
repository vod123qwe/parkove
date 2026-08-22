# Ekran wspomnienia: przebudowa

Przebudowa z 2026-08-22. Jarek: „myślę, jak moglibyśmy to przebudować, żeby mapa
działała podobnie jak teraz, ale te elementy, które wychodzą bardziej, były
immersyjne. Może ten element do prędkości jest za duży albo za wysoko".

## Co pokazał pomiar

Telefon 375×812, stan przed przebudową:

| Element | Gdzie | Rozmiar |
| --- | --- | --- |
| chodzący | **28% od góry** | — |
| początek rozmycia | 40% | 60% wysokości |
| ciemny blok | 63% | **37% ekranu** |
| zegar | 73% | 161×16 |
| **dial** | 78% | **330×128** |
| pauza | 93% | 56×56 |

Cztery wnioski, z czego trzeci i czwarty ważniejsze niż samo pytanie o dial:

1. **Dial był największym obiektem na ekranie, a jest chromem.** 330 px na 375 to
   prawie krawędź w krawędź. Konkurował o uwagę ze zdjęciem ze wspomnienia,
   które ma 57% szerokości.
2. **Trzy osobne rzędy sterowania** (zegar, dial, pauza) zajmowały 27% ekranu.
3. **Chodzący stał za wysoko, więc patrzyłeś na to, co już przeszedłeś.** Przy
   pitchu 58 wszystko pod kropką to grunt przebyty, a nad nią droga przed tobą.
   Kropka na 28% znaczy, że 72% kadru było przeszłością, i większość tego pod
   ciemnością. Gra samochodowa stawia auto na 70% w dół nie z estetyki, tylko
   żeby kadr był drogą, a nie lusterkiem.
4. **`setMemory` nie było nigdzie czyszczone.** Ani jednego `setMemory(null)` w
   całym pliku. Gdy minąłeś pierwsze wspomnienie, karta zostawała do końca
   seansu, tylko podmieniana. **To był korzeń całego wrażenia kokpitu**:
   ciemność musiała być stała, bo musiała być gotowa na kartę, która nigdy nie
   schodziła.

## Decyzje

Rozstrzygnięte w wywiadzie, wszystkie zgodnie z rekomendacją:

| Pytanie | Wybór |
| --- | --- |
| co się dzieje na wejściu | auto-play w spokojnym tempie, przepustnica zostaje |
| ile chromu w spoczynku | nic poza włosem postępu |
| jak wspomnienie schodzi | samo po dalszej drodze, plus swipe w dół |
| tempo domyślne | półtorej godziny marszu w około dwie minuty |
| kamera przy wspomnieniu | odjeżdża płynnie |
| przyciski na górze | powrót zostaje, warstwy się chowają |

## Jak to działa teraz

**Dwie ramy kadru, jeden suwak między nimi.** `WALK_PAD` 0.34 stawia chodzącego
na 67% wysokości: kadr jest drogą przed tobą. Gdy wchodzi wspomnienie,
przechodzimy na `READ_PAD` 0.42 od dołu i chodzący wędruje na 29%: kamera
odjeżdża, świat opada, robi się miejsce na kartę. To ta sama zmiana rejestru, co
„idę, staję, patrzę", i wraca sama.

Przejście jest wygładzane **w pętli klatek**, a nie przez `easeTo`, bo `jumpTo`
lata w każdej klatce i wygrałoby z animacją paddingu. Jeden skalar (0 to
chodzenie, 1 to czytanie) jedzie wykładniczo z `PAD_TAU` 260 ms i wychodzi razem
z resztą kamery w tym samym `jumpTo`.

**Ciemność jest zdarzeniem.** Rozmycie i czerń wjeżdżają z kartą i schodzą razem
z nią. W spoczynku zostaje sam cichy cień na dole (`__hem`, 22% wysokości), bo
włos postępu i wjeżdżający dial muszą mieć na czym stać, gdy pod nimi trafi się
jasne pole.

**Karta schodzi po metrach, nie po sekundach**, bo prędkość jest zmienna i
sekundy dawałyby raz mrugnięcie, raz wieczność. 140 m dalszej drogi z podłogą
4,5 s. Liczby z pomiaru: w domyślnym tempie wyprawa idzie około 40 m na sekundę
ekranu, więc 140 m to 3,5 s i podłoga rządzi. Pierwsza próba miała 60 m i 2,5 s
i karta uciekała, zanim dało się przeczytać nazwę. **Gdy stoisz, karta zostaje**,
bo metry przestają rosnąć i warunek nie zachodzi. Swipe w dół zdejmuje od razu.

**Dotknięcie mapy zatrzymuje i wznawia**, a osobny przycisk pauzy zniknął. Tu był
ukryty konflikt: „dotknij, żeby pokazać sterowanie" i „dotknij, żeby zatrzymać"
to ten sam gest. Robią więc jedno: dotknięcie zatrzymuje **i** pokazuje dial, na
którym widzisz, jak rączka wraca na środek. Kontrolka pokazuje ci, co się właśnie
stało. Piny mają pierwszeństwo, bo handler i tak sprawdzał trafienie w
`mem-stop-hit`.

**Sterowanie gasi się samo** po 2,5 s, ale tylko gdy coś jedzie. Sprawdzenie
siedzi w samym timerze, nie przy jego zakładaniu, bo `centre()` sprowadza rączkę
do zera przez 360 ms i w momencie dotknięcia jeszcze nie stoi.

**Tempo.** `MAX_RATE` z 90 na 180, a domyślne siedzi w **połowie** skoku, nie na
końcu. Rachunek: 5400 s przez 120 s to 45 razy szybciej, a przepustnica jest
kwadratowa, więc połowa skoku daje czwartą część maksimum. Rączka w spoczynku
stoi tak, że widać, że można i szybciej, i wolniej.

**Dial** ma 260×100 zamiast 330×128, czyli o 38% mniej powierzchni, i zjechał
niżej, bo znad niego zniknęła pauza. Skok palca zszedł ze 130 na 110 px, żeby
rączka nadal jechała pod palcem jeden do jednego. Łuk zostaje: łuk mówi
„przepustnica", suwak mówiłby „przewijanie".

**Włos postępu** na krawędzi, 2 px, tylko do czytania. Przewijanie zrobiłoby z
niego scrubber, a cały ten ekran stoi na tym, że masz przepustnicę. Dotąd nie
było nigdzie widać, ile wyprawy zostało.

**Atrybucja** startuje zwinięta do samego „i". Dotąd leżała pod ciemnym dołem i
nikt jej nie widział; gdy ciemność stała się zdarzeniem, wyszła na wierzch i
zajmowała dwie linie kadru. Zwijamy raz, ale nie odbieramy: po dotknięciu „i"
zostaje otwarta na dobre.

## Pułapka warta zapamiętania: ujemne dt

Pierwsze uruchomienie stało z zegarem na zerze i wyglądało, jakby auto-play nie
działał. Prawdziwy przebieg zdarzeń był inny:

1. Pierwsza klatka po commicie Reacta dostała znacznik **początku tej samej
   klatki**, w której wykonał się effect, czyli chwilę wcześniejszy niż
   `performance.now()` z linijki powyżej. Zmierzone **minus 53 ms**.
2. Przy wygładzaniu wykładniczym ujemne `dt` daje współczynnik **poniżej zera**,
   czyli krok w złą stronę. Skalar kadru wyszedł na −0.23.
3. Padding wyszedł na minus, a MapLibre rzuca wyjątkiem na ujemnym paddingu.
4. **Wyjątek w callbacku `requestAnimationFrame` zabija całą pętlę**, bo nie
   dochodzi do kolejnego `requestAnimationFrame`. Ekran zamarł i nie było po czym
   poznać, co się stało.

Stąd dwie rzeczy w kodzie: `dt` przycięte do `[0, 64]` (górna granica po to, żeby
powrót z tła nie teleportował wyprawy o pół doliny) i padding zaciskany do zera
przed wysłaniem. Kamera nie jest miejscem na ambicje.

## Czego nie ruszaliśmy

Mapa działa jak dotąd, i to było wprost w prośbie: to samo prowadzenie, to samo
patrzenie w przód (`LOOKAHEAD_M`), to samo wygładzanie kursu (`TURN_TAU`), ten
sam pitch 58, ta sama ortofotomapa o poziom głębiej, ta sama szczypta z
limitami. Zmieniło się tylko, gdzie w kadrze siedzisz i co wokół tego wisi.
