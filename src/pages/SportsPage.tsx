import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, Send, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchOlympicsSportsData, fetchParalympicsSportsData, type SportRecord } from "@/data/sports";
import { askSportsAgent } from "@/lib/sportsAgent";

const SUGGESTIONS = [
  "Which sport won the most gold medals overall?",
  "Top 5 sports by total medals across all years?",
  "Which year had the most medals in Swimming?",
  "Compare Track & Field vs Swimming total medals",
  "Which sports only appeared once?",
];

const MEDAL_COLORS: Record<string, string> = {
  gold: "text-yellow-400",
  silver: "text-slate-300",
  bronze: "text-orange-400",
};

const SportsPage = ({ type = "olympics" }: { type?: "olympics" | "paralympics" }) => {
  const [data, setData] = useState<SportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");

  useEffect(() => {
    const fetcher = type === "paralympics" ? fetchParalympicsSportsData : fetchOlympicsSportsData;
    fetcher().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [type]);

  const years = useMemo(
    () => ["all", ...Array.from(new Set(data.map((d) => String(d.year)))).sort((a, b) => Number(b) - Number(a))],
    [data]
  );

  const seasons = useMemo(
    () => ["all", ...Array.from(new Set(data.map((d) => d.season)))],
    [data]
  );

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (yearFilter !== "all" && String(d.year) !== yearFilter) return false;
      if (seasonFilter !== "all" && d.season !== seasonFilter) return false;
      return true;
    });
  }, [data, yearFilter, seasonFilter]);

  const bySport = useMemo(() => {
    const map = new Map<string, SportRecord>();
    for (const d of filtered) {
      const existing = map.get(d.event);
      if (existing) {
        map.set(d.event, {
          ...existing,
          gold: existing.gold + d.gold,
          silver: existing.silver + d.silver,
          bronze: existing.bronze + d.bronze,
          total: existing.total + d.total,
        });
      } else {
        map.set(d.event, { ...d });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filtered]);

  const ask = async (q: string) => {
    if (!q.trim() || aiLoading) return;
    setAiLoading(true);
    setAnswer("");
    setError("");
    try {
      const response = await askSportsAgent(q, data);
      setAnswer(response);
    } catch {
      setError("Failed to get a response. Check your API key or try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading sports data…</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl tracking-wide text-foreground">Sports Medals</h1>
        <p className="text-muted-foreground mt-1">Team USA medal breakdown by sport</p>
      </div>

      {/* AI Agent — top */}
      <div className="dashboard-card rounded-2xl border p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-accent text-accent-foreground p-2">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Sports AI Agent</h2>
            <p className="text-sm text-muted-foreground">
              Ask anything — uses the full dataset regardless of filters
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setQuestion(s); ask(s); }}
              className="px-3 py-1.5 text-xs font-medium rounded-full border bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); ask(question); }} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Which sport has the most consistent gold medal wins?"
            className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <Button
            type="submit"
            disabled={aiLoading || !question.trim()}
            size="sm"
            className="bg-gold text-primary hover:bg-gold/90 border-0 shrink-0"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {aiLoading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing sports data…
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {answer && !aiLoading && (
          <div className="mt-3 rounded-xl bg-white/10 border border-white/15 p-4 text-sm text-white leading-relaxed whitespace-pre-wrap">
            <span className="text-gold font-semibold text-xs uppercase tracking-wider block mb-2">
              AI Agent Response
            </span>
            {answer}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y === "all" ? "All Years" : y}</option>
          ))}
        </select>
        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {seasons.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All Seasons" : s}</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground self-center">
          {bySport.length} sports · {filtered.reduce((s, d) => s + d.total, 0)} medals
        </span>
      </div>

      {/* Scrollable table */}
      <div className="rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-y-auto max-h-[420px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Sport</th>
                <th className="text-center px-4 py-3">🥇 Gold</th>
                <th className="text-center px-4 py-3">🥈 Silver</th>
                <th className="text-center px-4 py-3">🥉 Bronze</th>
                <th className="text-center px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {bySport.map((row, i) => (
                <tr
                  key={row.event}
                  className={`border-t border-border transition-colors hover:bg-accent/40 ${i === 0 ? "bg-yellow-50/30" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      {i === 0 && <Trophy className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
                      {row.event}
                    </span>
                  </td>
                  <td className={`text-center px-4 py-3 font-semibold ${MEDAL_COLORS.gold}`}>{row.gold}</td>
                  <td className={`text-center px-4 py-3 font-semibold ${MEDAL_COLORS.silver}`}>{row.silver}</td>
                  <td className={`text-center px-4 py-3 font-semibold ${MEDAL_COLORS.bronze}`}>{row.bronze}</td>
                  <td className="text-center px-4 py-3 font-bold text-foreground">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SportsPage;
