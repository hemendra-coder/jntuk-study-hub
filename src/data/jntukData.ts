export type Resource =
  | { kind: "syllabus"; title: string; content: string[] }
  | { kind: "note"; title: string; url: string; fileType: "PDF" | "PPT"; size?: string }
  | { kind: "video"; title: string; channel: string; youtubeId: string; duration?: string }
  | { kind: "formula"; name: string; formula: string; usage: string }
  | { kind: "paper"; year: string; month: string; url: string };

export type Unit = {
  id: string;
  number: number;
  title: string;
  topics: string[];
  resources: Resource[];
};

export type Subject = {
  code: string;
  name: string;
  credits: number;
  units: Unit[];
};

export type Semester = {
  number: 1 | 2;
  subjects: Subject[];
};

export type Year = {
  number: 1 | 2 | 3 | 4;
  label: string;
  semesters: Semester[];
};

export type Branch = {
  code: string;
  name: string;
  emoji: string;
  years: Year[];
};

export type Regulation = {
  code: "R20" | "R23";
  label: string;
  description: string;
  branches: Branch[];
};

const sampleUnit = (n: number): Unit => ({
  id: `u${n}`,
  number: n,
  title: `Unit ${n} — Sample Topic`,
  topics: [
    "Introduction and overview",
    "Core concepts and definitions",
    "Applications and examples",
    "Practice problems",
  ],
  resources: [
    { kind: "syllabus", title: `Unit ${n} Syllabus`, content: ["Topic A", "Topic B", "Topic C"] },
    { kind: "note", title: `Unit ${n} Notes`, url: "#", fileType: "PDF", size: "1.2 MB" },
    { kind: "video", title: `Unit ${n} Lecture`, channel: "Sample Channel", youtubeId: "dQw4w9WgXcQ", duration: "45:00" },
    { kind: "formula", name: "Sample Formula", formula: "E = mc²", usage: "Energy-mass equivalence" },
    { kind: "paper", year: "2023", month: "May", url: "#" },
  ],
});

const sampleSubjects = (prefix: string, count: number): Subject[] =>
  Array.from({ length: count }, (_, i) => ({
    code: `${prefix}${(i + 1).toString().padStart(2, "0")}`,
    name: `Sample Subject ${i + 1}`,
    credits: 4,
    units: [1, 2, 3, 4, 5].map(sampleUnit),
  }));

const sampleYears = (): Year[] =>
  ([1, 2, 3, 4] as const).map((n) => ({
    number: n,
    label: ["1st", "2nd", "3rd", "4th"][n - 1] + " Year",
    semesters: [
      { number: 1, subjects: sampleSubjects(`S${n}A`, 6) },
      { number: 2, subjects: sampleSubjects(`S${n}B`, 6) },
    ],
  }));

const branches: Branch[] = [
  { code: "CSE", name: "Computer Science Engineering", emoji: "💻", years: sampleYears() },
  { code: "ECE", name: "Electronics & Communication", emoji: "📡", years: sampleYears() },
  { code: "EEE", name: "Electrical & Electronics", emoji: "⚡", years: sampleYears() },
  { code: "MECH", name: "Mechanical Engineering", emoji: "⚙️", years: sampleYears() },
  { code: "CIVIL", name: "Civil Engineering", emoji: "🏗️", years: sampleYears() },
  { code: "IT", name: "Information Technology", emoji: "🖥️", years: sampleYears() },
  { code: "AIDS", name: "AI & Data Science", emoji: "🧠", years: sampleYears() },
  { code: "AIML", name: "AI & Machine Learning", emoji: "🤖", years: sampleYears() },
  { code: "DS", name: "Data Science", emoji: "📊", years: sampleYears() },
];

export const regulations: Regulation[] = [
  {
    code: "R20",
    label: "R20 Regulation",
    description: "2020 Batch & Onwards",
    branches,
  },
  {
    code: "R23",
    label: "R23 Regulation",
    description: "2023 Batch & Onwards",
    branches,
  },
];
