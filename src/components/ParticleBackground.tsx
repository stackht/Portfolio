"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Component, Suspense, useMemo, useRef, type ReactNode } from "react"
import * as THREE from "three"

/* Error boundary so the page survives WebGL failures */
class GLGuard extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() {
    return { err: true }
  }
  render() {
    return this.state.err ? null : this.props.children
  }
}

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 768
const N = IS_SMALL ? 500 : 1200

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/* Five pre-computed formations, one per page section */
function buildFormations(n: number): Float32Array[] {
  const rng = () => Math.random()
  const out: Float32Array[] = []

  // 0 — HERO: dense sphere
  const a0 = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const th = rng() * Math.PI * 2
    const ph = Math.acos(rng() * 2 - 1)
    const r = 3.2 + (rng() - 0.5) * 1.2
    a0[i * 3] = r * Math.sin(ph) * Math.cos(th)
    a0[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
    a0[i * 3 + 2] = r * Math.cos(ph)
  }
  out.push(a0)

  // 1 — ABOUT: wide galaxy disc
  const a1 = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const angle = rng() * Math.PI * 2
    const arm = Math.floor(rng() * 3)
    const armAngle = angle + arm * ((Math.PI * 2) / 3)
    const r = 1.5 + rng() * 5
    a1[i * 3] = r * Math.cos(armAngle + r * 0.25)
    a1[i * 3 + 1] = (rng() - 0.5) * 0.8
    a1[i * 3 + 2] = r * Math.sin(armAngle + r * 0.25)
  }
  out.push(a1)

  // 2 — SKILLS: 3D constellation grid
  const a2 = new Float32Array(n * 3)
  const side = Math.cbrt(n) | 0
  for (let i = 0; i < n; i++) {
    a2[i * 3] = ((i % side) / side - 0.5) * 9 + (rng() - 0.5) * 0.4
    a2[i * 3 + 1] = ((((i / side) | 0) % side) / side - 0.5) * 9 + (rng() - 0.5) * 0.4
    a2[i * 3 + 2] = ((i / (side * side) | 0) / side - 0.5) * 9 + (rng() - 0.5) * 0.4
  }
  out.push(a2)

  // 3 — PROJECTS: double helix
  const a3 = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 12
    const strand = (i % 2) * Math.PI
    const r = 2.8
    a3[i * 3] = r * Math.cos(t + strand)
    a3[i * 3 + 1] = (i / n) * 12 - 6
    a3[i * 3 + 2] = r * Math.sin(t + strand)
  }
  out.push(a3)

  // 4 — CONTACT: tight vortex converging to centre
  const a4 = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 24
    const r = (1 - i / n) * 4
    a4[i * 3] = r * Math.cos(t)
    a4[i * 3 + 1] = (rng() - 0.5) * r * 0.5
    a4[i * 3 + 2] = r * Math.sin(t)
  }
  out.push(a4)

  return out
}

/* Morphing wireframe core orb */
function CoreOrb({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const time = useRef(0)

  useFrame((_, delta) => {
    time.current += delta
    if (!meshRef.current) return
    const s = scrollRef.current
    meshRef.current.rotation.y = time.current * 0.18
    meshRef.current.rotation.x = time.current * 0.09
    meshRef.current.scale.setScalar(0.4 + (1 - s) * 0.6)
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    const hue = 0.57 + s * 0.15
    mat.emissive.setHSL(hue, 1, 0.4)
    mat.color.setHSL(hue, 0.9, 0.55)
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 4]} />
      <meshStandardMaterial
        color="#38bdf8"
        emissive="#0ea5e9"
        emissiveIntensity={1.8}
        metalness={0.6}
        roughness={0.1}
        wireframe
      />
    </mesh>
  )
}

/* Interactive particle field */
function Particles({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<number>
}) {
  const { camera } = useThree()
  const formations = useMemo(() => buildFormations(N), [])
  const pointsRef = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(formations[0]), 3))
    const colors = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const t = Math.random()
      if (t < 0.38) {
        colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.72; colors[i * 3 + 2] = 1.0
      } else if (t < 0.68) {
        colors[i * 3] = 0.55; colors[i * 3 + 1] = 0.35; colors[i * 3 + 2] = 0.98
      } else {
        colors[i * 3] = 0.88; colors[i * 3 + 1] = 0.93; colors[i * 3 + 2] = 1.0
      }
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return g
  }, [formations])

  const live = useMemo(() => new Float32Array(formations[0]), [formations])
  const camWaypoints = useMemo(
    () =>
      [
        [0, 0, 9.5],
        [0, 1, 12],
        [3, 2, 11],
        [1.5, 0, 10],
        [0, 0, 7],
      ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    [],
  )
  const camPos = useRef(new THREE.Vector3(0, 0, 9.5))

  useFrame((_, delta) => {
    const posAttr = geometry.attributes.position as THREE.BufferAttribute
    if (!posAttr) return

    const scroll = Math.max(0, Math.min(1, scrollRef.current))

    const nForms = formations.length
    const segLen = 1 / (nForms - 1)
    const seg = Math.min(Math.floor(scroll / segLen), nForms - 2)
    const rawT = (scroll - seg * segLen) / segLen
    const t = easeInOut(Math.max(0, Math.min(1, rawT)))

    const fA = formations[seg]
    const fB = formations[seg + 1]

    const lerpK = 1 - Math.pow(0.02, delta)

    const pos = posAttr.array as Float32Array

    for (let i = 0; i < N; i++) {
      const idx = i * 3
      const tx = fA[idx] * (1 - t) + fB[idx] * t
      const ty = fA[idx + 1] * (1 - t) + fB[idx + 1] * t
      const tz = fA[idx + 2] * (1 - t) + fB[idx + 2] * t

      live[idx] += (tx - live[idx]) * lerpK
      live[idx + 1] += (ty - live[idx + 1]) * lerpK
      live[idx + 2] += (tz - live[idx + 2]) * lerpK

      pos[idx] = live[idx]
      pos[idx + 1] = live[idx + 1]
      pos[idx + 2] = live[idx + 2]
    }
    posAttr.needsUpdate = true

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04
    }

    const targetCam = camWaypoints[seg].clone().lerp(camWaypoints[seg + 1], t)
    camPos.current.lerp(targetCam, 0.04)
    camera.position.copy(camPos.current)
    camera.lookAt(0, 0, 0)
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.048}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function Scene({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<number>
}) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight color="#38bdf8" intensity={20} position={[4, 3, 5]} distance={18} />
      <pointLight color="#818cf8" intensity={10} position={[-4, -3, 2]} distance={14} />
      <Suspense fallback={null}>
        <Particles scrollRef={scrollRef} />
        <CoreOrb scrollRef={scrollRef} />
      </Suspense>
    </>
  )
}

export default function ParticleBackground({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<number>
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <GLGuard>
        <Canvas
          dpr={[0.6, 1.25]}
          camera={{ position: [0, 0, 9.5], fov: 50 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.6,
            alpha: false,
          }}
          style={{ background: "#23212C" }}
        >
          <Scene scrollRef={scrollRef} />
        </Canvas>
      </GLGuard>
    </div>
  )
}
