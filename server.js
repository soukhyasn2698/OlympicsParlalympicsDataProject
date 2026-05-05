import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

// Load .env manually
console.log("[startup] Loading .env file...");
try {
  const env = readFileSync(".env", "utf-8");
  let loaded = 0;
  for (const line of env.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    process.env[key] = value;
    loaded++;
    console.log(`[startup] Loaded env var: ${key} = ${key.includes("KEY") ? value.slice(0, 8) + "..." : value}`);
  }
  console.log(`[startup] Loaded ${loaded} env vars from .env`);
} catch (e) {
  console.warn("[startup] No .env file found — using system environment variables");
  console.warn("[startup] Error:", e.message);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

console.log(`[startup] PORT = ${PORT}`);
console.log(`[startup] GEMINI_API_KEY = ${GEMINI_API_KEY ? GEMINI_API_KEY.slice(0, 8) + "..." : "NOT SET ❌"}`);
console.log(`[startup] GEMINI_ENDPOINT = ${GEMINI_ENDPOINT}`);

app.use(express.json({ limit: "2mb" }));

// Gemini proxy endpoint
app.post("/api/ask", async (req, res) => {
  console.log("[/api/ask] Received request");
  console.log("[/api/ask] GEMINI_API_KEY present:", !!GEMINI_API_KEY);

  if (!GEMINI_API_KEY) {
    console.error("[/api/ask] ❌ GEMINI_API_KEY not set");
    return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    console.error("[/api/ask] ❌ Missing prompt in request body");
    return res.status(400).json({ error: "Missing prompt" });
  }

  console.log(`[/api/ask] Prompt length: ${prompt.length} chars`);
  console.log(`[/api/ask] Calling Gemini at: ${GEMINI_ENDPOINT}`);

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    console.log(`[/api/ask] Gemini response status: ${response.status}`);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("[/api/ask] ❌ Gemini error:", JSON.stringify(err));
      return res.status(response.status).json({ error: err?.error?.message ?? `Gemini error ${response.status}` });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response received.";
    console.log(`[/api/ask] ✅ Success, response length: ${text.length} chars`);
    return res.json({ text });
  } catch (err) {
    console.error("[/api/ask] ❌ Fetch error:", err);
    return res.status(500).json({ error: "Failed to reach Gemini API" });
  }
});

// Serve Vite build
const distPath = join(__dirname, "dist");
app.use(express.static(distPath));

// SPA fallback
app.get("*path", (_req, res) => {
  res.sendFile(join(distPath, "index.html"), (err) => {
    if (err) res.status(404).send("Not found — run npm run build first");
  });
});

createServer(app).listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`   API endpoint: http://localhost:${PORT}/api/ask\n`);
});
