"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { buildSeedData } from "./mock-data";
import type {
  AttendanceRecord,
  AttendanceStatus,
  Exam,
  ExamMark,
  Expense,
  FeeChallan,
  Notice,
  SchoolClass,
  SchoolProfile,
  Student,
  Teacher,
  TimetableSlot,
} from "./types";

const seed = buildSeedData();

interface SchoolState {
  profile: SchoolProfile;
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  attendance: AttendanceRecord[];
  challans: FeeChallan[];
  exams: Exam[];
  marks: ExamMark[];
  timetable: TimetableSlot[];
  notices: Notice[];
  expenses: Expense[];

  // students
  addStudent: (s: Omit<Student, "id">) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  // teachers
  addTeacher: (t: Omit<Teacher, "id">) => void;
  updateTeacher: (id: string, patch: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  // classes
  addClass: (c: Omit<SchoolClass, "id">) => void;
  updateClass: (id: string, patch: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;
  // attendance
  saveAttendance: (records: AttendanceRecord[]) => void;
  // fees
  addChallan: (c: Omit<FeeChallan, "id">) => void;
  payChallan: (id: string, amount: number) => void;
  deleteChallan: (id: string) => void;
  generateMonthlyChallans: (month: string) => number;
  // students (bulk)
  promoteStudents: (fromClassId: string, toClassId: string) => number;
  // exams
  addExam: (e: Omit<Exam, "id">) => void;
  updateExam: (id: string, patch: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  saveMark: (examId: string, studentId: string, subject: string, totalMarks: number, obtainedMarks: number) => void;
  // timetable
  addSlot: (s: Omit<TimetableSlot, "id">) => void;
  deleteSlot: (id: string) => void;
  // notices
  addNotice: (n: Omit<Notice, "id">) => void;
  deleteNotice: (id: string) => void;
  // expenses
  addExpense: (e: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  // profile & reset
  updateProfile: (p: Partial<SchoolProfile>) => void;
  resetAllData: () => void;
}

let counter = 1000;
const nextId = (prefix: string) => `${prefix}-n${++counter}`;

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set, get) => ({
      profile: seed.profile,
      students: seed.students,
      teachers: seed.teachers,
      classes: seed.classes,
      attendance: seed.attendance,
      challans: seed.challans,
      exams: seed.exams,
      marks: seed.marks,
      timetable: seed.timetable,
      notices: seed.notices,
      expenses: seed.expenses,

      addStudent: (s) =>
        set((st) => ({
          students: [
            { ...s, id: nextId("std") },
            ...st.students,
          ],
        })),
      promoteStudents: (fromClassId, toClassId) => {
        if (fromClassId === toClassId) return 0;
        let moved = 0;
        set((st) => ({
          students: st.students.map((s) => {
            if (s.classId === fromClassId && s.status === "Active") {
              moved++;
              return { ...s, classId: toClassId };
            }
            return s;
          }),
        }));
        return moved;
      },
      updateStudent: (id, patch) =>
        set((st) => ({ students: st.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),
      deleteStudent: (id) =>
        set((st) => ({
          students: st.students.filter((s) => s.id !== id),
          challans: st.challans.filter((c) => c.studentId !== id),
          attendance: st.attendance.filter((a) => a.studentId !== id),
          marks: st.marks.filter((m) => m.studentId !== id),
        })),

      addTeacher: (t) => set((st) => ({ teachers: [{ ...t, id: nextId("tch") }, ...st.teachers] })),
      updateTeacher: (id, patch) =>
        set((st) => ({ teachers: st.teachers.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTeacher: (id) =>
        set((st) => ({
          teachers: st.teachers.filter((t) => t.id !== id),
          classes: st.classes.map((c) => (c.classTeacherId === id ? { ...c, classTeacherId: "" } : c)),
        })),

      addClass: (c) => set((st) => ({ classes: [...st.classes, { ...c, id: nextId("cls") }] })),
      updateClass: (id, patch) =>
        set((st) => ({ classes: st.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteClass: (id) =>
        set((st) => ({
          classes: st.classes.filter((c) => c.id !== id),
          students: st.students.map((s) => (s.classId === id ? { ...s, status: "Inactive" as const } : s)),
        })),

      saveAttendance: (records) =>
        set((st) => {
          const others = st.attendance.filter(
            (a) => !records.some((r) => r.date === a.date && r.studentId === a.studentId)
          );
          return { attendance: [...others, ...records] };
        }),

      addChallan: (c) => set((st) => ({ challans: [{ ...c, id: nextId("chl") }, ...st.challans] })),
      payChallan: (id, amount) =>
        set((st) => ({
          challans: st.challans.map((c) => {
            if (c.id !== id) return c;
            const already = c.paidAmount ?? (c.status === "Paid" ? c.total : 0);
            const paid = Math.min(c.total, already + Math.max(0, amount));
            const fullyPaid = paid >= c.total;
            return {
              ...c,
              paidAmount: paid,
              status: (fullyPaid ? "Paid" : "Partial") as FeeChallan["status"],
              paidDate: fullyPaid ? new Date().toISOString().slice(0, 10) : c.paidDate,
            };
          }),
        })),
      deleteChallan: (id) => set((st) => ({ challans: st.challans.filter((c) => c.id !== id) })),
      generateMonthlyChallans: (month) => {
        const { students, challans } = get();
        const active = students.filter((s) => s.status === "Active");
        const existing = new Set(
          challans.filter((c) => c.month === month).map((c) => c.studentId)
        );
        const toCreate = active.filter((s) => !existing.has(s.id));
        const dueDate = `${month}-10`;
        const generated: FeeChallan[] = toCreate.map((s) => {
          const otherCharges = 0;
          const discount = 0;
          return {
            id: nextId("chl"),
            challanNo: `CH-${month.replace("-", "")}-${s.id.replace("std-", "").padStart(4, "0")}`,
            studentId: s.id,
            month,
            tuitionFee: s.monthlyFee,
            otherCharges,
            discount,
            total: s.monthlyFee + otherCharges - discount,
            dueDate,
            status: "Pending" as const,
          };
        });
        set((st) => ({ challans: [...generated, ...st.challans] }));
        return generated.length;
      },

      addExam: (e) => set((st) => ({ exams: [...st.exams, { ...e, id: nextId("exm") }] })),
      updateExam: (id, patch) =>
        set((st) => ({ exams: st.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      deleteExam: (id) =>
        set((st) => ({ exams: st.exams.filter((e) => e.id !== id), marks: st.marks.filter((m) => m.examId !== id) })),
      saveMark: (examId, studentId, subject, totalMarks, obtainedMarks) =>
        set((st) => {
          const id = `${examId}:${studentId}:${subject}`;
          const exists = st.marks.find((m) => m.id === id);
          if (exists) {
            return {
              marks: st.marks.map((m) => (m.id === id ? { ...m, totalMarks, obtainedMarks } : m)),
            };
          }
          return {
            marks: [...st.marks, { id, examId, studentId, subject, totalMarks, obtainedMarks } as ExamMark],
          };
        }),

      addSlot: (s) => set((st) => ({ timetable: [...st.timetable, { ...s, id: nextId("slt") }] })),
      deleteSlot: (id) => set((st) => ({ timetable: st.timetable.filter((t) => t.id !== id) })),

      addNotice: (n) =>
        set((st) => ({
          notices: [{ ...n, id: nextId("ntc"), date: n.date || new Date().toISOString().slice(0, 10) }, ...st.notices],
        })),
      deleteNotice: (id) => set((st) => ({ notices: st.notices.filter((n) => n.id !== id) })),

      addExpense: (e) => set((st) => ({ expenses: [{ ...e, id: nextId("exp") }, ...st.expenses] })),
      deleteExpense: (id) => set((st) => ({ expenses: st.expenses.filter((e) => e.id !== id) })),

      updateProfile: (p) => set((st) => ({ profile: { ...st.profile, ...p } })),
      resetAllData: () =>
        set(() => {
          const fresh = buildSeedData();
          return { ...fresh };
        }),
    }),
    {
      name: "skoolypro-school-data",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// Selector helpers
export const useStudents = () => useSchoolStore((s) => s.students);
export const useTeachers = () => useSchoolStore((s) => s.teachers);
export const useClasses = () => useSchoolStore((s) => s.classes);
