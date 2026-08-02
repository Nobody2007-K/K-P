import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useState, useEffect, useRef, useCallback,
  lazy, Suspense, type ChangeEvent,
} from "react";
import {
  ArrowLeft, Camera, Check, CheckCheck,
  FileText, Mic, Paperclip, Send, Smile, X, ImageIcon,
} from "lucide-react";
import bg from "@/assets/romantic-bg.jpg";
import { BottomNav } from "@/components/kp/Shell";
import { HIM, HER } from "@/lib/kp-data";
import { getStoredUser } from "@/lib/auth";

// Lazy-load emoji picker so it doesn't bloat the initial bundle
const EmojiPicker = lazy(() => import("emoji-picker-react"));

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — K&P Love" },
      { name: "description", content: "Private messages, just for the two of you." },
    ],
  }),
  component: ChatScreen,
});

// ── Message types ─────────────────────────────────────────────────────────────
type MsgType = "text" | "image" | "file";
interface Message {
  id: number;
  from: string;
  type: MsgType;
  text?: string;
  fileUrl?: string;   // object URL for local preview
  fileName?: string;
  fileSize?: string;
  time: string;
  reaction?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function now(): string {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// ── Main component ────────────────────────────────────────────────────────────
function ChatScreen() {
  const navigate = useNavigate();
  const user     = getStoredUser();

  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);

  const [messages,      setMessages]      = useState<Message[]>([]);
  const [draft,         setDraft]         = useState("");
  const [showEmoji,     setShowEmoji]     = useState(false);
  const [imagePreview,  setImagePreview]  = useState<string | null>(null);
  const [pendingFile,   setPendingFile]   = useState<{ url: string; name: string; size: string; isImage: boolean } | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const cameraRef   = useRef<HTMLInputElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".emoji-panel") && !target.closest(".emoji-btn")) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  if (!user) return null;

  const isBoyfriend = user.role === "Boyfriend";
  const me      = isBoyfriend ? HIM : HER;
  const partner = isBoyfriend ? HER : HIM;
  const myKey   = isBoyfriend ? "him" : "her";

  // ── Send text ──────────────────────────────────────────────────────────────
  function sendText(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages(m => [...m, { id: Date.now(), from: myKey, type: "text", text: draft.trim(), time: now() }]);
    setDraft("");
    setShowEmoji(false);
  }

  // ── Emoji pick ─────────────────────────────────────────────────────────────
  const onEmojiClick = useCallback((emojiData: { emoji: string }) => {
    setDraft(d => d + emojiData.emoji);
    inputRef.current?.focus();
  }, []);

  // ── File / image handler ───────────────────────────────────────────────────
  function handleFile(e: ChangeEvent<HTMLInputElement>, isCamera = false) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url     = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/");
    if (isImage) setImagePreview(url);
    setPendingFile({ url, name: file.name, size: formatBytes(file.size), isImage });
    e.target.value = "";   // allow re-selecting same file
  }

  // ── Send pending file ──────────────────────────────────────────────────────
  function sendFile() {
    if (!pendingFile) return;
    setMessages(m => [...m, {
      id: Date.now(),
      from: myKey,
      type: pendingFile.isImage ? "image" : "file",
      fileUrl: pendingFile.url,
      fileName: pendingFile.name,
      fileSize: pendingFile.size,
      time: now(),
    }]);
    setPendingFile(null);
    setImagePreview(null);
  }

  function cancelFile() {
    if (pendingFile) URL.revokeObjectURL(pendingFile.url);
    setPendingFile(null);
    setImagePreview(null);
  }

  // ── Reaction ───────────────────────────────────────────────────────────────
  function addReaction(id: number, emoji: string) {
    setMessages(m => m.map(msg => msg.id === id ? { ...msg, reaction: emoji } : msg));
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Background */}
      <img src={bg} alt="" width={768} height={1536}
        className="absolute inset-0 size-full object-cover opacity-20 blur-xl pointer-events-none" />
      <div className="absolute inset-0 bg-background/75 pointer-events-none" />

      <div className="relative flex flex-1 flex-col overflow-hidden mx-auto w-full max-w-md">

        {/* ── Header ── */}
        <header className="glass sticky top-0 z-20 flex items-center gap-3 rounded-b-3xl px-5 py-3 shrink-0">
          <button onClick={() => navigate({ to: "/home" })} aria-label="Back"
            className="text-muted-foreground transition-transform active:scale-90">
            <ArrowLeft className="size-5" />
          </button>
          <div className="relative">
            <img src={partner.avatar} alt={partner.short} width={96} height={96}
              className="size-10 rounded-full object-cover ring-2 ring-primary/30" />
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-400 ring-1 ring-background" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{partner.short}</p>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
          <img src={me.avatar} alt={me.short} width={48} height={48}
            className="size-8 rounded-full object-cover ring-2 ring-background opacity-70" />
        </header>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto space-y-3 px-4 pt-4 pb-4">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex -space-x-3">
                <img src={me.avatar} alt={me.short} width={56} height={56}
                  className="size-14 rounded-full object-cover ring-2 ring-background" />
                <img src={partner.avatar} alt={partner.short} width={56} height={56}
                  className="size-14 rounded-full object-cover ring-2 ring-background" />
              </div>
              <p className="font-semibold">Say hello to {partner.short} 👋</p>
              <p className="text-sm text-muted-foreground">
                Your messages are private — just the two of you ❤️
              </p>
            </div>
          )}

          {/* Message list */}
          {messages.map((m, i) => {
            const mine = m.from === myKey;
            return (
              <div key={m.id}
                className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
              >
                {!mine && (
                  <img src={partner.avatar} alt={partner.short} width={28} height={28}
                    className="size-7 rounded-full object-cover ring-1 ring-border shrink-0 self-end" />
                )}

                <div className="relative max-w-[72%] group">
                  {/* Text bubble */}
                  {m.type === "text" && (
                    <div className={`rounded-3xl px-4 py-2.5 text-sm shadow-soft ${
                      mine
                        ? "gradient-love rounded-br-sm text-primary-foreground"
                        : "glass rounded-bl-sm text-foreground"
                    }`}>
                      {m.text}
                      <Timestamp mine={mine} time={m.time} i={i} />
                    </div>
                  )}

                  {/* Image bubble */}
                  {m.type === "image" && m.fileUrl && (
                    <div className={`overflow-hidden rounded-3xl shadow-soft ${
                      mine ? "rounded-br-sm" : "rounded-bl-sm"
                    }`}>
                      <img src={m.fileUrl} alt="sent image"
                        className="max-w-full max-h-64 object-cover cursor-pointer"
                        onClick={() => setImagePreview(m.fileUrl!)} />
                      <div className={`px-3 py-1.5 text-[10px] flex justify-end gap-1 ${
                        mine ? "bg-primary/80 text-primary-foreground/80" : "bg-card text-muted-foreground"
                      }`}>
                        {m.time}
                        {mine && <CheckCheck className="size-3" />}
                      </div>
                    </div>
                  )}

                  {/* File bubble */}
                  {m.type === "file" && (
                    <div className={`flex items-center gap-3 rounded-3xl px-4 py-3 shadow-soft ${
                      mine ? "gradient-love rounded-br-sm text-primary-foreground" : "glass rounded-bl-sm"
                    }`}>
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
                        mine ? "bg-white/20" : "bg-primary/12"
                      }`}>
                        <FileText className={`size-5 ${mine ? "text-white" : "text-primary"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[140px]">{m.fileName}</p>
                        <p className={`text-[11px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {m.fileSize}
                        </p>
                      </div>
                      <Timestamp mine={mine} time={m.time} i={i} />
                    </div>
                  )}

                  {/* Reaction */}
                  {m.reaction && (
                    <span className="glass absolute -bottom-2 left-3 rounded-full px-1.5 py-0.5 text-xs">
                      {m.reaction}
                    </span>
                  )}

                  {/* Long-press reaction picker */}
                  <div className={`absolute -top-8 hidden group-hover:flex gap-1 z-10 glass rounded-2xl px-2 py-1 ${
                    mine ? "right-0" : "left-0"
                  }`}>
                    {["❤️","😂","😮","😢","👍"].map(emoji => (
                      <button key={emoji} onClick={() => addReaction(m.id, emoji)}
                        className="text-base hover:scale-125 transition-transform">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {mine && (
                  <img src={me.avatar} alt={me.short} width={28} height={28}
                    className="size-7 rounded-full object-cover ring-1 ring-border shrink-0 self-end" />
                )}
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* ── Image full-screen preview ── */}
        {imagePreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setImagePreview(null)}
          >
            <button className="absolute right-4 top-4 text-white" aria-label="Close">
              <X className="size-7" />
            </button>
            <img src={imagePreview} alt="preview"
              className="max-h-screen max-w-screen-sm rounded-2xl object-contain px-4" />
          </div>
        )}

        {/* ── Pending file preview bar ── */}
        {pendingFile && (
          <div className="glass mx-4 mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 shrink-0">
            {pendingFile.isImage ? (
              <img src={pendingFile.url} alt="preview"
                className="size-12 rounded-xl object-cover ring-1 ring-primary/30" />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/12">
                <FileText className="size-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{pendingFile.name}</p>
              <p className="text-xs text-muted-foreground">{pendingFile.size}</p>
            </div>
            <button onClick={cancelFile} className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="size-5" />
            </button>
            <button onClick={sendFile}
              className="gradient-love flex size-9 items-center justify-center rounded-full text-primary-foreground transition-transform active:scale-90">
              <Send className="size-4" />
            </button>
          </div>
        )}

        {/* ── Emoji picker ── */}
        {showEmoji && (
          <div className="emoji-panel absolute bottom-24 left-4 right-4 z-40 overflow-hidden rounded-3xl shadow-glow">
            <Suspense fallback={
              <div className="flex h-48 items-center justify-center bg-card">
                <span className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            }>
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width="100%"
                height={320}
                skinTonesDisabled
                searchDisabled={false}
                previewConfig={{ showPreview: false }}
              />
            </Suspense>
          </div>
        )}

        {/* ── Input bar ── */}
        <form onSubmit={sendText}
          className="glass mx-4 mb-2 flex items-center gap-2 rounded-full px-3 py-2 shrink-0">

          {/* Attach file */}
          <button type="button" aria-label="Attach file"
            onClick={() => fileRef.current?.click()}
            className="text-muted-foreground transition-transform active:scale-90 hover:text-primary">
            <Paperclip className="size-5" />
          </button>
          <input ref={fileRef} type="file" className="hidden"
            accept="*/*"
            onChange={(e) => handleFile(e, false)} />

          {/* Camera / image from gallery */}
          <button type="button" aria-label="Send photo"
            onClick={() => cameraRef.current?.click()}
            className="text-muted-foreground transition-transform active:scale-90 hover:text-primary">
            <Camera className="size-5" />
          </button>
          <input ref={cameraRef} type="file" className="hidden"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFile(e, true)} />

          {/* Text input */}
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendText(e as unknown as React.FormEvent)}
            placeholder={`Message ${partner.short}…`}
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />

          {/* Emoji */}
          <button type="button" aria-label="Emoji" onClick={() => setShowEmoji(v => !v)}
            className={`emoji-btn transition-transform active:scale-90 ${showEmoji ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
            <Smile className="size-5" />
          </button>

          {/* Send / mic */}
          <button type="submit"
            aria-label={draft.trim() ? "Send" : "Voice note"}
            className="gradient-love flex size-10 shrink-0 items-center justify-center rounded-full text-primary-foreground transition-transform active:scale-90 shadow-glow">
            {draft.trim() ? <Send className="size-4" /> : <Mic className="size-4" />}
          </button>
        </form>

      </div>

      <BottomNav />
    </div>
  );
}

// ── Small timestamp component ─────────────────────────────────────────────────
function Timestamp({ mine, time, i }: { mine: boolean; time: string; i: number }) {
  return (
    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
      mine ? "text-primary-foreground/70" : "text-muted-foreground"
    }`}>
      {time}
      {mine && (i % 2 === 0 ? <CheckCheck className="size-3" /> : <Check className="size-3" />)}
    </div>
  );
}
