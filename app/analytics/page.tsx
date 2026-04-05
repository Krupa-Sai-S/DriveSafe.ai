import { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export const metadata: Metadata = {
  title: "Analytics",
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <AnalyticsDashboard />
    </div>
  )
}
