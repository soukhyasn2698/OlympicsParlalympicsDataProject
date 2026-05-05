import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Medal, Trophy, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchMedalData, type MedalRecord, type Season } from "@/data/medals";
import AskAI from "@/components/AskAI";

type FilterMode = "range" | "single";
type SeasonFilter = Season | "both";

type Props = {
  type: "olympics" | "paralympics";
  title: string;
  subtitle: string;
  variant: "olympics" | "paralympics";
};

const MEDAL_COLORS = {
  gold: "hsl(var(--gold))",
  silver: "hsl(var(--silver))",
  bronze: "hsl(var(--bronze))",
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.75rem",
  boxShadow: "var(--shadow-card)",
  fontSize: "0.875rem",
};

const MedalDashboard = ({ type, title, subtitle, variant }: Props) => {
  const [data, setData] = useState<MedalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<FilterMode>("range");
  const [singleYear, setSingleYear] = useState<number | null>(null);
  const [season, setSeason] = useState<SeasonFilter>("both");

  useEffect(() => {
    setLoading(true);
    fetchMedalData(type).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [type]);

  // Apply season filter first
  const seasonFiltered = useMemo(
    () => (season === "both" ? data : data.filter((d) => d.season === season)),
    [data, season]
  );

  // All unique sorted years available after season filter
  const availableYears = useMemo(
    () => Array.from(new Set(seasonFiltered.map((d) => d.year))).sort((a, b) => a - b),
    [seasonFiltered]
  );

  const minYear = availableYears[0] ?? 1896;
  const maxYear = availableYears[availableYears.length - 1] ?? 2024;

  // Aggregate by year (sum across seasons when "both" is selected)
  const aggregatedByYear = useMemo(() => {
    const map = new Map<number, MedalRecord>();
    for (const d of seasonFiltered) {
      const existing = map.get(d.year);
      if (existing) {
        map.set(d.year, {
          year: d.year,
          gold: existing.gold + d.gold,
          silver: existing.silver + d.silver,
          bronze: existing.bronze + d.bronze,
          total: existing.total + d.total,
          season: d.season,
        });
      } else {
        map.set(d.year, { ...d });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.year - b.year);
  }, [seasonFiltered]);

  // Clamp range and singleYear when available years change — always reset to full bounds of new season
  useEffect(() => {
    if (!availableYears.length) return;
    const lo = availableYears[0];
    const hi = availableYears[availableYears.length - 1];
    // Always reset range to the full bounds of the newly selected season
    setRange([lo, hi]);
    setSingleYear((prev) => {
      if (prev != null && availableYears.includes(prev)) return prev;
      if (prev == null) return hi;
      // Snap to closest available year
      return availableYears.reduce((best, y) =>
        Math.abs(y - prev) < Math.abs(best - prev) ? y : best
      );
    });
  }, [availableYears]);

  const filtered = useMemo(() => {
    if (mode === "single" && singleYear != null) {
      return aggregatedByYear.filter((d) => d.year === singleYear);
    }
    if (!range) return aggregatedByYear;
    return aggregatedByYear.filter(
      (d) => d.year >= range[0] && d.year <= range[1]
    );
  }, [aggregatedByYear, range, mode, singleYear]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, d) => ({
        gold: acc.gold + d.gold,
        silver: acc.silver + d.silver,
        bronze: acc.bronze + d.bronze,
        total: acc.total + d.total,
      }),
      { gold: 0, silver: 0, bronze: 0, total: 0 }
    );
  }, [filtered]);

  const allTimeTotals = useMemo(() => {
    return aggregatedByYear.reduce(
      (acc, d) => ({
        gold: acc.gold + d.gold,
        silver: acc.silver + d.silver,
        bronze: acc.bronze + d.bronze,
        total: acc.total + d.total,
      }),
      { gold: 0, silver: 0, bronze: 0, total: 0 }
    );
  }, [aggregatedByYear]);

  const pieData = [
    { name: "Gold", value: totals.gold, color: MEDAL_COLORS.gold },
    { name: "Silver", value: totals.silver, color: MEDAL_COLORS.silver },
    { name: "Bronze", value: totals.bronze, color: MEDAL_COLORS.bronze },
  ];

  const heroGradient =
    variant === "olympics" ? "bg-gradient-olympics" : "bg-gradient-paralympics";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`${heroGradient} text-primary-foreground shadow-elegant`}>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-end gap-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                Team USA
              </p>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 animate-fade-in-up">
            <h1 className="font-display text-4xl sm:text-6xl tracking-wide">
              {title}
            </h1>
            <p className="mt-2 text-base sm:text-lg opacity-90 max-w-2xl">
              {subtitle}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 animate-fade-in-up">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading medal data…</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {/* Stat cards */}
            <section
              aria-label="Medal totals"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatCard
                label="Gold"
                value={allTimeTotals.gold}
                color="hsl(var(--gold))"
                icon={<Medal className="h-5 w-5" />}
              />
              <StatCard
                label="Silver"
                value={allTimeTotals.silver}
                color="hsl(var(--silver))"
                icon={<Medal className="h-5 w-5" />}
              />
              <StatCard
                label="Bronze"
                value={allTimeTotals.bronze}
                color="hsl(var(--bronze))"
                icon={<Medal className="h-5 w-5" />}
              />
              <StatCard
                label="Total Medals"
                value={allTimeTotals.total}
                color="hsl(142 72% 60%)"
                icon={<Trophy className="h-5 w-5" />}
              />
            </section>

            {/* Season filter */}
            <section className="dashboard-card rounded-2xl border p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-foreground">Season</h2>
                  <p className="text-sm text-muted-foreground">
                    Filter by Summer, Winter, or both Games
                  </p>
                </div>
                <div className="inline-flex rounded-lg border border-white/20 bg-white/10 p-1">
                  {(["both", "summer", "winter"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeason(s)}
                      aria-pressed={season === s}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                        season === s
                          ? "bg-white text-primary shadow-sm"
                          : "text-white/60 bg-white/10 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Year filter */}
            {range && (
              <section className="dashboard-card rounded-2xl border p-6 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {mode === "range" ? "Year Range" : "Specific Year"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {mode === "range"
                        ? "Filter the dashboard by Olympic year range"
                        : "View data for a single Olympic year"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={mode}
                      onValueChange={(v) => setMode(v as FilterMode)}
                    >
                      <SelectTrigger className="w-[150px] bg-white text-primary border-white/30" aria-label="Filter mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="range">Year Range</SelectItem>
                        <SelectItem value="single">Specific Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="font-display text-2xl text-gold tracking-wider">
                      {mode === "range"
                        ? `${range[0]} — ${range[1]}`
                        : singleYear}
                    </div>
                  </div>
                </div>

                {mode === "range" ? (
                  <>
                    <Slider
                      value={range}
                      min={minYear}
                      max={maxYear}
                      step={1}
                      onValueChange={(v) =>
                        setRange([v[0], v[1]] as [number, number])
                      }
                      className="mt-2 [&_[role=slider]]:border-gold [&_[role=slider]]:bg-gold [&>span:first-child]:bg-white/20 [&>span:first-child>span]:bg-gold"
                      aria-label="Year range"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{minYear}</span>
                      <span>{maxYear}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aggregatedByYear.map((d) => (
                      <button
                        key={d.year}
                        type="button"
                        onClick={() => setSingleYear(d.year)}
                        aria-pressed={singleYear === d.year}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                          singleYear === d.year
                            ? "bg-gold text-primary border-gold"
                            : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                        }`}
                      >
                        {d.year}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Medal Distribution"
                description="Share of Gold, Silver, and Bronze"
                icon={<Medal className="h-4 w-4" />}
              >
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={3}
                      stroke="hsl(var(--card))"
                      strokeWidth={3}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: "0.875rem" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Medals per Year"
                description="Stacked totals by medal type"
                icon={<Trophy className="h-4 w-4" />}
              >
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={filtered}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="year"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
                    <Bar dataKey="gold" stackId="m" fill={MEDAL_COLORS.gold} name="Gold" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="silver" stackId="m" fill={MEDAL_COLORS.silver} name="Silver" />
                    <Bar dataKey="bronze" stackId="m" fill={MEDAL_COLORS.bronze} name="Bronze" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {mode === "range" && (
                <ChartCard
                  title="Total Medals Trend"
                  description="Performance trajectory over time"
                  icon={<TrendingUp className="h-4 w-4" />}
                  className="lg:col-span-2"
                >
                  <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={filtered}>
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(var(--usa-white))" />
                          <stop offset="100%" stopColor="hsl(var(--usa-white))" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="url(#lineGrad)"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#ffffff", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                        activeDot={{ r: 7, fill: "#ffffff" }}
                        name="Total Medals"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </section>

            {/* AI Insights */}
            <AskAI
              data={data}
              type={type}
            />
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) => (
  <div className="dashboard-card rounded-2xl border p-5 shadow-card transition-all hover:shadow-elegant hover:-translate-y-0.5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </span>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="font-display text-4xl tracking-wider" style={{ color }}>
      {value.toLocaleString()}
    </div>
  </div>
);

const ChartCard = ({
  title,
  description,
  icon,
  children,
  className = "",
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`dashboard-card rounded-2xl border p-6 shadow-card transition-all hover:shadow-elegant ${className}`}
  >
    <div className="flex items-start gap-3 mb-5">
      <div className="rounded-lg bg-accent text-accent-foreground p-2">
        {icon}
      </div>
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

export default MedalDashboard;
