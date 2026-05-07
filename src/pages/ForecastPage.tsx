import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { fetchAirportData, type AirportData } from "@/lib/api";

const hours = Array.from({ length: 6 }, (_, i) => {
  const now = new Date();
  now.setHours(now.getHours() + i, 0, 0, 0);
  return now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
});

const levelConfig = {
  low:      { color: "#22C55E", label: "Низкий",        text: "text-green-400" },
  medium:   { color: "#F59E0B", label: "Средний",       text: "text-amber-400" },
  high:     { color: "#F97316", label: "Высокий",       text: "text-orange-400" },
  critical: { color: "#EF4444", label: "Очень высокий", text: "text-red-400" },
};

const reasons = [
  "Прибытие рейса SU1814 (219 пасс.)",
  "Прибытие рейса SU2304 (186 пасс.)",
  "Вечерний деловой час-пик",
  "Прибытие рейса PC4512 (174 пасс.)",
  "Отток туристов из Красной Поляны",
  "Прибытие рейса DP841 (189 пасс.)",
];

export default function ForecastPage() {
  const [data, setData] = useState<AirportData | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAirportData().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const zones = data?.demand_zones ?? [];

  // Generate 6-hour demand chart from zones
  const chartData = hours.map((h, i) => {
    const base = zones.reduce((s, z) => s + z.surge, 0) / (zones.length || 1);
    const variation = [0.7, 0.85, 1.0, 1.2, 1.1, 0.9][i] ?? 1;
    return { hour: h, value: Math.round(base * variation * 30), coeff: +(base * variation).toFixed(1) };
  });
  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  // Forecast events from flights
  const events = (data?.arrivals ?? [])
    .filter(f => f.status !== "arrived")
    .slice(0, 6)
    .map((f, i) => ({
      time: f.actual,
      zone: "Аэропорт",
      level: (f.surge_coeff ?? 0) >= 4 ? "critical" : (f.surge_coeff ?? 0) >= 3 ? "high" : "medium",
      reason: reasons[i] ?? `Прибытие рейса ${f.flight}`,
      confidence: Math.round(70 + Math.random() * 25),
      coeff: f.surge_coeff ?? 1.0,
    }));

  const topZone = zones[0];

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Прогноз спроса</h1>
          <p className="text-sm text-muted-foreground mt-0.5">На основе расписания рейсов и исторических данных</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Уведомления о прогнозах</span>
            <Switch checked={notifEnabled} onCheckedChange={setNotifEnabled} />
          </div>
          <div className="flex items-center gap-2 surface-1 px-3 py-1.5 rounded-lg border border-subtle">
            <Icon name="TrendingUp" fallback="Circle" size={14} className="text-green-400" />
            <span className="text-sm text-foreground">Точность: <span className="font-mono font-semibold text-green-400">87%</span></span>
          </div>
        </div>
      </div>

      {/* Summary text */}
      {topZone && (
        <div className="surface-1 rounded-lg border border-amber-500/25 p-4 flex items-start gap-3">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/25 shrink-0 mt-0.5">
            <Icon name="Zap" fallback="Circle" size={16} className="text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Через {topZone.forecast_min} минут ожидается высокий спрос у {topZone.name}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Рейс SU1814 (219 пасс.) · Ожидаемый коэфф. <span className="text-amber-400 font-mono font-semibold">×{topZone.surge}</span> · Все тарифы от ×{topZone.tariff_demand?.[0]?.coeff ?? "1.0"} до ×{topZone.tariff_demand?.slice(-1)[0]?.coeff ?? "5.0"}
            </div>
          </div>
        </div>
      )}

      {/* Chart + events */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0 overflow-y-auto">
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Chart */}
          <div className="surface-1 rounded-lg border border-subtle p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">Прогноз спроса на 6 часов</span>
              <span className="text-xs text-muted-foreground font-mono">{hours[0]} – {hours[hours.length - 1]}</span>
            </div>
            <div className="relative h-36">
              <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-xs font-mono text-muted-foreground pr-2 py-0.5">
                <span>{maxVal}</span>
                <span>{Math.round(maxVal / 2)}</span>
                <span>0</span>
              </div>
              <div className="ml-8 h-full flex items-end gap-2">
                {chartData.map((d, i) => {
                  const isPeak = d.coeff === Math.max(...chartData.map(c => c.coeff));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex flex-col justify-end relative" style={{ height: "110px" }}>
                        {isPeak && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-amber-400 font-mono font-bold whitespace-nowrap">пик</div>
                        )}
                        <div
                          className={`w-full rounded-t transition-all ${isPeak ? "bg-amber-500" : "bg-blue-500/50 group-hover:bg-blue-500/70"}`}
                          style={{ height: `${(d.value / maxVal) * 100}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-mono text-muted-foreground">{d.hour.slice(0, 5)}</div>
                        <div className={`text-xs font-mono font-semibold ${isPeak ? "text-amber-400" : "text-muted-foreground"}`}>×{d.coeff}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Map zones preview */}
          <div className="surface-1 rounded-lg border border-subtle p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Map" fallback="Circle" size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-foreground">Ожидаемые зоны спроса</span>
            </div>
            <div className="relative rounded bg-white/[0.02] border border-subtle overflow-hidden" style={{ height: 160 }}>
              <div className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `linear-gradient(hsl(214 84% 56% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(214 84% 56% / 0.5) 1px, transparent 1px)`,
                  backgroundSize: '30px 30px'
                }}
              />
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Загрузка...</div>
              ) : (
                zones.map((z, i) => {
                  const positions = [
                    { x: 68, y: 55 }, { x: 38, y: 30 }, { x: 62, y: 72 },
                    { x: 75, y: 20 }, { x: 25, y: 62 }, { x: 12, y: 28 }
                  ];
                  const pos = positions[i] ?? { x: 50, y: 50 };
                  const cfg = levelConfig[z.level];
                  return (
                    <div key={z.id} className="absolute" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)" }}>
                      <div className="rounded-full border-2 border-dashed opacity-60"
                        style={{ width: 40 + z.radius / 60, height: 40 + z.radius / 60, borderColor: cfg.color, background: cfg.color + "10" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold"
                        style={{ color: cfg.color }}>×{z.surge}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Events list */}
        <div className="lg:col-span-2 surface-1 rounded-lg border border-subtle p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Calendar" fallback="Circle" size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-foreground">События спроса</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icon name="RefreshCw" fallback="Circle" size={16} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((ev, i) => {
                const cfg = levelConfig[ev.level as keyof typeof levelConfig] ?? levelConfig.medium;
                return (
                  <div key={i} className="p-3 surface-2 rounded border border-subtle">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-foreground">{ev.time}</span>
                        <span className="text-xs" style={{ color: cfg.color }}>● {cfg.label}</span>
                      </div>
                      <span className="font-mono font-bold text-sm" style={{ color: cfg.color }}>×{ev.coeff}</span>
                    </div>
                    <div className="text-sm text-foreground">{ev.reason}</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">{ev.zone}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-white/5 rounded-full h-1">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${ev.confidence}%` }} />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{ev.confidence}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">Нет предстоящих событий</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}