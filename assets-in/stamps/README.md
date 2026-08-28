# Pojedyncze pieczątki (lepsza jakość)

Wrzuć tu jeden plik PNG na park, nazwany dokładnie jak id parku, np.:

    blonia.png
    kopiec-krakusa.png
    skalki-twardowskiego.png

Potem odpal:

    npm run stamps:files            # przetwarza cały folder
    npm run stamps:files blonia     # tylko jeden park

Skrypt usuwa tło (flood fill od krawędzi, kremowy kontur naklejki zostaje),
obcina marginesy i zapisuje kwadratowe 768 px PNG do public/stamps/.
Nadpisuje istniejące pieczątki, więc można podmieniać pojedynczo.

Każdy finalny plik musi mieć prawdziwą przezroczystość poza kremowym obrysem.
Importer sprawdza kanał alfa, cztery narożniki i minimum 5% transparentnego
płótna. Wadliwy kandydat jest odrzucany bez nadpisania działającej pieczątki.
Finalne PNG pozostaje true-colour RGBA, bo paleta PNG8 potrafi zamienić alfę 0
na śladową alfę 1–2 i technicznie przywrócić prostokątne płótno.

Pełne mapowanie id → nazwa: docs/content/parks-list.md
