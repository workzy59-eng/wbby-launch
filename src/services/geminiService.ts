import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
