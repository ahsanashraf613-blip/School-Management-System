"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, UserPlus, Users } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { useSchoolStore } from "@/lib/store";
import { avatarColor, formatRs, initials } from "@/lib/helpers";
import type { Student } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const EMPTY: Omit<Student, "id"> = {
  admissionNo: "",
  name: "",
  fatherName: "",
  gender: "Male",
  classId: "",
  section: "A",
  rollNo: 1,
  dob: "2015-01-01",
  phone: "",
  address: "",
  admissionDate: new Date().toISOString().slice(0, 10),
  status: "Active",
  bloodGroup: "O+",
  monthlyFee: 2000,
};

const statusVariant = (s: string) =>
  s === "Active" ? "default" : s === "Graduated" ? "secondary" : "destructive";

export default function StudentsView() {
  const students = useSchoolStore((s) => s.students);
  const classes = useSchoolStore((s) => s.classes);
  const addStudent = useSchoolStore((s) => s.addStudent);
  const updateStudent = useSchoolStore((s) => s.updateStudent);
  const deleteStudent = useSchoolStore((s) => s.deleteStudent);
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<Omit<Student, "id">>(EMPTY);
  const [detail, setDetail] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const classMap = useMemo(() => Object.fromEntries(classes.map((c) => [c.id, c])), [classes]);

  const filtered = useMemo(() => {
    return students
      .filter((s) => (classFilter === "all" ? true : s.classId === classFilter))
      .filter((s) => (statusFilter === "all" ? true : s.status === statusFilter))
      .filter((s) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          s.fatherName.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.admissionNo.localeCompare(b.admissionNo));
  }, [students, query, classFilter, statusFilter]);

  const openAdd = () => {
    const nextNo = `ADM-2026-${String(students.length + 1).padStart(3, "0")}`;
    setEditing(null);
    setForm({ ...EMPTY, admissionNo: nextNo, classId: classes[0]?.id ?? "" });
    setFormOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    const { id, ...rest } = s;
    void id;
    setForm(rest);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.classId) {
      toast({ title: "Missing fields", description: "Name and class are required.", variant: "destructive" });
      return;
    }
    if (editing) {
      updateStudent(editing.id, form);
      toast({ title: "Student updated", description: `${form.name}'s record has been updated.` });
    } else {
      addStudent(form);
      toast({ title: "Student admitted", description: `${form.name} has been added to ${classMap[form.classId]?.name ?? "class"}.` });
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteStudent(deleting.id);
    toast({ title: "Student removed", description: `${deleting.name}'s record was deleted.` });
    setDeleting(null);
  };

  const detailClass = detail ? classMap[detail.classId] : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, father name or admission no…"
            className="pl-9"
            aria-label="Search students"
          />
        </div>
        <div className="flex gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[150px]" aria-label="Filter by class">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Graduated">Graduated</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gap-1.5 whitespace-nowrap">
            <UserPlus className="h-4 w-4" /> New Admission
          </Button>
        </div>
      </div>

      {/* Table card */}
      <Card>
        <CardContent className="px-0">
          <div className="custom-scrollbar max-h-[62vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                <TableRow>
                  <TableHead className="pl-5">Student</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead className="hidden md:table-cell">Father Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="hidden sm:table-cell">Roll</TableHead>
                  <TableHead className="hidden lg:table-cell">Monthly Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-14 text-center">
                      <Users className="mx-auto h-10 w-10 text-muted-foreground/40" aria-hidden />
                      <p className="mt-2 text-sm font-medium">No students found</p>
                      <p className="text-xs text-muted-foreground">Try changing the search or filters.</p>
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-accent/40">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={`text-[11px] font-bold text-white ${avatarColor(s.name)}`}>
                            {initials(s.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.gender} · {s.bloodGroup}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.admissionNo}</TableCell>
                    <TableCell className="hidden md:table-cell">{s.fatherName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {classMap[s.classId]?.name ?? "—"} {s.section}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden tabular-nums sm:table-cell">{s.rollNo}</TableCell>
                    <TableCell className="hidden tabular-nums lg:table-cell">{formatRs(s.monthlyFee)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(s.status) as "default" | "secondary" | "destructive"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetail(s)} aria-label={`View ${s.name}`}>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t px-5 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} of {students.length} students
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto custom-scrollbar sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Student" : "New Admission"}</DialogTitle>
            <DialogDescription>
              {editing ? `Update record of ${editing.name}.` : "Fill the form to register a new student."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="st-name">Student Name *</Label>
              <Input id="st-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ahmed Khan" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-father">Father Name *</Label>
              <Input id="st-father" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} placeholder="e.g. Muhammad Khan" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-adm">Admission No</Label>
              <Input id="st-adm" value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as Student["gender"] })}>
                <SelectTrigger aria-label="Gender"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
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
              <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                <SelectTrigger aria-label="Section"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-roll">Roll No</Label>
              <Input id="st-roll" type="number" min={1} value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: Number(e.target.value) || 1 })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-dob">Date of Birth</Label>
              <Input id="st-dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-phone">Guardian Phone</Label>
              <Input id="st-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0300-1234567" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-blood">Blood Group</Label>
              <Input id="st-blood" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-fee">Monthly Fee (Rs)</Label>
              <Input id="st-fee" type="number" min={0} value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Student["status"] })}>
                <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="st-addr">Home Address</Label>
              <Input id="st-addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House #, Area, City" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Save Changes" : "Admit Student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`font-bold text-white ${avatarColor(detail.name)}`}>
                      {initials(detail.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="block">{detail.name}</span>
                    <span className="block text-xs font-normal text-muted-foreground font-mono">{detail.admissionNo}</span>
                  </div>
                </DialogTitle>
                <DialogDescription>Student profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <p className="text-muted-foreground">Father Name</p><p className="font-medium">{detail.fatherName}</p>
                  <p className="text-muted-foreground">Class / Section</p>
                  <p className="font-medium">{detailClass?.name ?? "—"} — {detail.section} (Roll {detail.rollNo})</p>
                  <p className="text-muted-foreground">Date of Birth</p><p className="font-medium">{detail.dob}</p>
                  <p className="text-muted-foreground">Gender</p><p className="font-medium">{detail.gender}</p>
                  <p className="text-muted-foreground">Blood Group</p><p className="font-medium">{detail.bloodGroup}</p>
                  <p className="text-muted-foreground">Guardian Phone</p><p className="font-medium">{detail.phone}</p>
                  <p className="text-muted-foreground">Monthly Fee</p><p className="font-medium">{formatRs(detail.monthlyFee)}</p>
                  <p className="text-muted-foreground">Admission Date</p><p className="font-medium">{detail.admissionDate}</p>
                  <p className="text-muted-foreground">Status</p>
                  <p><Badge variant={statusVariant(detail.status) as "default" | "secondary" | "destructive"}>{detail.status}</Badge></p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="mt-0.5 font-medium">{detail.address || "—"}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleting?.name} along with their fee challans, attendance and exam marks.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
              <Plus className="hidden" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
