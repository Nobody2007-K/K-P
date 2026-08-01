import { createFileRoute } from "@tanstack/react-router";
import { Screen, ScreenHeader } from "@/components/kp/Shell";
import { NOTIFICATIONS } from "@/lib/kp-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — K&P Love" },
      { name: "description", content: "A gentle timeline of everything that happened between you today." },
      { property: "og:title", content: "Notifications — K&P Love" },
      { property: "og:description", content: "A gentle timeline of your day together." },
    ],
  }),
  component: NotificationsScreen,
});

function NotificationsScreen() {
  return (
    <Screen>
      <ScreenHeader title="Notifications" subtitle="Today · 5 updates" />

      <ol className="relative space-y-4 border-l border-border pl-6">
        {NOTIFICATIONS.map((n, i) => (
          <li
            key={i}
            style={{ animationDelay: `${i * 70}ms` }}
            className="animate-rise glass relative rounded-3xl p-4"
          >
            <span className="absolute -left-[2.15rem] top-6 size-3 rounded-full bg-primary ring-4 ring-background" />
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-lg">
                {n.icon}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium leading-snug">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">{n.time}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Screen>
  );
}
