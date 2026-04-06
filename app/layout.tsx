import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"


import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"
import { GridPattern } from "@/components/ui/grid-pattern"
import { cn } from "@/lib/utils"
import { AiChat } from "@/components/ai-chat"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Aura Vision AI",
    template: "Aura Vision AI | %s",
  },
  description:
    "Next-generation AI driver monitoring system using real-time computer vision for advanced safety and fatigue detection",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "Aura Vision AI | Next-Gen Driver Monitoring",
    description: "Advanced AI-powered driver monitoring system for real-time fatigue and distraction detection.",
    url: "https://aura-vision-ai.vercel.app/",
    siteName: "Aura Vision AI",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Aura Vision AI Shield Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura Vision AI",
    description: "Future-ready driver safety monitoring using real-time AI.",
    images: ["/opengraph-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`font-sans antialiased overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col relative w-full overflow-x-hidden pt-16">
            <GridPattern
              width={50}
              height={50}
              x={-1}
              y={-1}
              squares={[
                [4, 4],
                [5, 1],
                [8, 2],
                [5, 3],
                [5, 5],
                [10, 10],
                [12, 15],
                [15, 10],
                [10, 15],
              ]}
              className={cn(
                "[mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-50 fixed inset-0 z-0",
              )}
            />
            {children}
            <Footer />
            <AiChat />
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
