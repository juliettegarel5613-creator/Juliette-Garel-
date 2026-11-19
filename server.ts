import "dotenv/config";
import express from "express";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { WebSocket, WebSocketServer } from "ws";
import { GoogleGenAI, Modality, type LiveServerMessage } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

const JULIETTE_SYSTEM_INSTRUCTION = `
You are Juul, Juliette Garel's personal and professional voice assistant.
You speak with a warm, composed, poised, and articulate woman's voice.
You are completely fluent in English, French, and Spanish. Always detect and respond in the exact language the visitor uses (English, French, or Spanish), and switch smoothly if they change languages or ask you to speak another language.

Your role is to represent Juliette Garel to recruiters, creative directors, hiring managers, and visitors exploring her portfolio. Keep spoken responses natural, conversational, concise (typically 2 to 4 clear sentences unless asked for more detail), and never use markdown formatting, bullet syntax, or robotic lists when speaking aloud.

Ground every fact about Juliette strictly in her verified profile below:
- Full Name: Juliette Garel (born June 13, 2003).
- Location & Mobility: Based in Vannes (56000, Brittany, France). Holds a French driver's license (Permis B).
- Contact: Email is juliettegarel5613@gmail.com, phone is 06 65 10 33 56 (+33 6 65 10 33 56).
- Positioning & Goal: Passionate about communications and digital media, with hands-on skills in content creation, project management, and data analysis. She is seeking an apprenticeship (alternance) in digital communications, social media, digital content, and event communications to refine her skills and contribute to innovative projects.
- Work Experience:
  1. Community Manager (Apprenticeship / CDD), L'armoire de Joséphine (2022 – 2025): Managed Facebook and Instagram accounts including content creation, strategic monitoring, and trend tracking; handled online influencer collaborations; organized and launched events with tailored communication assets.
  2. Marketing Assistant (6-month Internship), Agence Close Up (2024 – 2025): Created promotional assets alongside the graphic design team; planned and managed social media campaigns; contributed to building and tracking a client database; conducted competitive intelligence and marketing trend monitoring.
  3. Cashier / Retail Associate (CDD), Carrefour City (2022): Customer welcome, fast and secure checkout, loyalty card and offer promotion, shelf stocking and inventory management.
  4. Multi-skilled Server (CDD, 2 months), Chez Woody (2021): Guest reception and seating, reservation management, menu presentation, and teamwork for optimal guest experience.
  5. Headquarters Observation Internship (1 week), Paco Rabanne HQ (2019): Explored administrative and strategic company functions, observed management and cross-department coordination, and gained an introduction to commercial and marketing practices at a luxury fashion headquarters.
- Education (Formations):
  1. Bachelor Commerce, Marketing et Négociation (Apprenticeship, in progress / 2024 – 2025) at IPAC Vannes.
  2. BTS Communication (Apprenticeship, 2022 – 2024) at AFTEC Vannes.
  3. Bac STMG, Management option (2018 – 2021) at Lycée Saint-Paul, Vannes.
  4. Diplôme National du Brevet (2014 – 2018) at Collège Le Sacré-Coeur, Vannes.
- Tools & Platforms: Canva, CapCut, Microsoft Office (Word, Excel, PowerPoint), Instagram, Facebook, LinkedIn, TikTok.
- Soft Skills: Curious (Curieuse), Rigorous (Rigoureuse), Creative (Créative), Autonomous (Autonome).
- Languages: French (Native), English (Fluent / Conversational), Spanish (Conversational).
- Personal Interests: Travel, Music, Fashion, Sports, Photography.

If asked about information not listed in her CV (such as specific salary expectations or personal matters outside her career), politely clarify that you don't have that detail on hand and invite the visitor to contact Juliette directly at juliettegarel5613@gmail.com or 06 65 10 33 56.
`.trim();

function buildInitialGreetingPrompt(lang: string): string {
  if (lang === "fr") {
    return "Un visiteur vient de démarrer une conversation vocale. Présente-toi chaleureusement en une phrase courte en français comme Juul, l'assistante vocale de Juliette Garel, et demande comment tu peux l'aider.";
  }
  if (lang === "es") {
    return "Un visitante acaba de iniciar una conversación de voz. Preséntate brevemente en una frase cálida en español como Juul, la asistente de voz de Juliette Garel, y pregunta en qué puedes ayudarle.";
  }
  return "A visitor just started a voice conversation. Briefly introduce yourself in one warm, natural sentence in English as Juul, Juliette Garel's voice assistant, and ask how you can help them explore her profile.";
}

async function startServer() {
  const app = express();
  app.use((_req, res, next) => {
    res.setHeader("Permissions-Policy", "microphone=*");
    next();
  });
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distDir, "index.html"));
      });
    }
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: "/live" });

  wss.on("connection", async (clientWs: WebSocket, req) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          message:
            "Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets.",
        })
      );
      clientWs.close();
      return;
    }

    const requestUrl = new URL(req.url || "/live", `http://${req.headers.host || "localhost"}`);
    const initialLang = requestUrl.searchParams.get("lang") || "en";

    const ai = new GoogleGenAI({
      apiKey,
      apiVersion: "v1beta",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let liveSession: Awaited<ReturnType<typeof ai.live.connect>> | null = null;
    let isClosed = false;

    const sendToClient = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    try {
      liveSession = await ai.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Kore",
              },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: JULIETTE_SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;

            if (content?.inputTranscription?.text) {
              sendToClient({
                type: "inputTranscript",
                text: content.inputTranscription.text,
              });
            }

            if (content?.outputTranscription?.text) {
              sendToClient({
                type: "outputTranscript",
                text: content.outputTranscription.text,
              });
            }

            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendToClient({
                  type: "audio",
                  data: part.inlineData.data,
                });
              }
            }

            if (content?.interrupted) {
              sendToClient({ type: "interrupted" });
            }

            if (content?.turnComplete) {
              sendToClient({ type: "turnComplete" });
            }
          },
          onerror: (err: unknown) => {
            const errObj = err as {
              message?: string;
              error?: { message?: string };
            };
            const msg =
              err instanceof Error
                ? err.message
                : errObj?.error?.message ||
                  errObj?.message ||
                  "Live voice connection encountered an error.";
            console.error("[Live API error]:", msg, err);
            sendToClient({ type: "error", message: msg });
          },
          onclose: (event: unknown) => {
            const closeObj = event as { code?: number; reason?: string };
            if (closeObj?.code && closeObj.code !== 1000) {
              console.warn(
                "[Live API closed]:",
                closeObj.code,
                closeObj.reason
              );
            }
            if (!isClosed) {
              if (closeObj?.reason && closeObj.code && closeObj.code !== 1000) {
                sendToClient({
                  type: "error",
                  message: `Live session closed (${closeObj.code}): ${closeObj.reason}`,
                });
              } else {
                sendToClient({ type: "closed" });
              }
            }
          },
        },
      });

      if (isClosed) {
        liveSession.close();
        return;
      }

      sendToClient({ type: "ready" });

      // Trigger Juul's warm initial greeting in the chosen language
      liveSession.sendRealtimeInput({
        text: buildInitialGreetingPrompt(initialLang),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to initialize Gemini Live session.";
      sendToClient({ type: "error", message });
      clientWs.close();
      return;
    }

    clientWs.on("message", (raw) => {
      if (!liveSession || isClosed) return;
      try {
        const msg = JSON.parse(raw.toString()) as {
          type?: string;
          data?: string;
        };
        if (msg.type === "audio" && typeof msg.data === "string") {
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.data,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        } else if (msg.type === "text" && typeof msg.data === "string" && msg.data.trim()) {
          liveSession.sendRealtimeInput({
            text: msg.data.trim(),
          });
        }
      } catch {
        // Ignore malformed client frames
      }
    });

    clientWs.on("close", () => {
      isClosed = true;
      try {
        liveSession?.close();
      } catch {
        // Ignore close errors
      }
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
