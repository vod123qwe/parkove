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

## Czego jeszcze nie ma

Podpowiadania w drugą stronę: apka nie mówi jeszcze „idziesz do Będkowskiej, a
nie masz jej pobranej". Wiersz trzeba na razie zauważyć samemu.
