import { NavLink } from "react-router-dom";
import { LayoutDashboard, Trophy } from "lucide-react";

type Props = {
  variant: "olympics" | "paralympics";
  children: React.ReactNode;
};

const NAV = {
  olympics: [
    { to: "/olympics/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/olympics/sports", label: "Sports", icon: Trophy },
  ],
  paralympics: [
    { to: "/paralympics/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/paralympics/sports", label: "Sports", icon: Trophy },
  ],
};

const GRADIENT = {
  olympics: "bg-gradient-olympics",
  paralympics: "bg-gradient-paralympics",
};

const DashboardLayout = ({ variant, children }: Props) => {
  const links = NAV[variant];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`w-56 shrink-0 ${GRADIENT[variant]} flex flex-col shadow-elegant`}>
        <div className="px-3 pt-3 pb-1">
          <NavLink
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>←</span>
            Back to Home
          </NavLink>
        </div>

        <div className="px-5 py-5 border-b border-white/15">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60 font-semibold">
            Team USA
          </p>
          <p className="text-white font-display text-xl tracking-wide capitalize mt-0.5">
            {variant}
          </p>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default DashboardLayout;
