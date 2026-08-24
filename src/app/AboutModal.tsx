import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Component, FileClock, HardDrive, RefreshCw, Ruler, SlidersHorizontal, Smartphone } from 'lucide-react'
import { List, ListItem, Modal } from '../ds'
import { VERSION } from '../changelog'
import { setRateMode } from './data/difficulty'
import { refreshVersion } from './refresh'
import { screenReport, toggleGroundDebug, toggleSimPhone } from './screen'
import { dropAllPacks, fmtMB, storageReport } from './offline'

/**
 * O aplikacji: rzeczy o samej apce, nie o Tobie i nie o wyprawach.
 *
 * Wcześniej mieszkały w profilu, między pieczątkami i zdjęciami: odświeżenie
 * wersji, katalog komponentów, numer wersji i diagnostyka dolnej krawędzi.
 * Profil jest o tym, co zrobiłeś, więc numer wersji nie ma tam czego szukać.
 *
 * Diagnostyka jest tu jawnym wierszem, a nie sekretem pod trzema dotknięciami:
 * ta aplikacja ma jednego użytkownika i to on ją debuguje.
 */
export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [refreshing, setRefreshing] = useState(false)
  /*
   * Ile miejsca zajmują pobrane mapy i czy przeglądarka obiecuje je trzymać.
   *
   * Jest tutaj, bo Jarek zapytał wprost: „co z tymi pobranymi mapami się później
   * dzieje, są cały czas gdzieś na moim telefonie, czy z czasem znikają?".
   * Odpowiedź jest jedna i uczciwa tylko wtedy, gdy pokazuje ją sama apka, a nie
   * ja w czacie: `persisted` mówi, czy dane są chronione, czy usuwalne przy
   * braku miejsca.
   */
  const [store, setStore] = useState<Awaited<ReturnType<typeof storageReport>> | null>(null)
  const [wiped, setWiped] = useState(false)
  useEffect(() => {
    if (!open) return
    void storageReport().then(setStore)
  }, [open, wiped])
  const [diag, setDiag] = useState<string | null>(null)
  const [sim, setSim] = useState(() => document.documentElement.dataset.pkSim === 'phone')
  const taps = useRef(0)
  const [rate, setRate] = useState(() => {
    try {
      return localStorage.getItem('pk-rate') === 'on'
    } catch {
      return false
    }
  })

  return (
    <Modal open={open} onClose={onClose} title="O aplikacji" action="back" presentation="push">
      <p className="t-body-sm settings-lead">
        Parkove v{VERSION}. Aplikacja działa offline: pliki i kafle mapy siedzą w pamięci telefonu,
        więc po wdrożeniu nowej wersji trzeba ją raz pobrać ręcznie.
      </p>
      <List className="prof-list">
        <ListItem
          icon={<RefreshCw className={refreshing ? 'is-spinning' : undefined} />}
          title={refreshing ? 'Odświeżam…' : 'Odśwież wersję'}
          meta="Pobiera najnowsze pliki i mówi, czy coś się zmieniło"
          onClick={() => {
            if (refreshing) return
            setRefreshing(true)
            void refreshVersion()
          }}
        />
        <ListItem
          icon={<FileClock />}
          title="Co nowego"
          meta="Historia zmian, od najnowszej"
          trailing={<ChevronRight size={18} className="park-parking__chevron" />}
          onClick={() => {
            window.location.href = 'catalog.html#changelog'
          }}
        />
        <ListItem
          icon={<Component />}
          title="Design system"
          meta="Katalog komponentów i tokenów"
          trailing={<ChevronRight size={18} className="park-parking__chevron" />}
          onClick={() => {
            window.location.href = 'catalog.html'
          }}
        />
        <ListItem
          icon={<HardDrive />}
          title={
            store && store.places > 0
              ? `Mapy offline: ${store.places} ${store.places === 1 ? 'miejsce' : store.places < 5 ? 'miejsca' : 'miejsc'}`
              : 'Mapy offline'
          }
          meta={
            store === null
              ? 'Liczę…'
              : store.places === 0
                ? 'Nic jeszcze nie pobrane. Pobiera się w karcie miejsca.'
                : `${fmtMB(store.bytes)} w ${store.tiles} kaflach. ${
                    store.persisted
                      ? 'Przeglądarka obiecała je trzymać.'
                      : 'Telefon może je usunąć, gdy zabraknie mu miejsca.'
                  }`
          }
          onClick={
            store && store.places > 0
              ? () => {
                  void dropAllPacks().then(() => setWiped((v) => !v))
                }
              : undefined
          }
          trailing={
            store && store.places > 0 ? (
              <span className="t-caption profile-diag">Usuń wszystkie</span>
            ) : undefined
          }
        />
        <ListItem
          icon={<Smartphone />}
          title={sim ? 'Symulacja telefonu: włączona' : 'Symuluj telefon'}
          meta="Do sprawdzania na komputerze. Na telefonie doda wcięcia do tych, które już masz, więc treść się przesunie"
          onClick={() => setSim(toggleSimPhone())}
        />
        <ListItem
          icon={<SlidersHorizontal />}
          title={rate ? 'Tryb ocen D i O: włączony' : 'Tryb ocen D i O'}
          meta="Na karcie miejsca klikasz kropki dojścia i odkrywania. Oceny zbierają się w telefonie; na końcu Kopiuj oceny i wyślij mi"
          onClick={() => {
            const next = !rate
            setRate(next)
            setRateMode(next)
          }}
        />
        <ListItem
          icon={<Ruler />}
          title="Diagnostyka ekranu"
          meta="Maluje tło dokumentu na magentę i wypisuje wymiary"
          onClick={() => {
            taps.current += 1
            setDiag(toggleGroundDebug() ? screenReport() : null)
          }}
        />
      </List>
      {diag && <p className="t-caption profile-diag">{diag}</p>}
    </Modal>
  )
}
