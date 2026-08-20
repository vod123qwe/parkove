# Wrzuć tu arkusze pieczątek

1. Zapisz arkusz jako PNG (najlepiej z przezroczystym tłem) w tym folderze,
   np. `stamps-01.png`.
2. Odpal cięcie:

   npm run stamps assets-in/stamps-01.png

   Drugi argument to indeks startowy na liście parków (domyślnie 0), np. dla
   drugiego arkusza z kolejnymi dziesięcioma pieczątkami:

   npm run stamps assets-in/stamps-02.png 10

Kolejność pieczątek musi odpowiadać `docs/content/parks-list.md`.
Skrypt wykrywa siatkę sam (rzędy i kolumny z projekcji pikseli), wycina każdą
naklejkę, usuwa tło połączone z krawędzią (kremowy kontur naklejki zostaje)
i zapisuje `public/stamps/<id park>.png` w rozmiarze 512 px.
