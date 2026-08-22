# Tekstury mapy: skąd bierzemy zdjęcia

Decyzja z 2026-08-22. Jarek: „gdy myślę jeszcze o jakości mapy, czy bylibyśmy w
stanie pobierać jakieś lepsze tekstury? bo traci feeling funkcja, gdzie mamy
mapę w 3D podczas wspominania trasy odbytej, super byłoby mieć lepszą jakość".

## Co było

Wszystko stało na jednym źródle: **Esri World Imagery**, globalne, do zoomu 19.
Globalne zdjęcie ma tę wadę, że dla Polski dostajemy kadr, jaki akurat wpadł do
mozaiki, i wpadł zimowy: bezlistne drzewa, cień przez pół kadru, szarość.

## Co jest teraz

**Ortofotomapa GUGiK z Geoportalu**, serwis `ORTO/WMTS/StandardResolution`.
Zwykłe kafle raster w EPSG:3857, czyli wchodzi do MapLibre bez żadnych sztuczek:

```
https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMTS/StandardResolution
  ?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTOFOTOMAPA&STYLE=default
  &FORMAT=image/jpeg&TILEMATRIXSET=EPSG:3857
  &TILEMATRIX={z}&TILEROW={y}&TILECOL={x}
```

Sprawdzone na żywo, nie z dokumentacji: 200, `image/jpeg`, mediana 123 ms,
maksimum 275 ms, CORS przechodzi z przeglądarki. Pokrycie sprawdzone na
Będkowskiej, Zakrzówku i Skawinie.

Różnica na tym samym kadrze (Rynek Główny, zoom 19): Esri dał zimę, cień i
bezlistne drzewo, Geoportal lato, ostro, drzewo w liściach. W dolinie widać
bruzdy po orce i pojedyncze drzewa w szpalerze.

## Dwa poziomy ostrości, i to jest sedno

MapLibre wybiera poziom kafli ze wzoru `zoom + log2(512 / tileSize)`. Przy
`tileSize: 256` dostajemy `zoom + 1`, przy `128` dostajemy `zoom + 2`. Zdjęcie
nadal ma 256 pikseli, tylko wchodzi w mniejsze pole na ekranie: to zwykły
supersampling, dwa razy więcej pikseli na każdą oś.

Ma to znaczenie właśnie na telefonie. iPhone ma trzy piksele urządzenia na
jeden piksel CSS, a MapLibre tego nie wlicza przy wyborze kafla, więc zdjęcie
było dotąd rozciągane. Stąd „traci feeling".

- **żywa mapa**: `tileSize: 256`. Tam się przesuwa i przybliża bez końca, więc
  cztery razy więcej kafli byłoby cztery razy więcej ruchu w sieci w dolinie,
  gdzie zasięgu nie ma.
- **odtwarzanie wyprawy**: `tileSize: 128`. Kamera stoi na zoomie 16.6, czyli
  wypada dokładnie poziom **19**, a to jest maksimum Geoportalu. Spina się
  idealnie: najostrzej, jak można, i ani jednego kafla ponad to, co serwis ma.

Zmierzone w odtwarzaniu: 90 kafli na jedną scenę, w tym 45 na poziomie 19, a
resztę MapLibre wziął grubszą na dalszy plan (18, 15, 12, 11) — sam dzieli zoom
według odległości od kamery, więc horyzont nie kosztuje.

Do tego `raster-fade-duration: 100` na warstwach zdjęcia w odtwarzaniu.
Domyślne 300 ms wygląda dobrze przy nieruchomej mapie, ale tutaj kamera leci bez
przerwy, więc nowy kafel cały czas przenikał z rozmytego kafla-rodzica i obraz
nigdy nie dochodził do ostrości.

## Czego się nie da

**HighResolution.** Jest taki serwis (`ORTO/WMTS/HighResolution`) i ma większą
rozdzielczość, ale w kafelkach tylko EPSG:2180 i EPSG:4326. MapLibre potrzebuje
siatki w Web Mercatorze. WMS HighResolution też nie pomoże: podaje CRS:84,
EPSG:2180 i EPSG:4326, a MapLibre umie podstawić w URL tylko
`{bbox-epsg-3857}`. Reprojekcja po naszej stronie kończy się pionowym
rozciągnięciem kadru, więc odpada.

**Zoom 20.** StandardResolution kończy się na 19, na 20 zwraca błąd XML. Dlatego
`maxzoom: 19` jest twarde, a nie ostrożne.

**Automatyczny zapas.** Kilka adresów w `tiles` MapLibre traktuje jako
rozłożenie ruchu, nie jako failover. Gdy Geoportal nie odpowie, mapa jest pusta.
Dlatego **satelita Esri zostaje osobnym stylem**: to jest ten zapas, tylko
przełączany ręcznie w Wyglądzie.

## Styl mapy

Doszedł czwarty: **Ortofoto**, i on jest teraz domyślny. Ta apka chodzi tylko po
Polsce, więc krajowe zdjęcie jest właściwym domyślnym, a nie egzotyką. Kto już
kiedyś wybrał styl, ten zostaje przy swoim: wybór siedzi w pamięci telefonu.

Klucz stylu to `satellite-ortho`, nie `ortho`, i to jest celowe: `MapView`
rozpoznaje po `key.startsWith('satellite')`, że pod spodem leży zdjęcie, i od
tego zależy przezroczystość parków oraz kolory pinów.

Odtwarzanie wyprawy bierze ortofotomapę **zawsze**, niezależnie od wybranego
stylu mapy. Tam nie ma czego wybierać: to jeden lot kamery nad jedną trasą i ma
wyglądać najlepiej, jak potrafimy.

## Atrybucja

`Ortofotomapa: GUGiK, Geoportal` w polu `attribution` źródła, więc MapLibre
pokazuje ją sam w rogu.
