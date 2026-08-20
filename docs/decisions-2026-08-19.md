# Decyzje sesji 2026-08-19 (runda 2)

Ustalenia z rozmowy po pierwszych testach w terenie. Stan wdrożenia oznaczony.

## Wdrożone (v0.6.1)

1. **Peek**: przycisk secondary "Zobacz szczegóły miejsca" pod kropkami, większe spacingi
   (padding 12/24/24, uchwyt i kropki z oddechem).
2. **Bez zoomowania**: katalog DS i apka mają `maximum-scale=1, user-scalable=no` — katalog jest
   częścią aplikacji, testuje się jak apkę.
3. **NavBar**: domyślnie tło strony, po scrollu półprzezroczyste tło + progressive blur z ogonem
   pod paskiem. Pasek nie skaluje się z treścią (position absolute nad scrollem).
4. **Katalog**: naprawione warstwy (panel sheeta = `isolation: isolate`, blur nagłówka nie
   podgląda strony za panelem). Changelog przepisany: wersja + data w jednym rzędzie, tytuł
   wydania pod spodem, tagi w kolumnie stałej szerokości, line-height 22, sekcje co 48 px.
5. **Segmented**: jedna wypukła pigułka przesuwa się między segmentami (transform 280 ms),
   zamiast pojawiania się przez alfę.

## Ustalone, do zbudowania

6. **Pytania-dylematy przy punktach** (nowa mechanika treści): pytanie pojawia się **po odkryciu
   punktu, w reveal**, pod legendą. Model: 2-3 odpowiedzi do tapnięcia, po wyborze apka pokazuje
   **kontrapunkt** (krótki argument drugiej strony) i rozkład wyborów w rodzinie. Cel: rozmowa na
   ławce, nie test wiedzy. Przykład (Kopiec Krakusa): kopiec stał 1200 lat, w 1934 rozkopano go w
   poszukiwaniu grobu Kraka i grobu nie znaleziono. Czy warto naruszyć zabytek, żeby poznać prawdę?
7. **Pieczątki za park** (zamiast fotki-pieczątki): każdy park ma pieczątkę zdobywaną za wizytę.
   **Assety graficzne dostarczy Jarek** — przypomnieć przy następnej sesji. Do tego czasu
   pieczątki lecą na odznakach z ikoną (ParkBadge).
8. **Podsumowanie wyprawy na koniec**: po zakończeniu ekran z trasą na mapie, km, czasem,
   zebranymi punktami i odkrytymi historiami; jedna karta do pokazania rodzinie.
9. **Karta parku (podstrona)** dostaje: hero + galerię zdjęć, opis "po co tam jechać" (2-3 akapity),
   oraz **udogodnienia**: plac zabaw dla dzieci (jest/nie ma), kawiarnia lub restauracja.
   Praktyczne info (godziny, teren, psy) NIE było wybrane, ale udogodnienia tak, więc idziemy
   wąsko: dzieci + jedzenie.

## Content w kolejce

10. **Zdjęcia**: uzupełnić braki (część punktów bez fotki: Stok Rękawki, Skałki, pomnik Jordana,
    Wojtek, Banach) — poprawić zapytania w `scripts/fetch-photos.mjs` i dobrać ręcznie.
11. **Twardowski szerzej**: rozbudować wątek legendy jako oddzielną wycieczkę po Skałkach
    Twardowskiego, z własnymi punktami (jaskinie, urwiska, miejsca z podania) i zdjęciami w opisie.
12. **Quest Skałki Twardowskiego**: osobny park questowy z podpunktami (dziś Skałki są jednym
    punktem w Zakrzówku; do rozdzielenia).
13. **Park w Skawinie**: dodać do kolekcji (poza granicami Krakowa, więc trzeba rozszerzyć skrypt
    Overpass o obszar Skawiny).

## Parkowane

14. **Mapa 3D / teren**: wracamy po domknięciu powyższego (propozycja: teren z kafelków wysokości
    + pochylenie kamery, żeby kopce wystawały z mapy).
15. **Tint / własne stylowanie mapy**: do analizy (można filtrować warstwy stylu MapLibre po
    kolorach i podmieniać je tokenami DS, albo dorzucić warstwę koloru z blend mode).
