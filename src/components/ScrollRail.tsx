import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { Box } from './primitives/Box'
import { Stack } from './primitives/Stack'
import { cn } from '../lib/cn'

/** Horizontal gallery with the short progress rail drawn in the source file. */
export function ScrollRail({
  children,
  className,
  fill = false,
}: {
  children: ReactNode
  className?: string
  fill?: boolean
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)

  const sync = useCallback(() => {
    const el = scroller.current
    const bar = thumb.current
    if (!el || !bar) return

    const overflow = el.scrollWidth - el.clientWidth
    const ratio = overflow > 0 ? Math.max(el.clientWidth / el.scrollWidth, 0.1) : 1
    const progress = overflow > 0 ? el.scrollLeft / overflow : 0

    // Driven by scroll position, so it is written straight to the node.
    bar.style.width = `${ratio * 100}%`
    bar.style.transform = `translateX(${(progress * (1 - ratio) * 100) / ratio}%)`
  }, [])

  useEffect(() => {
    sync()
    const el = scroller.current
    if (!el) return
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [sync])

  return (
    <Stack gap="gallery" align="center" className={cn('min-h-0 w-full', className)}>
      <Box
        ref={scroller}
        onScroll={sync}
        className={cn(
          'rail flex w-full min-h-0 items-stretch gap-gallery overflow-x-auto',
          fill && 'flex-1',
        )}
      >
        {children}
      </Box>
      <Box className="h-2 w-rail shrink-0 overflow-hidden bg-track">
        <Box ref={thumb} className="h-full bg-ink" />
      </Box>
    </Stack>
  )
}
