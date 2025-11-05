
import { GoogleGenAI, Modality } from "@google/genai";

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found in environment variables. Audio generation will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateAudio = async (text: string): Promise<string | null> => {
  if (!API_KEY) {
    console.error("Cannot generate audio without an API key.");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Pronounce the word: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
};
