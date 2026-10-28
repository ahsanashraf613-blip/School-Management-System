"use client";

import { useMemo, useState } from "react";
import { BarChart3, Plus, Receipt, Trash2, TrendingDown, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchoolStore } from "@/lib/store";
import { formatDate, formatRs, todayISO } from "@/lib/helpers";
import type { Expense } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Utilities",
  "Stationery",
  "Laboratory",
  "Transport",
  "Library",
  "Maintenance",
  "Sports",
  "Events",
  "Salaries",
  "Other",
];

const CHART_COLORS = ["#0d9488", "#f59e0b", "#0e7490", "#ea580c", "#65a30d", "#c026d3", "#e11d48", "#4d7c0f", "#9333ea", "#64748b"];

const EMPTY: Omit<Expense, "id"> = {
  title: "",
  category: "Utilities",
  amount: 0,
  date: todayISO(),
  paidTo: "",
  paymentMethod: "Cash",
};

export default function ExpensesView() {
  const expenses = useSchoolStore((s) => s.expenses);
  const addExpense = useSchoolStore((s) => s.addExpense);
  const deleteExpense = useSchoolStore((s) => s.deleteExpense);
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Expense, "id">>(EMPTY);

  const filtered = useMemo(
    () =>
      expenses
        .filter((e) => (catFilter === "all" ? true : e.category === catFilter))
        .filter((e) => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          return e.title.toLowerCase().includes(q) || e.paidTo.toLowerCase().includes(q);
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, query, catFilter]
  );

  const stats = useMemo(() => {
    const total = expenses.reduce((a, e) => a + e.amount, 0);
    const thisMonth = expenses
      .filter((e) => e.date.startsWith(todayISO().slice(0, 7)))
      .reduce((a, e) => a + e.amount, 0);
    const byCat = new Map<string, number>();
    expenses.forEach((e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount));
    const top = Array.from(byCat.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
    return { total, thisMonth, top };
  }, [expenses]);

  const handleAdd = () => {
    if (!form.title.trim() || form.amount <= 0) {
      toast({
        title: "Missing fields",
        description: "Title and a positive amount are required.",
        variant: "destructive",
      });
      return;
    }
    addExpense(form);
    toast({ title: "Expense recorded", description: `${form.title} — ${formatRs(form.amount)}.` });
    setForm({ ...EMPTY });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Stats + chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="py-4">
          <CardContent className="flex items-center justify-between px-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{formatRs(stats.total)}</p>
              <p className="text-[11px] text-muted-foreground">{expenses.length} vouchers recorded</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <TrendingDown className="h-5 w-5" aria-hidden />
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center justify-between px-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">This Month</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{formatRs(stats.thisMonth)}</p>
              <p className="text-[11px] text-muted-foreground">{todayISO().slice(0, 7)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Wallet className="h-5 w-5" aria-hidden />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:row-span-2">
          <CardContent className="h-full px-5 py-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" aria-hidden /> Spend by Category
            </p>
            <div className="mt-2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={90}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatRs(v), "Spend"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #d9e2de", fontSize: 12 }}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {stats.top.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="px-0 py-2">
            <div className="flex flex-col gap-3 px-5 py-3 sm:flex-row">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search expense or payee…"
                aria-label="Search expenses"
              />
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setOpen(true)} className="gap-1.5 sm:ml-auto">
                <Plus className="h-4 w-4" /> Add Expense
              </Button>
            </div>
            <div className="custom-scrollbar max-h-[36vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="pl-5">Expense</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Paid To</TableHead>
                    <TableHead className="hidden md:table-cell">Method</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="pr-5 text-right"> </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        <Receipt className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" aria-hidden />
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((e) => (
                    <TableRow key={e.id} className="hover:bg-accent/40">
                      <TableCell className="pl-5 font-medium">{e.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/30 text-primary">{e.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{e.paidTo}</TableCell>
                      <TableCell className="hidden text-xs md:table-cell">{e.paymentMethod}</TableCell>
                      <TableCell className="hidden text-xs md:table-cell">{formatDate(e.date)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-red-500">
                        - {formatRs(e.amount)}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            deleteExpense(e.id);
                            toast({ title: "Expense deleted", description: `${e.title} was removed.` });
                          }}
                          aria-label={`Delete ${e.title}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add expense dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
            <DialogDescription>Add a new school expense voucher.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="x-title">Expense Title *</Label>
              <Input id="x-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Electricity bill" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="x-amount">Amount (Rs) *</Label>
                <Input id="x-amount" type="number" min={0} value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="x-paidto">Paid To</Label>
                <Input id="x-paidto" value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} placeholder="Vendor / person" />
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v as Expense["paymentMethod"] })}>
                  <SelectTrigger aria-label="Payment method"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="x-date">Date</Label>
                <Input id="x-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Record Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
