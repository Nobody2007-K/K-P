import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Plus, MapPin } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/kp/Shell";
import { MEMORIES } from "@/lib/kp-data";

export const Route = createFileRoute("/memories/")({
  head: () => ({
    meta: [
      { title: "Memories — K&P Love" },
      { name: "description", content: "A private gallery of the moments you two keep coming back to." },
      { property: "og:title", content: "Memories — K&P Love" },
      { property: "og:description", content: "A private gallery for two." },
    ],
  }),
  component: MemoriesScreen,
});

function MemoriesScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Memories"
        subtitle={`${MEMORIES.length} moments saved`}
        action={
          <button
            aria-label="Add memory"
            className="gradient-love shadow-glow flex size-11 items-center justify-center rounded-2xl text-primary-foreground transition-transform active:scale-90"
          >
            <Plus className="size-5" />
          </button>
        }
      />

      {MEMORIES.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="text-5xl">📸</span>
          <p className="font-semibold text-foreground">No memories yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first beautiful moment together ❤️
          </p>
        </div>
      ) : (
      <div className="columns-2 gap-3 [column-fill:_balance]">
        {MEMORIES.map((m, i) => (
          <Link
            key={m.id}
            to="/memories/$memoryId"
            params={{ memoryId: m.id }}
            style={{ animationDelay: `${i * 70}ms` }}
            className="animate-rise mb-3 block break-inside-avoid overflow-hidden rounded-3xl bg-card shadow-soft transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="relative">
              <img
                src={m.image}
                alt={m.caption}
                loading="lazy"
                className={`w-full object-cover ${m.span === "tall" ? "h-56" : "h-36"}`}
              />
              {m.favorite && (
                <span className="glass absolute right-2 top-2 flex size-8 items-center justify-center rounded-full">
                  <Heart className="size-4 text-primary" fill="currentColor" />
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium leading-snug">{m.caption}</p>
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="size-3" /> {m.location}
              </p>
              <p className="text-[11px] text-muted-foreground">{m.date}</p>
            </div>
          </Link>
        ))}
      </div>
      )}
    </Screen>
  );
}
