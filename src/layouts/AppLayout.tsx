import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Wallet,
  PieChart,
  ListChecks,
  TrendingUp,
  PiggyBank,
  CalendarClock,
  Landmark,
  Settings as SettingsIcon,
  Banknote,
  BarChart3,
} from "lucide-react";
import { FinanceProvider } from "@/context/FinanceContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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

function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-3 rounded-md bg-gradient-primary text-sidebar-primary-foreground shadow-glow">
          <div className="text-sm opacity-80">Personal</div>
          <div className="text-lg font-semibold">Finance</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                  >
                    <NavLink to={item.to}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground">
          Your Money, Organized
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <FinanceProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />

          <main className="flex-1 flex flex-col">
            {/* Header con botón de menú móvil */}
            <header className="sticky top-0 z-10 backdrop-blur border-b bg-background/60">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Botón de menú móvil */}
                  <SidebarTrigger className="md:hidden" />

                  <div className="font-semibold">Your Money, Organized</div>
                </div>
              </div>
            </header>

            {/* Contenido principal */}
            <div className="flex-1 relative">
              <div className="pointer-events-none absolute inset-0 opacity-20 bg-gradient-primary" />
              <div className="relative z-0 p-4 lg:p-8">{children}</div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </FinanceProvider>
  );
}
