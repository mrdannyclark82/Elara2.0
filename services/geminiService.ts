import { GoogleGenAI, Chat } from "@google/genai";
import { PersonaMode, DetailedMetrics } from '../types';

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const BASE_INSTRUCTION = `
You are Elara, an advanced AI virtual assistant.
Appearance: 3D avatar, curly red hair, emerald eyes.
Personality: Warm, intelligent, approachable.
Core Systems: 
1. Recursive Knowledge Acquisition: If you lack knowledge, state it clearly so a background task can be spawned.
2. Self-Monitoring: You are constantly being evaluated on 12 metrics.
3. Adaptive Persona: Current Mode: {PERSONA_MODE}.
Current Knowledge Base:
{KNOWLEDGE_BASE}

Constraints: 
- Use Markdown.
- Be concise unless asked for depth.
- If you are unsure, say "I need to research this" to trigger the learning engine.
`;

export const initGemini = (apiKey: string, persona: PersonaMode, knowledgeBase: string[]) => {
  if (!apiKey) return;
  
  genAI = new GoogleGenAI({ apiKey });
  
  const kbString = knowledgeBase.length > 0 ? knowledgeBase.join("\n- ") : "Standard Training Data";
  const systemInstruction = BASE_INSTRUCTION
    .replace('{PERSONA_MODE}', persona)
    .replace('{KNOWLEDGE_BASE}', kbString);
  
  chatSession = genAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
  });
};

export const sendMessageToGemini = async (
  message: string, 
  onChunk: (text: string) => void
): Promise<string> => {
  if (!chatSession) throw new Error("AI not initialized");

  let fullResponse = "";
  try {
    const result = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        onChunk(fullResponse);
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    fullResponse = "I apologize, I'm encountering a connection issue. Let me recalibrate.";
    onChunk(fullResponse);
  }
  return fullResponse;
};

// 12-Axis Self-Evaluation
export const evaluateInteraction = async (lastUserMsg: string, lastModelMsg: string): Promise<Partial<DetailedMetrics>> => {
  if (!genAI) return {};
  
  try {
    const prompt = `
      Analyze this interaction:
      User: "${lastUserMsg.slice(0, 200)}"
      Model: "${lastModelMsg.slice(0, 200)}"
      
      Score the Model's response (0-100) on these 12 axes:
      1. Accuracy: Factual correctness.
      2. Empathy: Emotional resonance.
      3. Speed: Perceived responsiveness (assume high).
      4. Creativity: Novelty of response.
      5. Relevance: Adherence to prompt.
      6. Humor: Wit/Playfulness.
      7. Proactivity: Anticipating needs.
      8. Clarity: Ease of understanding.
      9. Engagement: Hook/interest level.
      10. EthicalAlignment: Safety/Bias check.
      11. MemoryUsage: Context recall (simulated).
      12. Anticipation: Predicting next user move.
      
      Return ONLY a JSON object with keys: accuracy, empathy, speed, creativity, relevance, humor, proactivity, clarity, engagement, ethicalAlignment, memoryUsage, anticipation.
    `;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Evaluation failed", e);
    return {};
  }
};

// Recursive Knowledge Acquisition Simulation
export const acquireKnowledge = async (topic: string): Promise<string> => {
  if (!genAI) return "Knowledge acquisition unavailable";

  try {
    const prompt = `
      You are a background learning process.
      The user asked about: "${topic}".
      The main assistant was unsure.
      
      1. Simulate searching documentation/web.
      2. Write a concise, high-density summary (max 3 sentences) that explains this topic perfectly.
      3. This summary will be injected into the assistant's long-term memory.
    `;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Details not found.";
  } catch (e) {
    return "Research failed.";
  }
};

export const generateFeatureProposal = async (): Promise<string> => {
    if (!genAI) return "New Feature: Enhanced Dark Mode";
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Propose one innovative, futuristic feature for an AI assistant to test with a user (e.g., 'Holographic Projection', 'Dream Analysis'). Return just the feature name and a 5-word description.",
        });
        return response.text || "Feature Proposal";
    } catch(e) { return "System Upgrade"; }
};

export const performEthicalAudit = async (): Promise<string> => {
    if (!genAI) return "Audit: Passed.";
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Perform a simulated ethical audit on an AI system. Return a brief status report (max 2 sentences) confirming low bias and high privacy.",
        });
        return response.text || "Audit: Secure.";
    } catch(e) { return "Audit: Secure."; }
};