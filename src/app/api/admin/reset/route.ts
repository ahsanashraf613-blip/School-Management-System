import { db } from "@/lib/db";
import { fail, ok } from "@/lib/server/http";
import { collectBootstrap } from "@/lib/server/collect";
import { seedDatabase } from "@/lib/server/seed";

// POST /api/admin/reset — wipe & re-seed the database with fresh demo data,
// then return the full dataset so the client can swap it in directly.
export async function POST() {
  try {
    const counts = await seedDatabase(db);
    const data = await collectBootstrap();
    return ok({ ...data, counts });
  } catch (e) {
    return fail(e);
  }
}
