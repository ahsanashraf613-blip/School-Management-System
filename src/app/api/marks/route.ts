import { db } from "@/lib/db";
import { bad, fail, ok, readJson } from "@/lib/server/http";
import { mapMark } from "@/lib/server/mappers";

// POST /api/marks — upsert a single (exam, student, subject) mark
export async function POST(req: Request) {
  try {
    const body = await readJson<{
      examId: string;
      studentId: string;
      subject: string;
      totalMarks: number;
      obtainedMarks: number;
    }>(req);
    const { examId, studentId, subject } = body;
    if (!examId || !studentId || !subject) {
      return bad("examId, studentId and subject are required");
    }

    const totalMarks = Number(body.totalMarks) || 0;
    const obtainedMarks = Math.max(0, Number(body.obtainedMarks) || 0);
    const id = `${examId}:${studentId}:${subject}`;

    const mark = await db.examMark.upsert({
      where: { id },
      update: { totalMarks, obtainedMarks },
      create: { id, examId, studentId, subject, totalMarks, obtainedMarks },
    });
    return ok(mapMark(mark));
  } catch (e) {
    return fail(e);
  }
}
