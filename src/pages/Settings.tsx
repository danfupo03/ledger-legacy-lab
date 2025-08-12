import { useEffect, useState } from "react";
import { useFinance, Currency } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const currencies: Currency[] = ["USD", "EUR", "GBP", "JPY", "MXN", "ARS", "COP", "CLP", "CHF"];

export default function Settings() {
  const { settings, updateSettings } = useFinance();
  const [base, setBase] = useState<Currency>(settings.baseCurrency);
  const [monthStartDay, setMonthStartDay] = useState(settings.monthStartDay);
  const [rates, setRates] = useState(settings.exchangeRates);

  useEffect(() => { document.title = "Settings — Personal Finance"; }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="grid gap-4 max-w-xl">
          <div>
            <div className="text-sm mb-2">Base Currency</div>
            <Select value={base} onValueChange={(v: Currency) => setBase(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-sm mb-2">Month Start Day</div>
            <Input type="number" min={1} max={31} value={monthStartDay} onChange={e => setMonthStartDay(parseInt(e.target.value || "1"))} />
          </div>
          <div>
            <div className="text-sm mb-2">Exchange Rates (1 {base} equals)</div>
            <div className="grid grid-cols-2 gap-3">
              {currencies.map(c => (
                <div key={c} className="flex items-center gap-2">
                  <div className="w-16 text-sm opacity-70">{c}</div>
                  <Input type="number" step="0.0001" value={rates[c] ?? 1} onChange={e => setRates(r => ({ ...r, [c]: parseFloat(e.target.value) || 0 }))} />
                </div>
              ))}
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 transition-smooth hover:opacity-90"
            onClick={() => updateSettings({ baseCurrency: base, monthStartDay, exchangeRates: { ...rates } })}
          >
            Save Settings
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
