import type { Person, Project, ResourceRow } from '../data/directory'
import { Art } from './Art'
import { Box } from './primitives/Box'
import { Stack } from './primitives/Stack'
import { Icon } from './primitives/Icon'
import { cn } from '../lib/cn'

const surfaceCard = 'bg-card text-on-card p-m'

export function PersonCard({ person }: { person: Person }) {
  return (
    <Stack as="article" data-enter-card="" gap="xl" className={cn('rail-person', surfaceCard)}>
      <Stack gap="m" className="flex-1">
        <Stack direction="row" gap="m" justify="between" className="text-micro">
          <span>{person.discipline}</span>
          <span>{person.location}</span>
        </Stack>
        <Art className="aspect-portrait-compact w-full md:aspect-portrait" />
        <Stack gap="xs">
          <Box as="h3" className="text-heading font-bold">
            {person.name}
          </Box>
          <Box as="p" className="text-small">
            {person.role}
          </Box>
        </Stack>
        <Box as="p" className="line-clamp-4 text-small text-pretty">
          {person.bio}
        </Box>
      </Stack>
      <Stack
        direction="row"
        gap="m"
        align="center"
        justify="between"
        className="border-t border-on-card pt-m text-micro"
      >
        <span>Contact:</span>
        <a href={`mailto:${person.email}`} className="underline-offset-4 hover:underline">
          {person.email}
        </a>
      </Stack>
    </Stack>
  )
}

function ViewAction({ label = 'View' }: { label?: string }) {
  return (
    <Stack
      direction="row"
      gap="xs"
      align="center"
      justify="center"
      className="bg-surface px-l py-s text-lede font-bold text-ink transition-transform duration-150 ease-out group-active:scale-96 motion-reduce:transition-none"
    >
      {label}
      <Icon name="arrow_outward" className="text-body" />
    </Stack>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Stack as="article" data-enter-card="" gap="xl" className={cn('rail-project group', surfaceCard)}>
      <Stack gap="m" className="min-h-0 flex-1">
        <Stack direction="row" gap="m" justify="between" className="text-micro">
          <span>{project.discipline}</span>
          <span>{project.status}</span>
        </Stack>
        <Art fit="height" className="min-h-0 flex-1" />
        <Stack gap="xs">
          <Box as="h3" className="text-subtitle font-bold">
            {project.title}
          </Box>
          <Box as="p" className="text-small">
            {project.stage}
          </Box>
        </Stack>
      </Stack>
      <button type="button" className="block w-full cursor-pointer">
        <ViewAction />
      </button>
    </Stack>
  )
}

export function ResourceCard({ row }: { row: ResourceRow }) {
  return (
    <Stack
      as="article"
      data-enter-card=""
      direction="row"
      gap="l"
      align="center"
      justify="between"
      className={cn('group w-full', surfaceCard)}
    >
      <Stack gap="xs" className="min-w-0">
        <Box as="h3" className="text-subtitle font-bold">
          {row.title}
        </Box>
        <Box as="p" className="text-small text-pretty">
          {row.note}
        </Box>
      </Stack>
      <button type="button" className="shrink-0 cursor-pointer">
        <ViewAction label={row.action} />
      </button>
    </Stack>
  )
}
