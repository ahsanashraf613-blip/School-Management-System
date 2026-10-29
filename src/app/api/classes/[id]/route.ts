import { db } from "@/lib/db";
import { bad, fail, ok, readJson } from "@/lib/server/http";
import { mapClass } from "@/lib/server/mappers";
import type { SchoolClass } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/classes/:id — update a class
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await readJson<Partial<SchoolClass>>(req);
    const existing = await db.schoolClass.findUnique({ where: { id } });
    if (!existing) return bad("Class not found", 404);

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name);
    if (body.level !== undefined) data.level = Number(body.level) || 1;
    if (body.sections !== undefined) data.sectionsJson = JSON.stringify(body.sections);
    if (body.subjects !== undefined) data.subjectsJson = JSON.stringify(body.subjects);
    if (body.classTeacherId !== undefined) data.classTeacherId = body.classTeacherId || null;
    if (body.monthlyFee !== undefined) data.monthlyFee = Number(body.monthlyFee) || 0;
    if (body.roomNo !== undefined) data.roomNo = String(body.roomNo);

    const updated = await db.schoolClass.update({ where: { id }, data });
    return ok(mapClass(updated));
  } catch (e) {
    return fail(e);
  }
}

// DELETE /api/classes/:id — remove a class; its students become Inactive & unassigned
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await db.schoolClass.findUnique({ where: { id } });
    if (!existing) return bad("Class not found", 404);

    await db.student.updateMany({
      where: { classId: id },
      data: { status: "Inactive" },
    });
    await db.schoolClass.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return fail(e);
  }
}
