/* ============================================================
   DriveSafe AI — PDF Report Generator using jsPDF
   Generates a proper downloadable PDF file
   ============================================================ */

import { jsPDF } from "jspdf"

// Color palettes
const C = {
  blue:    [59, 130, 246]  as [number,number,number],
  blueD:   [29, 78, 216]   as [number,number,number],
  dark:    [15, 23, 42]    as [number,number,number],
  slate:   [30, 41, 59]    as [number,number,number],
  muted:   [100, 116, 139] as [number,number,number],
  light:   [148, 163, 184] as [number,number,number],
  border:  [226, 232, 240] as [number,number,number],
  bg:      [248, 250, 252] as [number,number,number],
  white:   [255, 255, 255] as [number,number,number],
  safe:    [34, 197, 94]   as [number,number,number],
  safeD:   [22, 101, 52]   as [number,number,number],
  warn:    [234, 179, 8]   as [number,number,number],
  crit:    [239, 68, 68]   as [number,number,number],
  green50: [240, 253, 244] as [number,number,number],
  blue50:  [239, 246, 255] as [number,number,number],
}

function fmtDur(s: number | string): string {
  if (typeof s === "string") return s
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`
}

function riskColor(level: string): [number,number,number] {
  return level === "critical" ? C.crit : level === "warning" ? C.warn : C.safe
}
function scoreColor(score: number): [number,number,number] {
  return score >= 70 ? C.crit : score >= 40 ? C.warn : C.safe
}

function drawBar(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  pct: number, color: [number,number,number]
) {
  // Background
  doc.setFillColor(...C.border)
  doc.roundedRect(x, y, w, h, h / 2, h / 2, "F")
  // Fill
  if (pct > 0) {
    doc.setFillColor(...color)
    doc.roundedRect(x, y, Math.max(h, w * Math.min(pct, 100) / 100), h, h / 2, h / 2, "F")
  }
}

function sectionHeader(
  doc: jsPDF,
  x: number, y: number, w: number,
  title: string,
  bgColor: [number,number,number],
  textColor: [number,number,number]
) {
  doc.setFillColor(...bgColor)
  doc.roundedRect(x, y, w, 8, 1.5, 1.5, "F")
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...textColor)
  doc.text(title, x + 4, y + 5.5)
}

export function generateAndDownloadPDF(allSessions: any[]): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const PW = 210, PH = 297
  const M = 16
  const CW = PW - 2 * M
  const now = new Date()
  const todayStr = now.toLocaleDateString()
  const sessions = allSessions.filter((s) => s.date === todayStr)

  // Metrics
  const total = sessions.length
  const avgRisk = total > 0
    ? Math.round(sessions.reduce((a, s) => a + (s.maxRiskScore || 0), 0) / total)
    : 0
  const totalAlerts = sessions.reduce((a, s) => a + (s.alertsTriggered || 0), 0)
  const totalYawns = sessions.reduce((a, s) => a + (s.yawnCount || 0), 0)
  const totalEye = sessions.reduce((a, s) => a + (s.eyeClosureEvents || 0), 0)
  const critCount = sessions.filter((s) => s.maxRiskLevel === "critical").length
  const safetyScore = Math.max(0, 100 - avgRisk)
  const safetyCol = safetyScore >= 80 ? C.safe : safetyScore >= 60 ? C.warn : C.crit

  // Insights
  const insights: string[] = []
  if (total === 0) {
    insights.push("No sessions recorded today. Start a detection session to generate insights.")
  } else {
    if (safetyScore >= 80) insights.push("Excellent safety performance maintained throughout the day.")
    else if (safetyScore >= 60) insights.push("Moderate safety levels. Consider taking more frequent breaks.")
    else insights.push("High risk levels detected. Ensure adequate rest before driving again.")
    if (totalAlerts > 0) insights.push(`${totalAlerts} safety alert(s) triggered across ${total} session(s).`)
    if (totalYawns > 5) insights.push(`Frequent yawning detected (${totalYawns} times) — signs of driver fatigue.`)
    if (totalEye > 10) insights.push(`${totalEye} eye closure events recorded — prolonged closures indicate drowsiness.`)
    if (critCount > 0) insights.push(`${critCount} critical-risk session(s) — ensure 7–8 hours of sleep before next drive.`)
    if (critCount === 0 && safetyScore >= 70) insights.push("No critical risk sessions — good driving safety maintained today.")
  }

  let y = 0

  // ╔═══════════════════════════════════╗
  // ║          HEADER BAND             ║
  // ╚═══════════════════════════════════╝
  doc.setFillColor(...C.dark)
  doc.rect(0, 0, PW, 42, "F")

  // Blue accent left bar
  doc.setFillColor(...C.blue)
  doc.rect(0, 0, 3, 42, "F")

  // DS badge
  doc.setFillColor(...C.blue)
  doc.roundedRect(M, 10, 13, 13, 2.5, 2.5, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("DS", M + 6.5, 18, { align: "center" })

  // Brand name
  doc.setFontSize(17)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("DriveSafe AI", M + 17, 18)

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...C.light)
  doc.text("Daily Safety Report", M + 17, 24)

  // Safety score (right side)
  doc.setFontSize(30)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...safetyCol)
  doc.text(String(safetyScore), PW - M, 22, { align: "right" })
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...C.light)
  doc.text("SAFETY SCORE / 100", PW - M, 28, { align: "right" })

  y = 50

  // Date + time
  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...C.dark)
  doc.text(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), M, y)
  y += 5.5
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...C.muted)
  doc.text(`Generated at ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`, M, y)
  y += 7
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.3)
  doc.line(M, y, PW - M, y)
  y += 8

  // ╔═══════════════════════════════════╗
  // ║        SUMMARY STAT CARDS        ║
  // ╚═══════════════════════════════════╝
  const stats = [
    { label: "Sessions Today", val: String(total), col: C.blue },
    { label: "Avg Risk Score", val: `${avgRisk}%`, col: scoreColor(avgRisk) },
    { label: "Total Alerts", val: String(totalAlerts), col: totalAlerts > 0 ? C.crit : C.safe },
    { label: "Critical Sessions", val: String(critCount), col: critCount > 0 ? C.crit : C.safe },
  ]
  const cw = (CW - 9) / 4
  stats.forEach((s, i) => {
    const cx = M + i * (cw + 3)
    doc.setFillColor(...C.bg)
    doc.roundedRect(cx, y, cw, 22, 2, 2, "F")
    doc.setDrawColor(...s.col)
    doc.setLineWidth(0.6)
    doc.roundedRect(cx, y, cw, 22, 2, 2, "S")
    doc.setLineWidth(0.2)
    doc.setDrawColor(...C.border)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...s.col)
    doc.text(s.val, cx + cw / 2, y + 11.5, { align: "center" })
    doc.setFontSize(6.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...C.muted)
    doc.text(s.label, cx + cw / 2, y + 17.5, { align: "center" })
  })
  y += 29

  // ╔═══════════════════════════════════╗
  // ║          AI INSIGHTS             ║
  // ╚═══════════════════════════════════╝
  sectionHeader(doc, M, y, CW, "🧠  AI Safety Insights", C.blue50, C.blueD)
  y += 11
  insights.forEach((ins) => {
    doc.setFillColor(...C.blue)
    doc.circle(M + 2, y + 1.5, 1, "F")
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...C.slate)
    const lines = doc.splitTextToSize(ins, CW - 8)
    doc.text(lines, M + 6, y + 2.5)
    y += lines.length * 5 + 2
  })
  y += 5

  // ╔═══════════════════════════════════╗
  // ║      SESSION COMPARISON BARS     ║
  // ╚═══════════════════════════════════╝
  if (sessions.length > 1) {
    sectionHeader(doc, M, y, CW, "📊  Session Risk Comparison", C.bg, C.dark)
    y += 11
    sessions.forEach((s, i) => {
      const risk = s.maxRiskScore || 0
      const col = scoreColor(risk)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...C.muted)
      doc.text(`Session ${i + 1}  —  ${s.time}`, M, y + 3)
      const bx = M + 50, bw = CW - 50 - 14
      drawBar(doc, bx, y + 0.5, bw, 4, risk, col)
      doc.setFontSize(7.5)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...col)
      doc.text(`${risk}%`, bx + bw + 3, y + 3.5)
      y += 9
    })
    y += 5
  }

  // ╔═══════════════════════════════════╗
  // ║         SESSION DETAILS          ║
  // ╚═══════════════════════════════════╝
  if (sessions.length === 0) {
    doc.setFillColor(...C.bg)
    doc.roundedRect(M, y, CW, 30, 3, 3, "F")
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...C.light)
    doc.text("No sessions recorded today", PW / 2, y + 14, { align: "center" })
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.text("Start a detection session to generate a full report.", PW / 2, y + 21, { align: "center" })
    y += 35
  } else {
    sectionHeader(doc, M, y, CW, "📋  Session Details", C.bg, C.dark)
    y += 11

    sessions.forEach((session, idx) => {
      const rc = riskColor(session.maxRiskLevel)
      const risk = session.maxRiskScore || 0
      const cardH = 65 + (session.timeline?.length > 0 ? 30 : 0)

      if (y + cardH > PH - 25) { doc.addPage(); y = M }

      // Card
      doc.setFillColor(250, 251, 253)
      doc.roundedRect(M, y, CW, cardH, 3, 3, "F")
      // Left color bar
      doc.setFillColor(...rc)
      doc.rect(M, y + 1, 3, cardH - 2, "F")

      // Session title
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...C.dark)
      doc.text(`Session ${idx + 1}`, M + 7, y + 8)

      // Risk badge
      doc.setFillColor(...rc)
      doc.roundedRect(PW - M - 22, y + 3.5, 20, 6, 1.5, 1.5, "F")
      doc.setFontSize(6)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 255, 255)
      doc.text((session.maxRiskLevel || "safe").toUpperCase(), PW - M - 12, y + 7.5, { align: "center" })

      // Time & duration
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...C.muted)
      doc.text(`${session.time}   |   Duration: ${fmtDur(session.duration)}`, M + 7, y + 14)

      let sy = y + 19
      // Metric bars
      const metrics = [
        { label: "Max Risk Score", pct: risk, color: rc, disp: `${risk}%` },
        { label: "Alerts Triggered", pct: Math.min((session.alertsTriggered || 0) * 20, 100), color: C.crit as [number,number,number], disp: String(session.alertsTriggered || 0) },
        { label: "Yawns Detected", pct: Math.min((session.yawnCount || 0) * 10, 100), color: C.warn as [number,number,number], disp: String(session.yawnCount || 0) },
        { label: "Eye Closures", pct: Math.min((session.eyeClosureEvents || 0) * 5, 100), color: C.blue as [number,number,number], disp: String(session.eyeClosureEvents || 0) },
      ]
      metrics.forEach((m) => {
        doc.setFontSize(7.5)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...C.muted)
        doc.text(m.label, M + 7, sy + 2.5)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...m.color)
        doc.text(m.disp, PW - M - 3, sy + 2.5, { align: "right" })
        drawBar(doc, M + 7, sy + 4, CW - 14 - 9, 3, m.pct, m.color)
        sy += 10
      })

      // Timeline chart
      if (session.timeline && session.timeline.length > 0) {
        const tl = session.timeline
        doc.setFontSize(7.5)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...C.blue)
        doc.text("Risk Timeline", M + 7, sy + 3)
        sy += 6

        const cx = M + 7, cw2 = CW - 14, ch = 16
        doc.setFillColor(241, 245, 249)
        doc.roundedRect(cx, sy, cw2, ch, 1, 1, "F")

        const bw = Math.max(0.8, (cw2 - 2) / tl.length)
        tl.forEach((pt: any, pi: number) => {
          const sc = pt.score || 0
          const bh = Math.max(0.5, (ch - 2) * sc / 100)
          const bx = cx + 1 + pi * bw
          const by = sy + ch - 1 - bh
          doc.setFillColor(...scoreColor(sc))
          doc.rect(bx, by, Math.max(0.5, bw - 0.4), bh, "F")
        })

        // Timeline labels
        doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(...C.light)
        doc.text(tl[0]?.time || "", cx, sy + ch + 4)
        if (tl.length > 2) doc.text(tl[Math.floor(tl.length / 2)]?.time || "", cx + cw2 / 2, sy + ch + 4, { align: "center" })
        doc.text(tl[tl.length - 1]?.time || "", cx + cw2, sy + ch + 4, { align: "right" })
        sy += ch + 8
      }

      y += cardH + 6
    })
  }

  // ╔═══════════════════════════════════╗
  // ║       RECOMMENDATIONS            ║
  // ╚═══════════════════════════════════╝
  if (y + 50 > PH - 20) { doc.addPage(); y = M }
  const recs = [
    "Use DriveSafe AI monitoring before every long trip to assess alertness.",
    "If a critical alert fires, pull over safely and rest for at least 20 minutes.",
    "Stay hydrated — dehydration significantly increases driver fatigue.",
    "Ensure 7–8 hours of sleep before any long journey.",
    "Take a break every 2 hours during extended driving sessions.",
  ]
  if (avgRisk > 60) recs.unshift("High risk detected today — avoid driving when feeling fatigued.")
  sectionHeader(doc, M, y, CW, "💡  Safety Recommendations", C.green50, C.safeD)
  y += 11
  recs.slice(0, 5).forEach((rec) => {
    doc.setFillColor(...C.safe)
    doc.circle(M + 2, y + 1.5, 1, "F")
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...C.slate)
    const lines = doc.splitTextToSize(rec, CW - 8)
    doc.text(lines, M + 6, y + 2.5)
    y += lines.length * 5 + 1.5
  })

  // ╔═══════════════════════════════════╗
  // ║            FOOTER                ║
  // ╚═══════════════════════════════════╝
  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    const footY = PH - 10
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.3)
    doc.line(M, footY - 4, PW - M, footY - 4)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...C.light)
    doc.text(`Page ${p} of ${pages}`, M, footY)
    doc.text("DriveSafe AI  |  Powered by MediaPipe  |  For informational purposes only.", PW / 2, footY, { align: "center" })
    doc.text(now.toLocaleString(), PW - M, footY, { align: "right" })
  }

  doc.save(`drivesafe-report-${now.toISOString().split("T")[0]}.pdf`)
}
