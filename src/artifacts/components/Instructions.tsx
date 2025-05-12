import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, LayoutDashboard, Droplet, Leaf, AlertTriangle, RotateCw } from 'lucide-react';

interface InstructionsProps {
  onStartWalkthrough: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onStartWalkthrough }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Info className="h-5 w-5" />
        Instructions & Help
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <Button 
          onClick={onStartWalkthrough}
          variant="outline" 
          className="w-full mb-6"
        >
          Start Interactive Walkthrough
        </Button>

        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </h2>
          <div className="mt-2 space-y-2 text-gray-600">
            <p>The Overview tab is your main dashboard where you can:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use Quick Actions to record water usage, fertilizer applications, and harvests</li>
              <li>View your farm's sustainability score and detailed metrics</li>
              <li>Check the 10-day weather forecast</li>
              <li>See upcoming planned activities</li>
              <li>Monitor active farm issues</li>
              <li>Manage daily tasks</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Droplet className="h-4 w-4" />
            Water Management
          </h2>
          <div className="mt-2 space-y-2 text-gray-600">
            <p>Track and analyze your water usage:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>View historical water usage data in graph form</li>
              <li>Monitor water efficiency scores</li>
              <li>Track irrigation patterns across different farms</li>
              <li>Record new water applications through Quick Actions</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Crops & Farms
          </h2>
          <div className="mt-2 space-y-2 text-gray-600">
            <p>Manage your farms and crops:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Add new farms with detailed information</li>
              <li>Track crop rotations and farm history</li>
              <li>Monitor harvest records</li>
              <li>View fertilizer applications</li>
              <li>Edit or delete existing farms</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Farm Issues
          </h2>
          <div className="mt-2 space-y-2 text-gray-600">
            <p>Track and manage farm problems:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Report new issues with severity levels</li>
              <li>Track the status of ongoing problems</li>
              <li>Mark issues as resolved</li>
              <li>Keep a history of past problems</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Info className="h-4 w-4" />
            Reports
          </h2>
          <div className="mt-2 space-y-2 text-gray-600">
            <p>View reporting of farm activities:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>View by crop or all</li>
              <li>View Water Usage</li>
              <li>View Fertilizer Usage</li>
              <li>View Harvest Information</li>
              <li>View Harvest Information Graphically</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Crop Planning
          </h2>
          <div className="mt-2 space-y-2 text-gray-600">
            <p>Plan and schedule your farming activities:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Create detailed crop plans with the calendar</li>
              <li>Schedule plantings, harvests, and other activities</li>
              <li>Export and import crop plans</li>
              <li>View upcoming events for the next two weeks</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-bold text-blue-700">Tips</h2>
          <ul className="mt-2 space-y-2 text-blue-600">
            <li>• Use the walkthrough feature above to learn the basics</li>
            <li>• Regular data entry helps maintain accurate sustainability scores</li>
            <li>• Check weather forecasts before scheduling water applications</li>
            <li>• Keep crop rotation records updated for better soil health tracking</li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Instructions;