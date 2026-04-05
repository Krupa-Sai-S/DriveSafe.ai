"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, AlertTriangle, Clock, Eye, Activity, Trash2, Download } from "lucide-react"
import { Area, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { generateAndDownloadPDF } from "@/lib/pdf-report"

function formatDuration(seconds: number | string) {
  if (typeof seconds === "string") return seconds
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`
}

const summaryCards = [
  { label: "Total Sessions", key: "totalSessions", icon: Activity, sub: "All time", accent: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", left: "bg-blue-400" },
  { label: "Avg Risk Score", key: "avgRiskScore", suffix: "%", icon: TrendingUp, sub: "Across all sessions", accent: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", left: "bg-amber-400" },
  { label: "Total Alerts", key: "totalAlerts", icon: AlertTriangle, sub: "Warnings triggered", accent: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", left: "bg-orange-400" },
  { label: "Critical Events", key: "criticalSessions", icon: Eye, sub: "High-risk sessions", accent: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", left: "bg-red-400" },
]

export function AnalyticsDashboard() {
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    try {
      const data = localStorage.getItem("drowsiness-sessions")
      if (data) { const parsed = JSON.parse(data); setSessions(parsed); if (parsed.length > 0) setSelectedSession(parsed[0]) }
    } catch (e) { console.error(e) }
  }, [])

  const handleDeleteAll = () => { localStorage.removeItem("drowsiness-sessions"); setSessions([]); setSelectedSession(null) }

  const handleDownloadReport = () => {
    setDownloading(true)
    setTimeout(() => {
      generateAndDownloadPDF(sessions)
      setDownloading(false)
    }, 300)
  }

  const totalSessions = sessions.length
  const avgRiskScore = totalSessions > 0 ? Math.round(sessions.reduce((a, s) => a + (s.maxRiskScore || 0), 0) / totalSessions) : 0
  const totalAlerts = sessions.reduce((a, s) => a + (s.alertsTriggered || 0), 0)
  const criticalSessions = sessions.filter((s) => s.maxRiskLevel === "critical").length
  const summaryValues: Record<string, number> = { totalSessions, avgRiskScore, totalAlerts, criticalSessions }

  // Today's session count
  const todayStr = new Date().toLocaleDateString()
  const todaySessions = sessions.filter((s) => s.date === todayStr)

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "safe": return "bg-emerald-400/15 text-emerald-400 border border-emerald-400/25"
      case "warning": return "bg-amber-400/15 text-amber-400 border border-amber-400/25"
      case "critical": return "bg-red-400/15 text-red-400 border border-red-400/25"
      default: return "bg-muted text-muted-foreground border border-border"
    }
  }
  const getSessionBorderLeft = (level: string) => {
    return level === "safe" ? "border-l-emerald-400" : level === "warning" ? "border-l-amber-400" : level === "critical" ? "border-l-red-400" : "border-l-transparent"
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 border border-blue-400/20">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Review detection sessions and drowsiness patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Download Report Button */}
          <Button onClick={handleDownloadReport} disabled={downloading} size="sm"
            className="gap-2 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-none shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
            <Download className={cn("h-4 w-4", downloading && "animate-bounce")} />
            {downloading ? "Generating PDF..." : "Download PDF Report"}
          </Button>
          {totalSessions > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 cursor-pointer border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400/50 transition-colors">
                  <Trash2 className="h-4 w-4" />Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete all recorded detection sessions from your local browser storage.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll} className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Today's Quick Stats */}
      {todaySessions.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-400/5 px-5 py-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
          </div>
          <span className="text-sm font-medium text-blue-400">{todaySessions.length} session{todaySessions.length > 1 ? "s" : ""} recorded today</span>
          <span className="text-xs text-muted-foreground ml-1">— download your report above</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          const value = summaryValues[card.key]
          return (
            <Card key={card.key} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
              <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", card.left)} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-5">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", card.bg, card.border)}>
                  <Icon className={cn("h-4 w-4", card.accent)} />
                </div>
              </CardHeader>
              <CardContent className="pl-5">
                <div className={cn("text-3xl font-bold", card.accent)}>{value}{card.suffix ?? ""}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline Chart */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-blue-400" />Session Timeline</CardTitle>
              <CardDescription>Risk score progression during selected session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 w-full">
                  {selectedSession?.timeline?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={selectedSession.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null
                          const events = payload[0].payload.events ?? []
                          return (
                            <div className="rounded-xl border border-blue-400/20 bg-background/95 backdrop-blur-sm p-3 shadow-xl">
                              <div className="grid grid-cols-2 gap-3 mb-2">
                                <div><span className="text-[0.65rem] uppercase text-muted-foreground">Time</span><div className="font-bold text-sm">{label}</div></div>
                                <div><span className="text-[0.65rem] uppercase text-muted-foreground">Risk</span><div className="font-bold text-sm text-blue-400">{payload[0].value}%</div></div>
                              </div>
                              {events.length > 0 && (
                                <div className="mt-2 space-y-1 border-t border-border/30 pt-2">
                                  {events.map((e: any, i: number) => (
                                    <div key={i} className="flex items-center gap-1.5 text-xs font-medium">
                                      {e.type === "yawn" && <><div className="h-2 w-2 rounded-full bg-amber-400" /><span>Yawn Detected</span></>}
                                      {e.type === "alert" && <><AlertTriangle className="h-3 w-3 text-red-400" /><span className="text-red-400">{e.reason || "Alert"}</span></>}
                                      {e.type === "eye" && <><Eye className="h-3 w-3 text-blue-400" /><span>Eye Closure</span></>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        }} />
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-blue-400/20 text-center">
                      <BarChart3 className="mb-3 h-10 w-10 text-blue-400/20" />
                      <p className="text-sm text-muted-foreground">No timeline data for this session</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Start a detection session to record data</p>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-5 text-xs">
                  {[{ color: "bg-emerald-400", label: "Safe (0–40)" }, { color: "bg-amber-400", label: "Warning (40–70)" }, { color: "bg-red-400", label: "Critical (70+)" }].map((l) => (
                    <div key={l.label} className="flex items-center gap-2">
                      <div className={cn("h-2.5 w-2.5 rounded-full", l.color)} />
                      <span className="text-muted-foreground">{l.label}</span>
                    </div>
                  ))}
                </div>

                {/* Selected session details */}
                {selectedSession && (
                  <div className="rounded-xl border border-blue-400/15 bg-muted/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Selected Session</h4>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", getRiskBadge(selectedSession.maxRiskLevel))}>{selectedSession.maxRiskLevel}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                      {[
                        { label: "Date", value: selectedSession.date },
                        { label: "Duration", value: formatDuration(selectedSession.duration) },
                        { label: "Risk Score", value: `${selectedSession.maxRiskScore || 0}%` },
                        { label: "Alerts", value: selectedSession.alertsTriggered },
                        { label: "Yawns", value: selectedSession.yawnCount || 0 },
                        { label: "Eye Closures", value: selectedSession.eyeClosureEvents || 0 },
                      ].map((it) => (
                        <div key={it.label}><p className="text-xs text-muted-foreground">{it.label}</p><p className="font-semibold mt-0.5">{it.value}</p></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session History */}
        <div className="h-full">
          <Card className="h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4 text-blue-400" />Session History</CardTitle>
              <CardDescription>Recent detection sessions</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className={cn("space-y-2 overflow-y-auto px-4 py-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border", totalSessions === 0 ? "h-[300px]" : "h-[450px]")}>
                {sessions.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground gap-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-400/5 border border-blue-400/15"><Clock className="h-7 w-7 text-blue-400/25" /></div>
                    <p className="text-sm font-medium">No sessions recorded yet</p>
                    <p className="text-xs text-muted-foreground/60">Complete a detection session to see history</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <button key={session.id} onClick={() => setSelectedSession(session)}
                      className={cn("w-full rounded-xl border-l-2 border p-3 text-left transition-all duration-200 hover:shadow-sm",
                        selectedSession?.id === session.id
                          ? cn("border-blue-400/40 bg-blue-400/5", getSessionBorderLeft(session.maxRiskLevel))
                          : "border-border/40 border-l-transparent hover:border-blue-400/20 hover:bg-muted/20")}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold">{session.date}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", getRiskBadge(session.maxRiskLevel))}>{session.maxRiskLevel}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{session.time}</span>
                        <span className="text-border">·</span>
                        <span>{formatDuration(session.duration)}</span>
                        <span className="ml-auto font-mono font-bold text-foreground">{session.maxRiskScore || 0}%</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
