import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchCampus, type Destination } from "@/lib/campus/search";
import { useNavigator } from "@/lib/state";

interface Msg {
  role: "user" | "ai";
  text: string;
  destination?: Destination;
}

const prompts = [
  "Where is the nearest computer lab?",
  "How do I get to B204?",
  "Accessible route to the library",
  "Where is the nearest washroom?",
];

/** deterministic intent engine — no external AI keys required */
function respond(input: string, setMode: (m: "accessible") => void): Msg {
  const q = input.toLowerCase();
  const wantsAccessible = /accessible|wheelchair|step[- ]free|ramp|elevator only/.test(q);
  if (wantsAccessible) setMode("accessible");

  const stopwords =
    /(where\s+is|how\s+do\s+i\s+get\s+to|take\s+me\s+to|navigate\s+to|find\s+me|find|the\s+nearest|nearest|route\s+to|accessible|wheelchair|please|i\s+have\s+a\s+lecture\s+in|lecture\s+in|a\s+|an\s+|the\s+|to\s+|\?)/g;
  const cleaned = q.replace(stopwords, " ").trim();
  const results = searchCampus(cleaned || q, 3);

  if (!results.length) {
    return {
      role: "ai",
      text: "I couldn't match that to a campus place. Try a room code like B204, or a place like Canteen, Library or Medical Center.",
    };
  }
  const top = results[0]!;
  return {
    role: "ai",
    text: `${top.name} — ${top.type} in ${top.subtitle}.${
      wantsAccessible ? " I've switched routing to step-free mode." : ""
    } Want me to route you there?`,
    destination: top,
  };
}

export function AssistantDock() {
  const { selectDestination, setMode } = useNavigator();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Hi! I'm your Campus AI. Ask me where anything is and I'll plot the route on the 3D map.",
    },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const reply = respond(text, () => setMode("accessible"));
    setMessages((m) => [...m, { role: "user", text }, reply]);
    setInput("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open Campus AI assistant"
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-[image:var(--gradient-accent)] px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105 lg:bottom-6"
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        Campus AI
      </button>

      {open && (
        <div className="glass-strong animate-scale-in fixed bottom-36 right-4 z-50 flex h-[26rem] w-[min(23rem,calc(100vw-2rem))] flex-col rounded-3xl p-3 lg:bottom-24">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-primary" aria-hidden /> Campus AI Assistant
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X className="h-4 w-4 text-muted-foreground" aria-hidden />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`animate-fade-in max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-primary/20 text-foreground"
                    : "bg-secondary/60 text-foreground"
                }`}
              >
                {m.text}
                {m.destination && (
                  <Button
                    size="sm"
                    className="mt-2 h-7 w-full text-[11px]"
                    onClick={() => {
                      selectDestination(m.destination!);
                      setOpen(false);
                    }}
                  >
                    Navigate to {m.destination.name}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 py-2">
            {prompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-3 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any place…"
              aria-label="Message Campus AI"
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" aria-label="Send">
              <Send className="h-4 w-4 text-primary" aria-hidden />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
