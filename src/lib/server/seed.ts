import type { PrismaClient } from "@prisma/client";
import { buildSeedData } from "../mock-data";
import { challanToRow, classToRow } from "./mappers";

// Wipes all tables and re-inserts the deterministic demo dataset.
// Takes a PrismaClient so both the CLI seed script and the
// /api/admin/reset route can share the exact same logic.
export async function seedDatabase(client: PrismaClient) {
  const seed = buildSeedData();

  // Delete children before parents (respecting FKs).
  await client.examMark.deleteMany();
  await client.exam.deleteMany();
  await client.attendanceRecord.deleteMany();
  await client.feeChallan.deleteMany();
  await client.timetableSlot.deleteMany();
  await client.student.deleteMany();
  await client.schoolClass.deleteMany();
  await client.teacher.deleteMany();
  await client.notice.deleteMany();
  await client.expense.deleteMany();
  await client.schoolProfile.deleteMany();

  await client.schoolProfile.create({ data: seed.profile });
  await client.teacher.createMany({ data: seed.teachers });
  await client.schoolClass.createMany({ data: seed.classes.map(classToRow) });
  await client.student.createMany({ data: seed.students });
  await client.attendanceRecord.createMany({ data: seed.attendance });
  await client.feeChallan.createMany({ data: seed.challans.map(challanToRow) });
  await client.exam.createMany({ data: seed.exams });
  await client.examMark.createMany({ data: seed.marks });
  await client.timetableSlot.createMany({
    data: seed.timetable.map((t) => ({ ...t, teacherId: t.teacherId || null })),
  });
  await client.notice.createMany({ data: seed.notices });
  await client.expense.createMany({ data: seed.expenses });

  return {
    teachers: seed.teachers.length,
    classes: seed.classes.length,
    students: seed.students.length,
    attendance: seed.attendance.length,
    challans: seed.challans.length,
    exams: seed.exams.length,
    marks: seed.marks.length,
    timetable: seed.timetable.length,
    notices: seed.notices.length,
    expenses: seed.expenses.length,
  };
}
