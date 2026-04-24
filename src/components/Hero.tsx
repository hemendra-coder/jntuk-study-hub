import { ArrowRight, GraduationCap, BookOpen, Bot, FileText } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden px-4 py-16 sm:px-6 lg:py-0">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-primary opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full bg-accent-teal opacity-15 blur-[120px]" />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {[
          { top: "15%", left: "20%", delay: "0s" },
          { top: "30%", left: "70%", delay: "3s" },
          { top: "60%", left: "15%", delay: "6s" },
          { top: "75%", left: "60%", delay: "9s" },
          { top: "45%", left: "85%", delay: "12s" },
          { top: "85%", left: "40%", delay: "15s" },
        ].map((p, i) => (
          <div
            key={i}
            className="animate-float absolute h-1.5 w-1.5 rounded-full bg-primary"
            style={{ top: p.top, left: p.left, animationDelay: p.delay }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-5">
        {/* Left content */}
        <div className="lg:col-span-3">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wide text-primary">
            🎓 JNTUK Official Study Platform
          </div>

          <h1 className="font-display text-[36px] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[56px]">
            <span className="block text-foreground">Your Complete</span>
            <span className="block text-gradient-hero">JNTUK Study Companion</span>
          </h1>

          <p className="mt-6 max-w-[520px] text-base text-muted-foreground sm:text-[17px]">
            Access syllabus, curated notes, formula sheets, YouTube lectures and an AI-powered doubt solver — all in one place for R20 & R23 students.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-cta px-7 text-sm font-medium text-white shadow-glow-purple transition-transform hover:scale-105 active:scale-95">
              Explore R20
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-primary px-7 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 active:scale-95">
              Explore R23
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <p className="mt-6 text-sm text-text-muted">
            ✦ Free forever &nbsp; ✦ No login required &nbsp; ✦ Updated regularly
          </p>
        </div>

        {/* Right mockup stack */}
        <div className="relative lg:col-span-2">
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-hero opacity-20 blur-3xl" />

          <div className="relative space-y-4">
            {/* Card 1 */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card-hover">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Syllabus</p>
                  <p className="text-xs text-muted-foreground">Data Structures</p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-card-elevated">
                <div className="h-full w-3/4 rounded-full bg-gradient-cta" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Unit 4 of 5 complete</p>
            </div>

            {/* Card 2 */}
            <div className="ml-8 rounded-2xl border border-border bg-card p-5 shadow-glow-purple">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-cta">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-foreground">AI Bot</p>
              </div>
              <div className="rounded-xl bg-card-elevated p-3 text-sm text-foreground">
                Unit 3 of DBMS covers Relational Algebra and SQL queries...
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-teal/15">
                  <FileText className="h-5 w-5 text-accent-teal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Formula Sheet</p>
                  <p className="text-xs text-muted-foreground">Mathematics – I</p>
                </div>
              </div>
              <div className="space-y-1 font-mono text-xs text-muted-foreground">
                <p>∫ eˣ dx = eˣ + C</p>
                <p>d/dx (sin x) = cos x</p>
                <p>lim (1 + 1/n)ⁿ = e</p>
              </div>
            </div>

            <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-card-elevated text-2xl shadow-glow-teal">
              📚
            </div>
            <div className="absolute -bottom-2 -left-2 flex h-12 w-12 items-center justify-center rounded-full bg-card-elevated text-2xl shadow-glow-purple">
              🤖
            </div>
            <GraduationCap className="absolute -right-4 top-1/2 h-8 w-8 text-accent-teal opacity-60" />
          </div>
        </div>
      </div>
    </section>
  );
}
