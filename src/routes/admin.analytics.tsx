import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Download } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [topViews, setTopViews] = useState<any[]>([]);
  const [topDownloads, setTopDownloads] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [v, d, r] = await Promise.all([
        supabase.from("pdf_files").select("id, title, view_count, download_count").order("view_count", { ascending: false }).limit(10),
        supabase.from("pdf_files").select("id, title, view_count, download_count").order("download_count", { ascending: false }).limit(10),
        supabase.from("file_views").select("id, action, created_at, pdf_id, pdf_files(title)").order("created_at", { ascending: false }).limit(20),
      ]);
      setTopViews(v.data ?? []);
      setTopDownloads(d.data ?? []);
      setRecent(r.data ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-4 w-4" /> Most viewed</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y">
              {topViews.map((p) => (
                <li key={p.id} className="py-2 flex justify-between text-sm">
                  <span className="truncate">{p.title}</span>
                  <span className="font-medium">{p.view_count}</span>
                </li>
              ))}
              {topViews.length === 0 && <li className="text-sm text-muted-foreground">No data yet.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-4 w-4" /> Most downloaded</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y">
              {topDownloads.map((p) => (
                <li key={p.id} className="py-2 flex justify-between text-sm">
                  <span className="truncate">{p.title}</span>
                  <span className="font-medium">{p.download_count}</span>
                </li>
              ))}
              {topDownloads.length === 0 && <li className="text-sm text-muted-foreground">No data yet.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recent.map((r: any) => (
              <li key={r.id} className="py-2 flex justify-between text-sm">
                <span><span className="text-muted-foreground capitalize">{r.action}</span> · {r.pdf_files?.title ?? "—"}</span>
                <span className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
              </li>
            ))}
            {recent.length === 0 && <li className="text-sm text-muted-foreground">No activity yet.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
