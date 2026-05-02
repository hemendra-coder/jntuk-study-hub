import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send, User as UserIcon, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { askEduBot } from "@/lib/aiChat";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/edubot")({ component: EduBotPage });

type Msg = { role: "user" | "assistant"; content: string };

function EduBotPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);

  const suggestions = [
    "Explain Big-O notation with examples",
    "Step-by-step: solve a 3x3 linear system using Gauss elimination",
    "Difference between TCP and UDP — pros, cons, and when to use",
    "Derive the time complexity of merge sort",
  ];

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const result = await askEduBot({ data: { messages: next } });
      if (!result.ok) setError(result.error);
      else setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">EduBot</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your engineering tutor — definitions, derivations, worked examples, exam tips.</p>
        </div>

        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card-elevated overflow-hidden min-h-[560px]">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="rounded-xl bg-card p-4 text-sm">
                  <p className="font-medium">Hi 👋 I'm EduBot.</p>
                  <p className="mt-1 text-muted-foreground">Ask any engineering or maths question. I'll answer like a teacher: definition → intuition → steps → example → exam tip.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {busy && (
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
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask EduBot anything…"
                disabled={busy}
                className="h-11 flex-1 rounded-full border border-border bg-card-elevated px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button type="submit" disabled={busy || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-cta text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">AI may make mistakes. Verify with official materials.</p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-cta text-white">
          <Bot className="h-3.5 w-3.5" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card text-foreground rounded-tl-sm"}`}>
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
