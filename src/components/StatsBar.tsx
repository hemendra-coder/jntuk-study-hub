const stats = [
  { num: "2", label: "Regulations" },
  { num: "9+", label: "Branches" },
  { num: "8", label: "Semesters" },
  { num: "500+", label: "Subjects" },
  { num: "🤖", label: "AI-Powered Bot" },
];

export function StatsBar() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-border">
          {stats.map((s) => (
            <div key={s.label} className="px-4 text-center">
              <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                {s.num}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
