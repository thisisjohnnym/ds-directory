import type { ElementType } from 'react'
import { Box, type BoxProps } from './Box'
import { cn } from '../../lib/cn'

type Gap = 'none' | '2xs' | 'xs' | 's' | 'm' | 'ml' | 'l' | 'xl' | '2xl' | 'gallery' | '3xl'
type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type Justify = 'start' | 'center' | 'end' | 'between'

const gapClass: Record<Gap, string> = {
  none: 'gap-0',
  '2xs': 'gap-2xs',
  xs: 'gap-xs',
  s: 'gap-s',
  m: 'gap-m',
  ml: 'gap-ml',
  l: 'gap-l',
  xl: 'gap-xl',
  '2xl': 'gap-2xl',
  gallery: 'gap-gallery',
  '3xl': 'gap-3xl',
}

const alignClass: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

const justifyClass: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

export type StackProps<T extends ElementType> = BoxProps<T> & {
  direction?: 'row' | 'column'
  gap?: Gap
  align?: Align
  justify?: Justify
}

export function Stack<T extends ElementType = 'div'>({
  direction = 'column',
  gap = 'none',
  align,
  justify,
  className,
  ...rest
}: StackProps<T>) {
  return (
    <Box
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        gapClass[gap],
        align && alignClass[align],
        justify && justifyClass[justify],
        className,
      )}
      {...(rest as BoxProps<T>)}
    />
  )
}
