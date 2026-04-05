"use client";

import Link from "next/link";
import {
  ArrowRight, Eye, Brain, AlertTriangle, Activity, Shield, Zap,
  CheckCircle, Cpu, Lock, Gauge, ShieldCheck, ChevronDown, Star,
  Users, TrendingUp, Video, BarChart3, Heart, Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } } as any;
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 24 } } } as any;

const cyclingWords = ["Fatigue", "Drowsiness", "Distraction", "Microsleep"];

const safetyFacts = [
  "Drowsy driving causes 100,000+ crashes annually in the US",
  "A 20-minute nap can restore alertness better than caffeine",
  "Driving after 18+ hours awake is equivalent to a 0.08% BAC",
  "Most drowsy driving accidents happen between midnight and 6 AM",
  "Eye closure lasting >500ms is a strong indicator of drowsiness",
  "Yawning more than 3 times per minute is an early fatigue sign",
  "MediaPipe Face Mesh tracks 468 facial landmarks in real time",
  "DriveSafe Vision AI processes your camera feed entirely on your device",
];

const features = [
  { title: "Eye Tracking", icon: Eye, iconColor: "text-blue-400", bg: "bg-blue-400/10", glow: "hover:shadow-blue-500/15", desc: "Monitors eye aspect ratio and blink patterns for prolonged closure detection in real time.", facts: ["Real-time eye closure detection", "Blink frequency analysis", "Drowsiness time tracking"] },
  { title: "Yawn Detection", icon: Brain, iconColor: "text-cyan-400", bg: "bg-cyan-400/10", glow: "hover:shadow-cyan-500/15", desc: "Analyzes mouth openness and duration to identify yawning fatigue patterns.", facts: ["Mouth aspect ratio", "Yawn count tracking", "Fatigue pattern recognition"] },
  { title: "Head Position", icon: Activity, iconColor: "text-indigo-400", bg: "bg-indigo-400/10", glow: "hover:shadow-indigo-500/15", desc: "Tracks head movements and angles to detect nodding and distracted driving.", facts: ["Head pose estimation", "Nodding detection", "Distraction monitoring"] },
  { title: "Risk Scoring", icon: AlertTriangle, iconColor: "text-amber-400", bg: "bg-amber-400/10", glow: "hover:shadow-amber-500/15", desc: "Dynamic risk assessment with color-coded safety levels updated every frame.", facts: ["Safe (0–40%)", "Warning (40–70%)", "Critical (70–100%)"] },
  { title: "Alert System", icon: Shield, iconColor: "text-violet-400", bg: "bg-violet-400/10", glow: "hover:shadow-violet-500/15", desc: "Multi-modal warnings combining visual overlays, audio alerts, and voice notifications.", facts: ["Visual overlays", "Audio warnings", "Voice alerts"] },
  { title: "60 FPS Engine", icon: Zap, iconColor: "text-sky-400", bg: "bg-sky-400/10", glow: "hover:shadow-sky-500/15", desc: "Optimised for instant sub-16ms inference with minimal resource usage on any device.", facts: ["60 FPS processing", "Client-side ML", "Low battery impact"] },
];

const trustItems = [
  { icon: Lock, label: "100% Private", desc: "Camera data never leaves your device", color: "text-emerald-400" },
  { icon: Wifi, label: "Works Offline", desc: "No internet after first load required", color: "text-blue-400" },
  { icon: Heart, label: "No Sign-Up", desc: "No account, no tracking, no cookies", color: "text-rose-400" },
  { icon: Cpu, label: "AI On-Device", desc: "MediaPipe runs locally in your browser", color: "text-amber-400" },
];

// ─── Scroll Progress Bar ──────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500"
      style={{ scaleX }}
    />
  );
}

// ─── Safety Facts Marquee ─────────────────────────────────────
function FactsTicker() {
  const doubled = [...safetyFacts, ...safetyFacts];
  return (
    <div className="relative overflow-hidden border-y border-blue-400/10 bg-blue-400/3 py-2.5">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((fact, i) => (
          <span key={i} className="text-xs text-muted-foreground/70 flex items-center gap-3 shrink-0">
            <span className="h-1 w-1 rounded-full bg-blue-400 shrink-0" />
            {fact}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = to / 45;
        const t = setInterval(() => {
          start += step;
          if (start >= to) { setCount(to); clearInterval(t); }
          else setCount(Math.floor(start));
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Floating Particles ───────────────────────────────────────
// Uses useState+useEffect so Math.random() only runs on the client,
// preventing the SSR vs client hydration mismatch error.
function Particles() {
  const [dots, setDots] = useState<Array<{ w: number; left: number; top: number; dur: number; delay: number }>>([]);

  useEffect(() => {
    setDots(
      [...Array(20)].map(() => ({
        w: Math.random() * 3 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        dur: 4 + Math.random() * 5,
        delay: Math.random() * 4,
      }))
    );
  }, []); // runs once on mount (client only)

  if (dots.length === 0) return null; // nothing rendered on server

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400/25"
          style={{ width: d.w, height: d.w, left: `${d.left}%`, top: `${d.top}%` }}
          animate={{ y: [0, -25, 0], opacity: [0.2, 0.7, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function HomeContent() {
  const [wordIndex, setWordIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setWordIndex((p) => (p + 1) % cyclingWords.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Navigation />

      {/* ══════════════ HERO ══════════════ */}
      <section ref={heroRef} className="relative overflow-hidden flex flex-col items-center justify-center min-h-screen pb-8">
        {/* Layered orbs */}
        <div className="absolute inset-0 -z-10 select-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] rounded-full bg-blue-600/15 blur-[140px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 9, repeat: Infinity, delay: 1.5, ease: "easeInOut" }}
            className="absolute top-1/3 right-1/5 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 6, repeat: Infinity, delay: 3, ease: "easeInOut" }}
            className="absolute bottom-1/3 left-1/5 h-[300px] w-[300px] rounded-full bg-cyan-600/8 blur-[80px]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f608_1px,transparent_1px),linear-gradient(to_bottom,#3b82f608_1px,transparent_1px)] bg-[size:44px_44px]" />
        </div>

        <Particles />

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto max-w-5xl px-4 py-28 text-center">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-blue-400/30 bg-blue-400/5 px-5 py-2.5 text-sm font-medium text-blue-400 backdrop-blur-md hover:bg-blue-400/10 hover:border-blue-400/50 transition-all cursor-default group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
            </span>
            <Activity className="h-3.5 w-3.5 group-hover:animate-pulse" />
            Powered by MediaPipe AI · Live Detection
          </motion.div>

          {/* Headline with fixed-height cycling word */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-extrabold tracking-tight text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.08] mb-8">
            Detect Driver
            <div className="relative h-[1.15em] flex items-center justify-center overflow-hidden my-1">
              <AnimatePresence mode="wait">
                <motion.span key={wordIndex}
                  initial={{ opacity: 0, y: 45, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -45, filter: "blur(14px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">
                  {cyclingWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            in Real-Time
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-12 text-[clamp(1rem,2vw,1.2rem)] text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Advanced AI monitoring using facial recognition and pose estimation to detect driver fatigue, distraction, and health anomalies — keeping roads safer for everyone.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg" className="h-13 gap-2.5 rounded-full px-10 text-base bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-none shadow-xl shadow-blue-600/35 hover:shadow-blue-600/55 transition-all duration-300">
                <Link href="/detect"><ShieldCheck className="h-4 w-4" />Start Detection<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild variant="outline" size="lg" className="h-13 rounded-full px-8 text-base border-border/60 hover:border-blue-400/50 hover:text-blue-400 transition-all duration-300">
                <Link href="/analytics">View Analytics</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
            className="flex flex-col items-center gap-1.5 text-muted-foreground/40">
            <span className="text-[10px] tracking-[0.2em] uppercase">Scroll to explore</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════ FACTS TICKER ══════════════ */}
      <FactsTicker />

      {/* ══════════════ CORE STATS ══════════════ */}
      <section className="container mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-blue-400/8 rounded-2xl border border-blue-400/12 overflow-hidden">
          {[
            { icon: Gauge, label: "Processing Speed", value: "60 FPS", sub: "Real-time detection" },
            { icon: Cpu, label: "AI Framework", value: "MediaPipe", sub: "On-device inference" },
            { icon: Lock, label: "Data Privacy", value: "100% Local", sub: "Zero server uploads" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ backgroundColor: "rgba(59,130,246,0.04)" }}
                className="flex items-center gap-4 px-8 py-7 bg-card/60 backdrop-blur-sm transition-colors duration-300 group">
                <motion.div whileHover={{ scale: 1.18, rotate: 6 }} transition={{ type: "spring", stiffness: 400 }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 border border-blue-400/20 group-hover:border-blue-400/50 shadow-sm group-hover:shadow-blue-500/20 transition-all duration-300">
                  <Icon className="h-5 w-5 text-blue-400" />
                </motion.div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══════════════ ANIMATED COUNTERS ══════════════ */}
      <section className="container mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-3 gap-4 md:gap-8">
          {[
            { icon: Users, value: 99, suffix: "%", label: "Face Detection Accuracy", color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { icon: TrendingUp, value: 60, suffix: " FPS", label: "Processing Speed", color: "text-blue-400", bg: "bg-blue-400/10" },
            { icon: Star, value: 5, suffix: " ms", label: "Alert Latency", color: "text-amber-400", bg: "bg-amber-400/10" },
          ].map(({ icon: Icon, value, suffix, label, color, bg }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm hover:border-blue-400/25 hover:bg-card/50 transition-all duration-300 group">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <span className={`text-3xl md:text-4xl font-black ${color}`}>
                <Counter to={value} suffix={suffix} />
              </span>
              <span className="text-xs text-muted-foreground text-center leading-tight font-medium">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="container mx-auto max-w-7xl px-4 py-12 md:py-20 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }} className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Zap className="h-3 w-3" /> Core Capabilities
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-5xl">Advanced Detection Features</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">Comprehensive monitoring powered by cutting-edge computer vision & on-device AI</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, index) => (
            <motion.div key={index} variants={item}
              whileHover={{ y: -7, scale: 1.025 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="group">
              <Card className={`border-border/40 bg-card/50 backdrop-blur-sm h-full relative overflow-hidden transition-all duration-350 shadow-sm hover:shadow-lg ${f.glow} hover:border-blue-400/20`}>
                {/* Top sheen on hover */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                {/* Background gradient fill */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-400/3 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                <CardHeader className="px-5 pt-5 pb-2 relative">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      whileHover={{ rotate: [0, -12, 12, 0], scale: 1.15 }}
                      transition={{ duration: 0.5 }}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.bg} border border-white/5 shadow-sm`}>
                      <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                    </motion.div>
                    <CardTitle className="text-base font-bold">{f.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-2 relative">
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    {f.facts.map((text, i) => (
                      <motion.li key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 + i * 0.08 }}
                        className="flex items-start gap-2.5">
                        <CheckCircle className={`mt-0.5 h-4 w-4 shrink-0 ${f.iconColor} opacity-80`} />
                        {text}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="container mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
          className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold mb-3 md:text-4xl">Three Steps to Safer Driving</h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">Get started in under 30 seconds — no downloads, no setup</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="absolute top-12 left-[22%] right-[22%] h-px bg-gradient-to-r from-blue-400/10 via-blue-400/40 to-blue-400/10 hidden md:block pointer-events-none" />
          {[
            { step: "01", icon: ShieldCheck, title: "Open DriveSafe Vision AI", desc: "Launch in your browser. No downloads, no account required.", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
            { step: "02", icon: Video, title: "Enable Your Camera", desc: "Grant webcam access so MediaPipe can track your facial landmarks.", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
            { step: "03", icon: Shield, title: "Drive With Confidence", desc: "Receive instant audio and visual alerts if drowsiness is detected.", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
          ].map(({ step, icon: Icon, title, desc, color, bg }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 180, damping: 20 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center p-7 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm hover:border-blue-400/20 transition-all duration-300 group relative">
              <div className="relative mb-5">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${bg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-md">{step}</div>
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ TRUST / PRIVACY ══════════════ */}
      <section className="container mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
          className="rounded-2xl border border-blue-400/12 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/3 p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/5 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Lock className="h-3 w-3" /> Privacy First Architecture
            </div>
            <h2 className="text-2xl font-extrabold md:text-3xl mb-3">Your Data Never Leaves Your Device</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">DriveSafe Vision AI processes everything locally — no servers, no cloud, no data collection.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {trustItems.map(({ icon: Icon, label, desc, color }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center text-center gap-3 p-5 rounded-xl bg-background/50 border border-border/30 hover:border-blue-400/25 transition-all duration-300 group">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-background border border-border/50 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="font-bold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="container mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
          className="relative rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/5 p-12 md:p-20 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-blue-600/15 blur-[90px]" />
          </div>
          <motion.div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/5 px-4 py-1.5 text-xs font-medium text-blue-400">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" /><span className="relative rounded-full h-1.5 w-1.5 bg-blue-400" /></span>
            Live &amp; ready to use
          </motion.div>
          <h2 className="mb-4 text-3xl font-extrabold md:text-5xl">
            Drive safer, <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">starting today</span>
          </h2>
          <p className="mb-10 text-muted-foreground text-base md:text-lg max-w-lg mx-auto">No downloads, no sign-up, no tracking. Just open and drive safely.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg" className="h-14 gap-3 rounded-full px-12 text-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-none shadow-2xl shadow-blue-600/40 hover:shadow-blue-600/60 transition-all duration-300">
                <Link href="/detect"><ShieldCheck className="h-5 w-5" />Start Monitoring<ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild variant="ghost" size="lg" className="h-14 gap-2 rounded-full px-8 text-base hover:text-blue-400 transition-colors">
                <Link href="/analytics"><BarChart3 className="h-4 w-4" />View Analytics</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
