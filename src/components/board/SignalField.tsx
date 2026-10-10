"use client"

import { useEffect, useRef, useState } from "react"
import { CAUSTICS_WGSL } from "./signalShader"

type RenderPath = "webgpu" | "static" | "pending"

/**
 * Background for the contact section: cobalt caustics drawn with vgpu (WebGPU) while on
 * screen. Without WebGPU, a still CSS rendition of the same light takes its place.
 */
export default function SignalField({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [path, setPath] = useState<RenderPath>("pending")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false
    let cleanup: (() => void) | undefined

    void (async () => {
      try {
        if (!("gpu" in navigator)) throw new Error("no webgpu")
        const { init, surface, effect, frameLoop, clock } = await import("vgpu")
        const gpu = await init()
        if (disposed) return gpu.dispose()

        const surf = surface(gpu, canvas, { dpr: [1, 1.5] })
        const size = () => ({ size: [surf.size[0], surf.size[1]] as [number, number], dpr: surf.dpr })
        const fx = effect(gpu, CAUSTICS_WGSL, { label: "caustics", set: { params: { ...size(), time: 0 } } })
        const offResize = surf.onResize(() => fx.set({ params: size() }))
        const time = clock(gpu)
        let loop: { stop: () => void } | undefined

        const start = () => {
          if (loop) return
          loop = frameLoop(gpu, (frame) => {
            if (!reducedMotion) fx.set({ params: { time: time.time } })
            frame.pass(surf, fx)
          })
        }
        const stop = () => {
          loop?.stop()
          loop = undefined
        }
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "120px" })
        io.observe(canvas)
        setPath("webgpu")

        cleanup = () => {
          io.disconnect()
          stop()
          offResize()
          gpu.dispose()
        }
        if (disposed) cleanup()
      } catch {
        if (!disposed) setPath("static")
      }
    })()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [reducedMotion])

  return (
    <div className="signal-field" data-path={path} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
