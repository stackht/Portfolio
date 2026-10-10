"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { NAV, PERSON } from "@/content/site"
import { setReducedMotion, useActiveSection, useReducedMotion } from "./hooks"

const IDS = NAV.map((n) => n.id)
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Navigation as a glass orb. Closed, it is a small refracting sphere in the corner;
 * open, the glass stretches out to the left into a capsule holding the sections.
 */
export default function TopNav({ onJump }: { onJump: (id: string) => void }) {
  const active = useActiveSection(IDS)
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const orbRef = useRef<HTMLButtonElement>(null)

  const close = useCallback((restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) orbRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    // A click anywhere outside the capsule folds it back into the orb.
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onDown)
    }
  }, [open, close])

  return (
    <>
      <a
        className="brand"
        href="#top"
        onClick={(e) => {
          e.preventDefault()
          onJump("top")
        }}
      >
        <span className="mark-dot" aria-hidden="true" />
        {PERSON.name}
      </a>

      <div className="orb-dock" ref={rootRef} data-open={open}>
        <AnimatePresence>
          {open && (
            <motion.nav
              id="orb-menu"
              className="orb-capsule"
              aria-label="Sections"
              initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 0 100% round 999px)" }}
              animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0 0% round 999px)" }}
              exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 0 100% round 999px)" }}
              transition={{ duration: reduced ? 0.15 : 0.7, ease: EASE }}
            >
              <ul>
                {NAV.map((n, i) => (
                  <motion.li
                    key={n.id}
                    initial={reduced ? false : { opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    // Items nearest the orb appear first, as the glass sweeps left.
                    transition={{ duration: 0.55, ease: EASE, delay: 0.12 + (NAV.length - 1 - i) * 0.05 }}
                  >
                    <a
                      href={`#${n.id}`}
                      aria-current={active === n.id ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        close(false)
                        onJump(n.id)
                      }}
                    >
                      {n.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              {/* Motion is on by default; visitors who need calm can switch it off here. */}
              <button
                type="button"
                className="motion-toggle"
                aria-pressed={!reduced}
                onClick={() => setReducedMotion(!reduced)}
                title={reduced ? "Turn animations on" : "Turn animations off"}
              >
                <i aria-hidden="true" />
                Motion {reduced ? "off" : "on"}
              </button>
            </motion.nav>
          )}
        </AnimatePresence>

        <button
          ref={orbRef}
          type="button"
          className="orb"
          data-open={open}
          aria-expanded={open}
          aria-controls="orb-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="orb-glass" aria-hidden="true">
            <i className="orb-ring" />
            <i className="orb-core" />
          </span>
          <span className="orb-bars" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </div>
    </>
  )
}
