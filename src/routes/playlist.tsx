import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Heart } from "lucide-react";
import album from "@/assets/album.jpg";
import { Screen, ScreenHeader } from "@/components/kp/Shell";
import { PLAYLIST } from "@/lib/kp-data";

export const Route = createFileRoute("/playlist")({
  head: () => ({
    meta: [
      { title: "Our Playlist — K&P Love" },
      { name: "description", content: "The songs that belong to the two of you, in one player." },
      { property: "og:title", content: "Our Playlist — K&P Love" },
      { property: "og:description", content: "The songs that belong to you two." },
    ],
  }),
  component: PlaylistScreen,
});

function PlaylistScreen() {
  const [playing, setPlaying] = useState(true);
  const [index, setIndex] = useState(0);
  const track = PLAYLIST[index] ?? PLAYLIST[0]!;

  return (
    <Screen>
      <ScreenHeader title="Our Playlist" subtitle={`${PLAYLIST.length} songs · 19 min`} />

      <section className="animate-rise flex flex-col items-center">
        <img
          src={album}
          alt={`${track.title} artwork`}
          width={768}
          height={768}
          className={`shadow-glow size-56 rounded-full object-cover ring-8 ring-primary/10 ${
            playing ? "animate-spin-slow" : ""
          }`}
        />
        <h2 className="mt-6 text-xl font-semibold">{track.title}</h2>
        <p className="text-sm text-muted-foreground">{track.artist}</p>

        <div className="mt-6 w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="gradient-love h-full w-2/5 rounded-full" />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>1:24</span>
            <span>{track.len}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-6">
          <button aria-label="Shuffle" className="text-muted-foreground transition-transform active:scale-90">
            <Shuffle className="size-5" />
          </button>
          <button
            aria-label="Previous"
            onClick={() => setIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length)}
            className="transition-transform active:scale-90"
          >
            <SkipBack className="size-7" fill="currentColor" />
          </button>
          <button
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => setPlaying((p) => !p)}
            className="gradient-love shadow-glow flex size-16 items-center justify-center rounded-full text-primary-foreground transition-transform active:scale-90"
          >
            {playing ? <Pause className="size-7" fill="currentColor" /> : <Play className="size-7" fill="currentColor" />}
          </button>
          <button
            aria-label="Next"
            onClick={() => setIndex((i) => (i + 1) % PLAYLIST.length)}
            className="transition-transform active:scale-90"
          >
            <SkipForward className="size-7" fill="currentColor" />
          </button>
          <button aria-label="Favorite" className="text-primary transition-transform active:scale-90">
            <Heart className="size-5" fill="currentColor" />
          </button>
        </div>
      </section>

      <h3 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Up next
      </h3>
      <ul className="space-y-2">
        {PLAYLIST.map((t, i) => (
          <li key={t.title}>
            <button
              onClick={() => setIndex(i)}
              className={`glass flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-transform active:scale-[0.98] ${
                i === index ? "ring-1 ring-primary/40" : ""
              }`}
            >
              <span className="w-5 text-center text-xs text-muted-foreground">{i + 1}</span>
              <span className="flex-1">
                <span className={`block text-sm font-medium ${i === index ? "text-primary" : ""}`}>
                  {t.title}
                </span>
                <span className="block text-xs text-muted-foreground">{t.artist}</span>
              </span>
              <span className="text-xs text-muted-foreground">{t.len}</span>
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
