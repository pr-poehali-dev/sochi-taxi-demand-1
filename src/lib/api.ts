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

export interface AirportData {
  arrivals: Flight[];
  departures: Flight[];
  demand_zones: DemandZone[];
  tariffs: Tariff[];
  updated_at: string;
  airport: string;
  city: string;
}

export async function fetchAirportData(): Promise<AirportData> {
  const res = await fetch(AIRPORT_API);
  if (!res.ok) throw new Error("API error");
  return res.json();
}
