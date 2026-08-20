import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

/** how many bars a recording is drawn as, whatever its length */
const BARS = 44

/**
 * A voice note as a shape rather than a scrubber. The peaks are read from the
 * recording itself, so the bars are that sentence and not decoration, and they
 * fill in as it plays. Tapping anywhere on the wave jumps there.
 */
export function WavePlayer({
  src,
  blob,
  autoPlay,
  layout = 'row',
}: {
  src: string
  blob?: Blob
  /** a memory you walked up to plays itself; one you tapped waits for you */
  autoPlay?: boolean
  /** 'stack' puts the wave above the button, for when it owns the screen */
  layout?: 'row' | 'stack'
}) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [peaks, setPeaks] = useState<number[] | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!blob) return
    let alive = true
    const read = async () => {
      try {
        const buf = await blob.arrayBuffer()
        const ctx = new AudioContext()
        const decoded = await ctx.decodeAudioData(buf)
        void ctx.close()
        const data = decoded.getChannelData(0)
        const step = Math.floor(data.length / BARS) || 1
        const out: number[] = []
        for (let i = 0; i < BARS; i++) {
          let peak = 0
          for (let j = 0; j < step; j += 8) {
            const v = Math.abs(data[i * step + j] ?? 0)
            if (v > peak) peak = v
          }
          out.push(peak)
        }
        const loudest = Math.max(...out, 0.01)
        if (alive) setPeaks(out.map((v) => Math.max(0.12, v / loudest)))
      } catch {
        // undecodable on this platform: the bars fall back to a flat shape
        if (alive) setPeaks(Array.from({ length: BARS }, (_, i) => 0.3 + 0.35 * Math.abs(Math.sin(i))))
      }
    }
    void read()
    return () => {
      alive = false
    }
  }, [blob])

  const bars = peaks ?? Array.from({ length: BARS }, () => 0.25)

  const play = (isPlaying: boolean, el: typeof audio) => (
    <button
      className="wave__play"
      aria-label={isPlaying ? 'Pauza' : 'Odtwórz'}
      onClick={() => {
        const node = el.current
        if (!node) return
        if (node.paused) void node.play()
        else node.pause()
      }}
    >
      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
    </button>
  )

  const bars2 = (values: number[], done: number, el: typeof audio) => (
    <div
      className="wave__bars"
      role="presentation"
      onClick={(e) => {
        const node = el.current
        if (!node || !node.duration) return
        const box = e.currentTarget.getBoundingClientRect()
        node.currentTime = ((e.clientX - box.left) / box.width) * node.duration
      }}
    >
      {values.map((v, i) => (
        <span
          key={i}
          className={i / BARS <= done ? 'is-done' : undefined}
          style={{ height: `${Math.round(v * 100)}%` }}
        />
      ))}
    </div>
  )

  return (
    <div className={layout === 'stack' ? 'wave -stack' : 'wave'}>
      <audio
        ref={audio}
        src={src}
        autoPlay={autoPlay}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setProgress(0)
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget
          if (el.duration) setProgress(el.currentTime / el.duration)
        }}
      />
      {layout === 'stack' ? (
        <>
          {bars2(bars, progress, audio)}
          {play(playing, audio)}
        </>
      ) : (
        <>
          {play(playing, audio)}
          {bars2(bars, progress, audio)}
        </>
      )}
    </div>
  )
}
