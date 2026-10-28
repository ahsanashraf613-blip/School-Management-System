import { db } from "@/lib/db";
import { bad, fail, ok, readJson } from "@/lib/server/http";
import { mapAttendance } from "@/lib/server/mappers";
import type { AttendanceRecord } from "@/lib/types";

// POST /api/attendance — bulk-save attendance for one date (upsert per student)
export async function POST(req: Request) {
  try {
    const { records } = await readJson<{ records: AttendanceRecord[] }>(req);
    if (!Array.isArray(records) || records.length === 0) {
      return bad("records array is required");
    }

    const dates = [...new Set(records.map((r) => r.date))];
    const studentIds = [...new Set(records.map((r) => r.studentId))];

    await db.$transaction(async (tx) => {
      // Replace existing entries per (date, students-of-that-date) pair set.
      for (const date of dates) {
        const ids = records.filter((r) => r.date === date).map((r) => r.studentId);
        await tx.attendanceRecord.deleteMany({ where: { date, studentId: { in: ids } } });
      }
      await tx.attendanceRecord.createMany({
        data: records.map((r) => ({
          studentId: r.studentId,
          classId: r.classId,
          date: r.date,
          status: r.status,
        })),
      });
    });

    const saved = await db.attendanceRecord.findMany({
      where: { date: { in: dates }, studentId: { in: studentIds } },
    });
    return ok(saved.map(mapAttendance));
  } catch (e) {
    return fail(e);
  }
}
