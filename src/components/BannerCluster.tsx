import type { ReactNode } from 'react'
import type { Section } from '../data/directory'
import { Box } from './primitives/Box'
import { Stack } from './primitives/Stack'
import { Icon } from './primitives/Icon'
import { cn } from '../lib/cn'

const circle = 'flex shrink-0 items-center justify-center rounded-full'

function NumberBadge({ index, dock }: { index: number; dock?: boolean }) {
  return (
    <Box
      className={cn(
        circle,
        dock ? 'size-badge-dock text-body' : 'size-badge text-heading',
        'border-2 border-ink font-medium leading-none',
      )}
    >
      {index}
    </Box>
  )
}

/** The arrow keeps one glyph and rotates, so the direction change is a transition. */
function ArrowDisc({ pointing, dock }: { pointing: 'right' | 'back'; dock?: boolean }) {
  return (
    <Box className={cn(circle, dock ? 'size-badge-dock' : 'size-badge', 'bg-ink text-section')}>
      <Icon
        name="arrow_right_alt"
        className={cn(
          dock ? 'text-lede' : 'text-heading',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          pointing === 'right' ? 'rotate-0' : 'rotate-180',
        )}
      />
    </Box>
  )
}

function Meta({ section, marked, dock }: { section: Section; marked: boolean; dock: boolean }) {
  return (
    <Stack gap={dock ? 'none' : 'l'} justify={dock ? 'between' : undefined} className="min-w-0">
      <Box
        as="p"
        className={cn('font-bold whitespace-pre-line', dock ? 'text-body' : 'text-lede')}
      >
        {section.tagline}
      </Box>
      <Stack gap={dock ? '2xs' : 's'} className={dock ? 'text-small leading-none' : 'text-body'}>
        {section.facts.map((fact, i) => (
          <Stack key={fact} direction="row" gap="xs" align="center" className="whitespace-nowrap">
            {marked && i === 0 ? <Icon name="arrow_right_alt" className="text-body" /> : null}
            <span className={cn(marked && i === 0 && 'font-bold')}>{fact}</span>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

export function BannerCluster({
  section,
  mode,
  trailing,
  onBack,
}: {
  section: Section
  mode: 'dock' | 'header'
  trailing?: ReactNode
  onBack?: () => void
}) {
  const marked = mode === 'header' && (section.id === 'system' || section.id === 'links')
  const dock = mode === 'dock'

  return (
    <Stack
      direction="row"
      gap="3xl"
      align="start"
      justify="between"
      data-copy={dock ? '' : undefined}
      className={cn('w-full', dock && 'banner-cluster')}
    >
      <Stack
        direction="row"
        align={dock ? 'stretch' : 'start'}
        className={cn(
          'min-w-0 flex-1',
          dock && 'self-stretch',
          mode === 'header' && 'max-md:flex-col max-md:gap-m',
        )}
      >
        <Stack
          direction="row"
          gap={dock ? 'ml' : 'l'}
          align={dock ? 'center' : 'start'}
          className="w-full shrink-0 md:w-banner-head-tablet md:flex-none lg:w-banner-head"
        >
          <Stack gap="xs" align="start" className="shrink-0">
            {dock ? (
              <>
                <NumberBadge index={section.index} dock />
                <Box className="hidden md:block">
                  <ArrowDisc pointing="right" dock />
                </Box>
              </>
            ) : (
              <>
                <Box className="hidden md:block">
                  <NumberBadge index={section.index} />
                </Box>
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Back to the directory"
                  className="rounded-full transition-transform duration-150 ease-out active:scale-96 motion-reduce:transition-none"
                >
                  <ArrowDisc pointing="back" />
                </button>
              </>
            )}
          </Stack>
          <Box
            as="h2"
            className={cn(
              'min-w-0 whitespace-pre-line',
              dock ? 'text-banner font-medium' : 'text-title font-bold',
            )}
          >
            {section.title}
          </Box>
        </Stack>

        <Stack
          direction="row"
          gap={dock ? 'ml' : 'm'}
          align="stretch"
          className={cn('self-stretch md:flex', mode === 'header' ? 'flex' : 'hidden')}
        >
          <Box className="hidden w-0.5 shrink-0 self-stretch bg-ink/10 md:block" />
          <Meta section={section} marked={marked} dock={dock} />
        </Stack>
      </Stack>

      {trailing ? (
        <Box className={cn('shrink-0', dock && 'flex w-3xl justify-center pt-m')}>{trailing}</Box>
      ) : null}
    </Stack>
  )
}
