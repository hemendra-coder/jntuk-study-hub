import { Bot, Check, ArrowRight, User } from "lucide-react";

const features = [
  "Answers from actual JNTUK content",
  "Subject-specific knowledge",
  "Available 24/7, completely free",
  "Cites sources from your syllabus",
];

export function AIBotPreview() {
  return (
    <section className="bg-card px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            🤖 Powered by RAG Technology
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Meet Your Personal <span className="text-gradient-hero">JNTUK Study Assistant</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Our AI bot is trained on actual JNTUK syllabus, notes and previous papers. Ask it anything — from explaining a concept to solving a formula.
          </p>

          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-teal/20">
                  <Check className="h-3 w-3 text-accent-teal" />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <button className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-cta px-7 text-sm font-medium text-white shadow-glow-purple transition-transform hover:scale-105 active:scale-95">
            Try AI Bot Now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right chat mockup */}
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-hero opacity-15 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-card-hover">
            <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-cta">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">JNTUK AI</p>
                <p className="text-xs text-accent-teal">● Online</p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {/* User msg */}
              <div className="flex justify-end gap-2">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-cta px-4 py-2.5 text-sm text-white">
                  Explain Unit 3 of DBMS in simple terms
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card-elevated">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Bot msg */}
              <div className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-cta">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-card-elevated px-4 py-3 text-sm text-foreground">
                  Unit 3 of DBMS covers <span className="text-primary">Relational Algebra</span> and <span className="text-accent-teal">SQL</span>. The key topics are select, project, join operations and writing queries to retrieve data...
                  <p className="mt-2 text-xs text-text-muted">📚 Source: Unit 3 — DBMS Syllabus</p>
                </div>
              </div>

              {/* Typing */}
              <div className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-cta">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-card-elevated px-4 py-3">
                  <span className="animate-typing-dot h-2 w-2 rounded-full bg-muted-foreground" style={{ animationDelay: "0s" }} />
                  <span className="animate-typing-dot h-2 w-2 rounded-full bg-muted-foreground" style={{ animationDelay: "0.2s" }} />
                  <span className="animate-typing-dot h-2 w-2 rounded-full bg-muted-foreground" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
