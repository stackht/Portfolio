"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import { motion, useMotionValueEvent, useSpring } from "framer-motion"
import { useElementProgress } from "./hooks"
import { NAV } from "@/content/site"

type Geo = { d: string; w: number; h: number; vias: { y: number; x: number; ref: string }[]; labels: boolean }

/**
 * One continuous line through the page. It leaves the status dot under the name, drops
 * into the left gutter and lands on a node beside every section; scrolling draws it.
 */
export default function TraceRail({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [geo, setGeo] = useState<Geo | null>(null)
  const [lit, setLit] = useState(-1)
  const litPath = useRef<SVGPathElement>(null)
  const head = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const root = containerRef.current
    const rail = railRef.current
    if (!root || !rail) return
    const measure = () => {
      const box = rail.getBoundingClientRect()
      const rel = (el: Element | null | undefined) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, top: r.top - box.top }
      }
      const wide = window.innerWidth >= 960
      const laneA = wide ? 14 : 6
      const laneB = wide ? 34 : 6
      const led = rel(root.querySelector(".hero-status .led"))
      const anchors = NAV.map((n) => ({ ref: n.ref, p: rel(document.getElementById(n.id)?.querySelector("[data-via]")) })).filter(
        (a) => a.p,
      ) as { ref: string; p: { y: number } }[]
      if (!led || !anchors.length) return

      // LED → short drop → 45° into lane A.
      let x = laneA
      const dropY = led.y + 28
      let d = `M ${led.x} ${led.y} V ${dropY} L ${x} ${dropY + Math.abs(led.x - x)}`
      const vias: Geo["vias"] = []
      anchors.forEach((a, i) => {
        d += ` V ${a.p.y}`
        vias.push({ y: a.p.y, x, ref: a.ref })
        const next = anchors[i + 1]
        if (next && laneA !== laneB) {
          const mid = (a.p.y + next.p.y) / 2
          const nx = x === laneA ? laneB : laneA
          const jog = Math.abs(nx - x)
          d += ` V ${mid - jog / 2} L ${nx} ${mid + jog / 2}`
          x = nx
        }
      })
      // On phones the line carries on past the last node to the middle of the final screen.
      if (!wide) {
        const last = rel(document.getElementById("contact"))
        if (last && last.y > vias[vias.length - 1].y) d += ` V ${last.y}`
      }
      setGeo({ d, w: box.width, h: root.offsetHeight, vias, labels: wide })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [containerRef])

  const scrollYProgress = useElementProgress(containerRef, [[0, 0], [1, 1]])
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0005 })

  // Sample the path once per layout; measuring SVG geometry on every scroll frame is
  // the single most expensive thing a phone can do here.
  const samples = useRef<{ x: Float32Array; y: Float32Array } | null>(null)
  useEffect(() => {
    const path = litPath.current
    if (!path || !geo) return
    const len = path.getTotalLength()
    const n = Math.max(2, Math.ceil(len / 6))
    const x = new Float32Array(n)
    const y = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const pt = path.getPointAtLength((i / (n - 1)) * len)
      x[i] = pt.x
      y[i] = pt.y
    }
    samples.current = { x, y }
  }, [geo])

  const litRef = useRef(-1)
  useMotionValueEvent(progress, "change", (v) => {
    const s = samples.current
    if (!s || !geo) return
    const i = Math.round(Math.max(0, Math.min(1, v)) * (s.x.length - 1))
    const px = s.x[i]
    const py = s.y[i]
    head.current?.setAttribute("transform", `translate(${px} ${py})`)
    let n = -1
    geo.vias.forEach((via, k) => {
      if (py >= via.y - 2) n = k
    })
    if (n !== litRef.current) {
      litRef.current = n
      setLit(n)
    }
  })

  return (
    <div className="trace-rail" ref={railRef} aria-hidden="true">
      {geo && (
        <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} data-labels={geo.labels}>
          <path d={geo.d} className="rail-masked" />
          <motion.path ref={litPath} d={geo.d} className="rail-lit" style={{ pathLength: progress }} />
          <circle ref={head} r="5" className="rail-head" />
          {geo.vias.map((v, i) => (
            <g key={v.ref} transform={`translate(${v.x} ${v.y})`} className="rail-via" data-lit={i <= lit}>
              <circle r={geo.labels ? 8 : 5} className="ring" />
              <circle r={geo.labels ? 3.4 : 2} className="drill" />
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}
