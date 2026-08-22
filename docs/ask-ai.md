# Zapytaj o to miejsce

Stan: **kod gotowy, funkcja wyłączona** do wklejenia adresu Workera i dodania
klucza Gemini.

## Po co

Czytasz o Jaskini Nietoperzowej i rodzi się pytanie, którego w karcie nie ma.
Dziś nie masz gdzie go zadać. Pudełko na końcu karty punktu przyjmuje pytanie i
odpowiada, mając w kontekście to, co aplikacja o tym punkcie mówi.

## Najważniejsza decyzja jest wizualna

Parkove stoi na zasadzie, że **nigdy nie udaje wiedzy**. Odpowiedź modelu nie
może więc wyglądać jak treść, którą sprawdziliśmy. Pudełko ma:

- **przerywaną ramkę** i chłodne tło, inne niż cała reszta karty,
- etykietę „Zapytaj o to miejsce" z ikoną iskry,
- notę wprost: „Odpowiada model językowy i może się mylić. Reszta tej karty jest
  sprawdzona, ta odpowiedź nie."

Ta sama logika, co przy legendach: legenda ma własny krój, żeby nie udawała
faktu.

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
