import type { RefObject } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { choreoEase } from './ease'
import {
  bendsDoneAt,
  bendsEdge,
  bendsFor,
  cameraAt,
  flarePlan,
  headAt,
  headLength,
  placeCamera,
  ribbonPlan,
  ridesFor,
  travelClock,
  travelFor,
  trimPath,
  zoomToCover,
} from './weave'

gsap.registerPlugin(useGSAP)

export type Phase = 'landing' | 'opening' | 'open' | 'closing'

interface TransitionArgs {
  phase: Phase
  scope: RefObject<HTMLDivElement | null>
  wordmark: RefObject<HTMLDivElement | null>
  dock: RefObject<HTMLDivElement | null>
  cover: RefObject<HTMLDivElement | null>
  weave: RefObject<HTMLDivElement | null>
  body: RefObject<HTMLElement | null>
  selectedIndex: number
  onOpened: () => void
  onClosed: () => void
}

/** Extra exit speed for the clicked row's text, tapering to none for the farthest row. */
const CONTENT_LEAD = 0.6

/** Closing blinds: seconds for each band edge to fall, and how far the top edge trails the bottom. */
const BLIND_DROP = 0.75
const BLIND_LAG = 0.12
/** Gentler middle than the choreo curve; a steep middle makes the long green drop read as a flash. */
const BLIND_EASE = 'power2.inOut'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function flag(el: HTMLElement | null, name: string, on: boolean) {
  if (!el) return
  if (on) el.dataset[name] = ''
  else delete el.dataset[name]
}

function copiesOf(dock: HTMLElement | null) {
  return gsap.utils.toArray<HTMLElement>('[data-copy]', dock)
}

function slotsOf(dock: HTMLElement | null) {
  return gsap.utils.toArray<HTMLElement>('[data-banner]', dock)
}

export function useSectionTransition({
  phase,
  scope,
  wordmark,
  dock,
  cover,
  weave,
  body,
  selectedIndex,
  onOpened,
  onClosed,
}: TransitionArgs) {
  useGSAP(
    () => {
      if (phase !== 'opening' && phase !== 'closing') return

      const reduced = prefersReducedMotion()
      const ease = choreoEase
      const copies = copiesOf(dock.current)
      const slots = slotsOf(dock.current)
      const section = scope.current?.querySelector<HTMLElement>('[data-section]') ?? null
      const enters = section ? Array.from(section.querySelectorAll<HTMLElement>('[data-enter]')) : []
      const cards = section ? Array.from(section.querySelectorAll<HTMLElement>('[data-enter-card]')) : []

      if (reduced) {
        if (phase === 'opening') {
          gsap.set(copies, { autoAlpha: 0 })
          gsap.set(wordmark.current, { autoAlpha: 0 })
          gsap.set(weave.current, { autoAlpha: 0 })
          flag(scope.current, 'reveal', false)
          gsap.set([...enters, ...cards, body.current, section], { clearProps: 'all' })
          onOpened()
        } else {
          flag(dock.current, 'blind', false)
          flag(dock.current, 'choreo', false)
          gsap.set(slots, { clearProps: 'all' })
          gsap.set(copies, { clearProps: 'all' })
          gsap.set([wordmark.current, cover.current], { autoAlpha: 1 })
          gsap.set(cover.current, { autoAlpha: 0 })
          onClosed()
        }
        return
      }

      if (phase === 'opening') {
        const viewW = window.innerWidth
        const viewH = window.innerHeight
        const measures = slots.map((slot) => slot.getBoundingClientRect())
        const picked = measures[selectedIndex] ?? measures[0]
        const laneY = picked ? picked.top + picked.height / 2 : viewH / 2
        const laneSw = picked?.height ?? viewH / 8
        const bends = bendsFor(selectedIndex)
        const camera = weave.current?.querySelector<SVGGElement>('[data-camera]')
        // Paint order changes per visit, so look ribbons up by their section, never by DOM position.
        const ribbons = camera
          ? Array.from(camera.querySelectorAll<SVGPathElement>('[data-ribbon]')).sort(
              (a, b) => Number(a.dataset.ribbon) - Number(b.dataset.ribbon),
            )
          : []

        if (camera) {
          ribbons
            .map((path, index) => ({ path, index }))
            .filter(({ index }) => index !== selectedIndex)
            .sort((a, b) => bends[a.index].layer - bends[b.index].layer)
            .forEach(({ path }) => camera.appendChild(path))
          if (ribbons[selectedIndex]) camera.appendChild(ribbons[selectedIndex])
        }

        flag(dock.current, 'choreo', true)
        gsap.set(weave.current, { autoAlpha: 1 })

        const plans = measures.map((rect, index) => {
          const y = rect.top + rect.height / 2
          const sw = rect.height
          const path = ribbons[index]
          if (index === selectedIndex) {
            path?.setAttribute('fill', 'currentColor')
            path?.setAttribute('stroke-width', '1')
            path?.removeAttribute('stroke-dasharray')
            path?.removeAttribute('stroke-dashoffset')
            return null
          }
          path?.setAttribute('fill', 'none')
          path?.setAttribute('stroke-width', String(sw + 1))
          const plan = ribbonPlan(y, sw, viewW, viewH, bends[index])
          path?.setAttribute('d', plan.d)
          const total = path?.getTotalLength() ?? 1
          return { path, plan, total, sw }
        })

        const bent = plans.filter((entry) => entry !== null).map((entry) => entry.plan)
        const rideOf = new Map(ridesFor(bent, viewW).map((ride, index) => [bent[index], ride]))
        const shoulder = bendsEdge(bent, laneSw, viewW)
        const travelPx = travelFor(shoulder, viewW)
        const flare = flarePlan(laneY, laneSw, viewW, shoulder, travelPx)
        ribbons[selectedIndex]?.setAttribute('d', flare.d)
        const clock = travelClock(bendsDoneAt(bent, laneSw, viewW, travelPx))
        const travelDur = clock.duration
        // The lane fills the screen just before the travel ends; the page background lands on that same colour.
        const reveal = travelDur - 0.12
        const zoomEnd = zoomToCover(flare, laneY, viewW, viewH, travelPx, clock.progressAt(reveal)) * 1.08
        // Landing content rides with its stripe; every turn sits past the screen edge, so none crosses it.
        // Rows nearer the clicked stripe run ahead, never behind, so they still clear every turn.
        const content = [...copies, wordmark.current].filter((el) => el !== null)
        const distances = content.map((el, index) =>
          el === wordmark.current ? selectedIndex + 1 : Math.abs(index - selectedIndex),
        )
        const farthest = Math.max(1, ...distances)
        const riders = content.map((el, index) => ({
          set: gsap.quickSetter(el, 'x', 'px'),
          speed: 1 + CONTENT_LEAD * (1 - distances[index] / farthest),
        }))
        const slideContent = (pan: number) => riders.forEach((rider) => rider.set(-pan * rider.speed))

        const draw = (t: number) => {
          if (!camera) return
          const { pan, zoomT } = cameraAt(t, travelPx)
          slideContent(pan)
          plans.forEach((entry) => {
            if (!entry?.path) return
            const headX = headAt(pan, rideOf.get(entry.plan) ?? viewW, entry.sw, viewW)
            trimPath(entry.path, entry.total, headLength(headX, entry.sw, entry.plan))
          })
          placeCamera(camera, pan, zoomT, laneY, viewW, viewH, zoomEnd)
        }

        draw(0)
        gsap.set([...enters, ...cards], { autoAlpha: 0, y: 16 })
        gsap.set(section, { autoAlpha: 0 })

        const travel = { seconds: 0 }
        const tl = gsap.timeline({ onComplete: onOpened })

        tl.to(
          travel,
          {
            seconds: travelDur,
            duration: travelDur,
            ease: 'none',
            onUpdate: () => draw(clock.progressAt(travel.seconds)),
          },
          0,
        )
          .add(() => flag(scope.current, 'reveal', true), reveal)
          .set(content, { autoAlpha: 0 }, reveal)
          .to(section, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, reveal)
          .to(
            enters,
            { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.07 },
            reveal + 0.15,
          )
          .to(
            cards,
            { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 },
            reveal + 0.35,
          )
        return
      }

      const natural = slots.map((slot) => slot.getBoundingClientRect().height)
      const viewH = window.innerHeight
      const count = Math.max(slots.length, 1)
      let cursor = viewH
      const restY = new Array<number>(slots.length)
      for (let index = slots.length - 1; index >= 0; index -= 1) {
        cursor -= natural[index]
        restY[index] = cursor
      }

      flag(dock.current, 'blind', true)
      gsap.set(copies, { autoAlpha: 0, x: 0 })
      gsap.set(wordmark.current, { autoAlpha: 0, x: 0, y: 0 })
      gsap.set(cover.current, { autoAlpha: 1, scaleY: 0, transformOrigin: 'top center' })
      // Inline position wins over the dock's layout classes, so the blocks can enter from the top.
      gsap.set(dock.current, { autoAlpha: 1, position: 'absolute', inset: 0, marginTop: 0 })
      gsap.set(slots, {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 0,
        y: 0,
        zIndex: (index) => index + 1,
      })

      const tl = gsap.timeline({
        onComplete: () => {
          flag(dock.current, 'blind', false)
          flag(dock.current, 'choreo', false)
          gsap.set(slots, { clearProps: 'all' })
          gsap.set(dock.current, { clearProps: 'all' })
          gsap.set(copies, { clearProps: 'transform,opacity,visibility' })
          // The cover stays up until React swaps the landing back to its solid ground, or the page flashes through.
          onClosed()
        },
      })

      tl.to(cover.current, { scaleY: 1, duration: 0.55, ease }, 0)
      slots.forEach((slot, index) => {
        const start = 0.22 + (count - 1 - index) * 0.08
        // Bottom edge leads and the top edge trails close behind, so each band falls as a short
        // streak instead of filling the screen. The bottom edge stops at rest first, so no gap opens below.
        const edges = { top: 0, bottom: 0 }
        const place = () => gsap.set(slot, { y: edges.top, height: edges.bottom - edges.top })
        tl.to(
          edges,
          { bottom: restY[index] + natural[index], duration: BLIND_DROP, ease: BLIND_EASE, onUpdate: place },
          start,
        ).to(
          edges,
          { top: restY[index], duration: BLIND_DROP, ease: BLIND_EASE, onUpdate: place },
          start + BLIND_LAG,
        )
      })

      tl.to(wordmark.current, { autoAlpha: 1, duration: 0.45, ease }, 1.05).to(
        copies,
        { autoAlpha: 1, duration: 0.4, ease: 'power2.out', stagger: 0.04 },
        1.35,
      )
    },
    { dependencies: [phase, selectedIndex], scope },
  )
}
