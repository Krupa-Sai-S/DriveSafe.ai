"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart3, Info, Video, Menu, X, ShieldCheck } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const navItems = [
  { href: "/", label: "Home", icon: Activity },
  { href: "/detect", label: "Detection", icon: Video },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/about", label: "About", icon: Info },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [mobileMenuOpen])

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500",
      scrolled
        ? "border-b border-blue-400/20 bg-background/95 backdrop-blur-xl shadow-lg shadow-blue-950/20"
        : "border-b border-transparent bg-background/60 backdrop-blur-md"
    )}>
      <div className="container relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">

        {/* Left — Logo */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon"
            className="mr-2 md:hidden hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link href="/" className="hidden items-center gap-2.5 md:flex group" onClick={() => setMobileMenuOpen(false)}>
            {/* Car icon badge — no more eye image */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300"
            >
              <ShieldCheck className="h-4 w-4 text-white" />
            </motion.div>
            <span className="text-lg font-bold tracking-tight group-hover:text-blue-400 transition-colors duration-300">
              DriveSafe <span className="text-blue-400">Vision AI</span>
            </span>
          </Link>
        </div>

        {/* Mobile Logo — Centered */}
        <Link href="/" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold">DriveSafe <span className="text-blue-400">Vision AI</span></span>
        </Link>

        {/* Center — Desktop Nav */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex bg-white/3 rounded-xl px-2 py-1 border border-white/5 backdrop-blur-sm">
          {navItems.map((navItem) => {
            const isActive = pathname === navItem.href
            return (
              <Link key={navItem.href} href={navItem.href} suppressHydrationWarning
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  "hover:text-blue-400 hover:bg-blue-500/10",
                  isActive ? "text-blue-400 bg-blue-500/10" : "text-muted-foreground"
                )}>
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-blue-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {navItem.label}
              </Link>
            )
          })}
        </nav>

        {/* Right — Theme toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Side Panel */}
      {mobileMenuOpen && createPortal(
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-[70%] max-w-sm border-r border-blue-400/15 bg-background/98 backdrop-blur-2xl p-6 shadow-2xl shadow-black/40 md:hidden"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5 font-bold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <span>DriveSafe <span className="text-blue-400">Vision AI</span></span>
                </div>
                <Button variant="ghost" size="icon" className="-mr-2 hover:bg-blue-500/10 hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mb-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</div>
              <div className="h-px w-full bg-blue-400/10" />
            </div>

            <nav className="flex flex-col gap-1.5">
              {navItems.map((navItem, i) => {
                const Icon = navItem.icon
                const isActive = pathname === navItem.href
                return (
                  <motion.div
                    key={navItem.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link href={navItem.href} onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                        "hover:bg-blue-500/10 hover:text-blue-400",
                        isActive ? "bg-blue-500/10 text-blue-400" : "text-muted-foreground"
                      )}>
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-blue-400" />}
                      <Icon className="h-4 w-4" />
                      {navItem.label}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>
          </motion.div>
        </>,
        document.body
      )}
    </header>
  )
}
