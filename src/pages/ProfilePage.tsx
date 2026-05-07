import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchAirportData, type Tariff } from "@/lib/api";
import { DRIVER_TARIFF_KEY } from "@/hooks/use-tariff-alerts";

const driverData = {
  name: "Алексей Соколов",
  phone: "+7 (918) 452-87-31",
  car: "Toyota Camry, 2022",
  plate: "А 482 КМ 123",
  rating: 4.87,
  totalRides: 2015,
  totalEarnings: "412 500",
  registeredAt: "Март 2023",
  avatar: "АС",
  yearsInYandex: "2 года 3 мес.",
};

const faq = [
  { q: "Как работают коэффициенты спроса?", a: "Коэффициент отражает соотношение спроса и предложения в зоне. ×2.0 означает удвоенную стоимость поездки." },
  { q: "Откуда берутся прогнозы?", a: "Система анализирует расписание рейсов аэропорта AER, исторические данные и события города." },
  { q: "Когда приходят SMS?", a: "SMS отправляется только при критическом коэффициенте (≥4.5) или при выборе режима Push+SMS в настройках." },
  { q: "Как обновляются данные?", a: "Карта и табло обновляются автоматически каждые 60 секунд. Можно обновить вручную кнопкой." },
];

const notifPrefs = [
  { id: "n1", label: "Push о высоком спросе (≥×3)", enabled: true },
  { id: "n2", label: "SMS при критич. спросе (≥×4.5)", enabled: true },
  { id: "n3", label: "Уведомления о рейсах аэропорта", enabled: true },
  { id: "n4", label: "Прогнозы за 45 мин до пика", enabled: true },
  { id: "n5", label: "Ежедневная сводка доходов", enabled: false },
];

export default function ProfilePage() {
  const [status, setStatus] = useState<"online" | "break">("online");
  const [prefs, setPrefs] = useState(notifPrefs);
  const [editing, setEditing] = useState(false);
  const [geoAccuracy, setGeoAccuracy] = useState<"high" | "eco">("high");
  const [mapInterval, setMapInterval] = useState(60);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [smsPhone, setSmsPhone] = useState("+7 (918) 452-87-31");
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<string | null>(
    localStorage.getItem(DRIVER_TARIFF_KEY)
  );

  useEffect(() => {
    fetchAirportData().then(d => setTariffs(d.tariffs)).catch(() => {});
  }, []);

  const handleSelectTariff = (id: string | null) => {
    setSelectedTariff(id);
    if (id) localStorage.setItem(DRIVER_TARIFF_KEY, id);
    else localStorage.removeItem(DRIVER_TARIFF_KEY);
  };

  const toggle = (id: string) => {
    setPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in overflow-y-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Профиль водителя</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Личные данные и настройки</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} className="border-subtle text-foreground hover:bg-white/5">
          <Icon name={editing ? "Check" : "Edit2"} fallback="Circle" size={14} className="mr-1.5" />
          {editing ? "Сохранить" : "Редактировать"}
        </Button>
      </div>

      {/* Driver card */}
      <div className="surface-1 rounded-lg border border-subtle p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <span className="text-xl font-semibold text-blue-400">{driverData.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-foreground">{driverData.name}</h2>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
                <span className={`text-xs ${status === "online" ? "text-green-400" : "text-amber-400"}`}>
                  {status === "online" ? "На линии" : "Перерыв"}
                </span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{driverData.car} · {driverData.plate}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Яндекс Такси · Стаж {driverData.yearsInYandex}
            </div>
            {/* Status toggle */}
            <div className="flex gap-2 mt-3">
              {(["online", "break"] as const).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded border transition-all ${status === s ? (s === "online" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-amber-500/15 border-amber-500/30 text-amber-400") : "border-subtle text-muted-foreground hover:text-foreground"}`}
                >
                  {s === "online" ? "На линии" : "Перерыв"}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Icon name="Star" fallback="Circle" size={14} className="text-amber-400" />
              <span className="text-xl font-mono font-semibold text-foreground">{driverData.rating}</span>
            </div>
            <div className="text-xs text-muted-foreground">Рейтинг</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-subtle">
          {[
            { label: "Поездок всего",   value: driverData.totalRides.toLocaleString("ru") },
            { label: "Выручка всего",   value: `${driverData.totalEarnings} ₽` },
            { label: "На платформе с",  value: driverData.registeredAt },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-mono font-semibold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal data */}
        <div className="surface-1 rounded-lg border border-subtle p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Аккаунт</div>
          <div className="space-y-3">
            {[
              { label: "ФИО",          value: driverData.name,  icon: "User" },
              { label: "Телефон",      value: driverData.phone, icon: "Phone" },
              { label: "Автомобиль",   value: driverData.car,   icon: "Car" },
              { label: "Гос. номер",   value: driverData.plate, icon: "Hash" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Icon name={f.icon} fallback="Circle" size={11} /> {f.label}
                </label>
                {editing ? (
                  <Input defaultValue={f.value} className="bg-transparent border-subtle text-foreground text-sm h-9" />
                ) : (
                  <div className="text-sm text-foreground surface-2 px-3 py-2 rounded border border-subtle">{f.value}</div>
                )}
              </div>
            ))}
            <div>
              <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Icon name="MessageSquare" fallback="Circle" size={11} /> Телефон для SMS
              </label>
              <div className="flex gap-2">
                <Input value={smsPhone} onChange={e => setSmsPhone(e.target.value)}
                  className="bg-transparent border-subtle text-foreground text-sm h-9 flex-1" />
                <button className="text-xs px-3 py-1.5 rounded border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors shrink-0">
                  Верифицировать
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification settings */}
        <div className="surface-1 rounded-lg border border-subtle p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-1.5">
            <Icon name="Bell" fallback="Circle" size={11} /> Уведомления
          </div>
          <div className="space-y-3">
            {prefs.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{p.label}</span>
                <Switch checked={p.enabled} onCheckedChange={() => toggle(p.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tariff profile */}
      <div className="surface-1 rounded-lg border border-subtle p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium flex items-center gap-1.5">
          <Icon name="Tag" fallback="Circle" size={11} /> Мой тариф
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Выберите тариф, на котором вы работаете — push-уведомление «Пора ехать» придёт только по нему.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSelectTariff(null)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded border transition-all ${!selectedTariff ? "bg-blue-600 text-white border-blue-600" : "border-subtle text-muted-foreground hover:text-foreground"}`}
          >
            Все тарифы
          </button>
          {tariffs.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelectTariff(t.id)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded border transition-all ${selectedTariff === t.id ? "border-opacity-80 text-white" : "border-subtle text-muted-foreground hover:text-foreground"}`}
              style={selectedTariff === t.id ? { background: t.color, borderColor: t.color } : {}}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
              {t.name}
            </button>
          ))}
        </div>
        {selectedTariff && tariffs.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
            <Icon name="BellRing" fallback="Circle" size={12} />
            Уведомления настроены на тариф «{tariffs.find(t => t.id === selectedTariff)?.name}»
          </div>
        )}
        {!selectedTariff && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Bell" fallback="Circle" size={12} />
            Уведомления придут по всем тарифам
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Technical settings */}
        <div className="surface-1 rounded-lg border border-subtle p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-1.5">
            <Icon name="Settings" fallback="Circle" size={11} /> Технические настройки
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">Точность геолокации</div>
              <div className="flex gap-2">
                {([["high", "Высокая"], ["eco", "Экономичная"]] as const).map(([v, label]) => (
                  <button key={v} onClick={() => setGeoAccuracy(v)}
                    className={`flex-1 text-sm py-1.5 rounded border transition-all ${geoAccuracy === v ? "bg-blue-600 text-white border-blue-600" : "border-subtle text-muted-foreground hover:text-foreground"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Автообновление карты</div>
              <div className="flex gap-2">
                {[30, 60, 120, 300].map(v => (
                  <button key={v} onClick={() => setMapInterval(v)}
                    className={`flex-1 text-xs py-1.5 rounded border transition-all ${mapInterval === v ? "bg-blue-600 text-white border-blue-600" : "border-subtle text-muted-foreground hover:text-foreground"}`}
                  >
                    {v < 60 ? `${v}с` : `${v / 60}м`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Язык интерфейса</div>
              <div className="flex gap-2">
                {["Русский", "English"].map(lang => (
                  <button key={lang} onClick={() => {}}
                    className={`flex-1 text-sm py-1.5 rounded border transition-all ${lang === "Русский" ? "bg-blue-600 text-white border-blue-600" : "border-subtle text-muted-foreground hover:text-foreground"}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Help & FAQ */}
        <div className="surface-1 rounded-lg border border-subtle p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-1.5">
            <Icon name="HelpCircle" fallback="Circle" size={11} /> Помощь и поддержка
          </div>
          <div className="space-y-2 mb-4">
            {faq.map((item, i) => (
              <div key={i} className="surface-2 rounded border border-subtle overflow-hidden">
                <button
                  className="w-full text-left px-3 py-2.5 text-sm text-foreground flex items-center justify-between gap-2"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <Icon name={openFaq === i ? "ChevronUp" : "ChevronDown"} fallback="Circle" size={14} className="text-muted-foreground shrink-0" />
                </button>
                {openFaq === i && (
                  <div className="px-3 pb-3 text-xs text-muted-foreground border-t border-subtle pt-2">{item.a}</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded border border-subtle text-sm text-muted-foreground hover:text-foreground hover:border-blue-500/25 transition-colors surface-2">
              <Icon name="MessageCircle" fallback="Circle" size={14} className="text-blue-400" />
              Связь с техподдержкой Яндекс Такси
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded border border-subtle text-sm text-muted-foreground hover:text-foreground hover:border-red-500/25 transition-colors surface-2">
              <Icon name="Flag" fallback="Circle" size={14} className="text-red-400" />
              Сообщить об ошибке
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}