import { db } from "@/lib/db";
import { bad, fail, genId, ok, readJson } from "@/lib/server/http";
import { mapExpense } from "@/lib/server/mappers";
import type { Expense } from "@/lib/types";

// POST /api/expenses — record an expense
export async function POST(req: Request) {
  try {
    const body = await readJson<Omit<Expense, "id">>(req);
    if (!body.title?.trim()) return bad("Expense title is required");
    const created = await db.expense.create({
      data: {
        id: genId("exp"),
        title: body.title,
        category: body.category ?? "Other",
        amount: Number(body.amount) || 0,
        date: body.date || new Date().toISOString().slice(0, 10),
        paidTo: body.paidTo ?? "",
        paymentMethod: body.paymentMethod ?? "Cash",
      },
    });
    return ok(mapExpense(created), 201);
  } catch (e) {
    return fail(e);
  }
}
