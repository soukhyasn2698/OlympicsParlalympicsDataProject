export type SportRecord = {
  event: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  year: number;
  season: string;
};

function parseCSV(text: string): SportRecord[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(",");
      const row: Record<string, string> = {};
      headers.forEach((h, i) => (row[h] = values[i]?.trim() ?? ""));

      const gold = parseInt(row["gold"]) || 0;
      const silver = parseInt(row["silver"]) || 0;
      const bronze = parseInt(row["bronze"]) || 0;

      return {
        event: row["event"],
        gold,
        silver,
        bronze,
        total: gold + silver + bronze,
        year: parseInt(row["year"]),
        season: row["season"] ?? "Summer",
      };
    })
    .filter((r) => !isNaN(r.year) && r.event);
}

export async function fetchOlympicsSportsData(): Promise<SportRecord[]> {
  const res = await fetch("/data/OlympicsSportsMedalsData.csv");
  if (!res.ok) throw new Error("Failed to load sports data");
  const text = await res.text();
  return parseCSV(text).sort((a, b) => b.year - a.year);
}

export async function fetchParalympicsSportsData(): Promise<SportRecord[]> {
  const res = await fetch("/data/ParalympicsSportsMedalData.csv");
  if (!res.ok) throw new Error("Failed to load sports data");
  const text = await res.text();
  return parseCSV(text).sort((a, b) => b.year - a.year);
}
