import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, Search, Moon, Sparkles, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" as const },
  { label: "Regulations", to: "/" as const },
  { label: "Subjects", to: "/" as const },
  { label: "Formula Sheets", to: "/" as const },
  { label: "AI Bot", to: "/" as const },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

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
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              to={link.to}
              className={`relative text-sm transition-colors ${
                i === 0
                  ? "text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            <Search className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            <Moon className="h-5 w-5" />
          </button>
          <button className="ml-2 inline-flex h-10 items-center gap-2 rounded-full bg-gradient-cta px-5 text-sm font-medium text-white shadow-glow-purple transition-transform hover:scale-105 active:scale-95">
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
              {navLinks.map((link, i) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-3 text-base ${
                    i === 0
                      ? "bg-card-elevated text-foreground"
                      : "text-muted-foreground hover:bg-card-elevated hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-cta px-6 text-sm font-medium text-white shadow-glow-purple">
                <Sparkles className="h-4 w-4" />
                Ask AI
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
