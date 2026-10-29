import { db } from "@/lib/db";
import { bad, fail, ok } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/timetable/:id — remove a period slot
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await db.timetableSlot.findUnique({ where: { id } });
    if (!existing) return bad("Slot not found", 404);
    await db.timetableSlot.delete({ where: { id } });
    return ok({ deleted: id });
  } catch (e) {
    return fail(e);
  }
}
