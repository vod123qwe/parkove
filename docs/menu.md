# Menu, profil i ustawienia

Przebudowa z 2026-08-22. Jarek: „całe to menu do przebudowy, bo mam wrażenie, że
trzymamy trochę legacy, które jest bez sensu poukładane".

## Co było nie tak (nie wrażenie, konkret)

Pięć płaskich wierszy w menu, a pod nimi profil będący workiem na wszystko. Do
tego duplikaty:

- **Pieczątki** miały wiersz w menu **i** sekcję w profilu.
- **Wygląd mapy** i **wygląd aplikacji** miały po dwa wejścia: wiersz w menu
  **i** „Ustawienia" wewnątrz profilu.
- **Numer wersji, odświeżanie i katalog komponentów** siedziały w profilu, między
  pieczątkami a zdjęciami, choć profil jest o tym, co zrobiłeś.
- **„Dokąd dziś"**, czyli jedna z niewielu rzeczy, która realnie wyciąga z domu,
  była zakopana na samym dole profilu.

## Trzy przestrzenie

Menu jest hubem z trzema półkami. Każda odpowiada na inne pytanie:

| Półka | Pytanie | Co zawiera |
| --- | --- | --- |
| **Ty** | co zrobiłem | profil (statystyki, wyprawy, zdjęcia), pieczątki |
| **Wyprawy** | gdzie iść | miejsca do odkrycia, Dokąd dziś z konkretną nazwą |
| **Ustawienia** | jak to wygląda i czym jest | Wygląd, O aplikacji |

**Lista miejsc zostaje w menu**, choć ma też przycisk na mapie, i to nie jest
duplikat, tylko dwa konteksty: przycisk na mapie **nie istnieje w trakcie
wyprawy** (jego miejsce zajmuje pasek wyprawy), więc menu jest wtedy jedyną
drogą do listy. Jarek zapytał o to wprost i to pytanie było odpowiedzią.

**Dokąd dziś** pokazuje nazwę miejsca wprost w menu („Park Zielony Jar · czeka
wyprawa z punktami"), więc jeden dotyk pokazuje je na mapie. Reguła bez zmian:
jedno nieodwiedzone miejsce, stabilne w ciągu dnia (numer dnia modulo pula), z
preferencją dla tych, które mają punkty.

## Wygląd: kafle z podglądem, nie nazwy

Motyw i styl mapy to to samo pytanie („jak ma wyglądać"), więc mieszkają na
jednym ekranie. Wybór idzie **przez podgląd**, bo przy trzech stylach mapy nazwy
nic nie mówią, dopóki się ich nie spróbuje.

Podglądy są **rysowane, nie fotografowane**. Prawdziwy kadr wymagałby albo trzech
instancji mapy GL naraz (drogo, patrz komentarz w TileMap.tsx), albo zdjęć w
repozytorium, które martwieją przy każdej zmianie palety. Rysunek bierze kolory z
tej samej definicji stylu (`MAP_STYLES.swatch`), więc zawsze zgadza się z tym, co
zobaczysz. Motyw „auto" jest przecięty po skosie: pół jasnego, pół ciemnego.

Uwaga na nazwy w kodzie: `looksModalOpen` to ten ekran, a `looksOpen` to szybki
przełącznik stylu **na mapie**, pod przyciskiem warstw. Dwie różne rzeczy.

## O aplikacji

Rzeczy o samej apce, nie o Tobie: odświeżenie wersji (service worker podaje pliki
z pamięci, więc po wdrożeniu trzeba raz pobrać ręcznie), historia zmian, katalog
komponentów i **diagnostyka ekranu**. Diagnostyka jest tu jawnym wierszem, a nie
sekretem pod trzema dotknięciami numeru wersji: ta aplikacja ma jednego
użytkownika i to on ją debuguje.

## Profil po odchudzeniu

Zostało to, co jest o Tobie: pieczątki, zdjęcia z wypraw, moje wyprawy. Plus
jedno skrócenie do Wyglądu, bo o wyglądzie myśli się patrząc na własne zdjęcia.
