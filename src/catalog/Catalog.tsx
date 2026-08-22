import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Award,
  Bird,
  Camera,
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
  Carousel,
  Chip,
  Collapsible,
  IconButton,
  List,
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
  Toast,
} from '../ds'
import { VERSION } from '../changelog'
import { ChangelogSheet } from './ChangelogSheet'
import './catalog.css'

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

const NAV = [
  ['colors', 'Colors'],
  ['typography', 'Typography'],
  ['spacing', 'Spacing'],
  ['shape', 'Shape and elevation'],
  ['icons', 'Icons'],
  ['buttons', 'Buttons'],
  ['chips', 'Chips'],
  ['badges', 'Park badges'],
  ['progress', 'Progress'],
  ['cards', 'Cards'],
  ['lists', 'List items'],
  ['placerow', 'Place row'],
  ['hero', 'Media hero'],
  ['slider', 'Photo slider'],
  ['collapsible', 'Collapsible'],
  ['carousel', 'Carousel'],
  ['sheet', 'Bottom sheet'],
  ['modal', 'Modal'],
  ['navbar', 'Nav bar'],
  ['peek', 'Peek card'],
  ['toast', 'Toast'],
  ['actionbar', 'Action bar'],
  ['segmented', 'Segmented'],
  ['switch', 'Switch'],
  ['stats', 'Stats'],
] as const

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
  return (
    <section id={id} className="cat-section">
      <h2 className="t-headline">{title}</h2>
      <p className="cat-lead t-body-sm">{lead}</p>
      {children}
    </section>
  )
}

export function Catalog() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) ?? 'light',
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [chips, setChips] = useState({ quests: true, water: false, mounds: false })
  const [segDemo, setSegDemo] = useState('auto')
  const [swDemo, setSwDemo] = useState(true)

  const pickTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem(THEME_KEY, t)
    applyTheme(t)
  }

  return (
    <div className="cat">
      <NavBar
        className="cat-mobilenav"
        title="Parkove DS"
        variant="back"
        onAction={() => {
          window.location.href = '/'
        }}
      />
      <aside className="cat-side">
        <div className="cat-brand">
          <span className="cat-brand__dot" />
          <span className="cat-brand__name">Parkove DS</span>
          <button
            className="cat-brand__ver t-caption"
            onClick={() => setChangelogOpen(true)}
            title="What changed in each version"
          >
            v{VERSION}
          </button>
        </div>
        <ChangelogSheet open={changelogOpen} onClose={() => setChangelogOpen(false)} />
        <nav className="cat-nav">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <Segmented
          className="cat-themeseg"
          aria-label="Theme"
          options={[
            { value: 'auto', label: 'auto' },
            { value: 'light', label: 'light' },
            { value: 'dark', label: 'dark' },
          ]}
          value={theme}
          onChange={(t) => pickTheme(t as Theme)}
        />
      </aside>

      <main className="cat-main">
        <header className="cat-hero">
          <h1 className="t-display">Parkove design system</h1>
          <p className="t-body cat-hero__sub">
            Tokens and components for the Kraków park quest app. Color comes from one HCT seed
            (forest green, hue 140). The app composes these parts and never restyles them.
          </p>
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
          id="lists"
          title="List items"
          lead="Rows for the parks list. The leading disc tone tells the state: neutral, visited (accent), completed (gold). Wrap them in List for hairline dividers, inset past the icon."
        >
          <div className="cat-spec cat-list">
            <List>
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
      </main>
    </div>
  )
}
