const AIRPORT_API = "https://functions.poehali.dev/8664463b-8586-4641-906e-a1fbd49666f2";

export interface TariffDemand {
  tariff_id: string;
  tariff_name: string;
  coeff: number;
  level: "low" | "medium" | "high" | "critical";
  color: string;
}

export interface Flight {
  flight: string;
  airline: string;
  origin?: string;
  dest?: string;
  scheduled: string;
  actual: string;
  status: "on_time" | "delayed" | "arrived" | "boarding" | "cancelled";
  passengers?: number;
  terminal: string;
  tariff_demand?: TariffDemand[];
  surge_coeff?: number;
  gate?: string;
}

export interface DemandZone {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radius: number;
  surge: number;
  level: "low" | "medium" | "high" | "critical";
  wait_min: number;
  forecast_min: number;
  tariff_demand: TariffDemand[];
}

export interface Tariff {
  id: string;
  name: string;
  base_coeff: number;
  color: string;
}

export interface QueueTariff {
  tariff_id: string;
  tariff_name: string;
  color: string;
  cars_in_queue: number;
  wait_order_min: number;
  queue_status: "overloaded" | "normal" | "low" | "critical";
  status_label: string;
}

export interface NextFlight {
  flight: string;
  airline: string;
  arrives_in_min: number;
  passengers: number;
  terminal: string;
  actual: string;
}

export interface AirportQueue {
  total_cars: number;
  by_tariff: QueueTariff[];
  next_flight: NextFlight | null;
  upcoming_pax: number;
  demand_level: "low" | "medium" | "high";
  updated_at: string;
  location: string;
}

export interface AirportData {
  arrivals: Flight[];
  departures: Flight[];
  demand_zones: DemandZone[];
  tariffs: Tariff[];
  airport_queue: AirportQueue;
  updated_at: string;
  airport: string;
  city: string;
}

export async function fetchAirportData(): Promise<AirportData> {
  const res = await fetch(AIRPORT_API);
  if (!res.ok) throw new Error("API error");
  return res.json();
}