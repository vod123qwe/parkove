import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Award,
  Bird,
  Camera,
  ChevronDown,
  Menu,
  Compass,
  Crown,
  Flag,
  Footprints,
  Landmark,
  Layers,
  MapPin,
  Medal,
  Mountain,
  Navigation,
  Route,
  Sparkles,
  ToyBrick,
  Trash2,
  Trees,
  Waves,
} from 'lucide-react'
import {
  ActionBar,
  BottomSheet,
  Button,
  IconButton,
  Carousel,
  Chip,
  Collapsible,
  List,
  ListHead,
  ListItem,
  MediaHero,
  PhotoSlider,
  Modal,
  NavBar,
  ParkBadge,
  PlaceRow,
  ParkCard,
  ProgressRing,
  Segmented,
  Switch,
  Stat,
  StatGrid,
  Polaroid,
  StoryCard,
  Toast,
} from '../ds'
import { CHANGELOG, VERSION } from '../changelog'
import type { ChangeType } from '../changelog'
import './catalog.css'
import './changelog.css'

const TAG: Record<ChangeType, string> = { added: 'NOWE', changed: 'ZMIANA', fixed: 'POPRAWKA' }

type Theme = 'auto' | 'light' | 'dark'
const THEME_KEY = 'pk-theme'

function applyTheme(theme: Theme) {
  const el = document.documentElement
  if (theme === 'auto') el.removeAttribute('data-theme')
  else el.setAttribute('data-theme', theme)
}

export function initTheme() {
  applyTheme((localStorage.getItem(THEME_KEY) as Theme) ?? 'light')
}

/*
 * Nawigacja w GRUPACH i jedna sekcja na ekran (uwaga Jarka 2026-08-25:
 * "przygotuj strukture pod appke, bo teraz dziwnie to wyglada").
 *
 * Wczesniej katalog byl plaska lista 25 pozycji i jedna strona dlugosci
 * kilometra: zeby zobaczyc Switcha, trzeba bylo przewinac cala typografie i
 * wszystkie karty. Teraz dziala jak aplikacja: po lewej dzialy, po prawej
 * jeden ekran, adres pamieta miejsce (#colors, #switch, #whatsnew).
 */
const GROUPS: Array<{ group: string; items: Array<readonly [string, string]> }> = [
  {
    group: 'Fundamenty',
    items: [
      ['colors', 'Kolory'],
      ['typography', 'Typografia'],
      ['spacing', 'Odstępy'],
      ['shape', 'Kształt i cień'],
      ['icons', 'Ikony'],
    ],
  },
  {
    group: 'Elementy',
    items: [
      ['buttons', 'Przyciski'],
      ['chips', 'Chipy'],
      ['badges', 'Odznaki miejsc'],
      ['progress', 'Postęp'],
      ['segmented', 'Przełącznik'],
      ['switch', 'Włącznik'],
      ['stats', 'Liczby'],
    ],
  },
  {
    group: 'Treść',
    items: [
      ['cards', 'Karty'],
      ['storycard', 'Karta historii'],
      ['lists', 'Wiersze listy'],
      ['placerow', 'Wiersz miejsca'],
      ['hero', 'Nagłówek ze zdjęciem'],
      ['slider', 'Slider zdjęć'],
      ['collapsible', 'Rozwijane'],
      ['carousel', 'Karuzela'],
    ],
  },
  {
    group: 'Warstwy i nawigacja',
    items: [
      ['navbar', 'Pasek górny'],
      ['sheet', 'Arkusz dolny'],
      ['modal', 'Modal'],
      ['peek', 'Karta podglądu'],
      ['toast', 'Toast'],
      ['actionbar', 'Pasek akcji'],
    ],
  },
  {
    group: 'Wydania',
    items: [['whatsnew', 'Co nowego']],
  },
]

const ALL_ITEMS = GROUPS.flatMap((g) => g.items)
const LABEL_OF = new Map(ALL_ITEMS)
const GROUP_OF = new Map(GROUPS.flatMap((g) => g.items.map(([id]) => [id, g.group] as const)))

/** aplikacja linkuje catalog.html#changelog, wiec stary adres musi dzialac */
const normalise = (hash: string) => {
  const id = hash.replace(/^#/, '')
  if (id === 'changelog') return 'whatsnew'
  return LABEL_OF.has(id) ? id : 'colors'
}

/* aktywna sekcja jedzie kontekstem, zeby nie przepisywac 25 wywolan Section */
const ActiveSection = createContext('colors')

const COLOR_GROUPS: Array<[string, string[]]> = [
  [
    'Background',
    [
      'bg-page',
      'bg-surface',
      'bg-surface-raised',
      'bg-surface-sunken',
      'bg-primary',
      'bg-primary-subtle',
      'bg-gold',
      'bg-error-subtle',
    ],
  ],
  [
    'Content',
    [
      'content-primary',
      'content-secondary',
      'content-tertiary',
      'content-disabled',
      'content-accent',
      'content-on-primary',
      'content-on-gold',
      'content-error',
    ],
  ],
  ['Border', ['border-subtle', 'border-default', 'border-focus']],
  [
    'Map',
    [
      'map-visited-fill',
      'map-visited-stroke',
      'map-unvisited-fill',
      'map-unvisited-stroke',
      'map-track',
    ],
  ],
]

const TYPE_ROLES: Array<[string, string, string]> = [
  ['t-display', 'Bricolage 800 · 36/42', 'Zdobyty Kraków'],
  ['t-headline', 'Bricolage 700 · 26/32', 'Park Jordana'],
  ['t-title', 'Bricolage 600 · 19/24', 'Staw przy alejce'],
  ['t-body', 'Inter 450 · 16/24', 'Najstarszy publiczny park w Krakowie, otwarty w 1889 roku.'],
  ['t-body-strong', 'Inter 700 · 16/24', 'Zebrano 3 z 5 punktów wyprawy.'],
  ['t-body-sm', 'Inter 450 · 14/20', 'Wejście od ulicy Reymonta, obok stadionu.'],
  ['t-label', 'Inter 700 · 14/20', 'Rozpocznij wyprawę'],
  ['t-caption', 'Inter 550 · 12/16', 'Krowodrza · 2,4 km od Ciebie'],
]

const SPACES: Array<[string, number]> = [
  ['--sp-1', 4],
  ['--sp-2', 8],
  ['--sp-3', 12],
  ['--sp-4', 16],
  ['--sp-5', 20],
  ['--sp-6', 24],
  ['--sp-8', 32],
  ['--sp-10', 40],
  ['--sp-12', 48],
  ['--sp-16', 64],
]

const DEMO_PHOTO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 240'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0.6' y2='1'%3E%3Cstop offset='0' stop-color='%23a7c79a'/%3E%3Cstop offset='1' stop-color='%234c6540'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='360' height='240' fill='url(%23g)'/%3E%3Ccircle cx='285' cy='60' r='28' fill='%23f9faf2' opacity='0.85'/%3E%3Cpath d='M0 190 Q 90 130 180 175 T 360 160 V 240 H 0 Z' fill='%232e4425' opacity='0.75'/%3E%3C/svg%3E"

function Swatch({ token }: { token: string }) {
  const [hex, setHex] = useState('')
  useEffect(() => {
    const read = () =>
      setHex(getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim())
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [token])
  return (
    <div className="cat-swatch">
      <div className="cat-swatch__chip" style={{ background: `var(--${token})` }} />
      <code className="cat-token">--{token}</code>
      <span className="cat-swatch__hex">{hex}</span>
    </div>
  )
}

function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead: string
  children: ReactNode
}) {
  const active = useContext(ActiveSection)
  if (active !== id) return null
  return (
    <section id={id} className="cat-section">
      <h2 className="t-headline">{title}</h2>
      <p className="cat-lead t-body-sm">{lead}</p>
      {children}
    </section>
  )
}

/*
 * Changelog jako STRONA, nie arkusz. Wersje sa produktem tej pracy, wiec maja
 * wlasny dzial, a nie okienko schowane pod numerkiem. Kazde wydanie pokazuje
 * date, tytul, jednozdaniowe streszczenie po polsku (to samo, ktore apka
 * pokazuje po odswiezeniu) i liste zmian z tagiem rodzaju.
 */
function WhatsNew() {
  const [only, setOnly] = useState<'all' | ChangeType>('all')
  /* 150 wydan na jednej stronie to kilometr przewijania: pokazujemy 20 */
  const [limit, setLimit] = useState(20)
  const matching = useMemo(
    () =>
      CHANGELOG.map((r) => ({
        ...r,
        changes: only === 'all' ? r.changes : r.changes.filter(([t]) => t === only),
      })).filter((r) => r.changes.length),
    [only],
  )
  const releases = matching.slice(0, limit)
  const hidden = matching.length - releases.length
  return (
    <div className="clog">
      <Segmented
        className="clog-filter"
        aria-label="Rodzaj zmian"
        options={[
          { value: 'all', label: 'wszystko' },
          { value: 'added', label: 'nowe' },
          { value: 'changed', label: 'zmiany' },
          { value: 'fixed', label: 'poprawki' },
        ]}
        value={only}
        onChange={(v) => setOnly(v as 'all' | ChangeType)}
      />
      <p className="cat-lead t-body-sm">
        {matching.length} wydań w historii, najnowsze u góry. Kursywą stoi ta sama jedna linijka,
        którą aplikacja pokazuje po odświeżeniu wersji.
      </p>
      {releases.map((rel) => (
        <section key={rel.version} className="clog-release">
          <header className="clog-head">
            <div className="clog-head__row">
              <span className="clog-version t-title">v{rel.version}</span>
              <span className="clog-date t-caption">{rel.date}</span>
              {rel.version === VERSION && <span className="clog-now t-caption">teraz</span>}
            </div>
            <p className="clog-title t-body-strong">{rel.title}</p>
            {rel.tldr && <p className="clog-tldr t-body-sm">{rel.tldr}</p>}
          </header>
          <ul className="clog-list">
            {rel.changes.map(([type, text], i) => (
              <li key={i} className="clog-item">
                <code className={`clog-tag -${type}`}>{TAG[type]}</code>
                <span className="clog-text">{text}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {hidden > 0 && (
        <button className="clog-more" onClick={() => setLimit((n) => n + 30)}>
          Pokaż starsze wydania ({hidden})
        </button>
      )}
    </div>
  )
}

export function Catalog() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) ?? 'light',
  )
  /* aktywna sekcja siedzi w adresie, wiec odswiezenie i wstecz dzialaja */
  const [active, setActive] = useState(() => normalise(window.location.hash))
  useEffect(() => {
    const onHash = () => setActive(normalise(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    document.title = `${LABEL_OF.get(active) ?? 'Parkove'} · Parkove DS`
    /* przewija KONTENER: window w tym rezimie nie scrolluje wcale */
    shellRef.current?.scrollTo({ top: 0 })
    setFabHidden(false)
  }, [active])
  const [navQuery, setNavQuery] = useState('')

  /*
   * SPIS jako drawer (uwaga Jarka 2026-08-25: "nawigacja jest bardzo webowa,
   * pomysl o tym jak o storybooku w aplikacji mobilnej (...) menu na
   * sidebarze po swipe"). Rozwazylem tez drill-down jak w Ustawieniach
   * (home -> dzial -> sekcja), ale katalog jest narzedziem referencyjnym:
   * glowna czynnosc to SKAKANIE miedzy sekcjami, a stack kosztuje 3-4
   * tapniecia na kazdy skok. Drawer: 2 tapniecia i cale drzewo naraz,
   * dokladnie jak Storybook na telefonie.
   */
  const [drawerOpen, setDrawerOpen] = useState(false)
  /*
   * FAB chowa sie przy scrollu W DOL i wraca przy scrollu w gore. Nasluch
   * siedzi na kontenerze .cat, bo to ON przewija (body jest przybity przez
   * ds.css); window.scroll nigdy by tu nie strzelil.
   */
  const [fabHidden, setFabHidden] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = shellRef.current
    if (!el) return
    let last = el.scrollTop
    const onScroll = () => {
      const y = el.scrollTop
      const dy = y - last
      if (y < 40) setFabHidden(false)
      else if (dy > 6) setFabHidden(true)
      else if (dy < -6) setFabHidden(false)
      last = y
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])
  /* zagniezdzenie: rozwiniety tylko dzial, w ktorym stoi aktywna sekcja */
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set([GROUP_OF.get(normalise(window.location.hash)) ?? 'Fundamenty']),
  )
  useEffect(() => {
    const g = GROUP_OF.get(active)
    if (g) setOpenGroups((was) => (was.has(g) ? was : new Set([...was, g])))
  }, [active])
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const was = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = was
    }
  }, [drawerOpen])
  /* swipe od lewej krawedzi otwiera, swipe w lewo na panelu zamyka */
  useEffect(() => {
    let at: { x: number; y: number; edge: boolean } | null = null
    const start = (e: TouchEvent) => {
      const t = e.touches[0]
      at = { x: t.clientX, y: t.clientY, edge: t.clientX < 28 }
    }
    const end = (e: TouchEvent) => {
      if (!at) return
      const t = e.changedTouches[0]
      const dx = t.clientX - at.x
      const dy = Math.abs(t.clientY - at.y)
      if (at.edge && dx > 48 && dy < 60) setDrawerOpen(true)
      else if (drawerOpen && dx < -48 && dy < 60) setDrawerOpen(false)
      at = null
    }
    document.addEventListener('touchstart', start, { passive: true })
    document.addEventListener('touchend', end, { passive: true })
    return () => {
      document.removeEventListener('touchstart', start)
      document.removeEventListener('touchend', end)
    }
  }, [drawerOpen])

  const [sheetOpen, setSheetOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [chips, setChips] = useState({ quests: true, water: false, mounds: false })
  const [segDemo, setSegDemo] = useState('auto')
  const [swDemo, setSwDemo] = useState(true)

  const pickTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem(THEME_KEY, t)
    applyTheme(t)
  }

  return (
    <div className="cat" ref={shellRef}>
      {/*
        Gorny pasek jak w aplikacji: wstecz wychodzi do Parkove (katalog
        otwiera sie z jej menu), tytul mowi, na ktorej sekcji stoisz, a
        hamburger po prawej otwiera spis. Ten sam NavBar z DS, zero forka.
      */}
      <NavBar
        className="cat-topbar"
        title={LABEL_OF.get(active)}
        variant="back"
        scrolled
        onAction={() => {
          /*
           * BASE_URL, nie '/': na GitHub Pages aplikacja mieszka pod
           * /parkove/, wiec goly '/' prowadzil na korzen domeny i 404
           * (uwaga Jarka: "jak klikam back, to widze 404 github").
           */
          window.location.href = import.meta.env.BASE_URL
        }}
      />

      <button
        className={`cat-fab pk-press${fabHidden ? ' -hidden' : ''}`}
        aria-label="Otwórz spis katalogu"
        onClick={() => setDrawerOpen(true)}
      >
        <Menu size={17} />
        Spis
      </button>

      <div className={`catdrawer${drawerOpen ? ' -open' : ''}`} aria-hidden={!drawerOpen}>
        <button
          className="catdrawer__scrim"
          aria-label="Zamknij spis"
          tabIndex={drawerOpen ? 0 : -1}
          onClick={() => setDrawerOpen(false)}
        />
        <div className="catdrawer__panel" role="dialog" aria-modal="true" aria-label="Spis katalogu">
          <div className="catdrawer__brand">
            <span className="cat-brand__dot" />
            <span className="catdrawer__name">Parkove DS</span>
            <a
              className="catdrawer__ver t-caption"
              href="#whatsnew"
              onClick={() => setDrawerOpen(false)}
            >
              v{VERSION}
            </a>
          </div>
          <input
            className="cat-navsearch"
            type="search"
            value={navQuery}
            placeholder="Szukaj w katalogu"
            aria-label="Szukaj w katalogu"
            onChange={(e) => setNavQuery(e.target.value)}
          />
          <nav className="catdrawer__tree">
            {navQuery.trim() ? (
              /* szukanie splaszcza drzewo: wynik to lista trafien */
              <div className="catdrawer__hits">
                {ALL_ITEMS.filter(([, label]) =>
                  label.toLowerCase().includes(navQuery.trim().toLowerCase()),
                ).map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`catdrawer__leaf${active === id ? ' -on' : ''}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {label}
                    <span className="catdrawer__crumb t-caption">{GROUP_OF.get(id)}</span>
                  </a>
                ))}
              </div>
            ) : (
              GROUPS.map((g) => {
                const open = openGroups.has(g.group)
                return (
                  <div key={g.group} className="catdrawer__group">
                    <button
                      className="catdrawer__grouphead"
                      aria-expanded={open}
                      onClick={() =>
                        setOpenGroups((was) => {
                          const next = new Set(was)
                          if (next.has(g.group)) next.delete(g.group)
                          else next.add(g.group)
                          return next
                        })
                      }
                    >
                      <ChevronDown size={15} className={`catdrawer__chev${open ? ' -open' : ''}`} />
                      <span>{g.group}</span>
                      <span className="catdrawer__count t-caption">{g.items.length}</span>
                    </button>
                    {open && (
                      <div className="catdrawer__leaves">
                        {g.items.map(([id, label]) => (
                          <a
                            key={id}
                            href={`#${id}`}
                            className={`catdrawer__leaf${active === id ? ' -on' : ''}`}
                            onClick={() => setDrawerOpen(false)}
                          >
                            {label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </nav>
          {/*
            Motyw pod dropdownem, nie wielkim przelacznikiem na wierzchu
            (uwaga Jarka: "wybieralka do kolorow niech bedzie pod jakims
            dropdownem"). Natywny select = systemowa wybieralka na telefonie.
          */}
          <label className="cat-theme">
            <span className="t-caption">Motyw</span>
            <span className="cat-theme__pill">
              <span className="cat-theme__label">
                {theme === 'auto' ? 'Systemowy' : theme === 'light' ? 'Jasny' : 'Ciemny'}
              </span>
              <ChevronDown size={13} aria-hidden="true" />
              <select value={theme} onChange={(e) => pickTheme(e.target.value as Theme)}>
                <option value="auto">Systemowy</option>
                <option value="light">Jasny</option>
                <option value="dark">Ciemny</option>
              </select>
            </span>
          </label>
        </div>
      </div>

      <main className="cat-main">
        <ActiveSection.Provider value={active}>
        <header className="cat-hero">
          <p className="cat-hero__crumb t-caption">
            Parkove DS <span aria-hidden="true">·</span> {GROUP_OF.get(active)}
          </p>
          <h1 className="t-display">{LABEL_OF.get(active)}</h1>
        </header>

        <Section
          id="colors"
          title="Colors"
          lead="Semantic roles only: background, content, border, map. Generated from the seed, gold is reserved for badges and 100%."
        >
          {COLOR_GROUPS.map(([group, tokens]) => (
            <div key={group} className="cat-colorgroup">
              <h3 className="t-label cat-grouplabel">{group}</h3>
              <div className="cat-swatches">
                {tokens.map((t) => (
                  <Swatch key={t} token={t} />
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section
          id="typography"
          title="Typography"
          lead="Bricolage Grotesque for display, Inter for text. Roles are named by task; emphasis is a variant, not a new role."
        >
          <div className="cat-typelist">
            {TYPE_ROLES.map(([cls, spec, sample]) => (
              <div key={cls} className="cat-typerow">
                <div className="cat-typemeta">
                  <code className="cat-token">.{cls}</code>
                  <span className="cat-swatch__hex">{spec}</span>
                </div>
                <span className={cls}>{sample}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="spacing"
          title="Spacing"
          lead="A 4px rhythm. The token number is the multiple of 4, so --sp-6 is 24px."
        >
          <div className="cat-spaces">
            {SPACES.map(([name, px]) => (
              <div key={name} className="cat-spacerow">
                <code className="cat-token">{name}</code>
                <div className="cat-spacebar" style={{ width: px }} />
                <span className="cat-swatch__hex">{px}px</span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="shape"
          title="Shape and elevation"
          lead="Radius sm to xl plus pill. Elevation is drop shadow only; dark mode gets depth from a lighter neutral surface."
        >
          <div className="cat-spec">
            {(['sm', 'md', 'lg', 'xl'] as const).map((r) => (
              <div key={r} className="cat-shape" style={{ borderRadius: `var(--radius-${r})` }}>
                <code className="cat-token">--radius-{r}</code>
              </div>
            ))}
          </div>
          <div className="cat-spec">
            {([1, 2, 3] as const).map((e) => (
              <div key={e} className="cat-elev" style={{ boxShadow: `var(--elevation-${e})` }}>
                <code className="cat-token">--elevation-{e}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="icons"
          title="Icons"
          lead="Lucide, outline, 1.75 stroke. Park glyphs double as badge art."
        >
          <div className="cat-spec cat-icons">
            {[
              ['trees', Trees],
              ['mountain', Mountain],
              ['waves', Waves],
              ['landmark', Landmark],
              ['map-pin', MapPin],
              ['route', Route],
              ['compass', Compass],
              ['navigation', Navigation],
              ['footprints', Footprints],
              ['flag', Flag],
              ['bird', Bird],
              ['camera', Camera],
              ['award', Award],
              ['medal', Medal],
              ['crown', Crown],
              ['layers', Layers],
            ].map(([name, Icon]) => {
              const I = Icon as typeof Trees
              return (
                <div key={name as string} className="cat-icon">
                  <I strokeWidth={1.75} />
                  <span className="cat-swatch__hex">{name as string}</span>
                </div>
              )
            })}
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          lead="Primary, tonal, ghost. Heights 44 and 52, pill shape, one state layer for hover and press."
        >
          <div className="cat-spec">
            <Button>Start wyprawy</Button>
            <Button variant="tonal">Pokaż na mapie</Button>
            <Button variant="ghost">Później</Button>
            <Button disabled>Niedostępne</Button>
          </div>
          <div className="cat-spec">
            <Button size="lg" icon={<Navigation size={18} />}>
              Nawiguj do parku
            </Button>
            <Button size="lg" variant="tonal" icon={<Camera size={18} />}>
              Dodaj zdjęcie
            </Button>
            <IconButton aria-label="Zapisz" variant="tonal">
              <Flag size={20} />
            </IconButton>
          </div>
        </Section>

        <Section
          id="chips"
          title="Chips"
          lead="Filters and toggles. Selected fills with primary-subtle and drops the border."
        >
          <div className="cat-spec">
            <Chip
              selected={chips.quests}
              icon={<Route />}
              onClick={() => setChips((c) => ({ ...c, quests: !c.quests }))}
            >
              Z questami
            </Chip>
            <Chip
              selected={chips.water}
              icon={<Waves />}
              onClick={() => setChips((c) => ({ ...c, water: !c.water }))}
            >
              Nad wodą
            </Chip>
            <Chip
              selected={chips.mounds}
              icon={<Mountain />}
              onClick={() => setChips((c) => ({ ...c, mounds: !c.mounds }))}
            >
              Kopce
            </Chip>
          </div>
        </Section>

        <Section
          id="badges"
          title="Park badges"
          lead="Locked is dashed and quiet, visited turns green, completed goes gold. Gold appears nowhere else."
        >
          <div className="cat-spec">
            <ParkBadge state="locked" icon={<Trees />} label="Park Bednarskiego" />
            <ParkBadge state="visited" icon={<Waves />} label="Zakrzówek" />
            <ParkBadge state="completed" icon={<Mountain />} label="Kopiec Kościuszki" />
            <ParkBadge state="completed" size="lg" icon={<Landmark />} label="Park Jordana" />
          </div>
        </Section>

        <Section
          id="progress"
          title="Progress"
          lead="One ring for park completion and city coverage. At 100% the stroke turns gold."
        >
          <div className="cat-spec">
            <ProgressRing value={20} size="sm" />
            <ProgressRing value={40} />
            <ProgressRing value={64} size="lg" />
            <ProgressRing value={100} size="lg" label="100%" />
          </div>
        </Section>

        <Section
          id="cards"
          title="Cards"
          lead="The park card: cover, name, meta, ring. Before the first visit the cover is a placeholder; photos arrive with data."
        >
          <div className="cat-spec cat-cards">
            <ParkCard
              name="Park Jordana"
              meta="Krowodrza · quest 3/5"
              photo={DEMO_PHOTO}
              progress={60}
              visited
            />
            <ParkCard name="Park Bednarskiego" meta="Podgórze · 1 punkt" progress={0} />
          </div>
        </Section>

        <Section
          id="storycard"
          title="Story card"
          lead="One chronological chapter in a memory feed. Text runs the full width, photographs sit under it as small polaroids in the gallery slot, and the single action stretches across the card. No chevron: the whole card is the tap target."
        >
          <div className="cat-spec cat-storydemo">
            <StoryCard
              eyebrow="18 sierpnia 2026"
              title="Wieczór na Skałkach"
              meta="Skałki Twardowskiego · 2,8 km · 48 min"
              gallery={
                <>
                  <Polaroid src={`${import.meta.env.BASE_URL}demo/skalki-sunset.jpg`} tilt={-2.4} />
                  <Polaroid src={`${import.meta.env.BASE_URL}demo/skalki-rocks.jpg`} tilt={1.8} />
                  <Polaroid src={`${import.meta.env.BASE_URL}demo/skalki-path.jpg`} tilt={-1.1} />
                </>
              }
              onClick={() => {}}
              action={<Button variant="tonal">Przeglądaj 4 wspomnienia</Button>}
            >
              <span className="cat-storydemo__quote">„Zostaliśmy chwilę dłużej przy punkcie widokowym.”</span>
              <span className="cat-storydemo__meta">3 zdjęcia · 1 notatka</span>
            </StoryCard>
          </div>
        </Section>

        <Section
          id="lists"
          title="List items"
          lead="Rows for lists and navigation. The leading tone carries meaning, leadShape switches between the default disc and a soft square, and leadSurface can swap the tinted plate for a paper one that keeps the tone in the icon only. Wrap rows in List for consistent spacing and optional dividers."
        >
          <div className="cat-spec cat-list">
            <ListHead>Sekcja z nagłówkiem</ListHead>
            <List inset={false}>
              <ListItem
                icon={<Trees />}
                title="Park Bednarskiego"
                meta="Park · 7,2 ha"
                trailing={<ProgressRing value={0} size="sm" />}
                onClick={() => {}}
              />
              <ListItem
                icon={<Waves />}
                leadTone="accent"
                title="Zalew Bagry"
                meta="Woda · 48,2 ha"
                trailing={<ProgressRing value={40} size="sm" />}
                onClick={() => {}}
              />
              <ListItem
                icon={<Mountain />}
                leadTone="gold"
                title="Kopiec Kościuszki"
                meta="Kopiec · 1,8 ha"
                trailing={<ProgressRing value={100} size="sm" />}
                onClick={() => {}}
              />
              <ListItem
                icon={<Footprints />}
                leadTone="sky"
                leadShape="squircle"
                title="Ton sky"
                meta="Miękki kwadrat do głównej nawigacji"
                onClick={() => {}}
              />
              <ListItem
                icon={<Landmark />}
                leadTone="clay"
                title="Ton clay"
                meta="Ciepły ceglasty, np. miejsca"
                onClick={() => {}}
              />
              <ListItem
                icon={<Sparkles />}
                leadTone="plum"
                title="Ton plum"
                meta="Fiolet zabawy, np. wygląd"
                onClick={() => {}}
              />
              <ListItem
                icon={<Landmark />}
                leadTone="clay"
                leadShape="squircle"
                leadSurface="paper"
                title="Podkładka paper"
                meta="Białe tło, ton zostaje w ikonie"
                onClick={() => {}}
              />
            </List>
          </div>
          <div className="cat-spec cat-list">
            <List>
              <ListItem
                className="-stacked"
                icon={<Trees />}
                leadTone="accent"
                title="Plac zabaw"
                meta="Kilka placów zabaw i wodny plac zabaw dla młodszych dzieci."
              />
              <ListItem
                className="-stacked"
                icon={<MapPin />}
                title="Bez gastronomii"
                meta="Najbliższe kawiarnie w Podgórzu, przy Rynku Podgórskim."
              />
            </List>
          </div>
        </Section>

        <Section
          id="placerow"
          title="Place row"
          lead="A row for a place you can choose: a parking, a cafe, a playground. Everything sits in one cell, because a description under the list stops telling you which row it belongs to. The number matches a pin on the sketch above the list; the action on the right has a different intention than the row itself."
        >
          <div className="cat-spec cat-placerowdemo">
            <PlaceRow
              index={1}
              title="Brandysówka, środek doliny"
              pills={['Płatny', 'gruntowy']}
              note="Najbliżej tego, po co się tu jedzie: 148 m do Sokolicy, 292 m do wodospadu Szum."
              action={
                <IconButton aria-label="Prowadź" variant="tonal">
                  <MapPin size={18} />
                </IconButton>
              }
              onClick={() => {}}
            />
            <PlaceRow
              index={2}
              selected
              title="Przy Jaskini Nietoperzowej"
              pills={['Bezpłatny', 'żwirowy']}
              note="Osobny wypad, górny koniec doliny: 124 m od wejścia do jaskini."
              onClick={() => {}}
            />
          </div>
        </Section>

        <Section
          id="hero"
          title="Media hero"
          lead="Full-bleed header image with the title written on it. Several photos become a swipeable strip with dots. Credits stay out of the image by default."
        >
          <div className="cat-spec cat-herodemo">
            <MediaHero
              images={[
                { src: '/photos/krakus-szczyt.jpg', credit: 'Fot. Jakub Hałun · CC BY-SA 4.0' },
                { src: '/photos/krakus-rekawka.jpg', credit: 'Fot. Jakub Hałun · CC BY-SA 4.0' },
              ]}
              title="Kopiec Krakusa"
              meta="Kopiec · 1,8 ha · quest: 4 punktów"
            />
            <MediaHero images={[]} title="Park bez zdjęcia" meta="Park · 7,2 ha" fallback={<Trees />} />
          </div>
        </Section>

        <Section
          id="slider"
          title="Photo slider"
          lead="Inset gallery that sits under a title. One photo fills the container width, rounded, and the strip snaps to the next. Credit and dots live below the frame, because nobody reads white text on grass."
        >
          <div className="cat-spec cat-sliderdemo">
            <PhotoSlider
              images={[
                { src: '/photos/krakus-szczyt.jpg', credit: 'Fot. Jakub Hałun · CC BY-SA 4.0' },
                { src: '/photos/krakus-rekawka.jpg', credit: 'Fot. Jakub Hałun · CC BY-SA 4.0' },
              ]}
              aria-label="Zdjęcia: Kopiec Krakusa"
            />
            <PhotoSlider images={[]} ratio="16:9" fallback={<Trees />} />
          </div>
        </Section>

        <Section
          id="collapsible"
          title="Collapsible"
          lead="Long copy folded to a few lines with a text button to unfold it. The height animates open and the last folded line fades out."
        >
          <div className="cat-spec cat-collapsedemo">
            <Collapsible lines={3}>
              <p className="t-body" style={{ margin: 0 }}>
                Najstarsza budowla Krakowa i najlepszy darmowy punkt widokowy w mieście. Kopiec ma
                16 metrów wysokości i stoi na wzgórzu Lasoty, więc panorama obejmuje Wawel, Stare
                Miasto, a przy dobrej widoczności Tatry.
              </p>
              <p className="t-body" style={{ margin: 0 }}>
                Wyprawa jest krótka: podejście ścieżką zajmuje kwadrans, cały quest z czterema
                punktami około godziny.
              </p>
            </Collapsible>
          </div>
        </Section>

        <Section
          id="carousel"
          title="Carousel"
          lead="Horizontal snap scroll for cards, used by quest points in the park sheet. Children set their own width."
        >
          <div className="cat-spec">
            <Carousel className="cat-carousel" aria-label="Demo carousel">
              {['Szczyt kopca', 'Linia dwóch kopców', 'Stok Rękawki', 'Droga z macew', 'Bonus'].map(
                (n, i) => (
                  <div key={n} className="cat-carouselcard">
                    <div className="cat-carouselcard__media">
                      <Trees strokeWidth={1.75} />
                    </div>
                    <span className="t-label">{n}</span>
                    <span className="cat-swatch__hex">point {i + 1}</span>
                  </div>
                ),
              )}
            </Carousel>
          </div>
        </Section>

        <Section
          id="sheet"
          title="Bottom sheet"
          lead="iOS-style: opens at content height, drag up for full, inner scroll only when full. Drag down, Escape or the scrim animate it away."
        >
          <div className="cat-spec">
            <Button variant="tonal" onClick={() => setSheetOpen(true)}>
              Open example sheet
            </Button>
          </div>
          <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Stary dąb">
            <p className="t-body" style={{ marginTop: 0 }}>
              Najstarsze drzewo w parku, sadzone podobno w roku otwarcia. Znajdź tabliczkę u
              podstawy pnia.
            </p>
            <div className="cat-sheetrow">
              <ProgressRing value={60} label="3/5" />
              <div>
                <p className="t-body-strong" style={{ margin: 0 }}>
                  Punkt 3 z 5 zebrany
                </p>
                <p className="t-body-sm cat-muted" style={{ margin: 0 }}>
                  Następny: Staw przy alejce, 240 m na północ
                </p>
              </div>
            </div>
            <Button full size="lg" icon={<Navigation size={18} />}>
              Prowadź do następnego
            </Button>
          </BottomSheet>
        </Section>

        <Section
          id="modal"
          title="Modal"
          lead="Full-screen stage for content that needs the whole view: point cards with photos and long reads. It arrives the way phones do it: cover rises from the bottom for something shown over your work, push slides in from the right for going a level deeper, and the screen below then shifts aside and dims."
        >
          <div className="cat-spec">
            <Button variant="tonal" onClick={() => setModalOpen(true)}>
              Open example modal
            </Button>
          </div>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Szczyt kopca">
            <p className="t-body" style={{ marginTop: 0 }}>
              Kopiec Krakusa to najstarsza budowla Krakowa: 16 metrów usypanej ziemi, starszej niż
              państwo polskie. Modal gives long stories room to breathe, with a sticky header and
              its own scroll.
            </p>
            <p className="t-body">
              Ze szczytu rozciąga się najlepsza darmowa panorama miasta: Wawel, Stare Miasto, a przy
              dobrej pogodzie Tatry.
            </p>
          </Modal>
        </Section>

        <Section
          id="navbar"
          title="Nav bar"
          lead="Top bar for full-screen views: X or back, always on the left; the title stays centered. Used by Modal and the mobile catalog."
        >
          <div className="cat-spec cat-navdemo">
            <NavBar title="Szczyt kopca" variant="close" onAction={() => {}} />
            <NavBar title="Parking" variant="back" onAction={() => {}} />
          </div>
        </Section>

        <Section
          id="peek"
          title="Peek card"
          lead="Non-modal floating card above a live map: drag up expands into the full sheet, drag down dismisses. Shown here inline."
        >
          <div className="cat-spec">
            <div className="pk-peek cat-peekdemo">
              <div className="pk-peek__handle" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ProgressRing value={50} size="sm" />
                <div>
                  <p className="t-title" style={{ margin: 0 }}>
                    Kopiec Krakusa
                  </p>
                  <p className="t-caption cat-muted" style={{ margin: 0 }}>
                    Kopiec · 1,8 ha · quest 2/4 · przeciągnij w górę
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="toast"
          title="Toast"
          lead="A notice that arrives during something else: a point within reach, a photo saved. Never modal, so the map underneath stays live. Two tones: info for a heads-up, reward for something earned."
        >
          <div className="cat-spec cat-toastdemo">
            <Toast
              open
              onClose={() => {}}
              icon={<Footprints size={18} />}
              title="Blisko: Paczkomat"
              text="50 m stąd, rozejrzyj się"
              className="cat-toast-inline"
            />
            <Toast
              open
              onClose={() => {}}
              tone="reward"
              icon={<Sparkles size={18} />}
              title="Dąb Jagielloński"
              text="Punkt zaliczony, czeka historia"
              actionLabel="Czytaj"
              onAction={() => {}}
              className="cat-toast-inline"
            />
          </div>
        </Section>

        <Section
          id="actionbar"
          title="Action bar"
          lead="The row of actions at the bottom of a sheet, stuck there while the content scrolls past. The first child stretches, so the shape is one wide decision plus the small dangerous things beside it. Shown here inline, without the sheet around it."
        >
          <div className="cat-spec cat-actionbardemo">
            <ActionBar className="cat-actionbar-inline">
              <Button size="lg">Zamknij</Button>
              <IconButton aria-label="Usuń" variant="tonal">
                <Trash2 size={18} />
              </IconButton>
            </ActionBar>
          </div>
        </Section>

        <Section
          id="segmented"
          title="Segmented"
          lead="A small radio group for exclusive choices: theme switch, expedition modes. The active segment is raised."
        >
          <div className="cat-spec">
            <Segmented
              aria-label="Demo segmented"
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'light', label: 'Jasny' },
                { value: 'dark', label: 'Ciemny' },
              ]}
              value={segDemo}
              onChange={setSegDemo}
              className="cat-segdemo"
            />
          </div>
        </Section>

        <Section
          id="switch"
          title="Switch"
          lead="One thing on or off, effect immediate. Segmented picks one of several; a switch answers yes or no. The whole row is the target, because on a phone a 42 pixel slider alone is a miss. Filters on the map are switches."
        >
          <div className="cat-spec cat-switches">
            <Switch
              icon={<Footprints />}
              label="Szlaki"
              hint="Wybrany szlak rysuje się na mapie"
              checked={swDemo}
              onChange={setSwDemo}
            />
            <Switch icon={<ToyBrick />} label="Place zabaw" checked={!swDemo} onChange={(v) => setSwDemo(!v)} />
            <Switch label="Bez ikony" checked={false} onChange={() => {}} />
            <Switch label="Wyłączony przełącznik" checked disabled onChange={() => {}} />
          </div>
        </Section>

        <Section
          id="stats"
          title="Stats"
          lead="Tabular numerals in the display face. Plain for a profile header; with an icon each stat becomes a card, and StatGrid lays them out two by two, which is how a walk summary reads best."
        >
          <div className="cat-spec cat-stats">
            <Stat value="23%" label="Krakowa odkryte" />
            <Stat value="12" label="parków odwiedzonych" />
            <Stat value="47,2 km" label="w parkach" />
            <Stat value="6" label="złotych odznak" />
          </div>
          <div className="cat-spec">
            <StatGrid>
              <Stat icon={<Compass />} value="48 min" label="czas" />
              <Stat icon={<Footprints />} value="3,4 km" label="dystans" />
              <Stat icon={<MapPin />} value="4/6" label="punkty" />
              <Stat icon={<Camera />} value="7" label="zdjęcia" />
            </StatGrid>
          </div>
        </Section>
        <Section
          id="whatsnew"
          title="Co nowego"
          lead="Historia wydań, od najnowszego. Ta sama treść, którą aplikacja pokazuje po odświeżeniu wersji."
        >
          <WhatsNew />
        </Section>
        </ActiveSection.Provider>
      </main>
    </div>
  )
}
