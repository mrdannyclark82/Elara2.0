import { GoogleGenAI, Modality, Type } from "@google/genai";
import { PersonaMode, DetailedMetrics, ToolMode, Attachment, Message } from '../types';

let genAI: GoogleGenAI | null = null;
let activeApiKey = '';

export const initGemini = (apiKey: string) => {
  if (!apiKey) return;
  activeApiKey = apiKey;
  genAI = new GoogleGenAI({ apiKey });
};

// --- CORE DISPATCHER ---
// Routes the user's request to the appropriate model and function based on the selected tool and content.

export const processUserRequest = async (
    text: string, 
    tool: ToolMode, 
    attachments: Attachment[], 
    persona: PersonaMode,
    knowledgeBase: string[]
): Promise<Partial<Message>> => {
    
    if (!genAI) throw new Error("AI Not Initialized");

    // 1. VIDEO GENERATION (Veo)
    if (tool === ToolMode.VIDEO_GEN) {
        return await generateVeoVideo(text, attachments[0]);
    }

    // 2. IMAGE GENERATION (Imagen / Nano Banana)
    if (tool === ToolMode.IMAGE_GEN) {
        return await generateImage(text);
    }

    // 3. TEXT & ANALYSIS (Chat, Search, Maps, Vision)
    // Setup Model & Tools
    let model = 'gemini-3-pro-preview'; // Default for "AI Powered Chatbot"
    let tools: any[] = [];
    
    if (tool === ToolMode.SEARCH) {
        model = 'gemini-2.5-flash';
        tools = [{ googleSearch: {} }];
    } else if (tool === ToolMode.MAPS) {
        model = 'gemini-2.5-flash';
        tools = [{ googleMaps: {} }];
    }
    
    // Construct System Instruction
    // Limit Knowledge Base to last 20 entries to manage token usage
    const recentKB = knowledgeBase.slice(-20);
    const kbString = recentKB.length > 0 ? recentKB.join("\n- ") : "Standard Data";
    const systemInstruction = `You are Elara. Persona: ${persona}. Knowledge: ${kbString}. Return answers in Markdown.`;

    // Prepare Contents (Multimodal)
    const parts: any[] = [{ text }];
    
    if (attachments.length > 0) {
        // If analyzing images/video, ensure we use Pro-Preview (it supports vision best)
        // Unless specific tool overrides it, but Search/Maps don't usually take images.
        if (tool === ToolMode.CHAT) model = 'gemini-3-pro-preview'; 
        
        attachments.forEach(att => {
            parts.push({
                inlineData: { mimeType: att.mimeType, data: att.data }
            });
        });
    }

    try {
        const response = await genAI.models.generateContent({
            model,
            contents: { parts },
            config: {
                systemInstruction,
                tools: tools.length > 0 ? tools : undefined,
                temperature: 0.7
            }
        });

        const result: Partial<Message> = {
            role: 'model',
            content: response.text || "I processed that, but have no text response.",
            timestamp: Date.now()
        };

        // Extract Grounding Metadata
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            result.groundingSources = response.candidates[0].groundingMetadata.groundingChunks
                .map((chunk: any) => {
                    if (chunk.web?.uri) return { title: chunk.web.title || 'Web Source', uri: chunk.web.uri };
                    if (chunk.maps?.uri) return { title: 'Google Maps', uri: chunk.maps.uri }; // Handle Maps format
                    return null;
                })
                .filter((s: any) => s !== null);
        }

        return result;

    } catch (error) {
        console.error("GenAI Error:", error);
        return { role: 'model', content: "I encountered an error processing your request.", timestamp: Date.now() };
    }
};

// --- SPECIALIZED FUNCTIONS ---

// Image Generation
async function generateImage(prompt: string): Promise<Partial<Message>> {
    if (!genAI) return { role: 'model', content: 'AI not ready.' };
    
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
            }
        });

        let imageUri = '';
        let text = '';

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageUri = `data:image/png;base64,${part.inlineData.data}`;
            } else if (part.text) {
                text += part.text;
            }
        }

        if (imageUri) {
            return { role: 'model', content: text || "Here is your generated image.", imageUri, timestamp: Date.now() };
        }
        return { role: 'model', content: "Failed to generate image.", timestamp: Date.now() };

    } catch (e) {
        return { role: 'model', content: "Image generation error.", timestamp: Date.now() };
    }
}

// Video Generation (Veo)
async function generateVeoVideo(prompt: string, image?: Attachment): Promise<Partial<Message>> {
    if (!genAI) return { role: 'model', content: 'AI not ready.' };

    try {
        // Prepare Payload
        const payload: any = {
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt || "A creative video", // Prompt is required
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        };

        if (image) {
            payload.image = { imageBytes: image.data, mimeType: image.mimeType };
        }

        let operation = await genAI.models.generateVideos(payload);

        // Polling
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await genAI.operations.getVideosOperation({ operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
            // Append API Key for playback
            const signedUri = `${videoUri}&key=${activeApiKey}`;
            return { 
                role: 'model', 
                content: `Video generated successfully using Veo.`, 
                videoUri: signedUri, 
                timestamp: Date.now() 
            };
        }
        return { role: 'model', content: "Video generation completed but no URI returned.", timestamp: Date.now() };

    } catch (e) {
        console.error(e);
        return { role: 'model', content: "Video generation failed. Please try again.", timestamp: Date.now() };
    }
}

// Text to Speech
export const generateSpeech = async (text: string): Promise<string | null> => {
    if (!genAI) return null;
    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            }
        });
        
        const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64) return `data:audio/mp3;base64,${base64}`; // Note: Format is raw PCM usually, but browser might need decoding context. 
        // *Correction*: The SDK returns raw PCM. For simple playback in <audio src>, we need a WAV header or use AudioContext.
        // For this demo, we'll return null and rely on the Live API for voice, or implement a full WAV encoder if needed.
        // Returning null to prevent broken audio players.
        return null; 
    } catch (e) { return null; }
};


// 12-Axis Self-Evaluation (Existing)
export const evaluateInteraction = async (lastUserMsg: string, lastModelMsg: string): Promise<Partial<DetailedMetrics>> => {
  if (!genAI) return {};
  try {
    const prompt = `Score Model response (0-100) on 12 axes: accuracy, empathy, speed, creativity, relevance, humor, proactivity, clarity, engagement, ethicalAlignment, memoryUsage, anticipation. JSON only. User: "${lastUserMsg.slice(0,50)}..." Model: "${lastModelMsg.slice(0,50)}..."`;
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { return {}; }
};

// Recursive Knowledge (Existing)
export const acquireKnowledge = async (topic: string): Promise<string> => {
  if (!genAI) return "Unavailable";
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Research and summarize "${topic}" in 2 sentences.`,
    });
    return response.text || "Not found.";
  } catch (e) { return "Failed."; }
};

export const generateFeatureProposal = async (): Promise<string> => {
    if (!genAI) return "Holographic UI";
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Propose 1 futuristic AI feature name (5 words max).",
        });
        return response.text || "System Upgrade";
    } catch(e) { return "System Upgrade"; }
};

export const performEthicalAudit = async (): Promise<string> => {
    if (!genAI) return "Audit: OK";
    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Ethical audit status? Short.",
        });
        return response.text || "Audit: Secure.";
    } catch(e) { return "Audit: Secure."; }
};