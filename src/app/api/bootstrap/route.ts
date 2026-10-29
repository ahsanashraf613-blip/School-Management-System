import { db } from "@/lib/db";
import { fail, ok } from "@/lib/server/http";
import { collectBootstrap } from "@/lib/server/collect";
import { seedDatabase } from "@/lib/server/seed";

// GET /api/bootstrap — everything the SPA needs in one round-trip.
// Auto-seeds the database on first run (when the profile table is empty).
export async function GET() {
  try {
    const profileRow = await db.schoolProfile.findFirst();
    if (!profileRow) {
      await seedDatabase(db);
    }
    return ok(await collectBootstrap());
  } catch (e) {
    return fail(e);
  }
}
