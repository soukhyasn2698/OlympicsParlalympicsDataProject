export type Season = "summer" | "winter";

export type MedalRecord = {
  year: number;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  season: Season;
};

function parseCSV(text: string): MedalRecord[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(",");
      const row: Record<string, string> = {};
      headers.forEach((h, i) => (row[h] = values[i]?.trim() ?? ""));

      const seasonRaw = row["season"]?.toLowerCase();
      const season: Season =
        seasonRaw === "winter" ? "winter" : "summer";

      const gold = parseInt(row["gold"]) || 0;
      const silver = parseInt(row["silver"]) || 0;
      const bronze = parseInt(row["bronze"]) || 0;

      return {
        year: parseInt(row["year"]),
        gold,
        silver,
        bronze,
        total: gold + silver + bronze, // always compute, never trust CSV column
        season,
      };
    })
    .filter((r) => !isNaN(r.year));
}

export async function fetchMedalData(
  type: "olympics" | "paralympics"
): Promise<MedalRecord[]> {
  const file =
    type === "olympics"
      ? "/data/OlympicsTeamUSA.csv"
      : "/data/ParalympicsTeamUSA.csv";

  const res = await fetch(file);
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  const text = await res.text();
  return parseCSV(text).sort((a, b) => a.year - b.year);
}
