"use client"

import { useState } from "react"
import { Home, User, Code2, Briefcase, History, Menu, X } from "lucide-react"
import { cn } from "../lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type NavItem = {
  label: string
  id: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV: { left: NavItem[]; right: NavItem[] } = {
  left: [
    { label: "Home", id: "top", icon: Home },
    { label: "About", id: "about", icon: User },
    { label: "Skills", id: "skills", icon: Code2 },
  ],
  right: [
    { label: "Projects", id: "work", icon: Briefcase },
    { label: "Experience", id: "experience", icon: History },
  ],
}

function go(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

function NavButton({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <button
      onClick={() => go(item.id)}
      className="group flex items-center gap-1.5 text-sm font-medium text-[#f0f6ff]/70 hover:text-[#f0f6ff] transition-colors whitespace-nowrap"
    >
      <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 text-[#38bdf8]" />
      <span>{item.label}</span>
    </button>
  )
}

export function NotchNavbar({
  className,
  brand = "HD",
  logo,
  ...props
}: React.HTMLAttributes<HTMLElement> & { brand?: string; logo?: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <>
      <header className={cn("fixed top-0 inset-x-0 z-50 h-16 flex px-0", className)} {...props}>
        {/* Left side bar */}
        <div className="flex-1 h-10 bg-[#23212C]/70 backdrop-blur-md z-20 relative min-w-0">
          <svg className="absolute inset-0 w-full h-full">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
            <line x1="0" y1="36.5" x2="100%" y2="36.5" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
          </svg>
        </div>

        {/* Notch — 3 slices */}
        <div className="flex h-16 relative z-10 shrink-0 -ml-px">
          {/* Left corner */}
          <div className="w-[50px] h-full relative shrink-0">
            <div
              className="absolute inset-0 bg-[#23212C]/70 backdrop-blur-md"
              style={{ clipPath: "path('M0 0 H50 V64 C25 64 25 40 0 40 Z')" }}
            />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64">
              <path d="M0 39.5 C25 39.5 25 63.5 50 63.5" fill="none" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
              <path d="M0 36.5 C25 36.5 25 60.5 50 60.5" fill="none" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
            </svg>
          </div>

          {/* Center */}
          <div className="flex-1 h-full relative min-w-0 -ml-px">
            <div className="absolute inset-0 bg-[#23212C]/70 backdrop-blur-md">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <line x1="0" y1="63.5" x2="100%" y2="63.5" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
                <line x1="0" y1="60.5" x2="100%" y2="60.5" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
              </svg>
            </div>
            <div className="relative w-full h-full flex items-end justify-between pb-2 px-4 md:px-8">
              <nav className="hidden md:flex gap-4 mb-1 shrink-0">
                {NAV.left.map((item) => (
                  <NavButton key={item.label} item={item} />
                ))}
              </nav>

              <button
                className="md:hidden mb-1 p-1 text-[#f0f6ff]/70 hover:text-[#f0f6ff] transition-colors"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex justify-center shrink-0 mx-2 md:mx-4 mt-1">
                {logo || (
                  <button
                    onClick={() => go("top")}
                    aria-label="Back to top"
                    className="group flex items-center justify-center relative"
                  >
                    <span className="grid w-8 h-8 place-items-center border border-[#38bdf8]/60 text-[#38bdf8] text-sm font-semibold rotate-180 hover:scale-105 transition-transform">
                      {brand}
                    </span>
                  </button>
                )}
              </div>

              <nav className="hidden md:flex gap-4 items-center shrink-0">
                {NAV.right.map((item) => (
                  <NavButton key={item.label} item={item} />
                ))}
                <button
                  onClick={() => go("contact")}
                  className="px-3 py-1.5 text-sm font-medium text-[#23212C] bg-[#38bdf8] rounded-full hover:bg-[#a5c6ff] transition-colors whitespace-nowrap"
                >
                  Let&apos;s Talk
                </button>
              </nav>

              <div className="md:hidden flex items-center gap-2 mb-1" />
            </div>
          </div>

          {/* Right corner */}
          <div className="w-[50px] h-full relative shrink-0 -ml-px">
            <div
              className="absolute inset-0 bg-[#23212C]/70 backdrop-blur-md"
              style={{ clipPath: "path('M0 0 H50 V40 C25 40 25 64 0 64 Z')" }}
            />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64">
              <path d="M0 63.5 C25 63.5 25 39.5 50 39.5" fill="none" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
              <path d="M0 60.5 C25 60.5 25 36.5 50 36.5" fill="none" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
            </svg>
          </div>
        </div>

        {/* Right side bar */}
        <div className="flex-1 h-10 bg-[#23212C]/70 backdrop-blur-md z-20 relative min-w-0 -ml-px">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
            <line x1="0" y1="36.5" x2="100%" y2="36.5" stroke="#f0f6ff" strokeOpacity={0.05} strokeWidth={0.5} />
          </svg>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#23212C]/70 backdrop-blur-md border-b border-[#f0f6ff]/5 p-4 md:hidden shadow-lg"
          >
            <nav className="flex flex-col gap-2">
              {[...NAV.left, ...NAV.right].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      go(item.id)
                      close()
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f0f6ff]/5 transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 opacity-70" />
                    <span className="font-medium text-[#f0f6ff]/90">{item.label}</span>
                  </button>
                )
              })}
              <div className="h-px bg-[#f0f6ff]/10 my-2" />
              <button
                onClick={() => {
                  go("contact")
                  close()
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#38bdf8] text-[#23212C] font-medium mt-2"
              >
                Let&apos;s Talk
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default NotchNavbar
