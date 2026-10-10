"use client"

import { useRef } from "react"
import { motion, useTransform, type MotionValue } from "framer-motion"
import { useElementProgress } from "./hooks"
import { STACKUP } from "@/content/site"

type Layer = (typeof STACKUP)[number]

function Slab({ layer, i, n, p }: { layer: Layer; i: number; n: number; p: MotionValue<number> }) {
  // Collapsed: slabs overlap into one tilted board. Exploded: a flat, readable list.
  const pull = ((n - 1) / 2 - i) * 82
  const y = useTransform(p, [0, 0.65], [pull, 0])
  const rotateX = useTransform(p, [0, 0.65], [56, 0])
  const scale = useTransform(p, [0, 0.65], [0.94, 1])
  const glow = useTransform(p, [0.55 + i * 0.08, 0.7 + i * 0.08], [0, 1])
  return (
    <motion.li className="slab" style={{ y, rotateX, scale, zIndex: n - i }}>
      <motion.span className="slab-foil" style={{ opacity: glow }} aria-hidden="true" />
      <div className="slab-head">
        <span className="slab-id">{layer.id}</span>
        <h3>{layer.name}</h3>
        <span className="slab-note">{layer.note}</span>
      </div>
      <ul className="slab-parts">
        {layer.parts.map((part) => (
          <li key={part.ref}>
            <b>{part.part}</b>
            <span>{part.pkg}</span>
          </li>
        ))}
      </ul>
    </motion.li>
  )
}

/** The stack as a layer stackup that pulls apart as you scroll through it. */
export default function Stackup({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollYProgress = useElementProgress(ref, [[0, 0.75], [1, 0.6]])
  const n = STACKUP.length

  if (reduced) {
    return (
      <ol className="stackup stackup--flat" aria-label="Stackup, top layer first">
        {STACKUP.map((layer) => (
          <li key={layer.id} className="slab">
            <div className="slab-head">
              <span className="slab-id">{layer.id}</span>
              <h3>{layer.name}</h3>
              <span className="slab-note">{layer.note}</span>
            </div>
            <ul className="slab-parts">
              {layer.parts.map((part) => (
                <li key={part.ref}>
                  <b>{part.part}</b>
                  <span>{part.pkg}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div ref={ref} className="stackup-stage">
      <ol className="stackup" aria-label="Stackup, top layer first">
        {STACKUP.map((layer, i) => (
          <Slab key={layer.id} layer={layer} i={i} n={n} p={scrollYProgress} />
        ))}
      </ol>
    </div>
  )
}
