import type { Metadata, Viewport } from "next"
import { Funnel_Display, Funnel_Sans, Martian_Mono } from "next/font/google"
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

export const metadata: Metadata = {
  title: "Hemant Thakur · Computer Engineering",
  description:
    "Hemant Thakur, a Computer Engineering student building across the whole stack, from bare-metal C and OS internals to machine learning and the browser.",
}

export const viewport: Viewport = {
  themeColor: "#f3f4f6",
  // "only light" stops mobile browsers (Chrome auto-dark, Samsung Internet) from
  // force-darkening the page and wrecking the ice + cobalt palette.
  colorScheme: "only light",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Browser extensions often add attributes to <html> before React hydrates; ignore those.
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <ConsoleSilencer />
        {children}
      </body>
    </html>
  )
}
