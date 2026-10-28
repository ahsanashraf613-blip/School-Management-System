import type { ExamMark, FeeChallan, Student } from "./types";

export function formatRs(amount: number): string {
  return "Rs " + amount.toLocaleString("en-PK");
}

/** Amount already received against a challan (handles legacy rows without paidAmount). */
export function challanPaid(c: FeeChallan): number {
  return c.paidAmount ?? (c.status === "Paid" ? c.total : 0);
}

/** Remaining balance of a challan. */
export function challanDue(c: FeeChallan): number {
  return Math.max(0, c.total - challanPaid(c));
}

/**
 * Download an array of records as a CSV file (RFC 4180-style escaping).
 * Column headers are taken from the keys of the first record.
 */
export function exportCSV(filename: string, rows: Array<Record<string, string | number>>): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatMonth(month: string): string {
  const [y, m] = month.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getGrade(pct: number): { grade: string; color: string } {
  if (pct >= 80) return { grade: "A+", color: "text-emerald-600" };
  if (pct >= 70) return { grade: "A", color: "text-emerald-600" };
  if (pct >= 60) return { grade: "B", color: "text-teal-600" };
  if (pct >= 50) return { grade: "C", color: "text-amber-600" };
  if (pct >= 40) return { grade: "D", color: "text-orange-600" };
  return { grade: "F", color: "text-red-600" };
}

export function studentTotalMarks(marks: ExamMark[]): { obtained: number; total: number } {
  return marks.reduce(
    (acc, m) => ({ obtained: acc.obtained + m.obtainedMarks, total: acc.total + m.totalMarks }),
    { obtained: 0, total: 0 }
  );
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-emerald-600", "bg-teal-600", "bg-amber-600", "bg-rose-500",
  "bg-cyan-600", "bg-lime-600", "bg-orange-600", "bg-fuchsia-600",
];

export function avatarColor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function studentLabel(s: Student): string {
  return `${s.name} — ${s.admissionNo}`;
}
