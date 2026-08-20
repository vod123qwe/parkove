// Walk photos live in IndexedDB: base64 in localStorage would blow the quota
// after a handful of pictures. Blobs stay as captured; the UI makes object URLs.

import { useEffect, useState } from 'react'

export type WalkPhoto = {
  id: string
  parkId: string
  /** quest point it belongs to, when taken at one */
  poiId?: string
  /** the walk it was taken on: photo pins are drawn on that route only */
  journeyId?: string
  /** where the phone stood; missing for pictures added off a walk */
  coords?: [number, number]
  caption: string
  at: number
  blob: Blob
}

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

export async function addPhoto(input: {
  parkId: string
  blob: Blob
  caption: string
  poiId?: string
  journeyId?: string
  coords?: [number, number]
}) {
  const db = await open()
  const photo: WalkPhoto = { id: `p-${Date.now()}`, at: Date.now(), ...input }
  await new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(photo)
    tx.oncomplete = () => res(null)
    tx.onerror = () => rej(tx.error)
  })
  notify()
  return photo
}

/** move a photo pin, or retitle it, without touching the picture itself */
export async function updatePhoto(id: string, patch: Partial<Pick<WalkPhoto, 'coords' | 'caption'>>) {
  const db = await open()
  await new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.get(id)
    req.onsuccess = () => {
      const prev = req.result as WalkPhoto | undefined
      if (prev) store.put({ ...prev, ...patch })
    }
    tx.oncomplete = () => res(null)
    tx.onerror = () => rej(tx.error)
  })
  notify()
}

export async function deletePhoto(id: string) {
  const db = await open()
  await new Promise((res) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => res(null)
  })
  notify()
}

export async function listPhotos(): Promise<WalkPhoto[]> {
  const db = await open()
  return new Promise((res) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => res((req.result as WalkPhoto[]).sort((a, b) => b.at - a.at))
    req.onerror = () => res([])
  })
}

/** photos plus their object URLs, kept in sync with writes */
export function usePhotos() {
  const [photos, setPhotos] = useState<Array<WalkPhoto & { url: string }>>([])

  useEffect(() => {
    let urls: string[] = []
    let alive = true
    const load = async () => {
      const list = await listPhotos()
      if (!alive) return
      urls.forEach((u) => URL.revokeObjectURL(u))
      urls = list.map((p) => URL.createObjectURL(p.blob))
      setPhotos(list.map((p, i) => ({ ...p, url: urls[i] })))
    }
    void load()
    listeners.add(load)
    return () => {
      alive = false
      listeners.delete(load)
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  return photos
}
