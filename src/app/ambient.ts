/*
 * Muzyka pod wspomnienia, składana na żywo.
 *
 * Jarek: „fajnie byłoby móc dopasować jakąś fajną spokojną muzyczkę pod takie
 * wspomnienia". Wybraliśmy syntezę zamiast nagrania i to była decyzja o trzech
 * konsekwencjach, wszystkich dobrych:
 *
 * - **zero bajtów**. Paczka offline miejsca waży 15 MB i nie chcę do niej
 *   dokładać czterech na jeden utwór, który usłyszysz dwadzieścia razy,
 * - **działa bez sieci z definicji**, bo nie ma czego pobierać,
 * - **nigdy się nie powtarza**, więc dziesiąta wyprawa nie brzmi jak pierwsza.
 *
 * Cena jest jedna i uczciwa: to brzmi jak syntezator, nie jak płyta. Dlatego
 * całość jest cicha, wolna i bez rytmu. Ma być tłem dla patrzenia, a nie
 * utworem, którego się słucha.
 *
 * Tonacja jest **wyliczona z identyfikatora wyprawy**, więc ta sama wyprawa
 * brzmi za każdym razem tak samo, a inna inaczej. Wspomnienie ma swój dźwięk,
 * tak jak ma swój kształt śladu.
 */

/** pentatonika molowa: pięć stopni, z których nie da się złożyć fałszu */
const SCALE = [0, 3, 5, 7, 10]
/** korzenie do wyboru, wszystkie nisko: A2 do E3 */
const ROOTS = [110, 116.54, 130.81, 146.83, 155.56, 164.81]

const KEY = 'pk-ambient'

/*
 * DOMYSLNIE WYLACZONA. Jarek po pierwszym odsluchu: "ta muzyczka jest mega
 * medytacyjna". To nie byl komplement, wiec seans startuje w ciszy, a glosnik w
 * naroczniku ja wlacza. Raz wlaczona zostaje wlaczona.
 */
export const ambientOn = () => localStorage.getItem(KEY) === 'on'
export const setAmbient = (on: boolean) => localStorage.setItem(KEY, on ? 'on' : 'off')

/** stały strumień liczb z tekstu: ta sama wyprawa, ta sama tonacja */
function seedOf(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 100000) / 100000
  }
}

export type Ambient = {
  /** ścisza muzykę, gdy na ekranie gra Twoje nagranie */
  duck: (on: boolean) => void
  stop: () => void
}

/**
 * Trzy warstwy i nic więcej: dron, oddech i pojedyncze dźwięki.
 *
 * Dron to cztery głosy w relacjach harmonicznych (korzeń, kwinta, oktawa,
 * duodecyma), każdy z własnym, bardzo wolnym falowaniem głośności. Oddech to
 * wolne falowanie filtra, które daje wrażenie, że coś tam żyje. Dźwięki spadają
 * co kilka sekund, w nieregularnych odstępach, przez echo, żeby miały gdzie
 * zniknąć.
 */
export function startAmbient(seedText: string): Ambient | null {
  type Ctor = typeof AudioContext
  const Ctx: Ctor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext
  if (!Ctx) return null

  let ctx: AudioContext
  try {
    ctx = new Ctx()
  } catch {
    return null
  }
  void ctx.resume()

  const rnd = seedOf(seedText)
  const root = ROOTS[Math.floor(rnd() * ROOTS.length)]

  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)
  // wejscie z ciszy przez trzy sekundy: nic nie ma prawa wskoczyc do ucha
  master.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 3)

  /* echo zamiast pogłosu: jedna linia opóźniająca ze sprzężeniem waży nic, a
     daje dźwiękom przestrzeń, w której mogą się rozejść */
  const echo = ctx.createDelay(1)
  echo.delayTime.value = 0.42
  const back = ctx.createGain()
  back.gain.value = 0.34
  const echoTone = ctx.createBiquadFilter()
  echoTone.type = 'lowpass'
  echoTone.frequency.value = 1800
  echo.connect(echoTone)
  echoTone.connect(back)
  back.connect(echo)
  echo.connect(master)

  /* dron */
  const drone = ctx.createGain()
  drone.gain.value = 0.5
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 430
  lp.Q.value = 0.7
  drone.connect(lp)
  lp.connect(master)

  const voices: OscillatorNode[] = []
  /*
   * Glosy sa HARMONICZNE, a nie rozstrojone w unisonie, i to jest poprawka po
   * pomiarze.
   *
   * Pierwsza wersja miala pary tego samego dzwieku rozstrojone o kilka centow.
   * Kilka centow przy 110 Hz to dudnienie raz na dwie sekundy, czyli para co
   * dwie sekundy sama sie kasuje: zmierzony poziom skakal o 17 decybeli i
   * brzmialoby to jak pulsowanie, nie jak pad.
   *
   * Teraz kazdy glos ma inna, calkowita relacje do korzenia (oktawa, kwinta,
   * duodecyma), wiec nic nie stoi obok siebie na tyle blisko, zeby sie znosic.
   * Ruch bierze sie z osobnego, bardzo wolnego falowania GLOSNOSCI kazdego
   * glosu, kazdy w swoim tempie: to oddycha, a nie pulsuje.
   */
  const layers: Array<[number, OscillatorType, number, number]> = [
    // [mnoznik, kształt, glosnosc, tempo falowania w Hz]
    [1, 'triangle', 0.5, 0.043],
    [1.5, 'triangle', 0.2, 0.061],
    [2, 'sine', 0.16, 0.037],
    [3, 'sine', 0.07, 0.075],
  ]
  for (const [mult, shape, level, rate] of layers) {
    const o = ctx.createOscillator()
    o.type = shape
    o.frequency.value = root * mult
    // pojedyncze, drobne przesuniecie na kwincie: rownej kwinty nikt nie stroi
    if (mult === 1.5) o.detune.value = 6
    const g = ctx.createGain()
    g.gain.value = level * 0.7
    const swell = ctx.createOscillator()
    swell.frequency.value = rate
    const swellAmt = ctx.createGain()
    swellAmt.gain.value = level * 0.3
    swell.connect(swellAmt)
    swellAmt.connect(g.gain)
    swell.start()
    o.connect(g)
    g.connect(drone)
    o.start()
    voices.push(o, swell)
  }

  /* oddech: wolne falowanie filtra, jedenaście sekund na cykl */
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 1 / 11
  const lfoAmt = ctx.createGain()
  lfoAmt.gain.value = 150
  lfo.connect(lfoAmt)
  lfoAmt.connect(lp.frequency)
  lfo.start()
  voices.push(lfo)

  /* pojedyncze dźwięki */
  let timer = 0
  const pluck = () => {
    const t = ctx.currentTime
    const step = SCALE[Math.floor(rnd() * SCALE.length)]
    const octave = rnd() < 0.35 ? 4 : 2
    const freq = root * octave * 2 ** (step / 12)
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = freq
    const g = ctx.createGain()
    g.gain.value = 0
    o.connect(g)
    g.connect(master)
    g.connect(echo)
    // miekkie wejscie i dlugi ogon: bez ataku nie ma perkusyjnosci, a wiec i rytmu
    g.gain.linearRampToValueAtTime(0.16, t + 0.7)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 5.2)
    o.start(t)
    o.stop(t + 5.4)
    // nieregularnie, bo regularnie znaczy rytm, a rytm popycha do przodu
    timer = window.setTimeout(pluck, 3200 + rnd() * 5200)
  }
  timer = window.setTimeout(pluck, 1400)

  let ducked = false
  return {
    duck(on: boolean) {
      if (on === ducked) return
      ducked = on
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.linearRampToValueAtTime(on ? 0.014 : 0.1, t + (on ? 0.35 : 1.6))
    },
    stop() {
      window.clearTimeout(timer)
      const t = ctx.currentTime
      try {
        master.gain.cancelScheduledValues(t)
        master.gain.setValueAtTime(master.gain.value, t)
        master.gain.linearRampToValueAtTime(0, t + 1.1)
      } catch {
        // kontekst mogl juz zniknac razem z ekranem
      }
      for (const o of voices) {
        try {
          o.stop(t + 1.2)
        } catch {
          // oscylator zatrzymany dwa razy rzuca, i nic z tego nie wynika
        }
      }
      window.setTimeout(() => void ctx.close().catch(() => {}), 1500)
    },
  }
}
