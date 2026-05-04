import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookOpen, ListTree, Eye, Download } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ subjects: 0, units: 0, pdfs: 0, views: 0, downloads: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [s, u, p, recentPdfs] = await Promise.all([
        supabase.from("subjects").select("id", { count: "exact", head: true }),
        supabase.from("units").select("id", { count: "exact", head: true }),
        supabase.from("pdf_files").select("view_count, download_count"),
        supabase.from("pdf_files").select("id, title, created_at, view_count").order("created_at", { ascending: false }).limit(5),
      ]);
      const views = (p.data ?? []).reduce((a, r) => a + (r.view_count ?? 0), 0);
      const downloads = (p.data ?? []).reduce((a, r) => a + (r.download_count ?? 0), 0);
      setStats({
        subjects: s.count ?? 0,
        units: u.count ?? 0,
        pdfs: p.data?.length ?? 0,
        views,
        downloads,
      });
      setRecent(recentPdfs.data ?? []);
    })();
  }, []);

  const cards = [
    { label: "Subjects", value: stats.subjects, icon: BookOpen },
    { label: "Units", value: stats.units, icon: ListTree },
    { label: "PDFs", value: stats.pdfs, icon: FileText },
    { label: "Total Views", value: stats.views, icon: Eye },
    { label: "Downloads", value: stats.downloads, icon: Download },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your study content</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="pt-6">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div className="mt-2 text-2xl font-bold">{c.value}</div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent uploads</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No PDFs uploaded yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((r) => (
                <li key={r.id} className="py-2 flex justify-between text-sm">
                  <span className="font-medium">{r.title}</span>
                  <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
