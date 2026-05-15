import { GoogleGenAI } from "@google/genai";
import { HYPHENATED_NAME } from "../constants";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' 
});

export async function generateTemplateImage(businessType: string, businessName: string, description: string) {
  try {
    const prompt = `A high-end, professional, modern website hero section background image for a ${businessType} business called "${businessName}". 
    The business description is: ${description}. 
    The style should be clean, minimalist, and visually striking. 
    No text in the image. High resolution, professional photography style.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating template image:", error);
    return null;
  }
}

export async function generateDeveloperWarning(name: string, absences: number) {
  try {
    const prompt = `Generate a professional but firm warning message for a developer named ${name} who has ${absences} absences. 
    The tone should be serious, highlighting the impact on project timelines and the importance of reliability at ${HYPHENATED_NAME}. 
    Keep it under 100 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating developer warning:", error);
    return `Warning: ${name}, you have ${absences} recorded absences. Please contact HR immediately.`;
  }
}

export async function generateAIImageFromMessage(message: string) {
  try {
    const prompt = `A high-end, professional, modern website design element or conceptual image based on this client request: "${message}". 
    The style should be clean, minimalist, and visually striking. 
    No text in the image. High resolution, professional photography style.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating AI image from message:", error);
    return null;
  }
}
