/**
 * Żywe tło pod kartami podpowiadacza: kilka miękkich plam światła, które
 * powoli krążą, plus reakcja na to, w którą stronę ciągniesz kartę.
 *
 * Dlaczego własny shader, a nie three.js: potrzebujemy jednego prostokąta na
 * cały ekran i jednego fragment shadera. Three.js dokłada do tego kilkaset
 * kilobajtów i całą scenę z kamerą, której nie ma czego pokazać, a apka jest
 * PWA, którą ładuje się na telefonie i która ma działać offline. Poniżej jest
 * tyle WebGL-a, ile ta animacja naprawdę potrzebuje.
 *
 * Kolory bierzemy z tokenów DS przez getComputedStyle, więc tło zmienia się
 * razem z motywem i nie trzeba trzymać drugiej palety.
 *
 * Gdy WebGL nie wystartuje (stary sprzęt, wyłączona akceleracja), funkcja
 * zwraca null, a ekran zostaje przy zwykłym gradiencie z CSS.
 */

const VERT = `
attribute vec2 pos;
void main() { gl_Position = vec4(pos, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform vec2 res;
uniform float time;
/* -1 = ciagniesz w lewo, 1 = w prawo, 0 = karta stoi */
uniform float tilt;
uniform vec3 cBase;
uniform vec3 cWarm;
uniform vec3 cCool;
uniform vec3 cGlow;

/* miekka plama swiatla: im blizej srodka, tym jasniej, bez ostrej krawedzi */
float blob(vec2 uv, vec2 at, float size) {
  float d = length(uv - at) / size;
  return exp(-d * d * 1.6);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);
  float t = time * 0.12;

  /* cztery plamy na roznych orbitach: razem nigdy nie wracaja w to samo miejsce */
  vec2 a = vec2(cos(t * 0.9) * 0.42, sin(t * 1.3) * 0.38 + 0.16);
  vec2 b = vec2(sin(t * 1.1) * 0.5 - 0.2, cos(t * 0.7) * 0.44 - 0.22);
  vec2 c = vec2(cos(t * 0.5 + 2.1) * 0.36 + 0.24, sin(t * 0.9 + 1.2) * 0.3 - 0.3);
  vec2 d = vec2(sin(t * 0.8 + 4.0) * 0.3, cos(t * 1.5 + 0.6) * 0.34 + 0.32);

  /* przechyl przesuwa plamy za palcem: tlo idzie w te sama strone co karta */
  float shift = tilt * 0.16;
  a.x += shift; b.x += shift * 0.7; c.x += shift * 1.2; d.x += shift * 0.5;

  float wa = blob(uv, a, 0.62);
  float wb = blob(uv, b, 0.54);
  float wc = blob(uv, c, 0.46);
  float wd = blob(uv, d, 0.5);

  vec3 col = cBase;
  col = mix(col, cGlow, wa * 0.55);
  col = mix(col, cCool, wb * 0.5);
  col = mix(col, cWarm, wc * 0.45);
  col = mix(col, cGlow, wd * 0.32);

  /*
   * Odpowiedz na gest: w prawo tlo cieplieje i jasnieje, w lewo gasnie
   * i traci nasycenie. Rozjasnienie jest delikatne, bo pod spodem lezy
   * czytelny tekst karty.
   */
  float warm = max(tilt, 0.0);
  float cold = max(-tilt, 0.0);
  col = mix(col, cWarm, warm * 0.28);
  float grey = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(grey), cold * 0.45);
  col *= 1.0 + warm * 0.12 - cold * 0.1;

  /* winieta, zeby krawedzie nie swiecily mocniej niz srodek karty */
  float vig = 1.0 - 0.35 * dot(uv, uv);
  col *= vig;

  /* szczypta ziarna: bez niej gradient pasmuje na ciemnym ekranie telefonu */
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.02;

  gl_FragColor = vec4(col, 1.0);
}
`

const hexToRgb = (hex: string): [number, number, number] => {
  const s = hex.trim().replace('#', '')
  const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s
  const n = parseInt(full.slice(0, 6), 16)
  if (Number.isNaN(n)) return [0.1, 0.2, 0.07]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const readToken = (name: string, fallback: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)
  return hexToRgb(v && v.trim().startsWith('#') ? v : fallback)
}

export type MatchBg = {
  /** -1 do 1: w którą stronę ciągnięta jest karta */
  setTilt: (value: number) => void
  stop: () => void
}

export function startMatchBg(canvas: HTMLCanvasElement): MatchBg | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)
    if (!sh) return null
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh)
      return null
    }
    return sh
  }

  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  if (!prog) return null
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'pos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(prog, 'res')
  const uTime = gl.getUniformLocation(prog, 'time')
  const uTilt = gl.getUniformLocation(prog, 'tilt')
  gl.uniform3fv(gl.getUniformLocation(prog, 'cBase'), readToken('--bg-primary', '#1b3711'))
  gl.uniform3fv(gl.getUniformLocation(prog, 'cWarm'), readToken('--bg-gold', '#ffcd68'))
  gl.uniform3fv(gl.getUniformLocation(prog, 'cCool'), readToken('--bg-mint', '#ecfac0'))
  gl.uniform3fv(gl.getUniformLocation(prog, 'cGlow'), readToken('--bg-lime', '#c3ec47'))

  /*
   * Rozdzielczosc celowo ponizej dpr: to rozmyte plamy, wiec nikt nie zobaczy
   * roznicy, a telefon nie grzeje sie od tla pod kartami.
   */
  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5)
    const w = Math.max(1, Math.round(canvas.clientWidth * scale))
    const h = Math.max(1, Math.round(canvas.clientHeight * scale))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    gl.uniform2f(uRes, canvas.width, canvas.height)
  }

  let tilt = 0
  let shown = 0
  let raf = 0
  let alive = true
  const t0 = performance.now()
  /* respektujemy ustawienie „ogranicz ruch": tlo zastyga, kolory zostaja */
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  const frame = () => {
    if (!alive) return
    resize()
    shown += (tilt - shown) * 0.12
    gl.uniform1f(uTime, still ? 8 : (performance.now() - t0) / 1000)
    gl.uniform1f(uTilt, shown)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    raf = requestAnimationFrame(frame)
  }
  frame()

  return {
    setTilt: (value: number) => {
      tilt = Math.max(-1, Math.min(1, value))
    },
    stop: () => {
      alive = false
      cancelAnimationFrame(raf)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
