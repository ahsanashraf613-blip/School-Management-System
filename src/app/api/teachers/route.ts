import { db } from "@/lib/db";
import { bad, fail, genId, ok, readJson } from "@/lib/server/http";
import type { Teacher } from "@/lib/types";

type TeacherInput = Omit<Teacher, "id">;

// POST /api/teachers — hire a new teacher
export async function POST(req: Request) {
  try {
    const body = await readJson<TeacherInput>(req);
    if (!body.name?.trim()) return bad("Teacher name is required");
    const created = await db.teacher.create({
      data: {
        id: genId("tch"),
        employeeNo: body.employeeNo ?? `EMP-${Date.now().toString().slice(-4)}`,
        name: body.name,
        gender: body.gender,
        subject: body.subject,
        phone: body.phone ?? "",
        email: body.email ?? "",
        qualification: body.qualification ?? "",
        joinDate: body.joinDate ?? "",
        salary: Number(body.salary) || 0,
        status: body.status ?? "Active",
      },
    });
    return ok(created, 201);
  } catch (e) {
    return fail(e);
  }
}
