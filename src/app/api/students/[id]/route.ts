import { db } from "@/lib/db";
import { bad, fail, ok, readJson } from "@/lib/server/http";
import { mapStudent } from "@/lib/server/mappers";
import type { Student } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/students/:id — update a student record
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await readJson<Partial<Student>>(req);
    const existing = await db.student.findUnique({ where: { id } });
    if (!existing) return bad("Student not found", 404);

    const data: Record<string, unknown> = {};
    const strFields = [
      "admissionNo", "name", "fatherName", "gender", "section", "dob",
      "phone", "address", "admissionDate", "status", "bloodGroup",
    ] as const;
    for (const f of strFields) {
      if (body[f] !== undefined) data[f] = String(body[f]);
    }
    if (body.classId !== undefined) data.classId = body.classId || null;
    if (body.rollNo !== undefined) data.rollNo = Number(body.rollNo) || 1;
    if (body.monthlyFee !== undefined) data.monthlyFee = Number(body.monthlyFee) || 0;

    const updated = await db.student.update({ where: { id }, data });
    return ok(mapStudent(updated));
  } catch (e) {
    return fail(e);
  }
}

// DELETE /api/students/:id — remove a student (cascades attendance, challans, marks)
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await db.student.findUnique({ where: { id } });
    if (!existing) return bad("Student not found", 404);
    await db.student.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return fail(e);
  }
}
