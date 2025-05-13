export interface FuelRecord {
  id: number;
  farmId: number;
  date: string;
  equipmentName: string;
  fuelType: string;
  gallons: number;
  hoursOperated: number;
  cost: number;
  notes?: string;
}

export interface SoilRecord {
  id: number;
  farmId: number;
  date: string;
  location: string;
  ph: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  notes?: string;
}

export interface EnergyRecord {
  id: number;
  farmId: number;
  date: string;
  energyType: string;
  amount: number;
  unit: string;
  renewable: boolean;
  cost: number;
  purpose: string;     // irrigation, lighting, heating, etc.
  notes?: string;
}

export interface CarbonEmissionSource {
  id: number;
  farmId: number;
  date: string;
  sourceType: string;
  description: string;
  co2Equivalent: number;
  notes?: string;
}

export interface CarbonSequestrationActivity {
  id: number;
  farmId: number;
  date: string;
  activityType: string;
  description: string;
  co2Sequestered: number;
  area: number;
  notes?: string;
}