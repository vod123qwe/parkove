# Parkove

Parki Krakowa jako gra terenowa. Progressive Web App: mapa parkow, wyprawy z
punktami do zaliczenia na miejscu, odznaki i dziennik spacerow.

Live: https://vod123qwe.github.io/parkove/

## Uruchomienie

```
npm install
npm run dev          # localhost:5183
npm run dev:phone    # HTTPS w sieci lokalnej, zeby telefon dostal GPS
npm run build        # produkcja do dist/
```

Katalog design systemu: `catalog.html` (`http://localhost:5183/catalog.html`).

## Struktura

- `src/ds/` - design system: komponenty, tokeny kolorow i typografii
- `src/app/` - aplikacja: mapa, wyprawy, profil
- `src/app/data/` - dane parkow, questow, udogodnien, parkingow
- `scripts/` - generatory: tokeny, ikony, pobieranie parkow i zdjec, ciecie stampow
- `public/photos`, `public/stamps` - zdjecia parkow i naklejki

## Dane

Granice parkow i punkty POI pochodza z OpenStreetMap (ODbL), zdjecia z
Wikimedia Commons - kazde z podpisem autora w aplikacji.

## Instalacja na telefonie

Otworz live URL w przegladarce i dodaj do ekranu glownego. Aplikacja ma
service worker, wiec po pierwszym otwarciu dziala tez bez internetu
(mapa korzysta z kafelkow zapisanych w cache).
