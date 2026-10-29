import { db } from "@/lib/db";
import { bad, fail, genId, ok, readJson } from "@/lib/server/http";
import { mapStudent } from "@/lib/server/mappers";
import type { Student } from "@/lib/types";

type StudentInput = Omit<Student, "id">;

const toRow = (s: StudentInput) => ({
  admissionNo: s.admissionNo,
  name: s.name,
  fatherName: s.fatherName,
  gender: s.gender,
  classId: s.classId || null,
  section: s.section,
  rollNo: Number(s.rollNo) || 1,
  dob: s.dob ?? "",
  phone: s.phone ?? "",
  address: s.address ?? "",
  admissionDate: s.admissionDate ?? "",
  status: s.status,
  bloodGroup: s.bloodGroup ?? "",
  monthlyFee: Number(s.monthlyFee) || 0,
});

// GET /api/students — list all students
export async function GET() {
  try {
    const students = await db.student.findMany();
    return ok(students.map(mapStudent));
  } catch (e) {
    return fail(e);
  }
}

// POST /api/students — admit a new student
export async function POST(req: Request) {
  try {
    const body = await readJson<StudentInput>(req);
    if (!body.name?.trim()) return bad("Student name is required");
    const created = await db.student.create({
      data: { id: genId("std"), ...toRow(body) },
    });
    return ok(mapStudent(created), 201);
  } catch (e) {
    return fail(e);
  }
}
