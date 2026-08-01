import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Mic, Plus, Send, Smile, Pin, Check, CheckCheck } from "lucide-react";
import bg from "@/assets/romantic-bg.jpg";
import { BottomNav } from "@/components/kp/Shell";
import { MESSAGES, HER } from "@/lib/kp-data";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — K&P Love" },
      { name: "description", content: "Private messages, voice notes and reactions, just for the two of you." },
      { property: "og:title", content: "Chat — K&P Love" },
      { property: "og:description", content: "Private messages for two." },
    ],
  }),
  component: ChatScreen,
});

function ChatScreen() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(MESSAGES);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => [
      ...m,
      {
        id: Date.now(),
        from: "him",
        text: draft.trim(),
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img src={bg} alt="" width={768} height={1536} className="absolute inset-0 size-full object-cover opacity-25 blur-xl" />
      <div className="absolute inset-0 bg-background/70" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col">
        <header className="glass sticky top-0 z-20 flex items-center gap-3 rounded-b-3xl px-5 py-3">
          <span className="gradient-love flex size-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground">
            {HER.initials}
          </span>
          <div className="flex-1">
            <p className="font-semibold">{HER.short}</p>
            <p className="text-xs text-primary">typing…</p>
          </div>
        </header>

        <div className="glass mx-5 mt-3 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs">
          <Pin className="size-3.5 text-gold" />
          <span className="truncate text-muted-foreground">Pinned: “Anniversary dinner — 14 Feb, 7pm”</span>
        </div>

        <div className="flex-1 space-y-3 px-5 pt-4 pb-44">
          {messages.map((m, i) => {
            const mine = m.from === "him";
            return (
              <div
                key={m.id}
                className={`animate-rise flex ${mine ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="relative max-w-[78%]">
                  <div
                    className={`rounded-3xl px-4 py-2.5 text-sm shadow-soft ${
                      mine
                        ? "gradient-love rounded-br-lg text-primary-foreground"
                        : "glass rounded-bl-lg text-foreground"
                    }`}
                  >
                    {m.text}
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                        mine ? "text-primary-foreground/75" : "text-muted-foreground"
                      }`}
                    >
                      {m.time}
                      {mine && (i % 2 === 0 ? <CheckCheck className="size-3" /> : <Check className="size-3" />)}
                    </div>
                  </div>
                  {"reaction" in m && m.reaction && (
                    <span className="glass absolute -bottom-2 left-3 rounded-full px-1.5 text-xs">
                      {m.reaction}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex justify-start">
            <div className="glass flex items-center gap-1 rounded-3xl rounded-bl-lg px-4 py-3">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="size-1.5 animate-bounce rounded-full bg-primary"
                  style={{ animationDelay: `${d * 140}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={send}
          className="glass fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-md items-center gap-2 rounded-full px-3 py-2"
        >
          <button type="button" aria-label="Attach" className="text-muted-foreground transition-transform active:scale-90">
            <Plus className="size-5" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message Preshna…"
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="button" aria-label="Emoji" className="text-muted-foreground">
            <Smile className="size-5" />
          </button>
          <button type="button" aria-label="Photo" className="text-muted-foreground">
            <Camera className="size-5" />
          </button>
          <button
            type="submit"
            aria-label={draft ? "Send" : "Voice message"}
            className="gradient-love flex size-10 items-center justify-center rounded-full text-primary-foreground transition-transform active:scale-90"
          >
            {draft ? <Send className="size-4" /> : <Mic className="size-4" />}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
