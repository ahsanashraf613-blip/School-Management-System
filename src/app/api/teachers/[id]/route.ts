import { db } from "@/lib/db";
import { bad, fail, ok, readJson } from "@/lib/server/http";
import type { Teacher } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/teachers/:id — update a teacher record
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await readJson<Partial<Teacher>>(req);
    const existing = await db.teacher.findUnique({ where: { id } });
    if (!existing) return bad("Teacher not found", 404);

    const data: Record<string, unknown> = {};
    for (const f of ["employeeNo", "name", "gender", "subject", "phone", "email", "qualification", "joinDate", "status"] as const) {
      if (body[f] !== undefined) data[f] = String(body[f]);
    }
    if (body.salary !== undefined) data.salary = Number(body.salary) || 0;

    const updated = await db.teacher.update({ where: { id }, data });
    return ok(updated);
  } catch (e) {
    return fail(e);
  }
}

// DELETE /api/teachers/:id — remove a teacher (class-teacher FKs are set null)
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await db.teacher.findUnique({ where: { id } });
    if (!existing) return bad("Teacher not found", 404);
    await db.teacher.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return fail(e);
  }
}
