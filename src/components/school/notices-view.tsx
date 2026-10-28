"use client";

import { useMemo, useState } from "react";
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSchoolStore } from "@/lib/store";
import { avatarColor, initials, todayISO } from "@/lib/helpers";
import type { Notice, NoticePriority } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const priorityVariant = (p: string) =>
  p === "Urgent" ? "destructive" : p === "Important" ? "default" : "secondary";

export default function NoticesView() {
  const notices = useSchoolStore((s) => s.notices);
  const addNotice = useSchoolStore((s) => s.addNotice);
  const deleteNotice = useSchoolStore((s) => s.deleteNotice);
  const { toast } = useToast();

  const [audienceFilter, setAudienceFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Notice | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "Normal" as NoticePriority,
    audience: "All" as Notice["audience"],
    date: todayISO(),
  });

  const filtered = useMemo(
    () =>
      notices
        .filter((n) => (audienceFilter === "all" ? true : n.audience === audienceFilter || n.audience === "All"))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [notices, audienceFilter]
  );

  const handlePost = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Missing fields", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    addNotice(form);
    toast({ title: "Notice posted", description: `"${form.title}" is now visible on the board.` });
    setForm({ ...form, title: "", content: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={audienceFilter} onValueChange={setAudienceFilter}>
          <SelectTrigger className="w-full sm:w-[170px]" aria-label="Filter by audience">
            <SelectValue placeholder="Audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="Students">Students</SelectItem>
            <SelectItem value="Teachers">Teachers</SelectItem>
            <SelectItem value="Parents">Parents</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)} className="gap-1.5 sm:ml-auto">
          <Plus className="h-4 w-4" /> Post Notice
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <Megaphone className="mx-auto h-10 w-10 text-muted-foreground/40" aria-hidden />
            <p className="mt-2 text-sm font-medium">No notices found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((n) => (
            <Card key={n.id} className={`py-5 ${n.priority === "Urgent" ? "border-red-500/40" : ""}`}>
              <CardContent className="px-5">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${avatarColor(n.title)}`}
                  >
                    <Pin className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 flex-1 text-sm font-bold leading-snug">{n.title}</h3>
                      <Badge variant={priorityVariant(n.priority) as "destructive" | "default" | "secondary"}>
                        {n.priority}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.content}</p>
                    <div className="mt-3 flex items-center justify-between border-t pt-2.5">
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(n.date + "T00:00:00").toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        · To: {n.audience}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDeleting(n)}
                        aria-label={`Delete notice ${n.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Post notice dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Post New Notice</DialogTitle>
            <DialogDescription>The notice will appear on the board and dashboard.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="n-title">Title *</Label>
              <Input id="n-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Winter uniform announcement" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="n-content">Content *</Label>
              <Textarea id="n-content" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write the full notice text here…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as NoticePriority })}>
                  <SelectTrigger aria-label="Priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Important">Important</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v as Notice["audience"] })}>
                  <SelectTrigger aria-label="Audience"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">Everyone</SelectItem>
                    <SelectItem value="Students">Students</SelectItem>
                    <SelectItem value="Teachers">Teachers</SelectItem>
                    <SelectItem value="Parents">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="n-date">Date</Label>
                <Input id="n-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handlePost} className="gap-1.5">
              <Megaphone className="h-4 w-4" /> Post Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete notice?</AlertDialogTitle>
            <AlertDialogDescription>"{deleting?.title}" will be removed from the board.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) {
                  deleteNotice(deleting.id);
                  toast({ title: "Notice deleted" });
                }
                setDeleting(null);
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
