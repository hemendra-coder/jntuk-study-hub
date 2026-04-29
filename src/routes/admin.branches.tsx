import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { branches as seedBranches } from "@/data/jntukData";

export const Route = createFileRoute("/admin/branches")({
  component: BranchesPage,
});

interface Branch {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
}

function BranchesPage() {
  const [list, setList] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Branch> | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("branches").select("*").order("sort_order");
    setList((data ?? []) as Branch[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.code || !editing?.name) {
      toast.error("Code and name required");
      return;
    }
    const payload = {
      code: editing.code.toUpperCase(),
      name: editing.name,
      description: editing.description ?? null,
      sort_order: editing.sort_order ?? 0,
    };
    const { error } = editing.id
      ? await supabase.from("branches").update(payload).eq("id", editing.id)
      : await supabase.from("branches").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      setOpen(false);
      setEditing(null);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this branch and ALL its subjects/units?")) return;
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  const seedFromCode = async () => {
    if (!confirm("Seed all branches from the built-in JNTUK data? Existing entries are preserved.")) return;
    const rows = seedBranches.map((b, i) => ({
      code: b.code,
      name: b.name,
      description: b.description ?? null,
      sort_order: i,
    }));
    const { error } = await supabase.from("branches").upsert(rows, { onConflict: "code" });
    if (error) toast.error(error.message);
    else { toast.success(`Seeded ${rows.length} branches`); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branches</h1>
          <p className="text-sm text-muted-foreground">{list.length} branches</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedFromCode}>Seed from JNTUK data</Button>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({})}><Plus className="h-4 w-4 mr-2" /> New</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing?.id ? "Edit branch" : "New branch"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Code</Label><Input value={editing?.code ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })} placeholder="CSE" /></div>
                <div><Label>Name</Label><Input value={editing?.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Computer Science & Engineering" /></div>
                <div><Label>Description</Label><Textarea value={editing?.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                <div><Label>Sort order</Label><Input type="number" value={editing?.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <Button onClick={save} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((b) => (
            <Card key={b.id}>
              <CardContent className="pt-4 flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{b.code} — {b.name}</div>
                  {b.description && <div className="text-xs text-muted-foreground mt-1">{b.description}</div>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && <p className="text-sm text-muted-foreground">No branches yet. Click "Seed from JNTUK data" to bootstrap.</p>}
        </div>
      )}
    </div>
  );
}
