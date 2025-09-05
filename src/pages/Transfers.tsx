import { useEffect, useState } from "react";
import { useFinance, Transfer, Account } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ArrowRight, Calendar, DollarSign, Info } from "lucide-react";

export default function Transfers() {
  const {
    transfers,
    accounts,
    addTransfer,
    updateTransfer,
    deleteTransfer,
    getAccountBalance,
    convertToBase,
    settings,
  } = useFinance();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Transfer, "id">>({
    name: "",
    amount: 0,
    fromAccountId: accounts[0]?.id || "",
    toAccountId: accounts[1]?.id || "",
    date: new Date().toISOString(),
    note: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Transfer, "id">>({
    name: "",
    amount: 0,
    fromAccountId: "",
    toAccountId: "",
    date: new Date().toISOString(),
    note: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    fromAccount: "all",
    toAccount: "all",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    document.title = "Transfers — Personal Finance";
  }, []);

  const filteredTransfers = transfers.filter((t) => {
    if (
      filters.search &&
      !t.name.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (
      filters.fromAccount !== "all" &&
      t.fromAccountId !== filters.fromAccount
    )
      return false;
    if (filters.toAccount !== "all" && t.toAccountId !== filters.toAccount)
      return false;
    if (filters.dateFrom && new Date(t.date) < new Date(filters.dateFrom))
      return false;
    if (filters.dateTo && new Date(t.date) > new Date(filters.dateTo))
      return false;
    return true;
  });

  const handleAddTransfer = () => {
    if (
      !form.name ||
      form.amount <= 0 ||
      form.fromAccountId === form.toAccountId
    ) {
      alert(
        "Please fill all fields correctly. Amount must be positive and accounts must be different."
      );
      return;
    }

    const fromAccount = accounts.find((a) => a.id === form.fromAccountId);
    const fromBalance = getAccountBalance(form.fromAccountId);

    if (fromAccount && fromBalance < form.amount) {
      if (
        !confirm(
          `Warning: This transfer will result in a negative balance in ${fromAccount.name}. Continue?`
        )
      ) {
        return;
      }
    }

    addTransfer(form);
    setOpen(false);
    setForm({
      name: "",
      amount: 0,
      fromAccountId: accounts[0]?.id || "",
      toAccountId: accounts[1]?.id || "",
      date: new Date().toISOString(),
      note: "",
    });
  };

  const handleEditTransfer = () => {
    if (!editingId) return;
    if (
      !editForm.name ||
      editForm.amount <= 0 ||
      editForm.fromAccountId === editForm.toAccountId
    ) {
      alert("Please fill all fields correctly.");
      return;
    }

    updateTransfer(editingId, editForm);
    setEditOpen(false);
    setEditingId(null);
  };

  const getAccountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name || "Unknown";
  const getAccountCurrency = (id: string) =>
    accounts.find((a) => a.id === id)?.currency || settings.baseCurrency;

  const calculateConvertedAmount = (
    amount: number,
    fromAccountId: string,
    toAccountId: string
  ) => {
    const fromCurrency = getAccountCurrency(fromAccountId);
    const toCurrency = getAccountCurrency(toAccountId);

    if (fromCurrency === toCurrency) return amount;

    const amountInBase = convertToBase(amount, fromCurrency);
    return amountInBase / (settings.exchangeRates[toCurrency] || 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transfers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Transfer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Transfer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-name">Description</Label>
                <Input
                  id="transfer-name"
                  placeholder="e.g., Monthly savings transfer"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-account">From Account</Label>
                <Select
                  value={form.fromAccountId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, fromAccountId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter((a) => a.id !== form.toAccountId)
                      .map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.currency}) - Balance:{" "}
                          {getAccountBalance(acc.id).toFixed(2)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-account">To Account</Label>
                <Select
                  value={form.toAccountId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, toAccountId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter((a) => a.id !== form.fromAccountId)
                      .map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.currency})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount ({getAccountCurrency(form.fromAccountId)})
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                {form.fromAccountId &&
                  form.toAccountId &&
                  getAccountCurrency(form.fromAccountId) !==
                    getAccountCurrency(form.toAccountId) && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Will receive:{" "}
                      {calculateConvertedAmount(
                        form.amount,
                        form.fromAccountId,
                        form.toAccountId
                      ).toFixed(2)}{" "}
                      {getAccountCurrency(form.toAccountId)}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date.slice(0, 10)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      date: new Date(e.target.value).toISOString(),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Additional details..."
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              <Button onClick={handleAddTransfer} className="w-full">
                Create Transfer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
            />
            <Select
              value={filters.fromAccount}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, fromAccount: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="From Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.toAccount}
              onValueChange={(v) => setFilters((f) => ({ ...f, toAccount: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="To Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateFrom: e.target.value }))
              }
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateTo: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Transfers List */}
      <div className="grid gap-3">
        {filteredTransfers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No transfers found. Create your first transfer to track money
              movements between accounts.
            </CardContent>
          </Card>
        ) : (
          filteredTransfers.map((transfer) => {
            const fromAccount = accounts.find(
              (a) => a.id === transfer.fromAccountId
            );
            const toAccount = accounts.find(
              (a) => a.id === transfer.toAccountId
            );
            const convertedAmount = calculateConvertedAmount(
              transfer.amount,
              transfer.fromAccountId,
              transfer.toAccountId
            );

            return (
              <Card key={transfer.id} className="shadow-elegant">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col">
                      <span className="font-semibold">{transfer.name}</span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(transfer.date), "MMM dd, yyyy")}
                      </span>
                      {transfer.note && (
                        <span className="text-sm text-muted-foreground mt-1">
                          {transfer.note}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">
                        {fromAccount?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-red-600">
                        -{transfer.amount.toFixed(2)} {fromAccount?.currency}
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    <div className="text-right">
                      <div className="font-medium">
                        {toAccount?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-green-600">
                        +{convertedAmount.toFixed(2)} {toAccount?.currency}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(transfer.id);
                          setEditForm({
                            name: transfer.name,
                            amount: transfer.amount,
                            fromAccountId: transfer.fromAccountId,
                            toAccountId: transfer.toAccountId,
                            date: transfer.date,
                            note: transfer.note || "",
                          });
                          setEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this transfer?"
                            )
                          ) {
                            deleteTransfer(transfer.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transfer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Amount ({getAccountCurrency(editForm.fromAccountId)})
              </Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={editForm.date.slice(0, 10)}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    date: new Date(e.target.value).toISOString(),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={editForm.note}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, note: e.target.value }))
                }
                rows={2}
              />
            </div>

            <Button onClick={handleEditTransfer} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
