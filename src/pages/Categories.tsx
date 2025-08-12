import { useEffect, useState } from "react";
import { useFinance, Category } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Categories() {
  const { categories, addCategory } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Category, "id">>({ name: "", type: "expense" });

  useEffect(() => { document.title = "Categories — Personal Finance"; }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Select value={form.type} onValueChange={(v: Category["type"]) => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => { addCategory(form); setOpen(false); setForm({ name: "", type: "expense" }); }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Categories</CardTitle></CardHeader>
        <CardContent>
          <ul className="grid gap-2">
            {categories.map(c => (
              <li key={c.id} className="p-3 rounded-md border flex items-center justify-between">
                <span>{c.name}</span>
                <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">{c.type}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
