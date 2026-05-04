import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../integrations/supabase/client.ts";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, PlayCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/videos")({ component: VideosPage });

type VideoRow = {
  id: string; title: string; description: string | null; url: string;
  thumbnail_url: string | null; tags: string[]; created_at: string; view_count: number;
};

function VideosPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<VideoRow[]>([]);
  const [query, setQuery] = useState("");
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase.from("videos")
        .select("id,title,description,url,thumbnail_url,tags,created_at,view_count")
        .order("created_at", { ascending: false }).limit(500);
      if (!alive) return;
      if (error) toast.error(error.message); else setRows((data ?? []) as VideoRow[]);
      setListLoading(false);
    };
    load();
    const channel = supabase.channel("videos_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, (payload) => {
        setRows((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as VideoRow, ...prev];
          if (payload.eventType === "UPDATE") return prev.map((r) => r.id === (payload.new as VideoRow).id ? (payload.new as VideoRow) : r);
          if (payload.eventType === "DELETE") return prev.filter((r) => r.id !== (payload.old as VideoRow).id);
          return prev;
        });
      }).subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.title} ${r.description ?? ""} ${(r.tags ?? []).join(" ")}`.toLowerCase().includes(q));
  }, [rows, query]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Video Lessons</h1>
          <p className="mt-2 text-sm text-muted-foreground">Curated video links. Updates live.</p>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search videos…" className="pl-9" />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{filtered.length} of {rows.length}</span>
        </div>
        {listLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <PlayCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">{rows.length === 0 ? "No videos yet." : "No matches."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <Card key={v.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base line-clamp-2">{v.title}</CardTitle>
                  {v.description && <CardDescription className="line-clamp-2">{v.description}</CardDescription>}
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-3">
                  {v.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {v.tags.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{t}</span>
                      ))}
                    </div>
                  )}
                  <a
                    href={v.url} target="_blank" rel="noreferrer noopener"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    <PlayCircle className="h-4 w-4" /> Watch
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
