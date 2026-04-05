/* ============================================================
   DriveSafe Vision AI — HTML Report Generator
   Generates a self-contained, downloadable HTML report
   ============================================================ */

function fmtDur(s: number | string): string {
  if (typeof s === "string") return s;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
}

function riskColor(level: string): string {
  return level === "critical" ? "#ef4444" : level === "warning" ? "#f59e0b" : "#22c55e";
}

function barColor(score: number): string {
  return score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#22c55e";
}

export function generateTodayReport(allSessions: any[]): string {
  const now = new Date();
  const todayStr = now.toLocaleDateString();
  const sessions = allSessions.filter((s) => s.date === todayStr);

  const totalSessions = sessions.length;
  const avgRisk =
    totalSessions > 0
      ? Math.round(sessions.reduce((a, s) => a + (s.maxRiskScore || 0), 0) / totalSessions)
      : 0;
  const totalAlerts = sessions.reduce((a, s) => a + (s.alertsTriggered || 0), 0);
  const totalYawns = sessions.reduce((a, s) => a + (s.yawnCount || 0), 0);
  const totalEye = sessions.reduce((a, s) => a + (s.eyeClosureEvents || 0), 0);
  const criticalCount = sessions.filter((s) => s.maxRiskLevel === "critical").length;
  const safetyScore = Math.max(0, 100 - avgRisk);
  const safetyColor =
    safetyScore >= 80 ? "#22c55e" : safetyScore >= 60 ? "#f59e0b" : "#ef4444";

  // AI Insights
  const insights: string[] = [];
  if (totalSessions === 0) {
    insights.push("📋 No driving sessions recorded today — start a session to generate insights.");
  } else {
    if (safetyScore >= 80) insights.push("🛡️ Excellent safety performance maintained throughout the day.");
    else if (safetyScore >= 60) insights.push("⚠️ Moderate safety levels — some drowsiness events detected. Consider taking more breaks.");
    else insights.push("🚨 High risk levels detected today — ensure adequate rest before driving again.");
    if (totalAlerts > 0) insights.push(`🔔 ${totalAlerts} safety alert${totalAlerts > 1 ? "s" : ""} triggered across ${totalSessions} session${totalSessions > 1 ? "s" : ""}.`);
    if (totalYawns > 5) insights.push(`😴 Frequent yawning detected (${totalYawns} times) — a strong sign of driver fatigue.`);
    if (totalEye > 10) insights.push(`👁 ${totalEye} eye closure events detected — prolonged closures indicate drowsiness.`);
    if (criticalCount > 0) insights.push(`🚨 ${criticalCount} critical-risk session${criticalCount > 1 ? "s" : ""} — ensure 7–8 hours of sleep before next drive.`);
    if (criticalCount === 0 && safetyScore >= 70) insights.push("✅ No critical risk sessions recorded — good driving safety today.");
  }

  // Recommendations
  const recs: string[] = [
    "✅ Use DriveSafe Vision AI before every long trip to monitor alertness levels.",
    "🛑 If a critical alert fires, pull over safely and rest for at least 20 minutes.",
    "💧 Stay hydrated — dehydration is a leading cause of driver fatigue.",
    "☕ Caffeine can help short-term, but is not a substitute for proper sleep.",
  ];
  if (avgRisk > 60) recs.unshift("⚠️ High average risk today — avoid driving when feeling fatigued.");
  if (totalAlerts > 3) recs.unshift("🔔 Multiple alerts triggered — consider shorter trips and more frequent stops.");

  // Session HTML blocks
  const sessionsHTML =
    sessions.length === 0
      ? `<div style="text-align:center;padding:60px 0;color:#475569;">
           <div style="font-size:48px;margin-bottom:16px;">📋</div>
           <div style="font-size:16px;">No sessions recorded today.</div>
           <div style="font-size:13px;margin-top:8px;color:#334155;">Start a detection session to generate a full report.</div>
         </div>`
      : sessions
          .map((s, idx) => {
            const rc = riskColor(s.maxRiskLevel);

            // Mini bar chart (timeline)
            const timelineHTML =
              s.timeline && s.timeline.length > 0
                ? `<div style="margin-top:18px;">
                    <div style="font-size:10px;font-weight:700;color:#60a5fa;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">📈 Risk Timeline</div>
                    <div style="display:flex;align-items:flex-end;gap:1.5px;height:64px;background:rgba(255,255,255,0.03);border:1px solid rgba(96,165,250,0.1);border-radius:8px;padding:8px;overflow:hidden;">
                      ${s.timeline.map((t: any) => `<div style="flex:1;min-width:2px;background:${barColor(t.score)};height:${Math.max(t.score, 3)}%;border-radius:2px 2px 0 0;" title="${t.time}: ${t.score}%"></div>`).join("")}
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:#475569;margin-top:5px;padding:0 4px;">
                      <span>${s.timeline[0]?.time ?? ""}</span>
                      <span style="color:#60a5fa;">Risk over time</span>
                      <span>${s.timeline[s.timeline.length - 1]?.time ?? ""}</span>
                    </div>
                  </div>`
                : "";

            // Event log
            const events: string[] = [];
            if (s.timeline) {
              s.timeline.forEach((t: any) => {
                (t.events ?? []).forEach((e: any) => {
                  if (e.type === "yawn")
                    events.push(`<div style="display:flex;justify-content:space-between;padding:6px 10px;background:rgba(234,179,8,0.07);border:1px solid rgba(234,179,8,0.18);border-radius:6px;font-size:12px;margin:3px 0;"><span style="color:#fbbf24;">😮 Yawn detected</span><span style="color:#475569;">@ ${t.time}</span></div>`);
                  if (e.type === "alert")
                    events.push(`<div style="display:flex;justify-content:space-between;padding:6px 10px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.18);border-radius:6px;font-size:12px;margin:3px 0;"><span style="color:#f87171;">🔔 ${e.reason || "Alert triggered"}</span><span style="color:#475569;">@ ${t.time}</span></div>`);
                  if (e.type === "eye")
                    events.push(`<div style="display:flex;justify-content:space-between;padding:6px 10px;background:rgba(96,165,250,0.07);border:1px solid rgba(96,165,250,0.18);border-radius:6px;font-size:12px;margin:3px 0;"><span style="color:#93c5fd;">👁 Eye closure (${e.duration?.toFixed(1) ?? "?"}s)</span><span style="color:#475569;">@ ${t.time}</span></div>`);
                });
              });
            }

            return `
<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(96,165,250,0.1);border-left:4px solid ${rc};border-radius:12px;padding:24px;margin-bottom:20px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
    <div>
      <div style="font-size:18px;font-weight:800;color:#f1f5f9;">Session ${idx + 1}</div>
      <div style="font-size:13px;color:#64748b;margin-top:3px;">🕐 ${s.time}&nbsp;&nbsp;|&nbsp;&nbsp;⏱ ${fmtDur(s.duration)}</div>
    </div>
    <span style="background:${rc}18;color:${rc};border:1px solid ${rc}40;border-radius:20px;padding:6px 16px;font-size:12px;font-weight:800;text-transform:uppercase;">${s.maxRiskLevel}</span>
  </div>

  <!-- Metric bars -->
  ${[
    { label: "Max Risk Score", val: s.maxRiskScore || 0, pct: s.maxRiskScore || 0, color: rc, suffix: "%" },
    { label: "Alerts Triggered", val: s.alertsTriggered || 0, pct: Math.min((s.alertsTriggered || 0) * 20, 100), color: "#ef4444", suffix: "" },
    { label: "Yawns Detected", val: s.yawnCount || 0, pct: Math.min((s.yawnCount || 0) * 10, 100), color: "#f59e0b", suffix: "" },
    { label: "Eye Closure Events", val: s.eyeClosureEvents || 0, pct: Math.min((s.eyeClosureEvents || 0) * 5, 100), color: "#60a5fa", suffix: "" },
    { label: "Blink Frequency", val: `${(s.blinkFrequency || 0).toFixed(1)}/min`, pct: Math.min(((s.blinkFrequency || 0) / 30) * 100, 100), color: "#a78bfa", suffix: "" },
  ].map((m) => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;">
        <span style="color:#94a3b8;">${m.label}</span>
        <span style="color:${m.color};font-weight:700;">${m.val}${m.suffix}</span>
      </div>
      <div style="background:rgba(255,255,255,0.05);border-radius:4px;height:7px;overflow:hidden;">
        <div style="height:100%;width:${m.pct}%;background:${m.color};border-radius:4px;"></div>
      </div>
    </div>`).join("")}

  ${timelineHTML}

  ${events.length > 0 ? `
  <div style="margin-top:18px;">
    <div style="font-size:10px;font-weight:700;color:#60a5fa;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">🗂 Event Log with Timestamps</div>
    ${events.slice(0, 12).join("")}
    ${events.length > 12 ? `<div style="font-size:11px;color:#475569;padding:6px;text-align:center;">+ ${events.length - 12} more events</div>` : ""}
  </div>` : ""}
</div>`;
          })
          .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>DriveSafe Vision AI Report — ${now.toLocaleDateString()}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif;background:#050b18;color:#e2e8f0;min-height:100vh;}
  .page{max-width:920px;margin:0 auto;padding:48px 28px;}
  @media print{body{background:#fff;color:#111;}}
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:32px;border-bottom:1px solid rgba(96,165,250,0.15);margin-bottom:36px;">
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
        <div style="width:44px;height:44px;background:linear-gradient(135deg,#1d4ed8,#3b82f6);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;">🛡️</div>
        <div>
          <div style="font-size:20px;font-weight:800;color:#f1f5f9;">DriveSafe Vision AI</div>
          <div style="font-size:12px;color:#60a5fa;letter-spacing:0.05em;">Daily Safety Report</div>
        </div>
      </div>
      <div style="font-size:26px;font-weight:800;color:#fff;margin-bottom:6px;">${now.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      <div style="font-size:13px;color:#475569;">Generated at ${now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:56px;font-weight:900;color:${safetyColor};line-height:1;">${safetyScore}</div>
      <div style="font-size:12px;color:#475569;margin-top:2px;text-transform:uppercase;letter-spacing:0.08em;">Safety Score</div>
    </div>
  </div>

  <!-- SUMMARY STATS -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:32px;">
    ${[
      { icon: "🚗", label: "Sessions Today", val: totalSessions, color: "#60a5fa" },
      { icon: "📊", label: "Avg Risk Score", val: `${avgRisk}%`, color: avgRisk > 70 ? "#ef4444" : avgRisk > 40 ? "#f59e0b" : "#22c55e" },
      { icon: "🔔", label: "Total Alerts", val: totalAlerts, color: totalAlerts > 0 ? "#f87171" : "#22c55e" },
      { icon: "🚨", label: "Critical Sessions", val: criticalCount, color: criticalCount > 0 ? "#ef4444" : "#22c55e" },
    ].map((c) => `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(96,165,250,0.1);border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:28px;margin-bottom:10px;">${c.icon}</div>
        <div style="font-size:30px;font-weight:800;color:${c.color};">${c.val}</div>
        <div style="font-size:11px;color:#64748b;margin-top:5px;">${c.label}</div>
      </div>`).join("")}
  </div>

  <!-- SESSION COMPARISON BARS (multi-session) -->
  ${sessions.length > 1 ? `
  <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(96,165,250,0.1);border-radius:12px;padding:24px;margin-bottom:32px;">
    <div style="font-size:16px;font-weight:800;color:#f1f5f9;margin-bottom:4px;">Session Risk Comparison</div>
    <div style="font-size:13px;color:#64748b;margin-bottom:20px;">Maximum risk score per session throughout the day</div>
    ${sessions.map((s, i) => `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">
          <span style="color:#94a3b8;">Session ${i + 1} — ${s.time}</span>
          <span style="color:${riskColor(s.maxRiskLevel)};font-weight:700;">${s.maxRiskScore || 0}%</span>
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:6px;height:10px;overflow:hidden;">
          <div style="height:100%;width:${s.maxRiskScore || 0}%;background:linear-gradient(90deg,#22c55e 0%,${(s.maxRiskScore||0)>40?"#f59e0b":"#22c55e"} 50%,${(s.maxRiskScore||0)>70?"#ef4444":"#f59e0b"} 100%);border-radius:6px;"></div>
        </div>
      </div>`).join("")}
  </div>` : ""}

  <!-- AI INSIGHTS -->
  <div style="background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:24px;margin-bottom:32px;">
    <div style="font-size:16px;font-weight:800;color:#60a5fa;margin-bottom:16px;">🧠 AI Safety Insights</div>
    ${insights.map((i) => `<div style="font-size:13px;color:#cbd5e1;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(96,165,250,0.1);border-left:3px solid #3b82f6;border-radius:8px;margin-bottom:8px;">${i}</div>`).join("")}
  </div>

  <!-- SESSION DETAILS -->
  <div style="font-size:20px;font-weight:800;color:#f1f5f9;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(96,165,250,0.1);">
    📋 Session Details
  </div>
  ${sessionsHTML}

  <!-- RECOMMENDATIONS -->
  <div style="background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.15);border-radius:12px;padding:24px;margin-bottom:36px;">
    <div style="font-size:16px;font-weight:800;color:#4ade80;margin-bottom:16px;">💡 Safety Recommendations</div>
    ${recs.map((r) => `<div style="font-size:13px;color:#94a3b8;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:6px;margin-bottom:6px;">${r}</div>`).join("")}
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(96,165,250,0.1);">
    <div style="font-size:13px;color:#334155;">DriveSafe Vision AI &nbsp;|&nbsp; Powered by MediaPipe &nbsp;|&nbsp; Report generated ${now.toLocaleString()}</div>
    <div style="font-size:11px;color:#1e293b;margin-top:4px;">For informational purposes only. Not a substitute for medical advice.</div>
  </div>

</div>
</body>
</html>`;
}

export function triggerReportDownload(allSessions: any[]): void {
  const html = generateTodayReport(allSessions);

  // 1. Open in a new tab immediately (always works, no file security issues)
  const newTab = window.open("", "_blank");
  if (newTab) {
    newTab.document.open();
    newTab.document.write(html);
    newTab.document.close();
    newTab.document.title = `DriveSafe Vision AI — Report ${new Date().toLocaleDateString()}`;
  }

  // 2. Also trigger a file download so they can save it
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `drivesafe-report-${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revoking so browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
