import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  MapPin, MessageCircle, Images, Music,
  CalendarDays, Mail, Bell, Heart, CloudSun,
} from "lucide-react";
import { Screen } from "@/components/kp/Shell";
import { daysTogether, HIM, HER } from "@/lib/kp-data";
import { getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — K&P Love" },
      { name: "description", content: "Your together-counter, quick actions and today's moments." },
    ],
  }),
  component: HomeScreen,
});

const ACTIONS = [
  { to: "/map",      label: "Live Location", icon: MapPin,        tint: "var(--primary)" },
  { to: "/chat",     label: "Chat",          icon: MessageCircle, tint: "var(--lavender)" },
  { to: "/memories", label: "Memories",      icon: Images,        tint: "var(--coral)" },
  { to: "/playlist", label: "Playlist",      icon: Music,         tint: "var(--plum)" },
  { to: "/calendar", label: "Calendar",      icon: CalendarDays,  tint: "var(--gold)" },
  { to: "/notes",    label: "Love Notes",    icon: Mail,          tint: "var(--primary-soft)" },
] as const;

function HomeScreen() {
  const navigate = useNavigate();
  const user = getStoredUser();

  // Guard — if not logged in redirect to login
  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const isBoyfriend = user.role === "Boyfriend";
  // "me" = logged-in user,  "partner" = the other one
  const me      = isBoyfriend ? HIM : HER;
  const partner = isBoyfriend ? HER : HIM;

  const days = daysTogether();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening";

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <Screen fab>
      {/* ── Header ── */}
      <header className="animate-rise flex items-center gap-3">
        <div className="relative flex shrink-0 items-center">
          {/* Me first, partner behind */}
          <img
            src={me.avatar}
            alt={me.short}
            width={96}
            height={96}
            className="size-11 rounded-2xl object-cover ring-2 ring-background"
          />
          <img
            src={partner.avatar}
            alt={partner.short}
            width={96}
            height={96}
            className="-ml-3 size-9 rounded-xl object-cover ring-2 ring-background opacity-80"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="text-lg font-semibold">
            {greeting}, {me.short} {isBoyfriend ? "💙" : "💗"}
          </h1>
        </div>
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="glass relative flex size-11 items-center justify-center rounded-2xl"
        >
          <Bell className="size-5 text-foreground" />
          <span className="absolute right-3 top-3 size-2 rounded-full bg-primary" />
        </Link>
      </header>

      {/* ── Together counter ── */}
      <section
        className="animate-rise shadow-glow mt-6 overflow-hidden rounded-3xl p-6 text-primary-foreground"
        style={{ backgroundImage: "var(--gradient-love)", animationDelay: "60ms" }}
      >
        <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase opacity-85">
          <Heart className="size-3.5 animate-heart" fill="currentColor" /> Together for
        </div>
        <p className="mt-2 text-6xl font-semibold leading-none">{days}</p>
        <p className="mt-1 text-sm opacity-90">days, and still counting</p>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3 text-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <img src={me.avatar} alt={me.short} width={32} height={32}
              className="size-6 rounded-full object-cover ring-1 ring-white/50" />
            <img src={partner.avatar} alt={partner.short} width={32} height={32}
              className="-ml-2 size-6 rounded-full object-cover ring-1 ring-white/50" />
            <span>{me.short} &amp; {partner.short}</span>
          </div>
          <span className="flex items-center gap-1.5 opacity-90">
            <CloudSun className="size-4" /> 24° Kathmandu
          </span>
        </div>
      </section>

      {/* ── Quick actions ── */}
      <h2 className="animate-rise mt-7 mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Quick actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map(({ to, label, icon: Icon, tint }, i) => (
          <Link
            key={to}
            to={to}
            style={{ animationDelay: `${100 + i * 45}ms` }}
            className="glass animate-rise group flex min-h-24 flex-col justify-between rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
          >
            <span
              className="flex size-10 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `color-mix(in oklab, ${tint} 22%, transparent)` }}
            >
              <Icon className="size-5" style={{ color: tint }} />
            </span>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Latest love note ── */}
      <Link
        to="/notes"
        className="glass animate-rise mt-5 mb-14 block rounded-3xl p-5"
        style={{ animationDelay: "420ms" }}
      >
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Love Notes</p>
        <p className="mt-2 font-hand text-2xl text-primary">
          "Write your first note for {partner.short} ✍️"
        </p>
        <p className="mt-2 text-xs text-muted-foreground">— tap to open</p>
      </Link>
    </Screen>
  );
}
