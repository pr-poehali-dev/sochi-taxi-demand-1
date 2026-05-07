import { useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import type { QueueTariff } from "@/lib/api";

export const DRIVER_TARIFF_KEY = "driver_tariff_ids";

export function getDriverTariffs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DRIVER_TARIFF_KEY) || "[]");
  } catch {
    return [];
  }
}

export function setDriverTariffs(ids: string[]) {
  localStorage.setItem(DRIVER_TARIFF_KEY, JSON.stringify(ids));
}

async function requestPushPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function sendBrowserPush(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "tariff-alert",
      requireInteraction: true,
    });
  } catch {
    /* ignore */
  }
}

export function useTariffAlerts(tariffs: QueueTariff[] | undefined) {
  const prevStatusRef = useRef<Record<string, QueueTariff["queue_status"]>>({});
  const permissionRequestedRef = useRef(false);

  const requestPermission = useCallback(async () => {
    if (permissionRequestedRef.current) return;
    permissionRequestedRef.current = true;
    await requestPushPermission();
  }, []);

  useEffect(() => {
    if (!tariffs || tariffs.length === 0) return;

    const driverTariffs = getDriverTariffs();

    tariffs.forEach((t) => {
      const prevStatus = prevStatusRef.current[t.tariff_id];
      const currStatus = t.queue_status;

      if (!prevStatus) {
        prevStatusRef.current[t.tariff_id] = currStatus;
        return;
      }

      const isDriver =
        driverTariffs.length === 0 || driverTariffs.includes(t.tariff_id);
      const wasOverloaded = prevStatus === "overloaded";
      const isNowDeficit = currStatus === "low" || currStatus === "critical";

      if (wasOverloaded && isNowDeficit && isDriver) {
        const title = `🚗 Едем! Тариф «${t.tariff_name}»`;
        const body =
          currStatus === "critical"
            ? `Заказы поступают быстро — очередь минимальная. Ждать ~${t.wait_order_min} мин.`
            : `Очередь спала — мало машин. Время ехать! Ждать ~${t.wait_order_min} мин.`;

        sendBrowserPush(title, body);
        toast({ title, description: body, duration: 8000 });
      }

      prevStatusRef.current[t.tariff_id] = currStatus;
    });
  }, [tariffs]);

  return { requestPermission };
}