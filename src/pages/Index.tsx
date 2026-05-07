import { useState } from "react";
import Icon from "@/components/ui/icon";
import MapPage from "./MapPage";
import FlightBoard from "./FlightBoard";
import ForecastPage from "./ForecastPage";
import NotificationsPage from "./NotificationsPage";
import AnalyticsPage from "./AnalyticsPage";
import ProfilePage from "./ProfilePage";

const navItems = [
  { id: "map",           label: "Карта",         icon: "MapPin",        badge: null },
  { id: "flights",       label: "Рейсы",          icon: "PlaneLanding",  badge: "8" },
  { id: "forecast",      label: "Прогноз",        icon: "TrendingUp",    badge: null },
  { id: "notifications", label: "Уведомления",    icon: "Bell",          badge: "2" },
  { id: "analytics",     label: "Аналитика",      icon: "BarChart2",     badge: null },
  { id: "profile",       label: "Профиль",        icon: "User",          badge: null },
];

type PageId = typeof navItems[number]["id"];

const pageComponents: Record<PageId, React.ReactNode> = {
  map: <MapPage />,
  flights: <FlightBoard />,
  forecast: <ForecastPage />,
  notifications: <NotificationsPage />,
  analytics: <AnalyticsPage />,
  profile: <ProfilePage />,
};

export default function Index() {
  const [activePage, setActivePage] = useState<PageId>("map");

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background flex flex-col font-ibm">
      {/* Top bar */}
      <header className="surface-1 border-b border-subtle px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Icon name="Navigation" fallback="Circle" size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground tracking-tight">ПИЛОТ</div>
            <div className="text-xs text-muted-foreground">Сочи · Аэропорт AER</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Онлайн</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Icon name="Zap" fallback="Circle" size={12} className="text-amber-400" />
            <span className="text-foreground font-mono">×3.1</span>
            <span className="text-muted-foreground">Аэропорт</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Icon name="Wallet" fallback="Circle" size={12} className="text-green-400" />
            <span className="text-foreground font-mono">4 820 ₽</span>
            <span className="text-muted-foreground">сегодня</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground surface-2 px-2 py-1 rounded border border-subtle">
            {timeStr}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage("notifications")}
            className="relative p-2 rounded surface-2 border border-subtle hover:border-blue-500/30 transition-colors"
          >
            <Icon name="Bell" fallback="Circle" size={16} className="text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-mono">2</span>
          </button>
          <button
            onClick={() => setActivePage("profile")}
            className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center"
          >
            <span className="text-xs font-semibold text-blue-400">АС</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar navigation */}
        <nav className="hidden md:flex flex-col surface-1 border-r border-subtle w-52 shrink-0 py-3">
          <div className="space-y-0.5 px-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all text-left ${
                  activePage === item.id
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon name={item.icon} fallback="Circle" size={16} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${
                    activePage === item.id
                      ? "bg-blue-500/30 text-blue-300"
                      : "bg-white/10 text-muted-foreground"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto px-2 pt-3 border-t border-subtle mx-2">
            <div className="surface-2 rounded-lg border border-subtle p-3">
              <div className="text-xs text-muted-foreground mb-1">Ближайший пик</div>
              <div className="text-sm font-semibold text-foreground">17:00 – 18:00</div>
              <div className="text-xs text-muted-foreground mt-0.5">Аэропорт · ×5.1</div>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs text-amber-400">через 45 мин</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-hidden p-4 md:p-5">
          {pageComponents[activePage]}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden surface-1 border-t border-subtle flex items-center justify-around px-1 py-2 shrink-0">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded transition-all relative ${
              activePage === item.id ? "text-blue-400" : "text-muted-foreground"
            }`}
          >
            <Icon name={item.icon} fallback="Circle" size={20} />
            <span className="text-[10px]">{item.label}</span>
            {item.badge && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
