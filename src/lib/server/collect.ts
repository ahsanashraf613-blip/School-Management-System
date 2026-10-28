import { db } from "@/lib/db";
import {
  mapAttendance,
  mapChallan,
  mapClass,
  mapExpense,
  mapExam,
  mapMark,
  mapNotice,
  mapProfile,
  mapSlot,
  mapStudent,
} from "./mappers";
import type { SchoolProfile } from "@/lib/types";

// Aggregates every table into the single payload the SPA boots from.
export async function collectBootstrap() {
  const [profileRow, students, teachers, classes, attendance, challans, exams, marks, timetable, notices, expenses] =
    await Promise.all([
      db.schoolProfile.findFirst(),
      db.student.findMany(),
      db.teacher.findMany(),
      db.schoolClass.findMany({ orderBy: { level: "asc" } }),
      db.attendanceRecord.findMany(),
      db.feeChallan.findMany(),
      db.exam.findMany(),
      db.examMark.findMany(),
      db.timetableSlot.findMany(),
      db.notice.findMany({ orderBy: [{ date: "desc" }] }),
      db.expense.findMany({ orderBy: [{ date: "desc" }] }),
    ]);

  return {
    profile: profileRow ? mapProfile(profileRow) : (null as SchoolProfile | null),
    students: students.map(mapStudent),
    teachers,
    classes: classes.map(mapClass),
    attendance: attendance.map(mapAttendance),
    challans: challans.map(mapChallan),
    exams: exams.map(mapExam),
    marks: marks.map(mapMark),
    timetable: timetable.map(mapSlot),
    notices: notices.map(mapNotice),
    expenses: expenses.map(mapExpense),
  };
}
