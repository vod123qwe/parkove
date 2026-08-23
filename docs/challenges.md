# Wyzwania: jak je sprawdzam

Wyzwań jest 26 i wszystkie są **funkcjami stanu gry**, nie osobnym licznikiem
(patrz nagłówek `src/app/data/challenges.ts`). Ta decyzja ma jeden skutek
praktyczny dla testowania: nie da się sprawdzić wyzwania, klikając w apce, bo
warunek zależy od historii, którą trzeba by przejść nogami. Dlatego sprawdzam je
przez podstawienie stanu.

## Trzy testy, które wyłapują trzy różne rodzaje błędu

**1. Spis danych.** Ile w apce jest w ogóle rzeczy, których wyzwanie wymaga.
Wyzwanie „trzy skały" jest niemożliwe, jeśli punktów tej kategorii jest dwa, a to
się nie objawi żadnym błędem: będzie po prostu wisiało nieosiągalne.

Stan na 2026-08-23: 163 punkty, 57 miejsc.

| kategoria | punktów | najwyższy próg |
| --- | --- | --- |
| history | 45 | 5 |
| monument | 42 | brak wyzwania |
| water | 24 | 5 |
| view | 14 | 5 |
| nature | 13 | brak wyzwania |
| cave | 11 | 2 |
| climb | 7 | 3 |
| meadow | 5 | brak wyzwania |
| play | 2 | brak wyzwania |

Miejsca: 33 parki, 7 dolinek (`valleys-all` = 7), 4 kopce (`mounds-all` = 4),
3 wody, 3 lasy, 4 przyrodnicze, 2 łąki, 1 ogród. Wszystkie progi mieszczą się w
danych.

**2. Gracz idealny.** Podstawiam stan, w którym zrobiono wszystko: każde miejsce
odwiedzone pięć razy, wszystkie punkty zebrane, szesnaście wypraw (w tym jedna o
siódmej, jedna o dziewiętnastej i para w dwa kolejne dni), 72 km razem, zdjęcia,
notatka, nagranie i osiem dylematów. **Wynik: 26/26.** Każde wyzwanie da się
zdobyć.

**3. Stan pusty.** Zero wypraw, zero miejsc. **Wynik: 0/26 i wszystkie liczniki
na zerze.** Nic nie zapala się samo, co przy `Math.max(0, ...[])` i podobnych nie
jest oczywiste.

## Co ten audyt znalazł

Jedną rzecz, w treści, nie w liczeniu: `walk-weekend` nazywa się „Dwa dni pod
rząd", a podpowiedź mówiła „Wyprawa w sobotę i w niedzielę". Kod od początku
przyjmował **dowolne** dwa kolejne dni, czyli zgadzał się z nazwą, a nie z
podpowiedzią. Poprawiłem podpowiedź, nie kod: warunek jest lepszy od obietnicy,
bo przy dziecku wtorek i środa liczą się tak samo jak weekend.

Przy okazji wyszła druga rzecz, której nie widać z apki. Dni liczyły się przez
dzielenie znacznika czasu przez dobę, czyli **w UTC**: granica dnia wypadała o
drugiej w nocy naszego czasu, więc wyprawa zaczęta o pierwszej należała do dnia
poprzedniego i para dni się nie schodziła. Teraz dzień jest lokalny, a doba
następna liczona przez `setDate(+1)`, bo przy zmianie czasu doba ma 23 albo 25
godzin i arytmetyka na milisekundach rozjeżdża się dokładnie w ten weekend, w
który najłatwiej pójść dwa dni pod rząd.

Sprawdzone przypadki: sobota+niedziela, wtorek+środa, przełom miesiąca
(31.07+01.08), weekend zmiany czasu (25+26.10), wyprawa o pierwszej w nocy po
wyprawie wieczorem, oraz przerwa (sobota+poniedziałek = nie liczy się).

## Czego ten audyt NIE sprawdza

Czy próg jest **przyjemny**. Że da się zdobyć pięćdziesiąt kilometrów, wiadomo z
arytmetyki; czy chce się je zrobić, wie tylko Jarek po kilku wyprawach.
