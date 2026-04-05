"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, Eye, Activity, Shield, Zap, Code2, Cpu, Video, TrendingUp, CheckCircle, Smartphone, ScanLine, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function AboutContent() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Advanced AI Safety Technology</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
              How DriveSafe Vision AI Works
            </h1>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Learn about the technology, algorithms, and safety measures behind our drowsiness detection system
            </p>
          </motion.div>

          {/* Technology Stack */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Technologies Used
              </CardTitle>
              <CardDescription>Built with modern web technologies and AI frameworks</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div 
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid gap-4 md:grid-cols-2"
              >
                <motion.div variants={item} whileHover={{ scale: 1.02 }} className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted/80">
                  <Brain className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <h4 className="mb-1 font-semibold">MediaPipe Face Mesh</h4>
                    <p className="text-sm text-muted-foreground">
                      Google's state-of-the-art ML solution for detecting 468 facial landmarks in real-time
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={item} whileHover={{ scale: 1.02 }} className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted/80">
                  <Smartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500" />
                  <div>
                    <h4 className="mb-1 font-semibold">Object Detection</h4>
                    <p className="text-sm text-muted-foreground">
                      CoCo-SSD model integration for real-time mobile phone usage detection
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={item} whileHover={{ scale: 1.02 }} className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted/80">
                  <Cpu className="mt-0.5 h-5 w-5 flex-shrink-0 text-chart-3" />
                  <div>
                    <h4 className="mb-1 font-semibold">Client-Side Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      All ML computations run in your browser - no data is sent to servers
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={item} whileHover={{ scale: 1.02 }} className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted/80">
                  <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-chart-4" />
                  <div>
                    <h4 className="mb-1 font-semibold">Real-Time Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      60 FPS processing with optimized algorithms for instant detection
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Detection Methodology
                </CardTitle>
                <CardDescription>Multi-factor analysis pipeline for accurate risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div 
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="relative border-l border-border pl-8 ml-4 space-y-10"
                >
                  {/* Step 1: Eye Analysis */}
                  <motion.div variants={item} className="relative">
                    <div className="absolute -left-8 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                      1
                    </div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Eye Analysis</h4>
                        <p className="text-sm text-muted-foreground">Monitors blink rate and closure duration</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                      <p className="mb-3 text-sm text-muted-foreground">
                        Calculates Eye Aspect Ratio (EAR) to detect prolonged eye closure (micro-sleeps).
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>EAR Threshold &lt; 0.25</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Duration &gt; 2 seconds</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 2: Mouth Analysis */}
                  <motion.div variants={item} className="relative">
                    <div className="absolute -left-8 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                      2
                    </div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                        <Brain className="h-5 w-5 text-chart-2" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Mouth Analysis</h4>
                        <p className="text-sm text-muted-foreground">Detects frequent yawning patterns</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                      <p className="mb-3 text-sm text-muted-foreground">
                        Measures Mouth Aspect Ratio (MAR) to identify yawning as a sign of fatigue.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-chart-2" />
                          <span>MAR Threshold &gt; 0.6</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-chart-2" />
                          <span>Yawn Count Tracking</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 3: Head Pose */}
                  <motion.div variants={item} className="relative">
                    <div className="absolute -left-8 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                      3
                    </div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                        <Video className="h-5 w-5 text-chart-3" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Head Pose</h4>
                        <p className="text-sm text-muted-foreground">Tracks nodding and head position</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                      <p className="mb-3 text-sm text-muted-foreground">
                        Analyzes head orientation (pitch/yaw/roll) to detect nodding off or distraction.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-chart-3" />
                          <span>Angle Deviation &gt; 25°</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-chart-3" />
                          <span>Nodding Detection</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 4: Distraction */}
                  <motion.div variants={item} className="relative">
                    <div className="absolute -left-8 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                      4
                    </div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                        <Smartphone className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Distraction</h4>
                        <p className="text-sm text-muted-foreground">Identifies mobile phone usage</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                      <p className="mb-3 text-sm text-muted-foreground">
                        Uses object detection AI to instantly recognize mobile devices in the camera frame.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-destructive" />
                          <span>Phone Object Detection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-destructive" />
                          <span>Immediate Risk Penalty</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Scoring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Scoring Algorithm
              </CardTitle>
              <CardDescription>How we calculate and categorize drowsiness levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-2 rounded-lg border border-chart-3/30 bg-chart-3/5 p-3 text-center transition-colors hover:bg-chart-3/10">
                    <Badge variant="outline" className="w-fit self-center bg-chart-3/20 text-chart-3">
                      Safe
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      <strong>0-39%</strong><br/>Normal driving
                    </span>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-2 rounded-lg border border-chart-3/30 bg-chart-3/10 p-3 text-center transition-colors hover:bg-chart-3/20">
                    <Badge variant="outline" className="w-fit self-center bg-chart-3/30 text-chart-3">
                      Warning
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      <strong>40-69%</strong><br/>Mild drowsiness
                    </span>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center transition-colors hover:bg-destructive/10">
                    <Badge variant="outline" className="w-fit self-center bg-destructive/20 text-destructive">
                      Critical
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      <strong>70-100%</strong><br/>High risk
                    </span>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Safety Disclaimer */}
          {/* Safety Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Alert className="mb-8 border-chart-3/50 bg-chart-3/5">
              <Shield className="h-4 w-4 text-chart-3" />
              <AlertTitle className="text-chart-3">Safety Information</AlertTitle>
              <AlertDescription className="text-sm leading-relaxed">
                This system is designed as an assistive technology and should not be considered a replacement for
                responsible driving practices. Always ensure adequate rest before driving. If you feel drowsy, pull over
                safely and take a break. Never rely solely on automated systems for safety decisions.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Final CTA */}
          {/* Final CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8 text-center"
          >
            <h2 className="mb-4 text-2xl font-bold tracking-tight">Ready to test the system?</h2>
            <p className="mb-6 text-muted-foreground">
              Experience the real-time detection capabilities directly in your browser.
            </p>
            <Button asChild size="lg" className="gap-2 rounded-full px-8 bg-rose-400 hover:bg-rose-500 text-white border-none shadow-lg shadow-rose-400/20">
              <Link href="/detect">
                Start Detection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
