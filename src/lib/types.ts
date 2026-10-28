// ── School Management System — Domain Types ────────────────────────────────

export type StudentStatus = "Active" | "Inactive" | "Graduated";
export type Gender = "Male" | "Female";

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  fatherName: string;
  gender: Gender;
  classId: string;
  section: string;
  rollNo: number;
  dob: string; // ISO date
  phone: string;
  address: string;
  admissionDate: string; // ISO date
  status: StudentStatus;
  bloodGroup: string;
  monthlyFee: number;
}

export type TeacherStatus = "Active" | "On Leave" | "Resigned";

export interface Teacher {
  id: string;
  employeeNo: string;
  name: string;
  gender: Gender;
  subject: string;
  phone: string;
  email: string;
  qualification: string;
  joinDate: string;
  salary: number;
  status: TeacherStatus;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Class 5"
  level: number; // numeric order for sorting
  sections: string[]; // e.g. ["A", "B"]
  classTeacherId: string;
  monthlyFee: number;
  subjects: string[];
  roomNo: string;
}

export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export interface AttendanceRecord {
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export type FeeStatus = "Paid" | "Pending" | "Overdue";

export interface FeeChallan {
  id: string;
  challanNo: string;
  studentId: string;
  month: string; // YYYY-MM
  tuitionFee: number;
  otherCharges: number;
  discount: number;
  total: number;
  dueDate: string;
  status: FeeStatus;
  paidDate?: string;
}

export type ExamStatus = "Upcoming" | "Ongoing" | "Completed";

export interface Exam {
  id: string;
  name: string;
  term: string;
  startDate: string;
  endDate: string;
  classId: string;
  status: ExamStatus;
}

export interface ExamMark {
  id: string; // examId:studentId:subject
  examId: string;
  studentId: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
}

export type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface TimetableSlot {
  id: string;
  classId: string;
  section: string;
  day: WeekDay;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
}

export type NoticePriority = "Normal" | "Important" | "Urgent";

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: NoticePriority;
  audience: "All" | "Students" | "Teachers" | "Parents";
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paidTo: string;
  paymentMethod: "Cash" | "Bank Transfer" | "Cheque" | "Card";
}

export interface SchoolProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  session: string;
  principal: string;
}

export type ViewKey =
  | "dashboard"
  | "students"
  | "teachers"
  | "classes"
  | "attendance"
  | "fees"
  | "exams"
  | "timetable"
  | "notices"
  | "expenses"
  | "settings";
