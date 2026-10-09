import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { sections, type SectionId } from '../data/directory'
import { BannerCluster } from './BannerCluster'
import { Box } from './primitives/Box'
import { Stack } from './primitives/Stack'
import { Icon } from './primitives/Icon'
import { cn } from '../lib/cn'

export function Masthead({ compact = false }: { compact?: boolean }) {
  return (
    <Stack
      direction="row"
      gap="l"
      align="start"
      justify="between"
      className={cn('w-full px-l pt-l', !compact && 'max-md:flex-col max-md:gap-s')}
    >
      <Box as="p" className={cn('font-bold', compact ? 'text-heading' : 'text-display')}>
        Tapestry.Design
      </Box>
      <Box
        as="p"
        className={cn(
          'text-lede shrink-0 whitespace-pre-line',
          compact ? 'text-right' : 'text-left md:text-right',
        )}
      >
        {'Information, Resources\nAnd Brand Assets'}
      </Box>
    </Stack>
  )
}

export function Landing({
  wordmarkRef,
  dockRef,
  coverRef,
  onOpen,
  interactive,
  closing,
}: {
  wordmarkRef: RefObject<HTMLDivElement | null>
  dockRef: RefObject<HTMLDivElement | null>
  coverRef: RefObject<HTMLDivElement | null>
  onOpen: (id: SectionId) => void
  interactive: boolean
  closing: boolean
}) {
  const [leaving, setLeaving] = useState(false)
  const handoff = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(handoff.current), [])

  // The hovered band eases back to its colour before the transition takes over.
  const choose = (id: SectionId) => {
    if (leaving) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onOpen(id)
      return
    }
    setLeaving(true)
    handoff.current = window.setTimeout(() => {
      setLeaving(false)
      onOpen(id)
    }, 200)
  }

  const onArrowKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    const buttons = Array.from(
      dockRef.current?.querySelectorAll<HTMLButtonElement>('[data-banner] button') ?? [],
    )
    const from = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (from < 0) return
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    buttons[(from + step + buttons.length) % buttons.length].focus()
  }

  return (
    <Box
      data-closing={closing ? '' : undefined}
      className="landing-screen absolute inset-0 flex flex-col overflow-x-clip overflow-y-auto"
    >
      <Box ref={coverRef} data-cover="" className="pointer-events-none absolute inset-0 bg-ground" />
      <Box ref={wordmarkRef} className="relative z-10 shrink-0">
        <Masthead />
      </Box>

      <Box
        ref={dockRef}
        data-hoverable={interactive && !leaving ? '' : undefined}
        className="dock relative z-30 mt-auto"
        onKeyDown={onArrowKeys}
      >
        {sections.map((section) => (
          <Box key={section.id} className="banner-slot" data-banner="">
            <Box className={cn('banner', section.tone)}>
              <BannerCluster
                section={section}
                mode="dock"
                trailing={<Icon name={section.icon} className="text-glyph" />}
              />
            </Box>
            <button
              type="button"
              disabled={!interactive}
              onClick={() => choose(section.id)}
              className="absolute inset-0 cursor-pointer"
            >
              <span className="sr-only">{`Open ${section.title.replace('\n', ' ')}`}</span>
            </button>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
