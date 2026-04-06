import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, Download, X } from 'lucide-react';

export default function ImageGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const generateImage = async () => {
    setIsGenerating(true);
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
          parts: [{ text: prompt }],
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
          const base64Data = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64Data}`);
          setShowModal(true);
          break;
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={generateImage}
        disabled={isGenerating}
        className="flex items-center gap-2 bg-[#E6FF00] text-[#4A5D4E] px-6 py-3 rounded-full font-black text-sm uppercase italic hover:scale-105 transition-all disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating UI Concept...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate UI Concept
          </>
        )}
      </button>

      <AnimatePresence>
        {showModal && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-[#4A5D4E] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#5E7162]">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">UI Concept Preview</h3>
                <div className="flex items-center gap-4">
                  <a
                    href={imageUrl}
                    download="ui-concept.png"
                    className="p-2 bg-[#E6FF00] text-[#4A5D4E] rounded-full hover:scale-110 transition-all"
                  >
                    <Download size={20} />
                  </a>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-black/20">
                <img
                  src={imageUrl}
                  alt="Generated UI Concept"
                  className="w-full h-auto rounded-xl shadow-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
