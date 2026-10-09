/** Pronounced S curve: slow depart, quick middle, soft settle. */
export const CHOREO = [0.8, 0, 0.2, 1] as const

function bezierAxis(t: number, a: number, b: number): number {
  const inverted = 1 - t
  return 3 * inverted * inverted * t * a + 3 * inverted * t * t * b + t * t * t
}

/** Solves a CSS style cubic-bezier for GSAP, which accepts an ease function. */
export function cubicBezier([x1, y1, x2, y2]: readonly [number, number, number, number]) {
  return (progress: number): number => {
    if (progress <= 0) return 0
    if (progress >= 1) return 1

    let low = 0
    let high = 1
    let t = progress

    for (let i = 0; i < 20; i += 1) {
      const x = bezierAxis(t, x1, x2)
      if (Math.abs(x - progress) < 0.0005) break
      if (x < progress) low = t
      else high = t
      t = (low + high) / 2
    }

    return bezierAxis(t, y1, y2)
  }
}

export const choreoEase = cubicBezier(CHOREO)
