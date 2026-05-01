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
      `You are JNTUK Study Assistant — a helpful tutor for engineering students.`,
      ``,
      `You are CURRENTLY scoped to:`,
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
      `Rules:`,
      `1. Answer using THIS unit's content above whenever possible. Quote topic names when relevant.`,
      `2. If the question is outside this unit, briefly say so and still give a short helpful answer.`,
      `3. Keep answers clear, exam-friendly, and use markdown (headings, bullets, code blocks for formulas).`,
      `4. Be concise: 3–6 short paragraphs unless the user asks for depth.`,
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
