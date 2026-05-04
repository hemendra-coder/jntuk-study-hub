// Lists uploaded files for a given subject code + unit number, by content type.
// Used inside the home StudyExplorer's resource tabs so admin uploads appear
// instantly under the matching Regulation → Year → Subject → Unit selection.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Download, Eye, Loader2, Play, FileText } from "lucide-react";
import { toast } from "sonner";

type Table = "notes" | "formulas" | "papers" | "videos";

interface FileRow {
  id: string;
  title: string;
  description: string | null;
  storage_path: string;
  file_size: number | null;
  tags: string[];
  created_at: string;
}
interface VideoRow {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  tags: string[];
  created_at: string;
}

interface Props {
  table: Table;
  subjectCode: string;
  unitNumber: number;
}

export function UnitContentList({ table, subjectCode, unitNumber }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<(FileRow | VideoRow)[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      // Resolve all subject ids that share this code (across regulations/branches)
      const { data: subs } = await supabase
        .from("subjects")
        .select("id")
        .eq("code", subjectCode);
      const subjectIds = (subs ?? []).map((s) => s.id);
      if (subjectIds.length === 0) {
        if (alive) { setRows([]); setLoading(false); }
        return;
      }
      // Resolve units for these subjects + unit number
      const { data: us } = await supabase
        .from("units")
        .select("id")
        .in("subject_id", subjectIds)
        .eq("unit_number", unitNumber);
      const unitIds = (us ?? []).map((u) => u.id);

      // Fetch by unit OR (no unit set but matching subject) so older uploads still surface
      let query = supabase.from(table).select("*").order("created_at", { ascending: false });
      if (unitIds.length > 0) {
        query = query.or(`unit_id.in.(${unitIds.join(",")}),and(unit_id.is.null,subject_id.in.(${subjectIds.join(",")}))`);
      } else {
        query = query.in("subject_id", subjectIds);
      }
      const { data, error } = await query;
      if (!alive) return;
      if (error) toast.error(error.message);
      setRows((data ?? []) as any);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`unit_${table}_${subjectCode}_${unitNumber}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, load)
      .subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [table, subjectCode, unitNumber]);

  const openFile = async (r: FileRow) => {
    const { data, error } = await supabase.storage.from("pdfs").createSignedUrl(r.storage_path, 3600);
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    window.open(data.signedUrl, "_blank");
    if (user?.id) supabase.from("file_views").insert({ pdf_id: r.id, action: "view", user_id: user.id });
  };
  const downloadFile = async (r: FileRow) => {
    const filename = r.title.endsWith(".pdf") ? r.title : `${r.title}.pdf`;
    const { data, error } = await supabase.storage.from("pdfs").createSignedUrl(r.storage_path, 3600, { download: filename });
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    const a = document.createElement("a"); a.href = data.signedUrl; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    if (user?.id) supabase.from("file_views").insert({ pdf_id: r.id, action: "download", user_id: user.id });
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <FileText className="mx-auto h-7 w-7 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No {table} uploaded yet for this subject &amp; unit.
        </p>
      </div>
    );
  }

  if (table === "videos") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(rows as VideoRow[]).map((v) => (
          <a key={v.id} href={v.url} target="_blank" rel="noreferrer"
             className="group rounded-xl border border-border bg-card-elevated p-4 transition-colors hover:border-primary/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                <Play className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium group-hover:text-primary">{v.title}</p>
                {v.description && <p className="truncate text-xs text-muted-foreground">{v.description}</p>}
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {(rows as FileRow[]).map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-card-elevated p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{r.title}</p>
            {r.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.description}</p>}
            <p className="mt-1 text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
          </div>
          <div className="ml-3 flex shrink-0 gap-1">
            <button onClick={() => openFile(r)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-card" title="View">
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => downloadFile(r)} className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90" title="Download">
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
