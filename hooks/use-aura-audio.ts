"use client"

import { useCallback, useRef } from "react"

export function useAuraAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getContext = () => {
    if (typeof window !== "undefined" && !audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  const playEngage = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = "sine"
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    const now = ctx.currentTime
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3)
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    osc.start(now)
    osc.stop(now + 0.5)
  }, [])

  const playAbort = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = "sawtooth"
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    const now = ctx.currentTime
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.4)
    
    gainNode.gain.setValueAtTime(0.05, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)

    osc.start(now)
    osc.stop(now + 0.4)
  }, [])

  const playAlert = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = "square"
    osc2.type = "triangle"
    
    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    const now = ctx.currentTime
    
    // Klaxon chord
    osc1.frequency.setValueAtTime(500, now)
    osc2.frequency.setValueAtTime(550, now)
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05)
    gainNode.gain.setValueAtTime(0.15, now + 0.2)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.3)
    osc2.stop(now + 0.3)
  }, [])

  const playAiPing = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = "sine"
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    const now = ctx.currentTime
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1)
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.05, now + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc.start(now)
    osc.stop(now + 0.15)
  }, [])

  return { playEngage, playAbort, playAlert, playAiPing }
}
