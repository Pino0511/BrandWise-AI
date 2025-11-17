
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { BrandIdentityPlan, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chatInstance: Chat | null = null;

const brandIdentitySchema = {
  type: Type.OBJECT,
  properties: {
    logoPrompt: {
      type: Type.STRING,
      description: "A detailed, artistic prompt for a text-to-image model to create a primary logo. Must be in English.",
    },
    secondaryMarkPrompts: {
      type: Type.ARRAY,
      description: "An array of 2 distinct prompts for generating secondary brand marks or icons.",
      items: { type: Type.STRING },
    },
    colorPalette: {
      type: Type.ARRAY,
      description: "A 5-color palette.",
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING, description: "The hex code of the color." },
          name: { type: Type.STRING, description: "A common name for the color." },
          usage: { type: Type.STRING, description: "Suggested usage for the color (e.g., 'Primary CTA', 'Background')." },
        },
        required: ["hex", "name", "usage"],
      },
    },
    fontPairing: {
      type: Type.OBJECT,
      description: "A Google Font pairing suggestion.",
      properties: {
        headerFont: { type: Type.STRING, description: "Google Font for headers." },
        bodyFont: { type: Type.STRING, description: "Google Font for body text." },
      },
      required: ["headerFont", "bodyFont"],
    },
  },
  required: ["logoPrompt", "secondaryMarkPrompts", "colorPalette", "fontPairing"],
};


export const generateBrandIdentityPlan = async (mission: string): Promise<BrandIdentityPlan> => {
  const prompt = `
    You are a world-class branding expert. A user will provide their company mission. Your task is to generate a complete brand identity guide in a structured JSON format.

    Company Mission: "${mission}"

    Based on this mission, generate the following:
    1.  A detailed, specific, and artistic prompt for a text-to-image model to create a primary company logo. The logo should be modern, memorable, and relevant to the company's mission. Describe the style (e.g., minimalist, geometric, abstract), color scheme, and key visual elements. Example: "A minimalist, geometric logo of a stylized phoenix rising, using shades of deep blue and vibrant orange, vector art, on a clean white background."
    2.  An array of two (2) distinct prompts for generating secondary brand marks or icons. These should complement the primary logo but be simpler, suitable for favicons or app icons.
    3.  A 5-color palette. For each color, provide its hex code, a common name, and a suggested usage. The colors should be harmonious and reflect the brand's mood.
    4.  A Google Font pairing suggestion. Provide one font for headers and one for body text that are legible, professional, and complementary.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: brandIdentitySchema,
    },
  });

  const jsonString = response.text.trim();
  try {
    return JSON.parse(jsonString) as BrandIdentityPlan;
  } catch (e) {
    console.error("Failed to parse brand identity plan:", e);
    throw new Error("Received invalid JSON from API for brand identity plan.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }
    throw new Error("Image generation failed.");
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: 'You are a helpful and friendly branding assistant. Answer questions about branding, marketing, and design.',
            },
        });
    }

    const response = await chatInstance.sendMessage({ message: newMessage });
    return response.text;
};
