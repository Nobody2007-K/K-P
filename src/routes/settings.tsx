import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Bell, Map, Timer, ShieldCheck, Info, Moon, LogOut } from "lucide-react";
import { Screen } from "@/components/kp/Shell";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { HIM, HER } from "@/lib/kp-data";
import { getStoredUser, logout as authLogout } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — K&P Love" },
      { name: "description", content: "Theme, notifications, map preferences and privacy." },
    ],
  }),
  component: SettingsScreen,
});

function SettingsScreen() {
  const { dark, toggle } = useTheme();
  const navigate         = useNavigate();
  const user             = getStoredUser();

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
      {/* ── Header ── */}
      <header className="animate-rise mb-5 flex items-center gap-3">
        <Link to="/profile" aria-label="Back to profile"
          className="glass flex size-11 items-center justify-center rounded-2xl">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="flex-1 text-2xl font-semibold">Settings</h1>
        {/* Me + partner avatars */}
        <div className="flex items-center -space-x-2">
          <img src={me.avatar} alt={me.short} width={48} height={48}
            className="size-9 rounded-full object-cover ring-2 ring-background z-10 shadow-sm" />
          <img src={partner.avatar} alt={partner.short} width={48} height={48}
            className="size-8 rounded-full object-cover ring-2 ring-background opacity-75" />
        </div>
      </header>

      {/* ── Account info ── */}
      <div className="glass animate-rise mb-4 flex items-center gap-3 rounded-3xl px-4 py-3"
        style={{ animationDelay: "40ms" }}>
        <img src={me.avatar} alt={me.short} width={64} height={64}
          className="size-12 rounded-2xl object-cover ring-2 ring-primary/30" />
        <div>
          <p className="font-semibold">{me.name}</p>
          <p className="text-xs text-muted-foreground">
            {me.role} · Logged in as <span className="text-primary font-medium">{me.short}</span>
          </p>
        </div>
      </div>

      {/* ── Settings rows ── */}
      <div className="glass animate-rise divide-y divide-border rounded-3xl"
        style={{ animationDelay: "80ms" }}>
        <Row icon={<Moon className="size-5" />} label="Dark mode" desc="Matte black & soft pink">
          <Switch checked={dark} onCheckedChange={toggle} aria-label="Toggle dark mode" />
        </Row>
        <Row icon={<Bell className="size-5" />} label="Notifications" desc="Arrivals, notes, memories">
          <Switch defaultChecked aria-label="Toggle notifications" />
        </Row>
        <Row icon={<Map className="size-5" />} label="Map preferences" desc="Standard map, avatar markers">
          <span className="text-xs text-muted-foreground">Standard</span>
        </Row>
        <Row icon={<Timer className="size-5" />} label="Location frequency" desc="How often you update">
          <span className="text-xs text-muted-foreground">Every 30s</span>
        </Row>
        <Row icon={<ShieldCheck className="size-5" />} label="Privacy" desc="Visible only to each other">
          <Switch defaultChecked aria-label="Toggle privacy" />
        </Row>
        <Row icon={<Info className="size-5" />} label="About" desc="K&P Love, made for two">
          <span className="text-xs text-muted-foreground">v1.0.0</span>
        </Row>
      </div>

      {/* ── Logout ── */}
      <button
        onClick={handleLogout}
        className="glass animate-rise mt-4 flex min-h-14 w-full items-center gap-3 rounded-3xl px-4 py-3 text-left transition-opacity hover:opacity-80"
        style={{ animationDelay: "120ms" }}
      >
        <LogOut className="size-5 text-destructive" />
        <span className="flex-1 text-sm font-medium text-destructive">Log out</span>
        <img src={me.avatar} alt="" width={32} height={32}
          className="size-7 rounded-full object-cover opacity-60" />
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Built with love, for Kashish &amp; Preshna ❤️
      </p>
    </Screen>
  );
}

function Row({
  icon, label, desc, children,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-16 items-center gap-3 px-4 py-3">
      <span className="text-primary">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{desc}</span>
      </span>
      {children}
    </div>
  );
}
