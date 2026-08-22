# Przewodnik (AI)

Stan: **działa** (wersja 0.70.0). Worker stoi, oba klucze są po stronie
Cloudflare, adres siedzi w `src/app/proxy.ts`.

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

## Najważniejsza decyzja jest wizualna

Parkove stoi na zasadzie, że **nigdy nie udaje wiedzy**. Odpowiedź modelu nie
może więc wyglądać jak treść, którą sprawdziliśmy:

- w rozmowie odpowiedź ma **chłodne tło i lewą krechę**, pytanie człowieka nie,
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
