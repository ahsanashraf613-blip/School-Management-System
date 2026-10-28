import type {
  AttendanceRecord,
  AttendanceStatus,
  Exam,
  ExamMark,
  Expense,
  FeeChallan,
  FeeStatus,
  Gender,
  Notice,
  NoticePriority,
  SchoolClass,
  SchoolProfile,
  Student,
  TimetableSlot,
  WeekDay,
} from "../types";

// ── DB row → frontend type mappers ─────────────────────────────────────────
// SQLite (via Prisma) has no array type, so sections/subjects live as JSON
// strings; nullable FKs map to "" to match the frontend's expected shape.

type ClassRow = {
  id: string;
  name: string;
  level: number;
  sectionsJson: string;
  classTeacherId: string | null;
  monthlyFee: number;
  subjectsJson: string;
  roomNo: string;
};

const parseJsonArray = (s: string): string[] => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
};

export const mapClass = (c: ClassRow): SchoolClass => ({
  id: c.id,
  name: c.name,
  level: c.level,
  sections: parseJsonArray(c.sectionsJson),
  classTeacherId: c.classTeacherId ?? "",
  monthlyFee: c.monthlyFee,
  subjects: parseJsonArray(c.subjectsJson),
  roomNo: c.roomNo,
});

type StudentRow = Omit<Student, "classId"> & { classId: string | null };

export const mapStudent = (s: StudentRow): Student => ({
  ...s,
  classId: s.classId ?? "",
  gender: s.gender as Gender,
  status: s.status as Student["status"],
});

type ChallanRow = Omit<FeeChallan, "paidDate" | "paidAmount"> & {
  paidDate: string | null;
  paidAmount: number | null;
};

export const mapChallan = (c: ChallanRow): FeeChallan => ({
  ...c,
  status: c.status as FeeStatus,
  paidDate: c.paidDate ?? undefined,
  paidAmount: c.paidAmount ?? undefined,
});

export const mapAttendance = (a: {
  studentId: string;
  classId: string;
  date: string;
  status: string;
}): AttendanceRecord => ({
  studentId: a.studentId,
  classId: a.classId,
  date: a.date,
  status: a.status as AttendanceStatus,
});

export const mapExam = (e: Exam): Exam => ({ ...e });

export const mapMark = (m: {
  id: string;
  examId: string;
  studentId: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
}): ExamMark => ({ ...m });

type SlotRow = Omit<TimetableSlot, "teacherId"> & { teacherId: string | null };

export const mapSlot = (t: SlotRow): TimetableSlot => ({
  ...t,
  day: t.day as WeekDay,
  teacherId: t.teacherId ?? "",
});

export const mapNotice = (n: Notice): Notice => ({
  ...n,
  priority: n.priority as NoticePriority,
});

export const mapExpense = (e: Expense): Expense => ({ ...e });

export const mapProfile = (p: SchoolProfile): SchoolProfile => ({ ...p });

// ── frontend type → DB data (inverse helpers) ──────────────────────────────

export const classToRow = (c: SchoolClass) => ({
  id: c.id,
  name: c.name,
  level: c.level,
  sectionsJson: JSON.stringify(c.sections),
  classTeacherId: c.classTeacherId || null,
  monthlyFee: c.monthlyFee,
  subjectsJson: JSON.stringify(c.subjects),
  roomNo: c.roomNo,
});

export const challanToRow = (c: FeeChallan) => ({
  id: c.id,
  challanNo: c.challanNo,
  studentId: c.studentId,
  month: c.month,
  tuitionFee: c.tuitionFee,
  otherCharges: c.otherCharges,
  discount: c.discount,
  total: c.total,
  dueDate: c.dueDate,
  status: c.status,
  paidDate: c.paidDate ?? null,
  paidAmount: c.paidAmount ?? null,
});
