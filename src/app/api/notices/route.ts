import { db } from "@/lib/db";
import { bad, fail, genId, ok, readJson } from "@/lib/server/http";
import { mapNotice } from "@/lib/server/mappers";
import type { Notice } from "@/lib/types";

// POST /api/notices — publish a notice
export async function POST(req: Request) {
  try {
    const body = await readJson<Omit<Notice, "id">>(req);
    if (!body.title?.trim()) return bad("Notice title is required");
    const created = await db.notice.create({
      data: {
        id: genId("ntc"),
        title: body.title,
        content: body.content ?? "",
        date: body.date || new Date().toISOString().slice(0, 10),
        priority: body.priority ?? "Normal",
        audience: body.audience ?? "All",
      },
    });
    return ok(mapNotice(created), 201);
  } catch (e) {
    return fail(e);
  }
}
