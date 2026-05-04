import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client.ts";
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

interface Subject {
  id: string;
  year: number;
  code: string;
  name: string;
  regulation: string;
  sort_order: number;
}

function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filter, setFilter] = useState<{ year?: string; regulation?: string }>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Subject> | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("subjects")
      .select("id, year, code, name, regulation, sort_order")
      .order("regulation").order("year").order("sort_order");
    setSubjects((data ?? []) as Subject[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = subjects.filter((s) =>
    (!filter.year || s.year === Number(filter.year)) &&
    (!filter.regulation || s.regulation === filter.regulation)
  );

  const save = async () => {
    if (!editing?.year || !editing.code || !editing.name) {
      toast.error("Year, code and name are required");
      return;
    }
    const payload = {
      year: editing.year,
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

  // Seeds subjects + units from the bundled JNTUK data, deduplicating by
  // (regulation, year, code) so the same subject isn't repeated for every branch.
  const seedFromCode = async () => {
    if (!confirm("Seed subjects + units from JNTUK data (deduplicated by year + code)?")) return;

    type SubjectKey = string; // `${regulation}|${year}|${code}`
    const subjectMap = new Map<SubjectKey, { regulation: string; year: number; code: string; name: string; sort_order: number }>();
    const unitsByKey = new Map<SubjectKey, { unit_number: number; title: string; topics: string[] }[]>();

    for (const reg of regulations) {
      for (const br of reg.branches) {
        for (const yr of br.years) {
          for (const sm of yr.semesters) {
            sm.subjects.forEach((sub, idx) => {
              const key = `${reg.code}|${yr.number}|${sub.code}`;
              if (!subjectMap.has(key)) {
                subjectMap.set(key, {
                  regulation: reg.code, year: yr.number,
                  code: sub.code, name: sub.name, sort_order: idx,
                });
                unitsByKey.set(key, sub.units.map((u, i) => ({
                  unit_number: i + 1, title: u.title, topics: u.topics ?? [],
                })));
              }
            });
          }
        }
      }
    }

    const subjectRows = Array.from(subjectMap.values());
    const { error: subErr } = await supabase
      .from("subjects")
      .upsert(subjectRows, { onConflict: "regulation,year,code" });
    if (subErr) { toast.error("Subjects: " + subErr.message); return; }

    const { data: refreshed } = await supabase
      .from("subjects").select("id, regulation, year, code");
    const idMap = new Map<string, string>();
    (refreshed ?? []).forEach((s: any) => idMap.set(`${s.regulation}|${s.year}|${s.code}`, s.id));

    const unitRows: { subject_id: string; unit_number: number; title: string; topics: string[] }[] = [];
    unitsByKey.forEach((units, key) => {
      const id = idMap.get(key);
      if (!id) return;
      units.forEach((u) => unitRows.push({ subject_id: id, ...u }));
    });

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
              <Button onClick={() => setEditing({ regulation: "R23", year: 1 })}><Plus className="h-4 w-4 mr-2" />New</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} subject</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Year</Label><Input type="number" min={1} max={4} value={editing?.year ?? ""} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} /></div>
                  <div><Label>Regulation</Label>
                    <Select value={editing?.regulation ?? "R23"} onValueChange={(v) => setEditing({ ...editing, regulation: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="R20">R20</SelectItem><SelectItem value="R23">R23</SelectItem></SelectContent>
                    </Select>
                  </div>
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
        <CardContent className="pt-4 grid sm:grid-cols-2 gap-2">
          <Select value={filter.regulation ?? "all"} onValueChange={(v) => setFilter({ ...filter, regulation: v === "all" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="All regulations" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All regulations</SelectItem><SelectItem value="R20">R20</SelectItem><SelectItem value="R23">R23</SelectItem></SelectContent>
          </Select>
          <Select value={filter.year ?? "all"} onValueChange={(v) => setFilter({ ...filter, year: v === "all" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{[1,2,3,4].map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-4 flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{s.code} — {s.name}</div>
                <div className="text-xs text-muted-foreground">{s.regulation} · Year {s.year}</div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No subjects.</p>}
      </div>
    </div>
  );
}
