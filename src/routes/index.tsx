import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { HIM, HER } from "@/lib/kp-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "K&P Love — Always Together" },
      { name: "description", content: "Kashish & Preshna's private space: location, chat, memories and love notes." },
      { property: "og:title", content: "K&P Love — Always Together" },
      { property: "og:description", content: "A private digital world for two." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), 2100);
    const go = setTimeout(() => navigate({ to: "/login" }), 2600);
    return () => {
      clearTimeout(fade);
      clearTimeout(go);
    };
  }, [navigate]);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundImage: "var(--gradient-splash)" }}
    >
      <div className="animate-rise flex flex-col items-center">
        {/* Profile photos stacked with heart */}
        <div className="relative flex items-center justify-center">
          <img
            src={HIM.avatar}
            alt={HIM.short}
            width={128}
            height={128}
            className="shadow-glow size-20 rounded-[1.5rem] object-cover ring-4 ring-white/30 -rotate-3"
          />
          <div className="z-10 -mx-2 flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-2 ring-white/30">
            <Heart className="size-6 animate-heart text-primary-foreground" fill="currentColor" />
          </div>
          <img
            src={HER.avatar}
            alt={HER.short}
            width={128}
            height={128}
            className="shadow-glow size-20 rounded-[1.5rem] object-cover ring-4 ring-white/30 rotate-3"
          />
        </div>
        <h1 className="mt-7 text-4xl font-semibold text-primary-foreground">K&amp;P Love</h1>
        <p className="mt-2 text-sm tracking-[0.3em] text-primary-foreground/80 uppercase">
          Always Together ❤️
        </p>
      </div>

      <div className="absolute bottom-14 flex flex-col items-center gap-3">
        <span className="size-6 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
        <p className="text-xs text-primary-foreground/70">Connecting hearts…</p>
      </div>
    </main>
  );
}
