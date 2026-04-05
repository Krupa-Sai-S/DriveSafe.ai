import { Activity, ShieldCheck } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-blue-400/10 bg-background/80 backdrop-blur-md py-8 mt-auto">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm text-foreground/80">DriveSafe <span className="text-blue-400">AI</span></span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} DriveSafe AI. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Activity className="h-3 w-3 text-blue-400/60" />
            <span>Powered by MediaPipe &amp; Next.js</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
          <span>Built with</span><span className="text-blue-400">♥</span><span>for safer roads</span>
        </div>
      </div>
    </footer>
  )
}
