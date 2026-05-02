// Filename keyword auto-classification for uploads.
// Returns the most likely content type based on the filename.

export type ContentType = "notes" | "formulas" | "papers" | "videos";

const RULES: { type: ContentType; patterns: RegExp[] }[] = [
  {
    type: "formulas",
    patterns: [/formula/i, /\bsheet\b/i, /\bcheat[\s_-]?sheet\b/i, /\bquick[\s_-]?ref/i],
  },
  {
    type: "papers",
    patterns: [
      /\bpyq\b/i,
      /\bpaper\b/i,
      /\bquestion[\s_-]?paper\b/i,
      /\bprev/i,
      /\bsem[\s_-]?end\b/i,
      /\bmid[\s_-]?\d/i,
      /\bexam\b/i,
      /\b(19|20)\d{2}\b/, // a year like 2023 in the name
    ],
  },
  {
    type: "notes",
    patterns: [/\bnotes?\b/i, /\blecture\b/i, /\bunit[\s_-]?\d/i, /\bchapter\b/i, /\bhandout\b/i],
  },
];

export function classifyByFilename(filename: string): ContentType {
  const name = filename.replace(/\.[a-z0-9]+$/i, "");
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(name))) return rule.type;
  }
  return "notes"; // safe default
}

export const CONTENT_LABEL: Record<ContentType, string> = {
  notes: "Notes",
  formulas: "Formula Sheet",
  papers: "Question Paper",
  videos: "Video",
};
