import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
  context: z.object({
    subjectName: z.string().max(200),
    subjectCode: z.string().max(50),
    unitNumber: z.number().int().min(1).max(20),
    unitTitle: z.string().max(200),
    topics: z.array(z.string().max(300)).max(50),
    formulas: z.array(z.object({
      name: z.string().max(200),
      formula: z.string().max(500),
      usage: z.string().max(500),
    })).max(20),
    syllabusBullets: z.array(z.string().max(500)).max(50),
  }),
});

export const askUnitBot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI service not configured." };
    }

    const { context, messages } = data;

    const systemPrompt = [
      `You are JNTUK Study Assistant — an experienced engineering teacher tutoring a student.`,
      ``,
      `Currently scoped to:`,
      `Subject: ${context.subjectName} (${context.subjectCode})`,
      `Unit ${context.unitNumber}: ${context.unitTitle}`,
      ``,
      `Topics in this unit:`,
      ...context.topics.map((t, i) => `  ${i + 1}. ${t}`),
      ``,
      context.syllabusBullets.length
        ? `Syllabus bullet points:\n${context.syllabusBullets.map((b) => `  • ${b}`).join("\n")}`
        : "",
      context.formulas.length
        ? `\nKey formulas:\n${context.formulas.map((f) => `  - ${f.name}: ${f.formula} — ${f.usage}`).join("\n")}`
        : "",
      ``,
      `Teaching style — structure every substantive answer like this (use markdown):`,
      `1. **Definition** — one or two crisp sentences.`,
      `2. **Key idea / intuition** — explain why it matters in plain language.`,
      `3. **Step-by-step** — for problems, show numbered steps with the formula on its own line.`,
      `4. **Worked example** — small concrete example with numbers when relevant.`,
      `5. **Pros / Cons or Pitfalls** — short bullets when comparing or warning.`,
      `6. **Exam tip** — one practical tip a JNTUK student should remember.`,
      ``,
      `Other rules:`,
      `- Anchor answers in THIS unit's content above whenever possible. Quote topic names when relevant.`,
      `- If the question is outside this unit, briefly say so and still give a short helpful answer.`,
      `- Use code blocks for formulas, derivations, and code. Keep paragraphs short.`,
      `- Be concise by default; expand only when asked.`,
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      });

      if (res.status === 429) {
        return { ok: false as const, error: "Rate limit reached. Please wait a moment and try again." };
      }
      if (res.status === 402) {
        return { ok: false as const, error: "AI credits exhausted. Add funds in Lovable workspace settings." };
      }
      if (!res.ok) {
        const txt = await res.text();
        console.error("AI gateway error", res.status, txt);
        return { ok: false as const, error: `AI service error (${res.status})` };
      }

      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content as string | undefined;
      if (!reply) return { ok: false as const, error: "Empty response from AI." };

      return { ok: true as const, reply };
    } catch (e) {
      console.error("askUnitBot failed", e);
      return { ok: false as const, error: "Network error reaching AI service." };
    }
  });
