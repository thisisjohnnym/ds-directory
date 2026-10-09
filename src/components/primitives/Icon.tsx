import { cn } from '../../lib/cn'

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('icon-glyph inline-block', className)}>
      {name}
    </span>
  )
}
