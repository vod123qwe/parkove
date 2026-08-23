import { useEffect } from 'react'

/*
 * Licznik jasnych ekranów pełnoekranowych.
 *
 * Zwykły znacznik nie wystarczy, bo ekrany się zagnieżdżają (lista miejsc, a w
 * niej karta szlaku): gdy pierwszy się zamyka, drugi wciąż stoi i podłoże musi
 * zostać jasne. Liczymy więc, ile ich jest, a nie czy jest jakiś.
 */
let open = 0

/**
 * „Ten ekran jest jasny i zajmuje cały ekran".
 *
 * Ma znaczenie dla jednego pasa pikseli w całej aplikacji, i to nie żart.
 * Pasa nad wskaźnikiem domu nie maluje żadna warstwa: widok na iPhonie jest
 * niższy od ekranu (zmierzone: 797 przy 844), a `html` i `body` mają
 * `overflow: hidden`, więc wszystko namalowane niżej jest obcięte. Ten pas maluje
 * płótno przeglądarki i bierze kolor z tła dokumentu.
 *
 * Domyślnie jest ciemny, bo pod spodem leży ciemne zdjęcie lotnicze. Jasny ekran
 * musi więc o siebie poprosić, inaczej pod białą kartą zostaje czarny pasek,
 * i to był dokładnie ten pasek, który wracał cztery razy.
 */
export function useLightChrome(active: boolean) {
  useEffect(() => {
    /*
     * Warunek jest tu, a nie u wołającego, i to jest cała różnica między
     * działaniem i niedziałaniem. Hooki wykonują się przy KAŻDYM renderze, także
     * wtedy, gdy komponent zaraz zwróci `null`, więc wersja bez `active`
     * zgłaszała jasny ekran także dla wszystkich zamkniętych modali: znacznik
     * siedział na dokumencie od pierwszej sekundy i pas nad wskaźnikiem domu był
     * jasny nawet pod mapą.
     */
    if (!active) return
    open += 1
    document.documentElement.dataset.pkLight = 'on'
    return () => {
      open -= 1
      if (open <= 0) {
        open = 0
        delete document.documentElement.dataset.pkLight
      }
    }
  }, [active])
}
