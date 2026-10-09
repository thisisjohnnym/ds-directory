import { Box } from './primitives/Box'
import { cn } from '../lib/cn'

/** Stand-in artwork from the source file: a block and a disc in the section colour.
    `fit` picks the axis that sizes the pair, so neither one clips its frame. */
export function Art({
  className,
  framed = true,
  fit = 'width',
}: {
  className?: string
  framed?: boolean
  fit?: 'width' | 'height'
}) {
  return (
    <Box
      className={cn('grid place-items-center overflow-hidden', framed && 'bg-surface', className)}
    >
      <Box
        className={cn(
          'relative aspect-placeholder',
          fit === 'width' ? 'w-4/5 max-w-art' : 'h-4/5 max-h-art-height',
        )}
      >
        <Box className="art-square" />
        <Box className="art-circle" />
      </Box>
    </Box>
  )
}
