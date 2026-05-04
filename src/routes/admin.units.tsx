import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/units")({
  component: UnitsPage,
});

interface SubjectRow { id: string; code: string; name: string; year: number | null }
interface Unit { id: string; subject_id: string; unit_number: number; title: string; topics: string[] }

function UnitsPage() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [filterSubject, setFilterSubject] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Unit> & { topicsText?: string } | null>(null);

  const load = async () => {
    const [{ data: s }, { data: u }] = await Promise.all([
      supabase.from("subjects").select("id, code, name, year").order("name"),
      supabase.from("units").select("*").order("subject_id").order("unit_number"),
    ]);
    setSubjects((s ?? []) as SubjectRow[]);
    setUnits((u ?? []) as Unit[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = filterSubject ? units.filter((u) => u.subject_id === filterSubject) : units;

  const save = async () => {
    if (!editing?.subject_id || !editing.unit_number || !editing.title) {
      toast.error("Fill required fields"); return;
    }
    const topics = (editing.topicsText ?? "").split("\n").map((t) => t.trim()).filter(Boolean);
    const payload = { subject_id: editing.subject_id, unit_number: editing.unit_number, title: editing.title, topics };
    const { error } = editing.id
      ? await supabase.from("units").update(payload).eq("id", editing.id)
      : await supabase.from("units").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete unit?")) return;
    const { error } = await supabase.from("units").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Units</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {units.length}</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button onClick={() => setEditing({ unit_number: 1 })}><Plus className="h-4 w-4 mr-2" />New</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} unit</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Subject</Label>
                <Select value={editing?.subject_id} onValueChange={(v) => setEditing({ ...editing, subject_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick subject" /></SelectTrigger>
                  <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}{s.year ? ` (Year ${s.year})` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Unit number</Label><Input type="number" min={1} value={editing?.unit_number ?? 1} onChange={(e) => setEditing({ ...editing, unit_number: Number(e.target.value) })} /></div>
              <div><Label>Title</Label><Input value={editing?.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Topics (one per line)</Label><Textarea rows={6} value={editing?.topicsText ?? (editing?.topics ?? []).join("\n")} onChange={(e) => setEditing({ ...editing, topicsText: e.target.value })} /></div>
              <Button onClick={save} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="pt-4">
        <Label>Filter by subject</Label>
        <Select value={filterSubject ?? "all"} onValueChange={(v) => setFilterSubject(v === "all" ? undefined : v)}>
          <SelectTrigger><SelectValue placeholder="All subjects" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All subjects</SelectItem>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}</SelectContent>
        </Select>
      </CardContent></Card>

      <div className="space-y-2">
        {filtered.map((u) => {
          const sub = subjects.find((s) => s.id === u.subject_id);
          return (
            <Card key={u.id}>
              <CardContent className="pt-4 flex justify-between gap-3">
                <div>
                  <div className="font-medium">Unit {u.unit_number}: {u.title}</div>
                  <div className="text-xs text-muted-foreground">{sub?.code} — {sub?.name}</div>
                  {u.topics.length > 0 && <div className="text-xs mt-1 text-muted-foreground">{u.topics.length} topics</div>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...u, topicsText: u.topics.join("\n") }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No units.</p>}
      </div>
    </div>
  );
}
