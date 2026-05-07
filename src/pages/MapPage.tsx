import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

const zones = [
  { id: 1, name: "Центральный район", x: 38, y: 30, coeff: 2.4, demand: "hot", rides: 142 },
  { id: 2, name: "Аэропорт", x: 68, y: 55, coeff: 3.1, demand: "hot", rides: 89 },
  { id: 3, name: "Красная Поляна", x: 75, y: 20, coeff: 1.8, demand: "warm", rides: 56 },
  { id: 4, name: "Хоста", x: 22, y: 62, coeff: 1.2, demand: "cool", rides: 34 },
  { id: 5, name: "Адлер", x: 62, y: 72, coeff: 2.0, demand: "warm", rides: 78 },
  { id: 6, name: "Лазаревское", x: 12, y: 28, coeff: 1.1, demand: "cool", rides: 21 },
];

const demandLabel: Record<string, string> = {
  hot: "Высокий",
  warm: "Средний",
  cool: "Низкий",
};

const demandColor: Record<string, string> = {
  hot: "text-accent-red",
  warm: "text-accent-amber",
  cool: "text-accent-blue",
};

const dotColor: Record<string, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  cool: "bg-blue-500",
};

export default function MapPage() {
  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Карта города</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Зоны спроса и коэффициенты · Сочи</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">Обновлено 2 мин назад</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Map */}
        <div className="lg:col-span-2 surface-1 rounded-lg border border-subtle overflow-hidden relative" style={{ minHeight: 420 }}>
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--accent-blue) / 0.3) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--accent-blue) / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
          {/* Simulated coastline */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M0 200 Q50 180 100 190 Q150 200 200 185 Q250 170 300 180 Q350 190 400 175 L400 300 L0 300 Z"
              fill="hsl(var(--accent-blue))" opacity="0.3" />
            <path d="M0 210 Q80 195 160 200 Q240 205 320 195 Q360 190 400 185 L400 300 L0 300 Z"
              fill="hsl(var(--accent-blue))" opacity="0.4" />
          </svg>

          <div className="absolute top-3 left-3 text-xs font-mono text-muted-foreground surface-2 px-2 py-1 rounded border border-subtle">
            43.5855° с.ш. 39.7231° в.д.
          </div>

          {zones.map((zone) => (
            <div
              key={zone.id}
              className="absolute group cursor-pointer"
              style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`w-3 h-3 rounded-full ${dotColor[zone.demand]} ring-4 ring-current ring-opacity-20 group-hover:ring-opacity-40 transition-all`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="surface-3 border border-subtle rounded px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                  <div className="font-semibold text-foreground">{zone.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-accent-amber font-mono font-semibold">×{zone.coeff}</span>
                    <span className={`${demandColor[zone.demand]}`}>{demandLabel[zone.demand]}</span>
                    <span className="text-muted-foreground">{zone.rides} заказов</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Coefficient badges */}
          {zones.filter(z => z.demand === 'hot').map(zone => (
            <div key={`coeff-${zone.id}`} className="absolute pointer-events-none"
              style={{ left: `${zone.x + 2}%`, top: `${zone.y - 4}%` }}>
              <span className="text-xs font-mono font-bold text-accent-amber surface-2 px-1.5 py-0.5 rounded border border-amber-500/30">
                ×{zone.coeff}
              </span>
            </div>
          ))}

          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
            {[
              { color: "bg-red-500", label: "Высокий спрос" },
              { color: "bg-amber-500", label: "Средний спрос" },
              { color: "bg-blue-500", label: "Низкий спрос" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 surface-2 px-2 py-1 rounded border border-subtle">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zones list */}
        <div className="flex flex-col gap-2">
          <div className="surface-1 rounded-lg border border-subtle p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Зоны спроса</div>
            <div className="space-y-2">
              {zones.sort((a, b) => b.coeff - a.coeff).map((zone, i) => (
                <div key={zone.id} className="flex items-center justify-between p-2.5 surface-2 rounded border border-subtle hover:border-blue-500/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-muted-foreground font-mono w-4">{String(i + 1).padStart(2, '0')}</span>
                    <div className={`w-2 h-2 rounded-full ${dotColor[zone.demand]}`} />
                    <span className="text-sm text-foreground group-hover:text-white transition-colors">{zone.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{zone.rides}</span>
                    <Badge className="text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
                      ×{zone.coeff}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-1 rounded-lg border border-subtle p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Статистика</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Активных зон", value: "6", icon: "MapPin" },
                { label: "Макс. коэфф.", value: "×3.1", icon: "TrendingUp" },
                { label: "Заказов сейчас", value: "420", icon: "Navigation" },
                { label: "Водителей", value: "87", icon: "Users" },
              ].map(stat => (
                <div key={stat.label} className="surface-2 rounded border border-subtle p-2.5">
                  <Icon name={stat.icon} fallback="Circle" size={14} className="text-muted-foreground mb-1" />
                  <div className="text-lg font-semibold font-mono text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}