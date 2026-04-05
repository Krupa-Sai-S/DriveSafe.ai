import { Metadata } from "next"
import { HomeContent } from "./home-content"

export const metadata: Metadata = {
  title: "Driver Safety AI | Home",
}

export default function HomePage() {
  return <HomeContent />
}
