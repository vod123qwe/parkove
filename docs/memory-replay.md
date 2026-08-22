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

## Krok drugi: przepustnica na krawędź, treść w dół

Po pierwszym podejściu dial siedział na dole i to nadal kosztowało miejsce.
Jarek: „może kontrolka prędkości powinna się pojawiać po prawej jak suwak na
środku, a nie na dole, wtedy byłoby więcej miejsca na content" i „nie
musielibyśmy zostawiać spacingu na ewentualną kontrolkę na dole, więc cały
content poszedłby w dół".

**Przepustnica stoi pionowo na prawej krawędzi**, na środku wysokości, w pasku
szerokości kciuka. Trzy rzeczy na tym zyskaliśmy:

- dół należy w całości do treści i nie trzyma zapasu na kontrolkę, więc
  wspomnienie zjeżdża aż do włosa postępu,
- pion jest **uczciwszy wobec metafory**: komentarz w tym pliku od zawsze mówił
  „push it up and your past self starts moving", a łuk był poziomy,
- zdjęcie może być większe: 72% szerokości zamiast 57%.

Łuk zamieniliśmy na drabinkę kresek z pastylką jeżdżącą po niej. Poświata idzie
**za rączką**, a nie stoi w środku toru: to ona robi z drabinki przepustnicę, a
nie rząd kresek. Dłuższa kreska w środku znaczy stop.

**Zegar poszedł na górę, na oś.** Najpierw wylądował w lewym dolnym narożniku i
wchodził wprost na „czytaj więcej": dół jest teraz treścią, a góra była i tak
pusta.

## Formy wspomnień

Jarek: „pomyślałbym, czy też nie zmienić formy wyświetlania tych informacji,
zdjęć, notatek, audio".

Punkt był **jedyną formą bez żadnego przedmiotu**: sam akapit na czerni, podczas
gdy zdjęcie miało polaroida, a notatka karteczkę. A w repozytorium leży 45 zdjęć
punktów, z których ten ekran nie korzystał ani razu.

| Forma | Jak wygląda | Otwiera się? |
| --- | --- | --- |
| punkt ze zdjęciem | zdjęcie miejsca, prosto, bez ramki, pod nim nazwa i zajawka | tak, pełny opis |
| punkt bez zdjęcia | nazwa i zajawka | tak, pełny opis |
| Twoje zdjęcie | polaroid, przekrzywiony, podpis kursywą kroju wyświetlanego | tak, pełny ekran |
| notatka | cytat: ręczny krój i znak cytatu u góry | **nie** |
| nagranie | przycisk odtwarzania i własna fala, podpis pod nią | **nie** |

Zdjęcie punktu jest **proste i bez białej ramki**, i tym różni się od Twojego
polaroida: to nie Twoja fotka, to jest to miejsce.

**Notatka przestała być karteczką.** Żółty posit był najgłośniejszym obiektem w
całym kadrze i zabierał pół ekranu czemuś, co jest jednym zdaniem. Zostaje ręka,
która to napisała, i znak cytatu u góry. Ręczny krój, a nie kursywa kroju
wyświetlanego, bo kursywa należy do podpisów pod zdjęciem i nagraniem, a notatkę
pisałeś Ty.

**Notatka i nagranie nie otwierają nowego okna** (decyzja Jarka). Są tu już całe:
notatka to jedno zdanie, nagranie gra na miejscu. Dlatego przestały być
przyciskiem, żeby nie udawały, że gdzieś prowadzą. Otwiera się tylko to, co ma co
pokazać więcej: zdjęcie ma pełny ekran, punkt ma opis, legendę i dylemat.

## Rozejrzenie się

Jarek: „myślę, żeby mieć możliwość lekko obracania, pod jakim kątem widzę z tyłu
punkt, bo czasem gdzieś postać wychodzi za górę i nie widać".

Jednym palcem po mapie, bo mapa ma wyłączone przesuwanie i obracanie, więc nic
nam tego gestu nie zabiera:

- **poziomo** obracasz się wokół chodzącego, do 60 stopni w każdą stronę,
- **pionowo** podnosisz i opuszczasz kamerę, od 40 do 60 stopni.

To drugie rozwiązuje zasłonięcie skuteczniej, bo z góry nie zasłania nic. Górna
granica to 60, bo tyle daje MapLibre bez podnoszenia `maxPitch`, i nie ma o co
walczyć: wyższy kąt to większy dramatyzm i większy koszt, a nie lepsza
widoczność.

Trzy rzeczy, które trzeba było rozwiązać:

- **każdy gest wybiera swoją oś na pierwszym ruchu** i przy niej zostaje. Dwie
  osie naraz w jednym przeciągnięciu robią się papkowate,
- **przeciągnięcie nie może liczyć się jako dotknięcie**, bo mapa nie
  przechwytuje przesuwania i po każdym obrocie leci normalny `click`. Bez tego
  każde rozejrzenie się zatrzymywałoby wyprawę,
- **kamera odświeża się tylko wtedy, gdy coś jedzie**, więc rozejrzenie się na
  stojąco nie miałoby jak wejść na ekran. Stąd jednorazowa prośba o domalowanie
  kadru.

Oba przesunięcia zostają, dopóki ich nie odkręcisz, bo dolina ma ten sam kształt
przez całą drogę. Blisko wartości wyjściowej wracają do niej same, żeby kadr dał
się wyprostować bez celowania.

## Co zostało sprawdzone na żywo

Wszystkie pięć form, każda z osobna, na zasianej wyprawie w Dolinie Będkowskiej:
punkt ze zdjęciem, punkt bez zdjęcia, polaroid z podpisem, notatka jako cytat i
nagranie z falą. Do tego obie osie rozejrzenia się (kurs 3 → 51 → −40 stopni,
kąt 58 → 44 → 60) i to, że karta zostaje na postoju.

## Poprawki po pierwszym teście na telefonie

**Kafle ortofotomapy nie były cache'owane.** Service worker trzyma listę hostów
kafelków i Geoportalu na niej nie było, więc od chwili, w której ortofoto stało
się domyślne, kafle szły obok cache i dolina bez zasięgu nie miała z czego się
złożyć. To jest winowajca mapy, która się nie ładowała.

**Ręczne pismo to Patrick Hand.** Ma jedną grubość, więc wszędzie, gdzie kod
prosił o 700, prosi teraz o 400: pojedyncza grubość poproszona o pogrubienie daje
sztuczny obrys, a nie inny krój.

**Zdjęcie ląduje, a nie przeskakuje.** Przyczyna nie była w animacji karty:
wjeżdżała ona dokładnie w tej samej chwili, w której cztery warstwy
`backdrop-filter` zmieniały krycie, a przenikanie rozmycia to najdroższa rzecz,
jaką telefon może robić. Rozmycie ma teraz własny, krótszy przedział czasu i
wchodzi **po** ruchu karty.

**Wypychanie.** Gdy dwa wspomnienia leżą blisko siebie, stare odjeżdża w górę,
maleje i gaśnie za nowym, zamiast podmieniać treść w miejscu.

**Morph rączki dzieje się pod palcem** i wraca po zwolnieniu, jednym transformem
CSS na grupie: geometria SVG jako własność CSS nie jest wszędzie animowalna, a
transform jest i idzie po stronie kompozytora. Krzywa ma lekki wyskok, więc
zwolnienie jest odbiciem, nie samym powrotem.

**Włos postępu usunięty** na życzenie Jarka. Argumentowałem za nim („nie ma jak
poznać, ile zostało"), ale to jego ekran i jego decyzja.

## Muzyka: generowana, nie nagrana, i domyślnie cicha

Jarek chciał „fajną spokojną muzyczkę pod takie wspomnienia". Wybraliśmy
**syntezę na żywo** zamiast nagrania, z trzech powodów: zero bajtów w paczce
offline (a paczka miejsca waży 15 MB i nie ma po co dokładać do niej czterech na
jeden utwór), działa bez sieci z definicji, i nigdy się nie powtarza.

Tonacja jest **wyliczona z identyfikatora wyprawy**, więc ta sama droga brzmi za
każdym razem tak samo, a inna inaczej. Wspomnienie ma swój dźwięk, tak jak ma
swój kształt śladu.

Konstrukcja: dron z czterech głosów w relacjach harmonicznych, wolne falowanie
filtra jako oddech, i pojedyncze dźwięki z pentatoniki molowej w nieregularnych
odstępach, przez echo.

**Poprawka po pomiarze, warta zapamiętania.** Pierwsza wersja miała pary tego
samego dźwięku rozstrojone o kilka centów, „bo dwa idealnie zgodne oscylatory
brzmią jak sygnał". Kilka centów przy 110 Hz to dudnienie raz na dwie sekundy,
czyli para co dwie sekundy sama się kasuje: zmierzony rozrzut głośności wyniósł
**17 dB** i brzmiałoby to jak pulsowanie, nie jak pad. Po przejściu na relacje
harmoniczne (korzeń, kwinta, oktawa, duodecyma) z osobnym, bardzo wolnym
falowaniem głośności każdego głosu rozrzut spadł do **4,6 dB**.

**Twoje nagranie ma pierwszeństwo**: gdy na ekranie gra głos z wyprawy, muzyka
schodzi prawie do zera i wraca wolniej, niż zeszła.

**Domyślnie wyłączona.** Jarek po pierwszym odsłuchu: „ta muzyczka jest mega
medytacyjna". Więc seans startuje w ciszy, a głośnik w narożniku ją włącza.

Urywki znanych utworów, o które pytał, odpadają i to nie z powodów technicznych:
to cudze nagrania i nie wolno ich wozić w aplikacji. Dwie drogi, które zostają,
gdyby wrócił do tematu: **własny plik** wybrany z telefonu (jego kopia, tylko
lokalnie, nic nie wychodzi na zewnątrz) albo **inny charakter syntezy**, bliżej
lo-fi niż medytacji: miękki puls, akordy z septymą, lekkie falowanie taśmy.
