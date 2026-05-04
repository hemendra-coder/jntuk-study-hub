// Generic real-time content browser shared by /notes, /formulas, /papers.
// - Realtime list (Supabase channel)
// - Regulation → Year → Subject filters (matches the explorer flow)
// - Instant search + in-page preview + reliable download
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../integrations/supabase/client.ts";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Download, Eye, Loader2, FileText, X } from "lucide-react";

export type ContentRow = {
  id: string;
  title: string;
  description: string | null;
  storage_path: string;
  file_size: number | null;
  tags: string[];
  created_at: string;
  view_count: number;
  download_count: number;
  subject_id: string | null;
  year: number | null;
};

interface SubjectRow {
  id: string;
  code: string;
  name: string;
  year: number | null;
  regulation: string;
}

interface Props {
  table: "notes" | "formulas" | "papers";
  heading: string;
  emptyHint: string;
}

export function ContentBrowser({ table, heading, emptyHint }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [regulation, setRegulation] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [subjectId, setSubjectId] = useState<string>("all");
  const [active, setActive] = useState<{ row: ContentRow; url: string } | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [{ data, error }, { data: subs }] = await Promise.all([
        supabase
          .from(table)
          .select("id,title,description,storage_path,file_size,tags,created_at,view_count,download_count,subject_id,year")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase.from("subjects").select("id, code, name, year, regulation"),
      ]);
      if (!alive) return;
      if (error) toast.error(error.message);
      else setRows((data ?? []) as ContentRow[]);
      setSubjects((subs ?? []) as SubjectRow[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`${table}_changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        setRows((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as ContentRow, ...prev];
          if (payload.eventType === "UPDATE")
            return prev.map((p) => (p.id === (payload.new as ContentRow).id ? (payload.new as ContentRow) : p));
          if (payload.eventType === "DELETE")
            return prev.filter((p) => p.id !== (payload.old as ContentRow).id);
          return prev;
        });
      })
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [table]);

  // Cascade options
  const regulations = useMemo(
    () => Array.from(new Set(subjects.map((s) => s.regulation))).filter(Boolean).sort(),
    [subjects],
  );
  const years = useMemo(() => {
    const pool = subjects.filter((s) => regulation === "all" || s.regulation === regulation);
    return Array.from(new Set(pool.map((s) => s.year).filter((y): y is number => y != null))).sort((a, b) => a - b);
  }, [subjects, regulation]);
  const subjectOptions = useMemo(() => {
    return subjects
      .filter((s) => regulation === "all" || s.regulation === regulation)
      .filter((s) => year === "all" || String(s.year) === year)
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [subjects, regulation, year]);

  // Reset cascading selections when parent changes
  useEffect(() => { setYear("all"); setSubjectId("all"); }, [regulation]);
  useEffect(() => { setSubjectId("all"); }, [year]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allowedSubjectIds = new Set(subjectOptions.map((s) => s.id));
    return rows.filter((p) => {
      // Filter by regulation/year via the subject pool
      if (regulation !== "all" || year !== "all") {
        if (!p.subject_id || !allowedSubjectIds.has(p.subject_id)) return false;
      }
      if (subjectId !== "all" && p.subject_id !== subjectId) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.description ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, regulation, year, subjectId, subjectOptions]);

  const openViewer = async (row: ContentRow) => {
    setOpening(row.id);
    try {
      const { data, error } = await supabase.storage.from("pdfs").createSignedUrl(row.storage_path, 3600);
      if (error) throw error;
      setActive({ row, url: data.signedUrl });
      if (user?.id) supabase.from("file_views").insert({ pdf_id: row.id, action: "view", user_id: user.id });
    } catch (e: any) {
      toast.error(e.message ?? "Could not open file");
    } finally {
      setOpening(null);
    }
  };

  const downloadFile = async (row: ContentRow) => {
    try {
      const filename = row.title.endsWith(".pdf") ? row.title : `${row.title}.pdf`;
      const { data, error } = await supabase.storage
        .from("pdfs")
        .createSignedUrl(row.storage_path, 3600, { download: filename });
      if (error) throw error;
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (user?.id) supabase.from("file_views").insert({ pdf_id: row.id, action: "download", user_id: user.id });
    } catch (e: any) {
      toast.error(e.message ?? "Download failed");
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{heading}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Filter by regulation, year and subject. Updates live as new files are uploaded.
        </p>
      </div>

      {active && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="truncate">{active.row.title}</CardTitle>
              {active.row.description && (
                <CardDescription className="mt-1 line-clamp-2">{active.row.description}</CardDescription>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => downloadFile(active.row)}>
                <Download className="h-4 w-4 mr-1.5" /> Download
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setActive(null)} aria-label="Close viewer">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <iframe
              key={active.url}
              src={active.url}
              title={active.row.title}
              className="w-full rounded-lg border border-border bg-muted"
              style={{ height: "70vh" }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              If the preview doesn't load,{" "}
              <button onClick={() => downloadFile(active.row)} className="text-primary underline">
                download it instead
              </button>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cascade filters */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Select value={regulation} onValueChange={setRegulation}>
          <SelectTrigger><SelectValue placeholder="Regulation" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regulations</SelectItem>
            {regulations.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear} disabled={years.length === 0}>
          <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={subjectId} onValueChange={setSubjectId} disabled={subjectOptions.length === 0}>
          <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjectOptions.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, or tag…"
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {filtered.length} of {rows.length}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">{rows.length === 0 ? emptyHint : "No matches for these filters."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base line-clamp-2">{p.title}</CardTitle>
                {p.description && <CardDescription className="line-clamp-2">{p.description}</CardDescription>}
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-3">
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  <span>👁 {p.view_count} · ⬇ {p.download_count}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => openViewer(p)} disabled={opening === p.id}>
                    {opening === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Eye className="h-4 w-4 mr-1.5" /> View</>)}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadFile(p)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
