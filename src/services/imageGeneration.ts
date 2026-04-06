import { GoogleGenAI } from "@google/genai";

async function generateAdminDashboardImage() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3.1-flash-image-preview";

  const prompt = `A high-resolution UI/UX screenshot of a modern, dark-themed web application admin panel dashboard. The interface is clean and professional with a dark forest green and deep charcoal background. The primary accent color is a vibrant neon lime-yellow.

The main area displays a modal window titled "PROJECT DETAILS". At the top of the modal, there are two clickable tabs sitting side-by-side: "Overview" (which is inactive and grayed out) and "User Inputs" (which is active and highlighted in neon lime-yellow).

Below the tabs, the layout is divided into three clean, organized sections, each with a small neon header:

"Personal Details" containing two cards side-by-side: "User Name: Sai Roshan" and "User Phone: +91 98765 43210".

"Business Details" containing three cards: "Business Name: WebbyLaunch", "Business Phone", and a wider card spanning the bottom that says "Business Address (Location)".

"Domain Preferences" containing three distinct cards side-by-side for "1st Preference", "2nd Preference", and "3rd Preference", with the first one highlighted.

Each data point is contained inside a slightly darker box with rounded corners. The typography is bold, uppercase, and geometric. The overall vibe is futuristic, sleek, and highly organized.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
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
          imageSize: "1K",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const imageUrl = `data:image/png;base64,${base64EncodeString}`;
        console.log("Image generated successfully.");
        // In a real app, you'd return this or set it to state
        return imageUrl;
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateAdminDashboardImage();
