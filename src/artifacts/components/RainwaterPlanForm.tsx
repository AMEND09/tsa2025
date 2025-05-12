import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Farm } from '../types';

interface RainwaterPlanFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Farm[];
  newRainwaterPlan: {
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    harvestingMethod: string;
    storageType: string;
    harvestingCapacity: string;
    collectionArea: string;
    filteringMethod: string;
    usageIntent: string;
    notes: string;
  };
  setNewRainwaterPlan: React.Dispatch<React.SetStateAction<{
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    harvestingMethod: string;
    storageType: string;
    harvestingCapacity: string;
    collectionArea: string;
    filteringMethod: string;
    usageIntent: string;
    notes: string;
  }>>;
  handleAddRainwaterPlan: (e: React.FormEvent) => void;
}

const RainwaterPlanForm: React.FC<RainwaterPlanFormProps> = ({
  isOpen,
  onOpenChange,
  farms,
  newRainwaterPlan,
  setNewRainwaterPlan,
  handleAddRainwaterPlan,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Rainwater Harvesting Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddRainwaterPlan} className="space-y-4">
          <div>
            <Label>Farm</Label>
            <select
              className="w-full p-2 border rounded"
              value={newRainwaterPlan.farmId}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, farmId: e.target.value })}
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
              value={newRainwaterPlan.title}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newRainwaterPlan.description}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Harvesting Method</Label>
            <select
              className="w-full p-2 border rounded"
              value={newRainwaterPlan.harvestingMethod}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, harvestingMethod: e.target.value })}
              required
            >
              <option value="">Select Method</option>
              <option value="roof">Roof Collection</option>
              <option value="surface">Surface Runoff</option>
              <option value="channel">Channeling</option>
              <option value="pond">Catchment Pond</option>
              <option value="swales">Swales and Berms</option>
            </select>
          </div>
          <div>
            <Label>Storage Type</Label>
            <select
              className="w-full p-2 border rounded"
              value={newRainwaterPlan.storageType}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, storageType: e.target.value })}
              required
            >
              <option value="">Select Storage Type</option>
              <option value="tank">Above-ground Tank</option>
              <option value="cistern">Underground Cistern</option>
              <option value="barrel">Rain Barrels</option>
              <option value="pond">Retention Pond</option>
              <option value="soil">Soil Profile Storage</option>
            </select>
          </div>
          <div>
            <Label>Harvesting Capacity (gallons)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Estimated collection capacity"
              value={newRainwaterPlan.harvestingCapacity}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, harvestingCapacity: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Collection Area (sq ft)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Surface area for collection"
              value={newRainwaterPlan.collectionArea}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, collectionArea: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Filtering Method</Label>
            <Input
              placeholder="How will you filter collected water"
              value={newRainwaterPlan.filteringMethod}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, filteringMethod: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Usage Intent</Label>
            <select
              className="w-full p-2 border rounded"
              value={newRainwaterPlan.usageIntent}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, usageIntent: e.target.value })}
              required
            >
              <option value="">Select Usage</option>
              <option value="irrigation">Irrigation</option>
              <option value="livestock">Livestock</option>
              <option value="washing">Equipment Washing</option>
              <option value="reserve">Drought Reserve</option>
              <option value="multiple">Multiple Uses</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newRainwaterPlan.startDate}
                onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newRainwaterPlan.endDate}
                onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={newRainwaterPlan.notes}
              onChange={(e) => setNewRainwaterPlan({ ...newRainwaterPlan, notes: e.target.value })}
              placeholder="Additional notes about your rainwater harvesting plan"
              className="min-h-[80px]"
            />
          </div>
          <Button type="submit" className="w-full">Add Rainwater Harvesting Plan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RainwaterPlanForm;
