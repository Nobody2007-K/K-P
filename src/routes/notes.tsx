import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/kp/Shell";
import { NOTES } from "@/lib/kp-data";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Love Notes — K&P Love" },
      { name: "description", content: "Little handwritten notes you leave for each other." },
      { property: "og:title", content: "Love Notes — K&P Love" },
      { property: "og:description", content: "Little notes you leave for each other." },
    ],
  }),
  component: NotesScreen,
});

const TONES: Record<string, string> = {
  pink: "color-mix(in oklab, var(--primary-soft) 30%, var(--card))",
  lavender: "color-mix(in oklab, var(--lavender) 28%, var(--card))",
  gold: "color-mix(in oklab, var(--gold) 26%, var(--card))",
  coral: "color-mix(in oklab, var(--coral) 24%, var(--card))",
};

function NotesScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Love Notes"
        subtitle="Small words, kept safe"
        action={
          <button
            aria-label="Write a note"
            className="gradient-love shadow-glow flex size-11 items-center justify-center rounded-2xl text-primary-foreground transition-transform active:scale-90"
          >
            <Plus className="size-5" />
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        {NOTES.map((n, i) => (
          <article
            key={n.id}
            style={{
              backgroundColor: TONES[n.tone],
              animationDelay: `${i * 70}ms`,
              rotate: i % 2 ? "1.2deg" : "-1.2deg",
            }}
            className="animate-rise shadow-soft flex min-h-40 flex-col rounded-3xl p-4 transition-transform duration-300 hover:rotate-0 hover:-translate-y-1"
          >
            <h2 className="font-hand text-2xl leading-tight text-foreground">{n.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/80">{n.body}</p>
            <p className="mt-3 text-[11px] text-foreground/60">
              {n.from} · {n.date}
            </p>
          </article>
        ))}
      </div>
    </Screen>
  );
}
