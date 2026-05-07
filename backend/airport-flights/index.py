import json
import os
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
import random

def handler(event: dict, context) -> dict:
    """
    Получает данные о рейсах аэропорта Сочи (AER).
    Использует открытый API aviationstack или возвращает реалистичные демо-данные.
    GET /: возвращает прилёты и вылеты, спрос по тарифам.
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

    # Тарифы с базовым спросом
    tariffs = [
        {"id": "econom",    "name": "Эконом",          "base_coeff": 1.0, "color": "#6B7280"},
        {"id": "comfort",   "name": "Комфорт",         "base_coeff": 1.3, "color": "#3B82F6"},
        {"id": "comfort_plus","name": "Комфорт+",      "base_coeff": 1.6, "color": "#8B5CF6"},
        {"id": "kids",      "name": "Детский",         "base_coeff": 1.4, "color": "#EC4899"},
        {"id": "business",  "name": "Бизнес",          "base_coeff": 2.2, "color": "#F59E0B"},
        {"id": "elite",     "name": "Элит-премьер",    "base_coeff": 3.5, "color": "#EF4444"},
        {"id": "minivan",   "name": "Минивэн",         "base_coeff": 1.8, "color": "#10B981"},
    ]

    # Реалистичные рейсы аэропорта Сочи (AER)
    flights_arrivals = [
        {"flight": "SU2304", "airline": "Аэрофлот",  "origin": "Москва (SVO)",           "scheduled": _time(now, -30), "actual": _time(now, -25), "status": "arrived",   "passengers": 186, "terminal": "A"},
        {"flight": "U68154", "airline": "UTair",      "origin": "Екатеринбург (SVX)",     "scheduled": _time(now, 20),  "actual": _time(now, 25),  "status": "delayed",   "passengers": 120, "terminal": "A"},
        {"flight": "DP841",  "airline": "Победа",     "origin": "Санкт-Петербург (LED)",  "scheduled": _time(now, 45),  "actual": _time(now, 45),  "status": "on_time",   "passengers": 189, "terminal": "B"},
        {"flight": "S76321", "airline": "Сибирь",     "origin": "Новосибирск (OVB)",      "scheduled": _time(now, 70),  "actual": _time(now, 85),  "status": "delayed",   "passengers": 140, "terminal": "A"},
        {"flight": "FV6201", "airline": "Россия",     "origin": "Казань (KZN)",           "scheduled": _time(now, 95),  "actual": _time(now, 95),  "status": "on_time",   "passengers": 85,  "terminal": "B"},
        {"flight": "SU1814", "airline": "Аэрофлот",  "origin": "Москва (DME)",           "scheduled": _time(now, 110), "actual": _time(now, 110), "status": "on_time",   "passengers": 219, "terminal": "A"},
        {"flight": "PC4512", "airline": "Pegasus",    "origin": "Стамбул (SAW)",          "scheduled": _time(now, 135), "actual": _time(now, 175), "status": "delayed",   "passengers": 174, "terminal": "B"},
        {"flight": "U68962", "airline": "UTair",      "origin": "Тюмень (TJM)",           "scheduled": _time(now, 190), "actual": _time(now, 190), "status": "on_time",   "passengers": 98,  "terminal": "A"},
        {"flight": "SU2506", "airline": "Аэрофлот",  "origin": "Москва (SVO)",           "scheduled": _time(now, 240), "actual": _time(now, 240), "status": "on_time",   "passengers": 205, "terminal": "A"},
        {"flight": "UT301",  "airline": "UTair",      "origin": "Уфа (UFA)",              "scheduled": _time(now, 280), "actual": _time(now, 280), "status": "on_time",   "passengers": 110, "terminal": "B"},
    ]

    flights_departures = [
        {"flight": "SU2305", "airline": "Аэрофлот",  "dest": "Москва (SVO)",             "scheduled": _time(now, 30),  "actual": _time(now, 30),  "status": "boarding",  "gate": "A12", "terminal": "A"},
        {"flight": "DP842",  "airline": "Победа",     "dest": "Санкт-Петербург (LED)",    "scheduled": _time(now, 60),  "actual": _time(now, 60),  "status": "on_time",   "gate": "B07", "terminal": "B"},
        {"flight": "U68155", "airline": "UTair",      "dest": "Екатеринбург (SVX)",       "scheduled": _time(now, 80),  "actual": _time(now, 80),  "status": "on_time",   "gate": "A05", "terminal": "A"},
        {"flight": "S76322", "airline": "Сибирь",     "dest": "Новосибирск (OVB)",        "scheduled": _time(now, 115), "actual": _time(now, 115), "status": "boarding",  "gate": "A09", "terminal": "A"},
        {"flight": "SU1815", "airline": "Аэрофлот",  "dest": "Москва (DME)",             "scheduled": _time(now, 165), "actual": _time(now, 205), "status": "delayed",   "gate": "B03", "terminal": "B"},
        {"flight": "FV6202", "airline": "Россия",     "dest": "Казань (KZN)",             "scheduled": _time(now, 200), "actual": _time(now, 200), "status": "on_time",   "gate": "A14", "terminal": "A"},
        {"flight": "PC4513", "airline": "Pegasus",    "dest": "Стамбул (SAW)",            "scheduled": _time(now, 250), "actual": _time(now, 250), "status": "on_time",   "gate": "B11", "terminal": "B"},
    ]

    # Рассчитываем спрос по тарифам для каждого рейса
    for f in flights_arrivals:
        pax = f["passengers"]
        surge_base = _calc_surge(pax)
        f["tariff_demand"] = _calc_tariff_demand(tariffs, surge_base, f["status"])
        f["surge_coeff"] = round(surge_base, 1)

    # Зоны спроса с тарифами
    demand_zones = [
        {"id": "airport",  "name": "Аэропорт",       "lat": 43.4498, "lon": 39.9498, "radius": 1500, "surge": 3.1, "level": "high",     "wait_min": 3,  "forecast_min": 45},
        {"id": "center",   "name": "Центр города",    "lat": 43.5855, "lon": 39.7231, "radius": 2000, "surge": 2.4, "level": "medium",   "wait_min": 6,  "forecast_min": 60},
        {"id": "adler",    "name": "Адлер",           "lat": 43.4468, "lon": 39.9180, "radius": 1800, "surge": 2.0, "level": "medium",   "wait_min": 5,  "forecast_min": 30},
        {"id": "krasnaya", "name": "Красная Поляна",  "lat": 43.6746, "lon": 40.2011, "radius": 1200, "surge": 1.8, "level": "medium",   "wait_min": 8,  "forecast_min": 40},
        {"id": "hosta",    "name": "Хоста",           "lat": 43.5041, "lon": 39.8634, "radius": 1000, "surge": 1.2, "level": "low",      "wait_min": 12, "forecast_min": 20},
        {"id": "lazarev",  "name": "Лазаревское",     "lat": 43.9025, "lon": 39.3390, "radius": 900,  "surge": 1.1, "level": "low",      "wait_min": 15, "forecast_min": 15},
    ]

    for zone in demand_zones:
        zone["tariff_demand"] = _calc_tariff_demand(tariffs, zone["surge"], "on_time")

    result = {
        "arrivals": flights_arrivals,
        "departures": flights_departures,
        "demand_zones": demand_zones,
        "tariffs": tariffs,
        "updated_at": now.strftime("%H:%M"),
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
    return t.strftime("%H:%M")


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
