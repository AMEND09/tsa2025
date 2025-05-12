import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Leaf, LayoutDashboard, CloudRain, Download } from 'lucide-react';
import { Farm, WeatherData } from '../types';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import CropFilter from './CropFilter';

interface ReportsAndAnalyticsProps {
  farms: Farm[];
  weatherData: WeatherData[];
  cropFilter: string;
  setCropFilter: (value: string) => void;
  getFilteredFarms: () => Farm[];
  setIsAddingWaterUsage: (value: boolean) => void;
  setIsAddingIrrigationPlan: (value: boolean) => void;
  setIsAddingRainwaterPlan: (value: boolean) => void;
  handleExportData: () => void;
}

const ReportsAndAnalytics: React.FC<ReportsAndAnalyticsProps> = ({
  farms,
  weatherData,
  cropFilter,
  setCropFilter,
  getFilteredFarms,
  setIsAddingWaterUsage,
  setIsAddingIrrigationPlan,
  setIsAddingRainwaterPlan,
  handleExportData
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Farm Reports & Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
        </div>
      </div>
      
      {/* Crop Filter */}
      <CropFilter 
        farms={farms}
        cropFilter={cropFilter}
        setCropFilter={setCropFilter}
      />
      
      {getFilteredFarms().length > 0 ? (
        <>
          {/* Farm Metrics Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Droplet className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Total Water Usage</p>
              <p className="text-2xl font-bold text-blue-600">
                {getFilteredFarms()
                  .reduce(
                    (total, farm) =>
                      total +
                      farm.waterHistory.reduce(
                        (sum, record) => sum + record.amount,
                        0
                      ),
                    0
                  )
                  .toLocaleString()}{" "}
                gal
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Leaf className="h-6 w-6 text-green-500 mb-2" />
              <p className="text-sm text-gray-500">Total Fertilizer Used</p>
              <p className="text-2xl font-bold text-green-600">
                {getFilteredFarms()
                  .reduce(
                    (total, farm) =>
                      total +
                      farm.fertilizerHistory.reduce(
                        (sum, record) => sum + record.amount,
                        0
                      ),
                    0
                  )
                  .toLocaleString()}{" "}
                lbs
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-purple-500 mb-2" />
              <p className="text-sm text-gray-500">Total Harvest</p>
              <p className="text-2xl font-bold text-purple-600">
                {getFilteredFarms()
                  .reduce(
                    (total, farm) =>
                      total +
                      farm.harvestHistory.reduce(
                        (sum, record) => sum + record.amount,
                        0
                      ),
                    0
                  )
                  .toLocaleString()}{" "}
                bu
              </p>
            </div>
          </div>

          {/* Water Usage Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Water Usage Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getFilteredFarms().flatMap(farm => 
                    farm.waterHistory.map(usage => ({
                      farm: farm.name,
                      amount: usage.amount,
                      date: new Date(usage.date).toLocaleDateString()
                    }))
                  )}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="#3b82f6" name="Water Usage (gal)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Water Efficiency Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Water Efficiency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredFarms().map(farm => {
                    // Calculate water usage per harvest yield if both exist
                    const totalWater = farm.waterHistory.reduce((sum, record) => sum + record.amount, 0);
                    const totalHarvest = farm.harvestHistory.reduce((sum, record) => sum + record.amount, 0);
                    const efficiency = totalHarvest > 0 ? (totalWater / totalHarvest).toFixed(2) : 'N/A';
                    
                    return (
                      <div key={farm.id} className="p-3 border rounded">
                        <h3 className="font-medium">{farm.name} ({farm.crop})</h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Total Water Used:</p>
                            <p className="font-medium">{totalWater.toLocaleString()} gal</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Water per Harvest Unit:</p>
                            <p className="font-medium">{efficiency !== 'N/A' ? `${efficiency} gal/bu` : 'No harvest data'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions for Water Management */}
            <Card>
              <CardHeader>
                <CardTitle>Water Management Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setIsAddingWaterUsage(true)} 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Droplet className="h-4 w-4 mr-2" />
                    Record Water Usage
                  </Button>
                  
                  <Button 
                    onClick={() => setIsAddingIrrigationPlan(true)} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Droplet className="h-4 w-4 mr-2" />
                    Create Irrigation Plan
                  </Button>
                  
                  <Button 
                    onClick={() => setIsAddingRainwaterPlan(true)} 
                    className="w-full bg-blue-700 hover:bg-blue-800"
                  >
                    <CloudRain className="h-4 w-4 mr-2" />
                    Create Rainwater Harvesting Plan
                  </Button>
                  
                  {weatherData.some(day => day.weather.includes('Rain')) && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <h3 className="font-medium text-blue-800">Rain Alert</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Rain is forecasted soon. Consider postponing irrigation and preparing rainwater harvesting systems.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Harvest Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Harvest Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFilteredFarms().flatMap((farm) =>
                      farm.harvestHistory.map((harvest) => ({
                        farm: farm.name,
                        amount: harvest.amount,
                        date: new Date(harvest.date).toLocaleDateString(),
                      }))
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="#8884d8"
                      name="Harvest Amount (bu)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fertilizer Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Fertilizer Application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFilteredFarms().flatMap((farm) =>
                      farm.fertilizerHistory.map((fert) => ({
                        farm: farm.name,
                        amount: fert.amount,
                        type: fert.type,
                        date: new Date(fert.date).toLocaleDateString(),
                      }))
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="#82ca9d"
                      name="Fertilizer Amount (lbs)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center p-8">
          <p className="text-gray-500">
            {farms.length === 0
              ? "No data available. Add farms and record activities to see reports."
              : "No farms found for the selected crop."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsAndAnalytics;
