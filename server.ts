import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Helper to initialize Gemini safely
  const getGeminiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables.");
    }
    return new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API: Generate premium wedding invitation content or translate/refine names/details
  app.post("/api/gemini/generate-invitation", async (req, res) => {
    try {
      const {
        brideName,
        groomName,
        brideParents,
        groomParents,
        venue,
        style = "Royal Vedic",
        customPrompt = "",
      } = req.body;

      const ai = getGeminiClient();
      
      const systemInstruction = `You are a royal scriptwriter and premium Indian wedding invitation designer. 
Your goal is to write breathtakingly luxurious, emotionally warm, and culturally rich wedding invitation copy. 
Format your response with authentic traditional Hindu elements, high-end vocabulary, and elegant structure.
Always include appropriate Sanskritized shlokas (like Ganesha Vandana or Mangalam Bhagwan Vishnu), royal welcoming texts, and beautiful descriptions of the couple.
Style theme: ${style}.`;

      const prompt = `Please generate an ultra-premium wedding invitation card copy.
Couple Details:
- Bride: ${brideName}
- Groom: ${groomName}
- Bride's Parents: ${brideParents}
- Groom's Parents: ${groomParents}
- Venue & Location: ${venue}
- Theme & Mood: ${style}

${customPrompt ? `Special user request: ${customPrompt}` : ""}

Please structure the output into 4 high-class sections in JSON format:
1. "shloka": An elegant Sanskrit/Hindi shloka with its English translation.
2. "welcomeMessage": A highly emotional, royal, and warm paragraph inviting the guests.
3. "lovePoem": A beautiful 4-line romantic poem customized for ${brideName} and ${groomName} celebrating their union.
4. "closingBlessing": A respectful, high-end traditional closing blessing/RSVP note.

Return ONLY a valid JSON object matching this schema:
{
  "shloka": "...",
  "shlokaTranslation": "...",
  "welcomeMessage": "...",
  "lovePoem": "...",
  "closingBlessing": "..."
}
Do not write any markdown code fences or conversational text. Return pure JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.75,
        },
      });

      const text = response.text || "{}";
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      res.status(500).json({
        error: "Failed to generate royal invitation details.",
        details: error.message,
      });
    }
  });

  // API: Suggest Royal Aesthetic Combinations (Colors, Themes, Music vibes)
  app.post("/api/gemini/suggest-aesthetics", async (req, res) => {
    try {
      const { regionalVibe = "Rajasthani Palace" } = req.body;
      const ai = getGeminiClient();

      const prompt = `For a high-end Indian wedding with the regional vibe of "${regionalVibe}", provide a luxury aesthetic palette.
Include:
- 3-color gold-themed palette hex codes (primary, secondary, accent)
- The perfect background music raga or instrument style (e.g., Sitar, Shehnai, Flute, Santoor)
- A brief 1-sentence royal decoration description (e.g., marigold cascade, brass lamps, palace courtyard)

Return ONLY a JSON response matching:
{
  "colors": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX"
  },
  "musicVibe": "...",
  "decorStyle": "..."
}
Do not include markdown. Return pure JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const text = response.text || "{}";
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Aesthetic Suggestion Error:", error);
      res.status(500).json({
        error: "Failed to fetch aesthetic recommendations.",
        details: error.message,
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Royal Indian Invitation Studio Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
