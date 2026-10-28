"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, GraduationCap, ListChecks, Plus, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchoolStore } from "@/lib/store";
import { formatDate, getGrade } from "@/lib/helpers";
import type { Exam } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const EMPTY: Omit<Exam, "id"> = {
  name: "",
  term: "First Term",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  classId: "all",
  status: "Upcoming",
};

const statusVariant = (s: string) =>
  s === "Completed" ? "default" : s === "Ongoing" ? "secondary" : "outline";

export default function ExamsView() {
  const exams = useSchoolStore((s) => s.exams);
  const classes = useSchoolStore((s) => s.classes);
  const students = useSchoolStore((s) => s.students);
  const marks = useSchoolStore((s) => s.marks);
  const addExam = useSchoolStore((s) => s.addExam);
  const deleteExam = useSchoolStore((s) => s.deleteExam);
  const saveMark = useSchoolStore((s) => s.saveMark);
  const { toast } = useToast();

  const completedExams = useMemo(() => exams.filter((e) => e.status === "Completed"), [exams]);

  // ── New exam dialog state ──
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Omit<Exam, "id">>(EMPTY);
  const [deleting, setDeleting] = useState<Exam | null>(null);

  // ── Marks entry state ──
  const [markExamId, setMarkExamId] = useState(completedExams[0]?.id ?? "");
  const [markClassId, setMarkClassId] = useState(classes[0]?.id ?? "");
  const [markSection, setMarkSection] = useState(classes[0]?.sections[0] ?? "A");
  const [markValues, setMarkValues] = useState<Record<string, string>>({});

  const markClass = classes.find((c) => c.id === markClassId);
  const markStudents = useMemo(
    () =>
      students
        .filter((s) => s.classId === markClassId && s.section === markSection && s.status === "Active")
        .sort((a, b) => a.rollNo - b.rollNo),
    [students, markClassId, markSection]
  );

  const existingMark = (studentId: string, subject: string): number | null => {
    const m = marks.find((x) => x.examId === markExamId && x.studentId === studentId && x.subject === subject);
    return m ? m.obtainedMarks : null;
  };

  const handleSaveMarks = () => {
    const entries = Object.entries(markValues);
    if (entries.length === 0) {
      toast({ title: "Nothing to save", description: "Enter at least one marks value first." });
      return;
    }
    let saved = 0;
    entries.forEach(([key, val]) => {
      // key format: studentId|subject
      const [studentId, subject] = key.split("|");
      const num = Number(val);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        saveMark(markExamId, studentId, subject, 100, num);
        saved++;
      }
    });
    setMarkValues({});
    toast({ title: "Marks saved", description: `${saved} subject mark(s) recorded.` });
  };

  // ── Results state ──
  const [resExamId, setResExamId] = useState(completedExams[0]?.id ?? "");
  const [resClassId, setResClassId] = useState(classes[0]?.id ?? "");

  const results = useMemo(() => {
    const examMarks = marks.filter((m) => m.examId === resExamId);
    const resStudents = students
      .filter((s) => s.classId === resClassId && s.status === "Active")
      .sort((a, b) => a.rollNo - b.rollNo);
    return resStudents
      .map((s) => {
        const mine = examMarks.filter((m) => m.studentId === s.id);
        const obtained = mine.reduce((a, m) => a + m.obtainedMarks, 0);
        const total = mine.reduce((a, m) => a + m.totalMarks, 0);
        const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
        return { student: s, subjects: mine.length, obtained, total, pct };
      })
      .filter((r) => r.subjects > 0)
      .sort((a, b) => b.pct - a.pct);
  }, [marks, students, resExamId, resClassId]);

  const positionEmoji = (i: number) => (i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}th`);

  const handleAddExam = () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Please enter the exam name.", variant: "destructive" });
      return;
    }
    if (form.endDate < form.startDate) {
      toast({ title: "Invalid dates", description: "End date must be after the start date.", variant: "destructive" });
      return;
    }
    addExam(form);
    toast({ title: "Exam scheduled", description: `${form.name} has been added to the calendar.` });
    setFormOpen(false);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="exams">
        <TabsList className="h-auto w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="exams" className="gap-1.5">
            <BookOpenCheck className="h-4 w-4" /> Exam Schedule
          </TabsTrigger>
          <TabsTrigger value="marks" className="gap-1.5">
            <ListChecks className="h-4 w-4" /> Marks Entry
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-1.5">
            <GraduationCap className="h-4 w-4" /> Results
          </TabsTrigger>
        </TabsList>

        {/* ── Exam schedule ── */}
        <TabsContent value="exams" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setFormOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Schedule Exam
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exams.map((e) => (
              <Card key={e.id} className="py-5">
                <CardHeader className="px-5 pb-2">
                  <CardTitle className="flex items-start justify-between gap-2 text-base">
                    <span>{e.name}</span>
                    <Badge variant={statusVariant(e.status) as "default" | "secondary" | "outline"}>{e.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-5 text-sm text-muted-foreground">
                  <p>{e.term} · {e.classId === "all" ? "All Classes" : classes.find((c) => c.id === e.classId)?.name}</p>
                  <p>
                    {formatDate(e.startDate)} <span className="text-muted-foreground/60">to</span> {formatDate(e.endDate)}
                  </p>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-xs">
                      {marks.filter((m) => m.examId === e.id).length} marks recorded
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleting(e)} aria-label={`Delete ${e.name}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Marks entry ── */}
        <TabsContent value="marks" className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 px-5 py-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Exam</Label>
                <Select value={markExamId} onValueChange={setMarkExamId}>
                  <SelectTrigger aria-label="Exam"><SelectValue placeholder="Select exam" /></SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={markClassId} onValueChange={setMarkClassId}>
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
                <Select value={markSection} onValueChange={setMarkSection}>
                  <SelectTrigger aria-label="Section"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(markClass?.sections ?? ["A"]).map((sec) => (
                      <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between px-5 pb-2">
              <CardTitle className="text-base">
                {markClass?.name} — Section {markSection} · Total marks per subject: 100
              </CardTitle>
              <Button size="sm" onClick={handleSaveMarks} className="gap-1.5">
                <Save className="h-4 w-4" /> Save Marks
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              {markStudents.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No students in this class/section.</p>
              ) : (
                <div className="custom-scrollbar max-h-[54vh] overflow-x-auto overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="sticky left-0 z-20 bg-card pl-5">Student</TableHead>
                        {(markClass?.subjects ?? []).map((sub) => (
                          <TableHead key={sub} className="min-w-[110px] text-center">{sub}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {markStudents.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="sticky left-0 z-10 bg-card pl-5">
                            <p className="text-sm font-medium whitespace-nowrap">{s.name}</p>
                            <p className="text-[11px] text-muted-foreground">Roll {s.rollNo}</p>
                          </TableCell>
                          {(markClass?.subjects ?? []).map((sub) => {
                            const existing = existingMark(s.id, sub);
                            const key = `${s.id}|${sub}`;
                            return (
                              <TableCell key={sub} className="text-center">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  className="mx-auto h-8 w-20 text-center"
                                  placeholder={existing !== null ? String(existing) : "—"}
                                  value={markValues[key] ?? ""}
                                  onChange={(e) => setMarkValues((v) => ({ ...v, [key]: e.target.value }))}
                                  aria-label={`${sub} marks for ${s.name}`}
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Results ── */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 px-5 py-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Exam</Label>
                <Select value={resExamId} onValueChange={setResExamId}>
                  <SelectTrigger aria-label="Exam"><SelectValue placeholder="Select exam" /></SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={resClassId} onValueChange={setResClassId}>
                  <SelectTrigger aria-label="Class"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-5 pb-2">
              <CardTitle className="text-base">
                Result Sheet — {exams.find((e) => e.id === resExamId)?.name} · {classes.find((c) => c.id === resClassId)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {results.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No marks recorded for this exam and class yet. Use Marks Entry to add them.
                </p>
              ) : (
                <div className="custom-scrollbar max-h-[54vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="pl-5">Position</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-center">Subjects</TableHead>
                        <TableHead className="text-center">Obtained</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">%</TableHead>
                        <TableHead className="pr-5 text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r, i) => {
                        const { grade, color } = getGrade(r.pct);
                        return (
                          <TableRow key={r.student.id}>
                            <TableCell className="pl-5">
                              <span className={`inline-flex h-7 w-9 items-center justify-center rounded-full text-xs font-bold ${
                                i < 3 ? "bg-amber-500/15 text-amber-700" : "bg-muted text-muted-foreground"
                              }`}>
                                {positionEmoji(i)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium">{r.student.name}</p>
                              <p className="text-[11px] text-muted-foreground">Roll {r.student.rollNo} · {r.student.section}</p>
                            </TableCell>
                            <TableCell className="text-center tabular-nums">{r.subjects}</TableCell>
                            <TableCell className="text-center tabular-nums font-medium">{r.obtained}</TableCell>
                            <TableCell className="text-center tabular-nums text-muted-foreground">{r.total}</TableCell>
                            <TableCell className="text-center tabular-nums font-semibold">{r.pct}%</TableCell>
                            <TableCell className={`pr-5 text-center font-bold ${color}`}>{grade}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New exam dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Exam</DialogTitle>
            <DialogDescription>Create a new exam entry for the calendar.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Exam Name *</Label>
              <Input id="e-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Second Term Examination" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Term</Label>
                <Select value={form.term} onValueChange={(v) => setForm({ ...form, term: v })}>
                  <SelectTrigger aria-label="Term"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Term">First Term</SelectItem>
                    <SelectItem value="Mid Term">Mid Term</SelectItem>
                    <SelectItem value="Second Term">Second Term</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Exam["status"] })}>
                  <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-start">Start Date</Label>
                <Input id="e-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-end">End Date</Label>
                <Input id="e-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Scope</Label>
              <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                <SelectTrigger aria-label="Scope"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} only</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExam}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete exam?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} and all its recorded marks will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) {
                  deleteExam(deleting.id);
                  toast({ title: "Exam deleted", description: `${deleting.name} was removed.` });
                }
                setDeleting(null);
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
