import { GraduationCap, Github, Instagram, Send } from "lucide-react";
import { openAiBot, scrollToId } from "@/lib/navActions";

const socials = [
  { Icon: Github, href: "https://github.com", label: "GitHub" },
  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: Send, href: "https://t.me", label: "Telegram" },
];

const quickLinks: { label: string; action: () => void }[] = [
  { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  { label: "Regulations", action: () => scrollToId("explorer") },
  { label: "AI Bot", action: () => openAiBot() },
  { label: "Formula Sheets", action: () => scrollToId("explorer") },
];

const regLinks: { label: string; action: () => void }[] = [
  { label: "R20 Branches", action: () => scrollToId("explorer") },
  { label: "R23 Branches", action: () => scrollToId("explorer") },
  { label: "Previous Papers", action: () => scrollToId("explorer") },
  { label: "Notes Library", action: () => scrollToId("explorer") },
];

export function Footer() {
  return (
    <footer className="border-t border-border" style={{ backgroundColor: "#06060F" }}>
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-cta">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-foreground">JNTUK Study Hub</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop platform for JNTUK study materials, AI-powered learning, and exam prep.
            </p>
            <div className="mt-5 flex gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors hover:bg-primary hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <button onClick={l.action} className="hover:text-foreground">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Regulations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {regLinks.map((l) => (
                <li key={l.label}>
                  <button onClick={l.action} className="hover:text-foreground">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact
            </h4>
            <p className="text-sm text-muted-foreground">
              Have feedback or want to contribute? Reach out via our socials.
            </p>
            <p className="mt-3 text-xs text-text-muted">
              Disclaimer: Unofficial student-built platform. Always verify content with official JNTUK resources.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Built with <span className="text-destructive">❤️</span> for JNTUK Students — This is an unofficial student platform
        </div>
      </div>
    </footer>
  );
}
