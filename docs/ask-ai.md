# Przewodnik (AI) — WYCOFANE

**Stan: usunięte z aplikacji 2026-08-22 (wersja 0.74.0).** Jarek: „nie dodawaj
takiego asystenta jednak". Przycisk „Punkty" wrócił na swoje miejsce w pasku
wyprawy.

Ten dokument zostaje jako zapis decyzji i tego, co zbudowaliśmy, bo pomysł może
wrócić w innej formie. Co zostało w repozytorium:

- **Worker ma nadal ścieżkę `/ask`** (workers/plant-proxy). Nic jej nie woła, nie
  kosztuje nic, gdy leży odłogiem, a klucz Gemini siedzi w Cloudflare.
- **`src/app/data/nearby.json`** (2250 punktów: 296 toalet, 1700 placów zabaw,
  152 lodziarnie, 102 poidełka, z przewijakami i opłatami) plus generator
  `npm run nearby`. Nic tego nie importuje, więc nie waży w aplikacji. To gotowy
  materiał na „toalety na mapie" albo na filtr, gdyby kiedyś się przydał.
- Usunięte: `GuideSheet.tsx`, `guideContext.ts`, `AskBox.tsx`, `ask.ts` i ich
  style oraz wszystkie wejścia w interfejsie.

**Co zostaje działające:** rozpoznawanie roślin (Pl@ntNet), bo to osobny serwis i
osobna funkcja, patrz [plant-id.md](plant-id.md).

Czego nauczyła nas ta próba, na wypadek powrotu, jest niżej.

---


## Po co, i czym to NIE jest

Pierwsza wersja była widgetem na końcu karty punktu. Jarek od razu powiedział, że
to złe miejsce, i miał rację: **widget odpowiada na pytanie o akapit, który
właśnie przeczytałeś, a przewodnik idzie z tobą**. Przewodnik potrzebuje innego
kontekstu i innego wejścia.

Dlatego jest **jedna rozmowa w całej aplikacji i wiele wejść do niej**:

- **ekran główny**, przycisk obok „Miejsca" (to samo piętro decyzji: gdzie idę,
  o co pytam),
- **karta miejsca**, wiersz przy pogodzie, bo to te same pytania z innej strony,
- **karta punktu**, jedno dotknięcie „Zapytaj przewodnika" z kontekstem tego
  punktu,
- **pasek wyprawy**, w miejscu listy punktów: listę i tak otwiera dotknięcie
  białej karty wyżej, więc trzeci przycisk paska powtarzał to samo.

Wątek rozmowy trzyma `App`, nie arkusz: arkusz przy zamknięciu jest
odmontowywany, a w terenie zamyka się wszystko odruchowo i rozmowa musi to
przeżyć.

## Co przewodnik wie (decyzja Jarka: wszystko z czterech)

`src/app/guideContext.ts` buduje kontekst jako zwykły tekst, nie JSON, bo model
czyta go lepiej, a w logu Workera widać dokładnie to, co dostał:

1. **gdzie stoisz**: dystans do granicy wybranego miejsca, trzy najbliższe
   punkty z odległościami **oraz sześć najbliższych miejsc z całej aplikacji**,
   licząc do granicy, nie do środka (do dużej doliny wchodzi się bokiem, a
   dystans do środka kłamałby o kilometr). To ostatnie jest odpowiedzią na
   pytanie „co jest dookoła mnie", którego wcześniej nie dało się zadać, bo
   kontekst znał tylko punkty jednego parku,
2. **postęp**: ile punktów zdobytych, ile do pieczątki, które zostały,
3. **pogoda**: teraz i najlepsze okno dnia (to samo, co widać w karcie),
4. **treść punktów tego miejsca**: nazwy i jednozdaniowe zaczepki, a dla punktu,
   o który pytasz wprost, cały opis wraz z legendą, wyraźnie oznaczoną jako
   podanie.

**Skąd pozycja.** Pytanie telefonu o lokalizację było zaszyte w efekcie karty
podglądu, więc przewodnik otwierany z ekranu głównego nie wiedział nic o tym,
gdzie stoisz. Teraz o pozycję pyta jedna funkcja, wołana przez podgląd, przez
przewodnika przy każdym otwarciu (o ile odczyt nie jest świeższy niż minuta) i
przez przycisk **„Udostępnij lokalizację"** w samej rozmowie. Bez pozycji
przewodnik mówi to wprost, zamiast udawać, że wie.

Kontekst jest przycięty do 5800 znaków. Bez tego rósł do kilkunastu tysięcy i
model gubił pytanie.

## Lekcja z terenu: „jakby nie chciał powiedzieć"

Jarek zapytał w mieście, gdzie obok jest plac zabaw. Przewodnik znał pozycję, ale
odesłał go do parku i kazał rozejrzeć się koło swojej ulicy, choć dwa place były
niedaleko. Trzy przyczyny, wszystkie po naszej stronie:

1. **Kontekst nie miał ani jednego placu zabaw.** Mieliśmy je w danych
   (`amenities.ts`, 211 punktów), ale przewodnik ich nie dostawał. Teraz dostaje
   osiem najbliższych, licząc od pozycji, z nazwą parku, przy którym stoją.
2. **Instrukcja kazała mu wracać do parku.** Brzmiała „trzymaj się miejsca, o
   które pyta użytkownik, a jeśli pytanie odchodzi, wróć do miejsca". To była
   recepta na wykręcanie się. Teraz pierwsze zdanie instrukcji brzmi „odpowiadaj
   na pytanie, które zadano", a wybrany park jest **punktem odniesienia, nie
   granicą rozmowy**.
3. **Worker ucinał kontekst do 2400 znaków**, a kontekst przewodnika ma do 5800,
   więc koniec (postęp, pogoda, punkty) po prostu nie docierał. Limit podniesiony
   do 6000.

Do tego mówimy modelowi wprost, **czego w danych nie ma**: place zabaw mamy tylko
przy parkach, osiedlowych nie. Dzięki temu odpowiedź brzmi teraz „najbliższe z
aplikacji to X i Y, ale po drodze możecie trafić na osiedlowe, których nie mam w
spisie", a nie „poszukaj koło siebie".

## Kilka modeli po kolei

Darmowy próg Gemini jest liczony **per model** i jest mały (rząd dwudziestu
zapytań na dobę), a nazwy modeli zmieniają się częściej niż ta aplikacja.
Worker próbuje więc po kolei: `GEMINI_MODEL` (jeśli ustawiony), potem
`gemini-3.7-flash`, `gemini-3-flash-preview`, `gemini-2.5-flash`,
`gemini-2.0-flash`. Schodzi niżej **tylko** przy 429 (brak limitu) i 404 (nie ma
takiego modelu); błąd merytoryczny zwraca od razu, bo powtarzanie go nic nie da.
Odpowiedź nosi nazwę modelu, który jej udzielił.

W testach 22 sierpnia widać było oba przypadki: najnowszy model kończył limit po
kilkunastu pytaniach, a Worker schodził na `gemini-3-flash-preview` i rozmowa
szła dalej.

## Najważniejsza decyzja jest wizualna

Parkove stoi na zasadzie, że **nigdy nie udaje wiedzy**. Odpowiedź modelu nie
może więc wyglądać jak treść, którą sprawdziliśmy:

- rozmowa wygląda jak rozmowa: **pastylki**, twoje słowa po prawej w miętowej,
  odpowiedź po lewej w chłodnej, z cienką obwódką. Kształt niesie autorstwo, więc
  nie podpisujemy każdej linii słowem „ty",
- arkusz otwiera się **na pełnej wysokości** (`openAt="full" stretch`), bo czat na
  dwóch trzecich ekranu każe przewijać po drugim zdaniu, a pole wpisywania lgnie
  do dolnej krawędzi,
- wejście z karty punktu ma **przerywaną ramkę**,
- nota jest wprost: „Odpowiada model językowy i może się mylić. Treść punktów w
  aplikacji jest sprawdzona, ta rozmowa nie."

Ta sama logika, co przy legendach: legenda ma własny krój, żeby nie udawała
faktu.

**Pytania na start** (cztery pastylki) są tam z premedytacją: puste pole to
najgorsze, co można dać komuś, kto stoi w terenie z jedną wolną ręką.

## Zasady dla modelu siedzą w Workerze

Instrukcja systemowa jest **po stronie Workera**, nie w kodzie strony. Gdyby
leżała w aplikacji, każdy mógłby ją podmienić i użyć naszego klucza do czegoś
innego. Aplikacja przysyła tylko pytanie i kontekst punktu.

Zasady:

- po polsku, dwa do czterech zdań, prostym językiem, bez list,
- trzymaj się miejsca, o które pytam,
- **nie wymyślaj**: żadnych dat, nazwisk, wysokości ani legend na niepewno, a
  gdy nie wiesz, powiedz „nie wiem",
- legendę zawsze nazywaj legendą,
- nie doradzaj jedzenia roślin i grzybów, nie oceniaj bezpieczeństwa jaskiń,
  skał i kąpieli: odeślij do oznaczeń na miejscu,
- mów o tym, co widać na miejscu, bo użytkownik czyta to stojąc w terenie.

## Limity i pieniądze, uczciwie

Google **przestał publikować** tabelę darmowego progu, widać ją tylko w panelu
konta, a doniesienia z końca 2025 mówią o rzędzie dwudziestu zapytań na dobę dla
modeli Flash. Dwadzieścia pytań dziennie **na cały klucz**, nie na osobę.

Dlatego:

- Worker ma **własny dzienny limit** (`ASK_LIMIT`, domyślnie 60) i po jego
  przekroczeniu odpowiada odmową, nie rachunkiem.
- Aplikacja liczy pytania lokalnie i pokazuje, ile ich dziś było, żeby limit nie
  był zaskoczeniem.
- Przy koncie płatnym Flash-Lite to ułamki grosza za pytanie, więc setka pytań w
  miesiącu kosztuje mniej niż kawa. To decyzja Jarka, nie techniczna.

Sieć jest wymagana i mówimy to wprost: w dolinie bez zasięgu komunikat brzmi
„Bez sieci nie zapytam".

## Włączenie

Ten sam Worker obsługuje rośliny i pytania, więc stawiasz go raz (patrz
[plant-id.md](plant-id.md)). Do tego jeden dodatkowy sekret:

```bash
npm run ask:key
```

Model można podmienić bez zmiany kodu, sekretem `GEMINI_MODEL` (domyślnie
`gemini-3.7-flash`).

## Uwaga o API

Gemini przeszedł na endpoint `interactions` z prostszym ciałem zapytania
(`model`, `input`, `system_instruction`, `generation_config`). Worker czyta
odpowiedź **odpornie na wersję**: najpierw szuka kroków `model_output`, potem
starych `candidates`, potem `output_text`. Zmiana kształtu odpowiedzi nie ubije
więc funkcji po cichu.
