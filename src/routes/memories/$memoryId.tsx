import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, Share2, Trash2, MapPin, CalendarDays } from "lucide-react";
import { MEMORIES } from "@/lib/kp-data";

export const Route = createFileRoute("/memories/$memoryId")({
  head: () => ({
    meta: [
      { title: "Memory — K&P Love" },
      { name: "description", content: "A saved moment with its story, date and place." },
      { property: "og:title", content: "Memory — K&P Love" },
      { property: "og:description", content: "A saved moment with its story." },
    ],
  }),
  loader: ({ params }) => {
    const memory = MEMORIES.find((m) => m.id === params.memoryId);
    if (!memory) throw notFound();
    return memory;
  },
  component: MemoryDetail,
});

function MemoryDetail() {
  const memory = Route.useLoaderData();

  return (
    <main className="relative min-h-screen bg-background pb-10">
      <img src={memory.image} alt={memory.caption} className="h-[58vh] w-full object-cover" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />

      <Link
        to="/memories"
        aria-label="Back to memories"
        className="glass absolute left-4 top-4 flex size-11 items-center justify-center rounded-2xl"
      >
        <ArrowLeft className="size-5 text-foreground" />
      </Link>

      <section className="animate-rise glass relative -mt-10 mx-4 rounded-3xl p-5">
        <h1 className="text-xl font-semibold leading-snug">{memory.caption}</h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" /> {memory.date}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" /> {memory.location}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Action icon={<Heart className="size-4" fill="currentColor" />} label="Favorite" primary />
          <Action icon={<Share2 className="size-4" />} label="Share" />
          <Action icon={<Trash2 className="size-4" />} label="Delete" />
        </div>
      </section>
    </main>
  );
}

function Action({
  icon,
  label,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-medium transition-transform active:scale-95 ${
        primary ? "gradient-love text-primary-foreground" : "bg-secondary text-secondary-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
