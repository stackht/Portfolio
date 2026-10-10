"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { X } from "@phosphor-icons/react"
import { WRITING, WRITING_IS_SAMPLE, type WritingForm } from "@/content/site"
import { RevealHeading, Rise } from "./motion"

type Piece = (typeof WRITING)[number]
const EASE = [0.16, 1, 0.3, 1] as const
const TABS: ("All" | WritingForm)[] = ["All", "Shayari", "Poem", "Song"]
const TAB_LABEL: Record<string, string> = { All: "All", Shayari: "Shayari", Poem: "Poems", Song: "Songs" }
const noop = () => () => {}

/** The first lines of a piece, skipping section labels like [Chorus]. */
const excerpt = (p: Piece) => p.lines.filter((l) => l && !l.startsWith("[")).slice(0, 2)

/** A tiny equaliser for song pages; it only moves while the card is hovered or focused. */
function Equaliser() {
  return (
    <span className="eq" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, i) => (
        <i key={i} style={{ ["--d" as string]: `${(i * 0.13) % 0.7}s` }} />
      ))}
    </span>
  )
}

function Reader({ piece, onClose }: { piece: Piece; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    const lenis = (window as unknown as { __lenis?: { stop?: () => void; start?: () => void } }).__lenis
    lenis?.stop?.()
    document.documentElement.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.documentElement.style.overflow = ""
      lenis?.start?.()
    }
  }, [onClose])

  const isSong = piece.form === "Song"
  return (
    <motion.div
      className="reader"
      role="dialog"
      aria-modal="true"
      aria-label={piece.title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.article
        className={`sheet${isSong ? " sheet--song" : ""}`}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <header>
          <span className="sheet-form">
            {piece.form} · {piece.lang} · {piece.year}
          </span>
          <h3>{piece.title}</h3>
          {isSong && (
            <span className="sheet-score">
              <span>Key {piece.key}</span>
              <span>{piece.tempo}</span>
              <span>Words & music: Hemant Thakur</span>
            </span>
          )}
        </header>
        <div className="verse">
          {piece.lines.map((line, i) =>
            line === "" ? (
              <span key={i} className="stanza-break" aria-hidden="true" />
            ) : line.startsWith("[") ? (
              <span key={i} className="section-mark">
                {line.slice(1, -1)}
              </span>
            ) : (
              <motion.span
                key={i}
                className="line"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.25 + i * 0.06 }}
              >
                {line}
              </motion.span>
            ),
          )}
        </div>
        {WRITING_IS_SAMPLE && <p className="sheet-note">Sample piece, written as a stand-in. The real verses are coming soon.</p>}
      </motion.article>
      <button ref={closeRef} type="button" className="reader-close" onClick={onClose}>
        <X weight="bold" aria-hidden="true" />
        <span>Close</span>
      </button>
    </motion.div>
  )
}

/** Shayari, poems and songs as pages of a notebook; songs sit on staff paper. */
export default function Writing({ reduced }: { reduced: boolean }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All")
  const [open, setOpen] = useState<Piece | null>(null)
  const canPortal = useSyncExternalStore(noop, () => true, () => false)
  const pieces = tab === "All" ? WRITING : WRITING.filter((p) => p.form === tab)

  return (
    <section id="writing" className="sec writing" aria-labelledby="writing-h">
      <div className="writing-head">
        <RevealHeading id="writing-h" text="Words, between the code." reduced={reduced} via />
        <Rise reduced={reduced}>
          <p className="sec-lead">Shayari, poems and songs I write and compose. Open any page to read it in full.</p>
        </Rise>
      </div>
      <div className="writing-tabs" role="tablist" aria-label="Filter writing">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {TAB_LABEL[t]}
            {tab === t && <motion.i layoutId="tab-ink" className="tab-ink" transition={{ duration: 0.5, ease: EASE }} />}
          </button>
        ))}
      </div>
      <LayoutGroup>
        <motion.ul className="pages" layout={!reduced}>
          <AnimatePresence mode="popLayout">
            {pieces.map((p, i) => (
              <motion.li
                key={p.id}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
              >
                <button type="button" className={`page page--${p.form.toLowerCase()}`} onClick={() => setOpen(p)}>
                  <span className="page-form">
                    {p.form} · {p.year}
                  </span>
                  <span className="page-title">{p.title}</span>
                  <span className="page-excerpt">
                    {excerpt(p).map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </span>
                  {p.form === "Song" ? (
                    <span className="page-foot">
                      <Equaliser />
                      <span>
                        {p.key} · {p.tempo}
                      </span>
                    </span>
                  ) : (
                    <span className="page-foot">
                      <span>{p.lang}</span>
                    </span>
                  )}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
      {WRITING_IS_SAMPLE && <p className="writing-note">Sample pieces, written as stand-ins. The real verses are coming soon.</p>}
      {canPortal &&
        createPortal(<AnimatePresence>{open && <Reader key={open.id} piece={open} onClose={() => setOpen(null)} />}</AnimatePresence>, document.body)}
    </section>
  )
}
