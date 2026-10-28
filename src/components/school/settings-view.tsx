"use client";

import { useState } from "react";
import { Building2, Database, Phone, RotateCcw, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSchoolStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function SettingsView() {
  const profile = useSchoolStore((s) => s.profile);
  const updateProfile = useSchoolStore((s) => s.updateProfile);
  const resetAllData = useSchoolStore((s) => s.resetAllData);
  const students = useSchoolStore((s) => s.students);
  const teachers = useSchoolStore((s) => s.teachers);
  const challans = useSchoolStore((s) => s.challans);
  const attendance = useSchoolStore((s) => s.attendance);
  const { toast } = useToast();

  const [form, setForm] = useState(profile);

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "School name required", variant: "destructive" });
      return;
    }
    updateProfile(form);
    toast({ title: "Settings saved", description: "School profile has been updated." });
  };

  const dataCounts = [
    { label: "Students", count: students.length },
    { label: "Teachers", count: teachers.length },
    { label: "Fee Challans", count: challans.length },
    { label: "Attendance Records", count: attendance.length },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* School profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" aria-hidden /> School Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-name">School Name</Label>
              <Input id="s-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-tag">Tagline</Label>
              <Input id="s-tag" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-addr">Address</Label>
              <Input id="s-addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-phone">Phone</Label>
              <Input id="s-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-email">Email</Label>
              <Input id="s-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-session">Academic Session</Label>
              <Input id="s-session" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-principal">Principal</Label>
              <Input id="s-principal" value={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleSave} className="gap-1.5">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Data & demo info */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-primary" aria-hidden /> Demo Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {dataCounts.map((d) => (
                <div key={d.label} className="rounded-lg border bg-accent/30 p-3">
                  <p className="text-xl font-bold tabular-nums">{d.count}</p>
                  <p className="text-xs text-muted-foreground">{d.label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This build runs entirely on the frontend. All changes are saved to your browser&apos;s local storage — no
              server or database is involved yet. When the backend is connected later, these mock records will be
              replaced by real API data.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10">
                  <RotateCcw className="h-4 w-4" /> Reset Demo Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Every change you made (students, fees, attendance, marks…) will be discarded and the original demo
                    dataset will be restored.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetAllData();
                      toast({ title: "Demo data restored", description: "The original seed dataset was reloaded." });
                    }}
                  >
                    Reset Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4 text-primary" aria-hidden /> Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">SkoolyPro</span> — school management suite with student,
              staff, attendance, fee, exam, timetable, notice and expense modules.
            </p>
            <p>For technical support contact the administration IT desk at it-desk@skoolypro.app.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
