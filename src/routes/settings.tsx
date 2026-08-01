import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, Map, Timer, ShieldCheck, Info, Moon } from "lucide-react";
import { Screen } from "@/components/kp/Shell";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — K&P Love" },
      { name: "description", content: "Theme, notifications, map preferences and privacy for your shared app." },
      { property: "og:title", content: "Settings — K&P Love" },
      { property: "og:description", content: "Theme, notifications, map and privacy." },
    ],
  }),
  component: SettingsScreen,
});

function SettingsScreen() {
  const { dark, toggle } = useTheme();

  return (
    <Screen>
      <header className="animate-rise mb-5 flex items-center gap-3">
        <Link
          to="/profile"
          aria-label="Back to profile"
          className="glass flex size-11 items-center justify-center rounded-2xl"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <div className="glass animate-rise divide-y divide-border rounded-3xl">
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

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Built with love, for Kashish &amp; Preshna ❤️
      </p>
    </Screen>
  );
}

function Row({
  icon,
  label,
  desc,
  children,
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
