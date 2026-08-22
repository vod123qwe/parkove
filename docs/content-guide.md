# Czego szukać w parku, żeby było o czym opowiadać

Kryteria od Jarka (2026-08-22), zapisane jako lista kontrolna do pracy nad
treścią. Punkt jest wart opisania, jeśli trafia w co najmniej jedno:

1. **Natura sama w sobie** — starodrzew, buczyna, łąka, woda, ptaki.
2. **Unikalny element natury** — coś, czego nie ma obok: martwica wapienna,
   starorzecze, wywierzysko, pomnik przyrody, jaskinia.
3. **Pomnik, ludzki albo naturalny** — rzeźba, tablica, kopiec, ale też skała,
   która ma imię.
4. **Legenda** — o miejscu albo o jego nazwie. Twardowski, Krak, Wanda, Żabi Koń.
5. **Coś ważnego się tu wydarzyło** — historia, wojna, decyzja, pierwszy raz.
6. **Miejsce inspiruje** — malowali je, pisali o nim, wracali do niego.
7. **Jest ikoną** — rozpoznasz je ze zdjęcia bez podpisu.
8. **Jest po prostu rozrywkowe** — plac zabaw, tor, wodny plac, dobra górka.
9. **Słynie z czegoś lokalnego** — grzyby, jeżyny, sanki, latawce, kąpielisko.

## Trzy poziomy opowieści (propozycja, 2026-08-22)

Dziś punkt ma dwa poziomy: `teaser` (jedna linia) i `description` (dwa, trzy
akapity), plus `reveal` odblokowywany na miejscu i `dilemma`. To wystarcza dla
większości miejsc i nie wystarcza dla kilku, w których historia jest za duża,
żeby ją domknąć dwoma zdaniami. Twardowski jest tego przykładem.

Propozycja:

- **`long?: string[]`** — wersja rozwinięta, za przyciskiem „Czytaj dalej".
  Krótka zostaje domyślna, żeby chodzenie po parku nie zamieniło się w czytanie.
- **`legend?: string[]`** — osobny blok pod własnym nagłówkiem, w innym kroju
  (Kalam, który już wczytujemy), żeby na pierwszy rzut oka było widać, co jest
  podaniem, a co faktem. Nigdy nie mieszamy jednego z drugim w jednym akapicie.

Kolejność pisania, od największego zwrotu: Skałki Twardowskiego, Kopiec Krakusa,
Kopiec Wandy, Jaskinia Nietoperzowa, Brama Bolechowicka.

## Stan na 2026-08-22

108 punktów w 46 miejscach. Każdy ma opis, puentę i dylemat. Źródła zapisane
przy 39, czyli przy dolinkach i Skawinie: starsze parki krakowskie pisaliśmy
przed wprowadzeniem pola `sources` i to jedyna dziura w tej warstwie.

## Decyzje z grilla o mapie i o liście punktów (2026-08-22)

**Reflektor na mapie (zbudowane).** Wybór parku przyciemnia całą mapę poza jego
granicą: jeden wielokąt na świat z dziurą w kształcie parku. Park w reflektorze
traci wypełnienie i dostaje najgrubszą linię, bo chodzi o to, żeby zobaczyć, co
jest w środku. Zasłona idzie nad pinami pieczątek (cudze parki gasną razem z
mapą) i pod wszystkim, co dotyczy wybranego parku: jego punkty, udogodnienia,
twój ślad i twoja kropka zostają czyste. Bez wyboru parki są mocniejsze niż
dotąd: linia 2,2 px zamiast 1,6 i wypełnienie 36 procent zamiast 28 na satelicie.
Rozmycia mapy nie da się zrobić: MapLibre nie ma blura w paincie, a filtr CSS
rozmyłby całą kanwę razem z parkiem.

**Lista punktów w trakcie wyprawy (zbudowane).** Otwiera ją przycisk Punkty.
Wiersze po dystansie, najbliższy nieodkryty na górze, zdobyte na końcu, wyszarzone.
Dotknięcie punktu **ustawia cel**: karta live przestaje wybierać najbliższy i
pokazuje ten wskazany. Przy celu ma być **strzałka kierunku** (Jarek zmienił tu
wcześniejszą decyzję o braku kompasu), więc potrzebny jest kompas telefonu:
`DeviceOrientationEvent.requestPermission()` po dotknięciu, a gdy nie ma zgody
albo czujnika, zostaje sam dystans. Bez udawania strzałki.

Na górze tej listy siedzi też wybrany szlak (patrz [trails.md](trails.md)), żeby
zmiana wariantu w terenie była jednym dotknięciem.
