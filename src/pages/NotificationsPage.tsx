import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type NotifType = "demand" | "forecast" | "flight" | "system";
type FilterType = "all" | NotifType;

interface Notif {
  id: number;
  type: NotifType;
  channel: "push" | "sms";
  title: string;
  body: string;
  time: string;
  read: boolean;
  priority: "critical" | "high" | "medium" | "low";
  link?: string;
}

const notifications: Notif[] = [
  { id: 1, type: "demand",   channel: "push", title: "Высокий спрос: Аэропорт",      body: "Коэфф. ×5.1 · Рейс SU1814 прибывает в 18:50 · 219 пасс.",       time: "5 мин назад",   read: false, priority: "critical", link: "map" },
  { id: 2, type: "demand",   channel: "sms",  title: "Срочно: Центральный район",    body: "142 активных заказа. Тарифы: Бизнес ×4.8, Комфорт+ ×3.5",          time: "12 мин назад",  read: false, priority: "critical", link: "map" },
  { id: 3, type: "forecast", channel: "push", title: "Прогноз: пиковый час",         body: "Через 45 мин пик у аэропорта. Рейс SU1814, 219 чел.",              time: "20 мин назад",  read: true,  priority: "high",     link: "forecast" },
  { id: 4, type: "flight",   channel: "push", title: "Рейс PC4512 задержан на 40м", body: "Стамбул → Сочи. Прилёт смещён на 19:55. Спрос: ×3.8→×4.9",        time: "35 мин назад",  read: true,  priority: "high",     link: "flights" },
  { id: 5, type: "demand",   channel: "push", title: "Коэффициент снижен: Адлер",   body: "×2.4 → ×1.8. Спрос нормализовался.",                               time: "1 ч назад",     read: true,  priority: "medium",   link: "map" },
  { id: 6, type: "forecast", channel: "push", title: "Прогноз обновлён",             body: "Добавлен рейс U68962 в 20:05. Ожидается рост спроса у аэропорта.", time: "1.5 ч назад",   read: true,  priority: "medium",   link: "forecast" },
  { id: 7, type: "system",   channel: "push", title: "Выручка за день",              body: "4 820 ₽ — ваш результат сегодня. +15% к вчерашнему.",              time: "2 ч назад",     read: true,  priority: "low" },
  { id: 8, type: "flight",   channel: "sms",  title: "Рейс DP841 ожидается",        body: "С-Петербург → Сочи, 189 пасс. Прилёт в 17:55. Все тарифы активны.", time: "3 ч назад",    read: true,  priority: "low",     link: "flights" },
];

const typeConfig: Record<NotifType, { label: string; icon: string; color: string }> = {
  demand:   { label: "Высокий спрос",  icon: "Zap",         color: "text-amber-400" },
  forecast: { label: "Прогнозы",       icon: "TrendingUp",  color: "text-blue-400" },
  flight:   { label: "Рейсы",          icon: "Plane",       color: "text-green-400" },
  system:   { label: "Системные",      icon: "Bell",        color: "text-muted-foreground" },
};

const priorityCfg = {
  critical: { bg: "bg-red-500/10 border-red-500/25",    text: "text-red-400",    label: "Срочно" },
  high:     { bg: "bg-amber-500/10 border-amber-500/25", text: "text-amber-400", label: "Важно" },
  medium:   { bg: "bg-blue-500/10 border-blue-500/25",  text: "text-blue-400",   label: "Инфо" },
  low:      { bg: "bg-white/5 border-white/8",          text: "text-muted-foreground", label: "" },
};

const zones = ["Все зоны", "Аэропорт", "Центральный", "Адлер", "Красная Поляна"];

const notifSettings = [
  { id: "demand_high",  label: "Высокий спрос (≥×3)",      push: true,  sms: false },
  { id: "demand_crit",  label: "Критический спрос (≥×4.5)", push: true,  sms: true  },
  { id: "forecast",     label: "Прогнозы за 45 мин",        push: true,  sms: false },
  { id: "flight_delay", label: "Задержки рейсов",           push: true,  sms: false },
  { id: "flight_arr",   label: "Прилёты (крупные рейсы)",   push: true,  sms: false },
  { id: "system",       label: "Системные и итоги дня",     push: false, sms: false },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<"feed" | "settings">("feed");
  const [settings, setSettings] = useState(notifSettings);
  const [surgeThreshold, setSurgeThreshold] = useState(2.0);
  const [notifyMethod, setNotifyMethod] = useState<"push" | "both">("both");
  const [selectedZones, setSelectedZones] = useState<string[]>(["Все зоны"]);

  const toggleSetting = (id: string, field: "push" | "sms") => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));
  };

  const toggleZone = (zone: string) => {
    if (zone === "Все зоны") { setSelectedZones(["Все зоны"]); return; }
    setSelectedZones(prev => {
      const without = prev.filter(z => z !== "Все зоны" && z !== zone);
      return prev.includes(zone) ? (without.length ? without : ["Все зоны"]) : [...without, zone];
    });
  };

  const filtered = notifications.filter(n => filter === "all" || n.type === filter);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            Центр уведомлений
            {unread > 0 && <span className="text-xs font-mono bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unread}</span>}
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
          { label: "Непрочитано", value: String(unread), icon: "Bell",          color: "text-red-400" },
          { label: "Push сегодня", value: "14",          icon: "Smartphone",    color: "text-blue-400" },
          { label: "SMS сегодня",  value: "3",           icon: "MessageSquare", color: "text-amber-400" },
          { label: "Конверсия",    value: "68%",         icon: "TrendingUp",    color: "text-green-400" },
        ].map(s => (
          <div key={s.label} className="surface-1 rounded-lg border border-subtle p-3 flex items-start gap-2">
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
        {([["feed", "Лента"], ["settings", "Настройки"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${activeTab === t ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "feed" ? (
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
          {/* Type filters */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "demand", "forecast", "flight", "system"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-all ${filter === f ? "bg-blue-600 text-white border-blue-600" : "border-subtle text-muted-foreground hover:text-foreground"}`}
              >
                {f !== "all" && <Icon name={typeConfig[f].icon} fallback="Circle" size={12} />}
                {f === "all" ? "Все" : typeConfig[f].label}
              </button>
            ))}
          </div>

          {/* Notifications list */}
          <div className="space-y-2">
            {filtered.map(n => {
              const pc = priorityCfg[n.priority];
              const tc = typeConfig[n.type];
              return (
                <div key={n.id} className={`p-4 rounded-lg border transition-colors cursor-pointer hover:border-blue-500/20 ${!n.read ? "surface-1 border-blue-500/15" : "surface-1 border-subtle"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded border mt-0.5 shrink-0 ${pc.bg}`}>
                      <Icon name={n.channel === "push" ? "Smartphone" : "MessageSquare"} fallback="Circle" size={13} className={pc.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${!n.read ? "text-foreground" : "text-foreground/80"}`}>{n.title}</span>
                          <span className={`text-xs ${tc.color}`}>
                            <Icon name={tc.icon} fallback="Circle" size={11} className="inline mr-0.5" />{tc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {pc.label && <Badge className={`text-xs border ${pc.bg} ${pc.text}`}>{pc.label}</Badge>}
                          <span className="text-xs text-muted-foreground font-mono">{n.time}</span>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                      {n.link && (
                        <button className="mt-1.5 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                          <Icon name="ExternalLink" fallback="Circle" size={10} />
                          Открыть {n.link === "map" ? "карту" : n.link === "forecast" ? "прогноз" : "рейсы"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
          {/* Notification types */}
          <div className="surface-1 rounded-lg border border-subtle p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Типы уведомлений</div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Тип</th>
                  <th className="text-center py-2 text-xs text-muted-foreground font-medium w-16">Push</th>
                  <th className="text-center py-2 text-xs text-muted-foreground font-medium w-16">SMS</th>
                </tr>
              </thead>
              <tbody>
                {settings.map(s => (
                  <tr key={s.id} className="border-t border-subtle">
                    <td className="py-3 text-foreground">{s.label}</td>
                    <td className="py-3 text-center"><div className="flex justify-center"><Switch checked={s.push} onCheckedChange={() => toggleSetting(s.id, "push")} /></div></td>
                    <td className="py-3 text-center"><div className="flex justify-center"><Switch checked={s.sms} onCheckedChange={() => toggleSetting(s.id, "sms")} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Surge threshold */}
            <div className="surface-1 rounded-lg border border-subtle p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Порог коэффициента</div>
              <div className="text-xs text-muted-foreground mb-2">Уведомлять при коэфф. ≥</div>
              <div className="flex gap-2">
                {[1.5, 2.0, 2.5, 3.0, 4.0].map(v => (
                  <button key={v} onClick={() => setSurgeThreshold(v)}
                    className={`text-xs font-mono px-3 py-1.5 rounded border transition-all ${surgeThreshold === v ? "bg-blue-600 text-white border-blue-600" : "border-subtle text-muted-foreground hover:text-foreground"}`}
                  >
                    ×{v}
                  </button>
                ))}
              </div>
            </div>

            {/* Method */}
            <div className="surface-1 rounded-lg border border-subtle p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Способ оповещения</div>
              <div className="flex gap-2">
                {([["push", "Только Push"], ["both", "Push + SMS"]] as const).map(([v, label]) => (
                  <button key={v} onClick={() => setNotifyMethod(v)}
                    className={`flex-1 text-sm py-2 rounded border transition-all ${notifyMethod === v ? "bg-blue-600 text-white border-blue-600" : "border-subtle text-muted-foreground hover:text-foreground"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Geozones */}
          <div className="surface-1 rounded-lg border border-subtle p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Геозоны (уведомлять только для)</div>
            <div className="flex gap-2 flex-wrap">
              {zones.map(z => (
                <button key={z} onClick={() => toggleZone(z)}
                  className={`text-sm px-3 py-1.5 rounded border transition-all ${selectedZones.includes(z) ? "bg-blue-600 text-white border-blue-600" : "border-subtle text-muted-foreground hover:text-foreground"}`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
