"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion"
import Lenis from "lenis"
import CursorGlow from "./CursorGlow"
import SocialFlipButton, { type SocialItem } from "./ui/SocialFlipButton"
import { FaGithub, FaLinkedin, FaFileDownload } from "react-icons/fa"
import LiquidMetalButton from "./ui/LiquidMetalButton"
import AsciiGlitchRipple from "./ui/AsciiGlitchRipple"
import CylinderCarousel from "./ui/CylinderCarousel"
import TypingKeyboard from "./ui/TypingKeyboard"
import NotchNavbar from "./NotchNavbar"
import type { BookCfg } from "./ui/books-showcase"

const ParticleBackground = dynamic(() => import("./ParticleBackground"), { ssr: false })
const BooksShowcase = dynamic(() => import("./ui/books-showcase"), { ssr: false })

const EMAIL = "hello@hemant.dev"
const GITHUB_URL = "https://github.com/hemantthakur"
const LINKEDIN_URL = "https://linkedin.com/in/hemantthakur"
const RESUME_URL = "#"

const SOCIAL_ITEMS: SocialItem[] = [
  { letter: "G", icon: <FaGithub />, label: "GitHub", href: GITHUB_URL },
  { letter: "L", icon: <FaLinkedin />, label: "LinkedIn", href: LINKEDIN_URL },
  { letter: "R", icon: <FaFileDownload />, label: "Resume", onClick: () => window.location.href = RESUME_URL },
]

const tools = ["C", "C++", "Python", "Rust", "TypeScript", "React", "Next.js", "Node.js", "Three.js", "WebGL", "PostgreSQL", "Docker", "Linux", "Git"]

const experience = [
  ["01", "Research Fellow", "Built accessible tooling for a research group — turning internal workflows into something anyone could use."],
  ["02", "Predictive ML", "Designed predictive models for heavy industrial machinery, cutting unplanned downtime."],
  ["03", "Systems Intern", "Worked on multi-core ARMv8 architectures and custom OS internals — where silicon meets software."],
  ["04", "Open Source", "Contributed to open research projects, making complex systems legible and reproducible."],
]

const stats = [
  ["4+", "Projects shipped"],
  ["12+", "Technologies"],
  ["01", "Mission: elegant code, real impact"],
]

const METAL = { colorBack: "#888888", colorTint: "#38bdf8" }

const skillShowcase = [
  { name: "C", tag: "Systems" },
  { name: "C++", tag: "Systems" },
  { name: "Rust", tag: "Systems" },
  { name: "Python", tag: "ML · Tools" },
  { name: "TypeScript", tag: "Web" },
  { name: "React", tag: "Web" },
  { name: "Next.js", tag: "Web" },
  { name: "Node.js", tag: "Backend" },
  { name: "Three.js", tag: "WebGL" },
  { name: "WebGL", tag: "Graphics" },
  { name: "PostgreSQL", tag: "Data" },
  { name: "Docker", tag: "DevOps" },
]

const BS_THEME = {
  navy: "#2A2734",
  pink: "#38bdf8",
  cream: "#f0f6ff",
  lav: "#a5c6ff",
  peri: "#38bdf8",
}

function paintCover(
  x: CanvasRenderingContext2D,
  w: number,
  h: number,
  o: { num: string; title: string; sub: string },
) {
  const g = x.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, "#322E3F")
  g.addColorStop(1, "#23212C")
  x.fillStyle = g
  x.fillRect(0, 0, w, h)
  x.strokeStyle = "rgba(56,189,248,0.14)"
  x.lineWidth = 2
  for (let i = 1; i < 10; i++) {
    x.beginPath()
    x.moveTo(0, (h * i) / 10)
    x.lineTo(w, (h * i) / 10)
    x.stroke()
  }
  for (let i = 1; i < 6; i++) {
    x.beginPath()
    x.moveTo((w * i) / 6, 0)
    x.lineTo((w * i) / 6, h)
    x.stroke()
  }
  x.fillStyle = "#38bdf8"
  x.fillRect(70, 130, 96, 6)
  x.font = "600 34px 'JetBrains Mono', monospace"
  x.textAlign = "left"
  x.fillText(o.num, 70, 210)
  x.fillStyle = "#f0f6ff"
  x.textAlign = "center"
  x.font = "700 84px Georgia"
  const words = o.title.split(" ")
  let line = ""
  const lines: string[] = []
  words.forEach((word) => {
    const test = line ? line + " " + word : word
    if (x.measureText(test).width > w * 0.8 && line) {
      lines.push(line)
      line = word
    } else line = test
  })
  if (line) lines.push(line)
  const startY = h * 0.5 - ((lines.length - 1) * 92) / 2
  lines.forEach((l, i) => x.fillText(l, w / 2, startY + i * 92))
  x.fillStyle = "rgba(240,246,255,0.6)"
  x.font = "500 30px 'JetBrains Mono', monospace"
  x.fillText(o.sub, w / 2, h - 150)
  x.strokeStyle = "rgba(56,189,248,0.4)"
  x.lineWidth = 4
  x.strokeRect(52, 52, w - 104, h - 104)
}

const PROJECT_BOOKS: BookCfg[] = [
  { id: "neuralbridge", title: "NeuralBridge", author: "ML · Embedded", year: "2024", stars: 5, desc: "Predictive machine learning for heavy industrial machinery — deployed models, not demos.", edge: "#334155", backBg: "#2A2734", backInk: "240,246,255", spineBg: "#322E3F", spineInk: "#f0f6ff", spineFont: "700 42px Georgia", chapters: ["The Problem", "Data Pipeline", "Model Training", "Deployment", "Field Results"], front: (x, w, h) => paintCover(x, w, h, { num: "01", title: "NeuralBridge", sub: "ML · EMBEDDED" }) },
  { id: "kernelflow", title: "KernelFlow", author: "Systems · ARMv8", year: "2024", stars: 5, desc: "Low-level tooling for multi-core ARMv8 architectures and custom OS internals.", edge: "#334155", backBg: "#2A2734", backInk: "240,246,255", spineBg: "#322E3F", spineInk: "#f0f6ff", spineFont: "700 42px Georgia", chapters: ["Architecture", "Scheduler", "IPC", "ARMv8 Port", "Benchmarks"], front: (x, w, h) => paintCover(x, w, h, { num: "02", title: "KernelFlow", sub: "SYSTEMS · ARMv8" }) },
  { id: "quantumsim", title: "QuantumSim", author: "Research · Sim", year: "2023", stars: 5, desc: "A quantum circuit simulator built to make simulation accessible to curious minds.", edge: "#334155", backBg: "#2A2734", backInk: "240,246,255", spineBg: "#322E3F", spineInk: "#f0f6ff", spineFont: "700 42px Georgia", chapters: ["Qubits", "Gates", "State Vector", "WebGL View", "UX"], front: (x, w, h) => paintCover(x, w, h, { num: "03", title: "QuantumSim", sub: "RESEARCH · SIM" }) },
  { id: "aerobot", title: "AeroBot", author: "Robotics · Auto", year: "2023", stars: 5, desc: "An autonomous drone platform with perception and control, deployed on ARM targets.", edge: "#334155", backBg: "#2A2734", backInk: "240,246,255", spineBg: "#322E3F", spineInk: "#f0f6ff", spineFont: "700 42px Georgia", chapters: ["Perception", "SLAM", "Control", "ARM Target", "Flight Logs"], front: (x, w, h) => paintCover(x, w, h, { num: "04", title: "AeroBot", sub: "ROBOTICS · AUTO" }) },
]

function useTypewriter(text: string, speed: number = 40) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return { displayed, done }
}

function AnimatedTelemetry() {
  const [vals, setVals] = useState({ temp: "36.8", signal: "87", packets: "1,442" })

  useEffect(() => {
    const tick = () => {
      setVals({
        temp: (36 + Math.random() * 3).toFixed(1),
        signal: (70 + Math.random() * 28).toFixed(0),
        packets: (1200 + Math.random() * 800).toFixed(0),
      })
    }
    const interval = setInterval(tick, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <span>CORE {vals.temp}Â°</span>
      <span>MEM {vals.signal}%</span>
      <span>REQ {vals.packets}</span>
    </>
  )
}

function FloatingParticles() {
  const parts = useRef<React.ReactElement[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const rng = () => 0.5 + Math.random()
    parts.current = Array.from({ length: 14 }).map((_, i) => (
      <div
        key={i}
        className="cm-particle"
        style={{
          left: `${rng() * 50}%`,
          top: `${rng() * 50}%`,
          width: `${2 + rng() * 3}px`,
          height: `${2 + rng() * 3}px`,
          animationDelay: `${rng() * 8}s`,
          animationDuration: `${9 + rng() * 9}s`,
        }}
      />
    ))
    setMounted(true)
  }, [])

  return <div className="cm-floating-particles" aria-hidden="true">{mounted && parts.current}</div>
}

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)
  const lines = ["HEMANT THAKUR", "HEMANT.DEV // PORTFOLIO", "INITIALIZING SCENES", "LOADING EXPERIENCE"]
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    let seen = null
    try {
      seen = sessionStorage.getItem("pf_booted")
    } catch {
      /* private mode */
    }
    if (seen) {
      onCompleteRef.current()
      return
    }
    try {
      sessionStorage.setItem("pf_booted", "1")
    } catch {
      /* private mode */
    }
  }, [])

  useEffect(() => {
    if (phase >= lines.length) {
      const timer = setTimeout(() => onCompleteRef.current(), 1400)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setPhase((p) => p + 1), 200 + phase * 170)
    return () => clearTimeout(timer)
  }, [phase])

  if (phase >= lines.length) return null

  return (
    <div className="pf-boot" role="status" aria-label="Loading">
      <div className="pf-boot-mark"><AsciiGlitchRipple as="span">HT</AsciiGlitchRipple><span>.</span></div>
      <div className="pf-boot-lines">
        {lines.slice(0, phase + 1).map((line, i) => (
          <div key={i} style={{ animationDelay: `${i * 0.14}s` }}>
            <AsciiGlitchRipple as="span">{line}</AsciiGlitchRipple>
          </div>
        ))}
      </div>
      <div className="pf-boot-bar"><i /></div>
    </div>
  )
}

function Kicker({ num, word }: { num: string; word: string }) {
  const [revealed, setRevealed] = useState(false)
  const { displayed, done } = useTypewriter(word, 45)

  return (
    <motion.div className="pf-kicker" onViewportEnter={() => setRevealed(true)}>
      <span className="pf-kicker-num"><AsciiGlitchRipple as="span">{num}</AsciiGlitchRipple></span>
      <span className="pf-kicker-rule" />
      <span className="pf-kicker-word">
        {revealed && <AsciiGlitchRipple as="span">{displayed}</AsciiGlitchRipple>}
        {!done && revealed && <b>|</b>}
      </span>
    </motion.div>
  )
}

function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const carouselRef = useRef<((dir: 1 | -1) => void) | null>(null)
  const pendingRef = useRef(0)
  const targetRef = useRef(0)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    targetRef.current = Math.min(
      PROJECT_BOOKS.length - 1,
      Math.max(0, Math.floor(v * PROJECT_BOOKS.length)),
    )
  })

  useEffect(() => {
    const id = setInterval(() => {
      if (pendingRef.current < targetRef.current) {
        pendingRef.current++
        carouselRef.current?.(1)
      } else if (pendingRef.current > targetRef.current) {
        pendingRef.current--
        carouselRef.current?.(-1)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="work" ref={sectionRef} className="pf-work-scroll">
      <div className="pf-work-scroll-sticky">
        <Kicker num="03" word="Projects" />
        <div className="pf-work-head">
          <h2>
            <AsciiGlitchRipple as="span">Built to </AsciiGlitchRipple>
            <em><AsciiGlitchRipple as="span">matter.</AsciiGlitchRipple></em>
          </h2>
          <p><AsciiGlitchRipple as="span">Four projects. Keep scrolling — the shelf turns with you.</AsciiGlitchRipple></p>
        </div>
        <div className="pf-books">
          <BooksShowcase
            books={PROJECT_BOOKS}
            themeColors={BS_THEME}
            heroTitle=""
            showNav={false}
            showCarousel={false}
            carouselRef={carouselRef}
          />
        </div>
      </div>
    </section>
  )
}

export default function PortfolioExperience() {
  const scrollRef = useRef(0)
  const [bootComplete, setBootComplete] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 })
  const heroY = useTransform(progress, [0, 0.18], ["0%", "18%"])
  const heroOpacity = useTransform(progress, [0, 0.14], [1, 0])

  const { displayed: kickerText, done: kickerDone } = useTypewriter("computer engineering student", 32)

  useEffect(() => {
    const t = setTimeout(() => setBootComplete(true), 7000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.05, smoothWheel: true, syncTouch: true })
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      const total = document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current = total > 0 ? Math.min(1, Math.max(0, lenis.scroll / total)) : 0
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  const jumpTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }, [])

  return (
    <div className="pf-site">
      <ParticleBackground scrollRef={scrollRef} />
      {!bootComplete && <BootSequence onComplete={() => setBootComplete(true)} />}
      <div className="pf-grain" aria-hidden="true" />
      <CursorGlow />
      <FloatingParticles />
      <motion.div className="pf-progress" style={{ scaleX: progress }} />

      <NotchNavbar />

      <section id="top" className="pf-hero">
        <div className="pf-hero-glow" aria-hidden="true" />
        <div className="pf-telemetry" aria-hidden="true">
          <AnimatedTelemetry />
        </div>
        <motion.div className="pf-hero-copy" style={{ y: heroY, opacity: heroOpacity }}>
          <p className="pf-hero-kicker">
            <span>&gt;</span> <AsciiGlitchRipple as="span">{kickerText}</AsciiGlitchRipple>
            {!kickerDone && <b>|</b>}
          </p>
          <h1>
            <span className="pf-hero-name"><AsciiGlitchRipple as="span">Hemant</AsciiGlitchRipple></span>
            <span className="pf-hero-name pf-hero-name-last"><AsciiGlitchRipple as="span">Thakur</AsciiGlitchRipple><span className="pf-hero-dot">.</span></span>
          </h1>
          <div className="pf-hero-bottom">
            <p>
              <AsciiGlitchRipple as="span">Where the boundary of silicon and software blurs — </AsciiGlitchRipple>
              <em><AsciiGlitchRipple as="span">elegant code, real impact.</AsciiGlitchRipple></em>
            </p>
            <div className="pf-hero-cta-row">
              <LiquidMetalButton size="lg" metalConfig={METAL} icon={<span>↓</span>} onClick={() => jumpTo("work")}><AsciiGlitchRipple as="span">Explore Work</AsciiGlitchRipple></LiquidMetalButton>
              <LiquidMetalButton size="lg" metalConfig={METAL} icon={<span>↗</span>} onClick={() => jumpTo("contact")}><AsciiGlitchRipple as="span">Get In Touch</AsciiGlitchRipple></LiquidMetalButton>
            </div>
          </div>
        </motion.div>
        <div className="pf-hero-index"><AsciiGlitchRipple as="span">01</AsciiGlitchRipple> <span>/</span> <AsciiGlitchRipple as="span">05</AsciiGlitchRipple></div>
        <div className="pf-hero-meta">
          <span><AsciiGlitchRipple as="span">COMPUTER ENGINEERING</AsciiGlitchRipple></span>
          <span><AsciiGlitchRipple as="span">OPEN TO WORK</AsciiGlitchRipple></span>
        </div>
      </section>

      <main className="pf-main">
        <section id="about" className="pf-about">
          <Kicker num="01" word="About" />
          <motion.h2
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <AsciiGlitchRipple as="span">Curious by </AsciiGlitchRipple>
            <em><AsciiGlitchRipple as="span">design.</AsciiGlitchRipple></em>
          </motion.h2>
          <div className="pf-about-grid">
            <p><AsciiGlitchRipple as="span">I&apos;m Hemant — a Computer Engineering student who works at the boundary of hardware and software, from custom OS internals to the browser.</AsciiGlitchRipple></p>
            <p><AsciiGlitchRipple as="span">I learn by building, and I build things I would use myself — precise, deliberate, and measured by outcomes, not demos.</AsciiGlitchRipple></p>
          </div>
          <motion.div
            className="pf-about-quote"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span><AsciiGlitchRipple as="span">asks:</AsciiGlitchRipple></span>
            <p><AsciiGlitchRipple as="span">What becomes possible when every layer of the stack is genuinely understood?</AsciiGlitchRipple></p>
          </motion.div>
        </section>

        <section id="skills" className="pf-skills">
          <Kicker num="02" word="Skills" />
          <h2 className="pf-section-title">
            <AsciiGlitchRipple as="span">What I build </AsciiGlitchRipple>
            <em><AsciiGlitchRipple as="span">with.</AsciiGlitchRipple></em>
          </h2>
          <p className="pf-skills-lead"><AsciiGlitchRipple as="span">A toolkit assembled through late nights and long iterations — from bare-metal C to the browser.</AsciiGlitchRipple></p>
          <div className="pf-skill-carousel">
            <CylinderCarousel
              images={skillShowcase.map((s) => ({ src: "", alt: s.name }))}
              cardWidth={230}
              animationDuration={40}
              renderCard={(_item, i) => (
                <div className="pf-skill-card">
                  <span className="pf-skill-card-idx"><AsciiGlitchRipple as="span">{String(i + 1).padStart(2, "0")}</AsciiGlitchRipple></span>
                  <h3><AsciiGlitchRipple as="span">{skillShowcase[i].name}</AsciiGlitchRipple></h3>
                  <p><AsciiGlitchRipple as="span">{skillShowcase[i].tag}</AsciiGlitchRipple></p>
                </div>
              )}
            />
          </div>
        </section>

        <section className="pf-stats">
          {stats.map(([value, label], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <strong><AsciiGlitchRipple as="span">{value}</AsciiGlitchRipple></strong>
              <span><AsciiGlitchRipple as="span">{label}</AsciiGlitchRipple></span>
            </motion.div>
          ))}
        </section>

        <section className="pf-marquee" aria-label="Tools">
          <div>
            <div className="pf-marquee-track">
              {tools.map((item) => (
                <span key={item}><AsciiGlitchRipple as="span">{item}</AsciiGlitchRipple><i>✦</i></span>
              ))}
            </div>
            <div className="pf-marquee-track" aria-hidden="true">
              {tools.map((item) => (
                <span key={item}><AsciiGlitchRipple as="span">{item}</AsciiGlitchRipple><i>✦</i></span>
              ))}
            </div>
          </div>
        </section>

        <ProjectsSection />

        <section id="experience" className="pf-exp">
          <Kicker num="04" word="Experience" />
          <div className="pf-exp-head">
            <h2>
              <AsciiGlitchRipple as="span">Where I&apos;ve </AsciiGlitchRipple>
              <em><AsciiGlitchRipple as="span">been.</AsciiGlitchRipple></em>
            </h2>
            <p><AsciiGlitchRipple as="span">Four stops that shaped how I think about practice — not just a skill.</AsciiGlitchRipple></p>
          </div>
          <div className="pf-exp-list">
            {experience.map(([number, title, copy], index) => (
              <motion.article
                key={number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <span className="pf-exp-num"><AsciiGlitchRipple as="span">{number}</AsciiGlitchRipple></span>
                <h3><AsciiGlitchRipple as="span">{title}</AsciiGlitchRipple></h3>
                <p><AsciiGlitchRipple as="span">{copy}</AsciiGlitchRipple></p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="contact" className="pf-contact">
          <div className="pf-contact-glass">
            <Kicker num="05" word="Contact" />
            <div className="pf-contact-inner">
            <h2>
              <AsciiGlitchRipple as="span">Let&apos;s build something</AsciiGlitchRipple><br />
              <em><AsciiGlitchRipple as="span">great.</AsciiGlitchRipple></em>
            </h2>
            <p className="pf-contact-lead"><AsciiGlitchRipple as="span">Open to internships, research, and ambitious engineering problems.</AsciiGlitchRipple></p>
            <div className="pf-contact-actions">
              <div className="pf-contact-left">
                <div className="pf-contact-email-row">
                  <a className="pf-contact-email" href={`mailto:${EMAIL}`}><AsciiGlitchRipple as="span">{EMAIL}</AsciiGlitchRipple></a>
                </div>
                <div className="pf-contact-links">
                  {[
                    { label: "GitHub", href: GITHUB_URL, external: true },
                    { label: "LinkedIn", href: LINKEDIN_URL, external: true },
                    { label: "Resume", href: RESUME_URL, external: false },
                  ].map(({ label, href, external }) => (
                    <LiquidMetalButton
                      key={label}
                      size="md"
                      className="px-10"
                      metalConfig={METAL}
                      onClick={() => {
                        if (external) window.open(href, "_blank")
                        else window.location.href = href
                      }}
                    >
                      {label}
                    </LiquidMetalButton>
                  ))}
                </div>
                <div className="pf-social-flip">
                  <SocialFlipButton items={SOCIAL_ITEMS} />
                </div>
              </div>
              <div className="pf-contact-kb" aria-hidden="true">
                <TypingKeyboard autoTypeText="Lets build something great together. Open to internships, research, and ambitious engineering problems. Reach out at hello dot hemant dot dev       " accentColor="#38bdf8" secondaryAccent="#818cf8" scale={0.55} />
              </div>
            </div>
            <p className="pf-contact-note"><AsciiGlitchRipple as="span">If you&apos;re working on something hard — let&apos;s talk.</AsciiGlitchRipple></p>
          </div>
          </div>
        </section>
      </main>
    </div>
  )
}
