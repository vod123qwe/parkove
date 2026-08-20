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

Pełne mapowanie id → nazwa: docs/content/parks-list.md
