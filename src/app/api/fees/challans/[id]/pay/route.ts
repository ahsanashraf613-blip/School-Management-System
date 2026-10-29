import { db } from "@/lib/db";
import { bad, fail, ok, readJson } from "@/lib/server/http";
import { mapChallan } from "@/lib/server/mappers";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/fees/challans/:id/pay — record a (partial or full) payment.
// Business logic lives here, on the server: the client just sends an amount.
export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { amount } = await readJson<{ amount: number }>(req);

    const challan = await db.feeChallan.findUnique({ where: { id } });
    if (!challan) return bad("Challan not found", 404);

    const already = challan.paidAmount ?? (challan.status === "Paid" ? challan.total : 0);
    const paid = Math.min(challan.total, already + Math.max(0, Number(amount) || 0));
    const fullyPaid = paid >= challan.total;

    const updated = await db.feeChallan.update({
      where: { id },
      data: {
        paidAmount: paid,
        status: fullyPaid ? "Paid" : "Partial",
        paidDate: fullyPaid
          ? challan.paidDate ?? new Date().toISOString().slice(0, 10)
          : challan.paidDate,
      },
    });
    return ok(mapChallan(updated));
  } catch (e) {
    return fail(e);
  }
}
