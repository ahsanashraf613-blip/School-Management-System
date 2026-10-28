import type {
  AttendanceRecord,
  Exam,
  ExamMark,
  Expense,
  FeeChallan,
  Notice,
  SchoolClass,
  SchoolProfile,
  Student,
  Teacher,
  TimetableSlot,
  WeekDay,
} from "./types";

// ── Deterministic PRNG so the demo data is stable across reloads ───────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261028);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

// ── School profile ──────────────────────────────────────────────────────────
export const SCHOOL_PROFILE: SchoolProfile = {
  name: "Iqra Model School",
  tagline: "Knowledge · Character · Excellence",
  address: "12-A Gulberg III, Lahore, Punjab",
  phone: "+92 300 1234567",
  email: "info@iqramodelschool.edu.pk",
  session: "2026 – 2027",
  principal: "Prof. Anwar Siddiqui",
};

export const CLASS_LEVELS = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"];
const CORE_SUBJECTS = ["English", "Urdu", "Mathematics", "Science", "Islamiat", "Social Studies"];
const SENIOR_SUBJECTS = ["English", "Urdu", "Mathematics", "Science", "Islamiat", "Social Studies", "Computer"];
const SECTIONS = ["A", "B"];

// ── Teachers ────────────────────────────────────────────────────────────────
const TEACHER_SEED: Array<[string, string, string, string, number]> = [
  // name, gender, subject, qualification, salary
  ["Farhana Qureshi", "Female", "English", "M.A English", 65000],
  ["Muhammad Imran", "Male", "Mathematics", "M.Sc Mathematics", 70000],
  ["Sadia Kamran", "Female", "Science", "M.Sc Physics", 68000],
  ["Ahmed Nawaz", "Male", "Urdu", "M.A Urdu", 60000],
  ["Hafiza Maryam", "Female", "Islamiat", "M.A Islamic Studies", 58000],
  ["Bilal Hussain", "Male", "Computer", "BS Computer Science", 75000],
  ["Nadia Aslam", "Female", "Social Studies", "M.A History", 57000],
  ["Kashif Mehmood", "Male", "Mathematics", "M.Phil Mathematics", 80000],
  ["Rabia Anwar", "Female", "English", "B.Ed, M.A English", 62000],
  ["Usman Ghani", "Male", "Science", "M.Sc Chemistry", 66000],
  ["Saima Tariq", "Female", "Urdu", "M.A Urdu", 56000],
  ["Zubair Ahmed", "Male", "Social Studies", "M.A Geography", 59000],
];

const PHONE_PREFIXES = ["0300", "0301", "0321", "0333", "0345", "0302"];
const makePhone = () => `${pick(PHONE_PREFIXES)}-${between(1000000, 9999999)}`;

export function buildTeachers(): Teacher[] {
  return TEACHER_SEED.map((t, i) => {
    const [name, gender, subject, qualification, salary] = t;
    const month = 1 + ((i * 5) % 10);
    return {
      id: `tch-${i + 1}`,
      employeeNo: `EMP-${String(101 + i)}`,
      name,
      gender: gender as Teacher["gender"],
      subject,
      phone: makePhone(),
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@iqramodel.edu.pk`,
      qualification,
      joinDate: `${between(2016, 2024)}-${String(month).padStart(2, "0")}-${String(between(1, 28)).padStart(2, "0")}`,
      salary,
      status: i === 10 ? "On Leave" : "Active",
    };
  });
}

// ── Classes ─────────────────────────────────────────────────────────────────
export function buildClasses(teachers: Teacher[]): SchoolClass[] {
  return CLASS_LEVELS.map((name, i) => {
    const senior = i >= 4;
    return {
      id: `cls-${i + 1}`,
      name,
      level: i + 1,
      sections: i % 3 === 2 ? ["A"] : SECTIONS,
      classTeacherId: teachers[i % teachers.length].id,
      monthlyFee: 1800 + i * 400,
      subjects: senior ? SENIOR_SUBJECTS : CORE_SUBJECTS,
      roomNo: `R-${100 + i}`,
    };
  });
}

// ── Students ────────────────────────────────────────────────────────────────
const FIRST_M = ["Ahmed", "Muhammad", "Bilal", "Hamza", "Usman", "Ali", "Hassan", "Umar", "Abdullah", "Saad", "Talha", "Zain", "Ibrahim", "Faizan", "Danish", "Rehan"];
const FIRST_F = ["Ayesha", "Fatima", "Maryam", "Hira", "Zainab", "Amna", "Sana", "Iqra", "Noor", "Laiba", "Mahnoor", "Eman", "Areeba", "Sara", "Kinza", "Hafsa"];
const LAST = ["Khan", "Ahmed", "Raza", "Malik", "Butt", "Sheikh", "Qureshi", "Siddiqui", "Chaudhry", "Mirza", "Hashmi", "Farooq", "Nawaz", "Iqbal", "Aslam", "Javed"];
const BLOOD = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+"];
const AREAS = ["Gulberg III", "Model Town", "Johar Town", "DHA Phase 4", "Township", "Cantt", "Faisal Town", "Iqbal Town"];

export function buildStudents(classes: SchoolClass[]): Student[] {
  const students: Student[] = [];
  let admissionCounter = 1;
  classes.forEach((cls) => {
    cls.sections.forEach((section) => {
      const count = between(8, 11);
      for (let r = 1; r <= count; r++) {
        const gender = rand() > 0.5 ? "Male" : "Female";
        const first = gender === "Male" ? pick(FIRST_M) : pick(FIRST_F);
        const last = pick(LAST);
        const father = `${pick(FIRST_M)} ${last}`;
        const name = `${first} ${last}`;
        const statusRoll = rand();
        students.push({
          id: `std-${admissionCounter}`,
          admissionNo: `ADM-${2024 + (admissionCounter % 3)}-${String(admissionCounter).padStart(3, "0")}`,
          name,
          fatherName: father,
          gender,
          classId: cls.id,
          section,
          rollNo: r,
          dob: `${2026 - (cls.level + between(5, 6))}-${String(between(1, 12)).padStart(2, "0")}-${String(between(1, 28)).padStart(2, "0")}`,
          phone: makePhone(),
          address: `${between(2, 90)}-${pick(["A", "B", "C"])} ${pick(AREAS)}, Lahore`,
          admissionDate: `${2024 + (admissionCounter % 3)}-${String(between(1, 12)).padStart(2, "0")}-${String(between(1, 28)).padStart(2, "0")}`,
          status: statusRoll > 0.94 ? "Inactive" : "Active",
          bloodGroup: pick(BLOOD),
          monthlyFee: cls.monthlyFee + (rand() > 0.8 ? 500 : 0),
        });
        admissionCounter++;
      }
    });
  });
  return students;
}

// ── Fee challans (Aug / Sep / Oct 2026) ─────────────────────────────────────
const FEE_MONTHS = ["2026-08", "2026-09", "2026-10"];
let challanCounter = 1;

export function buildChallans(students: Student[]): FeeChallan[] {
  const challans: FeeChallan[] = [];
  students
    .filter((s) => s.status === "Active")
    .forEach((s) => {
      FEE_MONTHS.forEach((month, mi) => {
        const otherCharges = rand() > 0.7 ? pick([200, 300, 500]) : 0;
        const discount = rand() > 0.85 ? Math.round(s.monthlyFee * 0.1) : 0;
        const total = s.monthlyFee + otherCharges - discount;
        const roll = rand();
        // older months are mostly paid; current month has more pending
        const paid = roll > (mi === 0 ? 0.06 : mi === 1 ? 0.15 : 0.42);
        const overdue = !paid && month < "2026-10" && rand() > 0.4;
        challans.push({
          id: `chl-${challanCounter}`,
          challanNo: `CH-${month.replace("-", "")}-${String(challanCounter).padStart(4, "0")}`,
          studentId: s.id,
          month,
          tuitionFee: s.monthlyFee,
          otherCharges,
          discount,
          total,
          dueDate: `${month}-10`,
          status: paid ? "Paid" : overdue ? "Overdue" : "Pending",
          paidDate: paid ? `${month}-${String(between(3, 12)).padStart(2, "0")}` : undefined,
        });
        challanCounter++;
      });
    });
  return challans;
}

// ── Attendance (last 12 weekdays up to 2026-10-28) ──────────────────────────
export function buildAttendance(students: Student[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const dates: string[] = [];
  const d = new Date(2026, 9, 28); // 28 Oct 2026
  while (dates.length < 12) {
    const day = d.getDay();
    if (day !== 0) dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  students
    .filter((s) => s.status === "Active")
    .forEach((s) => {
      dates.forEach((date) => {
        const roll = rand();
        const status: AttendanceRecord["status"] =
          roll > 0.93 ? "absent" : roll > 0.9 ? "late" : roll > 0.885 ? "leave" : "present";
        records.push({ studentId: s.id, classId: s.classId, date, status });
      });
    });
  return records;
}

// ── Exams & marks ───────────────────────────────────────────────────────────
export function buildExams(): Exam[] {
  return [
    { id: "exm-1", name: "First Term Examination", term: "First Term", startDate: "2026-09-01", endDate: "2026-09-12", classId: "all", status: "Completed" },
    { id: "exm-2", name: "Mid Term Assessment", term: "Mid Term", startDate: "2026-10-19", endDate: "2026-10-24", classId: "all", status: "Completed" },
    { id: "exm-3", name: "Second Term Examination", term: "Second Term", startDate: "2026-12-07", endDate: "2026-12-18", classId: "all", status: "Upcoming" },
  ];
}

export function buildMarks(students: Student[], exams: Exam[], classes: SchoolClass[]): ExamMark[] {
  const marks: ExamMark[] = [];
  const active = students.filter((s) => s.status === "Active");
  exams
    .filter((e) => e.status === "Completed")
    .forEach((exam) => {
      active.forEach((s) => {
        const cls = classes.find((c) => c.id === s.classId);
        cls?.subjects.forEach((subject) => {
          const obtained = between(Math.round(45 + s.rollNo * 0.4), 98);
          marks.push({
            id: `${exam.id}:${s.id}:${subject}`,
            examId: exam.id,
            studentId: s.id,
            subject,
            totalMarks: 100,
            obtainedMarks: Math.min(obtained, 99),
          });
        });
      });
    });
  return marks;
}

// ── Timetable ───────────────────────────────────────────────────────────────
const DAYS: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIOD_TIMES = [
  ["08:00", "08:45"],
  ["08:45", "09:30"],
  ["09:30", "10:15"],
  ["10:45", "11:30"],
  ["11:30", "12:15"],
  ["12:15", "13:00"],
];

export function buildTimetable(classes: SchoolClass[], teachers: Teacher[]): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  classes.forEach((cls) => {
    cls.sections.forEach((section) => {
      DAYS.forEach((day, di) => {
        PERIOD_TIMES.forEach(([start, end], pi) => {
          const subject = cls.subjects[(di * 2 + pi * 3 + cls.level) % cls.subjects.length];
          const teacher = teachers.find((t) => t.subject === subject) ?? teachers[(pi + di) % teachers.length];
          slots.push({
            id: `slt-${cls.id}-${section}-${di}-${pi}`,
            classId: cls.id,
            section,
            day,
            period: pi + 1,
            startTime: start,
            endTime: end,
            subject: pi === 2 && di % 2 === 1 ? "Library" : subject,
            teacherId: teacher.id,
          });
        });
      });
    });
  });
  return slots;
}

// ── Notices ─────────────────────────────────────────────────────────────────
export function buildNotices(): Notice[] {
  return [
    {
      id: "ntc-1",
      title: "Parent–Teacher Meeting — Saturday, 1 November",
      content: "A PTM will be held on Saturday, 1st November 2026 from 9:00 AM to 1:00 PM. All parents are requested to collect their child's mid-term report from the class teacher and discuss academic progress.",
      date: "2026-10-26",
      priority: "Important",
      audience: "Parents",
    },
    {
      id: "ntc-2",
      title: "Annual Sports Gala 2026 — Registration Open",
      content: "Registration for the Annual Sports Gala (cricket, football, athletics and tug-of-war) is now open. Interested students should submit names to their sports teacher by 5th November.",
      date: "2026-10-22",
      priority: "Normal",
      audience: "Students",
    },
    {
      id: "ntc-3",
      title: "Fee Deadline — November Challans",
      content: "November fee challans will be issued from 1st November. Kindly deposit fees before the 10th to avoid a late fine of Rs. 200. Online payment is available through the school bank account.",
      date: "2026-10-20",
      priority: "Urgent",
      audience: "Parents",
    },
    {
      id: "ntc-4",
      title: "Staff Meeting — Curriculum Planning",
      content: "All teaching staff must attend the curriculum planning meeting on Thursday, 30th October at 2:00 PM in the conference room. Second term syllabus breakdowns will be discussed.",
      date: "2026-10-19",
      priority: "Important",
      audience: "Teachers",
    },
    {
      id: "ntc-5",
      title: "Winter Uniform Effective 3 November",
      content: "Students must switch to the winter uniform from Monday, 3rd November 2026. Navy sweaters and school blazers are available at the school bookstore.",
      date: "2026-10-15",
      priority: "Normal",
      audience: "All",
    },
    {
      id: "ntc-6",
      title: "Mid-Term Results Announced",
      content: "Mid-term assessment results have been finalized and are available with class teachers. Report cards will be handed over during the upcoming parent–teacher meeting.",
      date: "2026-10-12",
      priority: "Normal",
      audience: "All",
    },
  ];
}

// ── Expenses ────────────────────────────────────────────────────────────────
export function buildExpenses(): Expense[] {
  const raw: Array<[string, string, number, string, Expense["paymentMethod"], string]> = [
    ["Electricity bill — September", "Utilities", 48500, "LESCO", "Bank Transfer", "2026-10-02"],
    ["Whiteboard markers & dusters", "Stationery", 3800, "Al-Noor Traders", "Cash", "2026-10-03"],
    ["Lab chemicals — Science dept.", "Laboratory", 12500, "Scientific Stores", "Bank Transfer", "2026-10-06"],
    ["Bus diesel — first half October", "Transport", 62000, "PSO Fuel Station", "Card", "2026-10-08"],
    ["Library books (12 titles)", "Library", 24500, "Sang-e-Meel Publications", "Cheque", "2026-10-10"],
    ["Janitorial supplies", "Maintenance", 7600, "CleanCo Pakistan", "Cash", "2026-10-12"],
    ["Water cooler filter replacement", "Maintenance", 4300, "Aqua Filt Systems", "Cash", "2026-10-14"],
    ["Sports equipment — footballs & kits", "Sports", 18700, "Sports Corner", "Card", "2026-10-16"],
    ["Printer toner (staff room)", "Stationery", 9200, "Biztek Solutions", "Cash", "2026-10-18"],
    ["Electricity bill — October", "Utilities", 51100, "LESCO", "Bank Transfer", "2026-10-21"],
    ["Repair — classroom ceiling fans", "Maintenance", 8900, "FanMaster Services", "Cash", "2026-10-24"],
    ["Prize distribution ceremony refreshments", "Events", 15400, "Kings Caterers", "Card", "2026-10-27"],
  ];
  return raw.map(([title, category, amount, paidTo, paymentMethod, date], i) => ({
    id: `exp-${i + 1}`,
    title,
    category,
    amount,
    date,
    paidTo,
    paymentMethod,
  }));
}

// ── Aggregate seed ──────────────────────────────────────────────────────────
export function buildSeedData() {
  const teachers = buildTeachers();
  const classes = buildClasses(teachers);
  const students = buildStudents(classes);
  const challans = buildChallans(students);
  const attendance = buildAttendance(students);
  const exams = buildExams();
  const marks = buildMarks(students, exams, classes);
  const timetable = buildTimetable(classes, teachers);
  const notices = buildNotices();
  const expenses = buildExpenses();
  return {
    profile: SCHOOL_PROFILE,
    teachers,
    classes,
    students,
    challans,
    attendance,
    exams,
    marks,
    timetable,
    notices,
    expenses,
  };
}

export const SUBJECT_LIST = SENIOR_SUBJECTS;
export const WEEK_DAYS = DAYS;
export const PERIODS = PERIOD_TIMES;
