import { useState } from "react";
import Icon from "@/components/ui/icon";

const periods = ["Сегодня", "Неделя", "Месяц", "Квартал"];

const periodData = {
  "Сегодня": {
    revenue: "4 820",
    rides: 23,
    avgRide: "209",
    hours: "6.5",
    efficiency: 74,
    trend: "+15%",
    trendUp: true,
    hourly: [320, 480, 0, 0, 0, 0, 0, 720, 960, 840, 560, 380, 0, 0, 480, 760, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  "Неделя": {
    revenue: "32 640",
    rides: 158,
    avgRide: "206",
    hours: "45.5",
    efficiency: 68,
    trend: "+8%",
    trendUp: true,
    hourly: [3200, 4800, 5200, 4600, 5800, 4900, 4100],
  },
  "Месяц": {
    revenue: "138 200",
    rides: 672,
    avgRide: "205",
    hours: "194",
    efficiency: 71,
    trend: "+22%",
    trendUp: true,
    hourly: [12000, 14500, 16800, 18200, 19100, 17400, 15200, 13800, 11200],
  },
  "Квартал": {
    revenue: "412 500",
    rides: 2015,
    avgRide: "204",
    hours: "584",
    efficiency: 69,
    trend: "+31%",
    trendUp: true,
    hourly: [38000, 42000, 46500, 52000, 58000, 54000, 49000, 44000, 39000, 43000, 47000, 52000],
  },
};

type PeriodKey = keyof typeof periodData;

const zones_stats = [
  { name: "Аэропорт", revenue: "1 840", rides: 9, avg: "204", share: 38 },
  { name: "Центральный", revenue: "1 120", rides: 6, avg: "186", share: 23 },
  { name: "Адлер", revenue: "820", rides: 4, avg: "205", share: 17 },
  { name: "Красная Поляна", revenue: "640", rides: 3, avg: "213", share: 13 },
  { name: "Хоста", revenue: "400", rides: 1, avg: "400", share: 9 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodKey>("Сегодня");
  const data = periodData[period];
  const maxBar = Math.max(...data.hourly);

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Аналитика доходов</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Эффективность и статистика за период</p>
        </div>
        <div className="flex gap-1 surface-1 rounded-lg border border-subtle p-1">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as PeriodKey)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                period === p ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Выручка", value: `${data.revenue} ₽`, icon: "Wallet", color: "text-accent-green", trend: data.trend, trendUp: data.trendUp },
          { label: "Поездок", value: data.rides.toString(), icon: "Navigation", color: "text-accent-blue", trend: null, trendUp: true },
          { label: "Средний чек", value: `${data.avgRide} ₽`, icon: "Receipt", color: "text-accent-amber", trend: null, trendUp: true },
          { label: "Часов за рулём", value: data.hours, icon: "Clock", color: "text-foreground", trend: null, trendUp: true },
        ].map(card => (
          <div key={card.label} className="surface-1 rounded-lg border border-subtle p-4">
            <div className="flex items-center justify-between mb-2">
              <Icon name={card.icon} fallback="Circle" size={16} className="text-muted-foreground" />
              {card.trend && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${card.trendUp ? "text-accent-green" : "text-accent-red"}`}>
                  <Icon name={card.trendUp ? "TrendingUp" : "TrendingDown"} fallback="Circle" size={12} />
                  {card.trend}
                </span>
              )}
            </div>
            <div className={`text-2xl font-mono font-semibold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-y-auto">
        {/* Revenue chart */}
        <div className="lg:col-span-2 surface-1 rounded-lg border border-subtle p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">Динамика выручки</span>
            <span className="text-xs text-muted-foreground font-mono">{period}</span>
          </div>
          <div className="flex-1 relative" style={{ minHeight: 140 }}>
            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-xs font-mono text-muted-foreground pr-2 py-0.5">
              <span>{Math.round(maxBar / 1000)}к</span>
              <span>{Math.round(maxBar / 2000)}к</span>
              <span>0</span>
            </div>
            <div className="ml-6 h-full flex items-end gap-0.5">
              {data.hourly.map((val, i) => (
                <div key={i} className="flex-1 flex justify-center items-end" style={{ height: "100%" }}>
                  <div
                    className={`w-full rounded-t transition-all ${
                      i === data.hourly.length - 1 ? "bg-green-500" : "bg-green-500/30 hover:bg-green-500/60"
                    }`}
                    style={{ height: `${Math.max((val / maxBar) * 100, 2)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-subtle">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 rounded-full h-1.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                  style={{ width: `${data.efficiency}%` }}
                />
              </div>
              <span className="text-xs font-mono text-foreground">{data.efficiency}% эффективность</span>
            </div>
          </div>
        </div>

        {/* Zones breakdown */}
        <div className="surface-1 rounded-lg border border-subtle p-4">
          <div className="text-sm font-medium text-foreground mb-3">По зонам</div>
          <div className="space-y-3">
            {zones_stats.map(z => (
              <div key={z.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{z.name}</span>
                  <span className="text-sm font-mono font-semibold text-foreground">{z.revenue} ₽</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 rounded-full h-1">
                    <div
                      className="h-full rounded-full bg-blue-500/60"
                      style={{ width: `${z.share}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right">{z.share}%</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground">{z.rides} поездок</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">avg {z.avg} ₽</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
