import { db } from "@/lib/db";
import { bad, fail, ok } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/fees/challans/:id — void a challan
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await db.feeChallan.findUnique({ where: { id } });
    if (!existing) return bad("Challan not found", 404);
    await db.feeChallan.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return fail(e);
  }
}
