import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { findSection, sectionIds, sections, type SectionId } from './data/directory'
import { Landing } from './components/Landing'
import { SectionView } from './components/SectionView'
import { TransitionWeave } from './components/TransitionWeave'
import { Box } from './components/primitives/Box'
import { cn } from './lib/cn'
import { useSectionTransition, type Phase } from './motion/useSectionTransition'

function sectionFromPath(): SectionId | null {
  const slug = window.location.pathname.replace(/\//g, '')
  return (sectionIds as string[]).includes(slug) ? (slug as SectionId) : null
}

export default function App() {
  const initial = useRef(sectionFromPath()).current

  const [active, setActive] = useState<SectionId | null>(initial)
  const [phase, setPhase] = useState<Phase>(initial ? 'open' : 'landing')
  const scope = useRef<HTMLDivElement>(null)
  const wordmark = useRef<HTMLDivElement>(null)
  const dock = useRef<HTMLDivElement>(null)
  const cover = useRef<HTMLDivElement>(null)
  const weave = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLElement>(null)
  const body = useRef<HTMLElement>(null)
  const selectedIndex = active ? sections.findIndex((section) => section.id === active) : 0

  const open = useCallback(
    (id: SectionId, push = true) => {
      setActive(id)
      setPhase('opening')
      if (push) window.history.pushState({ section: id }, '', `/${id}`)
    },
    [],
  )

  const close = useCallback((push = true) => {
    setPhase('closing')
    if (push) window.history.pushState({ section: null }, '', '/')
  }, [])

  useSectionTransition({
    phase,
    scope,
    wordmark,
    dock,
    cover,
    weave,
    body,
    selectedIndex,
    onOpened: () => setPhase('open'),
    onClosed: () => {
      setPhase('landing')
      setActive(null)
    },
  })

  useLayoutEffect(() => {
    if (phase !== 'open' && phase !== 'landing') return
    delete dock.current?.dataset.choreo
    delete scope.current?.dataset.reveal
    if (phase === 'open' && weave.current) {
      weave.current.style.opacity = '0'
      weave.current.style.visibility = 'hidden'
    }
    if (phase === 'landing' && cover.current) {
      cover.current.style.opacity = '0'
      cover.current.style.visibility = 'hidden'
      cover.current.style.transform = ''
    }
  }, [phase])

  useEffect(() => {
    const onPop = () => {
      const target = sectionFromPath()
      if (target && target !== active) open(target, false)
      else if (!target && active) close(false)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [active, open, close])

  useEffect(() => {
    if (phase !== 'open') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, close])

  return (
    <Box ref={scope} className="relative h-full w-full overflow-clip bg-ground">
      <Box
        className={cn(
          'absolute inset-0',
          phase === 'closing' || phase === 'opening' ? 'z-30' : 'z-0',
        )}
        inert={phase !== 'landing'}
      >
        <Landing
          wordmarkRef={wordmark}
          dockRef={dock}
          coverRef={cover}
          onOpen={(id) => phase === 'landing' && open(id)}
          interactive={phase === 'landing'}
          closing={phase === 'closing'}
        />
        <TransitionWeave weaveRef={weave} />
      </Box>

      {active ? (
        <Box data-section="" className="absolute inset-0 z-10" inert={phase !== 'open'}>
          <SectionView
            key={active}
            section={findSection(active)}
            headerRef={header}
            bodyRef={body}
            onBack={() => phase === 'open' && close()}
          />
        </Box>
      ) : null}
    </Box>
  )
}
