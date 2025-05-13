import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fuel, Sprout, BadgeMinus, Zap, BarChart3 } from 'lucide-react';
import EquipmentFuelTracker from './EquipmentFuelTracker';
import SoilHealthTracker from './SoilHealthTracker';
import CarbonFootprintTracker from './CarbonFootprintTracker';
import EnergyUsageTracker from './EnergyUsageTracker';
import { 
  FuelRecord, 
  SoilRecord, 
  CarbonEmissionSource, 
  CarbonSequestrationActivity, 
  EnergyRecord 
} from '../models/sustainability';
import { Farm } from '../types';

interface TrackerDashboardProps {
  farms: Farm[];
  fuelRecords: FuelRecord[];
  setFuelRecords: React.Dispatch<React.SetStateAction<FuelRecord[]>>;
  soilRecords: SoilRecord[];
  setSoilRecords: React.Dispatch<React.SetStateAction<SoilRecord[]>>;
  emissionSources: CarbonEmissionSource[];
  setEmissionSources: React.Dispatch<React.SetStateAction<CarbonEmissionSource[]>>;
  sequestrationActivities: CarbonSequestrationActivity[];
  setSequestrationActivities: React.Dispatch<React.SetStateAction<CarbonSequestrationActivity[]>>;
  energyRecords: EnergyRecord[];
  setEnergyRecords: React.Dispatch<React.SetStateAction<EnergyRecord[]>>;
}

const TrackerDashboard: React.FC<TrackerDashboardProps> = ({
  farms,
  fuelRecords,
  setFuelRecords,
  soilRecords,
  setSoilRecords,
  emissionSources,
  setEmissionSources,
  sequestrationActivities,
  setSequestrationActivities,
  energyRecords,
  setEnergyRecords
}) => {
  // Note: Sustainability metrics calculation has been moved to the main page
  // and integrated with the calculateSustainabilityMetricsWithTrackers function

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Sustainability Tracking Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-md">
            <h3 className="font-medium mb-2">Sustainability Tracking Info</h3>
            <p className="text-sm mb-3">
              The data from these trackers is now integrated into your main sustainability score on the overview page.
              Continue tracking your farm sustainability metrics here to improve your overall score.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Track your farm's carbon emissions and sequestration activities</li>
              <li>Monitor soil health across all your fields</li>
              <li>Record energy usage and increase renewable energy sources</li>
              <li>Track fuel usage and improve equipment efficiency</li>
            </ul>
          </div>

          <Tabs defaultValue="carbon" className="w-full">
            <TabsList className="w-full grid grid-cols-1 md:grid-cols-4">
              <TabsTrigger value="carbon" className="flex items-center gap-2">
                <BadgeMinus className="h-4 w-4" /> Carbon Footprint
              </TabsTrigger>
              <TabsTrigger value="soil" className="flex items-center gap-2">
                <Sprout className="h-4 w-4" /> Soil Health
              </TabsTrigger>
              <TabsTrigger value="energy" className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Energy Usage
              </TabsTrigger>
              <TabsTrigger value="fuel" className="flex items-center gap-2">
                <Fuel className="h-4 w-4" /> Fuel Usage
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="carbon">
              <div className="py-4">
                <CarbonFootprintTracker 
                  emissionSources={emissionSources}
                  setEmissionSources={setEmissionSources}
                  sequestrationActivities={sequestrationActivities}
                  setSequestrationActivities={setSequestrationActivities}
                  farms={farms}
                  fuelRecords={fuelRecords}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="soil">
              <div className="py-4">
                <SoilHealthTracker 
                  soilRecords={soilRecords}
                  setSoilRecords={setSoilRecords}
                  farms={farms}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="energy">
              <div className="py-4">
                <EnergyUsageTracker 
                  energyRecords={energyRecords}
                  setEnergyRecords={setEnergyRecords}
                  farms={farms}
                  fuelRecords={fuelRecords}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="fuel">
              <div className="py-4">
                <EquipmentFuelTracker 
                  fuelRecords={fuelRecords}
                  setFuelRecords={setFuelRecords}
                  farms={farms}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerDashboard;