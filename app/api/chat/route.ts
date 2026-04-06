import { AURA_KNOWLEDGE } from "@/lib/ai/knowledge";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // Simulated Local RAG Response Logic (No API Key Required)
    let reply = "I am Aura AI. I can provide information about this project, the developer, sleep detection mechanics, or safety protocols.";

    if (lastMessage.includes("who are you") || lastMessage.includes("bot info") || lastMessage.includes("your info") || lastMessage.includes("yourself")) {
      reply = `I am the Aura Vision AI Assistant, created by ${AURA_KNOWLEDGE.owner.name}, the ${AURA_KNOWLEDGE.owner.role}. My purpose is to assist with real-time driver monitoring, safety, and telemetry analysis.`;
    } 
    else if (lastMessage.includes("owner") || lastMessage.includes("developer") || lastMessage.includes("creator") || lastMessage.includes("who made")) {
      reply = `This advanced safety system was engineered by ${AURA_KNOWLEDGE.owner.name}. Vision: "${AURA_KNOWLEDGE.owner.vision}"`;
    } 
    else if (lastMessage.includes("sleep") || lastMessage.includes("micro-sleep") || lastMessage.includes("drowsiness")) {
      reply = `${AURA_KNOWLEDGE.detection_info.sleep} Also, remember: ${AURA_KNOWLEDGE.safety_tips[0]}`;
    }
    else if (lastMessage.includes("yawn")) {
      reply = AURA_KNOWLEDGE.detection_info.yawning;
    }
    else if (lastMessage.includes("distract") || lastMessage.includes("focus") || lastMessage.includes("look away")) {
      reply = AURA_KNOWLEDGE.detection_info.distraction;
    }
    else if (lastMessage.includes("detect") || lastMessage.includes("how it works") || lastMessage.includes("feature")) {
      reply = `Aura Vision AI monitors 3 core metrics: 1. EAR (Eye Aspect Ratio) for sleep. 2. MAR (Mouth Aspect Ratio) for yawning. 3. Head Pose for distraction. All processing is strictly local.`;
    } 
    else if (lastMessage.includes("safe") || lastMessage.includes("tip")) {
      reply = `Safety Alert: ${AURA_KNOWLEDGE.safety_tips[Math.floor(Math.random() * AURA_KNOWLEDGE.safety_tips.length)]}`;
    } 
    else if (lastMessage.includes("store") || lastMessage.includes("privacy") || lastMessage.includes("data")) {
      reply = AURA_KNOWLEDGE.faq[0].a;
    }
    else if (lastMessage.includes("offline")) {
      reply = AURA_KNOWLEDGE.faq[2].a;
    }
    else if (lastMessage.includes("hello") || lastMessage.includes("hi") || lastMessage.includes("hey")) {
      reply = "Greetings. Neural uplink is active. How can I assist you with Aura Vision AI today?";
    }

    // Small delay to simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 600));

    return Response.json({ content: reply });
  } catch (error: any) {
    console.error("Local Bot Error:", error);
    return Response.json({ error: "Failed to process message." }, { status: 500 });
  }
}

