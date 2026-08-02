import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Camera, Mic, Plus, Send, Smile, Check, CheckCheck, ArrowLeft } from "lucide-react";
import bg from "@/assets/romantic-bg.jpg";
import { BottomNav } from "@/components/kp/Shell";
import { MESSAGES, HIM, HER } from "@/lib/kp-data";
import { getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — K&P Love" },
      { name: "description", content: "Private messages, voice notes and reactions, just for the two of you." },
    ],
  }),
  component: ChatScreen,
});

function ChatScreen() {
  const navigate  = useNavigate();
  const user      = getStoredUser();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  const [draft, setDraft]       = useState("");
  const [messages, setMessages] = useState(MESSAGES);

  if (!user) return null;

  const isBoyfriend = user.role === "Boyfriend";
  // from the logged-in user's perspective
  const me      = isBoyfriend ? HIM : HER;
  const partner = isBoyfriend ? HER : HIM;
  // In mock data: "him" = Kashish messages, "her" = Preshna messages
  const myKey = isBoyfriend ? "him" : "her";

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => [
      ...m,
      {
        id: Date.now(),
        from: myKey,
        text: draft.trim(),
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img src={bg} alt="" width={768} height={1536}
        className="absolute inset-0 size-full object-cover opacity-25 blur-xl" />
      <div className="absolute inset-0 bg-background/70" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col">

        {/* ── Chat header ── */}
        <header className="glass sticky top-0 z-20 flex items-center gap-3 rounded-b-3xl px-5 py-3">
          <button onClick={() => navigate({ to: "/home" })} aria-label="Back"
            className="text-muted-foreground transition-transform active:scale-90">
            <ArrowLeft className="size-5" />
          </button>
          <img
            src={partner.avatar}
            alt={partner.short}
            width={96}
            height={96}
            className="size-10 rounded-full object-cover ring-2 ring-primary/30"
          />
          <div className="flex-1">
            <p className="font-semibold">{partner.short}</p>
            <p className="text-xs text-primary">typing…</p>
          </div>
          {/* My own small avatar */}
          <img
            src={me.avatar}
            alt={`You (${me.short})`}
            width={48}
            height={48}
            className="size-8 rounded-full object-cover ring-2 ring-background opacity-70"
          />
        </header>

        {/* ── Pinned ── only show if there's something pinned */}

        {/* ── Messages ── */}
        <div className="flex-1 space-y-3 px-5 pt-4 pb-44">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex -space-x-3">
                <img src={me.avatar} alt={me.short} width={56} height={56}
                  className="size-14 rounded-full object-cover ring-3 ring-background" />
                <img src={partner.avatar} alt={partner.short} width={56} height={56}
                  className="size-14 rounded-full object-cover ring-3 ring-background" />
              </div>
              <p className="font-semibold text-foreground">Say hello to {partner.short} 👋</p>
              <p className="text-sm text-muted-foreground">
                Your messages are private — just the two of you
              </p>
            </div>
          )}
          {messages.map((m, i) => {
            const mine = m.from === myKey;
            return (
              <div
                key={m.id}
                className={`animate-rise flex ${mine ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Partner avatar on their side */}
                {!mine && (
                  <img src={partner.avatar} alt={partner.short} width={32} height={32}
                    className="mr-2 mt-1 size-7 self-end rounded-full object-cover ring-1 ring-border" />
                )}
                <div className="relative max-w-[72%]">
                  <div className={`rounded-3xl px-4 py-2.5 text-sm shadow-soft ${
                    mine
                      ? "gradient-love rounded-br-lg text-primary-foreground"
                      : "glass rounded-bl-lg text-foreground"
                  }`}>
                    {m.text}
                    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      mine ? "text-primary-foreground/75" : "text-muted-foreground"
                    }`}>
                      {m.time}
                      {mine && (i % 2 === 0
                        ? <CheckCheck className="size-3" />
                        : <Check className="size-3" />)}
                    </div>
                  </div>
                  {"reaction" in m && m.reaction && (
                    <span className="glass absolute -bottom-2 left-3 rounded-full px-1.5 text-xs">
                      {m.reaction}
                    </span>
                  )}
                </div>
                {/* My avatar on my side */}
                {mine && (
                  <img src={me.avatar} alt={me.short} width={32} height={32}
                    className="ml-2 mt-1 size-7 self-end rounded-full object-cover ring-1 ring-border" />
                )}
              </div>
            );
          })}

          {/* typing indicator only shown when backend confirms partner is typing */}
        </div>

        {/* ── Input bar ── */}
        <form
          onSubmit={send}
          className="glass fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-md items-center gap-2 rounded-full px-3 py-2"
        >
          <button type="button" aria-label="Attach"
            className="text-muted-foreground transition-transform active:scale-90">
            <Plus className="size-5" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${partner.short}…`}
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
