"use client"

import { useEffect, useRef, useState } from "react"

const OCTAVES = 4
// Within an octave of seven white keys, a black key sits after C, D, F, G and A.
const BLACK_AFTER = [0, 1, 3, 4, 5]

/**
 * A silent piano along the foot of the page. When it scrolls in, a run of keys goes down left
 * to right like an arpeggio; afterwards keys dip under the cursor or a finger. Purely visual.
 */
export default function Keys({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [played, setPlayed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPlayed(true)
          io.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  // Touch has no hover, so a finger sliding across the keys presses them in turn.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let last: Element | null = null
    const press = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return
      const k = document.elementFromPoint(e.clientX, e.clientY)
      if (k === last) return
      last?.classList.remove("down")
      if (k && el.contains(k) && k.classList.contains("key")) {
        k.classList.add("down")
        last = k
      } else last = null
    }
    const lift = () => {
      last?.classList.remove("down")
      last = null
    }
    el.addEventListener("pointerdown", press)
    el.addEventListener("pointermove", press)
    window.addEventListener("pointerup", lift)
    window.addEventListener("pointercancel", lift)
    return () => {
      el.removeEventListener("pointerdown", press)
      el.removeEventListener("pointermove", press)
      window.removeEventListener("pointerup", lift)
      window.removeEventListener("pointercancel", lift)
    }
  }, [])

  const whites = OCTAVES * 7
  const blacks: { at: number; i: number }[] = []
  for (let o = 0; o < OCTAVES; o++) for (const b of BLACK_AFTER) blacks.push({ at: o * 7 + b + 1, i: blacks.length })

  return (
    <div className="keys" ref={ref} aria-hidden="true" data-played={played || undefined}>
      {Array.from({ length: whites }, (_, i) => (
        <i key={i} className="key w" style={{ "--i": i } as React.CSSProperties} />
      ))}
      {blacks.map((b) => (
        <i
          key={`b${b.i}`}
          className="key b"
          data-hi={b.at > 14 || undefined}
          style={{ "--at": b.at, "--i": b.at - 0.5 } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
