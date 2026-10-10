"use client"

import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useElementProgress } from "./hooks"
import { PROJECTS } from "@/content/site"
import { drawProjectArt, type ArtKind } from "./art"

type Lens = { destroy?: () => void }

const noop = () => () => {}
const isCoarsePointer = () => window.matchMedia("(pointer: coarse)").matches

const KINDS: ArtKind[] = ["flow", "lanes", "contours", "path"]

const SLOTS = [
  { cls: "slot-a", w: 760, h: 380 },
  { cls: "slot-b", w: 520, h: 300 },
  { cls: "slot-c", w: 560, h: 220 },
  { cls: "slot-d", w: 760, h: 220 },
]

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
  return <canvas ref={ref} className="pcb-art" width={w * 2} height={h * 2} aria-hidden="true" />
}

type Project = (typeof PROJECTS)[number]

/** One project: tilts toward the cursor, and its art drifts slower than the card as you scroll. */
function ProjectCard({
  p,
  i,
  slot,
  reduced,
  touch,
}: {
  p: Project
  i: number
  slot: (typeof SLOTS)[number]
  reduced: boolean
  touch: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, { stiffness: 160, damping: 18 })
  const rotateY = useSpring(ry, { stiffness: 160, damping: 18 })
  const scrollYProgress = useElementProgress(ref, [[0, 1], [1, 0]])
  const artY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"])

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    e.currentTarget.style.setProperty("--mx", `${x}px`)
    e.currentTarget.style.setProperty("--my", `${y}px`)
    if (reduced || e.pointerType !== "mouse") return
    ry.set((x / r.width - 0.5) * 7)
    rx.set(-(y / r.height - 0.5) * 7)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.article
      ref={ref}
      className={`pcb-card ${slot.cls}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      // Touch screens never tilt, so they skip the 3D layer entirely.
      style={reduced || touch ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: (i % 2) * 0.12 }}
    >
      <div className="pcb-art-wrap" style={{ aspectRatio: `${slot.w} / ${slot.h}` }}>
        <motion.div className="pcb-art-move" style={reduced ? undefined : { y: artY }}>
          <ProjectArt seed={0x51 + i * 977} kind={KINDS[i % KINDS.length]} w={slot.w} h={slot.h} />
        </motion.div>
      </div>
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
}

// Art proportions per slot: the lead board is tall, the rest vary so no two cells match.
/**
 * The four projects, laid out asymmetrically, each with generated cover art. A liquidGL
 * loupe rests on the lead project and can be dragged over any of them to magnify it.
 */
export default function ProjectPanel({ reducedMotion }: { reducedMotion: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [glass, setGlass] = useState<"pending" | "liquid" | "plain">("pending")

  // Touch screens skip the lens: dragging it is awkward there and it costs a full DOM snapshot.
  const touch = useSyncExternalStore(noop, isCoarsePointer, () => false)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || touch) return
    let lenses: Lens[] = []
    let cancelled = false
    let running = false
    let firstRun = true
    let timer: ReturnType<typeof setTimeout> | undefined

    const start = async () => {
      if (running) return
      running = true
      try {
        const mod = await import("liquid-gl")
        const liquidGL = mod.default
        if (cancelled || !running || typeof liquidGL !== "function") return
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
        running = false
        if (!cancelled) setGlass("plain")
      }
    }

    // liquidGL renders every frame while any lens exists, so the lens only lives while
    // the panel is on screen. Destroying the last lens stops its render loop entirely.
    const stop = () => {
      clearTimeout(timer)
      if (!running) return
      running = false
      const old = lenses
      lenses = []
      setGlass("pending")
      // Tear down only once scrolling has settled: destroying a WebGL context mid-scroll
      // drops frames, and the lens is hidden in the meantime anyway.
      let settle: ReturnType<typeof setTimeout> | undefined
      const later = () => {
        clearTimeout(settle)
        settle = setTimeout(() => {
          window.removeEventListener("scroll", later)
          old.forEach((l) => l.destroy?.())
        }, 700)
      }
      window.addEventListener("scroll", later, { passive: true })
      later()
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return stop()
        clearTimeout(timer)
        // First time, let the cards finish their entrance before the snapshot is taken.
        const delay = firstRun && !reducedMotion ? 1100 : 150
        firstRun = false
        void document.fonts.ready.then(() => {
          timer = setTimeout(start, delay)
        })
      },
      { rootMargin: "80px" },
    )
    io.observe(panel)
    return () => {
      cancelled = true
      io.disconnect()
      stop()
    }
  }, [reducedMotion, touch])

  return (
    <div className="work-panel" ref={panelRef} data-glass={touch ? "plain" : glass}>
      {PROJECTS.map((p, i) => (
        <ProjectCard key={p.id} p={p} i={i} slot={SLOTS[i % SLOTS.length]} reduced={reducedMotion} touch={touch} />
      ))}
      <div className="loupe" aria-hidden="true">
        <div className="loupe-content" />
      </div>
    </div>
  )
}
