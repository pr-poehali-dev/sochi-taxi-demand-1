import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { fetchAirportData, type AirportQueue, type QueueTariff } from "@/lib/api";

const statusColors: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  overloaded: { dot: "bg-red-500",    text: "text-red-400",    bg: "bg-red-500/8",    border: "border-red-500/20"   },
  normal:     { dot: "bg-green-500",  text: "text-green-400",  bg: "bg-green-500/8",  border: "border-green-500/20" },
  low:        { dot: "bg-amber-500",  text: "text-amber-400",  bg: "bg-amber-500/8",  border: "border-amber-500/20" },
  critical:   { dot: "bg-blue-500",   text: "text-blue-400",   bg: "bg-blue-500/8",   border: "border-blue-500/20"  },
};

// Визуальный ряд машинок пропорционально очереди
function CarBar({ count, maxCount, color }: { count: number; maxCount: number; color: string }) {
  const filled = Math.max(1, Math.round((count / maxCount) * 10));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-3.5 h-2 rounded-sm transition-all"
          style={{
            background: i < filled ? color : "hsl(216 18% 18%)",
            opacity: i < filled ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

function TariffRow({ t, maxCars }: { t: QueueTariff; maxCars: number }) {
  const sc = statusColors[t.queue_status] ?? statusColors.normal;
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${sc.bg} ${sc.border} transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
          <span className="text-sm font-medium text-foreground">{t.tariff_name}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Кол-во авто */}
          <div className="flex items-center gap-1 surface-2 rounded px-2 py-0.5">
            <Icon name="Car" fallback="Circle" size={11} className="text-muted-foreground" />
            <span className="text-xs font-mono font-semibold text-foreground">{t.cars_in_queue}</span>
            <span className="text-xs text-muted-foreground">авто</span>
          </div>
          {/* Время ожидания */}
          <div className="flex items-center gap-1 surface-2 rounded px-2 py-0.5">
            <Icon name="Clock" fallback="Circle" size={11} className="text-muted-foreground" />
            <span className={`text-xs font-mono font-semibold ${sc.text}`}>{t.wait_order_min} мин</span>
          </div>
        </div>
      </div>
      {/* Полоска очереди */}
      <CarBar count={t.cars_in_queue} maxCount={maxCars} color={t.color} />
      <div className={`text-xs mt-1.5 ${sc.text}`}>{t.status_label}</div>
    </div>
  );
}

interface Props {
  compact?: boolean;  // режим для боковой панели
}

export default function AirportQueueWidget({ compact = false }: Props) {
  const [queue, setQueue] = useState<AirportQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [tick, setTick] = useState(0);  // для таймера до следующего рейса

  const load = useCallback(async () => {
    try {
      const d = await fetchAirportData();
      setQueue(d.airport_queue);
      setLastUpdate(d.airport_queue.updated_at);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);   // обновление каждые 30 сек
    return () => clearInterval(interval);
  }, [load]);

  // Тикаем каждую секунду для "живого" таймера
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const maxCars = queue ? Math.max(...queue.by_tariff.map(t => t.cars_in_queue), 1) : 1;
  const demandColors = { low: "text-green-400", medium: "text-amber-400", high: "text-red-400" };

  if (loading) {
    return (
      <div className="surface-1 rounded-xl border border-subtle p-4 flex items-center justify-center gap-2 min-h-32">
        <Icon name="RefreshCw" fallback="Circle" size={14} className="animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Загрузка очереди...</span>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="surface-1 rounded-xl border border-subtle p-4 text-center">
        <span className="text-sm text-muted-foreground">Нет данных</span>
      </div>
    );
  }

  const nextFlight = queue.next_flight;
  const arrivesIn = nextFlight ? Math.max(0, nextFlight.arrives_in_min - Math.floor(tick / 60)) : null;

  if (compact) {
    // Компактный режим для боковых панелей
    return (
      <div className="surface-1 rounded-xl border border-subtle p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name="Users" fallback="Circle" size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-foreground">Очередь AER</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">{lastUpdate}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-2xl font-mono font-bold text-foreground">{queue.total_cars}</span>
          <span className="text-xs text-muted-foreground">авто в очереди</span>
        </div>
        <div className="space-y-1.5">
          {queue.by_tariff.map(t => {
            const sc = statusColors[t.queue_status] ?? statusColors.normal;
            return (
              <div key={t.tariff_id} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                  <span className="text-xs text-muted-foreground truncate">{t.tariff_name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-foreground">{t.cars_in_queue} авто</span>
                  <span className={`text-xs font-mono font-semibold ${sc.text}`}>{t.wait_order_min} мин</span>
                </div>
              </div>
            );
          })}
        </div>
        {nextFlight && arrivesIn !== null && (
          <div className="mt-2.5 pt-2.5 border-t border-subtle">
            <div className="flex items-center gap-1.5">
              <Icon name="Plane" fallback="Circle" size={11} className="text-blue-400" />
              <span className="text-xs text-muted-foreground">{nextFlight.flight} через</span>
              <span className="text-xs font-mono font-bold text-blue-400">{arrivesIn} мин</span>
              <span className="text-xs text-muted-foreground">· {nextFlight.passengers} пасс.</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Полный режим
  return (
    <div className="surface-1 rounded-xl border border-subtle overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-subtle flex items-center justify-between surface-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Icon name="ParkingCircle" fallback="Circle" size={16} className="text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Очередь у аэропорта</div>
            <div className="text-xs text-muted-foreground">{queue.location}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs ${demandColors[queue.demand_level]}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${queue.demand_level === "high" ? "bg-red-500" : queue.demand_level === "medium" ? "bg-amber-500" : "bg-green-500"} animate-pulse`} />
            {queue.demand_level === "high" ? "Высокий спрос" : queue.demand_level === "medium" ? "Средний спрос" : "Низкий спрос"}
          </div>
          <button onClick={load} className="p-1.5 rounded surface-2 border border-subtle hover:border-blue-500/30 transition-colors">
            <Icon name="RefreshCw" fallback="Circle" size={12} className="text-muted-foreground" />
          </button>
          <span className="text-xs font-mono text-muted-foreground">{lastUpdate}</span>
        </div>
      </div>

      {/* Top summary */}
      <div className="px-4 py-3 grid grid-cols-3 gap-4 border-b border-subtle">
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-foreground">{queue.total_cars}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Всего авто</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-foreground">{queue.upcoming_pax}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Пасс. на подходе</div>
        </div>
        <div className="text-center">
          {nextFlight && arrivesIn !== null ? (
            <>
              <div className="text-2xl font-mono font-bold text-blue-400">{arrivesIn} мин</div>
              <div className="text-xs text-muted-foreground mt-0.5">До рейса {nextFlight.flight}</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-mono font-bold text-muted-foreground">—</div>
              <div className="text-xs text-muted-foreground mt-0.5">Ближайший рейс</div>
            </>
          )}
        </div>
      </div>

      {/* Next flight banner */}
      {nextFlight && arrivesIn !== null && arrivesIn <= 45 && (
        <div className="px-4 py-2.5 bg-blue-500/8 border-b border-blue-500/15 flex items-center gap-3">
          <Icon name="Plane" fallback="Circle" size={14} className="text-blue-400 shrink-0" />
          <div className="flex-1 text-xs text-foreground">
            <span className="font-semibold">{nextFlight.flight}</span>
            <span className="text-muted-foreground"> · {nextFlight.airline} · {nextFlight.passengers} пасс. · Терм. {nextFlight.terminal}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-blue-400">+{arrivesIn} мин</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-4 text-xs text-muted-foreground">
        {Object.entries(statusColors).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="hidden lg:inline">{
              key === "overloaded" ? "Много авто" :
              key === "normal"     ? "Норма" :
              key === "low"        ? "Мало авто" :
                                     "Дефицит"
            }</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <Icon name="Clock" fallback="Circle" size={11} />
          <span>— время ожидания заказа</span>
        </div>
      </div>

      {/* Tariff rows */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {queue.by_tariff.map(t => (
          <TariffRow key={t.tariff_id} t={t} maxCars={maxCars} />
        ))}
      </div>
    </div>
  );
}
