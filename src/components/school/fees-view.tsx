"use client";

import { useMemo, useState } from "react";
import {
  BanknoteArrowUp,
  CircleAlert,
  Printer,
  Search,
  Trash2,
  Wallet,
  HandCoins,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSchoolStore } from "@/lib/store";
import { currentMonth, formatMonth, formatRs, todayISO } from "@/lib/helpers";
import type { FeeChallan } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const statusVariant = (s: string) =>
  s === "Paid" ? "default" : s === "Overdue" ? "destructive" : "secondary";

export default function FeesView() {
  const challans = useSchoolStore((s) => s.challans);
  const students = useSchoolStore((s) => s.students);
  const classes = useSchoolStore((s) => s.classes);
  const markChallanPaid = useSchoolStore((s) => s.markChallanPaid);
  const deleteChallan = useSchoolStore((s) => s.deleteChallan);
  const generateMonthlyChallans = useSchoolStore((s) => s.generateMonthlyChallans);
  const profile = useSchoolStore((s) => s.profile);
  const { toast } = useToast();

  const [month, setMonth] = useState(currentMonth());
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [printing, setPrinting] = useState<FeeChallan | null>(null);
  const [deleting, setDeleting] = useState<FeeChallan | null>(null);
  const [genMonth, setGenMonth] = useState(currentMonth());

  const studentMap = useMemo(() => Object.fromEntries(students.map((s) => [s.id, s])), [students]);
  const classMap = useMemo(() => Object.fromEntries(classes.map((c) => [c.id, c])), [classes]);

  const monthChallans = useMemo(
    () => challans.filter((c) => c.month === month),
    [challans, month]
  );

  const stats = useMemo(() => {
    const paid = monthChallans.filter((c) => c.status === "Paid");
    const pending = monthChallans.filter((c) => c.status === "Pending");
    const overdue = monthChallans.filter((c) => c.status === "Overdue");
    return {
      collected: paid.reduce((a, c) => a + c.total, 0),
      pending: pending.reduce((a, c) => a + c.total, 0),
      overdue: overdue.reduce((a, c) => a + c.total, 0),
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      total: monthChallans.length,
    };
  }, [monthChallans]);

  const filtered = useMemo(() => {
    return monthChallans
      .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
      .filter((c) => {
        const s = studentMap[c.studentId];
        const q = query.trim().toLowerCase();
        if (!q) return true;
        if (!s) return false;
        return (
          s.name.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          c.challanNo.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.challanNo.localeCompare(b.challanNo));
  }, [monthChallans, statusFilter, query, studentMap]);

  const handleGenerate = () => {
    const count = generateMonthlyChallans(genMonth);
    if (count === 0) {
      toast({
        title: "Nothing to generate",
        description: `All active students already have a challan for ${formatMonth(genMonth)}.`,
      });
    } else {
      toast({
        title: "Challans generated",
        description: `${count} challan(s) created for ${formatMonth(genMonth)}.`,
      });
    }
  };

  const printChallan = printing ? studentMap[printing.studentId] : null;

  return (
    <div className="space-y-4">
      {/* Month switcher + actions */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-end">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fee-month">Fee Month</Label>
              <Input id="fee-month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gen-month">Generate Challans For</Label>
              <div className="flex gap-2">
                <Input id="gen-month" type="month" value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="flex-1" />
                <Button variant="outline" onClick={handleGenerate} className="whitespace-nowrap">
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="py-4">
          <CardContent className="flex items-center justify-between px-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Collected — {formatMonth(month)}</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-emerald-600">{formatRs(stats.collected)}</p>
              <p className="text-[11px] text-muted-foreground">{stats.paidCount} of {stats.total} challans paid</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <BanknoteArrowUp className="h-5 w-5" aria-hidden />
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center justify-between px-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-amber-600">{formatRs(stats.pending)}</p>
              <p className="text-[11px] text-muted-foreground">{stats.pendingCount} challans awaiting payment</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Wallet className="h-5 w-5" aria-hidden />
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center justify-between px-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Overdue</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-red-500">{formatRs(stats.overdue)}</p>
              <p className="text-[11px] text-muted-foreground">{stats.overdueCount} challans past due date</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <HandCoins className="h-5 w-5" aria-hidden />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student, admission no or challan no…"
            className="pl-9"
            aria-label="Search challans"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Challan table */}
      <Card>
        <CardContent className="px-0">
          <div className="custom-scrollbar max-h-[52vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="pl-5">Challan No</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead>Tuition</TableHead>
                  <TableHead className="hidden sm:table-cell">Others</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                      No challans found for this month / filter.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((c) => {
                  const s = studentMap[c.studentId];
                  return (
                    <TableRow key={c.id} className="hover:bg-accent/40">
                      <TableCell className="pl-5 font-mono text-xs">{c.challanNo}</TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{s?.name ?? "Deleted student"}</p>
                        <p className="text-[11px] text-muted-foreground">{s?.admissionNo}</p>
                      </TableCell>
                      <TableCell className="hidden text-xs md:table-cell">
                        {s ? `${classMap[s.classId]?.name ?? "—"} ${s.section}` : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums text-xs">{formatRs(c.tuitionFee)}</TableCell>
                      <TableCell className="hidden tabular-nums text-xs sm:table-cell">
                        {c.otherCharges - c.discount === 0 ? "—" : formatRs(c.otherCharges - c.discount)}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">{formatRs(c.total)}</TableCell>
                      <TableCell className="hidden text-xs lg:table-cell">{c.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(c.status) as "default" | "secondary" | "destructive"}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <div className="flex justify-end gap-1">
                          {c.status !== "Paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-emerald-500/40 px-2 text-xs text-emerald-600 hover:bg-emerald-500/10"
                              onClick={() => {
                                markChallanPaid(c.id);
                                toast({
                                  title: "Payment recorded",
                                  description: `${formatRs(c.total)} received against ${c.challanNo}.`,
                                });
                              }}
                            >
                              Receive
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPrinting(c)} aria-label="Print challan">
                            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleting(c)} aria-label="Delete challan">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="border-t px-5 py-3 text-xs text-muted-foreground">
            {filtered.length} challan(s) shown for {formatMonth(month)}
          </div>
        </CardContent>
      </Card>

      {/* Print / preview dialog */}
      <Dialog open={!!printing} onOpenChange={(o) => !o && setPrinting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fee Challan — Preview</DialogTitle>
            <DialogDescription>Printable bank challan slip.</DialogDescription>
          </DialogHeader>
          {printing && printChallan && (
            <div className="rounded-lg border p-4 text-sm">
              <div className="text-center">
                <p className="text-base font-bold">{profile.name}</p>
                <p className="text-[11px] text-muted-foreground">{profile.address}</p>
                <p className="mt-1 inline-block rounded bg-muted px-3 py-0.5 text-xs font-semibold tracking-wide">
                  FEE CHALLAN — {formatMonth(printing.month)}
                </p>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <p className="text-muted-foreground">Challan No</p>
                <p className="font-mono font-medium">{printing.challanNo}</p>
                <p className="text-muted-foreground">Student</p>
                <p className="font-medium">{printChallan.name}</p>
                <p className="text-muted-foreground">Admission No</p>
                <p className="font-mono">{printChallan.admissionNo}</p>
                <p className="text-muted-foreground">Class / Section</p>
                <p className="font-medium">
                  {classMap[printChallan.classId]?.name ?? "—"} — {printChallan.section}
                </p>
                <p className="text-muted-foreground">Father Name</p>
                <p className="font-medium">{printChallan.fatherName}</p>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <p className="text-muted-foreground">Tuition Fee</p>
                <p className="text-right tabular-nums">{formatRs(printing.tuitionFee)}</p>
                <p className="text-muted-foreground">Other Charges</p>
                <p className="text-right tabular-nums">{formatRs(printing.otherCharges)}</p>
                <p className="text-muted-foreground">Concession / Discount</p>
                <p className="text-right tabular-nums">- {formatRs(printing.discount)}</p>
                <p className="font-semibold">Total Payable</p>
                <p className="text-right font-bold tabular-nums">{formatRs(printing.total)}</p>
                <p className="text-muted-foreground">Due Date</p>
                <p className="text-right">{printing.dueDate}</p>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between text-xs">
                <Badge variant={statusVariant(printing.status) as "default" | "secondary" | "destructive"}>
                  {printing.status}
                  {printing.paidDate ? ` on ${printing.paidDate}` : ""}
                </Badge>
                <p className="text-muted-foreground">Account #: 0123-4567891-01 (HBL)</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>Print Slip</Button>
            <Button onClick={() => setPrinting(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete challan?</AlertDialogTitle>
            <AlertDialogDescription>
              Challan {deleting?.challanNo} ({deleting ? formatRs(deleting.total) : ""}) will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) {
                  deleteChallan(deleting.id);
                  toast({ title: "Challan deleted", description: `${deleting.challanNo} was removed.` });
                }
                setDeleting(null);
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Overdue banner */}
      {stats.overdueCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600">
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
          {stats.overdueCount} overdue challan(s) totaling {formatRs(stats.overdue)} — follow up with parents.
        </div>
      )}
    </div>
  );
}
