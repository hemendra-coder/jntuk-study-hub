const steps = [
  { n: "1", title: "Choose Your Regulation & Branch" },
  { n: "2", title: "Select Year, Semester & Subject" },
  { n: "3", title: "Access Notes, Videos & Ask AI" },
];

export function HowItWorks() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="mb-14 text-center font-display text-3xl font-semibold text-foreground sm:text-[32px]">
          How It Works
        </h2>

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Dashed connector (desktop) */}
          <div
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-8 hidden h-px md:block"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, rgb(124 111 255 / 0.5) 0 8px, transparent 8px 16px)",
            }}
          />

          {steps.map((s) => (
            <div key={s.n} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-cta font-display text-2xl font-bold text-white shadow-glow-purple">
                {s.n}
              </div>
              <p className="mt-5 max-w-[220px] font-display text-base font-semibold text-foreground">
                {s.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
