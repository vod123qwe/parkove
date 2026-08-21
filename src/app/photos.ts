// Everything you leave behind on a walk lives here: pictures, voice notes and
// written notes. One IndexedDB store, because they behave the same way (pinned
// somewhere, attached to a walk, editable afterwards) and because base64 in
// localStorage would blow the quota after a handful of photos.
//
// Records saved before voice and text notes existed have no `kind`; they are
// read as photos.

import { useEffect, useState } from 'react'

/* 'car' to nie wspomnienie, a notatka praktyczna: gdzie stoi auto */
export type MarkKind = 'photo' | 'audio' | 'note' | 'car'

export type WalkMark = {
  id: string
  kind: MarkKind
  parkId: string
  /** quest point it belongs to, when made at one */
  poiId?: string
  /** the walk it belongs to: pins are drawn on that route only */
  journeyId?: string
  /** where the phone stood; missing for things added off a walk */
  coords?: [number, number]
  /** photo caption, or the text of a written note */
  caption: string
  at: number
  /** the picture or the recording; written notes have none */
  blob?: Blob
}

/** kept as an alias: most of the app still speaks about photos */
export type WalkPhoto = WalkMark

const DB = 'parkove-photos'
const STORE = 'photos'

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' }).createIndex('at', 'at')
      }
    }
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
  })
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

export async function addMark(input: {
  kind: MarkKind
  parkId: string
  caption: string
  blob?: Blob
  poiId?: string
  journeyId?: string
  coords?: [number, number]
}) {
  const db = await open()
  // two marks made in the same millisecond would share an id, and then one of
  // them could never be edited or deleted again
  const mark: WalkMark = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    ...input,
  }
  await new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(mark)
    tx.oncomplete = () => res(null)
    tx.onerror = () => rej(tx.error)
  })
  notify()
  return mark
}

/** a picture: the common case, so it keeps its own door */
export const addPhoto = (input: {
  parkId: string
  blob: Blob
  caption: string
  poiId?: string
  journeyId?: string
  coords?: [number, number]
}) => addMark({ kind: 'photo', ...input })

/** move a pin, retitle it, or rewrite a note, without touching the recording */
export async function updateMark(
  id: string,
  patch: Partial<Pick<WalkMark, 'coords' | 'caption'>>,
) {
  const db = await open()
  await new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.get(id)
    req.onsuccess = () => {
      const prev = req.result as WalkMark | undefined
      if (prev) store.put({ ...prev, ...patch })
    }
    tx.oncomplete = () => res(null)
    tx.onerror = () => rej(tx.error)
  })
  notify()
}

export const updatePhoto = updateMark

export async function deleteMark(id: string) {
  const db = await open()
  await new Promise((res) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => res(null)
  })
  notify()
}

export const deletePhoto = deleteMark

export async function listMarks(): Promise<WalkMark[]> {
  const db = await open()
  return new Promise((res) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () =>
      res(
        (req.result as WalkMark[])
          .map((m) => ({ ...m, kind: m.kind ?? 'photo' }))
          .sort((a, b) => b.at - a.at),
      )
    req.onerror = () => res([])
  })
}

/** marks plus object URLs for the ones that carry a file, kept in sync with writes */
export function useMarks() {
  const [marks, setMarks] = useState<Array<WalkMark & { url?: string }>>([])

  useEffect(() => {
    let urls: string[] = []
    let alive = true
    const load = async () => {
      const list = await listMarks()
      if (!alive) return
      urls.forEach((u) => URL.revokeObjectURL(u))
      urls = []
      setMarks(
        list.map((m) => {
          if (!m.blob) return m
          const url = URL.createObjectURL(m.blob)
          urls.push(url)
          return { ...m, url }
        }),
      )
    }
    void load()
    listeners.add(load)
    return () => {
      alive = false
      listeners.delete(load)
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  return marks
}

export const usePhotos = useMarks
