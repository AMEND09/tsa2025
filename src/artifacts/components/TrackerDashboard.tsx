import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Remove internal tabs
import { BarChart3 } from 'lucide-react'; // Removed Fuel, Sprout, BadgeMinus, Zap
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
  currentView: string; // New prop to control displayed content
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
  currentView, // Use this prop
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

  const renderCarbonFootprintView = () => (
    <div className="py-4">
      <CarbonFootprintTracker 
        emissionSources={emissionSources}
        setEmissionSources={setEmissionSources}
        sequestrationActivities={sequestrationActivities}
        setSequestrationActivities={setSequestrationActivities}
        farms={farms}
        fuelRecords={fuelRecords} // Pass fuelRecords if needed by CarbonFootprintTracker
      />
    </div>
  );

  const renderSoilHealthView = () => (
    <div className="py-4">
      <SoilHealthTracker 
        soilRecords={soilRecords}
        setSoilRecords={setSoilRecords}
        farms={farms}
      />
    </div>
  );

  const renderEnergyUsageView = () => (
    <div className="py-4">
      <EnergyUsageTracker 
        energyRecords={energyRecords}
        setEnergyRecords={setEnergyRecords}
        farms={farms}
        fuelRecords={fuelRecords} // Pass fuelRecords if needed by EnergyUsageTracker
      />
    </div>
  );

  const renderFuelUsageView = () => (
    <div className="py-4">
      <EquipmentFuelTracker 
        fuelRecords={fuelRecords}
        setFuelRecords={setFuelRecords}
        farms={farms}
      />
    </div>
  );
  
  const renderActiveView = () => {
    switch (currentView) {
      case 'carbon':
        return renderCarbonFootprintView();
      case 'soil':
        return renderSoilHealthView();
      case 'energy':
        return renderEnergyUsageView();
      case 'fuel':
        return renderFuelUsageView();
      default: // Default to carbon view or a summary
        return renderCarbonFootprintView();
    }
  };


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Sustainability Tracking Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-md bg-blue-50 border-blue-200">
            <h3 className="font-medium mb-2 text-blue-700">Sustainability Tracking Info</h3>
            <p className="text-sm mb-3 text-gray-700">
              The data from these trackers is integrated into your main sustainability score on the overview page.
              Continue tracking your farm sustainability metrics here to improve your overall score.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
              <li>Track your farm's carbon emissions and sequestration activities.</li>
              <li>Monitor soil health across all your fields.</li>
              <li>Record energy usage and explore renewable energy sources.</li>
              <li>Track fuel usage and improve equipment efficiency.</li>
            </ul>
          </div>

          {/* Remove Tabs, TabsList, TabsContent here, render based on currentView */}
          {renderActiveView()}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerDashboard;