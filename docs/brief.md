# Parkove — brief projektu

Stan: komplet decyzji koncepcyjnych po sesji grillowej 2026-08-19. Kodu jeszcze nie ma.

## Czym jest Parkove

Osobista gra terenowa o Krakowie: mapa fog-of-war miasta, na której zbierasz parki jak do kolekcji.
Wchodzisz do parku z telefonem, apka wykrywa pozycję i otwiera bottom sheet "jesteś w Parku X".
W dużych parkach chodzisz po punktach questa (pomnik, staw, stary dąb), komplet punktów = park
"zahaczony" w 100%. Wizualnie: minimalizm w duchu AllTrails (dużo bieli, zieleń, ładny font,
karty ze zdjęciami, ikonowe akcenty).

Dla mnie i bliskich, nie produkt publiczny. Zero moderacji, zero kont publicznych, pełna swoboda iteracji.

## Decyzje (rozstrzygnięte)

### Fundament
- **Odbiorca:** ja + bliscy (rodzina). Osobista zabawka, nie produkt.
- **Platforma:** PWA teraz (mobile-first), natywna iOS dopiero gdy pętla zaskoczy. Świadoma zgoda na podwójną robotę.
- **Zakres danych:** kuratorowana lista ~50 miejsc: oficjalne parki ZZM + perełki (kopce, Zakrzówek, Las Wolski, Błonia).
- **Core loop:** kolekcja "zaliczyć Kraków" + questy POI równolegle, nie po kolei.

### Mechanika
- **Model procentowy (jeden model dla wszystkiego):** każdy park ma N punktów; park bez questa ma
  dokładnie 1 punkt = samo wejście. % parku = zebrane/N, % Krakowa liczy się z sumy punktów.
  Wizualnie pierścienie postępu, nie tabelki.
- **Check-in:** apka prosi o lokalizację, czyta pozycję i otwiera bottom sheet z informacją co się
  dzieje ("jesteś w Parku Jordana", postęp, akcje).
- **Zaliczanie POI:** jestem blisko punktu -> komunikat (wibracja/dźwięk z otwartej apki) -> sheet
  punktu: nazwa, co to za miejsce, ciekawostka lub zadanie, postęp questa (3/5), wskazanie
  kolejnego punktu. Komplet = "zahaczyłeś cały park".
- **Tryb wyprawy (obejście braku GPS w tle w PWA):** jak nagrywanie trasy w AllTrails: start
  wyprawy, Wake Lock trzyma ekran, watchPosition wykrywa punkty na żywo. Ograniczenie iOS Safari
  przyjęte świadomie: telefon w kieszeni z zgaszonym ekranem nie zawoła; to dostanie dopiero
  wersja natywna.
- **Ślad GPS:** każda wyprawa nagrywa trasę, dystans i czas. Ślady rysują się na mapie parku,
  km i czas zasilają staty.
- **Tryb widoczności POI wybierany przed wyprawą:** "Planer" (piny widoczne, trasujesz spacer)
  albo "Odkrywca" (radar ciepło-zimno, licznik 0/5). Obie opcje w grze.
- **Retencja:** park zaliczony raz na zawsze (fog-of-war się odkrywa), każda kolejna wizyta bije
  licznik i buduje staty (ulubiony park, wizyty w roku). Odznaki sezonowe: później.

### Questy i treść
- **Pokrycie na start:** questy (3-5 POI) tylko w top ~12 parkach (Jordana, Błonia, Las Wolski,
  Zakrzówek, kopce...). Pozostałe parki: sam check-in; questy dorastają organicznie po wizytach.
- **Treść POI jest dwupoziomowa (decyzja 2026-08-19):**
  1. **Teaser (jawny):** nazwa punktu + jedno zdanie "co tu jest" (pomnik X, staw, stary dąb).
     Widoczny przed wyprawą na karcie parku i na mapie: planujesz świadomie, nie w ciemno.
  2. **Reveal (ukryty):** legenda, ciekawostka lub anegdota związana z miejscem. Odblokowuje się
     wyłącznie na miejscu: push/wibracja przy wejściu w promień punktu i dopiero wtedy apka
     "funduje atrakcję". Tajemnicą nie jest lokalizacja, tylko opowieść.
- **Karta parku = scouting:** zdjęcia (z neta dla nieodwiedzonych), opis, lista POI z teaserami
  (nigdy z reveal), informacje praktyczne (wstęp płatny/darmowy, teren, wejścia).
- **Produkcja treści:** Claude researchuje seed (historia, ciekawostki, POI z weryfikacją źródeł),
  Jarek waliduje per każdy park i dopisuje własne tipy po wizytach.
- **Zdjęcia hybrydowo:** karta parku, w którym jeszcze nie byłem, pokazuje zdjęcia z internetu
  jako zwiastun (scouting klimatu przed wyprawą). Moje własne zdjęcia z wizyt budują album
  wspomnień. Apka prywatna, więc licencje zdjęć bez spiny.

### Nagrody (trzy warstwy, nie trzy opcje)
1. **Odznaka parku:** automatyczna, każdy park. Szara -> kolorowa (odwiedzony) -> złota (100% POI).
2. **XP i poziom odkrywcy:** globalny pasek karmiony punktami, parkami, wizytami; tytuły poziomów.
   Plus milestone'y: 5/15/30/50 parków, cała dzielnica, wszystkie kopce.
3. **Realne nagrody-rytuały:** opcjonalne pole w treści parku ("odblokowałeś: ławka z najlepszym
   widokiem"). Kuratorowane tylko tam, gdzie jest co dać.

Gdzie jaka nagroda = decyzja w danych treści per park.

### Architektura informacji
- **Ekran główny:** pełnoekranowa mapa fog-of-war Krakowa (odwiedzone parki w kolorze, reszta
  wyszarzona) + bottom sheet z kartami parków, search i profil jako warstwy.
- **Multi-user:** profile per osoba + widok "rodzina" (suma odwiedzin, kto był gdzie).
- **Sync:** mały darmowy backend (Cloudflare Worker + KV albo Val Town). Umożliwia prawdziwy sync
  profili i w przyszłości powiadomienia typu "Ania zaliczyła Zakrzówek".
- **Dane lokalne:** IndexedDB (zdjęcia nie zmieszczą się w localStorage).

### Stack i design system
- **DS-first:** najpierw design system (tokeny + komponenty), apka konsumuje wyłącznie komponenty
  z DS, zmiana w DS propaguje się wszędzie. Apka nie ma własnych stylów poza kompozycją.
- **Stack:** Vite + React, własny katalog komponentów jako strona (wzorzec Atlas Storybook),
  bez Storybook.js. Mapa: MapLibre GL + darmowe vector tiles (OpenFreeMap/Positron, do
  potwierdzenia przy budowie).
- **Źródło DS:** kod-first. Tokeny w JSON/CSS variables jako jedyne źródło prawdy, katalog =
  żywa dokumentacja. Figma opcjonalnie później, generowana z tokenów.
- **Tryby:** struktura tokenów z modes (light/dark) od dnia 1, zgodnie z zasadą "modes switch
  tokens, never hand-build a second screen". Dopracowanie dark tuż po light (spacery o zmierzchu).

### Wizual
- **Paleta:** leśna zieleń, spokojna. Seed w HCT: hue ~140, umiarkowana chroma; dużo bieli/papieru,
  zieleń jako akcent. Złoto/bursztyn zarezerwowane dla odznak i 100%. Seed -> key colors ->
  tonal palettes -> role; korekty jak najwyżej w łańcuchu.
- **Typografia:** Bricolage Grotesque (nagłówki, karty) + Manrope (UI, tekst). Google Fonts.
- **Ikony:** outline, minimalistyczne, spójny zestaw (do wyboru przy DS: Lucide jako kandydat).
- **Charakter:** AllTrails-minimalizm; subtelne scrimy, ciche bordery, generous spacing na skali.

## Otwarte wątki (do decyzji przy budowie)
- Dane parków: brakujące w OSM do ręcznej kuracji: Park Dąbie, Park Wadów. Do weryfikacji
  granice z importu: Błonia (93,7 ha wg OSM, oficjalnie ~48), Młynówka Królewska (fragment 9,3 ha),
  kopce jako koła 80 m (OSM ma tylko punkty szczytów). Skrypt: scripts/fetch-parks.mjs.
- Zawartość sheeta POI ponad bazę; kandydaci z grilla: przycisk "zrób zdjęcie" (wspomnienie do
  dziennika wyprawy), dystans i kierunek do następnego punktu, mikro-historia "skąd ta nazwa",
  animacja pieczątki przybijanej na punkt.
- Lista top 12 parków questowych (propozycja do walidacji przy researchu treści).
- Promień zaliczenia POI (start: ~40 m, do stestowania w terenie na miejskim drifcie GPS).
- Szczegóły backendu: Cloudflare Worker + KV vs Val Town; prosty auth (kod rodzinny?).
- Wygląd odznak parkowych (ikona per park: kopiec, staw, aleja...).
- Onboarding/landing i copy (UI po polsku czy angielsku: do decyzji, apki osobiste Jarka bywają PL).
- Odznaki sezonowe i porównywarka rodzinna: po MVP.

## Fazowanie
1. **Faza 0 — DS core:** tokeny (HCT, light/dark modes), typografia, komponenty bazowe
   (karta, sheet, pierścień postępu, odznaka, przyciski), katalog komponentów.
2. **Faza 1 — mapa i kolekcja:** MapLibre + fog-of-war, dane ~50 parków (poligony z OSM,
   kuratorowane), karta parku, check-in wejściowy, % Krakowa.
3. **Faza 2 — wyprawa:** tryb wyprawy (Wake Lock, watchPosition), ślad + km + czas,
   questy pilotażowo w 3 parkach, oba tryby widoczności POI.
4. **Faza 3 — nagrody i album:** odznaki, XP/poziomy, milestone'y, album zdjęć (IndexedDB),
   ekran profilu/gabloty.
5. **Faza 4 — rodzina:** backend sync, profile, wspólna mapa.
6. **Faza 5 — treść i polish:** questy do pełnych 12 parków, realne nagrody-rytuały,
   dark dopracowany, PWA manifest/instalacja, ikona apki.
