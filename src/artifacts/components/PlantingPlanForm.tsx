import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Farm } from '../types';

interface PlantingPlanFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Farm[];
  newPlantingPlan: {
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    notes: string;
  };
  setNewPlantingPlan: React.Dispatch<React.SetStateAction<{
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>>;
  handleAddPlantingPlan: (e: React.FormEvent) => void;
}

const PlantingPlanForm: React.FC<PlantingPlanFormProps> = ({
  isOpen,
  onOpenChange,
  farms,
  newPlantingPlan,
  setNewPlantingPlan,
  handleAddPlantingPlan,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Planting Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddPlantingPlan} className="space-y-4">
          <div>
            <Label>Farm</Label>
            <select
              className="w-full p-2 border rounded"
              value={newPlantingPlan.farmId}
              onChange={(e) => setNewPlantingPlan({ ...newPlantingPlan, farmId: e.target.value })}
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
              value={newPlantingPlan.title}
              onChange={(e) => setNewPlantingPlan({ ...newPlantingPlan, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newPlantingPlan.description}
              onChange={(e) => setNewPlantingPlan({ ...newPlantingPlan, description: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newPlantingPlan.startDate}
                onChange={(e) => setNewPlantingPlan({ ...newPlantingPlan, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newPlantingPlan.endDate}
                onChange={(e) => setNewPlantingPlan({ ...newPlantingPlan, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={newPlantingPlan.notes}
              onChange={(e) => setNewPlantingPlan({ ...newPlantingPlan, notes: e.target.value })}
              placeholder="Additional notes about your planting plan"
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full">Add Planting Plan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlantingPlanForm;
