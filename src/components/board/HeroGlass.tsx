"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Lightformer, MeshTransmissionMaterial, PerformanceMonitor } from "@react-three/drei"
import * as THREE from "three"
import { makeNoise, mulberry32 } from "./art"

const COBALT = "#2b50ff"
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x))

/** A soft-bodied glass form: an icosphere whose surface breathes with layered waves. */
function createForm(detail: number) {
  const geo = new THREE.IcosahedronGeometry(1.3, detail)
  const base = Float32Array.from(geo.attributes.position.array)
  return {
    geo,
    update(t: number) {
      const pos = geo.attributes.position as THREE.BufferAttribute
      const a = pos.array as Float32Array
      for (let i = 0; i < a.length; i += 3) {
        const x = base[i]
        const y = base[i + 1]
        const z = base[i + 2]
        const d =
          0.16 * Math.sin(x * 1.7 + t * 0.9) * Math.cos(y * 1.3 - t * 0.7) +
          0.1 * Math.sin(y * 2.6 + z * 1.9 + t * 1.3) +
          0.05 * Math.sin(z * 4.1 - x * 3.2 + t * 1.7)
        a[i] = x * (1 + d)
        a[i + 1] = y * (1 + d)
        a[i + 2] = z * (1 + d)
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()
    },
    dispose() {
      geo.dispose()
    },
  }
}

function GlassForm({ animate, quality }: { animate: boolean; quality: "high" | "low" }) {
  const mesh = useRef<THREE.Mesh>(null)
  const form = useMemo(() => createForm(quality === "high" ? 22 : 8), [quality])
  const tick = useRef(0)
  useEffect(() => {
    form.update(1.2)
    return () => form.dispose()
  }, [form])

  useFrame(({ clock }) => {
    if (!animate) return
    // Phones morph the glass at 30 Hz; recomputing normals is the costly part.
    tick.current += 1
    if (quality === "low" && tick.current % 2) return
    form.update(clock.elapsedTime)
    if (mesh.current) mesh.current.rotation.y = clock.elapsedTime * 0.12
  })

  return (
    <mesh ref={mesh} geometry={form.geo}>
      <MeshTransmissionMaterial
        samples={quality === "high" ? 6 : 2}
        resolution={quality === "high" ? 512 : 192}
        backside={quality === "high"}
        backsideThickness={0.4}
        thickness={0.9}
        roughness={0.04}
        ior={1.38}
        chromaticAberration={0.08}
        anisotropy={0.25}
        distortion={0.35}
        distortionScale={0.45}
        temporalDistortion={animate ? 0.12 : 0}
        clearcoat={1}
        attenuationDistance={2.5}
        attenuationColor="#e9edff"
        color="#ffffff"
      />
    </mesh>
  )
}

/** The things the glass bends: a cobalt ring, a bar and two small spheres orbiting behind it. */
function Backdrop({ animate }: { animate: boolean }) {
  const ring = useRef<THREE.Mesh>(null)
  const orbit = useRef<THREE.Group>(null)
  useFrame(({ clock }, dt) => {
    if (!animate) return
    if (ring.current) {
      ring.current.rotation.x += dt * 0.25
      ring.current.rotation.y += dt * 0.18
    }
    if (orbit.current) orbit.current.rotation.z = clock.elapsedTime * 0.35
  })
  return (
    <group position={[0, 0, -1.6]}>
      <mesh ref={ring} rotation={[0.9, 0.3, 0]}>
        <torusGeometry args={[1.45, 0.09, 32, 160]} />
        <meshStandardMaterial color={COBALT} roughness={0.25} metalness={0.1} emissive={COBALT} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-0.2, -0.15, -0.4]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.16, 2.6, 8, 24]} />
        <meshStandardMaterial color="#0d1117" roughness={0.35} />
      </mesh>
      <group ref={orbit}>
        <mesh position={[1.7, 0.4, 0.3]}>
          <sphereGeometry args={[0.22, 48, 48]} />
          <meshStandardMaterial color={COBALT} roughness={0.2} emissive={COBALT} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[-1.5, -0.9, 0.2]}>
          <sphereGeometry args={[0.13, 48, 48]} />
          <meshStandardMaterial color="#ffffff" roughness={0.15} />
        </mesh>
      </group>
    </group>
  )
}

const PLANE_Z = -6
const CAM_Z = 8
const BACK_Z = -9

const BACKDROP_FRAG = /* glsl */ `
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform float uPortrait;
  varying vec2 vUv;

  // Water-glass caustics: the light pattern the sculpture throws on the paper.
  float caustic(vec2 q, float t) {
    vec2 p = q - vec2(250.0);
    vec2 i = p;
    float c = 1.0;
    float inten = 0.005;
    for (int n = 0; n < 4; n++) {
      float tt = t * (1.0 - 3.5 / float(n + 1));
      i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
      c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
    }
    c /= 4.0;
    c = 1.17 - pow(c, 1.4);
    return clamp(pow(abs(c), 8.0), 0.0, 1.0);
  }

  void main() {
    vec2 p = vUv * uRes;
    vec2 m = uMouse * uRes;
    float scale = uRes.x / 1440.0;
    vec3 bg = vec3(0.953, 0.957, 0.965);
    vec3 cobalt = vec3(0.169, 0.314, 1.0);
    vec3 col = bg;

    // Resting light pool behind the sculpture, breathing slowly.
    vec2 home = uPortrait > 0.5 ? vec2(0.5, 0.3) : vec2(0.72, 0.5);
    float rHome = (uPortrait > 0.5 ? 0.55 : 0.45) * (1.0 + 0.04 * sin(uTime * 0.6));
    float pool = exp(-pow(length((vUv - home) * vec2(uRes.x / uRes.y, 1.0)) / rHome, 2.0) * 2.2);
    col = mix(col, cobalt, pool * 0.16);

    // Caustics pooled around the sculpture, drifting as the glass breathes.
    if (pool > 0.04) {
      vec2 cq = (vUv - home) * vec2(uRes.x / uRes.y, 1.0) * 7.0;
      float light = caustic(cq, uTime * 0.45 + 17.0);
      col = mix(col, cobalt, light * pool * 0.32);
      col = mix(col, vec3(1.0), light * pool * 0.35);
    }

    // A second, lower pool under the copy so the left side carries light too.
    vec2 low = uPortrait > 0.5 ? vec2(0.15, 0.85) : vec2(0.14, 0.16);
    float pool2 = exp(-pow(length((vUv - low) * vec2(uRes.x / uRes.y, 1.0)) / 0.42, 2.0) * 2.0);
    col = mix(col, cobalt, pool2 * 0.1);

    // The cursor carries its own pool of cobalt light.
    float dm = length(p - m) / (360.0 * scale);
    float halo = exp(-dm * dm * 2.4) * uHover;
    col = mix(col, cobalt, halo * 0.14);

    // The copy side stays calmer, so text over it keeps its contrast.
    float u = uPortrait > 0.5 ? 1.0 - vUv.y : vUv.x;
    float calm = 1.0 - smoothstep(uPortrait > 0.5 ? 0.42 : 0.4, uPortrait > 0.5 ? 0.62 : 0.58, u);

    // Dot grid that swells and tints under the cursor, like a lens over paper.
    float cell = 28.0 * scale;
    vec2 q = p - m;
    float lens = exp(-dot(q, q) / pow(220.0 * scale, 2.0)) * uHover * mix(1.0, 0.4, calm);
    vec2 g = m + q * (1.0 - 0.28 * lens);
    vec2 f = mod(g, cell) - 0.5 * cell;
    float r = (1.1 + 1.6 * lens) * scale;
    float dotMask = 1.0 - smoothstep(r, r + 1.0, length(f));
    vec3 dotCol = mix(vec3(0.051, 0.067, 0.09), cobalt, lens);
    col = mix(col, dotCol, dotMask * (0.14 + 0.5 * lens));

    col = mix(col, bg, calm * 0.35);

    // Colours above are already sRGB, so write them straight out.
    gl_FragColor = vec4(col, 1.0);
  }
`

const BACKDROP_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

function createBackdrop() {
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.75, 0.5) },
    uHover: { value: 0 },
    uTime: { value: 0 },
    uPortrait: { value: 0 },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: BACKDROP_VERT,
    fragmentShader: BACKDROP_FRAG,
    depthWrite: false,
    toneMapped: false,
  })
  const target = new THREE.Vector2(0.75, 0.5)
  return {
    material,
    resize(w: number, h: number, portrait: boolean) {
      uniforms.uRes.value.set(w, h)
      uniforms.uPortrait.value = portrait ? 1 : 0
    },
    update(px: number, py: number, hovering: boolean, t: number, dt: number, animate: boolean) {
      const k = 1 - Math.exp(-dt * 5)
      target.set(px * 0.5 + 0.5, py * 0.5 + 0.5)
      uniforms.uMouse.value.lerp(target, k)
      uniforms.uHover.value += ((hovering && animate ? 1 : 0) - uniforms.uHover.value) * k
      if (animate) uniforms.uTime.value = t
    },
    dispose() {
      material.dispose()
    },
  }
}

/** Full-frame backdrop behind the glass: light pools and a dot grid that follow the cursor. */
function InteractiveBackdrop({ animate }: { animate: boolean }) {
  const { size, camera } = useThree()
  const fov = (camera as THREE.PerspectiveCamera).fov
  const portrait = size.width / size.height < 0.9
  const dims = useMemo(() => {
    const h = 2 * (CAM_Z - BACK_Z) * Math.tan(THREE.MathUtils.degToRad(fov / 2))
    return { w: h * (size.width / size.height), h }
  }, [fov, size.width, size.height])
  const back = useMemo(() => createBackdrop(), [])
  useEffect(() => back.resize(size.width, size.height, portrait), [back, size.width, size.height, portrait])
  useEffect(() => () => back.dispose(), [back])
  const hovering = useRef(false)
  useEffect(() => {
    const on = () => (hovering.current = true)
    const off = () => (hovering.current = false)
    window.addEventListener("pointermove", on)
    document.documentElement.addEventListener("pointerleave", off)
    return () => {
      window.removeEventListener("pointermove", on)
      document.documentElement.removeEventListener("pointerleave", off)
    }
  }, [])
  useFrame(({ pointer, clock }, dt) => {
    back.update(pointer.x, pointer.y, hovering.current, clock.elapsedTime, Math.min(dt, 0.05), animate)
  })
  return (
    <mesh position={[0, 0, BACK_Z]} material={back.material} renderOrder={-1}>
      <planeGeometry args={[dims.w * 1.02, dims.h * 1.02]} />
    </mesh>
  )
}

/**
 * Flow lines drawn as real geometry behind the glass. Each vertex remembers its rest
 * position; the cursor pushes nearby vertices away and they spring back.
 */
function createFlowField(width: number, height: number, portrait: boolean) {
  const noise = makeNoise(7)
  const rnd = mulberry32(11)
  const bg = new THREE.Color("#f3f4f6")
  const ink = new THREE.Color("#0d1117")
  const cobalt = new THREE.Color("#2b50ff")
  const rest: number[] = []
  const colors: number[] = []
  const index: number[] = []
  const tmp = new THREE.Color()
  const steps = 56
  const count = portrait ? 45 : 120
  for (let i = 0; i < count; i++) {
    let x = (rnd() - 0.5) * width * 1.1
    let y = (rnd() - 0.5) * height * 1.1
    const hot = i % 9 === 0
    const start = rest.length / 3
    for (let k = 0; k < steps; k++) {
      // Fade toward the paper colour on the copy side (left on wide screens, top on tall).
      const u = portrait ? 1 - (y / height + 0.5) : x / width + 0.5
      const calm = THREE.MathUtils.smoothstep(u, portrait ? 0.38 : 0.36, portrait ? 0.62 : 0.6)
      const strength = hot ? 0.9 * (0.22 + 0.78 * calm) : 0.3 * (0.5 + 0.5 * calm)
      tmp.copy(bg).lerp(hot ? cobalt : ink, strength)
      rest.push(x, y, 0)
      colors.push(tmp.r, tmp.g, tmp.b)
      if (k > 0) index.push(start + k - 1, start + k)
      const a = noise(x * 0.32 + 40, y * 0.32 + 40) * Math.PI * 2
      x += Math.cos(a) * 0.075
      y += Math.sin(a) * 0.075
    }
  }
  const restArr = Float32Array.from(rest)
  const offset = new Float32Array(restArr.length)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(Float32Array.from(restArr), 3))
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  geo.setIndex(index)
  const material = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false })
  return {
    geo,
    material,
    /** px, py: cursor on the plane; active: whether the cursor is over the hero. */
    update(px: number, py: number, active: boolean, t: number, dt: number) {
      const pos = geo.attributes.position.array as Float32Array
      const R = Math.min(width, height) * 0.22
      const k = 1 - Math.exp(-dt * 6)
      for (let i = 0; i < restArr.length; i += 3) {
        const bx = restArr[i]
        const by = restArr[i + 1]
        let tx = Math.sin(by * 0.6 + t * 0.4) * 0.04
        let ty = Math.cos(bx * 0.5 + t * 0.35) * 0.04
        if (active) {
          const dx = bx - px
          const dy = by - py
          const d = Math.hypot(dx, dy)
          if (d < R && d > 0.0001) {
            const f = Math.pow(1 - d / R, 2) * R * 0.45
            tx += (dx / d) * f
            ty += (dy / d) * f
          }
        }
        offset[i] += (tx - offset[i]) * k
        offset[i + 1] += (ty - offset[i + 1]) * k
        pos[i] = bx + offset[i]
        pos[i + 1] = by + offset[i + 1]
      }
      geo.attributes.position.needsUpdate = true
    },
    dispose() {
      geo.dispose()
      material.dispose()
    },
  }
}

function FlowLines({ animate }: { animate: boolean }) {
  const { size, camera } = useThree()
  const fov = (camera as THREE.PerspectiveCamera).fov
  const dims = useMemo(() => {
    const h = 2 * (CAM_Z - PLANE_Z) * Math.tan(THREE.MathUtils.degToRad(fov / 2))
    return { w: h * (size.width / size.height), h }
  }, [fov, size.width, size.height])
  const portrait = size.width / size.height < 0.9
  const field = useMemo(() => createFlowField(dims.w, dims.h, portrait), [dims, portrait])
  useEffect(() => () => field.dispose(), [field])
  const hovering = useRef(false)

  useEffect(() => {
    const on = () => (hovering.current = true)
    const off = () => (hovering.current = false)
    window.addEventListener("pointermove", on)
    document.documentElement.addEventListener("pointerleave", off)
    return () => {
      window.removeEventListener("pointermove", on)
      document.documentElement.removeEventListener("pointerleave", off)
    }
  }, [])

  useFrame(({ pointer, clock }, dt) => {
    if (!animate) return
    field.update((pointer.x * dims.w) / 2, (pointer.y * dims.h) / 2, hovering.current, clock.elapsedTime, Math.min(dt, 0.05))
  })

  return <lineSegments geometry={field.geo} material={field.material} position={[0, 0, PLANE_Z]} />
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Reports ready once a few frames have rendered, so the canvas fades in fully drawn. */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    frames.current += 1
    if (frames.current >= 3) {
      done.current = true
      onReady?.()
    }
  })
  return null
}

function Rig({ animate, quality, staged }: { animate: boolean; quality: "high" | "low"; staged: boolean }) {
  const group = useRef<THREE.Group>(null)
  const shadow = useRef<THREE.Group>(null)
  const { size, camera } = useThree()
  const portrait = size.width / size.height < 0.9
  const intro = useRef(animate ? 0 : 1)
  const floorY = portrait ? -3.3 : -1.75

  const releasedAt = useRef<number | null>(null)

  useFrame(({ pointer, clock }, dt) => {
    const g = group.current
    if (!g) return
    if (!staged && releasedAt.current === null) releasedAt.current = clock.elapsedTime
    intro.current = Math.min(1, intro.current + dt / 1.8)
    const e = easeOutExpo(intro.current)
    const scroll = window.scrollY / Math.max(1, window.innerHeight)
    // A slower, filmic glide for the move from centre stage to the side.
    const gliding = releasedAt.current !== null && clock.elapsedTime - releasedAt.current < 2
    const k = 1 - Math.exp(-dt * (staged ? 3 : gliding ? 1.8 : 4))

    // Where the menu orb sits, in world units on the sculpture's plane.
    const fov = (camera as THREE.PerspectiveCamera).fov
    const halfH = CAM_Z * Math.tan(THREE.MathUtils.degToRad(fov / 2))
    const halfW = halfH * (size.width / size.height)
    const phone = size.width <= 760
    const gutter = phone ? 16 : Math.min(56, Math.max(16, size.width * 0.04))
    const orbR = phone ? 26 : 29
    const orbX = ((size.width - gutter - orbR) / size.width) * 2 - 1
    const orbY = -((((phone ? 10 : 16) + orbR) / size.height) * 2 - 1)

    // Scrolling out of the hero carries the glass up into the orb.
    const fly = animate ? smooth(0.05, 0.8, scroll) : 0
    const homeX = staged ? 0 : portrait ? 0 : 2.05
    const homeY = staged ? (portrait ? 0.15 : 0) : portrait ? -1.9 : 0
    const baseX = homeX + (animate ? pointer.x * 0.25 : 0) * (1 - fly)
    const baseY = homeY + (animate ? pointer.y * 0.18 : 0) * (1 - fly)
    const tx = THREE.MathUtils.lerp(baseX, orbX * halfW, fly)
    const ty = THREE.MathUtils.lerp(baseY, orbY * halfH, fly)
    g.position.x += (tx - g.position.x) * k
    g.position.y += (ty - g.position.y) * k
    g.rotation.x += ((animate ? -pointer.y * 0.35 : 0) * (1 - fly) - g.rotation.x) * k
    g.rotation.y += ((animate ? pointer.x * 0.45 : 0) + fly * Math.PI * 1.5 - g.rotation.y) * k
    const rest = (staged ? (portrait ? 0.82 : 0.95) : portrait ? 0.6 : 0.72) * (0.55 + 0.45 * e)
    const orbScale = (orbR / (size.height / 2)) * halfH / 1.3
    const target = THREE.MathUtils.lerp(rest, orbScale, fly)
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * k)
    if (shadow.current) shadow.current.position.y = floorY - fly * 4
  })

  return (
    <>
      <group ref={group}>
        <GlassForm animate={animate} quality={quality} />
        <Backdrop animate={animate} />
      </group>
      {quality === "high" && <ContactShadows
        ref={shadow}
        position={[portrait ? 0 : 2.05, floorY, 0]}
        opacity={0.22}
        scale={8}
        blur={2.8}
        far={4}
        resolution={128}
        color="#1c2a66"
        frames={animate ? Infinity : 1}
      />}
    </>
  )
}

export default function HeroGlass({
  active,
  reducedMotion,
  staged = false,
  onReady,
}: {
  active: boolean
  reducedMotion: boolean
  /** Boot sequence: hold the glass centre-stage until the rest of the page arrives. */
  staged?: boolean
  onReady?: () => void
}) {
  // Phones start on the lighter glass; PerformanceMonitor can still step desktops down.
  const [quality, setQuality] = useState<"high" | "low">(() =>
    window.matchMedia("(max-width: 760px)").matches ? "low" : "high",
  )
  return (
    <Canvas
      className="hero-canvas"
      // Listen on the whole hero so the lines still react under the headline and buttons.
      eventSource={document.getElementById("top") ?? undefined}
      eventPrefix="client"
      dpr={[1, quality === "high" ? 1.5 : 1]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 30, near: 0.1, far: 40, position: [0, 0, CAM_Z] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05

      }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setQuality("low")} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[-4, 3, 4]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[5, -1, 3]} scale={[3, 6, 1]} />
        <Lightformer form="ring" intensity={3} color={COBALT} position={[0, 4, -4]} scale={3} />
        <Lightformer form="rect" intensity={1.5} position={[0, -5, 2]} scale={[10, 1, 1]} />
      </Environment>
      <color attach="background" args={["#f3f4f6"]} />
      <ReadySignal onReady={onReady} />
      <InteractiveBackdrop animate={!reducedMotion} />
      <FlowLines animate={!reducedMotion} />
      <Rig animate={!reducedMotion} quality={quality} staged={staged} />
    </Canvas>
  )
}
