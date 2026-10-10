"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import { motion } from "framer-motion"
import { PROJECTS } from "@/content/site"
import { drawProjectArt, type ArtKind } from "./art"

type Lens = { destroy?: () => void }

function ProjectArt({ seed, kind, w, h }: { seed: number; kind: ArtKind; w: number; h: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current?.getContext("2d")
    if (!ctx) return
    let live = true
    void document.fonts.ready.then(() => {
      if (!live) return
      ctx.setTransform(2, 0, 0, 2, 0, 0)
      drawProjectArt(ctx, w, h, seed, kind)
    })
    return () => {
      live = false
    }
  }, [seed, kind, w, h])
  return <canvas ref={ref} className="pcb-art" width={w * 2} height={h * 2} style={{ aspectRatio: `${w} / ${h}` }} aria-hidden="true" />
}

// Art proportions per slot: the lead board is tall, the rest vary so no two cells match.
const KINDS: ArtKind[] = ["flow", "lanes", "contours", "path"]

const SLOTS = [
  { cls: "slot-a", w: 760, h: 380 },
  { cls: "slot-b", w: 520, h: 300 },
  { cls: "slot-c", w: 560, h: 220 },
  { cls: "slot-d", w: 760, h: 220 },
]

/**
 * The four projects, laid out asymmetrically, each with generated cover art. A liquidGL
 * loupe rests on the lead project and can be dragged over any of them to magnify it.
 */
export default function ProjectPanel({ reducedMotion }: { reducedMotion: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [glass, setGlass] = useState<"pending" | "liquid" | "plain">("pending")

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    let lenses: Lens[] = []
    let cancelled = false

    const start = async () => {
      try {
        const mod = await import("liquid-gl")
        const liquidGL = mod.default
        if (cancelled || typeof liquidGL !== "function") return
        const out = liquidGL({
          target: ".loupe",
          snapshot: ".work-panel",
          resolution: 1.5,
          refraction: 0.018,
          bevelDepth: 0.11,
          bevelWidth: 0.24,
          frost: 0,
          aberration: 0.06,
          magnify: 1.6,
          shadow: true,
          specular: !reducedMotion,
          draggable: true,
          tint: "rgba(43, 80, 255, 0.04)",
          reveal: reducedMotion ? "none" : "fade",
        })
        lenses = Array.isArray(out) ? out : [out]
        const lenis = (window as unknown as { __lenis?: unknown }).__lenis
        if (lenis) liquidGL.syncWith?.({ lenis, gsap: false })
        setGlass("liquid")
      } catch {
        if (!cancelled) setGlass("plain")
      }
    }

    // Boot the GPU lens once the panel is near the viewport and the cards have settled.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        void document.fonts.ready.then(() => setTimeout(start, reducedMotion ? 0 : 1100))
      },
      { rootMargin: "200px" },
    )
    io.observe(panel)
    return () => {
      cancelled = true
      io.disconnect()
      lenses.forEach((l) => l.destroy?.())
    }
  }, [reducedMotion])

  // The card rim lights up under the pointer.
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
  }

  return (
    <div className="work-panel" ref={panelRef} data-glass={glass}>
      {PROJECTS.map((p, i) => {
        const slot = SLOTS[i % SLOTS.length]
        return (
          <motion.article
            key={p.id}
            className={`pcb-card ${slot.cls}`}
            onPointerMove={onMove}
            initial={reducedMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: (i % 2) * 0.12 }}
          >
            <ProjectArt seed={0x51 + i * 977} kind={KINDS[i % KINDS.length]} w={slot.w} h={slot.h} />
            <div className="pcb-body">
              <h3>{p.title}</h3>
              <p className="pcb-meta">
                {p.domain}, {p.year}
              </p>
              <p className="pcb-desc">{p.desc}</p>
              <ul className="pcb-tps" aria-label={`${p.title} highlights`}>
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          </motion.article>
        )
      })}
      <div className="loupe" aria-hidden="true">
        <div className="loupe-content" />
      </div>
    </div>
  )
}
