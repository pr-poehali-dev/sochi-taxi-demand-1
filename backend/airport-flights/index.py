import json
import os
import math
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    """
    Данные аэропорта Сочи (AER): рейсы, зоны спроса, тарифы,
    очередь автомобилей у аэропорта по тарифам с временем ожидания заказа.
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    now = datetime.utcnow()
    # Используем московское время (UTC+3)
    moscow_now = now + timedelta(hours=3)
    hour = moscow_now.hour
    minute = moscow_now.minute

    # Тарифы
    tariffs = [
        {"id": "econom",      "name": "Эконом",       "base_coeff": 1.0, "color": "#6B7280", "icon": "car"},
        {"id": "comfort",     "name": "Комфорт",      "base_coeff": 1.3, "color": "#3B82F6", "icon": "car"},
        {"id": "comfort_plus","name": "Комфорт+",     "base_coeff": 1.6, "color": "#8B5CF6", "icon": "car"},
        {"id": "kids",        "name": "Детский",      "base_coeff": 1.4, "color": "#EC4899", "icon": "car"},
        {"id": "business",    "name": "Бизнес",       "base_coeff": 2.2, "color": "#F59E0B", "icon": "car"},
        {"id": "elite",       "name": "Элит-премьер", "base_coeff": 3.5, "color": "#EF4444", "icon": "car"},
        {"id": "minivan",     "name": "Минивэн",      "base_coeff": 1.8, "color": "#10B981", "icon": "car"},
    ]

    # Рейсы
    flights_arrivals = [
        {"flight": "SU2304", "airline": "Аэрофлот", "origin": "Москва (SVO)",          "scheduled": _time(now, -30), "actual": _time(now, -25), "status": "arrived",  "passengers": 186, "terminal": "A"},
        {"flight": "U68154", "airline": "UTair",     "origin": "Екатеринбург (SVX)",    "scheduled": _time(now, 20),  "actual": _time(now, 25),  "status": "delayed",  "passengers": 120, "terminal": "A"},
        {"flight": "DP841",  "airline": "Победа",    "origin": "Санкт-Петербург (LED)", "scheduled": _time(now, 45),  "actual": _time(now, 45),  "status": "on_time",  "passengers": 189, "terminal": "B"},
        {"flight": "S76321", "airline": "Сибирь",    "origin": "Новосибирск (OVB)",     "scheduled": _time(now, 70),  "actual": _time(now, 85),  "status": "delayed",  "passengers": 140, "terminal": "A"},
        {"flight": "FV6201", "airline": "Россия",    "origin": "Казань (KZN)",          "scheduled": _time(now, 95),  "actual": _time(now, 95),  "status": "on_time",  "passengers": 85,  "terminal": "B"},
        {"flight": "SU1814", "airline": "Аэрофлот", "origin": "Москва (DME)",          "scheduled": _time(now, 110), "actual": _time(now, 110), "status": "on_time",  "passengers": 219, "terminal": "A"},
        {"flight": "PC4512", "airline": "Pegasus",   "origin": "Стамбул (SAW)",         "scheduled": _time(now, 135), "actual": _time(now, 175), "status": "delayed",  "passengers": 174, "terminal": "B"},
        {"flight": "U68962", "airline": "UTair",     "origin": "Тюмень (TJM)",          "scheduled": _time(now, 190), "actual": _time(now, 190), "status": "on_time",  "passengers": 98,  "terminal": "A"},
        {"flight": "SU2506", "airline": "Аэрофлот", "origin": "Москва (SVO)",          "scheduled": _time(now, 240), "actual": _time(now, 240), "status": "on_time",  "passengers": 205, "terminal": "A"},
        {"flight": "UT301",  "airline": "UTair",     "origin": "Уфа (UFA)",             "scheduled": _time(now, 280), "actual": _time(now, 280), "status": "on_time",  "passengers": 110, "terminal": "B"},
    ]

    flights_departures = [
        {"flight": "SU2305", "airline": "Аэрофлот", "dest": "Москва (SVO)",             "scheduled": _time(now, 30),  "actual": _time(now, 30),  "status": "boarding", "gate": "A12", "terminal": "A"},
        {"flight": "DP842",  "airline": "Победа",    "dest": "Санкт-Петербург (LED)",    "scheduled": _time(now, 60),  "actual": _time(now, 60),  "status": "on_time",  "gate": "B07", "terminal": "B"},
        {"flight": "U68155", "airline": "UTair",     "dest": "Екатеринбург (SVX)",       "scheduled": _time(now, 80),  "actual": _time(now, 80),  "status": "on_time",  "gate": "A05", "terminal": "A"},
        {"flight": "S76322", "airline": "Сибирь",    "dest": "Новосибирск (OVB)",        "scheduled": _time(now, 115), "actual": _time(now, 115), "status": "boarding", "gate": "A09", "terminal": "A"},
        {"flight": "SU1815", "airline": "Аэрофлот", "dest": "Москва (DME)",             "scheduled": _time(now, 165), "actual": _time(now, 205), "status": "delayed",  "gate": "B03", "terminal": "B"},
        {"flight": "FV6202", "airline": "Россия",    "dest": "Казань (KZN)",             "scheduled": _time(now, 200), "actual": _time(now, 200), "status": "on_time",  "gate": "A14", "terminal": "A"},
        {"flight": "PC4513", "airline": "Pegasus",   "dest": "Стамбул (SAW)",            "scheduled": _time(now, 250), "actual": _time(now, 250), "status": "on_time",  "gate": "B11", "terminal": "B"},
    ]

    # Рассчитываем спрос по тарифам для рейсов
    for f in flights_arrivals:
        pax = f["passengers"]
        surge_base = _calc_surge(pax)
        f["tariff_demand"] = _calc_tariff_demand(tariffs, surge_base, f["status"])
        f["surge_coeff"] = round(surge_base, 1)

    # Зоны спроса
    demand_zones = [
        {"id": "airport",  "name": "Аэропорт",      "lat": 43.4498, "lon": 39.9498, "radius": 1500, "surge": 3.1, "level": "high",   "wait_min": 3,  "forecast_min": 45},
        {"id": "center",   "name": "Центр города",   "lat": 43.5855, "lon": 39.7231, "radius": 2000, "surge": 2.4, "level": "medium", "wait_min": 6,  "forecast_min": 60},
        {"id": "adler",    "name": "Адлер",          "lat": 43.4468, "lon": 39.9180, "radius": 1800, "surge": 2.0, "level": "medium", "wait_min": 5,  "forecast_min": 30},
        {"id": "krasnaya", "name": "Красная Поляна", "lat": 43.6746, "lon": 40.2011, "radius": 1200, "surge": 1.8, "level": "medium", "wait_min": 8,  "forecast_min": 40},
        {"id": "hosta",    "name": "Хоста",          "lat": 43.5041, "lon": 39.8634, "radius": 1000, "surge": 1.2, "level": "low",    "wait_min": 12, "forecast_min": 20},
        {"id": "lazarev",  "name": "Лазаревское",    "lat": 43.9025, "lon": 39.3390, "radius": 900,  "surge": 1.1, "level": "low",    "wait_min": 15, "forecast_min": 15},
    ]

    for zone in demand_zones:
        zone["tariff_demand"] = _calc_tariff_demand(tariffs, zone["surge"], "on_time")

    # Очередь автомобилей у аэропорта по тарифам
    airport_queue = _calc_airport_queue(tariffs, hour, minute, flights_arrivals)

    result = {
        "arrivals": flights_arrivals,
        "departures": flights_departures,
        "demand_zones": demand_zones,
        "tariffs": tariffs,
        "airport_queue": airport_queue,
        "updated_at": moscow_now.strftime("%H:%M:%S"),
        "airport": "AER",
        "city": "Сочи"
    }

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(result, ensure_ascii=False)
    }


def _time(base: datetime, offset_minutes: int) -> str:
    t = base + timedelta(minutes=offset_minutes)
    # Московское время
    t_moscow = t + timedelta(hours=3)
    return t_moscow.strftime("%H:%M")


def _calc_surge(passengers: int) -> float:
    if passengers >= 200:
        return round(4.5 + (passengers - 200) * 0.01, 1)
    elif passengers >= 150:
        return round(3.0 + (passengers - 150) * 0.03, 1)
    elif passengers >= 100:
        return round(2.0 + (passengers - 100) * 0.02, 1)
    else:
        return round(1.2 + passengers * 0.008, 1)


def _calc_tariff_demand(tariffs: list, surge_base: float, status: str) -> list:
    result = []
    delay_factor = 1.3 if status == "delayed" else 1.0
    for t in tariffs:
        coeff = round(surge_base * t["base_coeff"] * delay_factor, 1)
        coeff = min(coeff, 9.9)
        if coeff >= 3.5:
            level = "critical"
        elif coeff >= 2.5:
            level = "high"
        elif coeff >= 1.5:
            level = "medium"
        else:
            level = "low"
        result.append({
            "tariff_id": t["id"],
            "tariff_name": t["name"],
            "coeff": coeff,
            "level": level,
            "color": t["color"]
        })
    return result


def _calc_airport_queue(tariffs: list, hour: int, minute: int, arrivals: list) -> dict:
    """
    Рассчитывает очередь автомобилей у аэропорта по каждому тарифу.
    Учитывает: время суток, ближайшие рейсы, базовый поток.
    Возвращает для каждого тарифа: кол-во авто в очереди и время ожидания заказа.
    """

    # Базовый коэффициент активности по часам (0-23)
    hour_factor = [
        0.2, 0.1, 0.1, 0.1, 0.2, 0.4,   # 00-05
        0.6, 0.8, 0.9, 0.85, 0.8, 0.9,   # 06-11
        0.95, 0.9, 0.85, 0.9, 1.0, 1.2,  # 12-17
        1.3, 1.1, 0.9, 0.7, 0.5, 0.3     # 18-23
    ]
    base_factor = hour_factor[hour % 24]

    # Считаем пассажирский поток ближайших рейсов (в 60 мин)
    upcoming_pax = sum(
        f["passengers"] for f in arrivals
        if f["status"] not in ("arrived", "cancelled") and f.get("passengers", 0) > 0
        and _minutes_until(f["actual"], hour, minute) <= 60
        and _minutes_until(f["actual"], hour, minute) >= -5
    )

    # Нормализуем пассажиропоток (219 пасс = +0.8 к фактору)
    pax_boost = min(upcoming_pax / 275.0, 1.5)
    total_factor = base_factor + pax_boost

    # Базовые пропорции парка по тарифам (сколько авто в среднем на очереди)
    # и типичная скорость выполнения заказов (авто/мин)
    tariff_params = {
        "econom":       {"base_cars": 28, "throughput": 3.2},  # много авто, быстро разбирают
        "comfort":      {"base_cars": 18, "throughput": 2.1},
        "comfort_plus": {"base_cars": 10, "throughput": 1.4},
        "kids":         {"base_cars": 6,  "throughput": 0.8},
        "business":     {"base_cars": 8,  "throughput": 0.9},
        "elite":        {"base_cars": 3,  "throughput": 0.4},
        "minivan":      {"base_cars": 5,  "throughput": 0.7},
    }

    queue_by_tariff = []
    total_cars = 0

    for t in tariffs:
        params = tariff_params.get(t["id"], {"base_cars": 10, "throughput": 1.0})

        # Кол-во авто = базовое * фактор активности + небольшой детерминированный шум
        noise = (hash(t["id"] + str(hour)) % 5) - 2  # -2..+2
        cars_in_queue = max(1, round(params["base_cars"] * total_factor) + noise)

        # Время ожидания заказа (мин) = очередь / пропускная способность
        # Чем больше машин → тем дольше ждать следующего заказа (конкуренция)
        # Но при высоком спросе (pax_boost) ожидание падает
        demand_factor = max(0.3, 1.0 - pax_boost * 0.4)
        wait_minutes = round((cars_in_queue / params["base_cars"]) * 8.0 * demand_factor)
        wait_minutes = max(1, min(wait_minutes, 45))

        # Статус очереди
        ratio = cars_in_queue / params["base_cars"]
        if ratio >= 1.5:
            queue_status = "overloaded"   # много авто → долго ждать заказ
        elif ratio >= 1.0:
            queue_status = "normal"
        elif ratio >= 0.5:
            queue_status = "low"
        else:
            queue_status = "critical"     # мало авто → быстро получишь заказ

        total_cars += cars_in_queue

        queue_by_tariff.append({
            "tariff_id":    t["id"],
            "tariff_name":  t["name"],
            "color":        t["color"],
            "cars_in_queue": cars_in_queue,
            "wait_order_min": wait_minutes,  # время ожидания заказа для водителя
            "queue_status": queue_status,
            "status_label": {
                "overloaded": "Очередь переполнена",
                "normal":     "Нормальная очередь",
                "low":        "Мало машин",
                "critical":   "Заказы поступают быстро",
            }[queue_status],
        })

    # Общая сводка по аэропорту
    next_flight = None
    min_wait = 9999
    for f in arrivals:
        if f["status"] not in ("arrived", "cancelled"):
            mins = _minutes_until(f["actual"], hour, minute)
            if 0 <= mins < min_wait:
                min_wait = mins
                next_flight = {
                    "flight": f["flight"],
                    "airline": f["airline"],
                    "arrives_in_min": mins,
                    "passengers": f["passengers"],
                    "terminal": f["terminal"],
                    "actual": f["actual"],
                }

    return {
        "total_cars":       total_cars,
        "by_tariff":        queue_by_tariff,
        "next_flight":      next_flight,
        "upcoming_pax":     upcoming_pax,
        "demand_level":     "high" if total_factor >= 1.5 else "medium" if total_factor >= 0.8 else "low",
        "updated_at":       f"{hour:02d}:{minute:02d}",
        "location":         "Терминалы A и B, AER",
    }


def _minutes_until(time_str: str, cur_hour: int, cur_minute: int) -> int:
    """Сколько минут до указанного времени (ЧЧ:ММ)."""
    try:
        h, m = map(int, time_str.split(":"))
        target = h * 60 + m
        current = cur_hour * 60 + cur_minute
        diff = target - current
        # Учитываем переход через полночь
        if diff < -120:
            diff += 1440
        return diff
    except Exception:
        return 999
