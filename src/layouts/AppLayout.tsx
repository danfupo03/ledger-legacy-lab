import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Wallet, PieChart, ListChecks, TrendingUp, PiggyBank, CalendarClock, Landmark, Settings as SettingsIcon, Banknote, BarChart3 } from "lucide-react";
import { FinanceProvider } from "@/context/FinanceContext";

const nav = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/accounts", label: "Accounts", icon: Landmark },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/incomes", label: "Incomes", icon: Banknote },
  { to: "/categories", label: "Categories", icon: PieChart },
  { to: "/budgets", label: "Budgets", icon: CalendarClock },
  { to: "/savings", label: "Saving Goals", icon: PiggyBank },
  { to: "/debts", label: "Debts", icon: ListChecks },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function SidebarLink({ to, label, icon: Icon }: { to: string; label: string; icon: any }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition-smooth ${isActive ? "bg-sidebar-accent text-sidebar-foreground" : "hover:bg-sidebar-accent/60"}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <FinanceProvider>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:flex flex-col gap-2 border-r bg-sidebar text-sidebar-foreground p-4">
          <div className="mb-2 px-2 py-3 rounded-md bg-gradient-primary text-sidebar-primary-foreground shadow-glow">
            <div className="text-sm opacity-80">Personal</div>
            <div className="text-lg font-semibold">Finance</div>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <SidebarLink key={n.to} {...n} />
            ))}
          </nav>
        </aside>

        <main className="relative">
          <div className="pointer-events-none absolute inset-0 opacity-20 bg-gradient-primary" />
          <header className="sticky top-0 z-10 backdrop-blur border-b bg-background/60">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="font-semibold">Your Money, Organized</div>
            </div>
          </header>
          <div className="relative z-0 p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </FinanceProvider>
  );
}
