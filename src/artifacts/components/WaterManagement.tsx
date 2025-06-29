import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, CloudRain, TrendingUp, AlertTriangle } from 'lucide-react';
import { Farm, WeatherData } from '../types';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import CropFilter from './CropFilter';

interface WaterManagementProps {
  farms: Farm[];
  weatherData: WeatherData[];
  cropFilter: string;
  setCropFilter: (value: string) => void;
  getFilteredFarms: () => Farm[];
  setIsAddingWaterUsage: (value: boolean) => void;
  setIsAddingIrrigationPlan: (value: boolean) => void;
  setIsAddingRainwaterPlan: (value: boolean) => void;
}

const WaterManagement: React.FC<WaterManagementProps> = ({
  farms,
  weatherData,
  cropFilter,
  setCropFilter,
  getFilteredFarms,
  setIsAddingWaterUsage,
  setIsAddingIrrigationPlan,
  setIsAddingRainwaterPlan
}) => {
  // Calculate water usage stats
  const totalWaterUsage = getFilteredFarms().reduce((total, farm) => 
    total + farm.waterHistory.reduce((sum, record) => sum + record.amount, 0), 0
  );

  const avgWaterUsage = getFilteredFarms().length > 0 ? totalWaterUsage / getFilteredFarms().length : 0;

  // Get recent water usage trend (last 30 days)
  const recentWaterData = getFilteredFarms().flatMap(farm => 
    farm.waterHistory
      .filter(usage => {
        const usageDate = new Date(usage.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return usageDate >= thirtyDaysAgo;
      })
      .map(usage => ({
        farm: farm.name,
        amount: usage.amount,
        date: new Date(usage.date).toLocaleDateString(),
        timestamp: new Date(usage.date).getTime()
      }))
  ).sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="text-xl md:text-2xl font-bold">Water Management Dashboard</h2>
        <div className="text-sm text-gray-500">
          Manage water usage, irrigation plans, and efficiency
        </div>
      </div>
      
      {/* Crop Filter */}
      <CropFilter 
        farms={farms}
        cropFilter={cropFilter}
        setCropFilter={setCropFilter}
      />

      {/* Water Usage Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Water Usage</p>
                <p className="text-2xl font-bold">{totalWaterUsage.toLocaleString()}</p>
                <p className="text-xs text-gray-400">gallons</p>
              </div>
              <Droplet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average per Farm</p>
                <p className="text-2xl font-bold">{Math.round(avgWaterUsage).toLocaleString()}</p>
                <p className="text-xs text-gray-400">gallons</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Farms</p>
                <p className="text-2xl font-bold">{getFilteredFarms().length}</p>
                <p className="text-xs text-gray-400">monitored</p>
              </div>
              <Droplet className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Weather Alert</p>
                <p className="text-lg font-semibold">
                  {weatherData.some(day => day.weather.includes('Rain')) ? 'Rain Expected' : 'No Rain'}
                </p>
                <p className="text-xs text-gray-400">next 7 days</p>
              </div>
              {weatherData.some(day => day.weather.includes('Rain')) ? 
                <CloudRain className="h-8 w-8 text-blue-600" /> : 
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Water Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Water Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentWaterData}>
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

      {/* Water Efficiency and Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Water Efficiency Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Water Efficiency Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getFilteredFarms().map(farm => {
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

        {/* Water Management Actions */}
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

      {/* Irrigation Planning Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Irrigation Planning Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredFarms().map(farm => (
              <div key={farm.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{farm.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Crop:</span>
                    <span>{farm.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recent Water Usage:</span>
                    <span>{farm.waterHistory.slice(-1)[0]?.amount || 0} gal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={farm.waterHistory.length > 0 ? "text-green-600" : "text-yellow-600"}>
                      {farm.waterHistory.length > 0 ? "Monitored" : "Needs Setup"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterManagement;
