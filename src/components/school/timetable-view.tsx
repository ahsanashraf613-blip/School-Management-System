"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Coffee, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useSchoolStore } from "@/lib/store";
import { PERIODS, SUBJECT_LIST, WEEK_DAYS } from "@/lib/mock-data";
import type { TimetableSlot, WeekDay } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function TimetableView() {
  const classes = useSchoolStore((s) => s.classes);
  const teachers = useSchoolStore((s) => s.teachers);
  const timetable = useSchoolStore((s) => s.timetable);
  const addSlot = useSchoolStore((s) => s.addSlot);
  const deleteSlot = useSchoolStore((s) => s.deleteSlot);
  const { toast } = useToast();

  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const classObj = classes.find((c) => c.id === classId);
  const [section, setSection] = useState(classes[0]?.sections[0] ?? "A");

  // keep section valid
  const sections = classObj?.sections ?? ["A"];
  const activeSection = sections.includes(section) ? section : sections[0];

  const slots = timetable.filter((t) => t.classId === classId && t.section === activeSection);

  const teacherMap: Record<string, { name: string }> = {};
  teachers.forEach((t) => {
    teacherMap[t.id] = t;
  });

  const cell = (day: WeekDay, period: number): TimetableSlot | undefined =>
    slots.find((s) => s.day === day && s.period === period);

  // Add slot dialog
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    day: "Monday" as WeekDay,
    period: 1,
    subject: SUBJECT_LIST[0],
    teacherId: "",
  });

  const periodTime = (period: number) => {
    const p = PERIODS[period - 1];
    return p ? `${p[0]} – ${p[1]}` : "";
  };

  const handleAdd = () => {
    if (!classId) return;
    const t = PERIODS[form.period - 1];
    if (!t) return;
    addSlot({
      classId,
      section: activeSection,
      day: form.day,
      period: form.period,
      startTime: t[0],
      endTime: t[1],
      subject: form.subject,
      teacherId: form.teacherId || teachers.find((x) => x.subject === form.subject)?.id || teachers[0]?.id || "",
    });
    toast({
      title: "Period added",
      description: `${form.subject} on ${form.day}, period ${form.period} added to timetable.`,
    });
    setOpen(false);
  };

  const subjectColors: Record<string, string> = {
    English: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
    Urdu: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    Mathematics: "bg-teal-600/10 text-teal-700 border-teal-600/30",
    Science: "bg-cyan-600/10 text-cyan-700 border-cyan-600/30",
    Islamiat: "bg-lime-600/10 text-lime-700 border-lime-600/30",
    "Social Studies": "bg-orange-600/10 text-orange-700 border-orange-600/30",
    Computer: "bg-fuchsia-600/10 text-fuchsia-700 border-fuchsia-600/30",
    Library: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
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
          </div>
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Period
          </Button>
        </CardContent>
      </Card>

      {/* Weekly grid */}
      <Card>
        <CardHeader className="px-5 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
            Weekly Timetable — {classObj?.name ?? "Class"} ({activeSection})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className="custom-scrollbar overflow-x-auto">
            <div className="min-w-[860px]">
              {/* Header row: periods */}
              <div className="grid grid-cols-[110px_repeat(6,1fr)] gap-2" role="row">
                <div className="rounded-lg bg-muted p-2 text-center text-xs font-semibold text-muted-foreground">
                  Day / Period
                </div>
                {PERIODS.map((_, i) => (
                  <div key={i} className="rounded-lg bg-muted p-2 text-center">
                    <p className="text-xs font-semibold">Period {i + 1}</p>
                    <p className="text-[10px] text-muted-foreground">{periodTime(i + 1)}</p>
                  </div>
                ))}
              </div>

              {WEEK_DAYS.map((day) => (
                <div key={day} className="mt-2 grid grid-cols-[110px_repeat(6,1fr)] items-stretch gap-2">
                  <div className="flex items-center justify-center rounded-lg border bg-accent/40 p-2 text-xs font-semibold">
                    {day}
                  </div>
                  {PERIODS.map((_, pi) => {
                    const slot = cell(day, pi + 1);
                    if (pi === 2) {
                      return (
                        <div key={pi} className="space-y-1">
                          {slot ? (
                            <SlotChip slot={slot} subjectColors={subjectColors} teacherMap={teacherMap} onRemove={() => {
                              deleteSlot(slot.id);
                              toast({ title: "Period removed", description: `${slot.subject} on ${day} was removed.` });
                            }} />
                          ) : (
                            <EmptyCell />
                          )}
                          <div className="flex items-center justify-center gap-1 rounded-md bg-amber-500/10 py-1 text-[10px] font-semibold text-amber-700">
                            <Coffee className="h-3 w-3" aria-hidden /> Break 10:15 – 10:45
                          </div>
                        </div>
                      );
                    }
                    return slot ? (
                      <SlotChip
                        key={pi}
                        slot={slot}
                        subjectColors={subjectColors}
                        teacherMap={teacherMap}
                        onRemove={() => {
                          deleteSlot(slot.id);
                          toast({ title: "Period removed", description: `${slot.subject} on ${day} was removed.` });
                        }}
                      />
                    ) : (
                      <EmptyCell key={pi} />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Tip: click the × on a period card to remove it from the timetable.
          </p>
        </CardContent>
      </Card>

      {/* Add period dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Period</DialogTitle>
            <DialogDescription>
              {classObj?.name} — Section {activeSection}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Day</Label>
              <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v as WeekDay })}>
                <SelectTrigger aria-label="Day"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WEEK_DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Period</Label>
              <Select value={String(form.period)} onValueChange={(v) => setForm({ ...form, period: Number(v) })}>
                <SelectTrigger aria-label="Period"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p, i) => (
                    <SelectItem key={i} value={String(i + 1)}>
                      Period {i + 1} ({p[0]} – {p[1]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                <SelectTrigger aria-label="Subject"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[...SUBJECT_LIST, "Library", "P.E."].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Teacher</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                <SelectTrigger aria-label="Teacher"><SelectValue placeholder="Auto-assign by subject" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.subject})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Period</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SlotChip({
  slot,
  subjectColors,
  teacherMap,
  onRemove,
}: {
  slot: TimetableSlot;
  subjectColors: Record<string, string>;
  teacherMap: Record<string, { name: string }>;
  onRemove: () => void;
}) {
  return (
    <div
      className={`group relative flex h-[64px] flex-col justify-center rounded-lg border p-2 text-center transition-shadow hover:shadow-sm ${subjectColors[slot.subject] ?? "bg-muted border-border"}`}
    >
      <p className="truncate text-xs font-bold">{slot.subject}</p>
      <p className="truncate text-[10px] opacity-75">{teacherMap[slot.teacherId]?.name ?? "—"}</p>
      <button
        onClick={onRemove}
        aria-label={`Remove ${slot.subject} period`}
        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow group-hover:flex"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function EmptyCell() {
  return (
    <div className="flex h-[64px] items-center justify-center rounded-lg border border-dashed text-[10px] text-muted-foreground/50">
      Free
    </div>
  );
}
