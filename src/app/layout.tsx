import type { Metadata } from "next"
import localFont from "next/font/local"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import ConsoleSilencer from "../components/ConsoleSilencer"
import PerformanceBoot from "../components/PerformanceBoot"

const deltha = localFont({
  variable: "--font-display",
  src: "../../DelthaRegular-GOgrm.woff",
  weight: "400",
})

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "Hemant Thakur | Full-Stack Developer",
  description: "Portfolio of Hemant Thakur. Full-stack developer crafting cinematic web experiences.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${deltha.variable} ${jetbrains.variable} dark h-full antialiased`}
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-full bg-ink text-white">
        <ConsoleSilencer />
        <PerformanceBoot />
        {children}
      </body>
    </html>
  )
}
