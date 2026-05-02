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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Download, Eye, UploadCloud, Search, PlayCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { classifyByFilename, CONTENT_LABEL, type ContentType } from "@/lib/contentClassifier";

export const Route = createFileRoute("/admin/pdfs")({ component: PdfsPage });

interface SubjectRow { id: string; code: string; name: string; year: number | null }
interface UnitRow { id: string; subject_id: string; unit_number: number; title: string }
type ContentTable = "notes" | "formulas" | "papers";

interface ContentRow {
  id: string; title: string; description: string | null; storage_path: string;
  file_size: number | null; subject_id: string | null; unit_id: string | null;
  year: number | null; tags: string[]; view_count: number; download_count: number;
  created_at: string; exam_year?: number | null;
}
interface VideoRow {
  id: string; title: string; description: string | null; url: string;
  thumbnail_url: string | null; subject_id: string | null; unit_id: string | null;
  year: number | null; tags: string[]; view_count: number; created_at: string;
}

const TABLES: ContentTable[] = ["notes", "formulas", "papers"];

function PdfsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [content, setContent] = useState<Record<ContentTable, ContentRow[]>>({ notes: [], formulas: [], papers: [] });
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ContentTable | "videos">("notes");

  // Upload defaults
  const [bulkSubject, setBulkSubject] = useState<string | undefined>();
  const [bulkUnit, setBulkUnit] = useState<string | undefined>();
  const [bulkTags, setBulkTags] = useState("");
  const [overrideType, setOverrideType] = useState<ContentType | "auto">("auto");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [pendingFiles, setPendingFiles] = useState<{ file: File; type: ContentType }[]>([]);

  const load = async () => {
    const [{ data: s }, { data: u }, n, f, p, v] = await Promise.all([
      supabase.from("subjects").select("id, code, name, year").order("year").order("name"),
      supabase.from("units").select("id, subject_id, unit_number, title").order("unit_number"),
      supabase.from("notes").select("*").order("created_at", { ascending: false }),
      supabase.from("formulas").select("*").order("created_at", { ascending: false }),
      supabase.from("papers").select("*").order("created_at", { ascending: false }),
      supabase.from("videos").select("*").order("created_at", { ascending: false }),
    ]);
    setSubjects((s ?? []) as SubjectRow[]);
    setUnits((u ?? []) as UnitRow[]);
    setContent({
      notes: (n.data ?? []) as ContentRow[],
      formulas: (f.data ?? []) as ContentRow[],
      papers: (p.data ?? []) as ContentRow[],
    });
    setVideos((v.data ?? []) as VideoRow[]);
  };
  useEffect(() => { load(); }, []);

  const unitsForSubject = useMemo(
    () => units.filter((u) => !bulkSubject || u.subject_id === bulkSubject),
    [units, bulkSubject]
  );

  // When files are dropped, classify each and stage them for review
  const onDrop = useCallback((files: File[]) => {
    const staged = files.map((file) => ({
      file,
      type: overrideType === "auto" ? classifyByFilename(file.name) : (overrideType as ContentType),
    })).filter((s) => s.type !== "videos"); // videos uploaded via URL form
    setPendingFiles((prev) => [...prev, ...staged]);
  }, [overrideType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    disabled: uploading,
  });

  const setPendingType = (idx: number, type: ContentType) => {
    setPendingFiles((prev) => prev.map((p, i) => i === idx ? { ...p, type } : p));
  };
  const removePending = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadAll = async () => {
    if (!user || pendingFiles.length === 0) return;
    const subj = subjects.find((s) => s.id === bulkSubject);
    const tags = bulkTags.split(",").map((t) => t.trim()).filter(Boolean);
    setUploading(true);
    setProgress({ done: 0, total: pendingFiles.length });
    let done = 0;
    for (const item of pendingFiles) {
      try {
        if (item.type === "videos") continue;
        const folder = `${item.type}/${subj?.code ?? "misc"}`;
        const path = `${folder}/${Date.now()}-${item.file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("pdfs").upload(path, item.file, {
          contentType: item.file.type || "application/pdf",
        });
        if (upErr) throw upErr;
        const row: any = {
          title: item.file.name.replace(/\.pdf$/i, ""),
          storage_path: path,
          file_size: item.file.size,
          mime_type: item.file.type || "application/pdf",
          subject_id: bulkSubject ?? null,
          unit_id: bulkUnit ?? null,
          year: subj?.year ?? null,
          tags,
          uploaded_by: user.id,
        };
        const { error: insErr } = await supabase.from(item.type).insert(row);
        if (insErr) throw insErr;
      } catch (e: any) {
        toast.error(`${item.file.name}: ${e.message}`);
      }
      done++;
      setProgress({ done, total: pendingFiles.length });
    }
    setUploading(false);
    setPendingFiles([]);
    toast.success(`Uploaded ${done} file(s)`);
    load();
  };

  const remove = async (table: ContentTable, p: ContentRow) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await supabase.storage.from("pdfs").remove([p.storage_path]);
    const { error } = await supabase.from(table).delete().eq("id", p.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const view = async (p: ContentRow) => {
    const { data, error } = await supabase.storage.from("pdfs").createSignedUrl(p.storage_path, 3600);
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    window.open(data.signedUrl, "_blank");
  };

  const download = async (p: ContentRow) => {
    const filename = p.title.endsWith(".pdf") ? p.title : `${p.title}.pdf`;
    const { data, error } = await supabase.storage.from("pdfs").createSignedUrl(p.storage_path, 3600, { download: filename });
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    const a = document.createElement("a"); a.href = data.signedUrl; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const removeVideo = async (v: VideoRow) => {
    if (!confirm(`Delete "${v.title}"?`)) return;
    const { error } = await supabase.from("videos").delete().eq("id", v.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const filterRows = <T extends { title: string; tags: string[] }>(rows: T[]) =>
    rows.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Library</h1>
        <p className="text-sm text-muted-foreground">Notes · Formulas · Papers · Videos</p>
      </div>

      {/* Upload card */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="grid sm:grid-cols-4 gap-2">
            <Select value={bulkSubject ?? "none"} onValueChange={(v) => { setBulkSubject(v === "none" ? undefined : v); setBulkUnit(undefined); }}>
              <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent><SelectItem value="none">— Subject —</SelectItem>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={bulkUnit ?? "none"} onValueChange={(v) => setBulkUnit(v === "none" ? undefined : v)}>
              <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
              <SelectContent><SelectItem value="none">— Unit —</SelectItem>{unitsForSubject.map((u) => <SelectItem key={u.id} value={u.id}>U{u.unit_number}: {u.title}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={overrideType} onValueChange={(v) => setOverrideType(v as ContentType | "auto")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-classify (filename)</SelectItem>
                <SelectItem value="notes">Force: Notes</SelectItem>
                <SelectItem value="formulas">Force: Formulas</SelectItem>
                <SelectItem value="papers">Force: Papers</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Tags (comma)" value={bulkTags} onChange={(e) => setBulkTags(e.target.value)} />
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm">
              {isDragActive ? "Drop the PDFs here" : "Drag & drop PDFs here, or click to pick. Type is auto-detected from the filename — you can override below."}
            </p>
          </div>

          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Ready to upload ({pendingFiles.length})</div>
              {pendingFiles.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-2">
                  <div className="flex-1 min-w-0 truncate text-sm">{item.file.name}</div>
                  <Select value={item.type} onValueChange={(v) => setPendingType(idx, v as ContentType)}>
                    <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notes">{CONTENT_LABEL.notes}</SelectItem>
                      <SelectItem value="formulas">{CONTENT_LABEL.formulas}</SelectItem>
                      <SelectItem value="papers">{CONTENT_LABEL.papers}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => removePending(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              <Button onClick={uploadAll} disabled={uploading} className="w-full">
                {uploading ? `Uploading ${progress.done}/${progress.total}…` : `Upload ${pendingFiles.length} file(s)`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Video form */}
      <AddVideoCard subjects={subjects} units={units} onSaved={load} />

      {/* Filters */}
      <Card><CardContent className="pt-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search title or tag…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </CardContent></Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="notes">Notes ({content.notes.length})</TabsTrigger>
          <TabsTrigger value="formulas">Formulas ({content.formulas.length})</TabsTrigger>
          <TabsTrigger value="papers">Papers ({content.papers.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
        </TabsList>

        {TABLES.map((table) => (
          <TabsContent key={table} value={table} className="space-y-2 mt-4">
            {filterRows(content[table]).map((p) => {
              const sub = subjects.find((s) => s.id === p.subject_id);
              const un = units.find((u) => u.id === p.unit_id);
              return (
                <Card key={p.id}>
                  <CardContent className="pt-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {sub ? sub.code : "—"} · {un ? `U${un.unit_number}` : "—"} · {p.year ? `Year ${p.year}` : ""}
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
                      <Button size="icon" variant="ghost" onClick={() => remove(table, p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filterRows(content[table]).length === 0 && <p className="text-sm text-muted-foreground">No items.</p>}
          </TabsContent>
        ))}

        <TabsContent value="videos" className="space-y-2 mt-4">
          {filterRows(videos).map((v) => {
            const sub = subjects.find((s) => s.id === v.subject_id);
            return (
              <Card key={v.id}>
                <CardContent className="pt-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{v.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{v.url}</div>
                    <div className="text-xs text-muted-foreground">{sub ? sub.code : "—"}</div>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {v.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <a href={v.url} target="_blank" rel="noreferrer noopener" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted">
                      <PlayCircle className="h-4 w-4" />
                    </a>
                    <Button size="icon" variant="ghost" onClick={() => removeVideo(v)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filterRows(videos).length === 0 && <p className="text-sm text-muted-foreground">No videos.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddVideoCard({ subjects, units, onSaved }: { subjects: SubjectRow[]; units: UnitRow[]; onSaved: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [subjectId, setSubjectId] = useState<string | undefined>();
  const [unitId, setUnitId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!/^https?:\/\//i.test(url)) { toast.error("Enter a valid URL"); return; }
    setSaving(true);
    const subj = subjects.find((s) => s.id === subjectId);
    const { error } = await supabase.from("videos").insert({
      title: title.trim(),
      description: description.trim() || null,
      url: url.trim(),
      subject_id: subjectId ?? null,
      unit_id: unitId ?? null,
      year: subj?.year ?? null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      uploaded_by: user.id,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Video added");
    setTitle(""); setUrl(""); setDescription(""); setTags(""); setSubjectId(undefined); setUnitId(undefined);
    setOpen(false); onSaved();
  };

  const unitsForSubject = units.filter((u) => !subjectId || u.subject_id === subjectId);

  return (
    <Card>
      <CardContent className="pt-4">
        {!open ? (
          <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add a video link
          </Button>
        ) : (
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Video URL</Label><Input type="url" placeholder="https://youtube.com/..." value={url} onChange={(e) => setUrl(e.target.value)} required /></div>
            <div className="space-y-1"><Label>Subject</Label>
              <Select value={subjectId ?? "none"} onValueChange={(v) => { setSubjectId(v === "none" ? undefined : v); setUnitId(undefined); }}>
                <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent><SelectItem value="none">—</SelectItem>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Unit</Label>
              <Select value={unitId ?? "none"} onValueChange={(v) => setUnitId(v === "none" ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                <SelectContent><SelectItem value="none">—</SelectItem>{unitsForSubject.map((u) => <SelectItem key={u.id} value={u.id}>U{u.unit_number}: {u.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Tags (comma)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save video"}</Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
