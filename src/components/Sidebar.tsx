import type { SidebarGroup } from '../data/directory'
import { Box } from './primitives/Box'
import { Stack } from './primitives/Stack'
import { cn } from '../lib/cn'

export function Sidebar({
  groups,
  current,
  onSelect,
}: {
  groups: SidebarGroup[]
  current: string | null
  onSelect: (item: string | null) => void
}) {
  return (
    <Stack
      as="nav"
      data-enter=""
      aria-label="Section contents"
      direction="row"
      gap="xl"
      className="shrink-0 overflow-x-auto bg-section p-l md:w-sidebar md:flex-col md:gap-2xl md:overflow-x-visible md:overflow-y-auto"
    >
      {groups.map((group) => (
        <Stack key={group.label} gap="m" className="shrink-0">
          <Box as="h3" className="hidden text-lede font-bold md:block">
            {group.label}
          </Box>
          <Stack as="ul" direction="row" gap="s" className="text-body md:flex-col md:gap-xs">
            {group.items.map((item) => {
              const active = current === item
              return (
                <li key={item} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelect(active ? null : item)}
                    className={cn(
                      'cursor-pointer whitespace-nowrap underline-offset-4 transition-opacity duration-200 ease-out hover:underline motion-reduce:transition-none',
                      active ? 'font-bold underline' : 'opacity-80',
                    )}
                  >
                    {item}
                  </button>
                </li>
              )
            })}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}
