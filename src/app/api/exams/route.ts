import { db } from "@/lib/db";
import { bad, fail, genId, ok, readJson } from "@/lib/server/http";
import { mapExam } from "@/lib/server/mappers";
import type { Exam } from "@/lib/types";

// POST /api/exams — schedule a new exam
export async function POST(req: Request) {
  try {
    const body = await readJson<Omit<Exam, "id">>(req);
    if (!body.name?.trim()) return bad("Exam name is required");
    const created = await db.exam.create({
      data: {
        id: genId("exm"),
        name: body.name,
        term: body.term ?? "",
        startDate: body.startDate ?? "",
        endDate: body.endDate ?? "",
        classId: body.classId ?? "all",
        status: body.status ?? "Upcoming",
      },
    });
    return ok(mapExam(created), 201);
  } catch (e) {
    return fail(e);
  }
}
