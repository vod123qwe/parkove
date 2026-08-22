# Rozpoznawanie roślin ze zdjęcia

Stan: **działa** (od wersji 0.69.0). Sprawdzone na zdjęciu Dębu Jagiellońskiego:
wróciło „Quercus robur, 43 procent" i dwa inne dęby za nim.

## Dlaczego nie Google

Google nie ma darmowego API, które ze zdjęcia powie gatunek rośliny. Cloud
Vision zwraca etykiety w rodzaju „plant, leaf, green" i ma tysiąc jednostek na
miesiąc, a to nie odpowiedź na pytanie „co to jest". Wyszukiwanie obrazem
(Lens) nie ma publicznego API.

**Pl@ntNet** jest zrobiony dokładnie do tego: model na florze świata, i darmowe
konto daje **500 identyfikacji na dobę**, do 5 zdjęć w jednym zapytaniu, JPG albo
PNG, razem najwyżej 50 MB. Odpowiedź zawiera `remainingIdentificationRequests`,
więc aplikacja może powiedzieć, ile pytań zostało na dziś.

## Dlaczego potrzebny jest pośrednik

Parkove to statyczna strona na GitHub Pages. Klucz wpisany w kod aplikacji jest
publiczny i pierwsza osoba, która zajrzy w źródła, może wyczerpać dzienny limit.
Klucz siedzi więc w Workerze Cloudflare (darmowy plan, 100 tysięcy zapytań na
dobę), a aplikacja wysyła tam samo zdjęcie.

Worker sprawdza nagłówek `Origin`. To nie jest szczelne, bo poza przeglądarką
Origin da się podrobić, ale odsiewa przypadkowe użycie z cudzej strony. Klucz
nigdy nie opuszcza Workera i to jest tu najważniejsze.

## Włączenie, raz

Wrangler (narzędzie Cloudflare) jest już w projekcie jako zależność
deweloperska, więc nie trzeba nic instalować globalnie. Cztery komendy, każda
osobno:

```bash
npm run plant:login
```

```bash
npm run plant:deploy
```

```bash
npm run plant:key
```

```bash
npm run plant:test -- https://parkove-plant.TWOJ-LOGIN.workers.dev
```

- `plant:login` otwiera przeglądarkę i łączy terminal z kontem Cloudflare.
- `plant:deploy` wypuszcza Workera i wypisuje jego adres. Idzie PRZED kluczem
  świadomie: gdy Worker już istnieje, `plant:key` nie pyta, czy go utworzyć.
- `plant:key` pyta o klucz Pl@ntNet i zapisuje go **po stronie Cloudflare**.
  Klucz nie trafia do repozytorium ani do niczyich rąk. Po zapisaniu klucza
  Worker działa od razu, bez ponownego wypuszczania.
- `plant:test` pyta Workera prawdziwym zdjęciem, pomijając aplikację, więc od
  razu wiadomo, czy działa Worker, czy trzeba szukać w interfejsie.

Adres z `plant:deploy` wklejasz do `PROXY` w
[src/app/proxy.ts](../src/app/proxy.ts). Jedna stała na całą aplikację, bo ten
sam Worker obsługuje też pytania o punkt (patrz [ask-ai.md](ask-ai.md)) i
stawiasz go raz. Dopóki stała jest pusta, przyciski w ogóle się nie pokazują.

Jeśli chcesz od razu włączyć pytania o punkt, dorzuć drugi sekret:

```bash
npm run ask:key
```

Klucz bierze się z darmowego konta na my.plantnet.org: **500 identyfikacji na
dobę**, ponad 50 tysięcy gatunków. Po zalogowaniu klucz leży w ustawieniach
konta.

Gdy coś nie działa, `npm run plant:log` pokazuje na żywo, co Worker odpowiada.

## Pełnoekranowa kamera (od 0.71.0)

Główna droga to własna kamera, nie systemowy aparat. Wejście: menu „+" w trakcie
wyprawy, pozycja **Sprawdź roślinę**.

Przepływ zamówiony przez Jarka:

1. **Kamera na cały ekran** z podglądem na żywo i spustem jak w iOS: biały
   pierścień na dole, krzyżyk do zamknięcia w lewym górnym rogu.
2. Zdjęcie zamraża kadr, a **ten sam krążek zamienia się w zielony ptaszek**.
   Obok pojawia się strzałka powrotu, czyli „zrób jeszcze raz".
3. Dotknięcie ptaszka robi z niego **loader** i wysyła zdjęcie.
4. Wynik pojawia się **w tym samym miejscu**: nazwa, pewność w procentach,
   rodzina, ile pytań zostało na dziś i dwie pozostałe propozycje modelu. Tło
   panelu jest przyciemnione i rozmyte, żeby dało się to przeczytać na każdym
   zdjęciu.
5. Trzy wyjścia: **Jeszcze raz**, **Zapisz w wyprawie** (rozpoznanie ląduje w
   dzienniku jako zdjęcie z podpisem) i **Zamknij**.

Jedno kółko, trzy znaczenia, jedno miejsce na ekranie: palec nie musi szukać.

**Gdy nie ma dostępu do kamery** (odmowa uprawnienia, brak urządzenia) spadamy na
systemowy aparat przez zwykły input z plikiem. Ta droga miała błąd wyłapany w
testach: komunikat o kamerze zostawał na ekranie razem z ukrytym spustem, więc po
zrobieniu zdjęcia nie było czym potwierdzić. Teraz komunikat znika, gdy zdjęcie
już jest.

Kamera jest zamykana razem z oknem: inaczej dioda aparatu zostaje zapalona.

## Jak to działa w aplikacji

Zdjęcie robisz jak zawsze, w trakcie wyprawy. W karcie zdjęcia jest przycisk
„Co to za roślina?". Aplikacja zmniejsza zdjęcie do 1024 px dłuższego boku i
wysyła do Workera, a wraca do trzech propozycji z procentem pewności. Dotknięcie
propozycji wstawia ją jako podpis zdjęcia, więc rozpoznanie od razu zostaje w
dzienniku wyprawy.

Sieć jest wymagana i mówimy to wprost: bez zasięgu komunikat brzmi „Bez sieci
nie rozpoznam", a nie kręcące się kółko.

## Czego tu nie ma

- Rozpoznawania zwierząt, grzybów i budynków. To model roślinny.
- Zapisywania rozpoznań jako osobnej kolekcji. Wynik ląduje w podpisie zdjęcia.
- Pytania „a co z tym zrobić": Pl@ntNet nie mówi, czy roślina jest jadalna, i
  aplikacja też nie będzie.
