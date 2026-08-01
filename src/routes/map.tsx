import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Crosshair, Layers, Minus, Plus, Navigation, BatteryMedium, Clock } from "lucide-react";
import { BottomNav } from "@/components/kp/Shell";
import { HIM, HER } from "@/lib/kp-data";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Location — K&P Love" },
      { name: "description", content: "See where your person is, in real time, with distance and travel time." },
      { property: "og:title", content: "Live Location — K&P Love" },
      { property: "og:description", content: "Real-time location for two." },
    ],
  }),
  component: MapScreen,
});

const PEOPLE = [
  {
    ...HIM,
    address: "Lazimpat Road, Kathmandu 44600",
    lat: "27.7215",
    lng: "85.3183",
    speed: "24 km/h",
    battery: "78%",
    updated: "just now",
    tint: "var(--plum)",
    pos: { top: "34%", left: "28%" },
  },
  {
    ...HER,
    address: "Jhamsikhel, Lalitpur 44700",
    lat: "27.6784",
    lng: "85.3095",
    speed: "0 km/h",
    battery: "45%",
    updated: "2 min ago",
    tint: "var(--primary)",
    pos: { top: "62%", left: "63%" },
  },
];

function MapScreen() {
  const [active, setActive] = useState(1);
  const [satellite, setSatellite] = useState(false);
  const person = PEOPLE[active];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Stylised map canvas */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: satellite
            ? "linear-gradient(160deg, oklch(0.32 0.05 250), oklch(0.24 0.04 300))"
            : "linear-gradient(160deg, oklch(0.96 0.02 330), oklch(0.93 0.03 300))",
        }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklab, var(--plum) 18%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--plum) 18%, transparent) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <svg className="absolute inset-0 size-full" aria-hidden>
          <path
            d="M -20 340 Q 140 300 200 420 T 460 560"
            fill="none"
            stroke="color-mix(in oklab, var(--primary) 55%, transparent)"
            strokeWidth="3"
            strokeDasharray="10 10"
          />
        </svg>

        {PEOPLE.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActive(i)}
            aria-label={`Show ${p.short}'s location`}
            className="animate-drift absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-500"
            style={{ ...p.pos, animationDelay: `${i * 800}ms` }}
          >
            <span className="relative flex flex-col items-center">
              <span
                className="absolute -z-10 size-16 rounded-full opacity-30"
                style={{ backgroundColor: p.tint }}
              />
              <span
                className="flex size-12 items-center justify-center rounded-full border-2 border-white text-sm font-semibold text-white shadow-glow"
                style={{ backgroundColor: p.tint }}
              >
                {p.initials}
              </span>
              <span className="glass mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium">
                {p.short}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Top summary */}
      <div className="glass animate-rise absolute inset-x-4 top-4 flex items-center justify-between rounded-3xl px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Distance between you</p>
          <p className="text-lg font-semibold">4.8 km</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Est. travel time</p>
          <p className="text-lg font-semibold text-primary">18 min</p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute right-4 top-28 flex flex-col gap-2">
        {[
          { icon: Crosshair, label: "Recenter", onClick: () => setActive(1) },
          { icon: Layers, label: "Map type", onClick: () => setSatellite((s) => !s) },
          { icon: Plus, label: "Zoom in", onClick: () => {} },
          { icon: Minus, label: "Zoom out", onClick: () => {} },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            aria-label={label}
            className="glass flex size-11 items-center justify-center rounded-2xl transition-transform active:scale-90"
          >
            <Icon className="size-5 text-foreground" />
          </button>
        ))}
      </div>

      {/* Draggable info card */}
      <div className="glass animate-rise absolute inset-x-0 bottom-0 rounded-t-3xl px-5 pt-3 pb-32">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/40" />
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-2xl text-sm font-semibold text-white"
            style={{ backgroundColor: person.tint }}
          >
            {person.initials}
          </span>
          <div className="flex-1">
            <p className="font-semibold">{person.name}</p>
            <p className="text-xs text-muted-foreground">{person.address}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary">
            <Navigation className="size-3" /> {person.speed}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Info label="Latitude" value={person.lat} />
          <Info label="Longitude" value={person.lng} />
          <Info label="Battery" value={person.battery} icon={<BatteryMedium className="size-3.5" />} />
          <Info label="Updated" value={person.updated} icon={<Clock className="size-3.5" />} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-background/60 px-3 py-2">
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        {icon} {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
