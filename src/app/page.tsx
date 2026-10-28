"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Moon,
  ReceiptText,
  School,
  Search,
  Settings,
  Sun,
  Users,
  UsersRound,
  Wallet,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useSchoolStore } from "@/lib/store";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ViewKey } from "@/lib/types";
import DashboardView from "@/components/school/dashboard-view";
import StudentsView from "@/components/school/students-view";
import TeachersView from "@/components/school/teachers-view";
import ClassesView from "@/components/school/classes-view";
import AttendanceView from "@/components/school/attendance-view";
import FeesView from "@/components/school/fees-view";
import ExamsView from "@/components/school/exams-view";
import TimetableView from "@/components/school/timetable-view";
import NoticesView from "@/components/school/notices-view";
import ExpensesView from "@/components/school/expenses-view";
import SettingsView from "@/components/school/settings-view";

const NAV: Array<{ key: ViewKey; label: string; icon: React.ElementType }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "students", label: "Students", icon: Users },
  { key: "teachers", label: "Teachers", icon: UsersRound },
  { key: "classes", label: "Classes & Sections", icon: School },
  { key: "attendance", label: "Attendance", icon: ClipboardList },
  { key: "fees", label: "Fee Management", icon: Wallet },
  { key: "exams", label: "Exams & Results", icon: BookOpenCheck },
  { key: "timetable", label: "Timetable", icon: CalendarDays },
  { key: "notices", label: "Notice Board", icon: Megaphone },
  { key: "expenses", label: "Expenses", icon: ReceiptText },
  { key: "settings", label: "Settings", icon: Settings },
];

const VIEW_TITLES: Record<ViewKey, string> = {
  dashboard: "Dashboard",
  students: "Students",
  teachers: "Teachers",
  classes: "Classes & Sections",
  attendance: "Attendance",
  fees: "Fee Management",
  exams: "Exams & Results",
  timetable: "Timetable",
  notices: "Notice Board",
  expenses: "Expenses",
  settings: "Settings",
};

const THEME_KEY = "skoolypro-theme";
const THEME_EVENT = "skoolypro-theme-change";

// Theme persisted in localStorage, exposed as an external store (lint-safe).
const subscribeTheme = (cb: () => void) => {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
};
const getThemeSnapshot = () => {
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    return false;
  }
};
const getServerThemeSnapshot = () => false;

const VIEW_KEYS = new Set<string>(NAV.map((n) => n.key));

function viewFromHash(): ViewKey {
  if (typeof window === "undefined") return "dashboard";
  const h = window.location.hash.replace(/^#\/?/, "");
  return VIEW_KEYS.has(h) ? (h as ViewKey) : "dashboard";
}

function NavList({ active, onSelect }: { active: ViewKey; onSelect: (v: ViewKey) => void }) {
  const students = useSchoolStore((s) => s.students);
  const teachers = useSchoolStore((s) => s.teachers);
  const pendingChallans = useSchoolStore(
    (s) => s.challans.filter((c) => c.status !== "Paid").length
  );
  const counts: Partial<Record<ViewKey, number>> = {
    students: students.length,
    teachers: teachers.length,
    fees: pendingChallans,
  };

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {counts[item.key] !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                  isActive
                    ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                    : "bg-sidebar-accent text-sidebar-accent-foreground/80"
                )}
              >
                {counts[item.key]}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function Brand() {
  const profile = useSchoolStore((s) => s.profile);
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg">
        <GraduationCap className="h-6 w-6" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-tight text-sidebar-accent-foreground">
          {profile.name}
        </p>
        <p className="truncate text-[11px] text-sidebar-foreground/60">SkoolyPro · Session {profile.session}</p>
      </div>
    </div>
  );
}

function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onNavigate: (v: ViewKey) => void;
}) {
  const students = useSchoolStore((s) => s.students);
  const teachers = useSchoolStore((s) => s.teachers);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const studentHits = useMemo(() => {
    if (q.length < 2) return [];
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.fatherName.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [students, q]);

  const teacherHits = useMemo(() => {
    if (q.length < 2) return [];
    return teachers
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.employeeNo.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [teachers, q]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setQuery("");
      }}
      description="Search modules, students and teachers"
    >
      <CommandInput value={query} onValueChange={setQuery} placeholder="Search modules, students, teachers…" />
      <CommandList className="custom-scrollbar">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Modules">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.key}
                value={`module ${item.label}`}
                onSelect={() => {
                  onNavigate(item.key);
                  onOpenChange(false);
                }}
              >
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden />
                <span>{item.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">Go to</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        {studentHits.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Students">
              {studentHits.map((s) => (
                <CommandItem
                  key={s.id}
                  value={`student ${s.name} ${s.admissionNo}`}
                  onSelect={() => {
                    onNavigate("students");
                    onOpenChange(false);
                  }}
                >
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden />
                  <span>{s.name}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{s.admissionNo}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {teacherHits.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Teachers">
              {teacherHits.map((t) => (
                <CommandItem
                  key={t.id}
                  value={`teacher ${t.name} ${t.employeeNo}`}
                  onSelect={() => {
                    onNavigate("teachers");
                    onOpenChange(false);
                  }}
                >
                  <UsersRound className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden />
                  <span>{t.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{t.subject}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export default function Home() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isMobile = useIsMobile();
  const profile = useSchoolStore((s) => s.profile);

  // Keep <html> class in sync with the persisted theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleTheme = useCallback(() => {
    const next = !getThemeSnapshot();
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const navigate = useCallback((v: ViewKey) => {
    setView(v);
    if (typeof window !== "undefined" && window.location.hash !== `#/${v}`) {
      window.location.hash = `/${v}`;
    }
  }, []);

  // Deep links + browser back/forward support.
  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // ⌘K / Ctrl+K opens the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectAndClose = (v: ViewKey) => {
    navigate(v);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Brand />
      <div className="custom-scrollbar flex-1 overflow-y-auto pb-4">
        <NavList active={view} onSelect={selectAndClose} />
      </div>
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/60 p-3">
          <p className="text-[11px] font-medium text-sidebar-foreground/70">Frontend Demo Mode</p>
          <p className="mt-1 text-[11px] leading-snug text-sidebar-foreground/50">
            Data is stored in your browser. Backend API is not connected yet.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Global search palette */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onNavigate={navigate} />

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <SheetDescription className="sr-only">
              School management module navigation
            </SheetDescription>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Main area */}
      <div className={cn("flex min-h-screen w-full flex-col", !isMobile && "pl-64")}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            {isMobile && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold sm:text-lg">{VIEW_TITLES[view]}</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open search"
              className="gap-2 text-muted-foreground md:w-56 md:justify-start"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">Search anything…</span>
              <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-semibold md:inline-block">
                ⌘K
              </kbd>
            </Button>
            <Badge variant="outline" className="hidden gap-1.5 border-primary/30 bg-primary/5 text-primary lg:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              {profile.session} Session
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
              </Avatar>
              <div className="hidden leading-tight lg:block">
                <p className="text-sm font-semibold">Admin</p>
                <p className="text-xs text-muted-foreground">Principal Office</p>
              </div>
            </div>
          </div>
        </header>

        {/* View content */}
        <main className="flex-1 p-4 sm:p-6">
          {view === "dashboard" && <DashboardView onNavigate={navigate} />}
          {view === "students" && <StudentsView />}
          {view === "teachers" && <TeachersView />}
          {view === "classes" && <ClassesView />}
          {view === "attendance" && <AttendanceView />}
          {view === "fees" && <FeesView />}
          {view === "exams" && <ExamsView />}
          {view === "timetable" && <TimetableView />}
          {view === "notices" && <NoticesView />}
          {view === "expenses" && <ExpensesView />}
          {view === "settings" && <SettingsView />}
        </main>

        <footer className="mt-auto border-t px-6 py-4">
          <p className="text-center text-xs text-muted-foreground">
            SkoolyPro — School Management System · {profile.name} · Frontend preview (mock data, no backend)
          </p>
        </footer>
      </div>
    </div>
  );
}
