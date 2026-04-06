/**
 * Aura Vision AI - Knowledge Base
 * This file contains the personalized data for the RAG bot.
 */

export const AURA_KNOWLEDGE = {
  owner: {
    name: "Krupa Sai S",
    role: "Lead AI Engineer & Visionary",
    vision: "To eliminate road accidents caused by human fatigue through seamless AI integration.",
    contact: "contact@auravision.ai",
  },
  project: {
    name: "Aura Vision AI",
    version: "2.0.0 (Aura Overhaul)",
    core_tech: [
      "Next.js 15 (App Router)",
      "MediaPipe Vision Tasks",
      "Local Simulated RAG Bot",
      "Framer Motion (Animations)",
      "Tailwind CSS (Styling)",
    ],
    features: [
      "Real-time Drowsiness Detection (EAR Analysis)",
      "Yawn Detection (MAR Analysis)",
      "Head Pose & Distraction Monitoring",
      "Heart Rate Estimation (Visual Cardiac Analysis)",
      "Stealth HUD Interface",
      "Local-first privacy (No data leaves the device)",
    ],
  },
  safety_tips: [
    "If you feel drowsy, pull over immediately. A 20-minute nap is more effective than caffeine.",
    "Most fatigue-related accidents occur between 2 AM and 6 AM.",
    "Signs of drowsiness include frequent yawning, difficulty focusing, and drifting from lanes.",
    "Aura Vision AI is an assistive tool and should not replace driver responsibility.",
  ],
  detection_info: {
    sleep: "The system detects micro-sleeps by tracking your Eye Aspect Ratio (EAR). If your eyes close for more than a few frames, the system will trigger a critical red alert state and sound an alarm.",
    yawning: "Yawning is tracked via the Mouth Aspect Ratio (MAR). Multiple consecutive yawns drastically increase your drowsiness risk score.",
    distraction: "If your face turns away from the central axis for too long, the system registers distraction and issues a warning to look back at the road."
  },
  faq: [
    {
      q: "Is my camera data stored?",
      a: "No. Aura Vision AI processes all video frames locally in your browser. None of your visual data is ever sent to a server.",
    },
    {
      q: "How does the RAG bot work?",
      a: "I am a local AI assistant. I use a custom knowledge base to provide specific information about this project, sleep safety, and its creator.",
    },
    {
      q: "Can I use this offline?",
      a: "Yes! Once the AI models are loaded, the detection system works entirely offline.",
    },
  ],
};
