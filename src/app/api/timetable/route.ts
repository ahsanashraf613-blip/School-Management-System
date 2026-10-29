import { db } from "@/lib/db";
import { bad, fail, genId, ok, readJson } from "@/lib/server/http";
import { mapSlot } from "@/lib/server/mappers";
import type { TimetableSlot } from "@/lib/types";

// POST /api/timetable — add a period slot
export async function POST(req: Request) {
  try {
    const body = await readJson<Omit<TimetableSlot, "id">>(req);
    if (!body.classId || !body.day) return bad("classId and day are required");
    const created = await db.timetableSlot.create({
      data: {
        id: genId("slt"),
        classId: body.classId,
        section: body.section ?? "A",
        day: body.day,
        period: Number(body.period) || 1,
        startTime: body.startTime ?? "",
        endTime: body.endTime ?? "",
        subject: body.subject ?? "",
        teacherId: body.teacherId || null,
      },
    });
    return ok(mapSlot(created), 201);
  } catch (e) {
    return fail(e);
  }
}
