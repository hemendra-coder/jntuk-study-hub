import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentBrowser } from "@/components/ContentBrowser";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/formulas")({ component: Page });

function Page() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ContentBrowser table="formulas" heading="Formula Sheets" emptyHint="No formula sheets uploaded yet." />
      <Footer />
    </div>
  );
}
