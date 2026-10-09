import { useState, type ReactNode, type RefObject } from 'react'
import { people, projects, resourceRows, type Section } from '../data/directory'
import { BannerCluster } from './BannerCluster'
import { Masthead } from './Landing'
import { Sidebar } from './Sidebar'
import { ScrollRail } from './ScrollRail'
import { Art } from './Art'
import { PersonCard, ProjectCard, ResourceCard } from './cards'
import { Box } from './primitives/Box'
import { Stack } from './primitives/Stack'
import { Icon } from './primitives/Icon'
import { cn } from '../lib/cn'

function BrandMark() {
  return (
    <Stack
      align="center"
      justify="center"
      className="bg-surface px-xl py-m text-center text-ink"
    >
      <Box as="p" className="text-subtitle font-serif">
        kate spade
      </Box>
      <Box as="p" className="text-micro font-serif tracking-brand">
        NEW YORK
      </Box>
    </Stack>
  )
}

function trailingFor(section: Section): ReactNode {
  if (section.id === 'system') return <BrandMark />
  if (section.id === 'work') return null
  return <Icon name={section.id === 'team' ? 'group' : section.icon} className="text-glyph-lg" />
}

function EmptyCanvas({ label }: { label: string }) {
  return (
    <Stack gap="xs" align="start" className="py-xl">
      <Box as="p" className="text-subtitle font-bold">
        Nothing here yet
      </Box>
      <Box as="p" className="text-body">
        {`No entries are published under ${label}.`}
      </Box>
    </Stack>
  )
}

function Canvas({ section, current }: { section: Section; current: string | null }) {
  if (section.id === 'work') {
    const shown = current ? projects.filter((p) => p.group === current) : projects
    return shown.length ? (
      <ScrollRail fill className="flex-1">
        {shown.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </ScrollRail>
    ) : (
      <EmptyCanvas label={current ?? 'this filter'} />
    )
  }

  if (section.id === 'tools' || section.id === 'links') {
    const rows = resourceRows[section.id]
    const shown = current ? rows.filter((row) => row.group === current) : rows
    return shown.length ? (
      <Stack gap="l" className="w-full">
        {shown.map((row) => (
          <ResourceCard key={row.title} row={row} />
        ))}
      </Stack>
    ) : (
      <EmptyCanvas label={current ?? 'this filter'} />
    )
  }

  return <Art framed={false} className="min-h-0 flex-1" />
}

export function SectionView({
  section,
  headerRef,
  bodyRef,
  onBack,
}: {
  section: Section
  headerRef: RefObject<HTMLElement | null>
  bodyRef: RefObject<HTMLElement | null>
  onBack: () => void
}) {
  const [current, setCurrent] = useState<string | null>(null)
  const isTeam = section.id === 'team'

  return (
    <Box className={cn('absolute inset-0 flex flex-col overflow-clip bg-section', section.tone)}>
      <Stack as="header" ref={headerRef} gap="m" className="relative z-10 shrink-0 bg-section pb-xl">
        <Box data-enter="">
          <Masthead compact />
        </Box>
        <Box data-enter="" className="px-l pt-l">
          <BannerCluster
            section={section}
            mode="header"
            trailing={trailingFor(section)}
            onBack={onBack}
          />
        </Box>
      </Stack>

      <Box
        as="main"
        ref={bodyRef}
        className="flex min-h-0 flex-1 flex-col md:flex-row"
      >
        {isTeam ? null : (
          <Sidebar groups={section.groups} current={current} onSelect={setCurrent} />
        )}
        <Stack
          data-enter=""
          gap="l"
          justify="start"
          className={cn(
            'min-h-0 flex-1 overflow-y-auto bg-ground p-l',
            isTeam && 'md:justify-center',
          )}
        >
          {isTeam ? (
            <ScrollRail>
              {people.map((person) => (
                <PersonCard key={person.email} person={person} />
              ))}
            </ScrollRail>
          ) : (
            <Canvas section={section} current={current} />
          )}
        </Stack>
      </Box>
    </Box>
  )
}
