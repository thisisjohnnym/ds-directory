import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type BoxOwnProps<T extends ElementType> = {
  as?: T
  className?: string
  children?: ReactNode
}

export type BoxProps<T extends ElementType> = BoxOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof BoxOwnProps<T>>

export function Box<T extends ElementType = 'div'>({ as, className, ...rest }: BoxProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return <Tag className={cn(className)} {...rest} />
}
