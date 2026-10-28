import { db } from "@/lib/db";
import { bad, fail, ok } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/notices/:id — remove a notice
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await db.notice.findUnique({ where: { id } });
    if (!existing) return bad("Notice not found", 404);
    await db.notice.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return fail(e);
  }
}
