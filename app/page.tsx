import { Metadata } from "next"
import { HomeContent } from "./home-content"

export const metadata: Metadata = {
  title: "DriveSafe Vision AI | Home",
}

export default function HomePage() {
  return <HomeContent />
}
