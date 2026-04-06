import { ShieldCheck, Activity, Cpu } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 bg-background/40 backdrop-blur-3xl py-12">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          
          {/* Logo & Vision */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-black tracking-tighter aura-gradient-text uppercase">AURA VISION AI</span>
            </div>
            <p className="text-[10px] tracking-[0.2em] font-mono text-muted-foreground/60 max-w-[200px] text-center md:text-left leading-relaxed">
              ULTRA-PRECISION NEURAL DRIVER MONITORING SYSTEM.
            </p>
          </div>

          {/* Center Info */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-6 opacity-30">
              <Cpu className="h-5 w-5" />
              <Activity className="h-5 w-5" />
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-40">
              &copy; {new Date().getFullYear()} Aura Vision AI Protocol.
            </p>
          </div>

          {/* Ownership */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <span className="text-[9px] font-mono tracking-widest text-muted-foreground/50 uppercase">Project Ownership:</span>
            <span className="text-sm font-black tracking-widest text-primary uppercase">VISIONARY DEVELOPER</span>
          </div>
          
        </div>
      </div>
    </footer>
  )
}
