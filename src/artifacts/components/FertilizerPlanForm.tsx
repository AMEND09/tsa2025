import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Farm } from '../types';

interface FertilizerPlanFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Farm[];
  newFertilizerPlan: {
    farmId: string;
    title: string;
    description: string;
    fertilizerType: string;
    applicationRate: string;
    startDate: string;
    endDate: string;
    notes: string;
  };
  setNewFertilizerPlan: React.Dispatch<React.SetStateAction<{
    farmId: string;
    title: string;
    description: string;
    fertilizerType: string;
    applicationRate: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>>;
  handleAddFertilizerPlan: (e: React.FormEvent) => void;
}

const FertilizerPlanForm: React.FC<FertilizerPlanFormProps> = ({
  isOpen,
  onOpenChange,
  farms,
  newFertilizerPlan,
  setNewFertilizerPlan,
  handleAddFertilizerPlan,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Fertilizer Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddFertilizerPlan} className="space-y-4">
          <div>
            <Label>Farm</Label>
            <select
              className="w-full p-2 border rounded"
              value={newFertilizerPlan.farmId}
              onChange={(e) => setNewFertilizerPlan({ ...newFertilizerPlan, farmId: e.target.value })}
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
              value={newFertilizerPlan.title}
              onChange={(e) => setNewFertilizerPlan({ ...newFertilizerPlan, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newFertilizerPlan.description}
              onChange={(e) => setNewFertilizerPlan({ ...newFertilizerPlan, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Fertilizer Type</Label>
            <Input
              value={newFertilizerPlan.fertilizerType}
              onChange={(e) => setNewFertilizerPlan({ ...newFertilizerPlan, fertilizerType: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Application Rate</Label>
            <Input
              value={newFertilizerPlan.applicationRate}
              onChange={(e) => setNewFertilizerPlan({ ...newFertilizerPlan, applicationRate: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newFertilizerPlan.startDate}
                onChange={(e) => setNewFertilizerPlan({ ...newFertilizerPlan, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newFertilizerPlan.endDate}
                onChange={(e) => setNewFertilizerPlan({ ...newFertilizerPlan, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={newFertilizerPlan.notes}
              onChange={(e) => setNewFertilizerPlan({ ...newFertilizerPlan, notes: e.target.value })}
              placeholder="Additional notes about your fertilizer plan"
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full">Add Fertilizer Plan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FertilizerPlanForm;
