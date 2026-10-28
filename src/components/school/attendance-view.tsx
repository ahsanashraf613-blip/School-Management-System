"use client";

import { useState } from "react";
import { CalendarCheck, CheckCheck, ClipboardList, Save, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSchoolStore } from "@/lib/store";
import { avatarColor, initials, todayISO } from "@/lib/helpers";
import type { AttendanceRecord, AttendanceStatus, Student } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS: Array<{ value: AttendanceStatus; label: string; short: string }> = [
  { value: "present", label: "Present", short: "P" },
  { value: "absent", label: "Absent", short: "A" },
  { value: "late", label: "Late", short: "L" },
  { value: "leave", label: "Leave", short: "Lv" },
];

const statusStyle: Record<AttendanceStatus, string> = {
  present: "bg-emerald-600 text-white",
  absent: "bg-red-500 text-white",
  late: "bg-amber-500 text-white",
  leave: "bg-slate-400 text-white",
};

// ── Child: marking panel (remounts on class/section/date change via key) ────
function AttendanceMarker({
  className,
  section,
  date,
  students,
  initialMarks,
  onSave,
}: {
  className: string;
  section: string;
  date: string;
  students: Student[];
  initialMarks: Record<string, AttendanceStatus>;
  onSave: (records: AttendanceRecord[]) => void;
}) {
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(initialMarks);
  const { toast } = useToast();

  const setStatus = (studentId: string, status: AttendanceStatus) =>
    setMarks((m) => ({ ...m, [studentId]: status }));

  const markAllPresent = () => {
    const m: Record<string, AttendanceStatus> = {};
    students.forEach((s) => (m[s.id] = "present"));
    setMarks(m);
  };

  const handleSave = () => {
    if (students.length === 0) {
      toast({ title: "No students", description: "This class has no active students to mark.", variant: "destructive" });
      return;
    }
    const records = students.map((s) => ({
      studentId: s.id,
      classId: className,
      date,
      status: marks[s.id] ?? ("present" as AttendanceStatus),
    }));
    onSave(records);
    toast({
      title: "Attendance saved",
      description: `${records.length} students marked for ${date}.`,
    });
  };

  const marked = Object.keys(marks).length;
  const presentCount = Object.values(marks).filter((v) => v === "present").length;

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-end">
          <div className="flex-1 text-sm text-muted-foreground">
            Marking attendance for <span className="font-semibold text-foreground">{className}</span> — Section{" "}
            {section} on <span className="font-semibold text-foreground">{date}</span>. Existing marks are loaded
            automatically.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllPresent} className="gap-1.5">
              <CheckCheck className="h-4 w-4" /> All Present
            </Button>
            <Button onClick={handleSave} className="gap-1.5">
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between px-5 pb-2">
          <CardTitle className="text-base">Student List</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">{presentCount} present</Badge>
            <Badge variant="outline">{marked}/{students.length} marked</Badge>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {students.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No active students in this class/section.
            </p>
          ) : (
            <div className="custom-scrollbar max-h-[54vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="pl-5">Roll</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="pr-5 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => {
                    const current = marks[s.id] ?? "present";
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="pl-5 tabular-nums text-muted-foreground">{s.rollNo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`text-[10px] font-bold text-white ${avatarColor(s.name)}`}>
                                {initials(s.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{s.name}</p>
                              <p className="text-[11px] text-muted-foreground">S/o, D/o {s.fatherName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="pr-5">
                          <div className="flex justify-end gap-1" role="group" aria-label={`Attendance status for ${s.name}`}>
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setStatus(s.id, opt.value)}
                                title={opt.label}
                                className={`h-8 w-9 rounded-md text-xs font-bold transition-all ${
                                  current === opt.value
                                    ? statusStyle[opt.value]
                                    : "bg-muted text-muted-foreground hover:bg-accent"
                                }`}
                              >
                                {opt.short}
                              </button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function AttendanceView() {
  const students = useSchoolStore((s) => s.students);
  const classes = useSchoolStore((s) => s.classes);
  const attendance = useSchoolStore((s) => s.attendance);
  const saveAttendance = useSchoolStore((s) => s.saveAttendance);

  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [section, setSection] = useState(classes[0]?.sections[0] ?? "A");
  const [date, setDate] = useState(todayISO());

  const classObj = classes.find((c) => c.id === classId);
  const sections = classObj?.sections ?? ["A"];
  const activeSection = sections.includes(section) ? section : sections[0];

  const classStudents = students
    .filter((s) => s.classId === classId && s.section === activeSection && s.status === "Active")
    .sort((a, b) => a.rollNo - b.rollNo);

  const initialMarks: Record<string, AttendanceStatus> = {};
  const classStudentIds = new Set(classStudents.map((s) => s.id));
  attendance
    .filter((a) => a.date === date && a.classId === classId && classStudentIds.has(a.studentId))
    .forEach((a) => {
      initialMarks[a.studentId] = a.status;
    });

  // ── Monthly summary ──
  const [summaryMonth, setSummaryMonth] = useState(todayISO().slice(0, 7));
  const summaryRecs = attendance.filter((a) => a.classId === classId && a.date.startsWith(summaryMonth));
  const summary = classStudents.map((s) => {
    const mine = summaryRecs.filter((r) => r.studentId === s.id);
    const present = mine.filter((r) => r.status === "present" || r.status === "late").length;
    const pct = mine.length ? Math.round((present / mine.length) * 100) : 0;
    return {
      student: s,
      present,
      absent: mine.filter((r) => r.status === "absent").length,
      late: mine.filter((r) => r.status === "late").length,
      leave: mine.filter((r) => r.status === "leave").length,
      total: mine.length,
      pct,
    };
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="mark">
        <TabsList className="h-auto w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="mark" className="gap-1.5">
            <CalendarCheck className="h-4 w-4" /> Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1.5">
            <ClipboardList className="h-4 w-4" /> Monthly Summary
          </TabsTrigger>
        </TabsList>

        {/* ── Mark attendance tab ── */}
        <TabsContent value="mark" className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 px-5 py-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger aria-label="Class"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select value={activeSection} onValueChange={setSection}>
                  <SelectTrigger aria-label="Section"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sections.map((sec) => (
                      <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="att-date">Date</Label>
                <Input id="att-date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <AttendanceMarker
            key={`${classId}|${activeSection}|${date}`}
            className={classObj?.name ?? "Class"}
            section={activeSection}
            date={date}
            students={classStudents}
            initialMarks={initialMarks}
            onSave={saveAttendance}
          />
        </TabsContent>

        {/* ── Monthly summary tab ── */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 px-5 py-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger aria-label="Class"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sum-month">Month</Label>
                <Input
                  id="sum-month"
                  type="month"
                  value={summaryMonth}
                  max={todayISO().slice(0, 7)}
                  onChange={(e) => setSummaryMonth(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-5 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="h-4 w-4 text-primary" aria-hidden />
                Attendance % — {classObj?.name ?? "Class"} ({summaryMonth})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {summary.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No students found.</p>
              ) : (
                <div className="custom-scrollbar max-h-[54vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="pl-5">Student</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="hidden text-center sm:table-cell">Late</TableHead>
                        <TableHead className="hidden text-center sm:table-cell">Leave</TableHead>
                        <TableHead className="w-[180px] pr-5">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.map((row) => (
                        <TableRow key={row.student.id}>
                          <TableCell className="pl-5">
                            <p className="text-sm font-medium">{row.student.name}</p>
                            <p className="text-[11px] text-muted-foreground">Roll {row.student.rollNo} · {row.total} days recorded</p>
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-emerald-600">{row.present}</TableCell>
                          <TableCell className="text-center tabular-nums text-red-500">{row.absent}</TableCell>
                          <TableCell className="hidden text-center tabular-nums text-amber-600 sm:table-cell">{row.late}</TableCell>
                          <TableCell className="hidden text-center tabular-nums text-slate-500 sm:table-cell">{row.leave}</TableCell>
                          <TableCell className="pr-5">
                            <div className="flex items-center gap-2">
                              <Progress value={row.pct} className="h-2 flex-1" />
                              <span className="w-10 text-right text-xs font-semibold tabular-nums">{row.pct}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
