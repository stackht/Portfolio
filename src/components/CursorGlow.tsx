"use client"

import { useEffect, useRef, useState } from "react"

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [big, setBig] = useState(false)
  const shown = useRef(false)

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return

    const style = document.createElement("style")
    style.id = "pf-cursor-style"
    style.textContent = `
      html, body { cursor: none !important; }
      * { cursor: none !important; }
      a, button, input, select, textarea, [role="button"] { cursor: none !important; }
      ::selection { background: #38bdf8; color: #000; }
    `
    document.head.appendChild(style)

    const onMove = (e: MouseEvent) => {
      shown.current = true
      setPos({ x: e.clientX, y: e.clientY })
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const interactive = !!t.closest("a,button,input,select,textarea,[role=button],.cm-round-link,.terminal-tab,.cm-mark,label,.pf-card,.pf-glitch")
      setBig(interactive)
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseover", onOver, { passive: true })

    return () => {
      style.remove()
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseover", onOver)
    }
  }, [])

  if (!shown.current) return null

  const { x, y } = pos

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99999,
          width: big ? 44 : 36,
          height: big ? 44 : 36,
          marginLeft: big ? -22 : -18,
          marginTop: big ? -22 : -18,
          border: "1px solid rgba(56,189,248,0.7)",
          borderRadius: "50%",
          transform: `translate(${x}px,${y}px)`,
          transition: "width 0.3s, height 0.3s, margin 0.3s, border-color 0.3s",
          mixBlendMode: "screen",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99999,
          width: 5,
          height: 5,
          marginLeft: -2.5,
          marginTop: -2.5,
          background: "#38bdf8",
          borderRadius: "50%",
          transform: `translate(${x}px,${y}px)`,
          boxShadow: "0 0 8px #38bdf8",
        }}
      />
    </>
  )
}
