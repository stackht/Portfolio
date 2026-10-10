import type { Metadata, Viewport } from "next"
import { Funnel_Display, Funnel_Sans, Martian_Mono, EB_Garamond, Mrs_Saint_Delafield } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import ConsoleSilencer from "../components/ConsoleSilencer"

const display = Funnel_Display({
  variable: "--font-display",
  subsets: ["latin"],
})

const sans = Funnel_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

const mono = Martian_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  axes: ["wdth"],
})

// Writer's faces: a literary serif for drop caps, and a signature hand.
const verse = EB_Garamond({
  variable: "--font-verse",
  subsets: ["latin"],
  style: ["normal", "italic"],
})
const signature = Mrs_Saint_Delafield({
  variable: "--font-sign",
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Hemant Thakur · Computer Engineering",
  description:
    "Hemant Thakur, a Computer Engineering student building across the whole stack, from bare-metal C and OS internals to machine learning and the browser.",
}

export const viewport: Viewport = {
  themeColor: "#f3f4f6",
  // Declaring dark support is what stops forced darkening: Chrome's auto-dark and
  // Android WebView (in-app browsers) leave pages that claim to handle dark mode
  // alone. Every colour is set explicitly in globals.css, so the page stays light.
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Browser extensions often add attributes to <html> before React hydrates; ignore those.
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} ${verse.variable} ${signature.variable}`} suppressHydrationWarning>
      <body>
        {/* Decide before hydration whether the opening shot plays (once per session). */}
        <Script id="intro-gate" strategy="beforeInteractive">
          {"var d=document.documentElement;d.dataset.motion='full';try{localStorage.removeItem('ht-motion')}catch(e){}try{if(sessionStorage.getItem('ht-intro'))d.dataset.intro='skip';else sessionStorage.setItem('ht-intro','1')}catch(e){d.dataset.intro='skip'}"}
        </Script>
        <ConsoleSilencer />
        {children}
      </body>
    </html>
  )
}
