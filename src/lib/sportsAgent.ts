import type { SportRecord } from "@/data/sports";

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

type AggRow = { event: string; gold: number; silver: number; bronze: number; total: number };

function aggregateBy(
  data: SportRecord[],
  filterFn: (d: SportRecord) => boolean
): AggRow[] {
  const map = new Map<string, AggRow>();
  for (const d of data.filter(filterFn)) {
    const cur = map.get(d.event);
    if (cur) {
      cur.gold += d.gold;
      cur.silver += d.silver;
      cur.bronze += d.bronze;
      cur.total += d.total;
    } else {
      map.set(d.event, { event: d.event, gold: d.gold, silver: d.silver, bronze: d.bronze, total: d.total });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function formatTop(rows: AggRow[], n = 10): string {
  return rows
    .slice(0, n)
    .map((r, i) => `  ${i + 1}. ${r.event}: ${r.total} total (G:${r.gold} S:${r.silver} B:${r.bronze})`)
    .join("\n");
}

// Peak gold year(s) per event — includes all ties
function peakGoldYears(data: SportRecord[]): string {
  const map = new Map<string, { max: number; years: number[] }>();
  for (const d of data) {
    const cur = map.get(d.event);
    if (!cur || d.gold > cur.max) {
      map.set(d.event, { max: d.gold, years: [d.year] });
    } else if (d.gold === cur.max && d.gold > 0) {
      if (!cur.years.includes(d.year)) cur.years.push(d.year);
    }
  }
  return Array.from(map.entries())
    .filter(([, v]) => v.max > 0)
    .sort((a, b) => b[1].max - a[1].max)
    .map(([event, v]) => `  ${event}: peak ${v.max} gold in ${v.years.sort((a, b) => a - b).join(", ")}`)
    .join("\n");
}

function computeFacts(data: SportRecord[]): string {
  const allTime = aggregateBy(data, () => true);
  const summer = aggregateBy(data, (d) => d.season.toLowerCase() === "summer");
  const winter = aggregateBy(data, (d) => d.season.toLowerCase() === "winter");

  // Per-year totals
  const byYear = new Map<number, number>();
  for (const d of data) byYear.set(d.year, (byYear.get(d.year) ?? 0) + d.total);
  const topYears = Array.from(byYear.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([y, t]) => `${y}: ${t}`)
    .join(", ");

  return `
=== PRE-COMPUTED VERIFIED FACTS — USE AS GROUND TRUTH ===

ALL-TIME top 10 sports by total medals:
${formatTop(allTime)}

SUMMER season top 10 sports by total medals:
${formatTop(summer)}

WINTER season top 10 sports by total medals:
${formatTop(winter)}

Top years by total medals: ${topYears}

Peak gold year(s) per sport (all ties included):
${peakGoldYears(data)}

=== END VERIFIED FACTS ===`.trim();
}

export async function askSportsAgent(
  question: string,
  data: SportRecord[]
): Promise<string> {
  const facts = computeFacts(data);

  const prompt = `You are a sports analytics AI agent for Team USA Olympics medal data by sport.

${facts}

FULL DATASET (all records):
${JSON.stringify(data, null, 2)}

CRITICAL INSTRUCTIONS:
- The PRE-COMPUTED VERIFIED FACTS above are calculated directly from the data — treat them as absolute ground truth
- For any question about totals, rankings, or peaks, use the pre-computed facts first
- Only fall back to the raw dataset for queries not covered by the facts
- Always report ALL ties when finding "most" or "highest"
- Keep response under 200 words

User question: ${question}`;

  return callAI(prompt);
}
