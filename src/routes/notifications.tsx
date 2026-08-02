import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/kp/Shell";
import { NOTIFICATIONS, HIM, HER } from "@/lib/kp-data";
import { getStoredUser } from "@/lib/auth";

function getAvatar(title: string) {
  if (title.toLowerCase().includes(HER.short.toLowerCase())) return HER.avatar;
  if (title.toLowerCase().includes(HIM.short.toLowerCase())) return HIM.avatar;
  return null;
}

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — K&P Love" },
      { name: "description", content: "A gentle timeline of everything that happened between you today." },
    ],
  }),
  component: NotificationsScreen,
});

function NotificationsScreen() {
  const navigate = useNavigate();
  const user     = getStoredUser();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const isBoyfriend = user.role === "Boyfriend";
  const me = isBoyfriend ? HIM : HER;

  const personalised = NOTIFICATIONS.map((n) => ({
    ...n,
    title: n.title.replace(me.short, "You"),
  }));

  return (
    <Screen>
      <ScreenHeader
        title="Notifications"
        subtitle={`${NOTIFICATIONS.length} update${NOTIFICATIONS.length !== 1 ? "s" : ""}`}
        action={
          <img src={me.avatar} alt={me.short} width={40} height={40}
            className="size-9 rounded-full object-cover ring-2 ring-primary/30" />
        }
      />

      {NOTIFICATIONS.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Bell className="size-12 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">All caught up</p>
          <p className="text-sm text-muted-foreground">
            Notifications will appear here when something happens
          </p>
        </div>
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-6">
          {personalised.map((n, i) => (
            <li key={i} style={{ animationDelay: `${i * 70}ms` }}
              className="animate-rise glass relative rounded-3xl p-4">
              <span className="absolute -left-[2.15rem] top-6 size-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex items-center gap-3">
                {getAvatar(NOTIFICATIONS[i]!.title) ? (
                  <img src={getAvatar(NOTIFICATIONS[i]!.title)!} alt=""
                    width={48} height={48}
                    className="size-10 rounded-2xl object-cover ring-1 ring-primary/20" />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-lg">
                    {n.icon}
                  </span>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground">{n.time}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Screen>
  );
}
