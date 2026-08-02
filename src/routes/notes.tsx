import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/kp/Shell";
import { NOTES, HIM, HER } from "@/lib/kp-data";
import { getStoredUser } from "@/lib/auth";

const AVATAR_MAP: Record<string, string> = {
  [HIM.short]: HIM.avatar,
  [HER.short]: HER.avatar,
};

const TONES: Record<string, string> = {
  pink:    "color-mix(in oklab, var(--primary-soft) 30%, var(--card))",
  lavender:"color-mix(in oklab, var(--lavender) 28%, var(--card))",
  gold:    "color-mix(in oklab, var(--gold) 26%, var(--card))",
  coral:   "color-mix(in oklab, var(--coral) 24%, var(--card))",
};

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Love Notes — K&P Love" },
      { name: "description", content: "Little handwritten notes you leave for each other." },
    ],
  }),
  component: NotesScreen,
});

function NotesScreen() {
  const navigate = useNavigate();
  const user     = getStoredUser();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const isBoyfriend = user.role === "Boyfriend";
  const me = isBoyfriend ? HIM : HER;

  return (
    <Screen>
      <ScreenHeader
        title="Love Notes"
        subtitle="Small words, kept safe"
        action={
          <button aria-label="Write a note"
            className="gradient-love shadow-glow flex size-11 items-center justify-center rounded-2xl text-primary-foreground transition-transform active:scale-90">
            <Plus className="size-5" />
          </button>
        }
      />

      {/* "You" indicator */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-primary/8 px-3 py-2">
        <img src={me.avatar} alt={me.short} width={32} height={32}
          className="size-7 rounded-full object-cover ring-1 ring-primary/30" />
        <p className="text-xs text-muted-foreground">
          Viewing as <span className="font-medium text-foreground">{me.short}</span>
          {" · "}{isBoyfriend ? "💙 Boyfriend" : "💗 Girlfriend"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {NOTES.map((n, i) => {
          const isMyNote = n.from === me.short;
          return (
            <article
              key={n.id}
              style={{
                backgroundColor: TONES[n.tone],
                animationDelay: `${i * 70}ms`,
                rotate: i % 2 ? "1.2deg" : "-1.2deg",
              }}
              className="animate-rise shadow-soft flex min-h-40 flex-col rounded-3xl p-4 transition-transform duration-300 hover:rotate-0 hover:-translate-y-1"
            >
              {/* "From you" badge */}
              {isMyNote && (
                <span className="mb-1 self-start rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                  From you
                </span>
              )}
              <h2 className="font-hand text-2xl leading-tight text-foreground">{n.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/80">{n.body}</p>
              <div className="mt-3 flex items-center gap-1.5">
                {AVATAR_MAP[n.from] && (
                  <img src={AVATAR_MAP[n.from]} alt={n.from} width={48} height={48}
                    className="size-5 rounded-full object-cover ring-1 ring-foreground/20" />
                )}
                <p className="text-[11px] text-foreground/60">
                  {n.from} · {n.date}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </Screen>
  );
}
