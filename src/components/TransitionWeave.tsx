import type { RefObject } from 'react'
import { sections } from '../data/directory'
import { cn } from '../lib/cn'

/** Empty ribbons. The open transition draws them from the live banner rectangles. */
export function TransitionWeave({ weaveRef }: { weaveRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={weaveRef} className="weave pointer-events-none absolute inset-0 z-10">
      <svg className="h-full w-full overflow-hidden" aria-hidden="true">
        <g data-camera="">
          {sections.map((section, index) => (
            <path
              key={section.id}
              data-ribbon={index}
              className={cn(section.tone, 'text-section')}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
