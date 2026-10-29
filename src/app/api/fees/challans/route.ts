import { db } from "@/lib/db";
import { bad, fail, genId, ok, readJson } from "@/lib/server/http";
import { challanToRow, mapChallan } from "@/lib/server/mappers";
import type { FeeChallan } from "@/lib/types";

// POST /api/fees/challans — create a single fee challan
export async function POST(req: Request) {
  try {
    const body = await readJson<Omit<FeeChallan, "id">>(req);
    if (!body.studentId) return bad("studentId is required");
    const created = await db.feeChallan.create({
      data: {
        ...challanToRow({ ...body, id: "" } as FeeChallan),
        id: genId("chl"),
      },
    });
    return ok(mapChallan(created), 201);
  } catch (e) {
    return fail(e);
  }
}
