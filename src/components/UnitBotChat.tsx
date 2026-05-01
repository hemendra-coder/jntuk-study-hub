import { useEffect, useRef, useState } from "react";
import { Bot, Send, User as UserIcon, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { askUnitBot } from "@/lib/aiChat";
import type { Resource } from "@/data/jntukData";

type Msg = { role: "user" | "assistant"; content: string };

export type UnitBotContext = {
  subjectName: string;
  subjectCode: string;
  unitNumber: number;
  unitTitle: string;
  topics: string[];
  resources: Resource[];
};

export function UnitBotChat({ ctx }: { ctx: UnitBotContext }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset chat when unit changes
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [ctx.subjectCode, ctx.unitNumber]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = [
    `Explain Unit ${ctx.unitNumber} in simple terms`,
    `What are the key formulas in this unit?`,
    `Give me 5 likely exam questions`,
  ];

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const formulas = ctx.resources
      .filter((r): r is Extract<Resource, { kind: "formula" }> => r.kind === "formula")
      .map(({ name, formula, usage }) => ({ name, formula, usage }));
    const syllabusBullets = ctx.resources
      .filter((r): r is Extract<Resource, { kind: "syllabus" }> => r.kind === "syllabus")
      .flatMap((s) => s.content);

    try {
      const result = await askUnitBot({
        data: {
          messages: next,
          context: {
            subjectName: ctx.subjectName,
            subjectCode: ctx.subjectCode,
            unitNumber: ctx.unitNumber,
            unitTitle: ctx.unitTitle,
            topics: ctx.topics,
            formulas,
            syllabusBullets,
          },
        },
      });

      if (!result.ok) {
        setError(result.error);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      }
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[560px] flex-col rounded-xl border border-border bg-card-elevated overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-cta text-white">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">JNTUK AI Assistant</p>
          <p className="truncate text-xs text-muted-foreground">
            {ctx.subjectCode} · Unit {ctx.unitNumber}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-card p-4 text-sm">
              <p className="font-medium">Hi! 👋</p>
              <p className="mt-1 text-muted-foreground">
                I'm focused on <span className="text-foreground">{ctx.subjectName}</span>, Unit{" "}
                {ctx.unitNumber}. Ask me anything about this unit's topics, formulas, or concepts.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bot className="h-4 w-4" />
            <span className="flex gap-1">
              <span className="animate-typing-dot inline-block h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "0s" }} />
              <span className="animate-typing-dot inline-block h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "0.2s" }} />
              <span className="animate-typing-dot inline-block h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "0.4s" }} />
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-border bg-card p-3"
      >
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about Unit ${ctx.unitNumber}...`}
            disabled={loading}
            className="h-11 flex-1 rounded-full border border-border bg-card-elevated px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-cta text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          AI may make mistakes. Always verify with official JNTUK materials.
        </p>
      </form>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-cta text-white">
          <Bot className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card text-foreground rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-pre:bg-background prose-pre:text-xs prose-code:text-accent-teal">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card-elevated text-muted-foreground">
          <UserIcon className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}
