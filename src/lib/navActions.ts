// Small client-side helpers for in-page navigation & cross-component signals.

export function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export const OPEN_AI_BOT_EVENT = "jntuk:open-ai-bot";

/** Asks the StudyExplorer to scroll into view and switch to the AI Bot tab. */
export function openAiBot() {
  scrollToId("explorer");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_AI_BOT_EVENT));
  }
}

const THEME_KEY = "jntuk-theme";

export function getStoredTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(THEME_KEY);
  return v === "light" ? "light" : "dark";
}

export function applyTheme(theme: "dark" | "light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") root.classList.add("light");
  else root.classList.remove("light");
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function toggleTheme(): "dark" | "light" {
  const next = getStoredTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
