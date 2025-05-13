import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SustainabilityMetrics, Farm } from '../types';

interface SustainabilityScoreCardProps {
  sustainabilityMetrics: SustainabilityMetrics | null;
  farms: Farm[];
  cropFilter: string;
  setCropFilter: (filter: string) => void;
}

// Import CropFilter component
const CropFilter = React.lazy(() => import('./CropFilter'));

const SustainabilityScoreCard: React.FC<SustainabilityScoreCardProps> = ({ 
  sustainabilityMetrics,
  farms,
  cropFilter,
  setCropFilter 
}) => (
  <Card data-walkthrough="sustainability">
    <CardHeader>
      <CardTitle className="flex justify-between items-center">
        <span>Sustainability Score</span>
        <CropFilter farms={farms} cropFilter={cropFilter} setCropFilter={setCropFilter} />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center">
        <div className="text-6xl font-bold mb-4" style={{
          color: sustainabilityMetrics?.overallScore! >= 80 ? '#16a34a' : 
                 sustainabilityMetrics?.overallScore! >= 60 ? '#ca8a04' : '#dc2626'
        }}>
          {sustainabilityMetrics ? sustainabilityMetrics.overallScore : '-'}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {/* Base sustainability metrics */}
          <div>
            <p className="text-gray-500">Water Efficiency</p>
            <p className="font-medium text-blue-600">
              {sustainabilityMetrics ? `${sustainabilityMetrics.waterEfficiency}%` : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Organic Practices</p>
            <p className="font-medium text-green-600">
              {sustainabilityMetrics ? `${sustainabilityMetrics.organicScore}%` : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Harvest Efficiency</p>
            <p className="font-medium text-yellow-600">
              {sustainabilityMetrics ? `${sustainabilityMetrics.harvestEfficiency}%` : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Soil Quality</p>
            <p className="font-medium text-amber-600">
              {sustainabilityMetrics ? `${sustainabilityMetrics.soilQualityScore}%` : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Crop Rotation</p>
            <p className="font-medium text-orange-600">
              {sustainabilityMetrics ? `${sustainabilityMetrics.rotationScore}%` : '-'}
            </p>
          </div>
          
          {/* Tracker sustainability metrics */}
          {sustainabilityMetrics?.carbonFootprint !== undefined && (
            <div>
              <p className="text-gray-500">Carbon Footprint</p>
              <p className="font-medium text-red-600">
                {`${sustainabilityMetrics.carbonFootprint}%`}
              </p>
            </div>
          )}
          
          {sustainabilityMetrics?.energyEfficiency !== undefined && (
            <div>
              <p className="text-gray-500">Energy Efficiency</p>
              <p className="font-medium text-blue-700">
                {`${sustainabilityMetrics.energyEfficiency}%`}
              </p>
            </div>
          )}
          
          {sustainabilityMetrics?.fuelEfficiency !== undefined && (
            <div>
              <p className="text-gray-500">Fuel Efficiency</p>
              <p className="font-medium text-yellow-700">
                {`${sustainabilityMetrics.fuelEfficiency}%`}
              </p>
            </div>
          )}
          
          {sustainabilityMetrics?.renewablePercentage !== undefined && (
            <div>
              <p className="text-gray-500">Renewable Energy</p>
              <p className="font-medium text-emerald-600">
                {`${sustainabilityMetrics.renewablePercentage.toFixed(1)}%`}
              </p>
            </div>
          )}
        </div>
        
        {sustainabilityMetrics && (
          <div className="mt-4 text-sm text-gray-500">
            <p className="mb-2">Recommendations:</p>
            <ul className="text-left list-disc pl-4 space-y-1">
              {sustainabilityMetrics.waterEfficiency < 80 && (
                <li>Consider implementing drip irrigation to improve water efficiency</li>
              )}
              {sustainabilityMetrics.organicScore < 80 && (
                <li>Explore organic fertilizer alternatives</li>
              )}
              {sustainabilityMetrics.harvestEfficiency < 80 && (
                <li>Review crop density and soil health management</li>
              )}
              {sustainabilityMetrics.soilQualityScore < 80 && (
                <li>Implement soil improvement measures</li>
              )}
              {sustainabilityMetrics.rotationScore < 80 && (
                <li>Consider implementing more diverse crop rotations</li>
              )}
              {sustainabilityMetrics.carbonFootprint !== undefined && sustainabilityMetrics.carbonFootprint < 70 && (
                <li>Reduce carbon emissions through improved practices and carbon sequestration</li>
              )}
              {sustainabilityMetrics.energyEfficiency !== undefined && sustainabilityMetrics.energyEfficiency < 70 && (
                <li>Improve energy efficiency with better equipment and renewable sources</li>
              )}
              {sustainabilityMetrics.fuelEfficiency !== undefined && sustainabilityMetrics.fuelEfficiency < 70 && (
                <li>Optimize equipment usage to reduce fuel consumption</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default SustainabilityScoreCard;