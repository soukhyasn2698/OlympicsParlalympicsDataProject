import { Link } from "react-router-dom";
import { ArrowRight, Accessibility, Trophy } from "lucide-react";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-hero opacity-[0.08]"
      />
      <div
        aria-hidden
        className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-usa-red/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-usa-blue/10 blur-3xl"
      />

      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow-card mb-8">
            <span className="h-2 w-2 rounded-full bg-usa-red animate-pulse" />
            Team USA Analytics
          </div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wide leading-[1.05] text-foreground">
            Welcome to{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Team USA Athletes
            </span>{" "}
            Website
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Dive into decades of medal-winning history. Explore interactive
            charts and trends from the Olympic and Paralympic Games.
          </p>
        </div>

        <section
          aria-label="Choose a dataset"
          className="mt-14 grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in"
        >
          <DatasetCard
            to="/olympics/dashboard"
            title="Olympics Data"
            description="Explore Olympic medal trends across decades of summer games."
            icon={<Trophy className="h-7 w-7" />}
            gradient="bg-gradient-olympics"
            accentLabel="Summer Games · 1984 — 2024"
          />
          <DatasetCard
            to="/paralympics/dashboard"
            title="Paralympics Data"
            description="Discover Paralympic performance and historic milestones."
            icon={<Accessibility className="h-7 w-7" />}
            gradient="bg-gradient-paralympics"
            accentLabel="Paralympic Games · 1984 — 2024"
          />
        </section>

        <p className="mt-16 text-xs text-muted-foreground tracking-wider uppercase">
          Stars · Stripes · Stories of Glory
        </p>
      </main>
    </div>
  );
};

const DatasetCard = ({
  to,
  title,
  description,
  icon,
  gradient,
  accentLabel,
}: {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  accentLabel: string;
}) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-3xl border bg-card p-8 shadow-card transition-all duration-500 hover:shadow-elegant hover:-translate-y-1"
  >
    {/* Gradient halo on hover */}
    <div
      aria-hidden
      className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
    />
    {/* Content */}
    <div className="relative z-10 flex flex-col h-full text-foreground group-hover:text-primary-foreground transition-colors duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className={`rounded-2xl p-4 ${gradient} text-primary-foreground shadow-elegant`}>
          {icon}
        </div>
        <ArrowRight className="h-6 w-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>

      <p className="text-xs uppercase tracking-[0.2em] font-semibold opacity-70 mb-2">
        {accentLabel}
      </p>
      <h2 className="font-display text-4xl sm:text-5xl tracking-wide mb-3">
        {title}
      </h2>
      <p className="text-base opacity-80 leading-relaxed">{description}</p>

      <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
        View dashboard
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  </Link>
);

export default Index;
