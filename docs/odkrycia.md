# Twoje odkrycia: mapa pod chmurami (fog of war)

Stan: koncepcja z 2026-08-24, makiety 13a i 13b w Figmie. Pomysł Jarka:
mapa odkryć z chmurami, które zakrywają nieodwiedzone, lekko się poruszają,
a pod mgłą widać delikatny kreskowany zarys. Umiejscowienie: profil.

## Gdzie to mieszka i czemu nie na głównym ekranie

Nowy pełnoekranowy widok w menu „Ty": **Twoje odkrycia**. Główny ekran zostaje
czysto operacyjny (dok z miejscami, wyszukiwarka, start wyprawy); tam mgła
walczyłaby z podstawową funkcją, czyli widzieć wszystko i wybrać cel.
Odkrycia to widok emocjonalny: kolekcja jako mapa, nie lista.

## Anatomia widoku (makieta 13a)

- Mapa Krakowa, spokojna kolorystyka apki.
- **Odkryte miejsca = czyste okna w mgle**: pełny kolor, etykieta z nazwą,
  złota obwódka dla miejsc domkniętych na 100%, limonkowa dla odwiedzonych.
- **Nieodkryte śpią pod chmurami**, z ledwie widocznym kreskowanym zarysem
  i znakiem zapytania. Zarys mówi „tu coś jest", nie mówi co.
- Dolna karta: licznik „23 z 57", pasek, rozbicie na bloki (Nowa Huta 4/6,
  Dolinki 2/7), jedna zasada wypisana wprost: **chmury ustępują tylko w terenie**.

## Ruch chmur (technicznie, tanio)

2 albo 3 warstwy kafelkowanych PNG z chmurami nad płótnem MapLibre, w tym
widoku i tylko w nim:

- powolny dryf każdej warstwy osobno (animacja CSS, różne prędkości i kierunki,
  celowo nierównomiernie),
- lekka paralaksa przy ruchu mapy: warstwy przesuwają się z różnym mnożnikiem
  względem kamery (nasłuch na move, transform bez przeliczania geometrii),
- okna wycinane maską z polygonów odkrytych parków (canvas mask albo
  mask-image), przeliczane przy zmianie viewportu, nie co klatkę.

Battery: animacja żyje wyłącznie na tym ekranie, wychodzisz i nic nie chodzi.

## Moment odkrycia (makieta 13b)

Po powrocie z nowego miejsca chmury rozchodzą się nad nim RAZ, na oczach:
poświata, promienie, etykieta, karta „Chmury się rozeszły!". Potem miejsce jest
po prostu odkryte na zawsze. Jeden moment, żadnych powtórek i żadnego grindu.

## Nadbudowa później (gamifikacja, po kolei)

1. Bloki-dzielnice z makiety 8 liczą się na tej samej mapie.
2. Roczne podsumowanie używa tego widoku jako tła (ekran „rok 2026").
3. Pocztówka-mapa: eksport obrazka z aktualnym stanem odkryć do wysłania.
4. Ewentualne progi w Leśniczówce (makieta 11) mogą czytać procent odkrycia.

## Stan wdrożenia (0.97.0)

Zbudowane zgodnie z koncepcją, z trzema świadomymi uproszczeniami:

1. **Okna w mgle są kołami z promieniem z powierzchni miejsca**, nie maskami
   dokładnych polygonów. Pod oknem i tak rysuje się prawdziwy obrys (fill +
   ring na mapie), więc kształt widać, a koło daje miękką krawędź tanio.
2. **Moment odkrycia odpala się przy pierwszym otwarciu ekranu** po nowej
   wizycie (lista obejrzanych w localStorage), nie na końcu wyprawy. Wejście z
   ekranu końca wyprawy można dodać później jednym przyciskiem.
3. **Rozbicie na bloki-dzielnice poczeka na etap bloków** (makieta 8); karta na
   dole pokazuje na razie licznik ogólny, złote i dolinki.

Technika jak w koncepcie: dwie warstwy kafelków PNG (public/clouds), jeden
canvas 2D, destination-out na okna, zarysy i znaki zapytania rysowane na mgle,
paralaksa z map.project, pętla rAF żyje tylko na tym ekranie. Z daleka zarysy
tylko dla miejsc od 9 ha, żeby mapa nie była tapetą z pytajników.

