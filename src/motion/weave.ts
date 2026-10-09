import { sections, type SectionId } from '../data/directory'

/** How a non-selected bar peels off its lane, directed per clicked section. */
export interface Bend {
  dir: 1 | -1
  /** Turn position past the screen edge, in band heights. */
  elbow: number
  /** Stack position among the other bars; higher paints on top. */
  layer: number
}

export interface RibbonPlan {
  d: string
  /** Arc length of the straight run before the corner. */
  straight: number
  /** World x where the corner starts. */
  elbowX: number
}

/** Centerline corner radius in band heights, measured from the Paper transition frames. */
const CORNER = 2.75

/** Minimum sideways travel of the camera, in screen widths. */
export const PAN = 1.8
/** Share of the travel that is pan only, so every turn crosses the screen before the zoom. */
export const ZOOM_START = 0.6
/** Where the shoulder sits across the screen when the zoom begins. */
const SHOULDER_AT = 0.55

interface Turn {
  dir: 'up' | 'down'
  /** Where the corner starts in the 1512px Paper frame. */
  x: number
}

/**
 * One frame per clicked section, read from the Paper transition designs. Each list
 * runs bottom to top in paint order; the clicked lane always paints over all of them.
 */
const directed: Record<SectionId, [SectionId, Turn][]> = {
  work: [
    ['team', { dir: 'down', x: 275 }],
    ['tools', { dir: 'down', x: -13 }],
    ['system', { dir: 'down', x: -13 }],
    ['links', { dir: 'up', x: 117 }],
  ],
  tools: [
    ['team', { dir: 'down', x: 562 }],
    ['links', { dir: 'down', x: 331 }],
    ['system', { dir: 'down', x: -13 }],
    ['work', { dir: 'up', x: 230 }],
  ],
  links: [
    ['tools', { dir: 'up', x: -30 }],
    ['team', { dir: 'down', x: 562 }],
    ['system', { dir: 'down', x: 292 }],
    ['work', { dir: 'up', x: 230 }],
  ],
  team: [
    ['work', { dir: 'up', x: 230 }],
    ['tools', { dir: 'up', x: -30 }],
    ['links', { dir: 'down', x: 379 }],
    ['system', { dir: 'up', x: 106 }],
  ],
  system: [
    ['team', { dir: 'up', x: 106 }],
    ['tools', { dir: 'up', x: -38 }],
    ['work', { dir: 'down', x: 316 }],
    ['links', { dir: 'up', x: 353 }],
  ],
}

/** Band height in the Paper frames. */
const DESIGN_BAND = 124
/** Shifts the earliest designed turn just past the screen edge so every corner draws into view. */
const DESIGN_LEAD = 40
/** Extra straight run, in band heights, so each head is on screen for a beat before it turns. */
const RIDE_LEAD = 1.5

export function bendsFor(selected: number): Bend[] {
  const plan = directed[sections[selected]?.id ?? 'work']
  return sections.map(({ id }) => {
    const layer = plan.findIndex(([target]) => target === id)
    const turn = plan[layer]?.[1]
    if (!turn) return { dir: 1, elbow: 0, layer: 0 }
    return {
      dir: turn.dir === 'up' ? -1 : 1,
      elbow: 1 + RIDE_LEAD + (turn.x + DESIGN_LEAD) / DESIGN_BAND,
      layer,
    }
  })
}

/** The clicked lane opens into a wedge: a rounded shoulder, then straight edges at this angle. */
const FLARE_ANGLE = (56 * Math.PI) / 180
/** Shoulder radius in band heights; large so the lane reads as drawn into a funnel. */
const FLARE_RADIUS = 4.5

export interface Flare {
  d: string
  /** Distance from the lane centre to the wedge edge at world x. */
  half: (x: number) => number
}

/** World x of the outer edge of the last bar's vertical run, where the flare's shoulder begins. */
export function bendsEdge(plans: RibbonPlan[], sw: number, width: number) {
  if (!plans.length) return width + sw
  return Math.max(...plans.map((plan) => plan.elbowX)) + sw * CORNER + sw / 2
}

/**
 * Camera travel in px. Bends and shoulder are sized in band heights, so on narrow
 * screens a width-based pan would zoom before the shoulder arrives.
 */
export function travelFor(start: number, width: number) {
  return Math.max(width * PAN, (start - width * SHOULDER_AT) / panShare(ZOOM_START))
}

/** Filled outline of the clicked lane: straight band, rounded shoulder at `start`, wide wedge. */
export function flarePlan(y: number, sw: number, width: number, start: number, travel: number): Flare {
  const base = sw / 2
  const radius = sw * FLARE_RADIUS
  const sin = Math.sin(FLARE_ANGLE)
  const tan = Math.tan(FLARE_ANGLE)
  const shoulderX = start + radius * sin
  const shoulderRise = radius * (1 - Math.cos(FLARE_ANGLE))
  const endX = Math.max(travel + width * 3, shoulderX + width)
  const endRise = shoulderRise + (endX - shoulderX) * tan

  const rise = (x: number) => {
    if (x <= start) return 0
    if (x <= shoulderX) return radius - Math.sqrt(radius * radius - (x - start) ** 2)
    return shoulderRise + (x - shoulderX) * tan
  }
  const top = (r: number) => (y - base - r).toFixed(1)
  const bottom = (r: number) => (y + base + r).toFixed(1)

  return {
    d: [
      `M ${-sw} ${top(0)}`,
      `H ${start.toFixed(1)}`,
      `A ${radius} ${radius} 0 0 0 ${shoulderX.toFixed(1)} ${top(shoulderRise)}`,
      `L ${endX.toFixed(1)} ${top(endRise)}`,
      `V ${bottom(endRise)}`,
      `L ${shoulderX.toFixed(1)} ${bottom(shoulderRise)}`,
      `A ${radius} ${radius} 0 0 0 ${start.toFixed(1)} ${bottom(0)}`,
      `H ${-sw} Z`,
    ].join(' '),
    half: (x) => base + rise(x),
  }
}

/** Smallest final zoom at which the wedge already fills the whole view at travel progress `t`. */
export function zoomToCover(
  flare: Flare,
  laneY: number,
  width: number,
  height: number,
  travel: number,
  t: number,
) {
  const { pan, zoomT } = cameraAt(t, travel)
  const screenY = laneY + (height / 2 - laneY) * zoomT
  for (let zoomEnd = 1; zoomEnd < 20; zoomEnd += 0.05) {
    const scale = zoomEnd ** zoomT
    const leftX = width * 0.5 + pan - (width * 0.5) / scale
    const reach = Math.max(screenY, height - screenY) / scale
    if (flare.half(leftX) >= reach) return zoomEnd
  }
  return 20
}

/** Runs straight past the screen edge, turns with a round corner, then leaves the frame. */
export function ribbonPlan(y: number, sw: number, width: number, height: number, bend: Bend): RibbonPlan {
  const radius = sw * CORNER
  const elbowX = width + sw * bend.elbow
  const cornerX = elbowX + radius
  const sweep = bend.dir === 1 ? 1 : 0
  const turnY = y + bend.dir * radius
  const endY = turnY + bend.dir * height * 1.8
  return {
    d: `M ${-sw} ${y} H ${elbowX.toFixed(1)} A ${radius} ${radius} 0 0 ${sweep} ${cornerX.toFixed(1)} ${turnY.toFixed(1)} V ${endY.toFixed(1)}`,
    straight: elbowX + sw,
    elbowX,
  }
}

/** Past the corner the tip draws slower than the pan, so the view catches it mid-bend. */
const BEND_DRAW = 0.85

/** Arc length drawn when the head is at world x. */
export function headLength(headX: number, sw: number, plan: RibbonPlan) {
  if (headX <= plan.elbowX) return headX + sw
  return plan.straight + (headX - plan.elbowX) * BEND_DRAW
}

/** Screen share where the head of the nearest-turning bar rides once the camera reveals it. */
const RIDE_AT = 0.92
/** Screen share between the nearest- and farthest-turning heads, staggering heads and bends. */
const RIDE_RANGE = 0.25
/** Softness of the hand-off from parked to riding, in band heights. */
const RIDE_SOFT = 2

/** Screen x where each bar's head rides, aligned with `plans`. */
export function ridesFor(plans: RibbonPlan[], width: number) {
  const nearest = Math.min(...plans.map((plan) => plan.elbowX))
  const span = Math.max(1, ...plans.map((plan) => plan.elbowX - nearest))
  return plans.map((plan) => width * (RIDE_AT - (RIDE_RANGE * (plan.elbowX - nearest)) / span))
}

/**
 * World x of a bar's head. It parks just past the right edge, so the panning camera reveals
 * its round end, then eases into riding at `ride` on screen. It never moves backwards.
 */
export function headAt(pan: number, ride: number, sw: number, width: number) {
  const parked = width + sw * 0.6
  const soft = sw * RIDE_SOFT
  const ahead = pan + ride - parked
  return parked + (ahead + Math.sqrt(ahead * ahead + soft * soft)) / 2
}

/** Pan at which a head reaches world x; inverse of headAt. */
function panForHead(headX: number, ride: number, sw: number, width: number) {
  const parked = width + sw * 0.6
  const soft = sw * RIDE_SOFT
  const past = Math.max(1e-3, headX - parked)
  return past - (soft * soft) / (4 * past) + parked - ride
}

/** Travel progress at which the last corner has fully drawn. */
export function bendsDoneAt(plans: RibbonPlan[], sw: number, width: number, travel: number) {
  const arc = (Math.PI / 2) * sw * CORNER
  const rides = ridesFor(plans, width)
  const pan = Math.max(
    0,
    ...plans.map((plan, index) => panForHead(plan.elbowX + arc / BEND_DRAW, rides[index], sw, width)),
  )
  return progressAtShare(pan / travel)
}

/** Seconds the whole travel would take at the bend pace; slow enough to read each turn. */
const BASE_TRAVEL = 3.6
/** Seconds per unit of progress after the last bend, independent of the bend pace. */
const TAIL_PACE = 1.6
/** Seconds spent easing from the bend pace up to the faster tail pace. */
const TAIL_RAMP = 0.3

/**
 * Bends draw at the base pace; once the last one is done, the pace ramps up so
 * the flare and zoom arrive sooner. Returns the total seconds and progress at a time.
 */
export function travelClock(bendT: number) {
  const slow = 1 / BASE_TRAVEL
  const bendSeconds = bendT / slow
  const remaining = 1 - bendT
  const tail = Math.max(TAIL_RAMP, remaining * TAIL_PACE)
  const fast = Math.max(slow, (remaining - (TAIL_RAMP * slow) / 2) / (tail - TAIL_RAMP / 2))

  const progressAt = (seconds: number) => {
    if (seconds <= bendSeconds) return seconds * slow
    const ramped = Math.min(seconds - bendSeconds, TAIL_RAMP)
    const held = Math.max(0, seconds - bendSeconds - TAIL_RAMP)
    const t = bendT + slow * ramped + ((fast - slow) * ramped * ramped) / (2 * TAIL_RAMP) + fast * held
    return Math.min(1, t)
  }

  return { duration: bendSeconds + tail, progressAt }
}

/** After Effects trim: show the stroke from its start up to `drawn` along the path. */
export function trimPath(path: SVGPathElement, total: number, drawn: number) {
  const shown = Math.min(total, Math.max(0, drawn))
  path.setAttribute('stroke-dasharray', `${total} ${total}`)
  path.setAttribute('stroke-dashoffset', `${total - shown}`)
}

export function smoothstep(x: number) {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

/** Extra push in the second half, so the camera speeds into the flare's shoulder instead of easing out. */
const RUSH = 0.7

/**
 * Share of the travel covered at progress t. The first half eases in, where the bends draw;
 * the second half keeps that speed and adds RUSH on top of it.
 */
function panShare(t: number) {
  if (t <= 0.5) return 0.5 - 0.5 * Math.cos(Math.PI * t)
  const u = t - 0.5
  return 0.5 + (Math.PI / 2) * u + RUSH * u * u
}

/** Inverse of panShare. */
function progressAtShare(share: number) {
  if (share <= 0.5) return Math.acos(1 - 2 * Math.max(0, share)) / Math.PI
  const c = share - 0.5
  const half = Math.PI / 2
  return Math.min(1, 0.5 + (-half + Math.sqrt(half * half + 4 * RUSH * c)) / (2 * RUSH))
}

/** Pan along the lane the whole way. Zoom builds gradually and centers the lane as it fills. */
export function cameraAt(t: number, travel: number) {
  const pan = panShare(t) * travel
  const zoomT = smoothstep((t - ZOOM_START) / (1 - ZOOM_START))
  return { pan, zoomT }
}

export function placeCamera(
  camera: SVGGElement,
  pan: number,
  zoomT: number,
  laneY: number,
  width: number,
  height: number,
  zoomEnd: number,
) {
  const scale = Math.pow(zoomEnd, zoomT)
  const anchorX = width * 0.5
  const screenY = laneY + (height / 2 - laneY) * zoomT
  camera.setAttribute(
    'transform',
    `translate(${anchorX} ${screenY}) scale(${scale}) translate(${-(anchorX + pan)} ${-laneY})`,
  )
}
