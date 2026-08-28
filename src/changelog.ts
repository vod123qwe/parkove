// Parkove version history. Newest first.
// Every update session: add an entry here and bump VERSION (+ package.json).

export const VERSION = '0.116.1'

export type ChangeType = 'added' | 'changed' | 'fixed'

export type Release = {
  version: string
  date: string
  title: string
  /**
   * Jedna polska linijka, po ludzku, do pokazania po odswiezeniu wersji na
   * telefonie (Jarek: „wraz przy odswiezaniu pisz, co sie zmienilo, w mega
   * skroconej formie"). Reszta wpisu jest po angielsku i szczegolowa, bo sluzy
   * do czytania w katalogu, a nie w pasku na jedna sekunde.
   */
  tldr?: string
  changes: Array<[ChangeType, string]>
}

/** wersje jako liczby, zeby 0.9 nie wyszlo nowsze od 0.10 */
const num = (v: string) => v.split('.').map(Number)
const newer = (a: string, b: string) => {
  const x = num(a)
  const y = num(b)
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0)
    if (d !== 0) return d > 0
  }
  return false
}

/**
 * Co przyszlo od wersji `from`, w skrocie. Bez tego pasek po odswiezeniu mowil
 * tylko „bylo 0.84.1, jest 0.85.0", a numer wersji nie jest informacja.
 */
export function changesSince(from: string) {
  return CHANGELOG.filter((r) => newer(r.version, from)).map((r) => r.tldr ?? r.title)
}

export const CHANGELOG: Release[] = [
  {
    version: '0.116.1',
    date: '2026-08-28',
    title: 'The discoveries map starts under a light bar',
    tldr:
      'Zakladka Odkrycia przelaczala na ciemno caly ekran razem z paskiem i tabami. Teraz gora zostaje jasna, a chmury zaczynaja sie dokladnie pod przelacznikiem.',
    changes: [
      ['changed', 'Opening Odkrycia no longer repaints the bar and the tabs dark. The top of the screen stays light in both tabs and only the cloud map below is dark, so the switch keeps one colour whichever side you are on'],
    ],
  },
  {
    version: '0.116.0',
    date: '2026-08-28',
    title: 'Przylasek Rusiecki is a whole set of lakes again',
    tldr:
      'Przylasek obejmowal tylko jeden zbiornik, a to zespol czternastu jeziorek. Obrys urosl z osiemnastu do stu dziewiecdziesieciu szesciu hektarow, doszly pomosty, jeziorka, budki, lody, place zabaw i petla na godzine.',
    changes: [
      ['fixed', 'The outline covered a single reservoir, which left the beaches, the food stalls, the playground and thirteen further lakes outside the place. It is redrawn from the water, beaches, piers and car parks that actually sit there'],
      ['added', 'Two points: the floating piers, which rise and fall with groundwater instead of standing on posts, and the set of fourteen lakes that carry numbers rather than names'],
      ['added', 'The seasonal food stalls, the ice cream stand by the beach and both playgrounds now show on the map, and the description says when the guarded swimming area is open and that a summer bus runs there'],
      ['added', 'An hour long loop past four of the lakes, because the description promised one and the generator could not build it: the new outline is thirty kilometres around'],
    ],
  },
  {
    version: '0.115.0',
    date: '2026-08-28',
    title: 'A trip to Portugal, for testing far from Krakow',
    tldr:
      'Odeceixe na Costa Vicentina wchodzi jako wyprawa tymczasowa: siedem punktow, dwa szlaki i jedna opowiesc o morzu, ktore odeszlo. Nie rusza procentu Krakowa, ale trasy i pieczatki dziala normalnie.',
    changes: [
      ['added', 'Odeceixe and the mouth of the Seixe join the app as a temporary trip, with seven points telling one story: why the walk from the village to the beach takes four kilometres'],
      ['added', 'Two suggested trails shaped by the story rather than by the shortest line. One walks the valley down to the ocean, the other crosses the bridge to a five thousand year old shell midden and comes back'],
      ['added', 'Six photographs from Wikimedia Commons, each credited, plus a place kind for villages so the card no longer calls a village a park'],
      ['added', 'A link with trip=costa-vicentina opens the map in Portugal and remembers it, so a tester far from Krakow does not have to search for the place'],
      ['changed', 'A temporary trip never counts towards the Krakow collection: the city percentage, the discovery board and the profile targets ignore it, while check in, points, the recorded walk and the stamp work exactly as everywhere else'],
      ['fixed', 'The trail generator read a hard coded list of two quest files, so a third one simply did not exist for it: trails were silently not calculated while the run reported success'],
      ['fixed', 'Trails can now be ordered by hand and are recalculated by the router on every run, which is the only way to build a route that leads from one place to another rather than around a single one'],
    ],
  },
  {
    version: '0.114.0',
    date: '2026-08-28',
    title: 'Every walk in the journal opens with its own map',
    tldr:
      'Karta wyprawy zaczyna sie teraz mapa przebytej trasy, zdjecia lekko na siebie nachodza, karta nie szarzeje pod palcem, a ekran wyprawy kadruje sie na miejscu spaceru takze wtedy, gdy nie ma sladu GPS.',
    changes: [
      ['added', 'Each chapter in the journal opens with a satellite frame of the walk, drawn full width inside the card padding. It reuses the tile frame from the place cards, so no second map engine runs and the tiles are already cached'],
      ['changed', 'Photographs in a chapter overlap slightly, the way prints lie on a table, instead of standing in a neat row'],
      ['changed', 'A chapter card no longer turns grey under a finger. On iOS that hover tint stayed behind after every tap'],
      ['fixed', 'Opening a walk framed the camera on its recorded track, so walks without one stayed on the default view of Kraków. They frame the place itself now'],
      ['fixed', 'The route no longer slips under the walk card: the frame reserves exactly the height the card covers, and it is restored after the screen finishes sliding in'],
    ],
  },
  {
    version: '0.113.0',
    date: '2026-08-28',
    title: 'The journal reads like a journal',
    tldr:
      'Karty wypraw w Pamietniku maja wiecej powietrza i polaroidowe miniaturki, przycisk idzie na cala szerokosc, klik w wyprawe naprawde ja otwiera, a animacja wciskania znikla.',
    changes: [
      ['fixed', 'Tapping a walk in Pamietnik opens it now. The journey screen lives inside the app shell, so the profile modal always covered it and a tap seemed to bounce back to the menu. Opening a walk now puts the menu away and closing it brings Pamietnik right back'],
      ['changed', 'Chapter cards breathe: text runs the full width with larger padding, photographs sit under the story as small tilted polaroids instead of one square on the left, and the browse action stretches across the whole card. The chevron is gone, the whole card is the tap target'],
      ['changed', 'Sections of the journal page sit much further apart, so the header, the numbers, the filters and the timeline each get their own room'],
      ['changed', 'The press animation rule from the previous release is removed on request. Touchable things answer with colour, not with movement'],
    ],
  },
  {
    version: '0.112.0',
    date: '2026-08-28',
    title: 'One press rule and a menu that points at the journal',
    tldr:
      'Wcisniecie w calej apce to teraz jedna delikatna zasada, ikonki menu stoja na bialych podkladkach, a Pamietnik dostal ciemnozielona karte z limonkowym tytulem.',
    changes: [
      ['changed', 'Pressing anything follows one system rule now: the element shrinks by five percent and loses ten percent of its opacity, with tokens for both values. The old squash morph stretched letters on text rows and is gone'],
      ['changed', 'Menu link icons stand on white plates so the tone lives in the icon alone. ListItem gains a documented paper lead surface for this'],
      ['added', 'The journal cell is the single loud card in the menu: deep forest green with a lime headline, a lime icon badge and a soft glow. In the dark theme the pair flips and stays readable'],
      ['added', 'A content-on-lime pairing guarantees dark ink on lime badges in both themes'],
      ['fixed', 'Hand tuned map pin icon colours lived only in the generated tokens file, so the first regeneration wiped them. They moved into the generator itself as the source of truth'],
    ],
  },
  {
    version: '0.111.0',
    date: '2026-08-28',
    title: 'Pamiętnik replaces Wyprawy and the main menu gains a clearer hierarchy',
    tldr:
      'Pamiętnik zastąpił listę Wypraw, menu ma nowy postęp i większy rytm, a siedem parków dostało własne transparentne pieczątki.',
    changes: [
      ['added', 'Pamiętnik now groups each finished walk with its route, photographs, notes, recordings and discovered points in a chronological chapter feed'],
      ['added', 'An explicitly labelled Skałki Twardowskiego preview supplies three photos, a note and a recording when the real journal is empty, without writing demonstration data to storage'],
      ['added', 'StoryCard joins the design system and its catalogue as the reusable editorial chapter card for chronological feeds'],
      ['added', 'ListItem gains a documented squircle leading-icon variant for roomy navigation menus while preserving the round default everywhere else'],
      ['added', 'Transparent place-specific stamps are connected to Zalew Bagry, Dolina Bolechowicka, Park Jordana, Planty, Skałki Twardowskiego, Park Zakrzówek and Park Krakowski'],
      ['changed', 'The old Wyprawy tab is removed. Pamiętnik keeps its name and sits beside Odkrycia as the default view'],
      ['changed', 'The main menu replaces the progress ring with an editorial city score, progress rail and next milestone, then groups actions into Historia, Odkrywaj, Twoje dane and Aplikacja'],
      ['changed', 'Menu rows use larger vertical spacing, card-like grouping and soft square icon containers instead of round discs and heavy section bands'],
      ['fixed', 'Stamp imports now validate exact zero-alpha corners and reject a bad candidate before it can replace a working transparent asset'],
      ['fixed', 'Sample journal photos and the recording asked for the site root, which breaks on GitHub Pages where the app lives in a subfolder. They now resolve through the asset helper'],
      ['fixed', 'The journal empty state measured its padding from a spacing token that does not exist, which silently voided the whole declaration. It now uses a real token from the scale'],
      ['fixed', 'Journal statistics and chapter summaries now take Polish plural forms from the shared naming helpers, so 2 wyprawy and 5 zdjec no longer read as 2 wypraw and 5 zdjecia'],
    ],
  },
  {
    version: '0.110.7',
    date: '2026-08-25',
    title: 'Nothing hides behind the system bars anymore',
    tldr:
      'Edytor trasy, dziennik i katalog liczyły odstępy od nieistniejących zmiennych, więc ich kontrolki wjeżdżały pod pasek statusu i wskaźnik domu. Naprawione u źródła.',
    changes: [
      ['fixed', 'Jarek split the problem correctly: spacing taste is one thing, content hiding behind the status bar or the home indicator is a bug. Seven fresh screens (trail editor top bar and save card, journal list, catalogue drawer and its floating button) measured their gaps from safe-area variables that never existed, so they resolved to zero. They use the real tokens now: controls never start under system zones, while the map and scrolling content still run edge to edge beneath them, transparently, the way it should be'],
    ],
  },
  {
    version: '0.110.6',
    date: '2026-08-25',
    title: 'The debug band introduces itself',
    tldr:
      'Różowy pas diagnostyczny przedstawia się teraz z imienia: przełącznik mówi, że jest włączony, co oznacza pas i jak go zgasić.',
    changes: [
      ['fixed', 'The screen diagnostic stayed on after measuring and its magenta band at the bottom was read as a layout loss. The toggle now announces its state, explains that the pink band is a marker of the zone outside the app, tells you a tap turns it off, and remembers being on across restarts'],
    ],
  },
  {
    version: '0.110.5',
    date: '2026-08-25',
    title: 'Bottom shortfall measured two ways',
    tldr:
      'Niedobór dołu mierzony jest teraz dwiema metodami naraz (okno kontra ekran i sonda przybitych elementów), więc kompensacja działa w obu trybach okna.',
    changes: [
      ['fixed', 'The bottom compensation now measures the shortfall two ways and takes the larger: window versus screen, and a probe of where pinned elements actually end. Whichever window mode iOS picks, the action bar lands just above the home indicator instead of swinging between too high and too high differently'],
    ],
  },
  {
    version: '0.110.4',
    date: '2026-08-25',
    title: 'Full window won, status bar follows the screen',
    tldr:
      'Doł odzyskany na dobre, a pas statusu bierze teraz kolor z ekranu, który jest na wierzchu: ciemny nad mapą, jasny nad kartami.',
    changes: [
      ['fixed', 'The experiment won the bottom back, and the top answered immediately: in the new window mode the system paints the status bar with the declared theme colour, and the static light one made a bright gap over the dark map. The colour is driven by the app now, from the same switch that tints the document: dark over the map, light over cards'],
    ],
  },
  {
    version: '0.110.3',
    date: '2026-08-25',
    title: 'Experiment: reclaim the bottom 47 pixels',
    tldr:
      'Eksperyment o odzyskanie dolnych 47 pikseli: stare deklaracje Apple wyleciały, tryb pełnoekranowy zgłasza manifest. Rozstrzyga jedna reinstalacja ikony.',
    changes: [
      ['changed', 'The legacy Apple meta tags are gone and the manifest now also declares fullscreen. The hypothesis: those old tags push the installed app into an old viewport that ends 47 pixels above the screen. The verdict needs one icon reinstall; the screen diagnostic will say okno 844 if the space is won, and it now also names the display mode'],
    ],
  },
  {
    version: '0.110.2',
    date: '2026-08-25',
    title: 'Bottom gap: the real model at last',
    tldr:
      'Dolna przerwa rozgryziona do końca: na iPhonie przybite elementy kończą się 47 px nad ekranem, więc wcięcie systemowe trzeba od tego ODJĄĆ, nie dodać. Przyciski siadają wreszcie nisko.',
    changes: [
      ['fixed', 'The fresh install test and one screenshot settled it: pinned elements on the phone end 47 pixels above the physical bottom, and the system inset describes a zone they cannot even reach. Adding the inset inside pinned bars pushed buttons about 90 points up in total. The app now measures that shortfall and subtracts it from the inset, so buttons sit right at the window edge, just above the home indicator, like native apps'],
      ['changed', 'The screen diagnostic verdict tells this story straight: how many pixels iOS keeps for itself and that the app compensates for it'],
    ],
  },
  {
    version: '0.110.1',
    date: '2026-08-25',
    title: 'The screen diagnostic now gives a verdict',
    tldr:
      'Diagnostyka ekranu mówi wprost, czy Twoja instalacja PWA pamięta stare ustawienia paska statusu i czy trzeba ponownie dodać ikonę.',
    changes: [
      ['added', 'iOS freezes the status bar settings the moment you add the icon to the home screen, so an old installation keeps an old, shorter window no matter what the code says, and that was the last piece of the bottom gap puzzle. The screen diagnostic in About now says it outright: either "this installation predates full screen, remove the icon and add it again from Safari" or "full screen and system insets work, the layout is healthy"'],
    ],
  },
  {
    version: '0.110.0',
    date: '2026-08-25',
    title: 'The gap above the home indicator, solved for real',
    tldr:
      'Znaleziona prawdziwa przyczyna przerwy nad wskaznikiem domu: doliczaliśmy do dołu 13 px, które należały do górnego paska statusu. Teraz liczy się dokładnie systemowy odstęp.',
    changes: [
      ['fixed', 'Every bottom offset (action bar, sheets, modals, toast, peek card) was 13 pixels too tall. For weeks the app added a measured "missing bottom" to the system inset; comparing with the Portfel app on the same phone proved the measurement wrong, and the 47 pixels were almost certainly the top status bar counted into the bottom. The system inset alone rules now, and in the phone simulation the button sits eight pixels above the home indicator line with the bar background filling the zone to the very edge'],
    ],
  },
  {
    version: '0.109.3',
    date: '2026-08-25',
    title: 'Action bar hugs the bottom closer',
    tldr:
      'Pasek ze Start wyprawy trzyma się bliżej dołu ekranu: własny zapas zszedł z 16 do 8 pikseli, strefa gestu systemowego zostaje nietknięta.',
    changes: [
      ['changed', 'The bottom action bar kept sixteen pixels of its own air on top of the system gesture area, which pushed the button and the content above it visibly up. Its own share is eight pixels now, everywhere the bar appears; the system area itself stays untouched, that part belongs to the home gesture'],
    ],
  },
  {
    version: '0.109.2',
    date: '2026-08-25',
    title: 'Profile gets colour and weight',
    tldr:
      'Ikony w profilu dostały kolory (złoto, błękit, cegła, fiolet), kreski są wyraźniejsze, a między sekcjami stoją grube pasy na całą szerokość.',
    changes: [
      ['added', 'Row icons carry colour now: three new semantic tones (sky, clay, plum) joined accent and gold, drawn from the palette the map pins already use, with both themes covered. Achievements are gold, trips are sky blue, places are warm clay, appearance is plum'],
      ['changed', 'Dividers grew up: hairlines in the profile use the stronger border colour, and sections are separated by a full-width 8 pixel band, the way a settings screen groups things'],
    ],
  },
  {
    version: '0.109.1',
    date: '2026-08-25',
    title: 'Profile polish, section head becomes a component',
    tldr:
      'Dividery w profilu idą na całą szerokość, wiersze mają więcej powietrza, a nagłówek sekcji listy to teraz komponent design systemu.',
    changes: [
      ['changed', 'Profile dividers run edge to edge, rows breathe with more vertical room, and section headings got a step smaller with more space above'],
      ['added', 'The section heading is a design system component now (ListHead), and List learned full-bleed dividers with inset off. Both documented in the catalogue, so every grouped list in the app speaks with one voice'],
    ],
  },
  {
    version: '0.109.0',
    date: '2026-08-25',
    title: 'Menu becomes your profile',
    tldr:
      'Menu to teraz pełny ekran profilu: u góry pierścień i liczby, niżej zwykłe wiersze. Wyprawy i odkrycia mieszkają razem pod przełącznikiem, a Wygląd to proste radio.',
    changes: [
      ['changed', 'The menu sheet grew into a full profile screen. The top says what matters: a progress ring with places discovered, then trips, kilometres walked and golden stamps. Below it plain rows with an icon, text and a chevron, with more breathing room, grouped into You, Places and Settings'],
      ['changed', 'Trips and discoveries live together now, with a switcher on top: the list of your tracks on one side, the cloud map on the other. The trips side gained a summary of everything walked, and going back returns to the profile, not to the map'],
      ['changed', 'The appearance screen is a simple radio list: an icon on the left, a dot on the right, no more preview tiles. The change applies instantly anyway, so the best preview is the screen itself'],
      ['fixed', 'The round filter button had lost its styling in an earlier cleanup and sat under the search field as a bare square. It is back beside the search, round as intended'],
    ],
  },
  {
    version: '0.108.1',
    date: '2026-08-25',
    title: 'Catalogue breathes, scrolls and comes back home',
    tldr:
      'Katalog odzyskał marginesy i przewijanie, wstecz wraca do aplikacji zamiast na 404, a spis otwiera pływający przycisk, który chowa się przy scrollu.',
    changes: [
      ['fixed', 'The catalogue had no margins on the phone: one padding rule used a spacing token that does not exist, and a single unknown variable voids the whole declaration. It also refused to scroll, because the app pins the page to the window and the catalogue never got its own scroller; it has one now'],
      ['fixed', 'The back button led to a GitHub 404: it pointed at the domain root, and on GitHub Pages the app lives under its own folder. It goes back to Parkove now'],
      ['added', 'The table of contents opens from a floating "Spis" pill, centered at the bottom of the screen. Scrolling down tucks it away quietly, scrolling up springs it back'],
    ],
  },
  {
    version: '0.108.0',
    date: '2026-08-25',
    title: 'The catalogue got a drawer, like a mobile storybook',
    tldr:
      'Katalog DS działa jak mobilny storybook: spis wysuwa się z lewej po hamburgerze albo swipe, działy się zwijają, a motyw siedzi pod dropdownem.',
    changes: [
      ['changed', 'The web sidebar is gone. Content fills the screen like an app, the top bar names the section you are on, and the table of contents slides in from the left after the menu button or a swipe from the edge, the way a mobile storybook does it'],
      ['changed', 'Sections in the drawer collapse and expand, only the one holding the current page starts open, and its entries are indented with a line so the nesting is visible. Searching flattens the tree into hits labelled with their section'],
      ['changed', 'The theme switcher moved to the bottom of the drawer as a dropdown, so it opens the system picker on a phone instead of taking up space as a three way switch'],
    ],
  },
  {
    version: '0.107.0',
    date: '2026-08-25',
    title: 'The catalogue reads like an app',
    tldr:
      'Katalog design systemu ma teraz działy i jedną sekcję na ekran, a historia wydań dostała własną stronę z filtrem i streszczeniami.',
    changes: [
      ['changed', 'The design system catalogue works like an app instead of one endless page: five sections in the sidebar (foundations, elements, content, layers and navigation, releases), one screen at a time, and the address remembers where you were. A search box filters the list, and on a phone each section scrolls sideways in its own row'],
      ['changed', 'Release history moved out of a sheet hidden behind the version number into its own page. Every release shows its date, a badge on the current one, the one sentence summary the app tells you after a refresh, and its changes tagged as new, change or fix. You can filter by tag, and it starts with the twenty newest of a hundred and fifty'],
    ],
  },
  {
    version: '0.106.0',
    date: '2026-08-25',
    title: 'One switcher for the whole app',
    tldr:
      'Zakładki i warianty tras korzystają z komponentu przelacznika z design systemu, tego samego co Osiągnięcia. Przewijanie w edytorze wróciło do normy.',
    changes: [
      ['changed', 'The place tabs and the trail variant switcher now use the design system Segmented component, the same one the achievements screen and the point card already used. My hand rolled copy went away with sixty lines of styling and its own measuring logic'],
      ['fixed', 'Scrolling zooms the editor map again. Blocking it was a wrong guess while hunting the marker positions bug, whose real cause was a stylesheet rule; the plus and minus buttons are gone with it. A double tap still does not zoom, because that is how you remove your own point'],
    ],
  },
  {
    version: '0.105.2',
    date: '2026-08-25',
    title: 'Editor markers finally sit where they belong',
    tldr:
      'Znaczniki w edytorze ustawiały się w kolumnę zamiast na swoich miejscach: jedna linijka CSS odbierała im pozycjonowanie. Teraz trzymają się mapy co do piksela.',
    changes: [
      ['fixed', 'The editor markers were stacked in a column instead of standing on their places, which looked like they had wandered off across the city. The offset grew by exactly 32 pixels per marker, its own height: our stylesheet loads after the map library and its position rule was overriding the absolute positioning that markers need. Measured after the fix: zero pixels of drift for all thirteen markers, and the same after zooming, panning and jumping to a wide view'],
    ],
  },
  {
    version: '0.105.1',
    date: '2026-08-25',
    title: 'Scrolling no longer moves the editor map',
    tldr:
      'W edytorze przewijanie nie zoomuje już mapy, więc punkty stoją tam, gdzie mają. Zoom robią przyciski albo szczypanie.',
    changes: [
      ['fixed', 'Scrolling in the trail editor zoomed the map out, sometimes to half of the region, which made every point pile up in one spot and looked like the markers were moving. The map ignores the scroll wheel now; zoom is a pinch or the plus and minus buttons next to the frame'],
      ['fixed', 'A double tap no longer zooms, because a double tap is how you remove your own point and one gesture was doing three things at once'],
      ['fixed', 'The zoom buttons moved the map by a hundredth of a level: the resize observer kept interrupting the animation. They jump straight to the next level instead'],
    ],
  },
  {
    version: '0.105.0',
    date: '2026-08-25',
    title: 'Editor that snaps to paths, and a second router',
    tldr:
      'Punkty w edytorze mają ikony i ptaszki, kafle ze zdjęciami, a twój punkt przykleja się do najbliższej ścieżki. Doszedł drugi router, więc trasa liczy się nawet gdy pierwszy milczy.',
    changes: [
      ['added', 'Your own point now snaps to the nearest path, both when you tap the map and after every drag, and a line tells you how far it jumped. A point dropped on a lawn had no way into the road graph, which is why routes so often refused to compute'],
      ['added', 'A second router. Measured today: the OSRM instance timed out on every single request while Valhalla answered the same route in 246 milliseconds. Valhalla now goes first, OSRM stays as the backup, and both are used for snapping too'],
      ['changed', 'Markers and the point list wear the same icons as the pins on the map, a selected point carries a tick in its top right corner, and the list became tiles with a photo of the place when it has one'],
      ['fixed', 'Markers sat next to their places and drifted: the entry animation scaled the screen by 1.5 percent and the map measured itself mid-animation. The animation only fades now, and the map recomputes its size on the first frame and on every container resize'],
      ['fixed', 'Tapping the map used to close the whole editor. It was rendered inside the trail sheet, so the tap hit the sheet backdrop; it hangs on its own layer now'],
    ],
  },
  {
    version: '0.104.0',
    date: '2026-08-25',
    title: 'Trail editor on its own screen',
    tldr:
      'Edycja trasy dzieje się teraz na pełnym ekranie: duża mapa, punkty dotknięciem, własne punkty palcem. Park Jordana dostał wodny plac zabaw.',
    changes: [
      ['added', 'Editing a route opens a full screen with a big map instead of a sheet inside a sheet. Tap a marker or a pill to put a place on the route, tap the map to drop your own point, drag it with a finger to move it, double tap to remove it. Distance and time recount as you go and the line redraws'],
      ['added', 'Park Jordana got a new quest point: the water playground, the flat basin where water shoots out of the pavement. Adding it pulled the point route across the park, from 690 to 1275 metres and from 27 to 59 percent coverage'],
      ['fixed', 'The pond that a hint in Jordana talked about does not exist. OpenStreetMap knows only the fountain, the nearest water is 500 metres away in Park Krakowski, and the satellite photo shows no pond either. The hint now points at the ring of benches instead'],
      ['fixed', 'Removing your own point took one tap, which meant a finger that drifted while dragging deleted the point instead of moving it. Two taps remove, and there is an undo for the last one'],
    ],
  },
  {
    version: '0.103.0',
    date: '2026-08-25',
    title: 'Trails that actually show the park',
    tldr:
      'Nowy system ścieżek: kategorie z wariantami do przeklikania i miara pokrycia parku. Bednarskiego dostał kółko pokazujące 94% terenu zamiast 43%.',
    changes: [
      ['added', 'Trails are measured by how much of the park they actually show: a 30 metre grid inside the boundary, a cell counted when the route passes within 60 metres. The number sits on the card as "81% parku". Across the catalogue the old best routes averaged 56 percent, and 24 of 44 places were under half'],
      ['added', 'A new generator walks the boundary from the inside: sampled every 120 metres, each point pulled 35 metres inward before snapping to a path. That inward pull is the whole trick, without it the route follows the pavement behind the fence. Bednarskiego went from showing 43 percent of the park to 94, Jordana from 27 to 81, Zakrówek from 28 to 56'],
      ['added', 'The trail screen now has categories: loops, through the quest points, crossings, marked trails and your own. A category with more than one variant shows a row of pills, so you flick between "Obwodem" and "Przez stawy i placyki" instead of scrolling four maps'],
      ['added', 'Ponds, viewpoints and playgrounds come from OpenStreetMap as landmarks and earn their own loop variant that passes them. Jordana gained one that visits the fountain and all three playgrounds'],
      ['changed', 'The place tabs became a proper segmented picker: the indicator slides between segments. They also stopped pretending to be filters, so there is no count and no Clear next to them; those belong to the filter button'],
    ],
  },
  {
    version: '0.102.0',
    date: '2026-08-25',
    title: 'One pass, one set of rules, seventeen better routes',
    tldr:
      'Cały katalog policzony jednymi regułami: 68 tras w 44 miejscach, siedemnaście miejsc dostało lepszą albo dodatkową ścieżkę.',
    changes: [
      ['added', 'Seventeen places gained a route or a better one. The prettiest are small: a 706 m circle around kopiec Krakusa that doubles back only 30 percent of the way, and a 923 m loop in park Grzegórzecki that never repeats a single step'],
      ['changed', 'Route thresholds now depend on what is at stake. As the only route a place has a walk may double back up to 55 percent and stay 40 percent inside the boundary; offered next to an existing route it has to be a real loop, inside 55 percent, and either short and genuine or long and clearly better'],
      ['fixed', 'Zielony Jar and Panieńskie Skały are narrow places whose walk naturally runs along the rim, so a flat boundary rule left them with nothing. They have their walks back. Przylasek Rusiecki keeps losing its, because that one ran 87 percent outside the place'],
      ['fixed', 'A route card no longer calls a walk a loop. Every generated walk returns to its start, so the geometry alone could not tell them apart; the card reads the name the generator gave it and says plainly that part of the way is walked twice'],
    ],
  },
  {
    version: '0.101.0',
    date: '2026-08-25',
    title: 'Every place recomputed, twelve gained a walk',
    tldr:
      'Cały katalog przeliczony bez parkingu: 44 miejsca mają trasy, dwanaście dostało je pierwszy raz, m.in. Decjusza, Reduta i kopiec Kościuszki.',
    changes: [
      ['added', 'Twelve places got a walking route for the first time: Decjusza, Reduta, Wiśniowy Sad, kopiec Kościuszki, Zaczarowanej Dorożki, Szwedzki, Wyspiańskiego, and five of the Jurassic valleys gained a second variant'],
      ['changed', 'A route is now named for what it really is: under 40 percent doubling back it is a loop, above that an honest "Spacer po parku". Witkowice show why it matters: their point-to-point route walks the same path back 97 percent of the way, so the 2.4 km walk around the park replaced it at the top'],
      ['fixed', 'Two different minimum lengths were fighting in the generator (600 metres when adding a route, 400 when cleaning up). Park Bednarskiego fell through the gap and lost its route entirely; there is one threshold now'],
      ['fixed', 'A route called "around the park" has to stay in the park: at least 55 percent of its length inside the boundary. Panieńskie Skały were being given a walk that ran mostly through the neighbouring forest, so they keep their marked trail instead'],
    ],
  },
  {
    version: '0.100.0',
    date: '2026-08-25',
    title: 'Routes without the parking detour',
    tldr:
      'Trasy nie zahaczają już o parking: zaczynają się przy pierwszym punkcie wyprawy. 22 miejsca mają nowe pętle i przejścia, reszta dojdzie.',
    changes: [
      ['changed', 'Generated routes start at the first quest point instead of the suggested parking, so the line on the map is the walk itself. Adding the car leg is your call: the pencil opens any route in the creator, where parking is a checkbox'],
      ['added', 'New route shapes where the terrain earns them: "Przez cały park" walks end to end between the two farthest points (Zalew got one), the short loop now picks the three points closest to each other, and Park Krakowski and Strzelecki gained proper little loops'],
      ['changed', '22 places carry the recomputed routes; the rest still show the old parking loops until the public router stops rate-limiting the batch. Data only, nothing breaks meanwhile'],
      ['fixed', 'The minimum route length dropped from 600 to 400 metres: without the parking approach an honest small-park loop was falling through the floor'],
    ],
  },
  {
    version: '0.99.4',
    date: '2026-08-24',
    title: 'Trail creator: live preview and editing',
    tldr:
      'Kreator trasy rysuje podgląd na żywo po każdym tapnięciu punktu, a ołówek przy gotowej trasie otwiera ją do edycji, np. żeby dopiąć parking.',
    changes: [
      ['added', 'The trail creator shows a live preview: every time you tick or untick a point, a small map redraws the routed line with its distance and minutes. Slow taps in a row only ask the router once'],
      ['added', 'A pencil next to every ready-made point trail pours its stops into the creator, so you can tweak it: add the parking, drop a point, and save it as your own variant'],
      ['changed', 'Trail screen copy cut to a third. The list explains itself; the essay is gone'],
      ['fixed', 'A hanging router request could keep the preview saying "counting" forever; it now gives up after 15 seconds and says so'],
    ],
  },
  {
    version: '0.99.3',
    date: '2026-08-24',
    title: 'Pins group into clusters',
    tldr:
      'Z daleka piny łączą się w kółka z liczbą miejsc; tapnięcie dosuwa mapę, aż grupa się rozpadnie. Małe kropki poszły do kosza.',
    changes: [
      ['changed', 'Far away the pins gather into clusters: a dark green circle with a lime count of places inside, with the same light rim the pins wear. When every place in a group is completed, the circle turns stamp gold. Tapping a group eases the map to the zoom where it falls apart'],
      ['fixed', 'The tiny far-away dots are gone; a lone park keeps its teardrop at any distance, just smaller'],
    ],
  },
  {
    version: '0.99.2',
    date: '2026-08-24',
    title: 'Filter button, gold rims, bigger pins',
    tldr:
      'Progi czasu i dystansu mieszkają pod okrągłym przyciskiem przy wyszukiwarce, odwiedzone łezki noszą złotą obwódkę, a wszystkie piny trochę urosną.',
    changes: [
      ['changed', 'The time and distance dropdowns moved off the list into a small Filters sheet, opened by a round icon button next to the search field. The button fills dark green while any threshold is set, and the sheet closes with a live "show N places" button'],
      ['added', 'A place you visited but have not completed wears a gold rim on its teardrop (and on its far-away dot), so the map now tells apart "never been" from "been, but something left"'],
      ['changed', 'All park pins grew a touch, on every zoom level'],
      ['fixed', 'The active tab above the list was invisible since 0.99.0: the highlight pointed at a colour token that never existed. It points at the real one now, and so does the filter button'],
    ],
  },
  {
    version: '0.99.1',
    date: '2026-08-24',
    title: 'Tilted satellite, quest-style pins, ortho retired',
    tldr:
      'Ekran główny stoi na satelicie lekko pochylonej, ortofoto zniknęło, a łezki mówią językiem punktów wyprawy: zielone z limonkową ikoną, zdobyte całe w złocie.',
    changes: [
      ['changed', 'The home map defaults to the satellite photo and stands at a gentle 24 degree tilt, just enough depth without lying about where a pin points'],
      ['changed', 'Park pins now speak the exact language of the quest points you see when a park is selected: dark trail green, lime icon, light rim. A completed place turns full gold, the same gold as its stamp. The landscape colour families from 0.99.0 lasted one release'],
      ['fixed', 'The GUGiK ortho imagery is gone everywhere: the style picker, the 3D relief, the memory replay and offline packs all use the satellite source now. The replay keeps its sharpness through the same tile supersampling trick, and anyone who had Ortofoto picked lands back on Satelita'],
    ],
  },
  {
    version: '0.99.0',
    date: '2026-08-24',
    title: 'Teardrop pins and simpler filters',
    tldr:
      'Piny to teraz większe łezki z kolorem krajobrazu, a filtry to zakładki plus dwa progi: czas zwiedzania i kilometry. Oceny trudności zniknęły.',
    changes: [
      ['changed', 'Park pins are proper teardrops now: bigger, with a soft rounded tip instead of a spike. The pin colour tells the landscape family before you read the icon: green for parks, gardens and meadows, deep fir green for forests, blue for water, ochre for mounds and valleys. An unvisited place is an outline, a visited one is filled, a completed one wears the golden tick'],
      ['changed', 'Filtering went back to basics: three tabs (All, Parks, Valleys) plus two dropdowns, visiting time and walking distance. The thresholds come from real data, not from hand ratings, so they work for every place from day one'],
      ['added', 'Every list card and place sheet now shows an honest visiting estimate, like "ok. 45 min · 2,1 km". Places with a routed loop use its real minutes plus a short stop per quest point; places without one get a rough guess from their area'],
      ['fixed', 'Difficulty ratings (D/O), the rating dev mode and the filter sheet are gone. Two sliders and a copy-my-ratings flow was a lot of machinery for a question two dropdowns answer better'],
    ],
  },
  {
    version: '0.98.1',
    date: '2026-08-24',
    title: 'Park pins speak the memory language',
    tldr:
      'Piny parków przerysowane w języku wspomnień: ciemny krążek, biała obwódka, limonkowa ikona Lucide, złoty ptaszek za domknięcie.',
    changes: [
      ['changed', 'Park pins now come from the same factory as every other pin in the app, the one the memory replay uses: a round badge with a Lucide icon. A visited park looks exactly like a route point (dark disc, white rim, lime icon), a completed one wears the same golden tick a collected point does, and an unvisited one is the inverse, a light disc with a dark rim, not yet filled in'],
      ['changed', 'Kind icons joined the shared icon library: deciduous tree for a park, trees for a forest, mountain for a mound, a V for a valley, waves for water, flowers for gardens and meadows, a leaf for nature. Far-out dots take their colours from the same design tokens instead of hardcoded hex'],
      ['fixed', 'Pin size matched to the memory screen scale, so the same route reads as one app again, not two'],
    ],
  },
  {
    version: '0.98.0',
    date: '2026-08-24',
    title: 'Park pins on the main map',
    tldr:
      'Piny wszystkich miejsc na głównej mapie: ikona rodzaju, kolor stanu; pin znika na czas zaznaczenia, na wyprawie znikają wszystkie.',
    changes: [
      ['added', 'Every place carries a pin on the main map (an idea from Jarek, shaped in a grill): the icon says the KIND (tree, valley, mound, forest, meadow, water, garden, nature) and the colour says the STATE, light with an outline for not yet visited, full green for visited, gold for completed. From far out pins shrink to small state dots; from zoom 11.6 the full icons appear'],
      ['added', 'Tapping a pin selects the park exactly like tapping its outline, and the pin steps aside for the duration: the highlighted outline and the peek card take over, and the pin returns when you deselect. During a walk all park pins disappear, because that map is for the points in front of you'],
      ['changed', 'Completed places hand the stage to their stamps up close: the golden pin shows only between zooms 11.6 and 12.5, where the stamp takes over'],
      ['fixed', 'Pin artwork tuned for real size: a lighter glyph and a soft dark outer contour, because at 26 pixels a heavy glyph read as a dark blob on bright rooftops'],
    ],
  },
  {
    version: '0.97.2',
    date: '2026-08-24',
    title: 'Clouds allowed to lean over the parks',
    tldr:
      'Chmury lekko nachodzą na odkryte parki, krawędź okna jest nieregularna per zatoka i bardzo powoli oddycha.',
    changes: [
      ['changed', 'The fog edge stopped standing stiffly next to the parks. Every vertex of the window outline now has its own amplitude, plus a slow radial component, so some bays of fog bite deeper into the window while others barely tremble; full breaths take a dozen seconds'],
      ['changed', 'Clouds may lean over a discovered place: sparse wisps are drawn once more over the windows with a different offset, and each window carries two single puffs resting on its rim, wandering along it very slowly, a full lap in a few minutes'],
    ],
  },
  {
    version: '0.97.1',
    date: '2026-08-24',
    title: 'Windows in the fog take the shape of the park',
    tldr:
      'Okna w chmurach mają kształt parku z falującą krawędzią, a chmury dostały trzecią warstwę, kłęby i podcień.',
    changes: [
      ['changed', 'A discovered place now clears the fog in the SHAPE of that place, not a circle: the real outline, slightly irregular, with vertices that sway a few pixels over time so the edge breathes. The soft rim comes from a shadow trick that works on every WebKit, no canvas filters involved'],
      ['changed', 'Clouds got rebuilt: three tiled layers instead of two flat ones. A slow mass, cauliflower puffs with a shaded underside carrying the form, and fast thin wisps on top; each layer drifts in its own direction with a slight sway, so it stops feeling like a conveyor belt'],
      ['fixed', 'On sharp screens the holes were not being cut at all: canvas shadow offsets ignore the transform matrix, so on a retina display the shadow landed outside the frame. Offsets are in device pixels now'],
      ['fixed', 'The ortho style carries its own camera and quietly overrode the opening frame; the whole-city view is enforced after the style loads'],
    ],
  },
  {
    version: '0.97.0',
    date: '2026-08-24',
    title: 'Your discoveries: the map under clouds',
    tldr:
      'Nowy ekran w menu Ty: mapa Krakowa pod dryfującymi chmurami, odkryte miejsca jako czyste okna, świeże odkrycie rozgania chmury raz.',
    changes: [
      ['added', 'Twoje odkrycia in the Ty menu: a full screen map of the city under drifting fog. Visited places are clear windows with their name, a lime ring, gold when the place is complete; unvisited ones sleep under the clouds with a barely visible dashed outline and a question mark. The outline says something is there, it does not say what'],
      ['added', 'The clouds move: two tiled layers drift slowly in different directions and shift with a slight parallax as you pan. All of it is one 2D canvas over the map, alive only on this screen, so the battery does not pay for it anywhere else'],
      ['added', 'A place discovered since you last looked gets its moment: the clouds part over it once, with a caption, and from then on that piece of the map is simply yours. State comes entirely from what the app already knows; there is nothing to earn twice'],
      ['changed', 'From far out only larger hidden places show their outline, because fifty question marks at once turn a tease into wallpaper'],
    ],
  },
  {
    version: '0.96.0',
    date: '2026-08-24',
    title: 'ZZM photos for every city park, and difficulty gets real sliders',
    tldr:
      'Zdjęcia 36 parków prosto ze strony ZZM (60 nowych, każde obejrzane) i suwaki trudności zamiast chipów.',
    changes: [
      ['changed', 'City park photos now come from the ZZM Kraków page, the source Jarek pointed at: 36 parks swapped in one go, 60 photographs, each one reviewed on contact sheets before it went in (the Warsaw mill taught us that no filename filter replaces looking). Aerial shots of Jordana and Aleksandry, the beach at Bagry, the lagoon piers at Przylasek Rusiecki. Credit line says ZZM Kraków'],
      ['changed', 'Old replaced photos were removed and the whole photo folder was re-optimized: 98 MB of originals became 39 MB on disk, with nothing over 1280 px wide'],
      ['changed', 'The difficulty section in Filtry got proper sliders, after Jarek asked for better visuals: five fields per axis you can tap or drag a finger across, the active part in brand green, and a caption that says in words what you picked, in the same language as the rating rubric. Tapping the active field again removes the limit. The slider means not harder than; seeking hard places can come later if wanted'],
      ['fixed', 'One park has no gallery on the ZZM page (Park Leśny Witkowice), so it keeps its previous photo instead of getting nothing'],
    ],
  },
  {
    version: '0.95.0',
    date: '2026-08-24',
    title: 'The full filter sheet behind Więcej',
    tldr:
      'Arkusz wszystkich faset pod chipem Więcej: intencje, co na miejscu, progi trudności i nasza kolekcja, z żywym licznikiem.',
    changes: [
      ['added', 'The Więcej chip at the end of the row opens a Filtry sheet with four groups: Na dziś (intents), Co na miejscu (playground, food, water, a ring loop, parking), Trudność (thresholds on both axes: any, two dots or less, four dots or more) and Nasza kolekcja (new to us, almost golden, long unseen). Chips in the sheet and chips in the row are the same state, so nothing gets applied or confirmed; the count on the button is live'],
      ['added', 'Three collection filters that read the game state: Nowe dla nas (never visited), Prawie złote (visited, at most two points short of the stamp) and Dawno nas nie było (no visit for half a year)'],
      ['added', 'Facets for water places and hand made ring loops, computed from data the app already has. Cały dzień means a big area, a loop over ninety minutes or a demanding pair of ratings'],
      ['changed', 'The Więcej chip shows a count of active sheet-only filters, and the empty state in both the sheet and the list now also explains the case where a difficulty threshold is set but no place is rated yet'],
    ],
  },
  {
    version: '0.94.0',
    date: '2026-08-24',
    title: 'Two difficulty axes and intent chips instead of tabs',
    tldr:
      'Dwie osie trudności (Dojście i Odkrywanie) z trybem ocen, celki na liście i karcie, chipy intencji zamiast zakładek.',
    changes: [
      ['added', 'Every place can carry two separate ratings, an idea taken from Geocaching: Dojście (the ground under your feet and stroller wheels) and Odkrywanie (how hard the points are to earn), five dots each. The pair says things one number cannot: easy walk plus hard hunt equals a perfect rainy Saturday. The card shows both axes with a level caption and, for telling pairs, a one line hint sentence; the list shows a compact D and O dot pair in each row'],
      ['added', 'A rating mode, because Jarek rates all 57 places himself: switch it on in O aplikacji, then tap the dots right on a place card. Ratings collect on the phone as a draft and one button copies them as JSON to send back; pasted into the data they become permanent for every device. The draft overrides the shipped data, so a correction made in the field shows up immediately'],
      ['changed', 'The chips row above the list replaces the Wszystkie, Dolinki, Parki tabs. Kinds are now ordinary chips in one scrollable row together with intents and facets: Dolinki, Parki, Deszczowa sobota, Z wózkiem, Plac zabaw, Lody. One intent sets several conditions at once; Deszczowa sobota means Dojście of two dots or less, a loop under 40 minutes and a car park nearby'],
      ['added', 'Filters never leave you staring at silence: an active filter shows a live count with a clear button, and an empty result explains itself, including the case where an intent reads Dojście ratings and no place is rated yet'],
      ['fixed', 'Facets are computed once from data the app already has (amenities, parking, transit, generated loops), so adding a filter is one field in one file, not a change to the list screen'],
    ],
  },
  {
    version: '0.93.2',
    date: '2026-08-24',
    title: 'The places sheet stops showing up where it does not belong, and stops depending on an animation to exist',
    tldr:
      'Arkusz miejsc nie wchodzi już na ekran wyprawy, a jego pozycja nie zależy od tego, czy animacja się dokończy.',
    changes: [
      ['fixed', 'Opening a walk from the journal showed the All parks sheet on top of it. The sheet sits at layer 100 and that screen sat at 80, so the order was simply wrong — and had been for a long time, invisibly. What hid it was the decoration removed yesterday: while a subpage was open the whole app shell got a transform, and a transform makes an element a stacking context, so everything inside it, sheet included, painted as one layer underneath. Removing that transform yesterday, which had to happen for a different reason, took the cover off. The layers are now written down in one place: HUD, sheets, screens, camera, memory, download bar, modals'],
      ['fixed', 'The sheet also stopped depending on an animation to be in the right place. Its position is set directly, but the entry slide is a keyframe whose first frame is exactly one screen below the edge, and a browser that is not drawing frames holds that first frame. Safari on iOS can stop drawing for a moment right after a full-screen screen closes, and then the sheet is parked below the edge until something wakes the drawing up — which is what tapping around at random was really doing. Measured here directly: the animation running with a current time of zero while the position was already correct. The dock now arrives without that slide, and the first placement is never animated, so there is nothing left to freeze. Sheets that genuinely arrive, like the menu, keep the movement — they are always opened by a tap, so the browser is certainly awake'],
    ],
  },
  {
    version: '0.93.1',
    date: '2026-08-24',
    title: 'The places sheet stops vanishing after you come back from a subpage',
    tldr:
      'Arkusz miejsc nie znika już po powrocie z podstrony: powłoka apki nie jest już przesuwana.',
    changes: [
      ['fixed', 'Coming back from a subpage sometimes left the home screen dead: the places sheet gone, nothing responding, and tapping around at random eventually brought it back. The cause was a piece of decoration. While a subpage was open, the whole app shell was slid 22 pixels aside and dimmed slightly, as a hint that you had gone one level deeper. Both of those properties, a transform and a filter, turn an element into the containing block for anything positioned fixed inside it, and the places sheet is positioned fixed inside the shell. So for as long as the subpage was open, the sheet was measured against the shell instead of the window; when the subpage closed and the properties went away, iOS did not recompute that until something forced it, and a tap is what forced it. The effect stays where it is safe, on screens and panels that contain nothing fixed'],
      ['changed', 'That also means the app no longer pushes its whole surface, map canvas included, through a filtered layer every time a subpage opens and closes. It was the most expensive thing we animated on a phone, and it bought a movement you could only see for a quarter of a second before the subpage covered it'],
    ],
  },
  {
    version: '0.93.0',
    date: '2026-08-24',
    title: 'It says when you are walking without a map, and four places get a loop that really goes around',
    tldr:
      'Apka mówi, gdy idziesz bez pobranej mapy, rozmiar paczki wreszcie nie kłamie, a cztery miejsca dostały pętlę dookoła.',
    changes: [
      ['added', 'Starting a walk without the offline map now says so, once, with one tap to download. The function that knows this had been sitting in the code unused, so the app knew you were leaving without a map and said nothing. It does not block and does not ask you to confirm: walking without a map is a fine choice in the city, and a confirmation you always dismiss is worth nothing. It also does not trust the index alone — iOS clears the tile store without asking, so it checks the tiles are really there'],
      ['fixed', 'The download size was 39 percent too low: the lake promised 1.2 MB and the pack weighed 1.82 MB. Widening the sample changed nothing, which was the useful clue — not spread, but a systematic error. The estimate was sampling every layer at once, up to fifty tiles in one moment, and some responses came back short while still counting toward the average. Now the samples go in one queue, three at a time, and empty responses are not counted. Measured against the sum of every tile: lake 1.90 against 1.78, Jordan 2.96 against 2.92. That megabyte is what you decide on when you are on mobile data'],
      ['added', 'Four loops that actually go around: Bagry along the shore (3.8 km), Park Lotników (2.5 km), Skałki Twardowskiego (2.5 km) and Park Piłsudskiego in Skawina (1.7 km). Each one is offered only because it measured better than the loop we already had — Błonia get nothing new, because theirs is already fine'],
      ['changed', 'The lake loop is a proper loop now (2.8 km, six points). Worth saying how the first attempt failed: built from the points in order, it came out as 3.5 km of zigzag, because a router joins two stops by the shortest path and the shortest path between two points on the same bank never goes around the water. Measured, 42 percent of it was walked twice, against 20 percent for a real shore loop. So loops are drawn by direction now, and the stops are read back from what the route actually passes'],
      ['fixed', 'A challenge that promised one thing and counted another: "Two days in a row" said "a walk on Saturday and on Sunday" while the code accepted any two consecutive days. The hint was wrong, not the code — with a child, Tuesday and Wednesday count the same. Days are also counted in local time now; before, the boundary fell at 2 a.m. our time, so a walk started at one in the morning belonged to the previous day and the pair silently missed'],
      ['added', 'Two photographs for points that had none, checked by eye: the cave in Dolina Będkowska and the rock with the cross in Dolina Szklarki. Three hits were thrown out — a mill from Warsaw, a graduation tower from Rabka and a conference group photo in front of a hotel. The first two are now caught by a filter of towns this project does not contain; the third cannot be caught by any name filter, which is why the script now says plainly that new photos have to be looked at'],
    ],
  },
  {
    version: '0.92.0',
    date: '2026-08-23',
    title: 'The map controls stop disappearing, and the lake gets what people go there for',
    tldr:
      'Przyciski mapy już nie znikają, a zalew ma tężnię, fontanny, piasek i pętlę brzegiem.',
    changes: [
      ['fixed', 'Opening a screen and closing it back to the start left the list sheet standing at full height, which covers 92 percent of the display. Nothing had actually broken: the map controls were behind the sheet and the map was a 45 pixel strip, too narrow to pinch with two fingers, which is why zooming out looked broken too. Expanding the list is a request about a moment, so it now ends when another screen opens and you come back to the start screen you left'],
      ['added', 'At full height, tapping the strip of map above the sheet brings the map back. Dragging the sheet down already worked, but that is something you have to know; tapping what you want to return to is not'],
      ['added', 'Zalew Nowohucki has the four things people actually go there for, and every one of them is about the water: the brine graduation tower on the north shore, the fountains that float on the lake rather than standing on the bank, the wooden pier that is the only place you are above the water instead of beside it, and the sandy corner with four beach volleyball courts and a playground'],
      ['changed', 'The park description says all of that too. It described a loop and a bit of history and left out the tower, the fountains, the sand, the piers, the outdoor gym and the dog run, which is most of the reason to come'],
      ['changed', 'Real car parks from OpenStreetMap instead of my three guesses, with capacities: the big surfaced lot on Bulwarowa holds twenty, the strip along the road holds thirteen and is closer to the water, plus one north for the tower and the playground and one east for the gym'],
      ['added', 'A loop that goes around the water, 2.8 km, passing six of the points. Worth saying how it went wrong first: built from the points themselves, in order, it came out as 3.5 km of zigzag, because a router always joins two stops by the shortest path and the shortest path between two points on the same bank never goes around the lake. Measured, 42 percent of it was walked twice, against 20 percent for a real shore loop. So the loop is now drawn by direction, with a few steering points, and the stops are read back from what it actually passes. The sand and the mill are on a dead end and do not make the cut, which is honest: forcing them in cost a kilometre and doubled the backtracking'],
      ['fixed', 'The walking route generator lost its way home. It had one Overpass server and no alternative, so a single outage aborted the whole script; the trail generator solved this months ago and the fix had not travelled'],
    ],
  },
  {
    version: '0.91.0',
    date: '2026-08-23',
    title: 'The places sheet stops disappearing, and the lake gets its park',
    tldr:
      'Arkusz miejsc już nie znika, a zalew ma park, zdjęcia i 7 punktów.',
    changes: [
      ['fixed', 'The places sheet vanished after finishing a walk and only the menu brought it back. Its visibility was a toggle that got switched off when you opened a place from the list and switched on only from the menu, so once off it stayed off. It is derived now, from what occupies the bottom and nothing else: finish a walk or deselect a place and it comes back on its own. A state that can get stuck in the wrong position was simply the wrong tool'],
      ['fixed', 'A worse version of the same thing in the design system: the sheet reported its detent on every render rather than on change, because the caller passes a function made on the spot. Anything the caller did in response, such as noting that a minimal detent means not expanded, cancelled itself one frame later. Every request to expand died silently'],
      ['added', 'Touching the search expands the sheet to full height. On a phone the keyboard takes the bottom half, so at a 290 pixel peek you would be typing blind'],
      ['changed', 'The menu says All parks instead of Places to discover, My walks moved to the You shelf, and the shelf left holding one entry about places is now called Places rather than Walks'],
      ['changed', 'Zalew Nowohucki is outlined as the park, not just the water: 15.1 hectares from the OpenStreetMap park polygon around 6.7 hectares of lake. That polygon also carried a date, so the description can now say the park was laid out in 1957 rather than gesturing at the era'],
      ['added', 'Three photographs of the lake from Wikimedia Commons, and a seventh point: the manor Jan Matejko bought in 1865 as a summer house in the countryside. Eighty years later that countryside became Nowa Huta and the manor stayed'],
      ['added', 'The rest of what a place needs, audited one dataset at a time: three car parks, four places to eat, two playgrounds, the tram and bus stop named after the lake, walking routes from each car park, and two generated loops around the water'],
      ['fixed', 'The walking route generator now has fallback hosts. It had one Overpass server and no alternative, so a single outage aborted the whole script; the trail generator solved this months ago and the fix simply had not travelled'],
    ],
  },
  {
    version: '0.90.0',
    date: '2026-08-23',
    title: 'Zalew Nowohucki, with the mill that came before the steelworks',
    tldr:
      'Nowe miejsce: Zalew Nowohucki z sześcioma punktami.',
    changes: [
      ['added', 'Zalew Nowohucki as the fifty seventh place, with its own sticker, six points and a real outline: 6.7 hectares traced from the OpenStreetMap relation rather than drawn by hand'],
      ['added', 'The six points wrap around the shore, and the story holding them together came out of the map itself. The Dlubnia flows in at the north and out at the south east, there is a channel still named Mlynowka, and there are mill ruins standing on the north west bank. So this water was working water long before anyone built a steelworks next to it, and that is the point of the place'],
      ['added', 'The other three: the panorama bench on the north shore, the Wzlot sculpture on the south, and the shelters of Podziemna Nowa Huta a few hundred metres away, which is the most surprising thing in the area because nothing of it shows from the surface'],
      ['changed', 'Content keeps its distance from the bottom edge by the measured gap rather than the reported inset. On the phone the system says 34 and 47 actually goes missing, so a button held 34 away stood 13 too low and looked cut by an edge the eye reads as continuing'],
    ],
  },
  {
    version: '0.89.1',
    date: '2026-08-22',
    title: 'The strip is painted by the canvas, and only the canvas',
    tldr:
      'Pas nad wskaźnikiem domu bierze kolor ekranu, który jest z przodu.',
    changes: [
      ['fixed', 'Yesterday I claimed full screen surfaces could spill below the bottom edge of the view and cover the strip. They cannot: html and body have overflow hidden and the view is 797 on an 844 screen, so anything painted below 797 is outside the view and clipped. There is no element that can paint there. The strip is painted by the browser canvas and its colour comes only from the document background'],
      ['changed', 'So the document background is dark, because underneath it lies dark aerial imagery and a dark strip is then invisible, and light surfaces announce themselves. Two things announce, and not arbitrary ones: a modal and a bottom sheet, exactly the two that touch the bottom edge. A place preview card has a margin, so the map is below it and the strip stays dark'],
      ['fixed', 'A trap worth remembering: a hook runs on every render, including when the component is about to return null. The first version announced a light screen for every closed modal too, so the marker sat on the document from the first second and the strip was light even under the map. The condition has to live inside the hook'],
      ['changed', 'The phone simulator says plainly that it is a desktop tool. On a phone it overwrites insets that are already there, so content shifts by the difference'],
    ],
  },
  {
    version: '0.89.0',
    date: '2026-08-22',
    title: 'The strip above the home indicator, finally understood',
    tldr:
      'Koniec paska nad wskaźnikiem domu, tym razem z pomiaru.',
    changes: [
      ['fixed', 'The strip above the home indicator, and this time from a measurement instead of a guess. The diagnostic on the phone read: window 797, screen 844, safe area 34. So the view is 47 pixels shorter than the screen while iOS admits to 34, which means the safe area inset does not describe that space at all. Every earlier attempt added that inset to some padding, and every earlier attempt was therefore doomed'],
      ['changed', 'Full screen surfaces now spill below the bottom edge of the view by the measured difference rather than by the reported inset. This is the trick that already worked at the top, where the map goes behind the status bar instead of stopping in front of it. Content keeps its own padding, so nothing is cut: it only adds background where there was none'],
      ['changed', 'Two guards on that measurement, because screen height is not the browser window: it counts only in an app launched from the home screen, and only when the difference is inset sized. On a desktop the difference is hundreds of pixels and in landscape iOS reports the portrait height, so both are discarded'],
      ['fixed', 'The map lost its own spill, because the whole shell spills and the map lives inside it: two spills counted the gap twice, measured as 906 instead of 859 on an 812 window'],
    ],
  },
  {
    version: '0.88.2',
    date: '2026-08-22',
    title: 'The places sheet shows its title, search and tabs without dragging',
    tldr:
      'Arkusz miejsc pokazuje tytuł, szukanie i zakładki od razu.',
    changes: [
      ['changed', 'The sheet at the bottom now stands open far enough to show the title, the search field, the tabs and one whole place. It used to show a row and a half and nothing else, which meant searching required knowing that the search exists behind a drag'],
      ['changed', 'The peek height is measured, component by component: 84 for the header, 70 for the search with its spacing, 44 for the tabs and 76 for a row. That came to 274, and at 274 the measurement showed only 60 of those 76 pixels, so a place was not a whole place. 290'],
      ['changed', 'Notices follow the new height on their own, because both the sheet and they read the same one variable'],
    ],
  },
  {
    version: '0.88.1',
    date: '2026-08-22',
    title: 'Notices stop hiding behind the places sheet',
    tldr:
      'Komunikaty nad arkuszem miejsc, pole szukania nie zlewa się z zakładkami.',
    changes: [
      ['fixed', 'A notice could hide behind the places sheet, the update one worst of all. Two causes: notices sat lower in the stack than the sheet, ninety five against a hundred, so they were literally behind it, and the distance from the bottom was written into five separate places as seventy six pixels, a number chosen for the walk bar which is not even on screen at that moment. There is now one variable saying how much of the bottom is taken, set in the one place that knows'],
      ['fixed', 'The search field and the tabs read as one blob, because both were the same filled pill sitting one above the other. The field is outlined now and the tabs stay filled, which is a difference in meaning rather than decoration: a field you type into has an outline, a switch has a filled track with a raised pill'],
    ],
  },
  {
    version: '0.88.0',
    date: '2026-08-22',
    title: 'Search, routes you assemble yourself, and the gap at the bottom',
    tldr:
      'Wyszukiwarka miejsc, własne trasy i koniec szpary u dołu.',
    changes: [
      ['added', 'Search in the places list. It ignores the tabs and the groups, because typing a name means you want it found rather than told it lives in the other tab, and it ignores Polish accents, because nobody holds a key down on a phone to type them: bedkow finds Bedkowska'],
      ['added', 'Assemble your own route: tick the parking, the points, the playground and the coffee, and the walking router puts them in a sensible order. With the parking ticked the route comes back to it, because that is where the car is; without it the route runs from the first point to the last. This walks back the earlier decision that variants are fixed, but only halfway: assembling needs the network, so you do it at home, and the finished route is saved and works offline like any other'],
      ['fixed', 'The gap at the bottom of the screen on the phone, and both causes were mine. The document ground was permanently dark, on the theory that a dark strip under a dark map beats a white one. It did, and it was terrible for everything else: on the light walk screen the same black turned into a gap under a white card. The ground now takes the colour of the page and the darkness moved onto the map shell, where it was actually wanted, so a layer that falls short of the edge is the same colour as whatever sits above it'],
      ['fixed', 'The second cause: screens were sized from a measured window height that a phone can report shorter than the real screen. Every min-height now takes whichever is larger, the measurement or the real viewport, so the variable can only make a screen taller and never shorter'],
      ['added', 'A phone simulator, because this gap kept coming back and I kept fixing it from a description. All 43 uses of the safe area insets moved to variables, so they can be overridden, and the simulator sets the iPhone values and draws two transparent striped bands exactly where the island and the home indicator are. Transparent on purpose: you can see what is underneath'],
    ],
  },
  {
    version: '0.87.0',
    date: '2026-08-22',
    title: 'Places sit open at the bottom instead of behind a button',
    tldr:
      'Miejsca wystają na dole, zamiast siedzieć za przyciskiem.',
    changes: [
      ['changed', 'The places sheet is open on the main screen, showing a row and a half, and pulls up to the full list. The Miejsca button is gone. This is also the first time the main screen matches its own brief, which promised a full screen map plus a bottom sheet of park cards and had a button opening a modal instead'],
      ['changed', 'The peek height is measured rather than guessed: a place row is 76 px, so a row and a half is 114, and with the grabber and one caption line that comes to 174. Measured after the change: exactly 1.50 cells'],
      ['changed', 'The heading, the tabs and the group titles wait until you pull the sheet up. At 174 px they would have eaten the whole space meant for places. The first caption also tried to say drag up to see everything, wrapped onto two lines and took half a row: the grabber above it already says that'],
      ['changed', 'The sheet steps aside when the bottom belongs to something else, which is a selected place or a walk in progress. One surface at a time'],
    ],
  },
  {
    version: '0.86.1',
    date: '2026-08-22',
    title: 'Achievements, in two tabs',
    tldr:
      'Osiągnięcia: pieczątki i wyzwania w zakładkach.',
    changes: [
      ['changed', 'The shelf is called Achievements now, and inside it stickers and challenges sit in two tabs. Both earlier names were wrong the same way: they named one of the two things in there. An achievement is the umbrella and a sticker and a challenge are two kinds of it, equal to each other'],
      ['fixed', 'Putting the stickers underneath the challenges was worse than it looked: one of two equal things was hidden below the other, and you had to scroll past twenty six rows to see any of it. Stickers come first in the tabs, because you come here to look and a list with progress bars is for reading'],
      ['changed', 'Each tab carries its own count, so choosing one is not a guess'],
    ],
  },
  {
    version: '0.86.0',
    date: '2026-08-22',
    title: 'Challenges instead of the album',
    tldr:
      '26 wyzwań zamiast Albumu.',
    changes: [
      ['added', 'Twenty six challenges in place of the album, in four groups: places, points, walks and traces. Every one of them is a function of what the app already knows, so nothing is tracked twice, nothing can be forgotten, and they count backwards: everything you walked before they existed counts from the first time you open the screen'],
      ['changed', 'The album is gone as a screen but the stickers are not: they sit as the last section of Challenges. One shelf now answers the whole question of what you have earned, and a sticker stays what it was, the identity of a place rather than a reward for a challenge'],
      ['changed', 'Nothing on the list expires. A challenge that lapses on Sunday turns a game into an obligation, and with a child that matters: you can come back after a month and still count what you did'],
    ],
  },
  {
    version: '0.85.1',
    date: '2026-08-22',
    title: 'Refreshing says what changed',
    tldr:
      'Odświeżenie mówi, co się zmieniło.',
    changes: [
      ['fixed', 'Refreshing the version was quietly deleting every downloaded offline map. The condition kept caches whose name contained tiles, and the pack cache is not called that, so fifteen megabytes of deliberate work disappeared on every manual refresh'],
      ['added', 'After a refresh the notice says what actually arrived, one plain Polish line per version, instead of only which number replaced which. A version number is not information'],
      ['changed', 'A notice can run to two lines. One with an ellipsis was fine while the message said a photo was saved, but a sentence about what changed cut in half turns information into a riddle'],
    ],
  },
  {
    version: '0.85.0',
    date: '2026-08-22',
    title: 'Downloading is four times faster and keeps going when you leave',
    tldr:
      'Pobieranie mapy cztery razy szybsze.',
    changes: [
      ['fixed', 'Downloading was slow for a reason that had nothing to do with the connection. Measured first: 48 tiles straight from the source run at 11 ms each on six lanes and 7 ms on sixteen, so this is work bound by latency rather than bandwidth. The cost was all on the disk. The service worker was doing the whole job a second time, which meant two writes per tile, and its trimming walked the entire nine hundred entry tile cache on every single write, a thousand times in a row. A tile pulled into a pack is now marked in the query so the worker lets it straight through, trimming happens every twenty fifth write, and the weight comes from the header instead of reading every response body. Measured in the same place: from about 20 ms per tile down to 5'],
      ['fixed', 'The card said you could close it and the download would carry on, and that was not true: the state lived in the card and unmounting aborted the download. The job now lives outside any view, one at a time, and survives closing anything'],
      ['added', 'A slim bar at the very top while a map downloads: a progress ring, the place, the percentage and a countdown, with a cross to stop it. It sits above everything and leaves by itself three and a half seconds after finishing. Deliberately not a notice at the bottom, because that is where things that just happened live, and this is a state that lasts'],
      ['changed', 'One download at a time, because two valleys through the same connection is slower than one after another'],
    ],
  },
  {
    version: '0.84.1',
    date: '2026-08-22',
    title: 'Downloaded maps say where they stand',
    tldr:
      'Pobrane mapy mówią, ile ważą.',
    changes: [
      ['added', 'About the app now shows how many places are downloaded, what they weigh, and whether the browser has promised to keep them. That last part is the only honest answer to whether they will still be there: we ask for persistence on every download, but it is a request rather than a guarantee, and here it was not granted, which means the phone may clear them when it runs short of room'],
      ['fixed', 'The list of downloaded places and the tiles themselves live in two separate stores, so the app could promise a map that the phone had already cleared. You would have found out about that in a valley with no signal, trusting a badge. Opening a place now spot-checks three of its tiles and corrects itself, saying plainly that the phone tidied up and it needs downloading again'],
      ['added', 'Delete all downloaded maps in one place, for when the phone starts asking for room'],
    ],
  },
  {
    version: '0.84.0',
    date: '2026-08-22',
    title: 'A memory can have music, made on the spot',
    tldr:
      'Cicha muzyka pod wspomnienia, do włączenia.',
    changes: [
      ['added', 'Quiet music under a replay, synthesised live rather than played from a file. Nothing to download, so it works offline by definition, it never repeats, and the offline pack for a place stays at fifteen megabytes instead of nineteen. The key is derived from the walk id, so the same walk sounds the same every time and a different one sounds different: a memory gets its own sound the way it already has its own shape'],
      ['added', 'Your own recording takes priority. When a voice from the walk plays, the music drops almost to nothing and comes back slower than it left'],
      ['changed', 'It is off by default. Jarek first listen: this music is very meditative, which was not a compliment. The speaker in the corner turns it on and it stays on'],
      ['fixed', 'The first version of the drone had pairs of the same note detuned by a few cents. A few cents at 110 Hz is a beat once every two seconds, which means the pair cancels itself twice a second: measured loudness swung by 17 dB and it would have pulsed rather than held. Harmonic intervals instead, each voice breathing at its own very slow rate, and the swing is down to 4.6 dB'],
    ],
  },
  {
    version: '0.83.0',
    date: '2026-08-22',
    title: 'Download a place before you go',
    tldr:
      'Mapę miejsca można pobrać na offline.',
    changes: [
      ['added', 'A place can be downloaded for offline in its own card, under the weather, in two weights: the ordinary one covers the zooms the map actually uses in the field, the sharper one goes a level deeper and costs four times the tiles. Elevation, the vectors the 3D replay needs for buildings, and the photographs of the points all come along. Downloading a valley is about fifteen megabytes. Nothing starts by itself, because the mobile data is yours'],
      ['fixed', 'The deeper problem behind a map that would not load: the cache was only ever a souvenir. A service worker saves what you have already seen, so having the valley offline required walking the valley online first, which is precisely the thing you cannot do'],
      ['changed', 'Downloaded tiles live in a cache of their own that nobody trims. The ordinary tile cache holds nine hundred and evicts the oldest, so a downloaded valley would have evaporated after one walk around Krakow'],
      ['fixed', 'The size shown before downloading was almost half of the truth. It sampled a flat list of tiles, and the list is dominated by hundreds of light tiles from low zooms while the weight comes from the one densest zoom. It now samples every layer and weights by how many tiles that layer has'],
      ['added', 'A photograph can be saved to the phone from the viewer. Worth knowing why this was missing: photographs from a walk live in the browser database inside the app, not in the phone camera roll, so the Photos app cannot see them and neither can an iCloud backup. On iOS the share sheet is the way out, because it holds Save Image'],
      ['changed', 'The scale under the speed handle is one hairline that swells where the handle is, like a lens, instead of forty one ticks. The ticks were a lot of noise for one piece of information, and the glow only ever lit near the handle, so both ends of the comb looked switched off'],
      ['added', 'The press morph from the speed handle now works on the icon buttons too: menu, layers, locate, back and layers in a memory. Not on buttons with words in them, because stretched text reads as a fault rather than a reaction'],
    ],
  },
  {
    version: '0.82.0',
    date: '2026-08-22',
    title: 'Aerial tiles are cached again, and a memory lands instead of cutting',
    tldr:
      'Kafle mapy wracają do pamięci telefonu.',
    changes: [
      ['fixed', 'The Polish aerial tiles were not being cached at all. The service worker keeps a list of tile hosts and the Geoportal was never added to it, so from the moment the aerial map became the default the tiles went straight past the cache and a valley with no signal had nothing to draw from. This is the one to blame for a map that would not load today'],
      ['changed', 'Handwriting is Patrick Hand now, in notes on the walk, in a memory and in the viewer. It has a single weight, so every place that used to ask for bold now asks for regular: asking a single-weight face for bold gets you a synthetic outline, not a different face'],
      ['changed', 'A photograph lands rather than cuts. There was one cause and it was not the animation: the card arrived in the same instant that four layers of backdrop blur changed opacity, and cross fading blur is the most expensive thing a phone can do. The blur now has its own shorter window and starts after the card has moved'],
      ['added', 'When two memories fall close together the older one is pushed out rather than swapped in place: it drifts up, shrinks and fades behind the new one, like a photograph put down on a pile'],
      ['changed', 'The handle on the speed control squashes and stretches under your finger and springs back when you let go, with a ring that lights while you hold it. It is also aligned to the layers button above it, by arithmetic rather than by eye'],
      ['changed', 'The recording preview is quieter and has air on both sides. The waveform stays, because it is the only thing that says anything about a recording, but it does not need to reach the edges'],
      ['added', 'A notice can be dismissed by swiping it down. It arrives from the bottom, so leaving downwards is the same movement in reverse and there is nothing to learn. The cross stays but is no longer the only way out, and it was the smallest target in the whole thing'],
      ['changed', 'The progress hairline is gone from the memory screen, at Jarek request'],
    ],
  },
  {
    version: '0.81.0',
    date: '2026-08-22',
    title: 'The throttle moves to the edge, and a memory becomes a thing you look at',
    tldr:
      'Suwak prędkości na prawej krawędzi.',
    changes: [
      ['changed', 'The speed control stands vertically on the right edge, in a strip the width of a thumb, instead of lying across the bottom. The bottom now belongs entirely to what you came to see, so it holds no reserve for a control and a memory can sit right down against the progress hairline. Vertical is also more honest about the metaphor: the comment in this file always said push it up and your past self starts moving, while the arc was horizontal'],
      ['added', 'A quest point shows its own photograph. It was the only form with no object at all, just a paragraph on black, while your own photo had a polaroid and a note had a sticker. Meanwhile 45 photographs of these places were sitting in the repository unused. Plain, no white border, because that is what tells it apart from your snapshot: this is not your picture, this is the place'],
      ['changed', 'A note is a quotation now rather than a sticky note. The yellow sticker was the loudest object in the frame and it took half the screen for something that is one sentence. What stays is the hand that wrote it and a quote mark above'],
      ['changed', 'Notes and recordings no longer open a full screen of their own. They are already whole where they are, a sentence and a recording that plays in place, so they stopped being buttons and stopped pretending to lead somewhere. Only a photograph and a point open, because only they have more to show'],
      ['added', 'One finger on the map looks around: sideways orbits the walker up to sixty degrees each way, up and down raises and lowers the camera between forty and sixty. Lowering is what actually solves a walker hidden behind a ridge, because from above nothing blocks the view. Each drag picks its axis on the first movement and keeps it, and both offsets snap back to straight when you get close'],
      ['changed', 'The clock moved to the top, on the axis. It first landed bottom left and sat straight on top of read more'],
      ['changed', 'The photograph in a memory is larger, 72 percent of the width instead of 57, now that nothing below it is competing'],
    ],
  },
  {
    version: '0.80.0',
    date: '2026-08-22',
    title: 'A memory is a film again, not a cockpit',
    tldr:
      'Wspomnienie odtwarza się samo.',
    changes: [
      ['changed', 'The replay plays by itself, at a pace that puts an hour and a half of walking into about two minutes, and the controls hide after two and a half seconds. At rest the screen is the map and nothing else: one dimmed way out and a hairline of progress along the bottom edge'],
      ['changed', 'The walker stands at 67 percent down the screen instead of 28. With the camera behind and above, everything below the dot is ground already crossed and everything above it is the road ahead, so the old framing made the frame a rear view mirror. A racing game puts the car low for the same reason'],
      ['fixed', 'The darkness is now an event rather than furniture. The real cause was that a memory card was never cleared once shown: there was no setMemory(null) anywhere in the file, so the first memory stayed for the rest of the replay and the darkness had to be permanent to be ready for it. A memory now leaves after a hundred and forty metres of further walking, or on a swipe down, and stays as long as you like while you are stopped'],
      ['added', 'When a memory arrives the camera pulls back and the world sinks, then returns when you walk on. The whole frame changes register: I walk, I stop, I look'],
      ['changed', 'Tapping the map stops and starts the walk, and the separate pause button is gone. There was a hidden conflict here, since tap to reveal the controls and tap to pause are the same gesture, so they do one thing: the tap stops the walk and shows you the handle springing back to the middle'],
      ['changed', 'The dial is 38 percent smaller and sits at the very bottom. It was the largest object on the screen and it is a control, so it was competing with the photograph it was meant to sit under'],
      ['added', 'A hairline at the bottom edge showing how far into the walk you are. There was no way to tell before'],
      ['fixed', 'A negative frame delta could send a negative camera padding, MapLibre throws on that, and a throw inside a requestAnimationFrame callback kills the whole loop. The screen froze with the clock on zero and nothing to show why. The frame delta is now clamped to a sane range, which also stops a walk teleporting half a valley after the phone comes back from sleep'],
    ],
  },
  {
    version: '0.79.1',
    date: '2026-08-22',
    title: 'The walk detail track is the lime from a memory',
    tldr:
      'Ślad wyprawy w limonce.',
    changes: [
      ['changed', 'The track on the walk detail screen takes the lime the replay uses for the same thing, and drops the white casing. Lime is brighter than anything it can lie on, so it needs no backing, and the screen is one layer cleaner for it. On the main map that colour belongs to the trail, so the track has to differ there, but this screen has no trail on it: one line, and that line is the road you walked'],
    ],
  },
  {
    version: '0.79.0',
    date: '2026-08-22',
    title: 'A pinch of zoom in a memory, and the track stops hiding in the forest',
    tldr:
      'Szczypta i lepiej widoczny ślad.',
    changes: [
      ['added', 'The memory replay takes a pinch, within limits: 16.6 give or take 1.5, so from 15.1 to 18.1. The route still drives the frame, so panning and twisting stay off and the pinch only changes height. Not more than 18.1 on purpose: above about 17.5 the tile falls on a zoom level the aerial service does not have, so the picture stops gaining detail and starts going soft'],
      ['fixed', 'The track on the walk detail screen gets the same white casing the main map has. It was drawn in the dark green of the button background and over aerial forest it simply vanished, dark line on dark ground. The colour of the track stays, so it does not get mixed up with the lime trail, which is a suggestion rather than a record'],
      ['added', 'A gold dot where the walk began, the same language the thumbnail in My walks already speaks. No finish marker: most of these walks are loops, so it would sit on the start and say nothing'],
      ['fixed', 'The walk detail map fell back to Esri satellite when the chosen style was the raised relief. The flat equivalent of a photograph with relief is the same photograph lying down, not a different photograph, so it now falls back to the aerial one'],
    ],
  },
  {
    version: '0.78.0',
    date: '2026-08-22',
    title: 'Polish aerial photography, and the memory replay asks for it sharper',
    tldr:
      'Polska ortofotomapa jako domyślna.',
    changes: [
      ['added', 'A fourth map style, Ortofoto: the GUGiK aerial photography from Geoportal, and it is the new default. The old imagery was global, which meant Poland got whatever frame fell into the mosaic, and the frame was winter: bare trees, a shadow across half of it, grey. The new one is summer and sharp enough to show plough furrows in a field and single trees in a treeline. Esri satellite stays as a separate style, because a national service has no automatic fallback'],
      ['changed', 'The memory replay always uses the aerial photography, and asks for it one zoom level deeper than the screen strictly needs. A phone has three device pixels per CSS pixel and MapLibre does not count them when it picks a tile, so the photograph was being stretched: that was the lost feeling in the 3D flight. At the replay camera this lands exactly on zoom 19, which is the sharpest the service has'],
      ['changed', 'My walks is rows with hairline dividers instead of boxes: more air, the divider starts past the thumbnail, and hovering lifts the whole row instead of swallowing the thumbnail and the pills into it'],
      ['fixed', 'Polish number agreement, in one place now instead of copied across six screens. The menu said 1 wypraw and 1 zapisanych, and the short version would have said 22 wypraw at twenty two'],
      ['fixed', 'Tiles in the replay stop cross fading for 300 ms. With the camera moving continuously every new tile was permanently blending out of its blurry parent, so the picture never resolved'],
    ],
  },
  {
    version: '0.77.0',
    date: '2026-08-22',
    title: 'My numbers, my walks, and an album instead of stamps',
    changes: [
      ['added', 'My numbers replaces the greeting row and the profile bag. Every number there has to say something about you rather than just grow: kilometres, walks and time outside for scale, then what you like as a breakdown of the points you found by category, which says why you go rather than how much, then records and habits (longest walk, the place you keep returning to, the hour you usually leave, since when you have been walking), and closest to a sticker, the only number that is an invitation because you can change it today'],
      ['added', 'My walks is a visual list: every tile draws the shape of your own track with a gold dot at the start, so you recognise a walk from a metre away, the way a photograph beats a caption. No map underneath, because twenty thumbnails would be twenty graphics contexts and what matters is the shape'],
      ['changed', 'Stamps are now the Album, with the subtitle stickers from places you visited. Stamps describe the mechanism, an album promises somewhere you come back to and look, and these illustrations are for looking at'],
      ['changed', 'Where to today is gone, at Jarek request, and the profile screen no longer exists: it was the last of the legacy, a bag holding statistics, stickers, photographs, walks, settings and a version number side by side. Everything moved to where it belongs'],
    ],
  },
  {
    version: '0.76.0',
    date: '2026-08-22',
    title: 'The menu has three shelves instead of five flat rows',
    changes: [
      ['changed', 'Menu rebuilt into three spaces, each answering a different question. YOU: profile and stamps, what you have done. WALKS: places to discover and where to go today. SETTINGS: how it looks and what it is'],
      ['fixed', 'The duplicates are gone. Stamps had a row in the menu and a section in the profile. Map look and app look each had two entries, one in the menu and one inside the profile. The version number, the refresh and the component catalogue sat in the profile, between stamps and photographs, although the profile is about what you did'],
      ['added', 'Where to today came out of the bottom of the profile into the menu, with the name of the place written out: one of the few things in this app that genuinely gets you out of the house was the most deeply buried thing in it. One tap shows it on the map'],
      ['changed', 'The places list stays in the menu even though the map has its own button, and that is not a duplicate but two contexts: during a walk the map button does not exist, so the menu is the only way to the list'],
      ['added', 'Look is one screen for the theme and the map style, chosen by preview rather than by name, because with three map styles the names say nothing until you try them. The previews are drawn, not photographed: a real frame would need three map instances at once, and screenshots in the repository go stale with every palette change. The drawings take their colours from the same style definition, so they always match what you get. Auto is cut diagonally, half light and half dark'],
      ['added', 'About the app holds the things that are about the app: refresh, what is new, the catalogue, and the screen diagnostic as a plain row rather than a secret behind three taps on a version number. This app has one user and he is the one debugging it'],
    ],
  },
  {
    version: '0.75.0',
    date: '2026-08-22',
    title: 'Pick a trail on the map you are standing on',
    changes: [
      ['added', 'During a walk the trail row no longer opens a sheet of tiles: the map stays where it is, the walk actions step down and their place is taken by one trail with a tick. Swipe left or right to browse, the camera follows each route so you can see where it goes, the tick chooses it and everything swaps back. In the field you want the trail on the map you are walking, not on a small frame inside a card'],
      ['changed', 'The tile sheet stays for planning at home, from the place card, where a small frame next to length and time is exactly right'],
      ['changed', 'The memory menu moves a touch faster: entry 320 ms with a 28 ms cascade, exit 180 with 26'],
    ],
  },
  {
    version: '0.74.1',
    date: '2026-08-22',
    title: 'The memory menu in the right order, moving the way it was asked for',
    changes: [
      ['changed', 'Order carries the use case now. Nearest the thumb are the things you do most and that are memories: photo, note, voice. Above them, after a gap, two tools that are not memories: where the car is, and what plant this is. The plant sits farthest because it is an entirely different action'],
      ['changed', 'The pills enter from eighty pixels below with zero alpha, fast, cascading from the button upward, with a slight bounce that comes from the curve rather than an extra keyframe. They leave cascading from the top down, accelerating toward the plus'],
    ],
  },
  {
    version: '0.74.0',
    date: '2026-08-22',
    title: 'The assistant is gone, Points is back, and the memory menu moves properly',
    changes: [
      ['changed', 'The AI guide is removed, at Jarek request, and the Points button is back in its place in the walk bar. Plant identification stays: different service, different feature, and it works'],
      ['changed', 'What stayed in the repository, unused, in case it comes back in another shape: the ask route on the proxy, and a file of 2250 practical points from OpenStreetMap, 296 toilets with changing tables and fees, 1700 playgrounds, 152 ice cream places and 102 drinking fountains. Nothing imports it, so it does not weigh anything in the app'],
      ['fixed', 'The memory menu moves properly. It looked stepped because the whole overlay, blur layers and all, was faded through the parent opacity, which makes a phone recompute the blur every frame. The backdrop now fades on its own, the pills rise on a softer curve with a tighter cascade, and the exit no longer jerks upward before falling: that change of direction was the jump you could see'],
    ],
  },
  {
    version: '0.73.0',
    date: '2026-08-22',
    title: 'The guide stops deflecting, and the conversation looks like one',
    changes: [
      ['fixed', 'Asked where a playground is nearby, the guide sent you to a park and told you to look around your own street, while two playgrounds sat close by. Three causes, all ours: the context contained no playgrounds at all although the app has two hundred of them, the instruction told the model to keep returning to the selected place, and the proxy cut the context at 2400 characters while the guide sends up to 5800, so the end of it never arrived'],
      ['added', 'The guide now gets the eight nearest amenities measured from you, each with the park it belongs to, and it is told plainly what is missing: we only have playgrounds and places by parks, not the ordinary ones between blocks. So the answer is now two named playgrounds with distances plus an admission that something closer may exist that it does not know'],
      ['changed', 'The rules start with answer the question that was asked. A selected place is a reference point, not the boundary of the conversation'],
      ['added', 'The proxy tries several models in turn. The free Gemini allowance is counted per model and is small, and model names change faster than this app, so a used up quota or a renamed model no longer ends the feature. It steps down only on 429 and 404'],
      ['changed', 'The conversation is pills now: yours on the right in mint, the guide on the left in cool blue. Shape carries who said what, so no line needs a label. The sheet opens at nearly full height, because a chat on two thirds of the screen makes you scroll after the second sentence, and the input sticks to the bottom edge'],
    ],
  },
  {
    version: '0.72.0',
    date: '2026-08-22',
    title: 'The guide knows where you are, if you let it',
    changes: [
      ['fixed', 'Asking the phone for a position was buried inside the peek card, so a guide opened from the main screen knew nothing about where you stood. One function now does it, called by the peek, by the guide on every opening, and by a Share location button inside the conversation itself'],
      ['added', 'The guide gets the six nearest places from the whole app with distances, measured to the boundary rather than to the middle, because you enter a big valley from the side and the distance to its centre would lie by a kilometre. That is the answer to what is around me, a question that previously could not be asked because the context only knew the points of one selected place'],
      ['added', 'Without a position the guide says so plainly and offers one button, instead of pretending it knows. Tested from Ruczaj: it answered Park Macka i Doroty at 1.6 kilometres, Solvay at 2.1 and Zakrzowek at 2.4'],
    ],
  },
  {
    version: '0.71.0',
    date: '2026-08-22',
    title: 'Point the camera at a leaf',
    changes: [
      ['added', 'Check a plant is its own item in the plus menu during a walk, and it opens a full screen camera rather than the system one, so the whole thing happens in one window: live view, an iOS style shutter ring at the bottom, a cross to close in the corner'],
      ['added', 'One circle, three meanings, one place on the screen so a finger does not have to hunt: the white ring takes the photo, the same circle becomes a green tick that sends it, and while it waits it turns into a spinner'],
      ['added', 'The answer appears where you were already looking: name, confidence, family, how many identifications are left today and the two runner up guesses, on a dimmed and blurred panel so it reads over any photograph. Three ways out: take another, save it into the walk as a photo with the name as its caption, or close'],
      ['fixed', 'The fallback path had a dead end, found in testing: when the camera is refused we offer the system camera, but the notice stayed on screen together with a hidden shutter, so after taking the photo there was nothing to confirm with'],
    ],
  },
  {
    version: '0.70.0',
    date: '2026-08-22',
    title: 'A guide that walks with you, not a box at the end of a card',
    changes: [
      ['changed', 'The AI moved and became a guide. It used to be a text field at the end of a point card, which answers questions about the paragraph you just read; a guide walks with you instead. One conversation in the whole app with several ways in: next to Places on the main screen, a row in the place card by the weather, one tap from a point card, and in the walk bar where the point list used to be, because the list already opens by tapping the white card above it'],
      ['added', 'The guide knows four things: where you stand and the three nearest points with distances, how many points you have and how many to the stamp, the weather now and the best window today, and the content of this places points, with the full text of the one you asked about and its legend marked as a legend'],
      ['added', 'Four starter questions, because an empty field is the worst thing to hand someone standing outside with one free hand: what is most interesting here, will I make it before the rain, what is left for the stamp, what will interest a child'],
      ['changed', 'The conversation survives closing the sheet. In the field everything gets closed by reflex'],
    ],
  },
  {
    version: '0.69.0',
    date: '2026-08-22',
    title: 'Plants and questions are on',
    changes: [
      ['added', 'Plant identification works. Photograph something on a walk, tap the button in the photo card and three suggestions come back with a confidence each; tapping one writes it as the caption. Tested on the Jagiellonian Oak, which came back as Quercus robur at forty three percent with two other oaks behind it. Five hundred identifications a day, and the app says how many are left'],
      ['added', 'Asking about a point works. The model answers in Polish, in a few sentences, in its own dashed box that says the answer may be wrong while the rest of the card is checked'],
      ['changed', 'Both go through one proxy holding both keys, so neither key is ever in the app. The address lives in a single constant'],
    ],
  },
  {
    version: '0.68.0',
    date: '2026-08-22',
    title: 'Two buttons on the peek card, and start is the one on the right',
    changes: [
      ['changed', 'The peek card always offers both: details on the left, start the walk as the call to action on the right. Start used to appear only within three hundred metres of the place, so from home there was one button and no way to begin a walk before driving out. The walk card handles distance by itself: it says to the park and gives the number'],
    ],
  },
  {
    version: '0.67.1',
    date: '2026-08-22',
    title: 'The weather section breathes and lines up',
    changes: [
      ['changed', 'More room above, below and inside the weather section: wider hour columns, more space between them, a roomier window line. It was cramped'],
      ['fixed', 'The hour strip lines up with the rest of the card now. Two things were off: the bleed used a twenty pixel margin where the sheet uses twenty four, and snapping aligns a column to the edge of the scroll window rather than to the margin, so the current hour landed hard against the screen edge. Fixed with scroll-padding, which exists for exactly this'],
    ],
  },
  {
    version: '0.67.0',
    date: '2026-08-22',
    title: 'A place you can ask about, in a box that admits what it is',
    changes: [
      ['added', 'The point card ends with a question box. You type what the card did not answer and a model replies, with the card content as its context. Waiting for one address to be pasted in, like plant identification, and it goes through the same proxy, so the whole setup happens once'],
      ['added', 'The rules for the model live in the proxy, not in the page: answer in Polish in a few sentences, keep to the place, never invent dates or names, say you do not know, always call a legend a legend, refuse to judge whether a cave or a rock is safe and point at the markings on site. Kept server side because rules in a static page can be swapped by anyone holding the key'],
      ['changed', 'The box looks deliberately unlike the rest of the card: dashed border, cool background, and a line saying the answer comes from a language model and may be wrong while the rest of the card is checked. The app is built on never faking knowledge, so the one place where knowledge is uncertain has to be visible from a metre away'],
      ['added', 'A daily cap on the proxy side, sixty questions, plus a local counter showing how many you asked today. Google no longer publishes the free tier numbers and reports put Flash at around twenty requests a day, so the cap answers with a refusal rather than a bill'],
    ],
  },
  {
    version: '0.66.0',
    date: '2026-08-22',
    title: 'A walk keeps the spotlight on',
    changes: [
      ['changed', 'While a walk is running the map stays in focus mode by itself: the place you are walking keeps its imagery untouched with only its border drawn, everything else dims. It used to light up only after you selected a place, so starting a walk returned the map to all places equal, when for the whole walk exactly one of them matters. Selecting something by hand still wins, because then you asked for something else'],
    ],
  },
  {
    version: '0.65.1',
    date: '2026-08-22',
    title: 'A source that is not a link no longer takes the whole card down',
    changes: [
      ['fixed', 'The five new points in the valleys describe where their numbers come from instead of linking somewhere, and the card ran every source through new URL(), which throws on plain text and took the entire point card with it. Sources that are addresses still become links; the rest are printed as they are'],
    ],
  },
  {
    version: '0.65.0',
    date: '2026-08-22',
    title: 'One line that says when to go',
    changes: [
      ['added', 'The weather in a place card ends with an answer, not a forecast: the longest run of hours with less than thirty percent chance of rain, inside daylight, starting no earlier than now. Best between two and five, and then how warm it will be. When the whole rest of the day is dry it says so instead of inventing a window, and when it rains everywhere it says that too, names the least wet hours and tells you to take a coat, on a blue background rather than a mint one, because that sentence is not good news'],
      ['changed', 'After eight in the evening the line disappears. The window for a walk has closed and suggesting an hour would be pretending'],
    ],
  },
  {
    version: '0.64.0',
    date: '2026-08-22',
    title: 'Round is what you came for, square is what serves you',
    changes: [
      ['changed', 'Parkings, food and playgrounds are rounded squares now, quest points and everything you left behind stay circles. They used to differ from each other only by the shade of a dark disc, and on satellite imagery of a forest a shade only reads up close: from a distance everything was a dark circle. Shape reads instantly at any size, so it carries the important split and colour can fill in the rest'],
      ['changed', 'The icons on service pins are brighter, so their hue is visible on the tile rather than after zooming in'],
      ['changed', 'Size says how much something matters. A parking used to be the largest thing on the map, larger than the point you drove here for. Services stepped down; quest points did not move'],
      ['fixed', 'The walked track has a white halo under it. The track is dark olive and it simply disappeared on a forest: a dark line on a dark background. The colour stays, so it still cannot be confused with the lime trail, because a trail is a suggestion and a track is a record'],
    ],
  },
  {
    version: '0.63.0',
    date: '2026-08-22',
    title: 'Five more points in two valleys, all of them checked against the map first',
    changes: [
      ['added', 'Dolina Bedkowska: the Wielka Turnia group, a second climbing area in the upper valley with a forty five metre wall, fifty five routes and a five metre tunnel through the rock next to the path, which is the part a child comes back to three times'],
      ['added', 'Dolina Bedkowska: Jaskinia Labajowa, the cave two hundred metres from the ticketed one that has no ticket, no guide and no lights. Two caves side by side and two different ways of visiting: one teaches, the other lets you be afraid'],
      ['added', 'Dolina Bedkowska: the trout ponds in the lower valley, fish visible from the bank and a kitchen open nine to six. Trout need cold water with plenty of oxygen, so the farm is a certificate for the state of the stream'],
      ['added', 'Dolina Kobylanska: the wayside shrine, and next to it the rocks that climbers named Pillars by the shrine. Not Western Pillars, not Kobylany Pillars: by the shrine. The sport took its bearing from what was here first'],
      ['added', 'Dolina Kobylanska: Wielblad, Cycowka and Prawie K2, a point about how rocks get their names. Nobody gives them officially: whoever puts up the first route names it, and it sticks if others use it. There is also a Ponad Gnoj Turnia, and the name means exactly what you think'],
      ['changed', 'Every one of the five was found by asking OpenStreetMap what carries a name inside the boundary, not by remembering. The dating of the hillfort on Sokolica was already in the app, so no second point was added sixty metres away'],
    ],
  },
  {
    version: '0.62.0',
    date: '2026-08-22',
    title: 'Weather where the choice is made',
    changes: [
      ['added', 'Every row in the list of places carries the sky, the temperature and the chance of rain, the last one only when it passes fifty percent in the next six hours. Choosing between five valleys on a Sunday morning is a question about where it will not be raining at two, and it should be one glance, not five cards opened one after another. All fifty six places come from a single request, because Open-Meteo takes many coordinates at once, and the answer is kept for half an hour'],
      ['changed', 'The progress ring left the list rows. Same reason as in the peek card: the progress is already there in words, and an empty circle said nothing about the place. Degrees say something'],
      ['changed', 'The hour strip in the place card breathes: wider columns, more space between them and inside them. The rain percentage row is always there, even empty, because otherwise the columns had different heights and the strip lost its rhythm'],
    ],
  },
  {
    version: '0.61.0',
    date: '2026-08-22',
    title: 'Filters in the empty corner, a card you can fold, and the weather for the afternoon',
    changes: [
      ['added', 'Map filters in the top left corner, at the height of the menu. Trail, parkings, playgrounds, coffee and food, all on by default. Parkings means all of them, not just the suggested one, which is why the filters exist at all. They appear with a selected place and go away with it, but the settings are kept, so the next place opens the way you left the last one. During a walk they stay visible the whole time, because that is when you most want everything off the map except the trail'],
      ['added', 'Every parking now has its own page in the peek card, so a pin you can see has somewhere to introduce itself'],
      ['added', 'The walk card folds. Swipe down and the top of it goes away, leaving the bar with time, kilometres and points; the height follows your finger, so it reads as one thing shortening rather than two cards swapping. It stays folded after a reload, because a walk can outlive a refresh and the wish for more map does not change'],
      ['added', 'Weather in the place card, below the travel section: what it is now and how it changes hour by hour until evening. The strip starts at now, because the greyed out morning is the part you can no longer do anything about, and past hours stay reachable by scrolling left, because rain at nine means puddles at three. Open-Meteo, no key and no proxy needed, and the last forecast is kept for a valley with no signal, labelled with the hour it came from'],
      ['added', 'A stamp for Dolina Kobylanska'],
      ['added', 'Switch, a new component in the design system with its own catalogue card. Segmented picks one of several; a switch answers yes or no. The whole row is the target, because a 42 pixel slider alone is a miss on a phone'],
    ],
  },
  {
    version: '0.60.0',
    date: '2026-08-22',
    title: 'Trails you can choose, and a selected place finally shows what is inside it',
    changes: [
      ['added', 'Every place with enough ground now offers walking variants: a loop through all its points, a short loop of the three nearest ones, and any waymarked trail that really runs through it. Both kinds live side by side because both answer different questions. The computed ones come from the OpenStreetMap foot router, the waymarked ones from route relations clipped to the place boundary, and everything is stored, so it works in a valley with no signal'],
      ['added', 'The chooser looks like the parking list: every variant carries its own frame of satellite map with the route drawn on it, its length, its time and how many points it visits. The chosen one draws on the big map under your GPS track, in lime for a computed route and in the trail colour for a waymarked one, because in the field you look for a colour, not for a name'],
      ['changed', 'A waymarked trail is named by its colour, with the official name kept as the caption. Its length counts only the stretch inside the place: the Jurassic Strongholds Trail is tens of kilometres long, but through Dolina Bedkowska it runs 5.9 kilometres and that is the number worth knowing'],
      ['fixed', 'A selected place kept its white fill, so the thing you wanted to look at was covered by a veil. The filter compared the tile feature id, and a promoted id only works for feature state, so it never matched anything. Now the selected place shows the imagery untouched, keeps its border and everything else dims'],
      ['changed', 'Other places lose almost all their fill while one is selected. A neighbour glowing pale under the scrim read as dirt on the map, and a border line is enough to say it is there'],
      ['changed', 'Where two places share a boundary, that boundary is drawn thinner and dashed. Drawn from both polygons it read stronger than the outer edge, as if it cut the place in half. Shared stretches are found by distance, not by matching vertices, because Zakrzowek and Skalki Twardowskiego run together without sharing a single point'],
      ['changed', 'The peek card on the map leads with a photograph of the place instead of an empty progress ring. The progress was already there in words, and a circle said nothing about where you are going'],
      ['added', 'Plant identification from a photograph, waiting for one address to be pasted in. Google has no free API that names a species, so this goes to Pl@ntNet: 500 identifications a day at no cost, three guesses with a confidence each, and tapping one writes it as the photo caption. The key sits in a small proxy, never in the app, because the app is a public static page'],
    ],
  },
  {
    version: '0.59.0',
    date: '2026-08-22',
    title: 'Three intentions in a row, and the app finally tells you what it just loaded',
    changes: [
      ['added', 'The screen stays awake for the whole walk. On iOS a web app gets no location in the background at all: lock the screen or pocket the phone and JavaScript is suspended, so the track breaks. There is no way around that in a browser, only a way to stop the screen from going dark, which is what the Screen Wake Lock does. It costs battery and that is a deliberate trade: a walk with a hole in the track is worse than a walk with an hour less battery'],
      ['changed', 'The ground under the document is dark green instead of near white. If some screen geometry ever leaves a strip uncovered, a dark band under a dark map is far less wrong than a white one'],
      ['added', 'Refresh version in the profile now reports what happened: a green notice with the new number, or a plain one saying you already had the newest. The version you left is compared with the one that loaded, so the answer is a fact, not a guess'],
      ['changed', 'A place row has three separate things to tap: the map frame opens the approach at sixty percent of the screen, the row selects the place, and the arrow goes straight to navigation. They used to be one button with another button inside it, which is invalid HTML and unreliable on a phone'],
      ['added', 'Parkings carry a link to Google reviews and photographs, the same pill the cafes have'],
    ],
  },
  {
    version: '0.58.0',
    date: '2026-08-22',
    title: 'Every photograph looked at, twenty two of them thrown out',
    changes: [
      ['added', 'The line from a parking is a real walking route now, not a straight line. Computed once with the OpenStreetMap foot router and stored, so the app needs no network in the field, and the label says the walking distance and time. This answers the question that matters: whether you can actually get there. Some answers are alarming. Zakrzowek is 391 metres in a straight line and 1.6 kilometres on paths, twenty one minutes, because a flooded quarry has cliffs. Brandysowka is 148 metres straight and 500 on paths. Dolina Raclawki turns 700 metres into three kilometres and forty minutes'],
      ['changed', 'Every place row carries its own frame of the map now, not one shared sketch above the list: satellite tiles, the park boundary, the spot itself and a dashed line to the nearest edge of the park with the distance. The line is straight and says so, because a real walking route cannot be computed offline; that is what the navigation arrow is for'],
      ['fixed', 'All eighty five point photographs reviewed on contact sheets, one by one, and twenty two of them showed something else than the point. Name matching cannot catch this: a file titled Park Jordana can perfectly well show the pond instead of the monument, which is exactly what happened'],
      ['fixed', 'The Jordan monument and the alley of busts had each other photographs. Swapped'],
      ['fixed', 'Thrown out, with the reason recorded in the script: a propaganda poster for border posts, a decorative plate for a monument, a live musician for a guitar sculpture, an old postcard for a pond, a bar interior for the Krakow meridian, a bird on a twig for the biggest rock of a valley, St Adalbert from the Main Square for a church of the same name elsewhere, an information board for a spring, and a dragon shared by two different parks'],
      ['changed', 'A point with no photograph shows none. Better an honest gap than a picture of somewhere else, and the gaps are a list of things to shoot'],
    ],
  },
  {
    version: '0.57.0',
    date: '2026-08-22',
    title: 'One cell per place, a sketch above the list, and every sticker says what it is for',
    changes: [
      ['changed', 'The parking screen is rebuilt. Names were truncated in a narrow cell and the descriptions sat below the list as a separate block, so while reading a description you no longer knew which row it belonged to. Now each row carries the full name, the fee as a pill and its own two sentences, and a sketch above the list shows which parking is on which side'],
      ['added', 'The sketch is an SVG: the park outline, numbered dots matching the rows, and your position when we have it. Deliberately no tiles, because a second map context is a second reason to stutter, and this draws instantly and works offline. Tapping a row lights its dot; the arrow navigates. Two intentions, two taps'],
      ['changed', 'Cafes and playgrounds use the same pattern, with the OpenStreetMap features and opening hours as pills. One pattern for every list of places, because it is the same act: choosing where to go'],
      ['changed', 'A missing amenity no longer takes half the width of the screen to say it is missing. The tile appears only when there is something to show'],
      ['fixed', 'Pokaz na mapie from a sticker left the collection open on top, so the app flew to a park you could not see. It now closes every layer, not only the one you tapped from, and the same goes for the suggestion in the profile'],
      ['added', 'Stickers in the collection are tappable at last, and the card tells you what the sticker is for: the rule in words, how many points are missing, and, where a place asks for fewer points than it has, that the rest are trivia the sticker does not wait for'],
      ['added', 'Dolina Bedkowska has its sticker'],
      ['added', 'Place row joined the design system with a card in the catalogue'],
    ],
  },
  {
    version: '0.56.0',
    date: '2026-08-22',
    title: 'Small goals on a walk, a spotlight on one park, and the valley that earns the drive',
    changes: [
      ['added', 'The Punkty button on a walk opens the list of points, nearest first, collected ones last and quieter. Tapping one makes it your target: the walk card stops picking the nearest and shows the one you chose, with an arrow if the phone will give a compass. No arrow without one, because a guessed direction in the field is worse than none'],
      ['added', 'Choosing a park lights a spotlight: one polygon over the whole world with a hole exactly the shape of the park, so the dimming stops at its boundary and the satellite picture inside stays clean. The park loses its fill and gains the thickest line, because the boundary is all it has left. Other parks and their stickers dim with the map; everything belonging to the chosen park stays sharp'],
      ['added', 'Where the car is: one tap in the plus menu on a walk drops a car pin, and the points list opens with how far back it is. One car per walk, a new tap replaces the old spot. Not a memory, a practical note, which is why it lives with the other things you leave for yourself'],
      ['changed', 'The longer read is behind a toggle at the top of a point instead of a button at the end. At the end you learn there is more only after you have read everything; at the top you choose how you are reading right now, short in the field or the whole thing while planning. The choice is remembered'],
      ['added', 'Points can carry a longer read behind Czytaj dalej, and a legend in its own block and its own handwriting. Folklore never pretends to be fact'],
      ['added', 'Sokolica joined Dolina Bedkowska and it is the valley icon we were missing: a hundred metres above the valley floor, the highest climbing wall in Poland outside the Tatras, and on its summit the ramparts of a ninth-century stronghold. The rock itself was built by cyanobacteria and sponges on the floor of a Jurassic sea'],
      ['changed', 'Jaskinia Nietoperzowa got the long version it deserves: over a kilometre of passages, a travertine waterfall inside that matches the one outside, sediment mined as fertiliser in the 1870s that destroyed the original deposits and turned up four thousand cave bear canines, and a mammoth hunters camp from forty thousand years ago'],
      ['fixed', 'Two rock names in Dolina Bedkowska could not be verified anywhere, so they are gone. In their place the real neighbours of Dupa Slonia from OpenStreetMap: Dupeczka, Babka, Czarcia Gran, Czarcie Wrota, Hades and Forteca'],
      ['fixed', 'Parks on the map are stronger at a distance: a 2.2 point boundary instead of 1.6 and a 36 percent fill instead of 28 on satellite'],
    ],
  },
  {
    version: '0.55.0',
    date: '2026-08-21',
    title: 'Nineteen stickers, and the meadow that turned out to have a story',
    changes: [
      ['added', 'Nineteen park stickers imported: nine places that had none (Aleksandry, Bednarskiego, Decjusza, Duchacki, Grzegorzecki, Jalu Kurka, Jerzmanowskich, Panienskie Skaly, Blonia Skawinskie) and ten redrawn. They ship as 1.5 MB instead of 20 MB: flat illustration quantised to 128 colours costs nothing you can see at sticker size'],
      ['added', 'Blonia Skawinskie has a quest at last, and it is the first one with a point that is pure trivia. The stamp asks for two of three, so the Partner Cities station is genuinely optional: seven towns with dates, a tree by each plaque, unveiled on the meadow in May 2014 for the 650th anniversary of the town charter'],
      ['added', 'Park Energii on the same meadow: eight pieces of equipment, a zipline and a climbing wall, paid for by the CEZ Skawina power plant in 2015. The question underneath is whether a town should take playground money from its largest emitter'],
      ['added', 'A brine tower joined the town park in Skawina as its optional fourth point. Opened April 2026 by the old riverbed, 485 thousand zloty, half of it regional money, in a town the WHO ranked twelfth most polluted in the EU in 2016. Symptom or cause is a fair question'],
      ['added', 'Blonia Skawinskie has a photograph of itself at last: the recreational path with rollerbladers and the outdoor gym, from dobrefotografie.pl. Not a free licence, so it carries its credit and is marked in the data as one to swap for your own'],
      ['fixed', 'The oxbow point stood on the live river. An oxbow is a bent crescent, so the centre of its outline in OpenStreetMap fell on the working channel, 17 metres from the river and 51 from the right water. It sits on the northern bank now, 6 metres from the old water and 27 from the new, which is the spot where you see both channels at once'],
      ['fixed', 'Tapping a quest point left the cafe or playground card sitting at the bottom, so the card described one place while the map highlighted another. One selection at a time now: choosing anything else drops the card'],
      ['added', 'Two more points carry a photograph: the Park Energii playground on the meadow, and the footbridge over the old Skawinka in the town park. Commons has nothing at all for the oak, the brine tower, the partner cities station or the meadow oxbow, so those wait for your own camera'],
      ['fixed', 'The veil under a sheet title works the way it would in Figma: taller than the bar, white holding to 30 percent of the height and then easing to nothing, with the blur stepping down from 60 to 3 exactly where the veil reaches zero. The blur cannot be faded with a mask because this engine does not clip a backdrop filter by its mask, verified with a hard-edged mask the blur ignored, so the progression is four layers of shrinking height instead'],
      ['fixed', 'The header and the bottom bar showed a visible edge where their veil ended, because opacity stayed full for most of the height and then fell in one step. Both fade across their whole height in several steps instead, and the blur bands taper the same way'],
      ['changed', 'Food and playground pins joined the map language: dark disc, white ring, light mark, amber for food and magenta for playgrounds. The pastel fills from the cards turned into white specks on satellite imagery'],
      ['fixed', 'Blonia Skawinskie led with a photograph of the Kazimierz Wielki monument, which stands by the Sokol hall in the town park, not on the meadow. The photograph went back to its own park. Commons has no picture of the meadow at all, so the first real one will be yours'],
    ],
  },
  {
    version: '0.54.0',
    date: '2026-08-21',
    title: 'What kind of place is this, and a title that stopped sitting on the photograph',
    changes: [
      ['added', 'Cafes and playgrounds say what they are. Pulled from OpenStreetMap and translated into two or three words you can read at a glance: woodchips, fenced, pizza, garden seating, step-free. Opening hours come in Polish, so "Mo-Su 12:00-23:30" reads as "codziennie 12-23:30"'],
      ['added', 'A place card carries two links out: photographs and reviews in Google Maps, and the venue website when OpenStreetMap knows it. We do not host those photographs. Places API needs a billed key, which in a static app is a public key, and the licence forbids keeping copies'],
      ['added', 'Photo slider in the design system: one photograph fills the container width, rounded, and the strip snaps to the next. Credit and dots below the frame'],
      ['changed', 'A park detail card puts its name above the photographs instead of on them. The name needed a scrim that swallowed the top of every picture, and it still fought with the grass. Below the name comes the slider, then the rest'],
      ['fixed', 'The place card looked crooked because its paragraphs carried default browser margins: 16 points above the name, 12 below the caption, so a two-line block measured 84 points and the icons floated in the middle of nothing'],
      ['fixed', 'A list row put its caption and its hours side by side, so the text squeezed into a ragged column. The caption keeps one line now and the hours take their own'],
      ['fixed', 'Photo credits fit one line. Author and licence stay, which is what the licence asks for; the platform name went, which is what wrapped every caption'],
      ['fixed', 'The two amenity tiles align their chevrons at the bottom, so a two-line title no longer pushes one lower than the other'],
      ['changed', 'The three memory pills fall the way they rise: they lift a little before they drop, in the same cascade'],
      ['changed', 'Photographs in a park card are shorter, 16 by 9, and carry no caption of their own. Attribution stays, collected into one line at the end of the card, which is what the licence asks for'],
      ['changed', 'The stamp took the place of the 0 of 3 ring, because the two said the same thing twice. Grey until you earn it, full colour with the point count in its corner once you do: mint for a stamp with points still owed, gold for the full set'],
      ['changed', 'Start wyprawy sits in a bar stuck to the bottom of the card, one decision per card. Checking in and taking a photograph stay in the body as second-rank actions'],
      ['changed', 'Both bars are glass now, not plates: a gradient and three bands of blur instead of a solid fill with a hairline. The sheet title gets the same treatment, so content slides under it softly'],
      ['fixed', 'The action bar landed below the screen on a half-open sheet, because the panel is taller than the view and pushed down. The sheet now reports how far it hangs and the bar sits on the bottom of what you can see'],
      ['fixed', 'Park Jordana and the town park in Skawina led with a photograph of one of their own points, so the top of the card told you nothing about the place. Both have a park photograph now'],
      ['added', 'Park Jordana and the town park in Skawina finally have their own text. Jordana is the park every Polish playground is named after: Doctor Jordan built it in 1889 for running about, not strolling, and Sanok, Jaroslaw, Lwow, Nowy Sacz, Tarnopol and Warsaw copied it. Skawina is two and a half hectares in the middle of town, an oak older than the park itself, and the 1906 Sokol hall closing it from the north'],
      ['fixed', 'Park Bednarskiego had two squirrels in its gallery. Wikimedia keeps a whole category of squirrels photographed there. The park itself replaced them: the quarry bowl and the pavilion above the meadow'],
    ],
  },
  {
    version: '0.53.0',
    date: '2026-08-21',
    title: 'One thing at the bottom, and better photographs of two places',
    changes: [
      ['fixed', 'Park Bednarskiego showed a squirrel, which says nothing about the park. It shows the park now. Worth saying plainly: Wikimedia Commons has no photograph of its quarry walls at all, so the alley is the best that exists'],
      ['fixed', 'Dolina Eliaszowki led with a close-up of a signpost. It leads with the spring of Saint Elias instead'],
      ['changed', 'A tapped cafe, playground or parking no longer stacks its card under the walk card. It takes its place, same shape and same spot, and closing it brings the walk back. The two actions are icons now, because two words ate width that a 375 point screen does not have'],
      ['changed', 'The map style and locate buttons moved under the menu, 44 points below it, out of the way of everything at the bottom'],
      ['changed', 'The plus springs when pressed and turns into a cross rather than swapping icons. The three memory pills hug their labels, sit closer together, and are far more glass than paint'],
      ['changed', 'The floor under the three buttons is darker and carries a little progressive blur, so white labels hold on bright grass'],
    ],
  },
  {
    version: '0.52.0',
    date: '2026-08-21',
    title: 'Inter, and one card that says everything',
    changes: [
      ['changed', 'The text face is Inter instead of Manrope. Bricolage Grotesque still carries the headlines'],
      ['changed', 'The walk card now says the whole thing: what comes next, then under a hairline how long you have been walking, how far, and how many points you have. The pill at the top is gone, so a walk speaks from one place instead of two'],
      ['changed', 'The card breathes wider: 24 points of margin left and right instead of 16'],
      ['changed', 'The map layer and locate buttons stopped competing with the content. Dark glass instead of white tiles with a shadow, smaller, and they let the map through'],
      ['fixed', 'The map attribution sat under the Punkty label during a walk. It moves up while one is running'],
    ],
  },
  {
    version: '0.51.1',
    date: '2026-08-21',
    title: 'The walking HUD, gone over detail by detail',
    changes: [
      ['fixed', 'The three labels under the buttons sat at different heights, because the bigger middle button pushed its own label down. The buttons now share a baseline and the lime one rises above it'],
      ['fixed', 'The layers and locate buttons still overlapped the card, hiding the distance. They now sit above the whole HUD'],
      ['changed', 'The card is a button: touching it opens what it is talking about, the story of the next point when close and the place when far. It used to be the only tile on screen that looked tappable and did nothing'],
      ['changed', 'Press states everywhere: buttons sink and their glass brightens for a moment, the card sinks and tints, the lime one flares its ring. The lime ring also breathes slowly while a walk is running'],
      ['changed', 'The distance carries two weights, a bold number and a muted unit, the dashes are inset from the card edge and thicker with rounded ends, and the menu pills are fully oval'],
    ],
  },
  {
    version: '0.51.0',
    date: '2026-08-21',
    title: 'One HUD for a walk, down where the thumb is',
    changes: [
      ['changed', 'A walk used to speak from two places at once: the top card carried the name, the points and the next stop while the bottom bar carried the time and the distance. The top card is gone. What is left up there is a small mono pill with the time and the kilometres, clear of the menu it used to slide under'],
      ['changed', 'The bottom is one HUD: a card saying what comes next, with the progress as one dash per point, and three round buttons under it. The side ones are dark glass over the map rather than white discs, the middle one is lime and adds a memory'],
      ['changed', 'Far from a park the card stops naming a point you cannot reach and gives the way to the park instead. No compass and no rotating arrow: that would mean asking for the gyroscope and pretending to be a navigation app'],
      ['changed', 'The plus opens over the map now, not above it: three glass pills on a progressive blur with a darkened gradient, and a white round close underneath'],
    ],
  },
  {
    version: '0.50.0',
    date: '2026-08-21',
    title: 'Photographs on the points, boxes for the practical things',
    changes: [
      ['added', 'Sixty three points got a photograph from Wikimedia Commons, with the author and licence in the data. Points without one fell from 117 to 54, and the rest carry names we invented, which Commons does not have'],
      ['changed', 'The place card reordered: description, then the points, then the practical pair. Playground and food are two boxes side by side with a short status and a quiet chevron, instead of two rows of prose'],
      ['changed', 'Map pins speak one language now. The start screen wears the same dark disc, white ring and lime mark as a replay, so the same route no longer looks like two different apps. Parking says it in blue, same shape'],
      ['fixed', 'A pin size expression with zoom nested inside a multiplication silently killed the whole symbol layer: cafe and playground pins were rings with nothing in them'],
      ['fixed', 'Three places where Polish grammar counted wrong: 3 punktów, 6 miejsca, quest: 3 punktów'],
    ],
  },
  {
    version: '0.49.0',
    date: '2026-08-21',
    title: 'A list you can decide from, and a menu',
    changes: [
      ['changed', 'The places list sorts by how far it is from you instead of by the alphabet, groups into started, untouched and stamped, and carries a photograph of each place. Hectares are gone; the playground and coffee icons stay'],
      ['changed', 'Tapping a cafe or a playground now selects that one place: the map centres on it, the pin grows and gets a ring, and a card names it. It used to open a list and send you to Google'],
      ['changed', 'The profile icon at the top is a menu. Everything that used to be buried inside the profile now sits on one level, and the profile is one entry among them'],
    ],
  },
  {
    version: '0.48.1',
    date: '2026-08-21',
    title: 'Every point checked against the map',
    changes: [
      ['fixed', 'Two more points were in the wrong place. The Matejko monument was 459 metres from the monument, in the western Planty, while our own description said it stands between the Barbakan and the Florian Gate. Bukowe Skaly in Dolina Szklarki was 70 metres out'],
      ['changed', 'The Skawina oxbow moved a second time. My first correction was a guess at the park boundary nearest the water, and it was 102 metres from the oxbow the map actually knows by name'],
      ['added', 'The audit now checks all 136 points against OpenStreetMap by name inside each park. Seventy seven have a match and seventy six of them agree to within nine metres. The rest carry names we invented, so this method cannot judge them'],
    ],
  },
  {
    version: '0.48.0',
    date: '2026-08-21',
    title: 'Wrong pins moved to where the things actually are',
    changes: [
      ['fixed', 'Four points stood in the wrong place. The bathing pontoons at Zakrzowek were 760 metres north of the water, and in the Skawina park the old oak was out by 205 metres, the monument by 165 and the oxbow by 276. All four now sit on the object OpenStreetMap has'],
      ['added', 'A coordinate audit script. Without a network it lists the points typed by hand, which give themselves away by having three or four decimal places where anything taken from a map has five or six: 22 of 136 points. With a network it compares every point against the matching object in OSM'],
      ['changed', 'The valleys lost their public transport box. There is no city transport out there and the agglomeration line numbers were a guess, so each valley has a real parking from OSM instead, with the distance to the valley floor'],
    ],
  },
  {
    version: '0.47.0',
    date: '2026-08-21',
    title: 'All the valleys, and photographs of them',
    changes: [
      ['added', 'Four more valleys: Bedkowska with the highest waterfall in the Jura and its largest cave, Raclawki with a numbered nature trail across 474 hectares, Eliaszowki where the Carmelites named the springs after saints, and Szklarki with its tors. Seven valleys, 32 points'],
      ['added', 'Photographs. Every valley has a hero picture and seven points carry their own, all from Wikimedia Commons with the author and licence in the data. One arrived from a weir in a different region entirely and was thrown out'],
      ['changed', 'Szklarki asks for two points out of three, because only three things in it are catalogued by name'],
    ],
  },
  {
    version: '0.46.0',
    date: '2026-08-21',
    title: 'Dolinki Krakowskie, three of them',
    changes: [
      ['added', 'Three valleys outside the city: Dolina Kluczwody, Dolina Bolechowicka and Dolina Kobylanska, 14 to 16 km from the Main Square. Fifteen points between them, from the Brama Bolechowicka rock gate and a two-step waterfall to reconstructed partition border posts and a cholera cemetery'],
      ['added', 'The list of places has tabs: everything, the valleys, the city. A forty minute park and a half day trip are not the same outing'],
      ['added', 'A place can now ask for fewer points than it has. Each valley gives its stamp at three of five and keeps the rest as a reason to come back'],
      ['changed', 'Dodaj notatke on a walk card is Dodaj podsumowanie, because the note you write at home and the note you drop on the route are two different things'],
    ],
  },
  {
    version: '0.45.1',
    date: '2026-08-21',
    title: 'Walking the route again is a bar, not a row',
    changes: [
      ['changed', 'Przejdz te trase jeszcze raz left the scrolling card and took the bottom edge of the screen: a bar on its own glass, with a gradient the card dissolves into and the same three-band progressive blur the replay uses'],
    ],
  },
  {
    version: '0.45.0',
    date: '2026-08-21',
    title: 'Less on the walk card, one meaning for a stamp',
    changes: [
      ['changed', 'The walk card lost three of its five counters. Points, photos and notes were all listed a few centimetres further down the same screen, so only the time and the distance stayed'],
      ['changed', 'The empty note field no longer sits on every walk. There is a quiet Dodaj notatke instead, and the field appears when there is something to say'],
      ['changed', 'Photos, notes and recordings share one section, Co zostalo po drodze, in the order they happened. A photo and a voice note are the same kind of thing: something you stopped for'],
      ['fixed', 'A stamp meant two different things. The profile handed one out for showing up, while the ceremony after a walk only gave it for finishing a place. Now there is one rule, and a place may ask for fewer than all of its points, which is what a valley in the Jura will need'],
    ],
  },
  {
    version: '0.44.0',
    date: '2026-08-21',
    title: 'The percentage is gone',
    changes: [
      ['changed', 'No more percentage of Krakow. The ring and the number left the corner of the map, and the big number left the profile. A percentage of a city is a number, not a reason to go outside, and nothing was put in its place on purpose. The board of squares in the profile stays, because that one is a picture rather than a score'],
    ],
  },
  {
    version: '0.43.0',
    date: '2026-08-21',
    title: 'Three maps: the photograph, the drawing, the model',
    changes: [
      ['changed', 'The walking screen keeps three maps and nothing else. Satelita, which it now opens on, Minimal, our grey drawing, and Rzezba terenu, the photograph standing up on raised ground, always seen from an angle. Domyslny, Klasyczna, Zywa, Ciemna, Topograficzna and National Geographic are gone, and anything saved from them lands on the photograph'],
      ['added', 'Rzezba terenu carries the same name here as in a replay because it is the same thing: real elevation pushed a little, the city extruded, the camera held at an angle. It is the expensive one by nature, which is why it is a choice rather than the default'],
      ['fixed', 'Terrain written into a style comes out blank when that style is swapped in, and only works when the map is built with it. The raised map now gets its ground once the style can take it, which is why it draws at all'],
    ],
  },
  {
    version: '0.42.1',
    date: '2026-08-21',
    title: 'Changing the map is instant again',
    changes: [
      ['fixed', 'Changing the base map dragged the whole app down. Rebuilding what Parkove draws on top only checked whether it had already run two awaits later, so every styledata event during a style load, and there are many, started its own full rebuild in parallel. Drawing the pin artwork alone is 318 ms of canvas work, times all of those, on the phone that follows your walk'],
      ['fixed', 'The parks, pins and walk used to come back only once every tile in view had loaded. They are back in about 150 ms now, measured across the imagery, the dark style and the topographic one'],
      ['changed', 'Pin artwork is drawn once and kept until the theme changes, and stamp pictures are fetched once, misses included, instead of going back to the network on every change of map'],
    ],
  },
  {
    version: '0.42.0',
    date: '2026-08-21',
    title: 'The start screen gets its speed back',
    changes: [
      ['changed', 'Widok 3D is gone from the start screen. On a map that runs all day and follows a GPS fix it cost three things at once: elevation tiles, a second set of vector tiles for the buildings, and a perspective recomputed every frame. A replay can afford that for a few minutes, the map you walk with cannot'],
      ['changed', 'Eight bases stay in the picker, and 3D stays where it earns its keep: in a replay, where Rzezba terenu raises the ground three times over'],
    ],
  },
  {
    version: '0.41.1',
    date: '2026-08-21',
    title: 'Relief means the photograph on raised ground',
    changes: [
      ['changed', 'Rzezba terenu is the satellite picture draped over ground at three times its height, and its night twin is the same picture graded cold. The topographic drawing stays available as a base on the start screen'],
      ['fixed', 'Switching a look left the walk without its route, marker and pins for ten seconds or more. The route was waiting for every last tile in view, when all it needed was the style itself'],
    ],
  },
  {
    version: '0.41.0',
    date: '2026-08-21',
    title: 'Three looks, a blue walker, and a memory that closes properly',
    changes: [
      ['changed', 'A replay offers three looks now and nothing else: Rzezba terenu, which it opens on, the same relief graded for night, and Grafit 3D. The imagery, the sepia and the rest are gone from here'],
      ['changed', 'The walker is the classic blue puck with a white ring. In green it read as one more stop on the route'],
      ['changed', 'The camera holds the walker higher up the screen, so a photo or a note arriving from below no longer lands on top of it'],
      ['changed', 'The dial and the time above it sit 24 points lower'],
      ['fixed', 'Closing a photo, note or recording opened during a replay used to close the replay with it and drop you on the walk screen. Both close buttons live in the same corner, so one tap could reach the second one as the first disappeared'],
      ['fixed', 'Two memories saved in the same millisecond shared an id, and then one of them could never be edited or deleted'],
      ['fixed', 'No more Notatka label above a note in the viewer'],
    ],
  },
  {
    version: '0.40.0',
    date: '2026-08-21',
    title: 'Pick a map from the map, and stand it up in 3D',
    changes: [
      ['added', 'The look of the map is now switched from the map itself, from a button above the locate one, so two basemaps can be compared where it matters instead of from inside a settings screen'],
      ['added', 'Two more bases: Topograficzna, which is a real topographic map with contour lines and paths, and National Geographic, which is a painting'],
      ['added', 'Widok 3D is a switch rather than a style: raised ground, shading, extruded buildings and a camera that stays tilted, laid over whichever base is showing, imagery or drawing alike. It survives changing the base and it is remembered'],
      ['changed', 'A replay now opens on the topographic look with the ground pushed to three times its height, because a map of the ground may as well be a model of it'],
      ['fixed', 'Tapping a park still works with the ground raised'],
    ],
  },
  {
    version: '0.39.0',
    date: '2026-08-20',
    title: 'Four more ways to look at a walk',
    changes: [
      ['added', 'Rzezba terenu: the ground is really raised now, from free elevation tiles, and lit from the side. Piltza is flat so it barely shows there; on Kopiec Krakusa, Zakrzowek or the river valley it does'],
      ['added', 'Czarno-biala and Sepia: the imagery graded like film, so nothing on screen is green except your walk'],
      ['added', 'Mieta 3D: the whole city painted in the colours of the app, buildings included'],
      ['changed', 'Photos that pop up during a replay are a quarter smaller, so they sit on the map instead of covering it'],
      ['changed', 'The tinted inserts went back to grey'],
      ['fixed', 'A heavy look could arrive without the route, the marker and the pins: the map is now checked once more the moment it settles'],
      ['fixed', 'The white band above the home indicator, again: the screen is measured rather than asked for, every layer is pinned to both edges, and the document behind a dark screen is dark too'],
      ['fixed', 'No more scrollbar sliding in over the app while a panel scrolls'],
    ],
  },
  {
    version: '0.38.0',
    date: '2026-08-20',
    title: 'Ticks that dissolve, and a screen that ends where the screen ends',
    changes: [
      ['changed', 'Tinted inserts are back: the question a place asks and the stat cards sit on a whisper of lime instead of grey'],
      ['fixed', 'The dial ticks now really dissolve towards the arc. The fade is drawn inside the dial itself, around the same centre the ticks radiate from, instead of a mask that guessed its radius from the corner of the box'],
      ['fixed', 'Every full screen layer is now as tall as the physical screen, not as tall as the viewport the browser admits to, which is what kept leaving a white band above the home indicator'],
      ['fixed', 'Grafit 3D lost the route, the marker and the pins: one failed repaint used to lock the map out of ever drawing them again'],
      ['fixed', 'Closing a memory opened from a replay no longer drops you two screens back'],
    ],
  },
  {
    version: '0.37.0',
    date: '2026-08-20',
    title: 'A voice note on nothing but blur',
    changes: [
      ['changed', 'A voice note full screen lost its panel: the wave sits in the middle of the blurred backdrop, the play button underneath it and the caption below that, all centred'],
      ['changed', 'The photo carousel in the profile no longer fades its edges, and its prints came down a little'],
      ['fixed', 'The stacked wave had no height: in a column the flex grow was eating it'],
    ],
  },
  {
    version: '0.36.1',
    date: '2026-08-20',
    title: 'Prints a touch smaller',
    changes: [
      ['changed', 'Polaroids in the profile carousel and in the deck of a walk came down a little; the one that arrives during a replay keeps its size'],
    ],
  },
  {
    version: '0.36.0',
    date: '2026-08-20',
    title: 'A deck you push through',
    changes: [
      ['changed', 'Swiping the photos of a walk now behaves like a real deck: whichever print reaches the middle comes to the front, straightens up and grows by five percent, while the ones leaving lean back into the pile'],
    ],
  },
  {
    version: '0.35.0',
    date: '2026-08-20',
    title: 'Fading ticks and a proper player everywhere',
    changes: [
      ['changed', 'The dial ticks are longer, thinner and denser, and they fade away along their own length as well as at the ends: they dissolve into the arc instead of stopping at it'],
      ['changed', 'Every voice note now uses our own player, waveform and all. The bare system control that showed up in the full screen viewer and in the walk sheet is gone'],
      ['changed', 'The walk card gives its title twenty more points of room below the white edge'],
    ],
  },
  {
    version: '0.34.0',
    date: '2026-08-20',
    title: 'Open a memory, and no more white strip',
    changes: [
      ['added', 'A memory in a replay can be tapped: photos, recordings and notes open full screen and can be swiped through, and a point opens its whole story. The walk stops while you read'],
      ['fixed', 'The white band at the bottom of the installed app is gone. The map now runs past the bottom edge, under the home indicator, instead of stopping at it and letting the white page show through'],
    ],
  },
  {
    version: '0.33.1',
    date: '2026-08-20',
    title: 'Bigger prints',
    changes: [
      ['changed', 'Polaroids are about a third larger and a little rounder, both in the deck and when one arrives during a replay'],
    ],
  },
  {
    version: '0.33.0',
    date: '2026-08-20',
    title: 'Three ways to see a walk',
    changes: [
      ['added', 'A button top right of a replay changes how the ground looks: Satelita as it is, Noc where the imagery is graded cooler and darker like film, and Grafit 3D which drops the photos and paints the city from our own palette with the buildings still standing up'],
      ['changed', 'The memory no longer announces itself with a heading: a photo is a photo, a note is a note'],
      ['fixed', 'Map credits moved under the darkness at the bottom, out of the picture'],
      ['fixed', 'Switching the look used to lose the route, the marker and the pins: several repaints raced each other, and now only one runs'],
    ],
  },
  {
    version: '0.32.1',
    date: '2026-08-20',
    title: 'Yellow paper, smaller hand',
    changes: [
      ['changed', 'A sticky note is canary yellow now, and a long note writes itself smaller instead of growing the paper'],
      ['changed', 'The walk clock reads at the size of its own label, in white: a readout rather than a headline'],
    ],
  },
  {
    version: '0.32.0',
    date: '2026-08-20',
    title: 'Tap a pin, walk there',
    changes: [
      ['added', 'Pins in a replay are tappable: the walker sets off, covers the ground and lands softly at that place, then the memory speaks. The dial lets go while it travels, and touching the dial cancels the trip'],
      ['changed', 'A note is a sticky note again: rounded paper in a marker hand, dropped slightly crooked, arriving like something being put down'],
      ['changed', 'Pins in a replay wear a white edge with a slightly smaller mark inside, and the blur under the memory is lighter'],
    ],
  },
  {
    version: '0.31.1',
    date: '2026-08-20',
    title: 'A little more darkness',
    changes: [
      ['changed', 'The shadow under a replay reaches higher and lets go more slowly, so the map fades into it instead of meeting an edge'],
    ],
  },
  {
    version: '0.31.0',
    date: '2026-08-20',
    title: 'Pause, and the handle springs home',
    changes: [
      ['added', 'A pause button under the arc. It brings the handle back to the middle with a spring rather than a jump, overshooting the centre by a hair before it settles'],
      ['changed', 'The hour a memory was left and the speed multiplier are gone from the replay: the walk clock is enough'],
    ],
  },
  {
    version: '0.30.2',
    date: '2026-08-20',
    title: 'Centred, and one family of greens',
    changes: [
      ['changed', 'Everything under a replay is centred now, and the walk clock reads as one line: the number, then its label'],
      ['changed', 'The dial ticks fade twice over: out to both ends, and inwards towards the centre of the circle, so each tick is brightest at its outer tip'],
      ['changed', 'Pins, the marker and the dial handle share three colours with the walked line, so they read as one family instead of three'],
    ],
  },
  {
    version: '0.30.1',
    date: '2026-08-20',
    title: 'Pins and ticks, to the reference',
    changes: [
      ['changed', 'Pins in a replay have their own look: a dark green disc with a lime edge and a lime mark inside, photos as a circle in a white ring, and the walked line in a brighter green'],
      ['changed', 'The dial ticks are thin and fade out at both ends under a shadow, the way a real dial reads. The handle keeps its own light, with four white dots'],
      ['changed', 'The walk clock is half the size again, so the map keeps the attention'],
    ],
  },
  {
    version: '0.30.0',
    date: '2026-08-20',
    title: 'The dial, drawn properly',
    changes: [
      ['changed', 'The throttle became an arc of rounded ticks across the bottom of the screen, dragged sideways, with the ticks lighting up in lime behind the handle. The handle is a dark green pill with a lime edge and four dots, riding the arc and tilting with it'],
      ['changed', 'Speed no longer snaps: asking for a faster walk spins it up over about half a second, and letting go lets it coast down. The number next to the clock shows it building'],
      ['changed', 'The bottom of the replay reads in one column now: the memory, then the walk clock right aligned in mono, then the dial'],
      ['changed', 'The top of a replay is just the way out. The title, the gradient and the blur under it are gone, so nothing sits between you and the ground'],
      ['fixed', 'A drag that could not capture the pointer used to die silently; sheets and the dial now carry on without it'],
    ],
  },
  {
    version: '0.29.1',
    date: '2026-08-20',
    title: 'The clock reads like an instrument',
    changes: [
      ['changed', 'The walk clock in a replay sits above the darkness now, half the size, set in JetBrains Mono, with the map credits moved out of its way'],
      ['changed', 'No more "end of route" line: the label under the clock only says what the throttle is doing'],
    ],
  },
  {
    version: '0.29.0',
    date: '2026-08-20',
    title: 'Arriving somewhere feels like arriving',
    changes: [
      ['added', 'A replay now slows down as it comes up to something you left behind, and stands still for a beat when it lands. A voice note starts playing by itself: you walked up to it, so it speaks'],
      ['changed', 'Memories have no close button any more. There is always one on screen, and it changes when you reach the next'],
      ['changed', 'The darkness under a memory goes deeper and higher, with the same progressive blur as the header, so the map dissolves into it instead of being covered'],
      ['changed', 'The camera rides higher on the screen, above the darkness, and a written note is a rounded sticky note lying a little crooked'],
    ],
  },
  {
    version: '0.28.0',
    date: '2026-08-20',
    title: 'Squircles, and memories without a frame',
    changes: [
      ['changed', 'Buttons and controls left the pill behind: they are 16 px rounded squares with iOS style corner smoothing, and so are the cards on the profile and in the walks'],
      ['changed', 'A memory during a replay has no card any more. It arrives on a soft darkness at the bottom of the screen: a small label, a photo dropped like a polaroid, or your own words in your own hand'],
      ['changed', 'The header of a replay floats on a progressive blur, four bands deep, with a gentle gradient under it'],
      ['added', 'Voice notes are drawn as their own waveform, read from the recording itself, filling in with lime as it plays. While recording, the bars move with your voice next to a big clock'],
    ],
  },
  {
    version: '0.27.0',
    date: '2026-08-20',
    title: 'White paper, deep green, one lime',
    changes: [
      ['changed', 'The palette moved to white paper with truly neutral greys: a tinted grey reads as dirt next to white, so the tint is gone'],
      ['changed', 'Green went deep, almost black, and lime arrived as the one loud voice: it writes on the dark green fills, never on white'],
      ['changed', 'Gold now belongs to the collection alone, so notes are written on paper and voice pins wear the deep green with a lime microphone'],
    ],
  },
  {
    version: '0.26.0',
    date: '2026-08-20',
    title: 'The walk card behaves like a card',
    changes: [
      ['fixed', 'Opening a walk now frames the whole route in the part of the map you can actually see, above the card'],
      ['fixed', 'Pulling the card down no longer throws you back to the start. It settles at its smallest size, showing the name and the button that replays the walk'],
      ['changed', 'That card lost its grabber: it belongs to the screen, so it should not look like something you can dismiss. The rename control became a proper icon button, the same size as every other one'],
      ['changed', 'Photos of a walk lie in a deck now: overlapping, each a little crooked, and touching one straightens it and lifts it out of the pile. Their shadows have room instead of being cut off'],
      ['fixed', 'A point opened from a walk came out dimmed and shifted, because it inherited the dimming of the screen underneath. Screens are now mounted at the top of the page, so nothing tints them'],
    ],
  },
  {
    version: '0.25.0',
    date: '2026-08-20',
    title: 'Full height, and one size for rows',
    changes: [
      ['fixed', 'The app no longer slides under a strip at the bottom. It was measured against the largest possible viewport instead of the visible one, which turned the whole app into a scrolling page and cut the content off. Screens now fill exactly the height you can see'],
      ['changed', 'A sheet keeps its actions in a bar stuck to the bottom: one wide button and the dangerous things beside it. Moving a pin became a small button under the title, where it belongs'],
      ['fixed', 'List rows had two different title sizes depending on whether they carried a sentence. One size everywhere now'],
      ['added', 'DS: ActionBar, the sticky row of actions, with its own page in the catalog'],
    ],
  },
  {
    version: '0.24.0',
    date: '2026-08-20',
    title: 'Screens that move like a phone',
    changes: [
      ['changed', 'Screens now arrive the way phones do it. Something presented over your work rises from the bottom: the profile, the walk summary, a screening. Going a level deeper slides in from the right: a stamp, a walk, a point, the settings'],
      ['changed', 'While a screen is pushed on top, the one below slides aside and dims a little, so back has somewhere to go back to'],
      ['changed', 'All of it on one curve, the one iOS uses for sheets: quick to leave, slow to land, no bounce. Anyone who asked their phone for less motion gets none'],
    ],
  },
  {
    version: '0.23.1',
    date: '2026-08-20',
    title: 'Smoother, faster replays',
    changes: [
      ['changed', 'The camera now aims a little up the route and turns towards it gradually, so a corner reads as turning your head instead of a cut'],
      ['changed', 'The throttle goes much further: the top of the dial skims a whole walk in under a minute, while the lower half stays fine enough to creep along'],
      ['fixed', 'The walk clock had grown into the dial below it; they share a right edge now, with room between them'],
      ['changed', 'Stat cards put the icon above the number, so a two word value like "40 min" no longer breaks across lines'],
    ],
  },
  {
    version: '0.23.0',
    date: '2026-08-20',
    title: 'Walk it again',
    changes: [
      ['added', 'Memories mode: from a walk in the journal you can walk the same route again. Satellite imagery, a tilted camera and extruded buildings, your past self moving along the line, and a throttle in the corner: push it up to go, further to go faster, below the middle to walk backwards'],
      ['added', 'Photos, recordings, notes and points arrive as you reach the places they were left at, with the walk clock running next to them'],
      ['added', 'Tapping a photo, a recording or a note opens it full screen over a blurred backdrop, and you swipe between them like a stack of slides. Captions can be written there, and pins moved or deleted'],
      ['changed', 'The replay paces itself between the moments we actually know: the start, the end, and the minute each point was reached'],
    ],
  },
  {
    version: '0.22.0',
    date: '2026-08-20',
    title: 'A profile with room to breathe',
    changes: [
      ['changed', 'The profile header drops the ring for the city as a board: one square per place, filled in as you walk, with the percentage in full size next to it'],
      ['changed', 'Stamps, walks and kilometres are three cards with icons, and every section on the page has twice the room it had'],
      ['added', 'Tapping a stamp opens its own page: where it comes from, when you first stood there, points, visits and the photos you took in that park'],
      ['changed', 'The walk screen header is transparent with no label, and its back button is white so it reads over any map'],
      ['added', 'DS: StatGrid does three columns, Stamp can be tapped, NavBar has a transparent variant'],
    ],
  },
  {
    version: '0.21.0',
    date: '2026-08-20',
    title: 'The walk screen behaves',
    changes: [
      ['changed', 'A walk from the journal is now its route on a full screen with the details in a sheet over it: pull the sheet down to look at the map, up to read everything'],
      ['fixed', 'Photos, recordings, notes and points opened behind the walk screen, on the live map. They open inside it now, and a point can be read again with its whole story'],
      ['changed', 'Photos of a walk are a plain carousel like in the profile, with no white fade at the edges and a wider gap on the left'],
      ['changed', 'The plus menu sits 24 px above the bar, its buttons are closer together, and they rise and sink one after another'],
    ],
  },
  {
    version: '0.20.0',
    date: '2026-08-20',
    title: 'One plus instead of three icons',
    changes: [
      ['changed', 'The walk bar carries a single plus now. It opens three primary buttons, each only as wide as its label: add a photo, add a recording, add a note'],
      ['changed', 'Recording moved into its own sheet with a big microphone: hold it, talk, let go, then keep it or record again'],
      ['fixed', 'The map takes the full height of the screen on a phone, instead of stopping short of the home indicator'],
    ],
  },
  {
    version: '0.19.1',
    date: '2026-08-20',
    title: 'No white line at the bottom',
    changes: [
      ['fixed', 'The strip behind the home indicator went white after the status bar fix. It belongs to the document, so it now carries the app background instead of the browser default'],
    ],
  },
  {
    version: '0.19.0',
    date: '2026-08-20',
    title: 'Walk history on its own screen',
    changes: [
      ['changed', 'A walk from the journal now opens as its own screen with its own map of the route, instead of a sheet over the live map. Looking back no longer tangles with where you are now'],
      ['added', 'A location button on the map, quiet in the corner: it shows where you are outside a walk too, and during one it puts the camera back on you'],
      ['added', 'Photos, recordings and notes are tappable straight on the route map of a past walk'],
    ],
  },
  {
    version: '0.18.2',
    date: '2026-08-20',
    title: 'Map right up to the top',
    changes: [
      ['fixed', 'The band under the clock and battery is gone: iOS was painting that strip with the theme colour, and a gradient of ours sat on top of it. The map now runs to the very edge of the screen'],
    ],
  },
  {
    version: '0.18.1',
    date: '2026-08-20',
    title: 'Stats that can breathe',
    changes: [
      ['changed', 'Walk stats are cards in two columns now, each with its own icon, instead of four numbers crammed into one line'],
      ['added', 'DS: Stat takes an icon and StatGrid lays the cards out; both are in the catalog'],
      ['fixed', 'The notes list had slipped inside the stats block in the walk sheet'],
    ],
  },
  {
    version: '0.18.0',
    date: '2026-08-20',
    title: 'Voice, notes and a proper ending',
    changes: [
      ['added', 'Voice notes: hold the microphone, let go, listen back, then decide whether it stays. Saved ones become pins on the route'],
      ['added', 'Written notes pinned to a place, in a travelling hand, for things like the sunset that happened right here'],
      ['added', 'Ending a walk is now a small ceremony: the stamp first, then a summary of what the walk added up to, then it lands in the history'],
      ['added', 'The summary shows the badge even when it was not earned: pale, locked, and with the exact points still missing'],
      ['added', 'The journal remembers the hour each point was reached, and lists the notes and recordings from that walk'],
      ['added', 'A new test route along Piltza, from 43 to 34: six points, half a kilometre, from a block named Brussels to the doctor the street is named after, with the Kobierzyn memorial in between'],
      ['changed', 'The drawn track is calmer: readings that imply running are dropped and the rest is smoothed, weighted by how sure the GPS is'],
      ['changed', 'A full set of points no longer reads like the end of the walk. It says so, and leaves the decision to you'],
      ['changed', 'Polaroids are rounder, and a photo without a caption simply has none'],
    ],
  },
  {
    version: '0.17.1',
    date: '2026-08-20',
    title: 'Notices a new version',
    changes: [
      ['added', 'The app checks whether a newer build is live and offers a refresh, because an installed app on iOS tends to resume the old page instead of loading the new one. Never during a walk: a reload would lose it'],
    ],
  },
  {
    version: '0.17.0',
    date: '2026-08-20',
    title: 'Walks you can come back to',
    changes: [
      ['added', 'Every past walk opens from the profile: its route lands on the map and a sheet holds the details, so you can look at where you actually went'],
      ['added', 'Past walks are editable. Rename them, write a note at home, add photos from the camera roll later, move or delete their pins, or drop the whole walk from the journal'],
      ['changed', 'The profile lists all your walks now, not just the last three, and shows the name you gave them'],
      ['fixed', 'Taking a photo no longer opens a system prompt for the caption. That dialog could freeze the installed app; the caption is written in the photo sheet instead'],
      ['fixed', 'A name or note typed into a sheet survives closing it by dragging, which never fired the save before'],
    ],
  },
  {
    version: '0.16.0',
    date: '2026-08-20',
    title: 'Photos on the route, and a proper goodbye',
    changes: [
      ['fixed', 'The stamp no longer lands the moment a walk starts. It is now the reward for a finished park: every point collected, handed over once you close the walk'],
      ['fixed', 'Photos and stamps were being asked for from the root of the domain, so on the phone nothing loaded. Every file now goes through the base path of the build'],
      ['added', 'Ending a walk asks first, and shows what you are about to save. Points the GPS missed can be ticked by hand there, before the walk becomes a journal entry'],
      ['added', 'A photo taken on a walk becomes a pin where you stood, as a round thumbnail. Tap it to caption it, move it or delete it. Those pins stay inside the walk, off the everyday map'],
      ['added', 'A start button on the peek card, but only when you are actually near the park (300 m). Too far, no button'],
      ['changed', 'Taking a photo while walking no longer stops to ask for a caption: it saves, and offers to describe it afterwards'],
    ],
  },
  {
    version: '0.15.0',
    date: '2026-08-20',
    title: 'A walk you can see',
    changes: [
      ['added', 'Your position on the map: a dot with a circle showing how sure the GPS is, and the camera rides along until you touch the map (then a button brings it back)'],
      ['added', 'The top card turns into the live walk: a ring of the points on this walk, its name, a pulse, and which way the next point is with the distance'],
      ['added', 'Two-stage detection: a soft buzz around 50 m to make you look around, and the point counts once you are really there (15 m, or as close as the GPS can promise)'],
      ['added', 'Arriving now shows a notice with "Czytaj" instead of taking over the screen: the point is already counted, the story can wait for a bench'],
      ['added', 'A tick on collected pins, so a walked route reads at a glance'],
      ['added', 'New DS component: Toast, the non-modal notice used for both of those'],
      ['changed', 'The bottom bar slimmed down to what the thumb needs: camera, time and distance, end of walk'],
      ['changed', 'The drawn path drops readings vaguer than 30 m and marks gaps (phone asleep, signal lost) with a dashed line instead of a made-up shortcut'],
      ['changed', 'Walks get names like "Ruczaj, czwartek wieczorem", so the journal reads like a diary'],
    ],
  },
  {
    version: '0.14.1',
    date: '2026-08-20',
    title: 'Full screen on iOS',
    changes: [
      ['fixed', 'The installed app no longer paints a white bar over the top of the map: the map now runs under the status bar, with a soft gradient so the clock stays readable'],
    ],
  },
  {
    version: '0.14.0',
    date: '2026-08-20',
    title: 'Installable and offline',
    changes: [
      ['added', 'The app is now a real PWA: add it to the home screen and it opens like an app, full screen, with its own icon'],
      ['added', 'A service worker keeps the app, the photos and the map tiles you have already seen, so a park with no signal (or a dead dev server) no longer breaks it'],
      ['added', 'Deploy to GitHub Pages on every push, so the phone always has a stable HTTPS address instead of a laptop on the local network'],
    ],
  },
  {
    version: '0.13.1',
    date: '2026-08-20',
    title: 'Test ground on Ruczaj',
    changes: [
      ['added', 'A test area around Piltza 43 with three points: the doorway, the Allegro locker 90 m away and Stokrotka 150 m away, so an expedition can be tried from home'],
      ['added', 'One command removes the test area when the field test is done: npm run test-park:remove'],
    ],
  },
  {
    version: '0.13.0',
    date: '2026-08-20',
    title: 'Light by default, 37 parks with a game',
    changes: [
      ['changed', 'The app opens in light mode by default; auto and dark stay one tap away in settings'],
      ['added', 'Eleven more quests: Stacja Wisla with an installation by Miroslaw Balka, Grzegorzecki and Reduta with Fortress Krakow remains, Witkowice with a hidden cavern, Szymborskiej, Zaczarowanej Dorozki, Laki Nowohuckie, Duchacki, Przylasek Rusiecki, Aleksandry and Zielony Jar'],
      ['added', 'The collection reaches 115 points across 37 parks, with 103 questions'],
      ['fixed', 'Estimated point positions were pulled inside park boundaries; real objects just outside got a matching reach'],
      ['added', 'If the app ever crashes it now shows a way out instead of freezing on the last frame: one tap reloads and the progress stays'],
    ],
  },
  {
    version: '0.12.0',
    date: '2026-08-20',
    title: 'Field games in 26 parks',
    changes: [
      ['added', 'Eleven more quests: Kopiec Kosciuszki, Jerzmanowskich, Bagry, Wyspianskiego, Solvay, Mlynowka, Panienskie Skaly, Jalu Kurka, Wisniowy Sad, Planty Bienczyckie and Park Szwedzki'],
      ['added', 'Planty grew to ten points, including Collegium Novum and the arrest of the professors, Zuzanna Ginczanka and the theatre built on a demolished monastery'],
      ['added', 'The collection now holds 104 points in 26 field games, with 81 questions to argue about'],
      ['fixed', 'Points that stand just outside a park (churches, palaces) got a reach that matches where they really are'],
    ],
  },
  {
    version: '0.11.0',
    date: '2026-08-20',
    title: 'Ten more field games',
    changes: [
      ['added', 'Ten new quests: Planty, Las Wolski, Park Krakowski, Strzelecki, the Botanic Garden, Lotnikow, Bednarskiego, Blonia, Kopiec Wandy and Decjusza'],
      ['added', '32 new points, each with a public story, a reveal unlocked on site and a question to argue about on the bench'],
      ['added', 'The city now holds 82 collectible points across 15 field games, up from 55 and five'],
      ['fixed', 'Three points sat outside their park boundary and were moved inside, so they can be collected on a walk'],
      ['changed', 'Photos shrunk for phones: the app build dropped from 83 MB to 29 MB with no visible loss'],
      ['fixed', 'The Banach monument photo was a 348 px thumbnail, replaced with a sharp one'],
    ],
  },
  {
    version: '0.10.0',
    date: '2026-08-20',
    title: 'Every park has a story',
    changes: [
      ['added', 'All 48 places now have a written page: what it is, why go, and what makes it different from the park next door'],
      ['added', 'Food and playgrounds for 40 parks straight from OpenStreetMap, curated to the six closest named places and four playgrounds'],
      ['added', 'Photos for the park pages, pulled from Wikimedia Commons with credits'],
      ['fixed', 'Pin positions verified against park boundaries: two quest points sat outside their park and were moved in'],
    ],
  },
  {
    version: '0.9.0',
    date: '2026-08-20',
    title: 'Profile with your own trail',
    changes: [
      ['added', 'Profile is a full screen now: a greeting with your name, the city ring, stamps, photos, recent walks and one nudge where to go today'],
      ['added', 'Walk photos: take one during a walk, add a note, and it lands in the profile as a polaroid with park and date'],
      ['added', 'Polaroid component and photo storage that keeps pictures on the device (IndexedDB)'],
      ['added', 'Your name lives in the profile: tap the greeting to change it, the initials become your avatar'],
      ['changed', 'Settings moved off the profile into two pages of their own: app appearance and map look'],
      ['added', '"Where to today": one unvisited park suggested each day, quest parks first'],
    ],
  },
  {
    version: '0.8.0',
    date: '2026-08-20',
    title: 'Stamps and icon pins',
    changes: [
      ['added', 'Park stamps: a sticker per park, pale until you collect it, with a full-screen celebration the moment it lands'],
      ['added', 'Collection screen in the profile: every stamp in one grid with a counter'],
      ['added', 'Stamp on the park hero, like a mark in a passport'],
      ['added', 'Stamp pins appear on the map for collected parks once you zoom in, and tapping one opens that park'],
      ['added', 'Quest pins carry category icons in the app icon style: view, monument, water, nature, cave, history, meadow, climb'],
      ['added', 'Slicing script: drop a sticker sheet in assets-in/ and npm run stamps cuts one transparent PNG per park'],
      ['fixed', 'Pins were unclickable: the map click handler held stale callbacks and the park polygon under the pin always won'],
      ['changed', 'More air between park page sections, especially around the point carousel and the amenity rows'],
      ['added', 'First ten stamps are in: the sticker sheet was sliced into transparent PNGs and they already show on the map'],
      ['added', 'Practical pins have their own colours: parking in blue, food in amber, playgrounds in magenta, all generated from the HCT seed'],
      ['added', 'Food and playground spots from OpenStreetMap; tapping a pin or the amenity row opens the list with walking directions'],
      ['changed', 'Stamp celebration darkens and blurs the background much harder, so only the sticker matters'],
    ],
  },
  {
    version: '0.7.1',
    date: '2026-08-19',
    title: 'Park page redesign',
    changes: [
      ['changed', 'Park page follows the new draft: a full-bleed hero photo with the name written on it, swipeable photos with dots, then progress and a folded description'],
      ['added', 'MediaHero component: header image carousel with title overlay, dots and per-photo credit'],
      ['added', 'Collapsible component: long copy folded to a few lines with a "Więcej" toggle'],
      ['added', 'Sheets support a hero slot: media runs to the panel edges and the handle floats over it'],
      ['changed', 'Unfolding a description glides open instead of snapping, and the last folded line fades out'],
      ['changed', 'Photo credit left the header image; attribution now sits quietly at the bottom of the park page'],
      ['changed', 'Amenities are proper rows now: icon, small heading and a sentence, separated by hairline dividers instead of pills'],
      ['added', 'List component: wraps rows with hairline dividers inset past the icon; the parks list and parking list use it too'],
      ['added', 'Public transport row under parking: the nearest stop and its lines, tapping it opens Google Maps transit directions from wherever you are'],
    ],
  },
  {
    version: '0.7.0',
    date: '2026-08-19',
    title: 'Questions, park pages, Skałki and Skawina',
    changes: [
      ['added', 'Every point can now ask a question: after the reveal you pick a side and the app argues the other one'],
      ['added', 'Dilemmas written for 11 points, from digging up a 1200-year-old mound to a bear who never chose the war'],
      ['added', 'Park page: hero photo, gallery, "why go there" description and the two amenities that decide a family Saturday (playground, food)'],
      ['added', 'New quest: Skałki Twardowskiego with the sorcerer legend, the cave and the climbing walls'],
      ['added', 'New park with a quest: Park Miejski in Skawina (the collection now reaches beyond Kraków)'],
      ['added', 'Photos for twelve points, all CC from Wikimedia Commons with credits'],
      ['changed', 'Zakrzówek keeps four points; the Skałki now live in their own quest'],
    ],
  },
  {
    version: '0.6.1',
    date: '2026-08-19',
    title: 'Feel and polish',
    changes: [
      ['added', 'Peek card has a "Zobacz szczegóły miejsca" button under the dots'],
      ['changed', 'More room to breathe in the peek card and in sheet headers'],
      ['changed', 'Top bars keep their size and turn translucent with a progressive blur once content scrolls under them'],
      ['changed', 'Segmented control: the raised pill now glides between options instead of fading in place'],
      ['changed', 'Changelog reads more clearly: version and date in one row, wider line spacing, aligned type tags'],
      ['fixed', 'Sheet header blur no longer bleeds the page behind the panel (layer isolation)'],
      ['fixed', 'Pinch zoom disabled in the app and the catalog, so the catalog behaves like part of the app'],
    ],
  },
  {
    version: '0.6.0',
    date: '2026-08-19',
    title: 'Live map interaction',
    changes: [
      ['added', 'Peek card: tapping a park on the map opens a compact floating card; pins stay clickable, drag up expands to the full sheet'],
      ['added', 'Tapping a quest pin swaps the peek to that point: photo, teaser and a tap-through to the full story'],
      ['added', 'Parking pin (P) on the map for the suggested spot; tapping opens a full-screen list of suggestions with navigation'],
      ['added', 'NavBar component: X or back always on the left, centered title; used by modals and the mobile catalog'],
      ['added', 'Back-to-app nav bar in the catalog on mobile'],
      ['changed', 'The park sheet is non-modal now: no dimming, the map stays live; tapping empty map closes the peek'],
      ['changed', 'Modal header uses NavBar: action on the left, title centered'],
      ['changed', 'Carousel cards fade out at the screen edge instead of a hard crop'],
      ['fixed', 'Carousel cards align to the top edge; a shorter caption no longer floats its photo upward'],
      ['fixed', 'Tapping a park area on the map did nothing: string feature ids need promoteId in MapLibre; visited park colors relied on it too'],
      ['added', 'Peek swipe pages: park, quest points and parking in one card; content slides with the finger, dots show the position'],
      ['added', 'The active page highlights its pin on the map and the camera flies to it'],
      ['added', 'Profile links to the design system catalog'],
    ],
  },
  {
    version: '0.5.1',
    date: '2026-08-19',
    title: 'Sheet polish, default and satellite map',
    changes: [
      ['changed', 'Sheet headers no longer cut content with a solid edge: scrolled content slides underneath and fades out in a gradient with a progressive blur'],
      ['added', 'Map style "Domyślny": follows the app theme (Minimal in light, Ciemna in dark) and is the new default'],
      ['added', 'Map style "Satelita": Esri World Imagery with lighter park fills so the greenery shows through'],
      ['changed', 'Park sheet breathes: more space between sections, the point carousel sits within the margins'],
      ['fixed', 'Park meta line was caught in the header fade zone right after opening'],
      ['changed', 'Point modal hardened to truly full screen, above every sheet'],
    ],
  },
  {
    version: '0.5.0',
    date: '2026-08-19',
    title: 'Profile, map styles and polish',
    changes: [
      ['added', 'Profile (top right): app theme switch (auto, light, dark) shared with the catalog'],
      ['added', 'Four map styles switchable in the profile with a live preview: Minimal, Klasyczna, Żywa, Ciemna'],
      ['added', 'Point details open as a full-screen modal with a gentle enter, photos and the whole story'],
      ['added', 'Quest points in the park sheet are a snap carousel of cards instead of a plain list'],
      ['added', 'Suggested parking per pilot park: a concrete spot and fee hint (OSM-checked)'],
      ['added', 'DS components: Modal, Carousel, Segmented (the catalog theme switch now uses it too)'],
      ['fixed', 'Sheets animate out on close (drag, scrim, Escape) instead of vanishing in one frame'],
    ],
  },
  {
    version: '0.4.0',
    date: '2026-08-19',
    title: 'Point cards and the iOS sheet',
    changes: [
      ['added', 'Point card: tap any quest point (list, map, or Read more) for photos and the full story, anytime'],
      ['added', 'Rich public descriptions for all 12 pilot points; the hidden on-site reveal stays as the punchline'],
      ['added', 'CC photos from Wikimedia Commons for five points, stored locally with attribution'],
      ['added', 'Walk journal: every expedition saves its track, distance, time and collected points'],
      ['added', 'Compass on the expedition bar: distance and direction to the nearest remaining point'],
      ['changed', 'BottomSheet rebuilt iOS-style: two detents (auto and full), drag anywhere, inner scroll only at full'],
      ['changed', 'Selecting a park flies the map to it with the sheet in mind, so the park is not covered'],
      ['changed', 'Quest dots show on the map when browsing a quest park, not only during a walk'],
    ],
  },
  {
    version: '0.3.0',
    date: '2026-08-19',
    title: 'Quests and expeditions',
    changes: [
      ['added', 'Pilot quests in three parks: Kopiec Krakusa, Zakrzówek and Park Jordana (4 points each, real OSM coordinates)'],
      ['added', 'Two-tier point content: a public teaser for planning, a hidden story revealed only on site'],
      ['added', 'Expedition mode: screen stays awake, GPS records the track (km, time) and detects points in radius'],
      ['added', 'Reveal sheet with the story, progress and a hint to the nearest remaining point'],
      ['added', 'Expedition bar with live time, distance and points; quest dots and the walked track drawn on the map'],
      ['changed', 'City progress now counts points: a quest park scores per point, a plain park scores its entry (55 points total)'],
    ],
  },
  {
    version: '0.2.1',
    date: '2026-08-19',
    title: 'Map fix and phone testing',
    changes: [
      ['fixed', 'Map never finished loading (blank page): MapLibre 6.4.1 regression, pinned to stable 5.x'],
      ['added', 'Phone testing mode: npm run dev:phone serves the app over HTTPS on the local network, so GPS works on the phone'],
    ],
  },
  {
    version: '0.2.0',
    date: '2026-08-19',
    title: 'Map foundations',
    changes: [
      ['added', 'Live map of Kraków (MapLibre) with the fog of war: visited parks in green, the rest greyed out'],
      ['added', 'Park data from OpenStreetMap: curated set of parks, mounds, woods and lakesides with real boundaries'],
      ['added', 'Park sheet with check-in: GPS verifies you are inside the park boundary'],
      ['added', 'City progress: percent of Kraków discovered, stored locally on the device'],
      ['added', 'Version history: click the version number in the catalog sidebar to open this changelog'],
      ['added', 'ListItem component for the parks list (leading disc, title, meta, trailing slot)'],
      ['changed', 'Map colors are driven by the same DS tokens in light and dark'],
    ],
  },
  {
    version: '0.1.0',
    date: '2026-08-19',
    title: 'Foundation',
    changes: [
      ['added', 'Color tokens generated from one HCT seed (forest green), light and dark from day one'],
      ['added', 'Core tokens: 4px spacing rhythm, radius, elevation, motion, control sizes'],
      ['added', 'Type roles: Bricolage Grotesque for display, Manrope for text'],
      ['added', 'Components: Button, IconButton, Chip, ParkBadge, ProgressRing, Card, ParkCard, BottomSheet, Stat'],
      ['added', 'This catalog: tokens, components and live examples with a theme switch'],
    ],
  },
]
