import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  status: "online",
  tariff: "Комфорт",
  workZone: "Сочи, Адлер, Аэропорт",
};

const notifPrefs = [
  { id: "n1", label: "Push о высоком спросе", enabled: true },
  { id: "n2", label: "SMS при коэфф. ≥ 4.0", enabled: true },
  { id: "n3", label: "Уведомления о рейсах аэропорта", enabled: true },
  { id: "n4", label: "Прогнозы за 45 мин до пика", enabled: true },
  { id: "n5", label: "Ежедневная сводка доходов", enabled: false },
  { id: "n6", label: "Новости и обновления платформы", enabled: false },
];

const workPrefs = [
  { id: "w1", label: "Автоприём заказов из аэропорта", enabled: true },
  { id: "w2", label: "Показывать зоны повышенного спроса", enabled: true },
  { id: "w3", label: "Навигация через Яндекс.Карты", enabled: true },
  { id: "w4", label: "Ночной режим (22:00–07:00)", enabled: false },
];

export default function ProfilePage() {
  const [prefs, setPrefs] = useState(notifPrefs);
  const [work, setWork] = useState(workPrefs);
  const [editing, setEditing] = useState(false);

  const toggle = (
    list: typeof notifPrefs,
    setList: React.Dispatch<React.SetStateAction<typeof notifPrefs>>,
    id: string
  ) => {
    setList(list.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Профиль водителя</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Личные данные и настройки уведомлений</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(!editing)}
          className="border-subtle text-foreground hover:bg-white/5"
        >
          <Icon name={editing ? "Check" : "Edit2"} fallback="Circle" size={14} className="mr-1.5" />
          {editing ? "Сохранить" : "Редактировать"}
        </Button>
      </div>

      {/* Driver card */}
      <div className="surface-1 rounded-lg border border-subtle p-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <span className="text-xl font-semibold text-blue-400 font-mono">{driverData.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-foreground">{driverData.name}</h2>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${driverData.status === "online" ? "bg-green-500" : "bg-gray-500"}`} />
                <span className="text-xs text-muted-foreground">{driverData.status === "online" ? "Онлайн" : "Офлайн"}</span>
              </div>
              <span className="text-xs surface-2 px-2 py-0.5 rounded border border-subtle text-foreground font-mono">{driverData.tariff}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{driverData.car} · {driverData.plate}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Зона работы: {driverData.workZone}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <Icon name="Star" fallback="Circle" size={14} className="text-amber-400" />
              <span className="text-xl font-mono font-semibold text-foreground">{driverData.rating}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Рейтинг</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-subtle">
          {[
            { label: "Поездок всего", value: driverData.totalRides.toLocaleString("ru") },
            { label: "Выручка всего", value: `${driverData.totalEarnings} ₽` },
            { label: "На платформе с", value: driverData.registeredAt },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-mono font-semibold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal data */}
      <div className="surface-1 rounded-lg border border-subtle p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Личные данные</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "ФИО", value: driverData.name, icon: "User" },
            { label: "Телефон", value: driverData.phone, icon: "Phone" },
            { label: "Автомобиль", value: driverData.car, icon: "Car" },
            { label: "Гос. номер", value: driverData.plate, icon: "Hash" },
          ].map(field => (
            <div key={field.label}>
              <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Icon name={field.icon} fallback="Circle" size={12} />
                {field.label}
              </label>
              {editing ? (
                <Input
                  defaultValue={field.value}
                  className="bg-transparent border-subtle text-foreground text-sm h-9"
                />
              ) : (
                <div className="text-sm text-foreground surface-2 px-3 py-2 rounded border border-subtle">{field.value}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notification settings */}
        <div className="surface-1 rounded-lg border border-subtle p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
            <Icon name="Bell" fallback="Circle" size={12} />
            Уведомления
          </div>
          <div className="space-y-3">
            {prefs.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{p.label}</span>
                <Switch
                  checked={p.enabled}
                  onCheckedChange={() => toggle(prefs, setPrefs, p.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Work settings */}
        <div className="surface-1 rounded-lg border border-subtle p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
            <Icon name="Settings" fallback="Circle" size={12} />
            Настройки работы
          </div>
          <div className="space-y-3">
            {work.map(w => (
              <div key={w.id} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{w.label}</span>
                <Switch
                  checked={w.enabled}
                  onCheckedChange={() => toggle(work, setWork, w.id)}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-subtle">
            <div className="text-xs text-muted-foreground mb-2">Минимальный коэфф. для уведомлений</div>
            <div className="flex items-center gap-3">
              {[1.5, 2.0, 2.5, 3.0, 4.0].map(v => (
                <button
                  key={v}
                  className={`text-xs font-mono px-2.5 py-1 rounded border transition-all ${
                    v === 2.5
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-subtle text-muted-foreground hover:text-foreground hover:border-blue-500/30"
                  }`}
                >
                  ×{v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
