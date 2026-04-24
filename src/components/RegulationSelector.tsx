import { ArrowRight } from "lucide-react";

type Reg = {
  badge: string;
  heading: string;
  desc: string;
  bullets: string[];
  accent: "purple" | "teal";
};

const regs: Reg[] = [
  {
    badge: "R20 Regulation",
    heading: "2020 Batch & Onwards",
    desc: "For students admitted from 2020. Covers 4 years, 8 semesters across all branches with updated curriculum.",
    bullets: ["9 Engineering Branches", "500+ Study Resources", "AI-Powered Support"],
    accent: "purple",
  },
  {
    badge: "R23 Regulation",
    heading: "2023 Batch & Onwards",
    desc: "Latest regulation for 2023 admitted students. Revised syllabus with modern subjects like AI, ML and Data Science.",
    bullets: ["Modern AI/ML Subjects", "Updated Curriculum", "Data Science Track"],
    accent: "teal",
  },
];

export function RegulationSelector() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="mb-12 text-center font-display text-3xl font-semibold text-foreground sm:text-[32px]">
          Choose Your Regulation
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {regs.map((r) => {
            const isPurple = r.accent === "purple";
            const accentColor = isPurple ? "text-primary" : "text-accent-teal";
            const accentBg = isPurple ? "bg-primary/15" : "bg-accent-teal/15";
            const borderL = isPurple ? "border-l-primary" : "border-l-accent-teal";
            const dotBg = isPurple ? "bg-primary" : "bg-accent-teal";
            const btnClass = isPurple
              ? "bg-gradient-cta text-white shadow-glow-purple"
              : "bg-accent-teal text-background shadow-glow-teal";

            return (
              <div
                key={r.badge}
                className={`relative overflow-hidden rounded-2xl border border-border border-l-4 ${borderL} bg-gradient-to-br from-card to-card-elevated p-8 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-card-hover`}
              >
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${accentBg} ${accentColor}`}
                >
                  {r.badge}
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                  {r.heading}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{r.desc}</p>

                <ul className="mt-6 space-y-3">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-sm text-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${dotBg}`} />
                      {b}
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-8 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium transition-transform hover:scale-105 active:scale-95 ${btnClass}`}
                >
                  Explore {r.badge.split(" ")[0]}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
