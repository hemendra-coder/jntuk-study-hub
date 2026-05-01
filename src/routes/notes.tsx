import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Search, Upload, Download, Eye, Loader2, FileText, X } from "lucide-react";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
});

type PdfRow = {
  id: string;
  title: string;
  description: string | null;
  storage_path: string;
  file_size: number | null;
  tags: string[];
  created_at: string;
  uploaded_by: string | null;
  view_count: number;
  download_count: number;
};

function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [pdfs, setPdfs] = useState<PdfRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<{ pdf: PdfRow; url: string } | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  // Redirect to /auth if not signed in
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  // Initial load + Realtime subscription (Supabase equivalent of Firestore onSnapshot)
  useEffect(() => {
    if (!user) return;
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("pdf_files")
        .select("id,title,description,storage_path,file_size,tags,created_at,uploaded_by,view_count,download_count")
        .order("created_at", { ascending: false })
        .limit(500);
      if (!active) return;
      if (error) toast.error(error.message);
      else setPdfs((data ?? []) as PdfRow[]);
      setLoadingList(false);
    };
    load();

    const channel = supabase
      .channel("pdf_files_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "pdf_files" }, (payload) => {
        setPdfs((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as PdfRow, ...prev];
          if (payload.eventType === "UPDATE") return prev.map((p) => (p.id === (payload.new as PdfRow).id ? (payload.new as PdfRow) : p));
          if (payload.eventType === "DELETE") return prev.filter((p) => p.id !== (payload.old as PdfRow).id);
          return prev;
        });
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Case-insensitive instant search across title/description/tags
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pdfs;
    return pdfs.filter((p) => {
      const hay = `${p.title} ${p.description ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [pdfs, query]);

  // Open inline viewer (signed URL, 1h)
  const openViewer = async (pdf: PdfRow) => {
    setOpening(pdf.id);
    try {
      const { data, error } = await supabase.storage.from("pdfs").createSignedUrl(pdf.storage_path, 3600);
      if (error) throw error;
      setActive({ pdf, url: data.signedUrl });
      // bump view count (trigger handles increment)
      supabase.from("file_views").insert({ pdf_id: pdf.id, action: "view", user_id: user?.id ?? null });
    } catch (e: any) {
      toast.error(e.message ?? "Could not open PDF");
    } finally {
      setOpening(null);
    }
  };

  // Force download via signed URL with download flag
  const downloadPdf = async (pdf: PdfRow) => {
    try {
      const filename = pdf.title.endsWith(".pdf") ? pdf.title : `${pdf.title}.pdf`;
      const { data, error } = await supabase.storage
        .from("pdfs")
        .createSignedUrl(pdf.storage_path, 3600, { download: filename });
      if (error) throw error;
      // Trigger browser download
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      supabase.from("file_views").insert({ pdf_id: pdf.id, action: "download", user_id: user?.id ?? null });
    } catch (e: any) {
      toast.error(e.message ?? "Download failed");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Notes Library</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            All shared PDFs in one place. Updates live as new files are uploaded.
          </p>
        </div>

        {/* Inline viewer (top of page when active) */}
        {active && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="truncate">{active.pdf.title}</CardTitle>
                {active.pdf.description && (
                  <CardDescription className="mt-1 line-clamp-2">{active.pdf.description}</CardDescription>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => downloadPdf(active.pdf)}>
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
                title={active.pdf.title}
                className="w-full rounded-lg border border-border bg-muted"
                style={{ height: "70vh" }}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                If the preview doesn't load,{" "}
                <button onClick={() => downloadPdf(active.pdf)} className="text-primary underline">
                  download it instead
                </button>
                .
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upload form */}
        <UploadForm userId={user.id} />

        {/* Search */}
        <div className="mt-8 mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes by title, description, or tag..."
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filtered.length} of {pdfs.length}
          </span>
        </div>

        {/* List */}
        {loadingList ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {pdfs.length === 0 ? "No notes uploaded yet. Be the first to share!" : "No notes match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base line-clamp-2">{p.title}</CardTitle>
                  {p.description && (
                    <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                  )}
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
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => openViewer(p)}
                      disabled={opening === p.id}
                    >
                      {opening === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1.5" /> View
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(p)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function UploadForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a PDF file first");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setUploading(true);
    try {
      // Path: <user_id>/<timestamp>-<sanitized-name>
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${Date.now()}-${safeName}`;

      const { error: upErr } = await supabase.storage
        .from("pdfs")
        .upload(path, file, { contentType: "application/pdf", upsert: false });
      if (upErr) throw upErr;

      const tagArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { error: insErr } = await supabase.from("pdf_files").insert({
        title: title.trim(),
        description: description.trim() || null,
        storage_path: path,
        file_size: file.size,
        mime_type: "application/pdf",
        tags: tagArr,
        uploaded_by: userId,
      });
      if (insErr) throw insErr;

      toast.success("Uploaded! It will appear in the list instantly.");
      setTitle("");
      setDescription("");
      setTags("");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Share a new PDF</CardTitle>
        <CardDescription>Any signed-in user can upload. PDFs only, max ~50MB.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="file">PDF file</Label>
            <Input
              ref={inputRef}
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. DSA Unit 3 Notes" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="cse, dsa, unit3" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary (optional)" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? "Uploading..." : "Upload PDF"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
