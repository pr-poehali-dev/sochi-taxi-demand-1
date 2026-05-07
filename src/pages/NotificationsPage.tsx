import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const notifications = [
  { id: 1, type: "push", title: "Высокий спрос: Аэропорт", body: "Коэффициент ×5.1 · Рейс SU1814 прибывает в 18:50", time: "5 мин назад", read: false, priority: "critical" },
  { id: 2, type: "sms",  title: "Зона спроса: Центр",     body: "Срочно! 142 активных заказа в центральном районе", time: "12 мин назад", read: false, priority: "high" },
  { id: 3, type: "push", title: "Прогноз: пиковый час",   body: "Через 45 мин ожидается пик. Рекомендую занять позицию у аэропорта", time: "20 мин назад", read: true, priority: "high" },
  { id: 4, type: "push", title: "Рейс PC4512 задержан",   body: "Вылет из Стамбула задержан на 40 мин. Прилёт смещён на 19:55", time: "35 мин назад", read: true, priority: "medium" },
  { id: 5, type: "sms",  title: "Коэффициент снижен",     body: "Адлер: коэффициент снижен с ×2.4 до ×1.8", time: "1 час назад", read: true, priority: "low" },
  { id: 6, type: "push", title: "Выручка за день",        body: "Вы заработали 4 820 ₽ за сегодня. +15% к вчерашнему дню", time: "2 часа назад", read: true, priority: "low" },
];

const settings = [
  { id: "push_high", label: "Push: высокий спрос (≥×3)", push: true, sms: false },
  { id: "push_airport", label: "Push: зона аэропорта", push: true, sms: true },
  { id: "sms_critical", label: "SMS: критический спрос (≥×4.5)", push: true, sms: true },
  { id: "push_forecast", label: "Push: прогнозы за 45 мин", push: true, sms: false },
  { id: "push_delays", label: "Push: задержки рейсов", push: true, sms: false },
  { id: "push_earnings", label: "Push: итоги дня", push: false, sms: false },
];

const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "Срочно" },
  high:     { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "Важно" },
  medium:   { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", label: "Инфо" },
  low:      { color: "text-muted-foreground", bg: "bg-white/5 border-white/10", label: "" },
};

export default function NotificationsPage() {
  const [settingsList, setSettingsList] = useState(settings);
  const [activeTab, setActiveTab] = useState<"center" | "settings">("center");

  const unread = notifications.filter(n => !n.read).length;

  const toggleSetting = (id: string, field: "push" | "sms") => {
    setSettingsList(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field as keyof typeof s] } : s));
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            Центр уведомлений
            {unread > 0 && (
              <span className="text-xs font-mono bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unread}</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Push и SMS оповещения о зонах спроса</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Подключено</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Непрочитано", value: unread.toString(), icon: "Bell", color: "text-accent-red" },
          { label: "Push сегодня", value: "14", icon: "Smartphone", color: "text-accent-blue" },
          { label: "SMS сегодня", value: "3", icon: "MessageSquare", color: "text-accent-amber" },
          { label: "Конверсия", value: "68%", icon: "TrendingUp", color: "text-accent-green" },
        ].map(s => (
          <div key={s.label} className="surface-1 rounded-lg border border-subtle p-3 flex items-start gap-3">
            <Icon name={s.icon} fallback="Circle" size={16} className={s.color} />
            <div>
              <div className={`text-xl font-mono font-semibold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 surface-1 rounded-lg border border-subtle p-1 w-fit">
        {([["center", "Лента"], ["settings", "Настройки"]] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
              activeTab === t ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "center" ? (
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
          {notifications.map(n => {
            const cfg = priorityConfig[n.priority];
            return (
              <div
                key={n.id}
                className={`p-4 rounded-lg border transition-colors ${
                  !n.read ? "surface-1 border-blue-500/20 glow-blue" : "surface-1 border-subtle"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded border ${cfg.bg} mt-0.5`}>
                    <Icon
                      name={n.type === "push" ? "Smartphone" : "MessageSquare"}
                      fallback="Circle"
                      size={14}
                      className={cfg.color}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold ${!n.read ? "text-foreground" : "text-foreground/80"}`}>
                        {n.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {cfg.label && (
                          <Badge className={`text-xs border ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">{n.time}</span>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="surface-1 rounded-lg border border-subtle overflow-hidden flex-1 min-h-0 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="surface-2 border-b border-subtle">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Тип уведомления</th>
                <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Push</th>
                <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">SMS</th>
              </tr>
            </thead>
            <tbody>
              {settingsList.map((s, i) => (
                <tr key={s.id} className={`border-b border-subtle ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                  <td className="px-4 py-3 text-foreground">{s.label}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={s.push}
                        onCheckedChange={() => toggleSetting(s.id, "push")}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={s.sms}
                        onCheckedChange={() => toggleSetting(s.id, "sms")}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
