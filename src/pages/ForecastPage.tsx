import Icon from "@/components/ui/icon";

const hours = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
const demandData = [38, 62, 95, 148, 124, 87, 56, 42];
const earningsData = [1520, 2480, 3800, 5920, 4960, 3480, 2240, 1680];

const maxDemand = Math.max(...demandData);
const maxEarnings = Math.max(...earningsData);

const flights_upcoming = [
  { id: "SU1814", time: "18:50", passengers: 219, coeff: 5.1, impact: "critical" },
  { id: "PC4512", time: "19:15", passengers: 174, coeff: 3.8, impact: "high" },
  { id: "SU2304", time: "17:10", passengers: 186, coeff: 4.2, impact: "high" },
  { id: "U68154", time: "17:40", passengers: 120, coeff: 2.8, impact: "medium" },
  { id: "DP841",  time: "17:55", passengers: 189, coeff: 3.1, impact: "medium" },
];

const impactConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Критический", color: "text-accent-red", bg: "bg-red-500/10 border-red-500/20" },
  high:     { label: "Высокий",     color: "text-accent-amber", bg: "bg-amber-500/10 border-amber-500/20" },
  medium:   { label: "Средний",     color: "text-accent-blue", bg: "bg-blue-500/10 border-blue-500/20" },
};

const recommendations = [
  { time: "17:00–18:00", zone: "Аэропорт", reason: "Прилёт SU1814 (219 чел.)", coeff: 5.1, priority: "critical" },
  { time: "16:30–17:00", zone: "Центральный район", reason: "Пик деловой активности", coeff: 2.4, priority: "high" },
  { time: "18:30–19:30", zone: "Аэропорт", reason: "Прилёт PC4512 (174 чел.)", coeff: 3.8, priority: "high" },
  { time: "20:00–21:00", zone: "Красная Поляна", reason: "Вечерний отток туристов", coeff: 1.8, priority: "medium" },
];

export default function ForecastPage() {
  const currentHour = new Date().getHours();

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Прогноз спроса</h1>
          <p className="text-sm text-muted-foreground mt-0.5">На основе расписания рейсов и исторических данных</p>
        </div>
        <div className="flex items-center gap-2 surface-1 px-3 py-1.5 rounded-lg border border-subtle">
          <Icon name="TrendingUp" fallback="Circle" size={14} className="text-accent-green" />
          <span className="text-sm text-foreground">Точность прогноза: <span className="font-mono font-semibold text-accent-green">87%</span></span>
        </div>
      </div>

      {/* Chart */}
      <div className="surface-1 rounded-lg border border-subtle p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-foreground">Прогноз спроса на сегодня</span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Заказы</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-500 inline-block rounded" /> Выручка (₽)</span>
          </div>
        </div>
        <div className="relative h-40">
          <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-xs font-mono text-muted-foreground pr-2 py-0.5">
            <span>{maxDemand}</span>
            <span>{Math.round(maxDemand / 2)}</span>
            <span>0</span>
          </div>
          <div className="ml-8 h-full flex items-end gap-1">
            {demandData.map((val, i) => {
              const isCurrentHour = i === (currentHour - 14 + 24) % 24 && i < 8;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: "120px" }}>
                    <div
                      className={`w-full rounded-t transition-all ${isCurrentHour ? "bg-blue-500" : "bg-blue-500/40 hover:bg-blue-500/70"}`}
                      style={{ height: `${(val / maxDemand) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{hours[i].slice(0, 2)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-subtle grid grid-cols-4 gap-4">
          {[
            { label: "Пик спроса", value: "17:00–18:00", icon: "Zap", color: "text-accent-amber" },
            { label: "Макс. заказов", value: "148/час", icon: "TrendingUp", color: "text-accent-green" },
            { label: "Макс. выручка", value: "5 920 ₽/час", icon: "DollarSign", color: "text-accent-green" },
            { label: "Рейсов (2ч)", value: "5 рейсов", icon: "Plane", color: "text-accent-blue" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <Icon name={item.icon} fallback="Circle" size={14} className={item.color} />
              <div>
                <div className={`text-sm font-semibold font-mono ${item.color}`}>{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto">
        {/* Upcoming flights impact */}
        <div className="surface-1 rounded-lg border border-subtle p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Plane" fallback="Circle" size={16} className="text-accent-blue" />
            <span className="text-sm font-medium text-foreground">Влияние рейсов</span>
          </div>
          <div className="space-y-2">
            {flights_upcoming.map(f => {
              const cfg = impactConfig[f.impact];
              return (
                <div key={f.id} className="flex items-center justify-between p-3 surface-2 rounded border border-subtle">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-0.5 rounded text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </div>
                    <div>
                      <div className="text-sm font-mono font-semibold text-foreground">{f.id}</div>
                      <div className="text-xs text-muted-foreground">{f.passengers} пасс. · {f.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-mono font-bold ${f.coeff >= 4 ? "text-accent-red" : f.coeff >= 3 ? "text-accent-amber" : "text-accent-blue"}`}>
                      ×{f.coeff}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="surface-1 rounded-lg border border-subtle p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Lightbulb" fallback="Circle" size={16} className="text-accent-amber" />
            <span className="text-sm font-medium text-foreground">Рекомендации</span>
          </div>
          <div className="space-y-2">
            {recommendations.map((r, i) => {
              const cfg = impactConfig[r.priority];
              return (
                <div key={i} className="p-3 surface-2 rounded border border-subtle">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs text-muted-foreground">{r.time}</span>
                    <span className={`text-xs font-medium ${cfg.color}`}>{r.zone}</span>
                  </div>
                  <div className="text-sm text-foreground">{r.reason}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">Ожидаемый коэфф.</span>
                    <span className={`font-mono font-bold text-sm ${r.coeff >= 4 ? "text-accent-red" : r.coeff >= 3 ? "text-accent-amber" : "text-accent-blue"}`}>
                      ×{r.coeff}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
