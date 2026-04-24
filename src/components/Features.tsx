import { BookOpen, FileText, Youtube, Calculator, FileStack, Bot } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  highlighted?: boolean;
};

const features: Feature[] = [
  {
    icon: BookOpen,
    iconColor: "text-primary",
    iconBg: "bg-primary/15",
    title: "Enhanced Syllabus",
    desc: "Unit-wise detailed syllabus for every subject across all branches and regulations",
  },
  {
    icon: FileText,
    iconColor: "text-accent-teal",
    iconBg: "bg-accent-teal/15",
    title: "Curated Notes",
    desc: "Hand-picked, student-verified notes in PDF and PPT format for every unit",
  },
  {
    icon: Youtube,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/15",
    title: "YouTube Lectures",
    desc: "Best YouTube video links carefully selected for each topic and unit",
  },
  {
    icon: Calculator,
    iconColor: "text-warning",
    iconBg: "bg-warning/15",
    title: "Formula Sheets",
    desc: "Quick-reference formula sheets for Maths, Physics, Chemistry and all core subjects",
  },
  {
    icon: FileStack,
    iconColor: "text-primary",
    iconBg: "bg-primary/15",
    title: "Previous Papers",
    desc: "Year-wise previous question papers from 2018 to 2024 with solutions",
  },
  {
    icon: Bot,
    iconColor: "text-white",
    iconBg: "bg-gradient-cta",
    title: "AI Doubt Solver",
    desc: "Ask any question and get answers based on your actual JNTUK syllabus content",
    highlighted: true,
  },
];

export function Features() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:py-[80px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-[32px]">
            Everything You Need to Crack Your Exams
          </h2>
          <p className="mt-3 text-muted-foreground">
            All study resources in one beautifully organised platform
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            const cardClass = f.highlighted
              ? "gradient-border p-7 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-card-hover"
              : "rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover:-translate-y-1.5 hover:border-primary hover:shadow-card-hover";

            return (
              <div key={f.title} className={`relative ${cardClass}`}>
                {f.highlighted && (
                  <span className="absolute right-4 top-4 rounded-full bg-destructive px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    New
                  </span>
                )}
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${f.iconBg}`}>
                  <Icon className={`h-6 w-6 ${f.iconColor}`} />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
