import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Settings, LogOut, Heart, Moon, Images, Mail, CalendarDays } from "lucide-react";
import { Screen } from "@/components/kp/Shell";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { daysTogether, HIM, HER, MEMORIES, NOTES, EVENTS } from "@/lib/kp-data";
import { getStoredUser, logout as authLogout } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — K&P Love" },
      { name: "description", content: "Your shared profile, relationship counter and app preferences." },
      { property: "og:title", content: "Profile — K&P Love" },
      { property: "og:description", content: "Your shared profile and preferences." },
    ],
  }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const user = getStoredUser();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const isBoyfriend = user.role === "Boyfriend";
  const me      = isBoyfriend ? HIM : HER;
  const partner = isBoyfriend ? HER : HIM;

  function handleLogout() {
    authLogout();
    navigate({ to: "/login" });
  }

  return (
    <Screen>
      <section className="animate-rise flex flex-col items-center pt-4">
        {/* Individual profile photos — me large, partner small */}
        <div className="flex items-end gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <img
              src={me.avatar}
              alt={me.short}
              width={256}
              height={256}
              className="shadow-glow size-24 rounded-[1.5rem] object-cover ring-4 ring-primary/30"
            />
            <span className="text-xs font-semibold text-primary">{me.short} (You)</span>
          </div>
          <Heart className="mb-9 size-5 shrink-0 animate-heart text-primary" fill="currentColor" />
          <div className="flex flex-col items-center gap-1.5">
            <img
              src={partner.avatar}
              alt={partner.short}
              width={256}
              height={256}
              className="shadow-glow size-20 rounded-[1.5rem] object-cover ring-4 ring-primary/20"
            />
            <span className="text-xs font-medium text-muted-foreground">{partner.short}</span>
          </div>
        </div>
        <h1 className="mt-4 text-xl font-semibold">
          {me.short} &amp; {partner.short}
        </h1>
        <div className="mt-2 flex gap-2 text-xs">
          <span className="rounded-full bg-primary/12 px-3 py-1 font-medium text-primary">
            {me.role} ❤️ (You)
          </span>
          <span className="rounded-full bg-accent/25 px-3 py-1 font-medium text-accent-foreground">
            {partner.role} ❤️
          </span>
        </div>
      </section>

      <div
        className="shadow-glow animate-rise mt-6 flex items-center justify-between rounded-3xl p-5 text-primary-foreground"
        style={{ backgroundImage: "var(--gradient-love)" }}
      >
        <div>
          <p className="text-xs tracking-[0.2em] uppercase opacity-85">Together for</p>
          <p className="text-4xl font-semibold">{daysTogether()} days</p>
        </div>
        <Heart className="size-9 animate-heart" fill="currentColor" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat icon={<Images className="size-4" />} value={MEMORIES.length} label="Memories" />
        <Stat icon={<Mail className="size-4" />} value={NOTES.length} label="Notes" />
        <Stat icon={<CalendarDays className="size-4" />} value={EVENTS.length} label="Events" />
      </div>

      <div className="glass animate-rise mt-5 divide-y divide-border rounded-3xl">
        <Link to="/settings" className="flex min-h-14 items-center gap-3 px-4 py-3">
          <Settings className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Settings</span>
        </Link>
        <div className="flex min-h-14 items-center gap-3 px-4 py-3">
          <Moon className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Dark mode</span>
          <Switch checked={dark} onCheckedChange={toggle} aria-label="Toggle dark mode" />
        </div>
        <button
          onClick={handleLogout}
          className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
        >
          <LogOut className="size-5 text-destructive" />
          <span className="flex-1 text-sm font-medium text-destructive">Log out</span>
        </button>
      </div>
    </Screen>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="glass flex flex-col items-center gap-1 rounded-3xl py-4">
      <span className="text-primary">{icon}</span>
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
