import { db } from "@/lib/db";
import { bad, fail, genId, ok, readJson } from "@/lib/server/http";
import { classToRow, mapClass } from "@/lib/server/mappers";
import type { SchoolClass } from "@/lib/types";

// GET /api/classes — list all classes
export async function GET() {
  try {
    const classes = await db.schoolClass.findMany({ orderBy: { level: "asc" } });
    return ok(classes.map(mapClass));
  } catch (e) {
    return fail(e);
  }
}

// POST /api/classes — create a class
export async function POST(req: Request) {
  try {
    const body = await readJson<Omit<SchoolClass, "id">>(req);
    if (!body.name?.trim()) return bad("Class name is required");
    const created = await db.schoolClass.create({
      data: { ...classToRow({ ...body, id: "" } as SchoolClass), id: genId("cls") },
    });
    return ok(mapClass(created), 201);
  } catch (e) {
    return fail(e);
  }
}
