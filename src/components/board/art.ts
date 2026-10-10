// Generative cover art for the project cards, drawn on a 2D canvas. Each project gets a
// drawing that hints at its subject; colours follow the site palette.

const INK = "13,17,23"
const COBALT = "#2b50ff"
const PAPER = "#eceef2"

export function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smooth 2D value noise in [-1, 1]. */
export function makeNoise(seed: number) {
  const rnd = mulberry32(seed)
  const g = Array.from({ length: 256 }, () => rnd() * 2 - 1)
  const h = (x: number, y: number) => g[(((x * 73856093) ^ (y * 19349663)) >>> 0) % 256]
  const s = (t: number) => t * t * (3 - 2 * t)
  return (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const u = s(x - xi)
    const v = s(y - yi)
    const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u
    const b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u
    return a + (b - a) * v
  }
}

export type ArtKind = "flow" | "lanes" | "contours" | "path"

export function drawProjectArt(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, kind: ArtKind) {
  const rnd = mulberry32(seed)
  const noise = makeNoise(seed)
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, w, h)
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  if (kind === "flow") {
    // Streamlines through a noise field: data moving through a model.
    for (let i = 0; i < 260; i++) {
      let x = rnd() * w
      let y = rnd() * h
      const hot = i % 37 === 0
      ctx.strokeStyle = hot ? COBALT : `rgba(${INK},${0.12 + rnd() * 0.22})`
      ctx.lineWidth = hot ? 2 : 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      for (let s = 0; s < 70; s++) {
        const a = noise(x * 0.004, y * 0.004) * Math.PI * 2.2
        x += Math.cos(a) * 4
        y += Math.sin(a) * 4
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  } else if (kind === "lanes") {
    // Scheduler lanes: one row per core, blocks of work packed along time.
    const lanes = 6
    const pad = 28
    const lh = (h - pad * 2) / lanes
    for (let l = 0; l < lanes; l++) {
      const y = pad + l * lh
      ctx.fillStyle = `rgba(${INK},0.06)`
      ctx.fillRect(pad, y + lh * 0.2, w - pad * 2, lh * 0.6)
      let x = pad + rnd() * 30
      while (x < w - pad - 20) {
        const bw = 18 + rnd() * 90
        const hot = rnd() < 0.12
        ctx.fillStyle = hot ? COBALT : `rgba(${INK},${0.55 + rnd() * 0.35})`
        ctx.beginPath()
        ctx.roundRect(x, y + lh * 0.26, Math.min(bw, w - pad - x), lh * 0.48, 4)
        ctx.fill()
        x += bw + 6 + rnd() * 24
      }
    }
  } else if (kind === "contours") {
    // Interference: contour lines of two overlapping wave sources.
    const sx = [w * 0.35, w * 0.68]
    const sy = [h * 0.45, h * 0.58]
    const step = 4
    for (let level = -0.9; level <= 0.9; level += 0.18) {
      const hot = Math.abs(level) < 0.05
      ctx.fillStyle = hot ? COBALT : `rgba(${INK},0.5)`
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const d1 = Math.hypot(x - sx[0], y - sy[0])
          const d2 = Math.hypot(x - sx[1], y - sy[1])
          const v = (Math.sin(d1 * 0.06) + Math.sin(d2 * 0.06)) / 2
          if (Math.abs(v - level) < 0.035) ctx.fillRect(x, y, hot ? 2 : 1.4, hot ? 2 : 1.4)
        }
      }
    }
  } else {
    // A flight path over a survey grid, with waypoints.
    ctx.fillStyle = `rgba(${INK},0.35)`
    for (let y = 16; y < h; y += 22) for (let x = 16; x < w; x += 22) ctx.fillRect(x - 1, y - 1, 2, 2)
    const pts: [number, number][] = []
    for (let i = 0; i <= 8; i++) {
      const x = 40 + (i / 8) * (w - 80)
      pts.push([x, h * 0.5 + noise(i * 0.7, 3) * h * 0.38])
    }
    ctx.strokeStyle = `rgba(${INK},0.25)`
    ctx.setLineDash([4, 6])
    ctx.lineWidth = 1
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + 18) : ctx.moveTo(x, y + 18)))
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = COBALT
    ctx.lineWidth = 2.5
    ctx.beginPath()
    pts.forEach(([x, y], i) => {
      if (!i) return ctx.moveTo(x, y)
      const [px, py] = pts[i - 1]
      ctx.bezierCurveTo((px + x) / 2, py, (px + x) / 2, y, x, y)
    })
    ctx.stroke()
    pts.forEach(([x, y], i) => {
      ctx.fillStyle = i === pts.length - 1 ? COBALT : "#ffffff"
      ctx.strokeStyle = COBALT
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, i === pts.length - 1 ? 7 : 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })
  }
}
