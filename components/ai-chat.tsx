"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useAuraAudio } from "@/hooks/use-aura-audio"

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const { playAiPing } = useAuraAudio()
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: "Synchronized. I am Aura AI. How can I assist with your safety protocols today?" }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: "user" as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    playAiPing()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })
      const data = await response.json()
      playAiPing()
      if (data.content) {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }])
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Error communicating with neural hub. Verify API configuration." }])
      }
    } catch (err) {
      playAiPing()
      setMessages(prev => [...prev, { role: "assistant", content: "Uplink failed. Please check your network connection." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 40 }} transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-background/95 backdrop-blur-xl rounded-[2rem] border border-border/50 flex flex-col overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden border border-primary/30 relative">
                  <Image src="/aura-bot.png" alt="Aura AI" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tighter uppercase aura-gradient-text">AURA_AI v2.0</h3>
                  <div className="flex items-center gap-1.5 text-[8px] font-mono text-primary/60 uppercase">
                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    Neural Uplink Active
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border relative", 
                    m.role === "user" ? "bg-accent/10 border-accent/20" : "border-primary/20")}>
                    {m.role === "user" ? <User className="h-4 w-4 text-accent" /> : <Image src="/aura-bot.png" alt="AI" fill className="object-cover" />}
                  </div>
                  <div className={cn("p-4 rounded-2xl text-xs leading-relaxed max-w-[80%]", 
                    m.role === "user" ? "bg-accent/5 border border-border/20 rounded-tr-none text-right" : "bg-primary/5 border border-border/20 rounded-tl-none")}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3 items-center text-[10px] font-mono text-primary/40 uppercase">
                  <Loader2 className="h-3 w-3 animate-spin"/> Processing...
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-background/20 border-t border-white/5 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter query..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-light focus:outline-none focus:border-primary/50 transition-colors" />
              <Button type="submit" size="icon" className="h-10 w-10 bg-primary hover:bg-accent rounded-xl text-background shadow-lg shadow-primary/20 transition-all duration-300">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }} onClick={() => { setIsOpen(!isOpen); playAiPing(); }}
        className={cn("w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden relative border-2 border-primary/50", 
          isOpen ? "bg-red-600/80 hover:bg-red-700 border-red-500" : "hover:shadow-primary/30")}>
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Image src="/aura-bot.png" alt="Open AI" fill className="object-cover" />}
        {!isOpen && <div className="absolute inset-0 rounded-full animate-ping-slow border border-primary/50" />}
      </motion.button>
    </div>
  )
}
