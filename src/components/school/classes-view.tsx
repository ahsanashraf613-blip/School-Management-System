"use client";

import { useMemo, useState } from "react";
import { BookOpen, DoorOpen, Pencil, Plus, School, Trash2, UserCheck, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { avatarColor, formatRs, initials } from "@/lib/helpers";
import { SUBJECT_LIST } from "@/lib/mock-data";
import type { SchoolClass } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const EMPTY: Omit<SchoolClass, "id"> = {
  name: "",
  level: 1,
  sections: ["A"],
  classTeacherId: "",
  monthlyFee: 2000,
  subjects: [...SUBJECT_LIST],
  roomNo: "",
};

export default function ClassesView() {
  const classes = useSchoolStore((s) => s.classes);
  const students = useSchoolStore((s) => s.students);
  const teachers = useSchoolStore((s) => s.teachers);
  const addClass = useSchoolStore((s) => s.addClass);
  const updateClass = useSchoolStore((s) => s.updateClass);
  const deleteClass = useSchoolStore((s) => s.deleteClass);
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [form, setForm] = useState<Omit<SchoolClass, "id">>(EMPTY);
  const [deleting, setDeleting] = useState<SchoolClass | null>(null);

  const teacherMap = useMemo(() => Object.fromEntries(teachers.map((t) => [t.id, t])), [teachers]);
  const sorted = useMemo(() => [...classes].sort((a, b) => a.level - b.level), [classes]);

  const strengthOf = (c: SchoolClass) =>
    students.filter((s) => s.classId === c.id && s.status === "Active").length;

  const toggleSection = (sec: string) => {
    const has = form.sections.includes(sec);
    setForm({
      ...form,
      sections: has ? form.sections.filter((s) => s !== sec) : [...form.sections, sec].sort(),
    });
  };

  const toggleSubject = (sub: string) => {
    const has = form.subjects.includes(sub);
    setForm({
      ...form,
      subjects: has ? form.subjects.filter((s) => s !== sub) : [...form.subjects, sub],
    });
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, name: `Class ${classes.length + 1}`, level: classes.length + 1, classTeacherId: teachers[0]?.id ?? "" });
    setFormOpen(true);
  };

  const openEdit = (c: SchoolClass) => {
    setEditing(c);
    const { id, ...rest } = c;
    void id;
    setForm(rest);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || form.sections.length === 0) {
      toast({ title: "Missing fields", description: "Class name and at least one section are required.", variant: "destructive" });
      return;
    }
    if (editing) {
      updateClass(editing.id, form);
      toast({ title: "Class updated", description: `${form.name} has been updated.` });
    } else {
      addClass(form);
      toast({ title: "Class created", description: `${form.name} with sections ${form.sections.join(", ")} was created.` });
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteClass(deleting.id);
    toast({ title: "Class deleted", description: `${deleting.name} was removed. Its students were marked inactive.` });
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {classes.length} classes · {students.filter((s) => s.status === "Active").length} active students
        </p>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Class
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((c) => {
          const ct = teacherMap[c.classTeacherId];
          const strength = strengthOf(c);
          return (
            <Card key={c.id} className="py-5 transition-shadow hover:shadow-md">
              <CardHeader className="px-5">
                <CardTitle className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <School className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <span className="block leading-tight">{c.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">Room {c.roomNo || "—"}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-5">
                <div className="flex flex-wrap gap-1.5">
                  {c.sections.map((sec) => (
                    <Badge key={sec} variant="outline" className="border-primary/30 text-primary">
                      Section {sec}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" aria-hidden /> {strength} students
                  </Badge>
                </div>

                <div className="flex items-center gap-2 rounded-lg border bg-accent/30 p-2.5">
                  {ct ? (
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`text-[10px] font-bold text-white ${avatarColor(ct.name)}`}>
                          {initials(ct.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 truncate text-xs font-semibold">
                          <UserCheck className="h-3 w-3 text-primary" aria-hidden /> {ct.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Class Teacher · {ct.subject}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No class teacher assigned</p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    <span className="truncate">{c.subjects.join(" · ")}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5" aria-hidden /> Monthly fee: {formatRs(c.monthlyFee)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <DoorOpen className="h-3.5 w-3.5" aria-hidden />
                    {c.sections.length} section{c.sections.length > 1 ? "s" : ""} · Level {c.level}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto custom-scrollbar sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : "Add New Class"}</DialogTitle>
            <DialogDescription>Configure class sections, fee and subjects.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Class Name *</Label>
              <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Class 9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-room">Room No</Label>
              <Input id="c-room" value={form.roomNo} onChange={(e) => setForm({ ...form, roomNo: e.target.value })} placeholder="e.g. R-109" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-fee">Monthly Fee (Rs)</Label>
              <Input id="c-fee" type="number" min={0} value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label>Class Teacher</Label>
              <Select value={form.classTeacherId} onValueChange={(v) => setForm({ ...form, classTeacherId: v })}>
                <SelectTrigger aria-label="Class teacher"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.subject})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Sections *</Label>
              <div className="flex gap-4">
                {["A", "B", "C"].map((sec) => (
                  <label key={sec} className="flex items-center gap-2 text-sm font-normal">
                    <Checkbox checked={form.sections.includes(sec)} onCheckedChange={() => toggleSection(sec)} />
                    Section {sec}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Subjects</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {SUBJECT_LIST.map((sub) => (
                  <label key={sub} className="flex items-center gap-2 text-sm font-normal">
                    <Checkbox checked={form.subjects.includes(sub)} onCheckedChange={() => toggleSubject(sub)} />
                    {sub}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Save Changes" : "Create Class"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Students currently enrolled in this class will be marked inactive. Timetable slots and attendance for this
              class will remain in history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
