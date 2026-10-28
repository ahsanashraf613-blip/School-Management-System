import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/server/http";
import { mapProfile } from "@/lib/server/mappers";
import type { SchoolProfile } from "@/lib/types";

// GET /api/settings — school profile
export async function GET() {
  try {
    const row = await db.schoolProfile.findFirst();
    return ok(row ? mapProfile(row) : null);
  } catch (e) {
    return fail(e);
  }
}

// PUT /api/settings — update the school profile
export async function PUT(req: Request) {
  try {
    const body = await readJson<Partial<SchoolProfile>>(req);
    const row = await db.schoolProfile.findFirst();
    if (!row) return ok(null);

    const data: Record<string, unknown> = {};
    for (const f of ["name", "tagline", "address", "phone", "email", "session", "principal"] as const) {
      if (body[f] !== undefined) data[f] = String(body[f]);
    }

    const updated = await db.schoolProfile.update({ where: { id: row.id }, data });
    return ok(mapProfile(updated));
  } catch (e) {
    return fail(e);
  }
}
