"use client";

import { useMemo, useState } from "react";
import { Pencil, Phone, Mail, Search, Trash2, UserRoundPlus, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { avatarColor, formatDate, formatRs, initials } from "@/lib/helpers";
import { SUBJECT_LIST } from "@/lib/mock-data";
import type { Teacher } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const EMPTY: Omit<Teacher, "id"> = {
  employeeNo: "",
  name: "",
  gender: "Female",
  subject: SUBJECT_LIST[0],
  phone: "",
  email: "",
  qualification: "",
  joinDate: new Date().toISOString().slice(0, 10),
  salary: 50000,
  status: "Active",
};

const statusVariant = (s: string) =>
  s === "Active" ? "default" : s === "On Leave" ? "secondary" : "destructive";

export default function TeachersView() {
  const teachers = useSchoolStore((s) => s.teachers);
  const classes = useSchoolStore((s) => s.classes);
  const addTeacher = useSchoolStore((s) => s.addTeacher);
  const updateTeacher = useSchoolStore((s) => s.updateTeacher);
  const deleteTeacher = useSchoolStore((s) => s.deleteTeacher);
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState<Omit<Teacher, "id">>(EMPTY);
  const [deleting, setDeleting] = useState<Teacher | null>(null);

  const filtered = useMemo(() => {
    return teachers
      .filter((t) => (subjectFilter === "all" ? true : t.subject === subjectFilter))
      .filter((t) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return t.name.toLowerCase().includes(q) || t.employeeNo.toLowerCase().includes(q);
      });
  }, [teachers, query, subjectFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, employeeNo: `EMP-${120 + teachers.length}` });
    setFormOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    const { id, ...rest } = t;
    void id;
    setForm(rest);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Please enter the teacher's full name.", variant: "destructive" });
      return;
    }
    if (editing) {
      updateTeacher(editing.id, form);
      toast({ title: "Teacher updated", description: `${form.name}'s record has been updated.` });
    } else {
      addTeacher(form);
      toast({ title: "Teacher added", description: `${form.name} joined the ${form.subject} department.` });
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteTeacher(deleting.id);
    toast({ title: "Teacher removed", description: `${deleting.name}'s record was deleted.` });
    setDeleting(null);
  };

  const classTeacherOf = (id: string) =>
    classes.filter((c) => c.classTeacherId === id).map((c) => c.name);

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UsersRound className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{teachers.filter((t) => t.status === "Active").length}</p>
              <p className="text-xs text-muted-foreground">Active teachers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <UsersRound className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{teachers.filter((t) => t.status === "On Leave").length}</p>
              <p className="text-xs text-muted-foreground">Currently on leave</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600">
              <UsersRound className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{formatRs(teachers.reduce((a, t) => a + t.salary, 0))}</p>
              <p className="text-xs text-muted-foreground">Total monthly payroll</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or employee no…"
            className="pl-9"
            aria-label="Search teachers"
          />
        </div>
        <div className="flex gap-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[170px]" aria-label="Filter by subject">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {Array.from(new Set(teachers.map((t) => t.subject))).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gap-1.5 whitespace-nowrap">
            <UserRoundPlus className="h-4 w-4" /> Add Teacher
          </Button>
        </div>
      </div>

      {/* Teacher cards grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <UsersRound className="mx-auto h-10 w-10 text-muted-foreground/40" aria-hidden />
            <p className="mt-2 text-sm font-medium">No teachers found</p>
            <p className="text-xs text-muted-foreground">Try changing the search or filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => {
            const ctOf = classTeacherOf(t.id);
            return (
              <Card key={t.id} className="py-5 transition-shadow hover:shadow-md">
                <CardContent className="px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={`font-bold text-white ${avatarColor(t.name)}`}>
                          {initials(t.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.qualification}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant(t.status) as "default" | "secondary" | "destructive"}>{t.status}</Badge>
                  </div>

                  <div className="mt-4 space-y-1.5 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{t.email}</span>
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {t.phone}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="border-primary/30 text-primary">{t.subject}</Badge>
                    <Badge variant="outline">{t.employeeNo}</Badge>
                    {ctOf.length > 0 && (
                      <Badge variant="outline" className="border-amber-500/40 text-amber-700">
                        Class Teacher: {ctOf.join(", ")}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <div className="text-xs text-muted-foreground">
                      Joined {formatDate(t.joinDate)} · <span className="font-semibold text-foreground">{formatRs(t.salary)}/mo</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)} aria-label={`Edit ${t.name}`}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleting(t)} aria-label={`Delete ${t.name}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto custom-scrollbar sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
            <DialogDescription>
              {editing ? `Update record of ${editing.name}.` : "Register a new teaching staff member."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Full Name *</Label>
              <Input id="t-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Farhana Qureshi" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-emp">Employee No</Label>
              <Input id="t-emp" value={form.employeeNo} onChange={(e) => setForm({ ...form, employeeNo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as Teacher["gender"] })}>
                <SelectTrigger aria-label="Gender"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                <SelectTrigger aria-label="Subject"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBJECT_LIST.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-phone">Phone</Label>
              <Input id="t-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0300-1234567" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-email">Email</Label>
              <Input id="t-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@school.edu.pk" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-qual">Qualification</Label>
              <Input id="t-qual" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. M.Sc Mathematics" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-join">Joining Date</Label>
              <Input id="t-join" type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-salary">Salary (Rs)</Label>
              <Input id="t-salary" type="number" min={0} value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Teacher["status"] })}>
                <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Resigned">Resigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Save Changes" : "Add Teacher"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} will be removed from the staff list. Classes where they are assigned as class teacher will need a new teacher.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
