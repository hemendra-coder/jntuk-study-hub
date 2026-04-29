import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Search, Moon, Sun, Sparkles, Menu, X, Shield, LogIn, LogOut } from "lucide-react";
import {
  applyTheme,
  getStoredTheme,
  openAiBot,
  scrollToId,
  toggleTheme,
} from "@/lib/navActions";
import { useAuth } from "@/lib/auth";

type NavItem = { label: string; action: () => void };

const navItems: NavItem[] = [
  { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  { label: "Regulations", action: () => scrollToId("explorer") },
  { label: "Subjects", action: () => scrollToId("explorer") },
  { label: "Formula Sheets", action: () => scrollToId("explorer") },
  { label: "AI Bot", action: () => openAiBot() },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = getStoredTheme();
    applyTheme(t);
    setTheme(t);
  }, []);

  const onToggleTheme = () => setTheme(toggleTheme());

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-cta shadow-glow-purple">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            JNTUK Study Hub
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`relative text-sm transition-colors ${
                i === 0
                  ? "text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            onClick={openAiBot}
            className="ml-2 inline-flex h-10 items-center gap-2 rounded-full bg-gradient-cta px-5 text-sm font-medium text-white shadow-glow-purple transition-transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm border-l border-border bg-card p-6">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-lg font-bold">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setOpen(false);
                    item.action();
                  }}
                  className={`rounded-lg px-4 py-3 text-left text-base ${
                    i === 0
                      ? "bg-card-elevated text-foreground"
                      : "text-muted-foreground hover:bg-card-elevated hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  openAiBot();
                }}
                className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-cta px-6 text-sm font-medium text-white shadow-glow-purple"
              >
                <Sparkles className="h-4 w-4" />
                Ask AI
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Search dialog */}
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    // The explorer is the universal jumping-off point
    scrollToId("explorer");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-24">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-3 shadow-card-hover"
      >
        <div className="flex items-center gap-3 px-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subjects, units, formulas..."
            className="h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-card-elevated"
          >
            Esc
          </button>
        </div>
        <p className="mt-2 px-3 pb-2 text-xs text-muted-foreground">
          Press Enter to jump to the Explorer and pick your subject.
        </p>
      </form>
    </div>
  );
}
