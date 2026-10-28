"use client";

import { create } from "zustand";
import type {
  AttendanceRecord,
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

// ── Backend-backed store ────────────────────────────────────────────────────
// All state now lives in SQLite (via the REST API under /api/*). This store
// is the client cache: loadAll() hydrates it from GET /api/bootstrap, and
// every mutation POSTs/PUTs/DELETEs to the server first, then patches local
// state from the server's response (server is the source of truth).

const DEFAULT_PROFILE: SchoolProfile = {
  name: "SkoolyPro",
  tagline: "School Management System",
  address: "",
  phone: "",
  email: "",
  session: "",
  principal: "",
};

interface BootstrapData {
  profile: SchoolProfile | null;
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
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

// Surface backend failures to the UI (page.tsx listens and toasts).
function reportError(e: unknown) {
  const message = e instanceof Error ? e.message : "Network error";
  console.error("[store]", message);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<string>("skoolypro-api-error", { detail: message }));
  }
}

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

  loading: boolean;
  loaded: boolean;
  loadError: string | null;
  loadAll: () => Promise<void>;

  // students
  addStudent: (s: Omit<Student, "id">) => Promise<void>;
  updateStudent: (id: string, patch: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  promoteStudents: (fromClassId: string, toClassId: string) => Promise<number>;
  // teachers
  addTeacher: (t: Omit<Teacher, "id">) => Promise<void>;
  updateTeacher: (id: string, patch: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  // classes
  addClass: (c: Omit<SchoolClass, "id">) => Promise<void>;
  updateClass: (id: string, patch: Partial<SchoolClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  // attendance
  saveAttendance: (records: AttendanceRecord[]) => Promise<void>;
  // fees
  addChallan: (c: Omit<FeeChallan, "id">) => Promise<void>;
  payChallan: (id: string, amount: number) => Promise<void>;
  deleteChallan: (id: string) => Promise<void>;
  generateMonthlyChallans: (month: string) => Promise<number>;
  // exams
  addExam: (e: Omit<Exam, "id">) => Promise<void>;
  updateExam: (id: string, patch: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  saveMark: (examId: string, studentId: string, subject: string, totalMarks: number, obtainedMarks: number) => Promise<void>;
  // timetable
  addSlot: (s: Omit<TimetableSlot, "id">) => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;
  // notices
  addNotice: (n: Omit<Notice, "id">) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  // expenses
  addExpense: (e: Omit<Expense, "id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  // profile & reset
  updateProfile: (p: Partial<SchoolProfile>) => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const useSchoolStore = create<SchoolState>()((set, get) => ({
  profile: DEFAULT_PROFILE,
  students: [],
  teachers: [],
  classes: [],
  attendance: [],
  challans: [],
  exams: [],
  marks: [],
  timetable: [],
  notices: [],
  expenses: [],

  loading: false,
  loaded: false,
  loadError: null,

  loadAll: async () => {
    if (get().loading) return;
    set({ loading: true, loadError: null });
    try {
      const data = await api<BootstrapData>("/api/bootstrap");
      set({
        profile: data.profile ?? DEFAULT_PROFILE,
        students: data.students,
        teachers: data.teachers,
        classes: data.classes,
        attendance: data.attendance,
        challans: data.challans,
        exams: data.exams,
        marks: data.marks,
        timetable: data.timetable,
        notices: data.notices,
        expenses: data.expenses,
        loading: false,
        loaded: true,
      });
    } catch (e) {
      set({ loading: false, loadError: e instanceof Error ? e.message : "Failed to load data" });
    }
  },

  // ── Students ──────────────────────────────────────────────────────────────
  addStudent: async (s) => {
    try {
      const created = await api<Student>("/api/students", { method: "POST", body: JSON.stringify(s) });
      set((st) => ({ students: [created, ...st.students] }));
    } catch (e) {
      reportError(e);
    }
  },
  updateStudent: async (id, patch) => {
    try {
      const updated = await api<Student>(`/api/students/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      set((st) => ({ students: st.students.map((s) => (s.id === id ? updated : s)) }));
    } catch (e) {
      reportError(e);
    }
  },
  deleteStudent: async (id) => {
    try {
      await api(`/api/students/${encodeURIComponent(id)}`, { method: "DELETE" });
      set((st) => ({
        students: st.students.filter((s) => s.id !== id),
        challans: st.challans.filter((c) => c.studentId !== id),
        attendance: st.attendance.filter((a) => a.studentId !== id),
        marks: st.marks.filter((m) => m.studentId !== id),
      }));
    } catch (e) {
      reportError(e);
    }
  },
  promoteStudents: async (fromClassId, toClassId) => {
    if (fromClassId === toClassId) return 0;
    try {
      const res = await api<{ moved: number; students: Student[] }>("/api/students/promote", {
        method: "POST",
        body: JSON.stringify({ fromClassId, toClassId }),
      });
      const movedIds = new Set(res.students.map((s) => s.id));
      set((st) => ({
        students: st.students.map((s) =>
          movedIds.has(s.id) ? { ...s, classId: toClassId } : s
        ),
      }));
      return res.moved;
    } catch (e) {
      reportError(e);
      return 0;
    }
  },

  // ── Teachers ──────────────────────────────────────────────────────────────
  addTeacher: async (t) => {
    try {
      const created = await api<Teacher>("/api/teachers", { method: "POST", body: JSON.stringify(t) });
      set((st) => ({ teachers: [created, ...st.teachers] }));
    } catch (e) {
      reportError(e);
    }
  },
  updateTeacher: async (id, patch) => {
    try {
      const updated = await api<Teacher>(`/api/teachers/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      set((st) => ({ teachers: st.teachers.map((t) => (t.id === id ? updated : t)) }));
    } catch (e) {
      reportError(e);
    }
  },
  deleteTeacher: async (id) => {
    try {
      await api(`/api/teachers/${encodeURIComponent(id)}`, { method: "DELETE" });
      set((st) => ({
        teachers: st.teachers.filter((t) => t.id !== id),
        classes: st.classes.map((c) => (c.classTeacherId === id ? { ...c, classTeacherId: "" } : c)),
      }));
    } catch (e) {
      reportError(e);
    }
  },

  // ── Classes ───────────────────────────────────────────────────────────────
  addClass: async (c) => {
    try {
      const created = await api<SchoolClass>("/api/classes", { method: "POST", body: JSON.stringify(c) });
      set((st) => ({ classes: [...st.classes, created] }));
    } catch (e) {
      reportError(e);
    }
  },
  updateClass: async (id, patch) => {
    try {
      const updated = await api<SchoolClass>(`/api/classes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      set((st) => ({ classes: st.classes.map((c) => (c.id === id ? updated : c)) }));
    } catch (e) {
      reportError(e);
    }
  },
  deleteClass: async (id) => {
    try {
      await api(`/api/classes/${encodeURIComponent(id)}`, { method: "DELETE" });
      set((st) => ({
        classes: st.classes.filter((c) => c.id !== id),
        students: st.students.map((s) =>
          s.classId === id ? { ...s, status: "Inactive" as const, classId: "" } : s
        ),
        timetable: st.timetable.filter((t) => t.classId !== id),
      }));
    } catch (e) {
      reportError(e);
    }
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  saveAttendance: async (records) => {
    try {
      const saved = await api<AttendanceRecord[]>("/api/attendance", {
        method: "POST",
        body: JSON.stringify({ records }),
      });
      set((st) => {
        const keys = new Set(saved.map((r) => `${r.studentId}|${r.date}`));
        const others = st.attendance.filter((a) => !keys.has(`${a.studentId}|${a.date}`));
        return { attendance: [...others, ...saved] };
      });
    } catch (e) {
      reportError(e);
    }
  },

  // ── Fees ──────────────────────────────────────────────────────────────────
  addChallan: async (c) => {
    try {
      const created = await api<FeeChallan>("/api/fees/challans", { method: "POST", body: JSON.stringify(c) });
      set((st) => ({ challans: [created, ...st.challans] }));
    } catch (e) {
      reportError(e);
    }
  },
  payChallan: async (id, amount) => {
    try {
      const updated = await api<FeeChallan>(`/api/fees/challans/${encodeURIComponent(id)}/pay`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      set((st) => ({ challans: st.challans.map((c) => (c.id === id ? updated : c)) }));
    } catch (e) {
      reportError(e);
    }
  },
  deleteChallan: async (id) => {
    try {
      await api(`/api/fees/challans/${encodeURIComponent(id)}`, { method: "DELETE" });
      set((st) => ({ challans: st.challans.filter((c) => c.id !== id) }));
    } catch (e) {
      reportError(e);
    }
  },
  generateMonthlyChallans: async (month) => {
    try {
      const res = await api<{ count: number; challans: FeeChallan[] }>("/api/fees/generate", {
        method: "POST",
        body: JSON.stringify({ month }),
      });
      if (res.challans.length > 0) {
        set((st) => ({ challans: [...res.challans, ...st.challans] }));
      }
      return res.count;
    } catch (e) {
      reportError(e);
      return 0;
    }
  },

  // ── Exams & marks ─────────────────────────────────────────────────────────
  addExam: async (e) => {
    try {
      const created = await api<Exam>("/api/exams", { method: "POST", body: JSON.stringify(e) });
      set((st) => ({ exams: [...st.exams, created] }));
    } catch (err) {
      reportError(err);
    }
  },
  updateExam: async (id, patch) => {
    try {
      const updated = await api<Exam>(`/api/exams/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      set((st) => ({ exams: st.exams.map((x) => (x.id === id ? updated : x)) }));
    } catch (err) {
      reportError(err);
    }
  },
  deleteExam: async (id) => {
    try {
      await api(`/api/exams/${encodeURIComponent(id)}`, { method: "DELETE" });
      set((st) => ({
        exams: st.exams.filter((e) => e.id !== id),
        marks: st.marks.filter((m) => m.examId !== id),
      }));
    } catch (err) {
      reportError(err);
    }
  },
  saveMark: async (examId, studentId, subject, totalMarks, obtainedMarks) => {
    try {
      const saved = await api<ExamMark>("/api/marks", {
        method: "POST",
        body: JSON.stringify({ examId, studentId, subject, totalMarks, obtainedMarks }),
      });
      set((st) => {
        const exists = st.marks.some((m) => m.id === saved.id);
        return {
          marks: exists
            ? st.marks.map((m) => (m.id === saved.id ? saved : m))
            : [...st.marks, saved],
        };
      });
    } catch (err) {
      reportError(err);
    }
  },

  // ── Timetable ─────────────────────────────────────────────────────────────
  addSlot: async (s) => {
    try {
      const created = await api<TimetableSlot>("/api/timetable", { method: "POST", body: JSON.stringify(s) });
      set((st) => ({ timetable: [...st.timetable, created] }));
    } catch (e) {
      reportError(e);
    }
  },
  deleteSlot: async (id) => {
    try {
      await api(`/api/timetable/${encodeURIComponent(id)}`, { method: "DELETE" });
      set((st) => ({ timetable: st.timetable.filter((t) => t.id !== id) }));
    } catch (e) {
      reportError(e);
    }
  },

  // ── Notices ───────────────────────────────────────────────────────────────
  addNotice: async (n) => {
    try {
      const created = await api<Notice>("/api/notices", { method: "POST", body: JSON.stringify(n) });
      set((st) => ({ notices: [created, ...st.notices] }));
    } catch (e) {
      reportError(e);
    }
  },
  deleteNotice: async (id) => {
    try {
      await api(`/api/notices/${encodeURIComponent(id)}`, { method: "DELETE" });
      set((st) => ({ notices: st.notices.filter((n) => n.id !== id) }));
    } catch (e) {
      reportError(e);
    }
  },

  // ── Expenses ──────────────────────────────────────────────────────────────
  addExpense: async (e) => {
    try {
      const created = await api<Expense>("/api/expenses", { method: "POST", body: JSON.stringify(e) });
      set((st) => ({ expenses: [created, ...st.expenses] }));
    } catch (err) {
      reportError(err);
    }
  },
  deleteExpense: async (id) => {
    try {
      await api(`/api/expenses/${encodeURIComponent(id)}`, { method: "DELETE" });
      set((st) => ({ expenses: st.expenses.filter((e) => e.id !== id) }));
    } catch (err) {
      reportError(err);
    }
  },

  // ── Profile & reset ───────────────────────────────────────────────────────
  updateProfile: async (p) => {
    set((st) => ({ profile: { ...st.profile, ...p } }));
    try {
      const updated = await api<SchoolProfile>("/api/settings", {
        method: "PUT",
        body: JSON.stringify(p),
      });
      if (updated) set({ profile: updated });
    } catch (e) {
      reportError(e);
    }
  },
  resetAllData: async () => {
    try {
      const data = await api<BootstrapData>("/api/admin/reset", { method: "POST" });
      set({
        profile: data.profile ?? DEFAULT_PROFILE,
        students: data.students,
        teachers: data.teachers,
        classes: data.classes,
        attendance: data.attendance,
        challans: data.challans,
        exams: data.exams,
        marks: data.marks,
        timetable: data.timetable,
        notices: data.notices,
        expenses: data.expenses,
        loaded: true,
      });
    } catch (e) {
      reportError(e);
    }
  },
}));

// Selector helpers
export const useStudents = () => useSchoolStore((s) => s.students);
export const useTeachers = () => useSchoolStore((s) => s.teachers);
export const useClasses = () => useSchoolStore((s) => s.classes);
