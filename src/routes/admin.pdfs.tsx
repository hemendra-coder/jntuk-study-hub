import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Download, Eye, UploadCloud, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pdfs")({
  component: PdfsPage,
});

interface BranchRow { id: string; code: string; name: string }
interface SubjectRow { id: string; code: string; name: string; year: number; semester: number; branch_id: string }
interface UnitRow { id: string; subject_id: string; unit_number: number; title: string }
interface Pdf {
  id: string; title: string; description: string | null; storage_path: string; file_size: number | null;
  branch_id: string | null; subject_id: string | null; unit_id: string | null;
  year: number | null; semester: number | null; tags: string[];
  view_count: number; download_count: number; created_at: string;
}

function PdfsPage() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<{ branch?: string; year?: string; sem?: string; subject?: string }>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Pdf> & { tagsText?: string } | null>(null);

  // bulk upload defaults
  const [bulkBranch, setBulkBranch] = useState<string | undefined>();
  const [bulkSubject, setBulkSubject] = useState<string | undefined>();
  const [bulkUnit, setBulkUnit] = useState<string | undefined>();
  const [bulkTags, setBulkTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const load = async () => {
    const [{ data: b }, { data: s }, { data: u }, { data: p }] = await Promise.all([
      supabase.from("branches").select("*").order("sort_order"),
      supabase.from("subjects").select("id, code, name, year, semester, branch_id").order("name"),
      supabase.from("units").select("id, subject_id, unit_number, title").order("unit_number"),
      supabase.from("pdf_files").select("*").order("created_at", { ascending: false }),
    ]);
    setBranches((b ?? []) as BranchRow[]);
    setSubjects((s ?? []) as SubjectRow[]);
    setUnits((u ?? []) as UnitRow[]);
    setPdfs((p ?? []) as Pdf[]);
  };
  useEffect(() => { load(); }, []);

  const subjectsForBranch = useMemo(
    () => subjects.filter((s) => !bulkBranch || s.branch_id === bulkBranch),
    [subjects, bulkBranch]
  );
  const unitsForSubject = useMemo(
    () => units.filter((u) => !bulkSubject || u.subject_id === bulkSubject),
    [units, bulkSubject]
  );

  const filtered = pdfs.filter((p) =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) &&
    (!filter.branch || p.branch_id === filter.branch) &&
    (!filter.subject || p.subject_id === filter.subject) &&
    (!filter.year || p.year === Number(filter.year)) &&
    (!filter.sem || p.semester === Number(filter.sem))
  );

  const onDrop = useCallback(async (files: File[]) => {
    if (!user) return;
    const subj = subjects.find((s) => s.id === bulkSubject);
    const tags = bulkTags.split(",").map((t) => t.trim()).filter(Boolean);
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    let done = 0;
    for (const file of files) {
      try {
        const path = `${bulkBranch ?? "misc"}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("pdfs").upload(path, file, { contentType: file.type || "application/pdf" });
        if (upErr) throw upErr;
        const { error: insErr } = await supabase.from("pdf_files").insert({
          title: file.name.replace(/\.pdf$/i, ""),
          storage_path: path,
          file_size: file.size,
          mime_type: file.type || "application/pdf",
          branch_id: bulkBranch ?? null,
          subject_id: bulkSubject ?? null,
          unit_id: bulkUnit ?? null,
          year: subj?.year ?? null,
          semester: subj?.semester ?? null,
          tags,
          uploaded_by: user.id,
        });
        if (insErr) throw insErr;
      } catch (e: any) {
        toast.error(`${file.name}: ${e.message}`);
      }
      done++;
      setProgress({ done, total: files.length });
    }
    setUploading(false);
    toast.success(`Uploaded ${done} file(s)`);
    load();
  }, [user, bulkBranch, bulkSubject, bulkUnit, bulkTags, subjects]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    disabled: uploading,
  });

  const remove = async (p: Pdf) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await supabase.storage.from("pdfs").remove([p.storage_path]);
    const { error } = await supabase.from("pdf_files").delete().eq("id", p.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const download = async (p: Pdf) => {
    const { data, error } = await supabase.storage.from("pdfs").createSignedUrl(p.storage_path, 60);
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    if (user) await supabase.from("file_views").insert({ pdf_id: p.id, user_id: user.id, action: "download" });
    window.open(data.signedUrl, "_blank");
  };

  const view = async (p: Pdf) => {
    const { data, error } = await supabase.storage.from("pdfs").createSignedUrl(p.storage_path, 60);
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    if (user) await supabase.from("file_views").insert({ pdf_id: p.id, user_id: user.id, action: "view" });
    window.open(data.signedUrl, "_blank");
  };

  const saveEdit = async () => {
    if (!editing?.id) return;
    const tags = (editing.tagsText ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase.from("pdf_files").update({
      title: editing.title,
      description: editing.description,
      branch_id: editing.branch_id,
      subject_id: editing.subject_id,
      unit_id: editing.unit_id,
      year: editing.year,
      semester: editing.semester,
      tags,
    }).eq("id", editing.id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); setEditOpen(false); setEditing(null); load(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PDF Files</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} of {pdfs.length} files</p>
      </div>

      {/* Bulk upload */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="grid sm:grid-cols-4 gap-2">
            <Select value={bulkBranch ?? "none"} onValueChange={(v) => { setBulkBranch(v === "none" ? undefined : v); setBulkSubject(undefined); setBulkUnit(undefined); }}>
              <SelectTrigger><SelectValue placeholder="Branch" /></SelectTrigger>
              <SelectContent><SelectItem value="none">— Branch —</SelectItem>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.code}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={bulkSubject ?? "none"} onValueChange={(v) => { setBulkSubject(v === "none" ? undefined : v); setBulkUnit(undefined); }}>
              <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent><SelectItem value="none">— Subject —</SelectItem>{subjectsForBranch.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={bulkUnit ?? "none"} onValueChange={(v) => setBulkUnit(v === "none" ? undefined : v)}>
              <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
              <SelectContent><SelectItem value="none">— Unit —</SelectItem>{unitsForSubject.map((u) => <SelectItem key={u.id} value={u.id}>U{u.unit_number}: {u.title}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Tags (comma separated)" value={bulkTags} onChange={(e) => setBulkTags(e.target.value)} />
          </div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm">
              {uploading
                ? `Uploading ${progress.done}/${progress.total}…`
                : isDragActive
                ? "Drop the PDFs here"
                : "Drag & drop PDFs here, or click to pick. Multiple files supported."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Files inherit Branch / Subject / Unit / Year / Sem from the selectors above.</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card><CardContent className="pt-4 grid sm:grid-cols-5 gap-2">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search title or tag…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter.branch ?? "all"} onValueChange={(v) => setFilter({ ...filter, branch: v === "all" ? undefined : v, subject: undefined })}>
          <SelectTrigger><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All branches</SelectItem>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.code}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filter.year ?? "all"} onValueChange={(v) => setFilter({ ...filter, year: v === "all" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{[1,2,3,4].map((y) => <SelectItem key={y} value={String(y)}>Y{y}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filter.sem ?? "all"} onValueChange={(v) => setFilter({ ...filter, sem: v === "all" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Sem" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All sems</SelectItem><SelectItem value="1">S1</SelectItem><SelectItem value="2">S2</SelectItem></SelectContent>
        </Select>
      </CardContent></Card>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((p) => {
          const br = branches.find((b) => b.id === p.branch_id);
          const sub = subjects.find((s) => s.id === p.subject_id);
          const un = units.find((u) => u.id === p.unit_id);
          return (
            <Card key={p.id}>
              <CardContent className="pt-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {br?.code ?? "—"} · {sub ? `${sub.code}` : "—"} · {un ? `U${un.unit_number}` : "—"} · {p.year ? `Y${p.year}` : ""} {p.semester ? `S${p.semester}` : ""}
                    {p.file_size ? ` · ${(p.file_size/1024/1024).toFixed(2)} MB` : ""}
                  </div>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {p.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">👁 {p.view_count} · ⬇ {p.download_count}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => view(p)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => download(p)}><Download className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...p, tagsText: p.tags.join(", ") }); setEditOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No PDFs.</p>}
      </div>

      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit PDF</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Branch</Label>
                  <Select value={editing.branch_id ?? "none"} onValueChange={(v) => setEditing({ ...editing, branch_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">—</SelectItem>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.code}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Year</Label><Input type="number" min={1} max={4} value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) || null })} /></div>
                <div><Label>Sem</Label><Input type="number" min={1} max={2} value={editing.semester ?? ""} onChange={(e) => setEditing({ ...editing, semester: Number(e.target.value) || null })} /></div>
              </div>
              <div><Label>Subject</Label>
                <Select value={editing.subject_id ?? "none"} onValueChange={(v) => setEditing({ ...editing, subject_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">—</SelectItem>{subjects.filter((s) => !editing.branch_id || s.branch_id === editing.branch_id).map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Unit</Label>
                <Select value={editing.unit_id ?? "none"} onValueChange={(v) => setEditing({ ...editing, unit_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">—</SelectItem>{units.filter((u) => !editing.subject_id || u.subject_id === editing.subject_id).map((u) => <SelectItem key={u.id} value={u.id}>U{u.unit_number}: {u.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Tags (comma separated)</Label><Input value={editing.tagsText ?? ""} onChange={(e) => setEditing({ ...editing, tagsText: e.target.value })} /></div>
              <Button onClick={saveEdit} className="w-full">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
