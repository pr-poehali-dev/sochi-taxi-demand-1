import { useState } from "react";
import Icon from "@/components/ui/icon";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const periods = ["Сегодня", "Неделя", "Месяц", "Квартал"] as const;
type Period = typeof periods[number];

const data: Record<Period, {
  revenue: string; rides: number; avgRide: string; hours: string;
  efficiency: number; surgePct: number; trend: string;
  peakBonus: string; avgSurge: string;
  chart: { label: string; revenue: number; rides: number }[];
}> = {
  "Сегодня": {
    revenue: "4 820", rides: 23, avgRide: "209", hours: "6.5",
    efficiency: 74, surgePct: 58, trend: "+15%", peakBonus: "1 240", avgSurge: "2.4",
    chart: [
      { label: "07:00", revenue: 320,  rides: 2 },
      { label: "09:00", revenue: 480,  rides: 3 },
      { label: "11:00", revenue: 560,  rides: 3 },
      { label: "13:00", revenue: 380,  rides: 2 },
      { label: "15:00", revenue: 760,  rides: 4 },
      { label: "17:00", revenue: 1240, rides: 5 },
      { label: "19:00", revenue: 720,  rides: 3 },
      { label: "21:00", revenue: 360,  rides: 1 },
    ],
  },
  "Неделя": {
    revenue: "32 640", rides: 158, avgRide: "206", hours: "45.5",
    efficiency: 68, surgePct: 52, trend: "+8%", peakBonus: "8 400", avgSurge: "2.1",
    chart: [
      { label: "Пн", revenue: 4200, rides: 21 },
      { label: "Вт", revenue: 4800, rides: 24 },
      { label: "Ср", revenue: 5200, rides: 26 },
      { label: "Чт", revenue: 4600, rides: 23 },
      { label: "Пт", revenue: 5800, rides: 29 },
      { label: "Сб", revenue: 4900, rides: 24 },
      { label: "Вс", revenue: 3140, rides: 11 },
    ],
  },
  "Месяц": {
    revenue: "138 200", rides: 672, avgRide: "205", hours: "194",
    efficiency: 71, surgePct: 55, trend: "+22%", peakBonus: "34 500", avgSurge: "2.3",
    chart: Array.from({ length: 4 }, (_, i) => ({
      label: `Неделя ${i + 1}`,
      revenue: [28000, 36000, 42000, 32200][i],
      rides: [138, 168, 204, 162][i],
    })),
  },
  "Квартал": {
    revenue: "412 500", rides: 2015, avgRide: "204", hours: "584",
    efficiency: 69, surgePct: 54, trend: "+31%", peakBonus: "104 000", avgSurge: "2.2",
    chart: [
      { label: "Янв", revenue: 120000, rides: 587 },
      { label: "Фев", revenue: 135000, rides: 655 },
      { label: "Мар", revenue: 157500, rides: 773 },
    ],
  },
};

const zones_stats = [
  { name: "Аэропорт",      share: 38, coeff: "3.8" },
  { name: "Центральный",   share: 23, coeff: "2.4" },
  { name: "Адлер",         share: 17, coeff: "2.0" },
  { name: "Красная Поляна",share: 13, coeff: "1.8" },
  { name: "Хоста",         share: 9,  coeff: "1.2" },
];

const recommendations = [
  { icon: "Clock",   title: "Лучшие часы", desc: "17:00–19:00 и 08:00–10:00 — наибольший доход на час" },
  { icon: "MapPin",  title: "Топ-район",   desc: "Аэропорт: 38% выручки. Рекомендую дежурство у терминала A" },
  { icon: "TrendingUp", title: "Прогноз", desc: "Следующий пик через 45 мин. Рейс SU1814, 219 пасс." },
  { icon: "Award",   title: "vs. средний", desc: "Вы проводите на 25% больше времени в зонах высокого спроса" },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {value: number; name: string}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface-3 border border-subtle rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1 font-mono">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="text-foreground">
          {p.name === "revenue" ? `${p.value.toLocaleString("ru")} ₽` : `${p.value} поездок`}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("Сегодня");
  const d = data[period];

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Аналитика доходов</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Эффективность и статистика за период</p>
        </div>
        <div className="flex gap-1 surface-1 rounded-lg border border-subtle p-1">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${period === p ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Выручка",      value: `${d.revenue} ₽`,  icon: "Wallet",    color: "text-green-400",  trend: d.trend },
          { label: "Поездок",      value: String(d.rides),   icon: "Navigation",color: "text-blue-400",   trend: null },
          { label: "Средний чек",  value: `${d.avgRide} ₽`,  icon: "Receipt",   color: "text-amber-400",  trend: null },
          { label: "Бонус за пик", value: `${d.peakBonus} ₽`,icon: "Zap",       color: "text-amber-400",  trend: null },
        ].map(c => (
          <div key={c.label} className="surface-1 rounded-lg border border-subtle p-4">
            <div className="flex items-center justify-between mb-2">
              <Icon name={c.icon} fallback="Circle" size={15} className="text-muted-foreground" />
              {c.trend && (
                <span className="text-xs font-medium text-green-400 flex items-center gap-0.5">
                  <Icon name="TrendingUp" fallback="Circle" size={11} />{c.trend}
                </span>
              )}
            </div>
            <div className={`text-2xl font-mono font-semibold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-y-auto">
        {/* Revenue chart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="surface-1 rounded-lg border border-subtle p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">Динамика выручки</span>
              <span className="text-xs text-muted-foreground font-mono">{period}</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={d.chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 18% 16%)" />
                <XAxis dataKey="label" tick={{ fill: "hsl(215 15% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215 15% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="hsl(214 84% 56%)" radius={[3, 3, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Efficiency row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Эффективность",          value: `${d.efficiency}%`,  bar: d.efficiency,    color: "from-blue-500 to-green-500" },
              { label: "Время в зонах пика",      value: `${d.surgePct}%`,   bar: d.surgePct,      color: "from-amber-500 to-orange-500" },
              { label: "Средний коэфф. за смену", value: `×${d.avgSurge}`,   bar: null,            color: "" },
            ].map(item => (
              <div key={item.label} className="surface-1 rounded-lg border border-subtle p-3">
                <div className="text-lg font-mono font-semibold text-foreground mb-1">{item.value}</div>
                {item.bar !== null && (
                  <div className="h-1 bg-white/5 rounded-full mb-2">
                    <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.bar}%` }} />
                  </div>
                )}
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="surface-1 rounded-lg border border-subtle p-4">
            <div className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Icon name="Lightbulb" fallback="Circle" size={15} className="text-amber-400" />
              Рекомендации
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recommendations.map(r => (
                <div key={r.title} className="surface-2 rounded border border-subtle p-3 flex items-start gap-2">
                  <Icon name={r.icon} fallback="Circle" size={14} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{r.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zones + rides chart */}
        <div className="flex flex-col gap-4">
          <div className="surface-1 rounded-lg border border-subtle p-4">
            <div className="text-sm font-medium text-foreground mb-3">Зоны: вклад в выручку</div>
            <div className="space-y-3">
              {zones_stats.map(z => (
                <div key={z.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{z.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-400">avg ×{z.coeff}</span>
                      <span className="text-sm font-mono font-semibold text-foreground">{z.share}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full">
                    <div className="h-full rounded-full bg-blue-500/60" style={{ width: `${z.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-1 rounded-lg border border-subtle p-4">
            <div className="text-sm font-medium text-foreground mb-3">Поездки</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={d.chart} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 18% 16%)" />
                <XAxis dataKey="label" tick={{ fill: "hsl(215 15% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215 15% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="rides" stroke="hsl(142 70% 45%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="surface-1 rounded-lg border border-green-500/20 p-4 bg-green-500/5">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Award" fallback="Circle" size={15} className="text-green-400" />
              <span className="text-sm font-medium text-green-400">vs. Средний водитель</span>
            </div>
            <div className="text-sm text-foreground">На <span className="font-semibold text-green-400">+25%</span> больше времени в зонах высокого спроса</div>
            <div className="text-xs text-muted-foreground mt-1">Дополнительный доход за период: <span className="text-foreground font-mono">{d.peakBonus} ₽</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
