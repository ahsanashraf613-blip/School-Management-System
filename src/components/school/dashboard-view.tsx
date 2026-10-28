"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  BookOpenCheck,
  ClipboardCheck,
  Megaphone,
  TrendingUp,
  Users,
  UsersRound,
  Wallet,
  HandCoins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSchoolStore } from "@/lib/store";
import { avatarColor, currentMonth, formatRs, initials, todayISO } from "@/lib/helpers";
import type { ViewKey } from "@/lib/types";

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <Card className="py-5">
      <CardContent className="flex items-start justify-between px-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-emerald-600" aria-hidden />
            {sub}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const students = useSchoolStore((s) => s.students);
  const teachers = useSchoolStore((s) => s.teachers);
  const classes = useSchoolStore((s) => s.classes);
  const attendance = useSchoolStore((s) => s.attendance);
  const challans = useSchoolStore((s) => s.challans);
  const notices = useSchoolStore((s) => s.notices);

  const month = currentMonth();
  const today = todayISO();

  const stats = useMemo(() => {
    const active = students.filter((s) => s.status === "Active");
    const monthChallans = challans.filter((c) => c.month === month);
    const collected = monthChallans.filter((c) => c.status === "Paid").reduce((a, c) => a + c.total, 0);
    const outstanding = monthChallans.filter((c) => c.status !== "Paid").reduce((a, c) => a + c.total, 0);
    const todayRec = attendance.filter((a) => a.date === today);
    const presentToday = todayRec.filter((a) => a.status === "present" || a.status === "late").length;
    const attPct = todayRec.length ? Math.round((presentToday / todayRec.length) * 100) : 0;
    return {
      totalStudents: active.length,
      totalTeachers: teachers.filter((t) => t.status === "Active").length,
      collected,
      outstanding,
      attPct,
      presentToday,
      markedToday: todayRec.length,
    };
  }, [students, teachers, challans, attendance, month, today]);

  // Attendance trend for last 7 recorded days
  const attTrend = useMemo(() => {
    const dates = Array.from(new Set(attendance.map((a) => a.date))).sort().slice(-7);
    return dates.map((date) => {
      const rec = attendance.filter((a) => a.date === date);
      const present = rec.filter((a) => a.status === "present" || a.status === "late").length;
      return {
        date: new Date(date + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        rate: rec.length ? Math.round((present / rec.length) * 100) : 0,
      };
    });
  }, [attendance]);

  // Fee collection per month
  const feeTrend = useMemo(() => {
    const months = Array.from(new Set(challans.map((c) => c.month))).sort();
    return months.map((m) => {
      const rec = challans.filter((c) => c.month === m);
      return {
        month: new Date(m + "-01T00:00:00").toLocaleDateString("en-GB", { month: "short" }),
        collected: rec.filter((c) => c.status === "Paid").reduce((a, c) => a + c.total, 0),
        pending: rec.filter((c) => c.status !== "Paid").reduce((a, c) => a + c.total, 0),
      };
    });
  }, [challans]);

  // Class-wise strength
  const classStrength = useMemo(
    () =>
      classes
        .map((c) => ({
          name: c.name,
          students: students.filter((s) => s.classId === c.id && s.status === "Active").length,
        }))
        .sort((a, b) => b.students - a.students),
    [classes, students]
  );
  const maxStrength = Math.max(1, ...classStrength.map((c) => c.students));

  const priorityBadge = (p: string) =>
    p === "Urgent" ? "destructive" : p === "Important" ? "default" : "secondary";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl border bg-gradient-to-r from-primary to-teal-600 p-5 text-primary-foreground shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold sm:text-xl">Assalam-o-Alaikum, Admin!</h2>
            <p className="mt-1 text-sm text-primary-foreground/85">
              Here is what is happening at school today —{" "}
              {stats.markedToday > 0 ? "attendance has been marked" : "attendance not yet marked"}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("attendance")}
              className="gap-1.5 bg-white/15 text-white hover:bg-white/25 hover:text-white"
            >
              <ClipboardCheck className="h-4 w-4" /> Mark Attendance
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("fees")}
              className="gap-1.5 bg-white/15 text-white hover:bg-white/25 hover:text-white"
            >
              <Wallet className="h-4 w-4" /> Collect Fees
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={String(stats.totalStudents)}
          sub={`${students.filter((s) => s.status === "Inactive").length} inactive`}
          icon={Users}
          tone="bg-primary/10 text-primary"
        />
        <StatCard
          title="Teaching Staff"
          value={String(stats.totalTeachers)}
          sub={`${teachers.filter((t) => t.status === "On Leave").length} on leave`}
          icon={UsersRound}
          tone="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          title="Fees Collected (This Month)"
          value={formatRs(stats.collected)}
          sub={`${formatRs(stats.outstanding)} outstanding`}
          icon={Wallet}
          tone="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          title="Attendance Today"
          value={`${stats.attPct}%`}
          sub={`${stats.presentToday} present of ${stats.markedToday} marked`}
          icon={ClipboardCheck}
          tone="bg-cyan-500/10 text-cyan-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance Rate — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Attendance"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #d9e2de", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="rate" stroke="#0d9488" strokeWidth={2.5} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fee Collection by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeTrend} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [formatRs(v), name === "collected" ? "Collected" : "Pending"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #d9e2de", fontSize: 12 }}
                />
                <Bar dataKey="collected" fill="#0d9488" radius={[5, 5, 0, 0]} maxBarSize={38} />
                <Bar dataKey="pending" fill="#f59e0b" radius={[5, 5, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: class strength + notices */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              Class-wise Strength
              <Button variant="ghost" size="sm" onClick={() => onNavigate("classes")} className="gap-1 text-primary">
                Manage <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="custom-scrollbar max-h-80 space-y-3.5 overflow-y-auto pr-2">
            {classStrength.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="tabular-nums text-muted-foreground">{c.students} students</span>
                </div>
                <Progress value={(c.students / maxStrength) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" aria-hidden /> Latest Notices
              </span>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("notices")} className="gap-1 text-primary">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="custom-scrollbar max-h-80 space-y-3 overflow-y-auto">
            {notices.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(n.title)}`}
                >
                  {initials(n.title)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold">{n.title}</p>
                    <Badge
                      variant={priorityBadge(n.priority) as "destructive" | "default" | "secondary"}
                      className="h-5 px-1.5 text-[10px]"
                    >
                      {n.priority}
                    </Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.content}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {new Date(n.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" })} · To: {n.audience}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick alerts */}
      {stats.outstanding > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
            <div className="flex items-center gap-3">
              <HandCoins className="h-5 w-5 text-amber-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold">{formatRs(stats.outstanding)} fee dues this month</p>
                <p className="text-xs text-muted-foreground">
                  {challans.filter((c) => c.month === month && c.status !== "Paid").length} challans are still unpaid.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate("fees")}
              className="border-amber-500/50 text-amber-700 hover:bg-amber-500/10"
            >
              Review Challans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Exam hint */}
      <Card className="border-dashed">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
          <div className="flex items-center gap-3">
            <BookOpenCheck className="h-5 w-5 text-primary" aria-hidden />
            <p className="text-sm">
              <span className="font-semibold">Second Term Examination</span> starts 07 December — syllabus breakdown
              available on the notice board.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onNavigate("exams")} className="text-primary">
            Open Exams
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
