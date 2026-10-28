import { db } from "@/lib/db";
import { bad, fail, ok, readJson } from "@/lib/server/http";
import { mapExam } from "@/lib/server/mappers";
import type { Exam } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/exams/:id — update exam details / status
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await readJson<Partial<Exam>>(req);
    const existing = await db.exam.findUnique({ where: { id } });
    if (!existing) return bad("Exam not found", 404);

    const data: Record<string, unknown> = {};
    for (const f of ["name", "term", "startDate", "endDate", "classId", "status"] as const) {
      if (body[f] !== undefined) data[f] = String(body[f]);
    }

    const updated = await db.exam.update({ where: { id }, data });
    return ok(mapExam(updated));
  } catch (e) {
    return fail(e);
  }
}

// DELETE /api/exams/:id — delete an exam (cascades its marks)
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await db.exam.findUnique({ where: { id } });
    if (!existing) return bad("Exam not found", 404);
    await db.exam.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return fail(e);
  }
}
