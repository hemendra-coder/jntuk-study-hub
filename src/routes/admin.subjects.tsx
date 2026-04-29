import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { regulations } from "@/data/jntukData";

export const Route = createFileRoute("/admin/subjects")({
  component: SubjectsPage,
});

interface BranchRow { id: string; code: string; name: string }
interface Subject {
  id: string;
  branch_id: string;
  year: number;
  semester: number;
  code: string;
  name: string;
  regulation: string;
  sort_order: number;
}

function SubjectsPage() {
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filter, setFilter] = useState<{ branch?: string; year?: string; sem?: string }>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Subject> | null>(null);

  const load = async () => {
    const [{ data: b }, { data: s }] = await Promise.all([
      supabase.from("branches").select("*").order("sort_order"),
      supabase.from("subjects").select("*").order("year").order("semester").order("sort_order"),
    ]);
    setBranches((b ?? []) as BranchRow[]);
    setSubjects((s ?? []) as Subject[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = subjects.filter((s) =>
    (!filter.branch || s.branch_id === filter.branch) &&
    (!filter.year || s.year === Number(filter.year)) &&
    (!filter.sem || s.semester === Number(filter.sem))
  );

  const save = async () => {
    if (!editing?.branch_id || !editing.year || !editing.semester || !editing.code || !editing.name) {
      toast.error("Fill all required fields");
      return;
    }
    const payload = {
      branch_id: editing.branch_id,
      year: editing.year,
      semester: editing.semester,
      code: editing.code,
      name: editing.name,
      regulation: editing.regulation ?? "R23",
      sort_order: editing.sort_order ?? 0,
    };
    const { error } = editing.id
      ? await supabase.from("subjects").update(payload).eq("id", editing.id)
      : await supabase.from("subjects").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete subject and its units?")) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const seedFromCode = async () => {
    if (branches.length === 0) { toast.error("Seed branches first"); return; }
    if (!confirm("Seed subjects + units from JNTUK data for ALL branches you have created?")) return;

    const branchByCode = new Map(branches.map((b) => [b.code, b.id]));
    const subjectRows: any[] = [];
    const unitsToInsert: { subjectKey: string; unit_number: number; title: string; topics: string[] }[] = [];

    for (const reg of regulations) {
      for (const br of reg.branches) {
        const branch_id = branchByCode.get(br.code);
        if (!branch_id) continue;
        for (const yr of br.years) {
          for (const sm of yr.semesters) {
            sm.subjects.forEach((sub, idx) => {
              subjectRows.push({
                branch_id,
                year: yr.number,
                semester: sm.number,
                code: sub.code,
                name: sub.name,
                regulation: reg.code,
                sort_order: idx,
              });
              sub.units.forEach((u, ui) => {
                unitsToInsert.push({
                  subjectKey: `${branch_id}|${reg.code}|${yr.number}|${sm.number}|${sub.code}`,
                  unit_number: ui + 1,
                  title: u.title,
                  topics: u.topics ?? [],
                });
              });
            });
          }
        }
      }
    }

    const { error: subErr } = await supabase
      .from("subjects")
      .upsert(subjectRows, { onConflict: "branch_id,regulation,year,semester,code" });
    if (subErr) { toast.error("Subjects: " + subErr.message); return; }

    // refetch subjects to get ids
    const { data: refreshed } = await supabase.from("subjects").select("id, branch_id, regulation, year, semester, code");
    const idMap = new Map<string, string>();
    (refreshed ?? []).forEach((s: any) => idMap.set(`${s.branch_id}|${s.regulation}|${s.year}|${s.semester}|${s.code}`, s.id));
    const unitRows = unitsToInsert
      .map((u) => ({ subject_id: idMap.get(u.subjectKey)!, unit_number: u.unit_number, title: u.title, topics: u.topics }))
      .filter((u) => u.subject_id);

    // chunk insert
    for (let i = 0; i < unitRows.length; i += 500) {
      const chunk = unitRows.slice(i, i + 500);
      const { error } = await supabase.from("units").upsert(chunk, { onConflict: "subject_id,unit_number" });
      if (error) { toast.error("Units: " + error.message); return; }
    }
    toast.success(`Seeded ${subjectRows.length} subjects, ${unitRows.length} units`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {subjects.length}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedFromCode}>Seed from JNTUK data</Button>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ regulation: "R23" })}><Plus className="h-4 w-4 mr-2" />New</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} subject</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Branch</Label>
                  <Select value={editing?.branch_id} onValueChange={(v) => setEditing({ ...editing, branch_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Branch" /></SelectTrigger>
                    <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.code} — {b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>Year</Label><Input type="number" min={1} max={4} value={editing?.year ?? ""} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} /></div>
                  <div><Label>Sem</Label><Input type="number" min={1} max={2} value={editing?.semester ?? ""} onChange={(e) => setEditing({ ...editing, semester: Number(e.target.value) })} /></div>
                  <div><Label>Reg</Label><Input value={editing?.regulation ?? "R23"} onChange={(e) => setEditing({ ...editing, regulation: e.target.value })} /></div>
                </div>
                <div><Label>Code</Label><Input value={editing?.code ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></div>
                <div><Label>Name</Label><Input value={editing?.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <Button onClick={save} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 grid sm:grid-cols-3 gap-2">
          <Select value={filter.branch ?? "all"} onValueChange={(v) => setFilter({ ...filter, branch: v === "all" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="All branches" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All branches</SelectItem>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.code}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filter.year ?? "all"} onValueChange={(v) => setFilter({ ...filter, year: v === "all" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{[1,2,3,4].map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filter.sem ?? "all"} onValueChange={(v) => setFilter({ ...filter, sem: v === "all" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="All sems" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All sems</SelectItem><SelectItem value="1">Sem 1</SelectItem><SelectItem value="2">Sem 2</SelectItem></SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map((s) => {
          const br = branches.find((b) => b.id === s.branch_id);
          return (
            <Card key={s.id}>
              <CardContent className="pt-4 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{s.code} — {s.name}</div>
                  <div className="text-xs text-muted-foreground">{br?.code} · Y{s.year} S{s.semester} · {s.regulation}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No subjects.</p>}
      </div>
    </div>
  );
}
