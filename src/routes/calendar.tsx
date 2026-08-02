import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Screen, ScreenHeader } from "@/components/kp/Shell";
import { EVENTS, HIM, HER } from "@/lib/kp-data";
import { getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — K&P Love" },
      { name: "description", content: "Anniversaries, birthdays and countdowns." },
    ],
  }),
  component: CalendarScreen,
});

function CalendarScreen() {
  const navigate = useNavigate();
  const user     = getStoredUser();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const isBoyfriend = user.role === "Boyfriend";
  const me      = isBoyfriend ? HIM : HER;
  const partner = isBoyfriend ? HER : HIM;

  const now   = new Date();
  const month = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const marked = new Map(EVENTS.map((e) => [e.day, e]));

  return (
    <Screen fab>
      <ScreenHeader
        title="Our Calendar"
        subtitle={month}
        action={
          <div className="flex items-center gap-1.5">
            <img src={me.avatar} alt={me.short} width={48} height={48}
              className="size-8 rounded-full object-cover ring-2 ring-background" />
            <img src={partner.avatar} alt={partner.short} width={48} height={48}
              className="-ml-2 size-8 rounded-full object-cover ring-2 ring-background" />
          </div>
        }
      />

      {/* ── Month grid ── */}
      <section className="glass animate-rise rounded-3xl p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <span key={i} className="py-1">{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const event = d ? marked.get(d) : undefined;
            const today = d === now.getDate();
            return (
              <div key={i}
                className={`relative flex aspect-square items-center justify-center rounded-2xl text-sm transition-colors ${
                  today
                    ? "gradient-love font-semibold text-primary-foreground"
                    : event
                      ? "bg-primary/12 font-medium text-primary"
                      : "text-foreground/80"
                }`}
              >
                {d}
                {event && !today && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Upcoming events ── */}
      <h2 className="mt-6 mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Upcoming
      </h2>
      {EVENTS.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="text-5xl">📅</span>
          <p className="font-semibold text-foreground">No events yet</p>
          <p className="text-sm text-muted-foreground">
            Add your anniversaries, birthdays and special dates ❤️
          </p>
        </div>
      ) : (
      <div className="space-y-3">
        {EVENTS.map((e, i) => {
          const isMyBirthday = e.label.toLowerCase().includes(me.short.toLowerCase());
          const partnerBday  = e.label.toLowerCase().includes(partner.short.toLowerCase());
          const avatarToShow = isMyBirthday ? me.avatar : partnerBday ? partner.avatar : null;
          return (
            <div key={e.label} style={{ animationDelay: `${i * 60}ms` }}
              className="glass animate-rise flex items-center gap-3 rounded-3xl p-4">
              {avatarToShow ? (
                <img src={avatarToShow} alt="" width={48} height={48}
                  className="size-12 rounded-2xl object-cover ring-1 ring-primary/20" />
              ) : (
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-xl">
                  {e.emoji}
                </span>
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {isMyBirthday ? e.label.replace(me.short, "Your Birthday") : e.label}
                </p>
                <p className="text-xs text-muted-foreground">{e.note}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-primary">{e.day}</p>
                <p className="text-[11px] text-muted-foreground">
                  {now.toLocaleDateString(undefined, { month: "short" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </Screen>
  );
}
