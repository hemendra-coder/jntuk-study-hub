import { useEffect, useMemo, useState } from "react";
import { ChevronRight, BookOpen, FileText, Video, Calculator, FileQuestion, Bot, Download, Play } from "lucide-react";
import { regulations, type Resource } from "@/data/jntukData";
import { UnitBotChat } from "@/components/UnitBotChat";
import { OPEN_AI_BOT_EVENT } from "@/lib/navActions";

type Step = "regulation" | "branch" | "year" | "semester" | "subject" | "unit" | "resource";

const TABS = [
  { id: "syllabus", label: "Syllabus", icon: BookOpen },
  { id: "note", label: "Notes", icon: FileText },
  { id: "video", label: "Videos", icon: Video },
  { id: "formula", label: "Formulas", icon: Calculator },
  { id: "paper", label: "Papers", icon: FileQuestion },
  { id: "ai", label: "AI Bot", icon: Bot },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function StudyExplorer() {
  const [regCode, setRegCode] = useState<string>("");
  const [branchCode, setBranchCode] = useState<string>("");
  const [yearNum, setYearNum] = useState<string>("");
  const [semNum, setSemNum] = useState<string>("");
  const [subjectCode, setSubjectCode] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [tab, setTab] = useState<TabId>("syllabus");

  const regulation = useMemo(() => regulations.find((r) => r.code === regCode), [regCode]);
  const branch = useMemo(() => regulation?.branches.find((b) => b.code === branchCode), [regulation, branchCode]);
  const year = useMemo(() => branch?.years.find((y) => String(y.number) === yearNum), [branch, yearNum]);
  const semester = useMemo(() => year?.semesters.find((s) => String(s.number) === semNum), [year, semNum]);
  const subject = useMemo(() => semester?.subjects.find((s) => s.code === subjectCode), [semester, subjectCode]);
  const unit = useMemo(() => subject?.units.find((u) => u.id === unitId), [subject, unitId]);

  const reset = (from: Step) => {
    if (from === "regulation") {
      setBranchCode(""); setYearNum(""); setSemNum(""); setSubjectCode(""); setUnitId("");
    } else if (from === "branch") {
      setYearNum(""); setSemNum(""); setSubjectCode(""); setUnitId("");
    } else if (from === "year") {
      setSemNum(""); setSubjectCode(""); setUnitId("");
    } else if (from === "semester") {
      setSubjectCode(""); setUnitId("");
    } else if (from === "subject") {
      setUnitId("");
    }
  };

  const currentStep: Step = !regCode ? "regulation"
    : !branchCode ? "branch"
    : !yearNum ? "year"
    : !semNum ? "semester"
    : !subjectCode ? "subject"
    : !unitId ? "unit"
    : "resource";

  // Listen for global "open AI bot" requests from Navbar/Footer/etc.
  useEffect(() => {
    const handler = () => {
      // Auto-fill the first available path so the AI tab can render immediately.
      const r = regulations[0];
      const b = r?.branches[0];
      const y = b?.years[0];
      const s = y?.semesters[0];
      const sub = s?.subjects[0];
      const u = sub?.units[0];

      setRegCode((prev) => prev || r?.code || "");
      setBranchCode((prev) => prev || b?.code || "");
      setYearNum((prev) => prev || (y ? String(y.number) : ""));
      setSemNum((prev) => prev || (s ? String(s.number) : ""));
      setSubjectCode((prev) => prev || sub?.code || "");
      setUnitId((prev) => prev || u?.id || "");
      setTab("ai");
    };
    window.addEventListener(OPEN_AI_BOT_EVENT, handler);
    return () => window.removeEventListener(OPEN_AI_BOT_EVENT, handler);
  }, []);

  return (
    <section id="explorer" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
            Step-by-step explorer
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-[40px]">
            Find your study material in <span className="text-gradient-hero">6 simple steps</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Pick your regulation, branch, year, semester, subject and unit. Resources appear instantly.
          </p>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            regulation?.code,
            branch?.code,
            year?.label,
            semester ? `Sem ${semester.number}` : undefined,
            subject?.code,
            unit ? `Unit ${unit.number}` : undefined,
          ].filter(Boolean) as string[]}
        />

        {/* Selector card */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Selector
              label="1. Regulation"
              value={regCode}
              placeholder="Choose regulation"
              options={regulations.map((r) => ({ value: r.code, label: `${r.code} — ${r.description}` }))}
              onChange={(v) => { setRegCode(v); reset("regulation"); }}
              active={currentStep === "regulation"}
            />
            <Selector
              label="2. Branch"
              value={branchCode}
              placeholder={regulation ? "Choose branch" : "Select regulation first"}
              disabled={!regulation}
              options={regulation?.branches.map((b) => ({ value: b.code, label: `${b.emoji} ${b.code} — ${b.name}` })) ?? []}
              onChange={(v) => { setBranchCode(v); reset("branch"); }}
              active={currentStep === "branch"}
            />
            <Selector
              label="3. Year"
              value={yearNum}
              placeholder={branch ? "Choose year" : "Select branch first"}
              disabled={!branch}
              options={branch?.years.map((y) => ({ value: String(y.number), label: y.label })) ?? []}
              onChange={(v) => { setYearNum(v); reset("year"); }}
              active={currentStep === "year"}
            />
            <Selector
              label="4. Semester"
              value={semNum}
              placeholder={year ? "Choose semester" : "Select year first"}
              disabled={!year}
              options={year?.semesters.map((s) => ({ value: String(s.number), label: `Semester ${s.number}` })) ?? []}
              onChange={(v) => { setSemNum(v); reset("semester"); }}
              active={currentStep === "semester"}
            />
            <Selector
              label="5. Subject"
              value={subjectCode}
              placeholder={semester ? "Choose subject" : "Select semester first"}
              disabled={!semester}
              options={semester?.subjects.map((s) => ({ value: s.code, label: `${s.code} — ${s.name}` })) ?? []}
              onChange={(v) => { setSubjectCode(v); reset("subject"); }}
              active={currentStep === "subject"}
            />
            <Selector
              label="6. Unit"
              value={unitId}
              placeholder={subject ? "Choose unit" : "Select subject first"}
              disabled={!subject}
              options={subject?.units.map((u) => ({ value: u.id, label: `Unit ${u.number} — ${u.title}` })) ?? []}
              onChange={(v) => setUnitId(v)}
              active={currentStep === "unit"}
            />
          </div>

          {/* Progress */}
          <ProgressDots step={currentStep} />
        </div>

        {/* Resource panel */}
        {unit && subject ? (
          <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold sm:text-2xl">
                {subject.name} <span className="text-muted-foreground">·</span> Unit {unit.number}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{unit.title}</p>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-border">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex shrink-0 items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                    {isActive && <span className="absolute -mb-3 h-0.5 w-full translate-y-3 bg-primary" />}
                  </button>
                );
              })}
            </div>

            <div className="p-5 sm:p-6">
              <ResourceView tab={tab} unit={unit} subject={subject} />
            </div>
          </div>
        ) : (
          <EmptyHint step={currentStep} />
        )}
      </div>
    </section>
  );
}

function Breadcrumb({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
      <span className="text-foreground">Home</span>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5" />
          <span className={i === items.length - 1 ? "text-primary" : ""}>{item}</span>
        </span>
      ))}
    </div>
  );
}

function Selector({
  label, value, placeholder, options, onChange, disabled, active,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <label className="block">
      <span className={`mb-2 block text-xs font-medium uppercase tracking-wider ${active ? "text-primary" : "text-muted-foreground"}`}>
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full rounded-xl border bg-card-elevated px-4 text-sm text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          active ? "border-primary shadow-glow-purple" : "border-border hover:border-primary/50"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function ProgressDots({ step }: { step: Step }) {
  const steps: Step[] = ["regulation", "branch", "year", "semester", "subject", "unit", "resource"];
  const currentIdx = steps.indexOf(step);
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {steps.slice(0, 6).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < currentIdx ? "w-8 bg-primary" : i === currentIdx ? "w-8 bg-primary/60" : "w-4 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function EmptyHint({ step }: { step: Step }) {
  const messages: Record<Step, string> = {
    regulation: "👆 Start by choosing your regulation",
    branch: "Now pick your branch",
    year: "Select your current year",
    semester: "Choose the semester",
    subject: "Pick a subject",
    unit: "Almost there — pick a unit to see resources",
    resource: "",
  };
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <p className="text-sm text-muted-foreground sm:text-base">{messages[step]}</p>
    </div>
  );
}

function ResourceView({
  tab, unit, subject,
}: {
  tab: TabId;
  unit: { resources: Resource[]; topics: string[]; number: number; title: string };
  subject: { code: string; name: string } | undefined;
}) {
  if (tab === "syllabus") {
    return (
      <div>
        <h4 className="mb-4 font-display text-base font-semibold">Topics covered in Unit {unit.number}</h4>
        <ul className="space-y-2">
          {unit.topics.map((t, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg bg-card-elevated p-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (tab === "ai") {
    if (!subject) return null;
    return (
      <UnitBotChat
        ctx={{
          subjectName: subject.name,
          subjectCode: subject.code,
          unitNumber: unit.number,
          unitTitle: unit.title,
          topics: unit.topics,
          resources: unit.resources,
        }}
      />
    );
  }

  const items = unit.resources.filter((r) => r.kind === tab);
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No resources yet for this section.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((r, i) => (
        <ResourceCard key={i} resource={r} />
      ))}
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  if (resource.kind === "note") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card-elevated p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${resource.fileType === "PDF" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>
              {resource.fileType}
            </span>
            <p className="truncate text-sm font-medium">{resource.title}</p>
          </div>
          {resource.size && <p className="mt-1 text-xs text-muted-foreground">{resource.size}</p>}
        </div>
        <a href={resource.url} className="ml-3 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </div>
    );
  }
  if (resource.kind === "video") {
    return (
      <a href={`https://youtube.com/watch?v=${resource.youtubeId}`} target="_blank" rel="noreferrer"
         className="group rounded-xl border border-border bg-card-elevated p-4 transition-colors hover:border-primary/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
            <Play className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium group-hover:text-primary">{resource.title}</p>
            <p className="truncate text-xs text-muted-foreground">{resource.channel} {resource.duration && `· ${resource.duration}`}</p>
          </div>
        </div>
      </a>
    );
  }
  if (resource.kind === "formula") {
    return (
      <div className="rounded-xl border border-border bg-card-elevated p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-accent-teal">{resource.name}</p>
        <p className="mt-2 font-mono text-base text-foreground">{resource.formula}</p>
        <p className="mt-2 text-xs text-muted-foreground">{resource.usage}</p>
      </div>
    );
  }
  if (resource.kind === "paper") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card-elevated p-4">
        <div>
          <p className="text-sm font-medium">{resource.month} {resource.year}</p>
          <p className="text-xs text-muted-foreground">Question paper</p>
        </div>
        <a href={resource.url} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </div>
    );
  }
  return null;
}
