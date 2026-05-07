import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

const flights = [
  { id: "SU2304", airline: "Аэрофлот", origin: "Москва (SVO)", time: "14:35", arrival: "17:10", status: "landing", terminal: "A", passengers: 186, demand: 4.2 },
  { id: "U68154", airline: "UTair", origin: "Екатеринбург (SVX)", time: "14:50", arrival: "17:40", status: "on-time", terminal: "A", passengers: 120, demand: 2.8 },
  { id: "DP841",  airline: "Победа", origin: "Санкт-Петербург (LED)", time: "15:05", arrival: "17:55", status: "on-time", terminal: "B", passengers: 189, demand: 3.1 },
  { id: "S76321", airline: "Сибирь", origin: "Новосибирск (OVB)", time: "15:20", arrival: "18:15", status: "delayed", terminal: "A", passengers: 140, demand: 2.4 },
  { id: "FV6201", airline: "Россия", origin: "Казань (KZN)", time: "15:45", arrival: "18:30", status: "on-time", terminal: "B", passengers: 85, demand: 1.9 },
  { id: "SU1814", airline: "Аэрофлот", origin: "Москва (DME)", time: "16:00", arrival: "18:50", status: "on-time", terminal: "A", passengers: 219, demand: 5.1 },
  { id: "PC4512", airline: "Pegasus", origin: "Стамбул (SAW)", time: "16:30", arrival: "19:15", status: "delayed", terminal: "B", passengers: 174, demand: 3.8 },
  { id: "U68962", airline: "UTair", origin: "Тюмень (TJM)", time: "17:10", arrival: "20:05", status: "on-time", terminal: "A", passengers: 98, demand: 2.1 },
];

const departures = [
  { id: "SU2305", airline: "Аэрофлот", dest: "Москва (SVO)", time: "15:30", status: "boarding", gate: "A12", terminal: "A" },
  { id: "DP842",  airline: "Победа", dest: "Санкт-Петербург (LED)", time: "16:00", status: "on-time", gate: "B07", terminal: "B" },
  { id: "U68155", airline: "UTair", dest: "Екатеринбург (SVX)", time: "16:20", status: "on-time", gate: "A05", terminal: "A" },
  { id: "S76322", airline: "Сибирь", dest: "Новосибирск (OVB)", time: "16:55", status: "boarding", gate: "A09", terminal: "A" },
  { id: "SU1815", airline: "Аэрофлот", dest: "Москва (DME)", time: "17:15", status: "delayed", gate: "B03", terminal: "B" },
  { id: "FV6202", airline: "Россия", dest: "Казань (KZN)", time: "18:00", status: "on-time", gate: "A14", terminal: "A" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  "on-time":  { label: "По расписанию", className: "status-on-time" },
  "delayed":  { label: "Задержан",       className: "status-delayed" },
  "cancelled":{ label: "Отменён",        className: "status-cancelled" },
  "boarding": { label: "Посадка",        className: "status-boarding" },
  "landing":  { label: "Прибывает",      className: "text-accent-blue" },
};

const badgeVariant: Record<string, string> = {
  "on-time":  "bg-green-500/10 text-green-400 border-green-500/20",
  "delayed":  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "cancelled":"bg-red-500/10 text-red-400 border-red-500/20",
  "boarding": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "landing":  "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function FlightBoard() {
  const [tab, setTab] = useState<"arrivals" | "departures">("arrivals");

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Табло рейсов</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Международный аэропорт Сочи (AER)</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-semibold text-foreground">{timeStr}</div>
          <div className="text-xs text-muted-foreground">{dateStr}</div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Прилётов сегодня", value: "32", icon: "PlaneLanding", color: "text-accent-green" },
          { label: "Ожидаются (2ч)", value: "8", icon: "Clock", color: "text-accent-blue" },
          { label: "Задержки", value: "3", icon: "AlertCircle", color: "text-accent-amber" },
          { label: "Пассажиропоток", value: "1 211", icon: "Users", color: "text-accent-blue" },
        ].map(card => (
          <div key={card.label} className="surface-1 rounded-lg border border-subtle p-3 flex items-start gap-3">
            <div className="p-2 surface-2 rounded">
              <Icon name={card.icon} fallback="Circle" size={16} className={card.color} />
            </div>
            <div>
              <div className={`text-xl font-mono font-semibold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 surface-1 rounded-lg border border-subtle p-1 w-fit">
        {(["arrivals", "departures"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
              tab === t
                ? "bg-blue-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "arrivals" ? (
              <span className="flex items-center gap-1.5"><Icon name="PlaneLanding" fallback="Circle" size={14} /> Прилёты</span>
            ) : (
              <span className="flex items-center gap-1.5"><Icon name="PlaneTakeoff" fallback="Circle" size={14} /> Вылеты</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="surface-1 rounded-lg border border-subtle overflow-hidden flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 surface-2 border-b border-subtle z-10">
            <tr>
              {tab === "arrivals" ? (
                <>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Рейс</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Маршрут</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Вылет</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Прилёт</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Статус</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Терм.</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Спрос</th>
                </>
              ) : (
                <>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Рейс</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Направление</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Вылет</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Статус</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Выход</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">Терм.</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {tab === "arrivals"
              ? flights.map((f, i) => (
                <tr key={f.id} className={`border-b border-subtle hover:surface-2 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                  <td className="px-4 py-3">
                    <div className="font-mono font-semibold text-foreground">{f.id}</div>
                    <div className="text-xs text-muted-foreground">{f.airline}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{f.origin}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{f.time}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{f.arrival}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${statusConfig[f.status]?.className}`}>
                      {statusConfig[f.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs surface-2 px-2 py-0.5 rounded border border-subtle text-foreground">{f.terminal}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-bold text-sm ${f.demand >= 4 ? "text-accent-red" : f.demand >= 3 ? "text-accent-amber" : "text-accent-blue"}`}>
                      ×{f.demand}
                    </span>
                  </td>
                </tr>
              ))
              : departures.map((f, i) => (
                <tr key={f.id} className={`border-b border-subtle hover:surface-2 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                  <td className="px-4 py-3">
                    <div className="font-mono font-semibold text-foreground">{f.id}</div>
                    <div className="text-xs text-muted-foreground">{f.airline}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{f.dest}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{f.time}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs font-medium border ${badgeVariant[f.status]}`}>
                      {statusConfig[f.status]?.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-foreground">{f.gate}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs surface-2 px-2 py-0.5 rounded border border-subtle text-foreground">{f.terminal}</span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
