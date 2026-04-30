import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  ListTree,
  FileText,
  BarChart3,
  LogOut,
  Home,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { to: "/admin/units", label: "Units", icon: ListTree },
  { to: "/admin/pdfs", label: "PDFs", icon: FileText },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <aside className="w-60 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="text-lg font-bold">Admin Panel</div>
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted">
            <Home className="h-4 w-4" /> Back to site
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3" onClick={() => { signOut(); navigate({ to: "/" }); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
