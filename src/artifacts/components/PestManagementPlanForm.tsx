import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Farm } from '../types';

interface PestManagementPlanFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Farm[];
  newPestPlan: {
    farmId: string;
    title: string;
    description: string;
    pestType: string;
    controlMethod: string;
    startDate: string;
    endDate: string;
    notes: string;
  };
  setNewPestPlan: React.Dispatch<React.SetStateAction<{
    farmId: string;
    title: string;
    description: string;
    pestType: string;
    controlMethod: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>>;
  handleAddPestPlan: (e: React.FormEvent) => void;
}

const PestManagementPlanForm: React.FC<PestManagementPlanFormProps> = ({
  isOpen,
  onOpenChange,
  farms,
  newPestPlan,
  setNewPestPlan,
  handleAddPestPlan,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Pest Management Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddPestPlan} className="space-y-4">
          <div>
            <Label>Farm</Label>
            <select
              className="w-full p-2 border rounded"
              value={newPestPlan.farmId}
              onChange={(e) => setNewPestPlan({ ...newPestPlan, farmId: e.target.value })}
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
              value={newPestPlan.title}
              onChange={(e) => setNewPestPlan({ ...newPestPlan, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newPestPlan.description}
              onChange={(e) => setNewPestPlan({ ...newPestPlan, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Pest Type</Label>
            <Input
              value={newPestPlan.pestType}
              onChange={(e) => setNewPestPlan({ ...newPestPlan, pestType: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Control Method</Label>
            <Input
              value={newPestPlan.controlMethod}
              onChange={(e) => setNewPestPlan({ ...newPestPlan, controlMethod: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newPestPlan.startDate}
                onChange={(e) => setNewPestPlan({ ...newPestPlan, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newPestPlan.endDate}
                onChange={(e) => setNewPestPlan({ ...newPestPlan, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={newPestPlan.notes}
              onChange={(e) => setNewPestPlan({ ...newPestPlan, notes: e.target.value })}
              placeholder="Additional notes about your pest management plan"
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full">Add Pest Management Plan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PestManagementPlanForm;
