"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Lenis from "lenis"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ArrowUpRight,
  Check,
  Copy,
  EnvelopeSimple,
  FileText,
  GithubLogo,
  LinkedinLogo,
} from "@phosphor-icons/react"
import { ABOUT, EXPERIENCE, LINKS, PERSON } from "@/content/site"
import { useInView, useReducedMotion, useWebGL } from "./hooks"
import TopNav from "./TopNav"
import TraceRail from "./TraceRail"
import ProjectPanel from "./ProjectPanel"
import Stackup from "./Stackup"
import { Magnetic, RevealHeading, Rise, ScrollLitText } from "./motion"

const HeroGlass = dynamic(() => import("./HeroGlass"), { ssr: false })
const SignalField = dynamic(() => import("./SignalField"), { ssr: false })

const EASE = [0.16, 1, 0.3, 1] as const

function Hero({ onJump, reduced }: { onJump: (id: string) => void; reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const gl = useWebGL()
  const [ready, setReady] = useState(false)

  // Always keep an end state: reduced motion is detected after mount, and dropping
  // `animate` at that point would leave these stuck at their hidden starting style.
  const intro = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: reduced ? { duration: 0 } : { duration: 1, ease: EASE, delay: 0.55 + i * 0.1 },
  })

  return (
    <section id="top" className="hero" ref={ref} aria-labelledby="hero-name">
      <div className="hero-stage" data-ready={ready}>
        {/* Still glass for browsers without WebGL, and the poster while three.js loads. */}
        <div className="glass-poster" data-hidden={gl && ready} aria-hidden="true">
          <i />
        </div>
        {gl && <HeroGlass active={inView} reducedMotion={reduced} onReady={() => setReady(true)} />}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-copy">
        <h1 id="hero-name" className="hero-name" aria-label={PERSON.name}>
          {PERSON.name.split(" ").map((line, i) => (
            <span key={line} className="rv-mask" aria-hidden="true">
              <motion.span
                className="rv-word"
                initial={reduced ? false : { y: "108%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p className="hero-role" {...intro(0)}>
          Computer engineering student building across the stack, from bare-metal C and OS internals to machine
          learning and the browser.
        </motion.p>
        <motion.div className="hero-actions" {...intro(1)}>
          <Magnetic reduced={reduced}>
            <a
              className="pad pad--ink"
              href="#work"
              onClick={(e) => {
                e.preventDefault()
                onJump("work")
              }}
            >
              See the work
            </a>
          </Magnetic>
          <Magnetic reduced={reduced}>
            <a
              className="pad pad--line"
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                onJump("contact")
              }}
            >
              Contact
            </a>
          </Magnetic>
        </motion.div>
        <motion.p className="hero-status" {...intro(2)}>
          <i className="led" aria-hidden="true" />
          {PERSON.status}
        </motion.p>
      </div>
    </section>
  )
}

function About({ reduced }: { reduced: boolean }) {
  return (
    <section id="about" className="sec about" aria-labelledby="about-h">
      <RevealHeading id="about-h" text={ABOUT.heading} reduced={reduced} via />
      <ScrollLitText className="about-statement" text={ABOUT.body[0]} reduced={reduced} />
      <div className="about-foot">
        <Rise reduced={reduced} className="about-body">
          <p>{ABOUT.body[1]}</p>
        </Rise>
        <dl className="facts">
          {ABOUT.specs.map(([k, v], i) => (
            <Rise key={k} reduced={reduced} i={i + 1}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </Rise>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Stack({ reduced }: { reduced: boolean }) {
  return (
    <section id="stack" className="sec stack" aria-labelledby="stack-h">
      <div className="stack-intro">
        <RevealHeading id="stack-h" text={ABOUT.question} reduced={reduced} via className="stack-h" />
        <Rise reduced={reduced}>
          <p className="stack-lead">
            My toolkit, layer by layer. The interface sits on top, and the bottom layer is the one closest to the
            silicon.
          </p>
        </Rise>
      </div>
      <Stackup reduced={reduced} />
    </section>
  )
}

function Work({ reduced }: { reduced: boolean }) {
  return (
    <section id="work" className="sec work" aria-labelledby="work-h">
      <RevealHeading id="work-h" text="Built to matter." reduced={reduced} via />
      <Rise reduced={reduced}>
        <p className="sec-lead">Four projects, each with its own generated cover. Drag the glass lens over any of them to look closer.</p>
      </Rise>
      <ProjectPanel reducedMotion={reduced} />
    </section>
  )
}

function Log({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 45%"] })
  const cursor = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const n = EXPERIENCE.length
  return (
    <section id="log" className="sec log" aria-labelledby="log-h">
      <RevealHeading id="log-h" text="Where I've been." reduced={reduced} via />
      <Rise reduced={reduced}>
        <p className="sec-lead">Read it like a logic analyser: each line went high for a while, and each one changed how I work.</p>
      </Rise>
      <div className="analyser" ref={ref}>
        <div className="ruler" aria-hidden="true">
          <span>Earlier</span>
          <span>Now</span>
        </div>
        <ol className="channels">
          {EXPERIENCE.map((x, i) => {
            const w = 400
            const slot = w / n
            const x0 = slot * i + 6
            const x1 = slot * (i + 1) - 6
            const d = `M0 30 H${x0} L${x0 + 6} 6 H${x1 - 6} L${x1} 30 H${w}`
            return (
              <li key={x.ch} className="channel">
                <span className="ch-id">{x.ch}</span>
                <div className="wave-wrap" aria-hidden="true">
                  <svg className="wave" viewBox="0 0 400 36" preserveAspectRatio="none">
                    <path d={d} />
                  </svg>
                </div>
                <div className="ch-text">
                  <h3>{x.title}</h3>
                  <p>{x.copy}</p>
                </div>
              </li>
            )
          })}
        </ol>
        {!reduced && (
          <div className="cursor-track" aria-hidden="true">
            <motion.i style={{ left: cursor }} />
          </div>
        )}
      </div>
    </section>
  )
}

function Contact({ reduced }: { reduced: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${LINKS.email}`
    }
  }
  const links: { label: string; detail: string; href: string | null; icon: React.ReactNode; external?: boolean }[] = [
    { label: "Email", detail: LINKS.email, href: `mailto:${LINKS.email}`, icon: <EnvelopeSimple weight="regular" /> },
    { label: "GitHub", detail: "Code and experiments", href: LINKS.github, icon: <GithubLogo weight="regular" />, external: true },
    { label: "LinkedIn", detail: "Experience and education", href: LINKS.linkedin, icon: <LinkedinLogo weight="regular" />, external: true },
    { label: "Résumé", detail: LINKS.resume ? "One-page PDF" : "Coming soon", href: LINKS.resume, icon: <FileText weight="regular" /> },
  ]
  return (
    <section id="contact" className="contact" aria-labelledby="contact-h">
      <SignalField reducedMotion={reduced} />
      <div className="contact-inner">
        <RevealHeading id="contact-h" text="Let's build something great." reduced={reduced} via />
        <Rise reduced={reduced}>
          <p className="contact-lead">Open to internships, research, and ambitious engineering problems.</p>
        </Rise>
        <Rise reduced={reduced} i={1}>
          <div className="contact-email">
            <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
            <button type="button" className="pad pad--line copy" onClick={copy} aria-live="polite">
              {copied ? <Check weight="bold" aria-hidden="true" /> : <Copy weight="bold" aria-hidden="true" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          {LINKS.placeholder && <p className="placeholder-note">Placeholder address. Final contact details are on the way.</p>}
        </Rise>
      </div>
      <nav className="links" aria-label="Contact links">
        <ul>
          {links.map((l, i) => (
            <motion.li
              key={l.label}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -6% 0px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.07 }}
            >
                {l.href ? (
                  <a href={l.href} {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}>
                    <span className="link-icon">{l.icon}</span>
                    <span className="link-label">{l.label}</span>
                    <span className="link-detail">{l.detail}</span>
                    <ArrowUpRight className="link-arrow" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="link-off" aria-disabled="true">
                    <span className="link-icon">{l.icon}</span>
                    <span className="link-label">{l.label}</span>
                    <span className="link-detail">{l.detail}</span>
                  </span>
                )}
            </motion.li>
          ))}
        </ul>
      </nav>
    </section>
  )
}

export default function BoardPage() {
  const reduced = useReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)
  const siteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2 })
    lenisRef.current = lenis
    // Shared with the liquid-glass lens so it re-renders in step with the smoothed scroll.
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    let frame = 0
    const raf = (t: number) => {
      lenis.raf(t)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [reduced])

  const jump = useCallback((id: string) => {
    const el = id === "top" ? document.body : document.getElementById(id)
    if (!el) return
    if (lenisRef.current) lenisRef.current.scrollTo(id === "top" ? 0 : el, { offset: 0, duration: 1.4 })
    else el.scrollIntoView({ behavior: "auto" })
    history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`)
    // Move focus with the scroll so keyboard and screen-reader users land in the section too.
    const target = id === "top" ? document.getElementById("hero-name") : el.querySelector<HTMLElement>("h2")
    if (target) {
      target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
    }
  }, [])

  return (
    <div className="site" ref={siteRef}>
      <a className="skip" href="#about">
        Skip to content
      </a>
      <div className="grain" aria-hidden="true" />
      <TopNav onJump={jump} />
      <Hero onJump={jump} reduced={reduced} />
      <TraceRail containerRef={siteRef} />
      <main className="board-main">
        <About reduced={reduced} />
        <Stack reduced={reduced} />
        <Work reduced={reduced} />
        <Log reduced={reduced} />
        <Contact reduced={reduced} />
      </main>
    </div>
  )
}
