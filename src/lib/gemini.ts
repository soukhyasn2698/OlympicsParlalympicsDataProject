import type { MedalRecord } from "@/data/medals";

const apiKey = (import.meta as unknown as { env: Record<string, string> }).env
  .VITE_GEMINI_API_KEY;

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;
export async function askAboutMedals(
  question: string,
  data: MedalRecord[],
  type: "olympics" | "paralympics"
): Promise<string> {
  const prompt = `You are a sports analytics assistant for Team USA ${type} medal data.

Here is the complete dataset (all years, all seasons):
${JSON.stringify(data, null, 2)}

Each record has: year, gold, silver, bronze, total medals, and season (summer/winter).

User question: ${question}

Answer concisely and directly based only on the data provided above. Use specific numbers. Keep the response under 150 words.`;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response received.";
}
