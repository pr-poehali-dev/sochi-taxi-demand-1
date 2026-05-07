import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { fetchAirportData, type Flight, type AirportData } from "@/lib/api";
import AirportQueueWidget from "@/components/AirportQueueWidget";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  on_time:   { label: "По расписанию", color: "text-green-400",  bg: "bg-green-500/10 border-green-500/25" },
  arrived:   { label: "Прибыл",        color: "text-green-400",  bg: "bg-green-500/10 border-green-500/25" },
  boarding:  { label: "Посадка",       color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/25" },
  delayed:   { label: "Задержан",      color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/25" },
  cancelled: { label: "Отменён",       color: "text-red-400",    bg: "bg-red-500/10 border-red-500/25" },
};

const timeDiff = (a: string, b: string): number => {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return (bh * 60 + bm) - (ah * 60 + am);
};

const delayColor = (sched: string, actual: string): string => {
  const diff = timeDiff(sched, actual);
  if (diff <= 0) return "text-green-400";
  if (diff <= 30) return "text-amber-400";
  return "text-red-400";
};

export default function FlightBoard() {
  const [data, setData] = useState<AirportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"arrivals" | "departures">("arrivals");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const load = async () => {
    setLoading(true);
    try { setData(await fetchAirportData()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const flights: Flight[] = tab === "arrivals" ? (data?.arrivals ?? []) : (data?.departures ?? []);

  const filtered = flights.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.flight.toLowerCase().includes(q) ||
      f.airline.toLowerCase().includes(q) ||
      (f.origin ?? "").toLowerCase().includes(q) ||
      (f.dest ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Табло рейсов</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Международный аэропорт Сочи (AER) · Реальное время</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs surface-2 border border-subtle px-3 py-1.5 rounded hover:border-blue-500/40 transition-colors">
            <Icon name="RefreshCw" fallback="Circle" size={12} className={loading ? "animate-spin text-blue-400" : "text-muted-foreground"} />
            <span className="text-muted-foreground">Обновить</span>
          </button>
          <div className="text-right">
            <div className="text-lg font-mono font-semibold text-foreground">{timeStr}</div>
            <div className="text-xs text-muted-foreground">{dateStr}</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Прилётов сегодня",  value: data ? String(data.arrivals.length) : "—",   icon: "PlaneLanding", color: "text-green-400" },
          { label: "На подходе (2ч)",   value: data ? String(data.arrivals.filter(f => f.status !== "arrived").length) : "—", icon: "Clock", color: "text-blue-400" },
          { label: "Задержки",          value: data ? String(data.arrivals.filter(f => f.status === "delayed").length) : "—", icon: "AlertCircle", color: "text-amber-400" },
          { label: "Пассажиров (2ч)",   value: data ? String(data.arrivals.filter(f => f.status !== "arrived").reduce((s, f) => s + (f.passengers ?? 0), 0)) : "—", icon: "Users", color: "text-blue-400" },
        ].map(c => (
          <div key={c.label} className="surface-1 rounded-lg border border-subtle p-3 flex items-start gap-3">
            <div className="p-2 surface-2 rounded">
              <Icon name={c.icon} fallback="Circle" size={16} className={c.color} />
            </div>
            <div>
              <div className={`text-xl font-mono font-semibold ${c.color}`}>{c.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 surface-1 rounded-lg border border-subtle p-1">
          {(["arrivals", "departures"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelectedFlight(null); }}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${tab === t ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon name={t === "arrivals" ? "PlaneLanding" : "PlaneTakeoff"} fallback="Circle" size={14} />
              {t === "arrivals" ? "Прилёты" : "Вылеты"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Icon name="Search" fallback="Circle" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Рейс, авиакомпания, направление..."
            className="pl-8 h-9 bg-transparent border-subtle text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["all", "on_time", "delayed", "boarding"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1.5 rounded border transition-all ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "border-subtle text-muted-foreground hover:text-foreground"}`}
            >
              {s === "all" ? "Все" : statusConfig[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="surface-1 rounded-lg border border-subtle overflow-hidden flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="RefreshCw" fallback="Circle" size={16} className="animate-spin" />
              <span className="text-sm">Загрузка данных...</span>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="sticky top-0 surface-2 border-b border-subtle z-10">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Рейс</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">{tab === "arrivals" ? "Откуда" : "Куда"}</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Расп.</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Факт.</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Статус</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Терм.</th>
                {tab === "arrivals" && (
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Спрос</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => {
                const sc = statusConfig[f.status] ?? statusConfig.on_time;
                const isSelected = selectedFlight?.flight === f.flight;
                return (
                  <tr key={f.flight}
                    onClick={() => setSelectedFlight(isSelected ? null : f)}
                    className={`border-b border-subtle transition-colors cursor-pointer ${isSelected ? "bg-blue-500/5 border-blue-500/20" : i % 2 === 0 ? "hover:bg-white/[0.02]" : "bg-white/[0.01] hover:bg-white/[0.03]"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-foreground">{f.flight}</div>
                      <div className="text-xs text-muted-foreground">{f.airline}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm">{f.origin ?? f.dest}</td>
                    <td className="px-4 py-3 font-mono text-foreground">{f.scheduled}</td>
                    <td className={`px-4 py-3 font-mono font-semibold ${delayColor(f.scheduled, f.actual)}`}>
                      {f.actual}
                      {timeDiff(f.scheduled, f.actual) > 0 && (
                        <span className="text-xs ml-1 font-normal">+{timeDiff(f.scheduled, f.actual)}м</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs border ${sc.bg} ${sc.color}`}>{sc.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs surface-2 px-2 py-0.5 rounded border border-subtle text-foreground">{f.terminal}</span>
                      {f.gate && <span className="text-xs text-muted-foreground ml-1.5">{f.gate}</span>}
                    </td>
                    {tab === "arrivals" && (
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono font-bold text-sm ${(f.surge_coeff ?? 0) >= 4 ? "text-red-400" : (f.surge_coeff ?? 0) >= 3 ? "text-amber-400" : "text-blue-400"}`}>
                          ×{f.surge_coeff ?? "—"}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Рейсы не найдены</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Flight tariff detail */}
      {selectedFlight && tab === "arrivals" && selectedFlight.tariff_demand && (
        <div className="surface-1 rounded-lg border border-blue-500/25 p-4 animate-fade-in shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono font-bold text-foreground">{selectedFlight.flight}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-sm text-muted-foreground">{selectedFlight.airline}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-sm text-foreground">{selectedFlight.origin}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-sm text-muted-foreground">{selectedFlight.passengers} пасс.</span>
            </div>
            <button onClick={() => setSelectedFlight(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" fallback="Circle" size={16} />
            </button>
          </div>
          <div className="text-xs text-muted-foreground mb-2">Прогнозируемый спрос по тарифам при прилёте:</div>
          <div className="flex flex-wrap gap-2">
            {selectedFlight.tariff_demand.map(t => (
              <div key={t.tariff_id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                style={{ background: t.color + "12", borderColor: t.color + "35" }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                <span className="text-sm text-foreground">{t.tariff_name}</span>
                <span className="font-mono font-bold text-sm" style={{ color: t.color }}>×{t.coeff}</span>
              </div>
            ))}
          </div>
          <button className="mt-3 flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            <Icon name="MapPin" fallback="Circle" size={12} />
            Показать зоны спроса на карте
          </button>
        </div>
      )}

      {/* Airport queue — full widget */}
      <div className="shrink-0">
        <AirportQueueWidget />
      </div>
    </div>
  );
}