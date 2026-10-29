import { db } from "@/lib/db";
import { bad, fail, ok, readJson } from "@/lib/server/http";
import { mapStudent } from "@/lib/server/mappers";

// POST /api/students/promote — move all Active students from one class to another
export async function POST(req: Request) {
  try {
    const { fromClassId, toClassId } = await readJson<{ fromClassId: string; toClassId: string }>(req);
    if (!fromClassId || !toClassId) return bad("fromClassId and toClassId are required");
    if (fromClassId === toClassId) return ok({ moved: 0, students: [] });

    const targets = await db.student.findMany({
      where: { classId: fromClassId, status: "Active" },
      select: { id: true },
    });
    if (targets.length === 0) return ok({ moved: 0, students: [] });

    await db.student.updateMany({
      where: { id: { in: targets.map((t) => t.id) } },
      data: { classId: toClassId },
    });
    const updated = await db.student.findMany({ where: { id: { in: targets.map((t) => t.id) } } });
    return ok({ moved: updated.length, students: updated.map(mapStudent) });
  } catch (e) {
    return fail(e);
  }
}
