import { ReactNode } from 'react';

export interface WaterUsage {
  amount: number;
  date: string;
  efficiency?: number;
}

export interface Farm {
  id: number;
  name: string;
  size: string;
  crop: string;
  waterHistory: WaterUsage[];
  fertilizerHistory: any[];
  harvestHistory: any[];
  soilType?: string;
  slopeRatio?: number;
  pesticides?: {
    type: string;
    amount: number;
    date: string;
    toxicity: number;
  }[];
  rotationHistory?: {
    crop: string;
    startDate: string;
    endDate: string;
  }[];
  organicMatter?: number;
  soilPH?: number;
  biodiversityScore?: number;
}

export interface WeatherData {
  date: string;
  temp: number;
  weather: string;
  icon: string;
  precipitation?: number;
}

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  completed: boolean;
}

export interface Issue {
  id: number;
  type: string;
  description: string;
  severity: string;
  status: string;
  dateReported: Date;
}

export interface ConfirmDelete {
  id: number;
  type: string;
  date?: string;
  eventId?: number;
}

export interface CropPlanEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  farmId: number;
  type: 'planting' | 'fertilizing' | 'harvesting' | 'other';
  notes?: string;
}

export interface SustainabilityMetrics {
  overallScore: number;
  waterEfficiency: number;
  organicScore: number;
  harvestEfficiency: number;
  soilQualityScore: number;
  rotationScore: number;
}

export interface WalkthroughStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  tabId?: string;
  onEnter?: () => void;
}

export interface MetricsAccumulator {
  [key: string]: number;
  waterEfficiency: number;
  organicScore: number;
  harvestEfficiency: number;
  soilQualityScore: number;
  rotationScore: number;
}

export interface ExportData {
  version: string;
  exportDate: string;
  farms: Farm[];
  tasks: Task[];
  issues: Issue[];
  cropPlanEvents: CropPlanEvent[];
  plantingPlans?: PlanItem[];
  fertilizerPlans?: PlanItem[];
  pestManagementPlans?: PlanItem[];
}

export type AnyHistoryEntry = {
  type: 'Water Usage' | 'Fertilizer Usage' | 'Harvest' | 'Crop Rotation';
  date: Date;
  farm: string;
  amount?: string;
  icon: ReactNode;
  color: string;
  farmId: number;
  usage?: WaterUsage;
  fertilizer?: any;
  harvest?: any;
  rotation?: {
    crop: string;
    startDate: string;
    endDate: string;
  };
  crop?: string;
  endDate?: Date;
};

export interface PlanItem {
  id: number;
  farmId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
  [key: string]: any; // To allow for additional fields in specialized plan types
}
