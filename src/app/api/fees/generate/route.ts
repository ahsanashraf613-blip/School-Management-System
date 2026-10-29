import { db } from "@/lib/db";
import { bad, fail, genId, ok, readJson } from "@/lib/server/http";
import { mapChallan } from "@/lib/server/mappers";

// POST /api/fees/generate — generate monthly challans for every Active student
// that doesn't have one for the given month. Returns the created challans.
export async function POST(req: Request) {
  try {
    const { month } = await readJson<{ month: string }>(req);
    if (!/^\d{4}-\d{2}$/.test(month)) return bad("month must be in YYYY-MM format");

    const [active, existing] = await Promise.all([
      db.student.findMany({ where: { status: "Active" } }),
      db.feeChallan.findMany({ where: { month }, select: { studentId: true } }),
    ]);

    const hasChallan = new Set(existing.map((e) => e.studentId));
    const toCreate = active.filter((s) => !hasChallan.has(s.id));
    if (toCreate.length === 0) return ok({ count: 0, challans: [] });

    const dueDate = `${month}-10`;
    const rows = toCreate.map((s) => ({
      id: genId("chl"),
      challanNo: `CH-${month.replace("-", "")}-${s.id.replace("std-", "").padStart(4, "0")}`,
      studentId: s.id,
      month,
      tuitionFee: s.monthlyFee,
      otherCharges: 0,
      discount: 0,
      total: s.monthlyFee,
      dueDate,
      status: "Pending",
      paidDate: null,
      paidAmount: null,
    }));

    await db.feeChallan.createMany({ data: rows });
    const created = await db.feeChallan.findMany({
      where: { month, studentId: { in: toCreate.map((s) => s.id) } },
    });
    return ok({ count: created.length, challans: created.map(mapChallan) }, 201);
  } catch (e) {
    return fail(e);
  }
}
