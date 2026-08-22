# Offline: mapa pobrana przed wyprawą

Decyzja z 2026-08-22. Jarek: „dzisiaj testowałem apkę, ale miałem problem z netem
i nie mogłem z tego korzystać. Czy może podpowiadać albo dawać opcję pobrania
mapy wcześniej przed wyprawą?".

## Co było nie tak, i to na dwa sposoby

**Pierwszy: błąd, który sam wprowadziłem tego samego dnia.** Service worker
trzyma listę hostów kafelków i `mapy.geoportal.gov.pl` nigdy na niej nie było.
Gdy ortofotomapa stała się domyślnym stylem (0.78), kafle zaczęły chodzić **obok
cache**. Czyli od 0.78 do 0.82 mapa w dolinie miała mniejsze szanse niż
wcześniej. Naprawione w 0.82.

**Drugi, głębszy: cache był tylko pamiątką.** Service worker zapisuje to, co już
zobaczyłeś. Żeby mieć mapę doliny bez zasięgu, trzeba było wcześniej przejść tę
dolinę **z** zasięgiem. Czyli dokładnie to, czego nie da się zrobić.

## Jak to działa teraz

Pobieranie jest **świadome i policzone**. W karcie miejsca, pod pogodą, stoi
wiersz „Pobierz mapę na offline" z dwiema wagami:

- **Zwykła**: przybliżenia 13 do 17. Tyle używa żywa mapa w terenie.
- **Ostrzejsza**: do 18. Cztery razy więcej kafli, więc i megabajtów.

Dla Doliny Będkowskiej wychodzi 1314 kafli i 15 MB w wariancie zwykłym.

Do paczki wchodzi też **rzeźba terenu** (10 do 15, płaskie i lekkie), **wektory
na budynki** w odtwarzaniu 3D (poziom 14) i **zdjęcia punktów**, bo to one są
treścią wspomnienia, a leżą u nas i ważą tyle co nic.

Wyżej niż 18 nie ma po co: Geoportal kończy się na 19, a 19 dla całej doliny to
setki megabajtów. Odtwarzanie wyprawy prosi o 19 (patrz `map-imagery.md`), więc
**bez sieci będzie miększe**. To świadomy kompromis: mapa w terenie jest
ważniejsza niż ostrość seansu w domu, gdzie i tak jest wifi.

## Osobny koszyk, i to nie jest szczegół

Kafle lądują w cache `parkove-packs-v1`, którego **nikt nie przycina**. Zwykły
koszyk kafelków ma limit 900 i wyrzuca najstarsze, więc pobrana dolina
wyparowałaby po jednym spacerze po Krakowie. Service worker czyta ten koszyk
**jako pierwszy**, przed wszystkim innym.

Do tego prosimy o `navigator.storage.persist()`, bo bez tego system może to
sprzątnąć, gdy zabraknie miejsca.

## Waga liczona z próbki, nie z tabelki

Liczba przed pobraniem musi być prawdziwa, więc ściągamy po dwa prawdziwe kafle
z **każdej warstwy** i mnożymy przez liczbę kafli w tej warstwie.

Ważenie po warstwach jest tu całą rzeczą. Pierwsza wersja próbkowała po płaskiej
liście i pomyliła się prawie dwa razy w dół (8,3 MB wobec 15 MB rzeczywistych),
bo listę zdominowały setki lekkich kafli z niskich przybliżeń i kafle rzeźby, a
wagę robi jedno, najgęstsze przybliżenie.

## Detale wykonania

- **Pisze strona, nie service worker.** Przeglądarka pozwala pisać do Cache
  Storage ze strony, a jeden mechanizm mniej to jedno miejsce mniej, w którym
  coś się rozjedzie. Wszystkie serwisy dają nagłówki CORS (sprawdzone), więc
  odpowiedzi są zwykłe, nie nieprzejrzyste.
- **Sześć kafli naraz.** Dość, żeby było szybko, nie dość, żeby zdławić łącze.
- **Postęp co osiem kafli**, nie co jeden: 1300 przerysowań nikomu nie służy.
- **Da się przerwać**, a przerwane pobranie nie zapisuje się jako gotowe. To, co
  już zeszło, zostaje w koszyku, więc druga próba zaczyna od tego miejsca.
- **Margines 0,004 stopnia** wokół granicy miejsca: dojście, parking, powrót.

## Co się z nimi dzieje później

Pytanie Jarka: „są cały czas gdzieś na moim telefonie, czy z czasem znikają?".
Odpowiedź ma dwie połowy i tylko pierwsza zależy od nas.

**Nasza połowa: nic ich nie rusza.** Koszyk `parkove-packs-v1` nie ma limitu i
nie jest przycinany. Nie ma też numeru wersji w nazwie, w przeciwieństwie do
pozostałych koszyków, więc **przeżywa aktualizację aplikacji**: przy każdym
wdrożeniu kasujemy koszyki, których nie ma na liście do zachowania, a ten na niej
jest. Usuwa je tylko kosz w karcie miejsca albo „Usuń wszystkie" w O aplikacji.

**Systemowa połowa: może je usunąć.** Prosimy o trwałość przez
`navigator.storage.persist()` przy każdym pobraniu, ale to **prośba, nie
gwarancja**, i przeglądarka nie musi jej dać. Sprawdzone u nas: nie dała
(`persisted` zwraca fałsz). Bez trwałości dane strony są usuwalne, gdy
urządzeniu zabraknie miejsca.

Na iPhonie dochodzi jeszcze reguła WebKita: dane stron nieużywanych przez siedem
dni są czyszczone. **Aplikacja dodana do ekranu domowego jest z tej reguły
wyjęta**, a Parkove tak właśnie działa, więc to nas nie dotyczy. Zostaje samo
czyszczenie przy braku miejsca.

Dlatego apka mówi to sama, zamiast kazać pytać: wiersz **Mapy offline** w „O
aplikacji" pokazuje liczbę miejsc, wagę i wprost, czy przeglądarka obiecała je
trzymać, czy nie.

## Ufaj, ale sprawdzaj

Przy okazji tego pytania wyszła dziura, którą trzeba było załatać. Spis pobranych
miejsc leży w pamięci ustawień, a kafle w koszyku przeglądarki, i to są **dwa
osobne magazyny**. Gdy system wyczyści drugi, spis dalej twierdzi „mapa działa
offline". To najgorszy możliwy rodzaj awarii: dowiadujesz się o niej w dolinie,
bez zasięgu, ufając odznaczce.

Więc przy każdym wejściu do karty miejsca sprawdzamy trzy kafle z paczki. Trzy, bo
czyszczenie danych strony jest wszystko-albo-nic: nie zdarza się, żeby zniknął co
drugi kafel. Gdy ich nie ma, spis poprawia się sam, a wiersz mówi wprost, co się
stało: „ta mapa była pobrana, ale telefon posprzątał dane, żeby zrobić miejsce".

## Dlaczego było wolno

Jarek: „zastanawiam się, dlaczego tak wolno się pobiera, 8 MB trwa to z 2 minuty,
od czego to zależy, bo jestem na dobrym internecie".

Pomiar najpierw: 48 kafli z Geoportalu, surowo, bez naszej pętli. **11 ms na
kafel przy 6 wątkach, 7 ms przy 16, przy 32 już nic.** Czyli to praca
ograniczona **opóźnieniem, nie pasmem**: liczy się liczba zapytań w powietrzu, a
nie szerokość łącza. Sieć nie była winna.

Winne były trzy rzeczy w naszym kodzie, wszystkie po stronie dysku:

1. **Service worker robił całą pracę drugi raz.** Każdy kafel przechodził przez
   jego obsługę: dwa otwarcia koszyka, dwa odczyty, zapis do zwykłego koszyka
   kafelków i przycinanie. Czyli **dwa zapisy na dysk telefonu na jeden kafel**,
   bo strona zapisywała ten sam kafel do paczki.
2. **Przycinanie przechodziło cały koszyk przy każdym zapisie.** `cache.keys()`
   na koszyku trzymającym 900 pozycji, tysiąc razy pod rząd. To jest ta główna
   przyczyna.
3. **Czytaliśmy każde ciało odpowiedzi**, żeby policzyć bajty, choć waga stoi w
   nagłówku `content-length`.

Poprawki: kafel ciągnięty do paczki jest **oznaczony w zapytaniu** (`pkpack=1`) i
service worker przepuszcza go bez własnego cache; przycinanie robi się co
dwudziesty piąty zapis z zapasem nad limitem; wagę bierzemy z nagłówka; wątków
jest 12, nie 6.

Zmierzone w tym samym środowisku: **z około 20 ms na kafel na 5 ms**, czyli
cztery razy szybciej. Na telefonie różnica powinna być większa, bo tam service
worker jest aktywny, a to on wykonywał tę podwójną pracę, i tam dysk jest
wolniejszy.

Znacznik idzie w zapytaniu, a nie w nagłówku, bo nagłówek na zapytaniu
międzydomenowym wymusiłby dodatkową rundę CORS. Serwisy kafelkowe nieznane
parametry ignorują, co sprawdziłem, a do koszyka zapisujemy pod **czystym**
adresem, bo pod takim mapa potem o kafel pyta.

## Pasek u góry, i naprawione kłamstwo

Wiersz w karcie pisał „możesz zamknąć kartę, pobieranie idzie dalej", a stan
siedział w tym wierszu i sprzątanie po odmontowaniu **przerywało pobieranie**.
Komunikat obiecywał dokładnie to, czego kod nie robił.

Teraz zadanie żyje w module, jedno na całą aplikację (bo nie ma sensu ciągnąć
dwóch dolin przez to samo łącze), i przeżywa zamknięcie każdego widoku. Karta
miejsca jest tylko jednym z dwóch okien na ten sam stan.

Drugim jest **pasek u samej góry ekranu**: pierścień postępu, nazwa miejsca,
procent i odliczanie, plus krzyżyk do przerwania. Stoi nad wszystkim (140, czyli
nad arkuszami, warstwami i odtwarzaniem wspomnienia) i schodzi sam trzy i pół
sekundy po skończeniu.

Celowo **nie jest** komunikatem od dołu: tam mieszka to, co się właśnie stało, a
to jest stan, który trwa. Odliczanie jest z pomiaru, nie z obietnicy: bierze
tempo z tego, co już zeszło, i dlatego pojawia się po dwóch sekundach, gdy jest
z czego liczyć.

## Czego jeszcze nie ma

Podpowiadania w drugą stronę: apka nie mówi jeszcze „idziesz do Będkowskiej, a
nie masz jej pobranej". Wiersz trzeba na razie zauważyć samemu.
