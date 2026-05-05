import type { MedalRecord } from "@/data/medals";

async function callAI(prompt: string): Promise<string> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.text ?? "No response received.";
}

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

  return callAI(prompt);
}
