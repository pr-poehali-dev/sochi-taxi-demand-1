import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";
import { fetchAirportData, type DemandZone, type AirportData } from "@/lib/api";
import AirportQueueWidget from "@/components/AirportQueueWidget";

declare global {
  interface Window {
    ymaps: {
      ready: (cb: () => void) => void;
      Map: new (el: HTMLElement, opts: object) => YMap;
      Circle: new (center: number[], radius: number, opts: object) => YCircle;
      Placemark: new (center: number[], props: object, opts: object) => YMark;
      route: (points: object[], opts: object) => Promise<object>;
    };
  }
  interface YMap { geoObjects: { add: (obj: object) => void; removeAll: () => void }; setCenter: (c: number[], z: number) => void; }
  interface YCircle { events: { add: (ev: string, cb: () => void) => void }; }
  interface YMark { events: { add: (ev: string, cb: () => void) => void }; }
}

const YMAPS_KEY = "ваш_ключ";

const levelConfig = {
  low:      { color: "#22C55E", label: "Низкий",         bg: "bg-green-500/15",  border: "border-green-500/30",  text: "text-green-400" },
  medium:   { color: "#F59E0B", label: "Средний",        bg: "bg-amber-500/15",  border: "border-amber-500/30",  text: "text-amber-400" },
  high:     { color: "#F97316", label: "Высокий",        bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-400" },
  critical: { color: "#EF4444", label: "Очень высокий",  bg: "bg-red-500/15",    border: "border-red-500/30",    text: "text-red-400" },
};

const xPos: Record<string, number> = { airport: 68, center: 38, adler: 62, krasnaya: 75, hosta: 25, lazarev: 12 };
const yPos: Record<string, number> = { airport: 55, center: 30, adler: 72, krasnaya: 20, hosta: 62, lazarev: 28 };

export default function MapPage() {
  const [data, setData] = useState<AirportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DemandZone | null>(null);
  const [minSurge, setMinSurge] = useState([1.0]);
  const [lastUpdate, setLastUpdate] = useState("");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const ymapsLoaded = useRef(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchAirportData();
      setData(d);
      setLastUpdate(d.updated_at);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Load Yandex Maps
  useEffect(() => {
    if (ymapsLoaded.current) return;
    ymapsLoaded.current = true;
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YMAPS_KEY}&lang=ru_RU`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const zones = data?.demand_zones ?? [];
  const filtered = zones.filter(z => z.surge >= minSurge[0]);

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Карта города</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Зоны спроса и коэффициенты · Сочи</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs surface-2 border border-subtle px-3 py-1.5 rounded hover:border-blue-500/40 transition-colors"
          >
            <Icon name="RefreshCw" fallback="Circle" size={12} className={loading ? "animate-spin text-blue-400" : "text-muted-foreground"} />
            <span className="text-muted-foreground">Обновить</span>
          </button>
          {lastUpdate && (
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {lastUpdate}
            </span>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="surface-1 rounded-lg border border-subtle px-4 py-3 flex items-center gap-4">
        <span className="text-xs text-muted-foreground shrink-0">Мин. коэфф.:</span>
        <div className="flex-1 max-w-xs">
          <Slider
            min={1.0} max={4.0} step={0.1}
            value={minSurge}
            onValueChange={setMinSurge}
            className="w-full"
          />
        </div>
        <span className="text-sm font-mono font-semibold text-foreground shrink-0 w-8">×{minSurge[0].toFixed(1)}</span>
        <div className="flex items-center gap-3 ml-2">
          {Object.entries(levelConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
              <span className="text-xs text-muted-foreground hidden lg:inline">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Map visual */}
        <div className="lg:col-span-2 surface-1 rounded-lg border border-subtle overflow-hidden relative" style={{ minHeight: 400 }}>
          <div ref={mapContainerRef} className="absolute inset-0 z-0" />

          {/* Fallback decorative map */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(hsl(214 84% 56% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(214 84% 56% / 0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M0 200 Q50 180 100 190 Q150 200 200 185 Q250 170 300 180 Q350 190 400 175 L400 300 L0 300 Z" fill="hsl(214 84% 56%)" opacity="0.3" />
            <path d="M0 215 Q80 198 160 203 Q240 208 320 198 L400 193 L400 300 L0 300 Z" fill="hsl(214 84% 56%)" opacity="0.4" />
          </svg>

          <div className="absolute top-3 left-3 text-xs font-mono text-muted-foreground surface-2 px-2 py-1 rounded border border-subtle z-10">
            43.5855° с.ш. 39.7231° в.д.
          </div>

          {/* Zone circles on pseudo-map */}
          {filtered.map((zone) => {
            const cfg = levelConfig[zone.level];
            const x = xPos[zone.id] ?? 50;
            const y = yPos[zone.id] ?? 50;
            const isSelected = selected?.id === zone.id;
            return (
              <div
                key={zone.id}
                className="absolute cursor-pointer z-10"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                onClick={() => setSelected(isSelected ? null : zone)}
              >
                {/* Radius ring */}
                <div
                  className="absolute rounded-full border-2 opacity-30 transition-all"
                  style={{
                    width: zone.radius / 25,
                    height: zone.radius / 25,
                    borderColor: cfg.color,
                    background: cfg.color + "18",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                {/* Dot */}
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all ${isSelected ? "scale-150" : "hover:scale-125"}`}
                  style={{ background: cfg.color, borderColor: "#fff", boxShadow: `0 0 12px ${cfg.color}60` }}
                />
                {/* Coeff badge */}
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                  style={{ background: cfg.color + "25", color: cfg.color, border: `1px solid ${cfg.color}40` }}
                >
                  ×{zone.surge}
                </div>
              </div>
            );
          })}

          {/* Zone popup */}
          {selected && (
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 surface-3 rounded-lg border border-blue-500/30 p-4 z-20 animate-fade-in shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-foreground">{selected.name}</div>
                  <div className={`text-xs mt-0.5 ${levelConfig[selected.level].text}`}>{levelConfig[selected.level].label} спрос</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1">
                  <Icon name="X" fallback="Circle" size={14} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="surface-2 rounded p-2 text-center">
                  <div className="text-lg font-mono font-bold text-foreground">×{selected.surge}</div>
                  <div className="text-xs text-muted-foreground">Коэфф.</div>
                </div>
                <div className="surface-2 rounded p-2 text-center">
                  <div className="text-lg font-mono font-bold text-foreground">{selected.wait_min} мин</div>
                  <div className="text-xs text-muted-foreground">Ожидание</div>
                </div>
                <div className="surface-2 rounded p-2 text-center">
                  <div className="text-lg font-mono font-bold text-foreground">{selected.forecast_min} мин</div>
                  <div className="text-xs text-muted-foreground">Длит. пика</div>
                </div>
              </div>

              {/* Tariffs */}
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-2">Коэффициенты по тарифам:</div>
                <div className="grid grid-cols-2 gap-1">
                  {selected.tariff_demand?.map(t => (
                    <div key={t.tariff_id} className="flex items-center justify-between surface-2 rounded px-2 py-1">
                      <span className="text-xs text-muted-foreground">{t.tariff_name}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: t.color }}>×{t.coeff}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Icon name="Navigation" fallback="Circle" size={14} />
                Построить маршрут
              </button>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-30">
              <div className="flex items-center gap-2 surface-2 px-4 py-2 rounded-lg border border-subtle">
                <Icon name="RefreshCw" fallback="Circle" size={14} className="animate-spin text-blue-400" />
                <span className="text-sm text-muted-foreground">Загрузка...</span>
              </div>
            </div>
          )}
        </div>

        {/* Zones list */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="surface-1 rounded-lg border border-subtle p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">
              Зоны спроса <span className="text-foreground font-mono">({filtered.length})</span>
            </div>
            <div className="space-y-2">
              {filtered.sort((a, b) => b.surge - a.surge).map((zone) => {
                const cfg = levelConfig[zone.level];
                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelected(selected?.id === zone.id ? null : zone)}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      selected?.id === zone.id
                        ? "border-blue-500/40 surface-3"
                        : "border-subtle surface-2 hover:border-blue-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                        <span className="text-sm font-medium text-foreground">{zone.name}</span>
                      </div>
                      <Badge className={`text-xs font-mono font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                        ×{zone.surge}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>⏱ {zone.wait_min} мин</span>
                      <span>📍 r={zone.radius}м</span>
                    </div>
                    {/* Top-3 tariffs inline */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {zone.tariff_demand?.slice(0, 4).map(t => (
                        <span
                          key={t.tariff_id}
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ background: t.color + "18", color: t.color, border: `1px solid ${t.color}30` }}
                        >
                          {t.tariff_name} ×{t.coeff}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Нет зон с коэфф. ≥ ×{minSurge[0].toFixed(1)}
                </div>
              )}
            </div>
          </div>

          {/* Airport queue widget */}
          <AirportQueueWidget compact />
        </div>
      </div>
    </div>
  );
}