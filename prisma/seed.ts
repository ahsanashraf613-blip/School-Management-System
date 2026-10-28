// Seed the SkoolyPro SQLite database with deterministic demo data.
// Run with: bun prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/server/seed";

const prisma = new PrismaClient();

async function main() {
  const counts = await seedDatabase(prisma);
  console.log("✔ Database seeded:", counts);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
