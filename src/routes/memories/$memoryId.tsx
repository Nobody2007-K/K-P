import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, Share2, MapPin, CalendarDays, Play } from "lucide-react";
import { fetchMemories, type MemoryOut } from "@/lib/api";

export const Route = createFileRoute("/memories/$memoryId")({
  head: () => ({
    meta: [
      { title: "Memory — K&P Love" },
      { name: "description", content: "A saved moment with its story, date and place." },
      { property: "og:title", content: "Memory — K&P Love" },
      { property: "og:description", content: "A saved moment with its story." },
    ],
  }),
  loader: async ({ params }): Promise<MemoryOut> => {
    const memories = await fetchMemories();
    const memory = memories.find((m) => m.id === params.memoryId);
    if (!memory) throw notFound();
    return memory;
  },
  component: MemoryDetail,
});

function MemoryDetail() {
  const memory = Route.useLoaderData();
  const isVideo = !memory.image_url && !!memory.video_url;
  const mediaSrc = memory.image_url ?? memory.video_url ?? "";

  const date = new Date(memory.created_at).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: memory.caption ?? "A memory 💕",
        text: `${memory.caption ?? "A memory"} — ${memory.location_name ?? ""}`,
        url: window.location.href,
      }).catch(() => {/* user cancelled */});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  }

  return (
    <main className="relative min-h-screen bg-background pb-10">
      {/* Media */}
      {isVideo ? (
        <video
          src={mediaSrc}
          className="h-[58vh] w-full object-cover"
          controls
          playsInline
        />
      ) : (
        <img
          src={mediaSrc}
          alt={memory.caption ?? "Memory"}
          className="h-[58vh] w-full object-cover"
        />
      )}

      {/* Top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />

      {/* Back button */}
      <Link
        to="/memories"
        aria-label="Back to memories"
        className="glass absolute left-4 top-4 flex size-11 items-center justify-center rounded-2xl"
      >
        <ArrowLeft className="size-5 text-foreground" />
      </Link>

      {/* Detail card */}
      <section className="animate-rise glass relative -mt-10 mx-4 rounded-3xl p-5">
        {memory.caption && (
          <h1 className="text-xl font-semibold leading-snug">{memory.caption}</h1>
        )}

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" /> {date}
          </span>
          {memory.location_name && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" /> {memory.location_name}
            </span>
          )}
        </div>

        {/* Actions — no delete button (memories are permanent) */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Action
            icon={<Heart className="size-4" fill="currentColor" />}
            label="Favorite"
            primary
            onClick={() => {/* favorite toggle — coming soon */}}
          />
          <Action
            icon={<Share2 className="size-4" />}
            label="Share"
            onClick={handleShare}
          />
        </div>
      </section>
    </main>
  );
}

function Action({
  icon, label, primary, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-medium transition-transform active:scale-95 ${
        primary
          ? "gradient-love text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
