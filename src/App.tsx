import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { Dashboard, Accounts, Expenses, Incomes, Categories, Budgets, Savings, Debts, Settings } from "./pages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/accounts"
            element={
              <AppLayout>
                <Accounts />
              </AppLayout>
            }
          />
          <Route
            path="/expenses"
            element={
              <AppLayout>
                <Expenses />
              </AppLayout>
            }
          />
          <Route
            path="/incomes"
            element={
              <AppLayout>
                <Incomes />
              </AppLayout>
            }
          />
          <Route
            path="/categories"
            element={
              <AppLayout>
                <Categories />
              </AppLayout>
            }
          />
          <Route
            path="/budgets"
            element={
              <AppLayout>
                <Budgets />
              </AppLayout>
            }
          />
          <Route
            path="/savings"
            element={
              <AppLayout>
                <Savings />
              </AppLayout>
            }
          />
          <Route
            path="/debts"
            element={
              <AppLayout>
                <Debts />
              </AppLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <AppLayout>
                <Settings />
              </AppLayout>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
