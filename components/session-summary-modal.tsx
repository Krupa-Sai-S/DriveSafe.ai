"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Eye, Activity, Clock } from "lucide-react"

interface SessionSummaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionData: {
    duration: number
    maxRiskScore: number
    eyeClosureEvents: number
    yawnCount: number
    alertsTriggered: number
    riskLevel: string
  }
}

export function SessionSummaryModal({ open, onOpenChange, sessionData }: SessionSummaryModalProps) {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`
    }
    return `${mins}m ${secs}s`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-chart-3" />
            Session Complete
          </DialogTitle>
          <DialogDescription>Summary of your detection session</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-border bg-muted/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Duration</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-mono font-semibold">{formatDuration(sessionData.duration)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Max Risk Score</span>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="font-mono font-semibold">{sessionData.maxRiskScore}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Eye Closures</span>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-accent" />
                    <span className="font-mono font-semibold">{sessionData.eyeClosureEvents}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Yawns</span>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-accent" />
                    <span className="font-mono font-semibold">{sessionData.yawnCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {sessionData.alertsTriggered > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-sm">Drowsiness Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    {sessionData.alertsTriggered} warning{sessionData.alertsTriggered !== 1 ? "s" : ""} triggered during
                    this session
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={() => onOpenChange(false)} className="w-full cursor-pointer">
              Close Summary
            </Button>
            <p className="text-center text-xs text-muted-foreground">Session data is for demonstration purposes only</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
