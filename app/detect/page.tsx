import { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { DetectionDashboard } from "@/components/detection-dashboard"

export const metadata: Metadata = {
  title: "Detection",
}

export default function DetectPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <DetectionDashboard />
    </div>
  )
}
