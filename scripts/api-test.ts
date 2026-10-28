// End-to-end API smoke test for SkoolyPro backend
const BASE = "http://localhost:3000/api";
let pass = 0, failCount = 0;

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
};

const check = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`✔ ${name}`); }
  else { failCount++; console.log(`✘ ${name} ${extra}`); }
};

(async () => {
  // 1. Bootstrap
  const boot = await req("GET", "/bootstrap");
  check("bootstrap 200", boot.status === 200);
  check("bootstrap shape", !!boot.json.students?.length && !!boot.json.classes?.length && !!boot.json.profile);
  const studentCount0 = boot.json.students.length;
  const firstClass = boot.json.classes[0];

  // 2. Student create
  const created = await req("POST", "/students", {
    admissionNo: "ADM-TEST-999", name: "Test Student", fatherName: "Test Father",
    gender: "Male", classId: firstClass.id, section: firstClass.sections[0], rollNo: 99,
    dob: "2015-01-01", phone: "0300-0000000", address: "Test Address, Lahore",
    admissionDate: "2026-10-28", status: "Active", bloodGroup: "O+", monthlyFee: 2000,
  });
  check("student create 201", created.status === 201 && created.json.id?.startsWith("std-"));
  const testId = created.json.id;

  // 3. Student update
  const updated = await req("PUT", `/students/${testId}`, { name: "Test Student Updated", monthlyFee: 2500 });
  check("student update", updated.status === 200 && updated.json.name === "Test Student Updated" && updated.json.monthlyFee === 2500);

  // 4. Fee challan generate for a new month
  const gen = await req("POST", "/fees/generate", { month: "2026-11" });
  check("generate challans", gen.status === 201 && gen.json.count > 0, `count=${gen.json.count}`);
  const myChallan = gen.json.challans.find((c) => c.studentId === testId);
  check("challan for new student", !!myChallan);

  // 5. Pay challan (partial then full)
  if (myChallan) {
    const p1 = await req("POST", `/fees/challans/${myChallan.id}/pay`, { amount: 500 });
    check("partial pay", p1.json.status === "Partial" && p1.json.paidAmount === 500);
    const p2 = await req("POST", `/fees/challans/${myChallan.id}/pay`, { amount: 99999 });
    check("full pay caps at total", p2.json.status === "Paid" && p2.json.paidAmount === p2.json.total && !!p2.json.paidDate);
  }

  // 6. Attendance bulk upsert
  const students = (await req("GET", "/students")).json;
  const sample = students.slice(0, 3).map((s) => ({
    studentId: s.id, classId: s.classId, date: "2026-10-27",
    status: s.id === students[0].id ? "absent" : "present",
  }));
  const att1 = await req("POST", "/attendance", { records: sample });
  check("attendance save", att1.status === 200 && att1.json.length === 3);
  const att2 = await req("POST", "/attendance", { records: sample.map((r) => ({ ...r, status: "present" })) });
  check("attendance upsert (no dupes)", att2.status === 200 && att2.json.length === 3);

  // 7. Marks upsert
  const exams = (await req("GET", "/bootstrap")).json.exams;
  const completed = exams.find((e) => e.status === "Completed");
  const mark1 = await req("POST", "/marks", { examId: completed.id, studentId: testId, subject: "English", totalMarks: 100, obtainedMarks: 77 });
  check("mark upsert create", mark1.status === 200 && mark1.json.id === `${completed.id}:${testId}:English`);
  const mark2 = await req("POST", "/marks", { examId: completed.id, studentId: testId, subject: "English", totalMarks: 100, obtainedMarks: 88 });
  check("mark upsert update", mark2.status === 200 && mark2.json.obtainedMarks === 88);

  // 8. Exam create/update/delete
  const exam = await req("POST", "/exams", { name: "API Test Exam", term: "Test", startDate: "2027-01-10", endDate: "2027-01-15", classId: "all", status: "Upcoming" });
  check("exam create", exam.status === 201);
  const examUp = await req("PUT", `/exams/${exam.json.id}`, { status: "Ongoing" });
  check("exam update", examUp.json.status === "Ongoing");
  const examDel = await req("DELETE", `/exams/${exam.json.id}`);
  check("exam delete", examDel.status === 200);

  // 9. Teachers
  const tch = await req("POST", "/teachers", { employeeNo: "EMP-TEST", name: "Test Teacher", gender: "Female", subject: "Art", salary: 50000, status: "Active" });
  check("teacher create", tch.status === 201);
  const tchUp = await req("PUT", `/teachers/${tch.json.id}`, { salary: 55000 });
  check("teacher update", tchUp.json.salary === 55000);

  // 10. Classes create + delete (student becomes inactive)
  const cls = await req("POST", "/classes", { name: "Class Test", level: 99, sections: ["A", "B"], classTeacherId: tch.json.id, monthlyFee: 3000, subjects: ["Art", "Music"], roomNo: "R-999" });
  check("class create", cls.status === 201 && cls.json.sections.length === 2);
  await req("PUT", `/students/${testId}`, { classId: cls.json.id });
  const clsDel = await req("DELETE", `/classes/${cls.json.id}`);
  check("class delete", clsDel.status === 200);
  const afterDel = (await req("GET", "/bootstrap")).json.students.find((s) => s.id === testId);
  check("student inactive after class delete", afterDel?.status === "Inactive" && afterDel?.classId === "");

  // 11. Timetable add/delete
  const slot = await req("POST", "/timetable", { classId: firstClass.id, section: firstClass.sections[0], day: "Monday", period: 7, startTime: "13:00", endTime: "13:45", subject: "Art", teacherId: tch.json.id });
  check("slot create", slot.status === 201);
  const slotDel = await req("DELETE", `/timetable/${slot.json.id}`);
  check("slot delete", slotDel.status === 200);

  // 12. Notices
  const ntc = await req("POST", "/notices", { title: "API Test Notice", content: "Hello", priority: "Urgent", audience: "All" });
  check("notice create (date default)", ntc.status === 201 && !!ntc.json.date);
  const ntcDel = await req("DELETE", `/notices/${ntc.json.id}`);
  check("notice delete", ntcDel.status === 200);

  // 13. Expenses
  const exp = await req("POST", "/expenses", { title: "API Test Expense", category: "Testing", amount: 100, paidTo: "Tester", paymentMethod: "Cash" });
  check("expense create", exp.status === 201);
  const expDel = await req("DELETE", `/expenses/${exp.json.id}`);
  check("expense delete", expDel.status === 200);

  // 14. Settings
  const prof = await req("PUT", "/settings", { phone: "+92 300 9999999" });
  check("profile update", prof.status === 200 && prof.json.phone === "+92 300 9999999");

  // 15. Student delete cascades (student has challan for 2026-11 + marks)
  await req("PUT", `/students/${testId}`, { status: "Active", classId: firstClass.id });
  const stuDel = await req("DELETE", `/students/${testId}`);
  check("student delete", stuDel.status === 200);
  const boot2 = (await req("GET", "/bootstrap")).json;
  check("cascade: no orphan challans/marks/attendance",
    !boot2.challans.some((c) => c.studentId === testId) &&
    !boot2.marks.some((m) => m.studentId === testId) &&
    !boot2.attendance.some((a) => a.studentId === testId));
  check("student count restored", boot2.students.length === studentCount0, `${boot2.students.length} vs ${studentCount0}`);

  // 16. Promote
  const clsA = boot2.classes[0].id, clsB = boot2.classes[1].id;
  const promo = await req("POST", "/students/promote", { fromClassId: clsA, toClassId: clsB });
  check("promote", promo.status === 200 && promo.json.moved > 0 && promo.json.students.every((s) => s.classId === clsB));
  // move them back
  await req("POST", "/students/promote", { fromClassId: clsB, toClassId: clsA });

  // 17. Reset
  const reset = await req("POST", "/admin/reset");
  check("admin reset", reset.status === 200 && reset.json.counts?.students > 0 && Array.isArray(reset.json.students));
  const boot3 = await req("GET", "/bootstrap");
  check("post-reset profile phone restored", boot3.json.profile.phone === "+92 300 1234567");

  console.log(`\n${pass} passed, ${failCount} failed`);
  process.exit(failCount > 0 ? 1 : 0);
})().catch((e) => { console.error("Test crashed:", e); process.exit(1); });
