import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Farm } from '../types';

interface IrrigationPlanFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Farm[];
  newIrrigationPlan: {
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    irrigationMethod: string;
    waterSource: string;
    frequency: string;
    soilMoistureThreshold: string;
    weatherConditions: string;
    notes: string;
  };
  setNewIrrigationPlan: React.Dispatch<React.SetStateAction<{
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    irrigationMethod: string;
    waterSource: string;
    frequency: string;
    soilMoistureThreshold: string;
    weatherConditions: string;
    notes: string;
  }>>;
  handleAddIrrigationPlan: (e: React.FormEvent) => void;
}

const IrrigationPlanForm: React.FC<IrrigationPlanFormProps> = ({
  isOpen,
  onOpenChange,
  farms,
  newIrrigationPlan,
  setNewIrrigationPlan,
  handleAddIrrigationPlan,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Smart Irrigation Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddIrrigationPlan} className="space-y-4">
          <div>
            <Label>Farm</Label>
            <select
              className="w-full p-2 border rounded"
              value={newIrrigationPlan.farmId}
              onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, farmId: e.target.value })}
              required
            >
              <option value="">Select Farm</option>
              {farms.map(farm => (
                <option key={farm.id} value={farm.id}>{farm.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Title</Label>
            <Input
              value={newIrrigationPlan.title}
              onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newIrrigationPlan.description}
              onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Irrigation Method</Label>
            <select
              className="w-full p-2 border rounded"
              value={newIrrigationPlan.irrigationMethod}
              onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, irrigationMethod: e.target.value })}
              required
            >
              <option value="">Select Method</option>
              <option value="drip">Drip Irrigation</option>
              <option value="sprinkler">Sprinkler System</option>
              <option value="center-pivot">Center Pivot</option>
              <option value="subsurface">Subsurface Drip</option>
              <option value="flood">Flood Irrigation</option>
              <option value="manual">Manual Watering</option>
            </select>
          </div>
          <div>
            <Label>Water Source</Label>
            <select
              className="w-full p-2 border rounded"
              value={newIrrigationPlan.waterSource}
              onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, waterSource: e.target.value })}
              required
            >
              <option value="">Select Source</option>
              <option value="well">Well Water</option>
              <option value="municipal">Municipal Supply</option>
              <option value="pond">Pond/Lake</option>
              <option value="river">River/Stream</option>
              <option value="rainwater">Harvested Rainwater</option>
              <option value="reclaimed">Reclaimed Water</option>
            </select>
          </div>
          <div>
            <Label>Irrigation Frequency</Label>
            <Input
              placeholder="E.g., Daily, Every 3 days, Weekly"
              value={newIrrigationPlan.frequency}
              onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, frequency: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Soil Moisture Threshold (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Threshold for starting irrigation"
              value={newIrrigationPlan.soilMoistureThreshold}
              onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, soilMoistureThreshold: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Weather Conditions for Adjustment</Label>
            <Input
              placeholder="E.g., Skip if >80% chance of rain"
              value={newIrrigationPlan.weatherConditions}
              onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, weatherConditions: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newIrrigationPlan.startDate}
                onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newIrrigationPlan.endDate}
                onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={newIrrigationPlan.notes}
              onChange={(e) => setNewIrrigationPlan({ ...newIrrigationPlan, notes: e.target.value })}
              placeholder="Additional notes about your irrigation plan"
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full">Add Irrigation Plan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IrrigationPlanForm;
