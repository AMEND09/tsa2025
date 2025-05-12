import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Farm } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface RotationPlanFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Farm[];
  newRotationPlan: {
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    rotationCrops: string[];
    rotationInterval: string;
    soilPreparation: string;
    expectedBenefits: string;
    notes: string;
  };
  setNewRotationPlan: React.Dispatch<React.SetStateAction<{
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    rotationCrops: string[];
    rotationInterval: string;
    soilPreparation: string;
    expectedBenefits: string;
    notes: string;
  }>>;
  handleAddRotationPlan: (e: React.FormEvent) => void;
}

const RotationPlanForm: React.FC<RotationPlanFormProps> = ({
  isOpen,
  onOpenChange,
  farms,
  newRotationPlan,
  setNewRotationPlan,
  handleAddRotationPlan,
}) => {
  const [newCrop, setNewCrop] = useState("");

  const handleAddCrop = () => {
    if (newCrop.trim()) {
      setNewRotationPlan({
        ...newRotationPlan,
        rotationCrops: [...newRotationPlan.rotationCrops, newCrop.trim()]
      });
      setNewCrop("");
    }
  };

  const handleRemoveCrop = (index: number) => {
    setNewRotationPlan({
      ...newRotationPlan,
      rotationCrops: newRotationPlan.rotationCrops.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Crop Rotation Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddRotationPlan} className="space-y-4">
          <div>
            <Label>Farm</Label>
            <select
              className="w-full p-2 border rounded"
              value={newRotationPlan.farmId}
              onChange={(e) => setNewRotationPlan({ ...newRotationPlan, farmId: e.target.value })}
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
              value={newRotationPlan.title}
              onChange={(e) => setNewRotationPlan({ ...newRotationPlan, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newRotationPlan.description}
              onChange={(e) => setNewRotationPlan({ ...newRotationPlan, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Rotation Crops</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                placeholder="Add crop to rotation"
              />
              <Button type="button" onClick={handleAddCrop} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {newRotationPlan.rotationCrops.map((crop, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>{crop}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveCrop(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {newRotationPlan.rotationCrops.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Add at least one crop to the rotation</p>
            )}
          </div>
          <div>
            <Label>Rotation Interval</Label>
            <select
              className="w-full p-2 border rounded"
              value={newRotationPlan.rotationInterval}
              onChange={(e) => setNewRotationPlan({ ...newRotationPlan, rotationInterval: e.target.value })}
              required
            >
              <option value="">Select Interval</option>
              <option value="seasonal">Seasonal</option>
              <option value="annual">Annual</option>
              <option value="biannual">Biannual</option>
              <option value="3-year">3-Year Cycle</option>
              <option value="4-year">4-Year Cycle</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <Label>Soil Preparation Requirements</Label>
            <Textarea
              placeholder="Describe soil preparation needs between rotations"
              value={newRotationPlan.soilPreparation}
              onChange={(e) => setNewRotationPlan({ ...newRotationPlan, soilPreparation: e.target.value })}
              required
              className="min-h-[80px]"
            />
          </div>
          <div>
            <Label>Expected Benefits</Label>
            <Textarea
              placeholder="Describe expected benefits of this rotation plan"
              value={newRotationPlan.expectedBenefits}
              onChange={(e) => setNewRotationPlan({ ...newRotationPlan, expectedBenefits: e.target.value })}
              required
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newRotationPlan.startDate}
                onChange={(e) => setNewRotationPlan({ ...newRotationPlan, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newRotationPlan.endDate}
                onChange={(e) => setNewRotationPlan({ ...newRotationPlan, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={newRotationPlan.notes}
              onChange={(e) => setNewRotationPlan({ ...newRotationPlan, notes: e.target.value })}
              placeholder="Additional notes about your crop rotation plan"
              className="min-h-[80px]"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={newRotationPlan.rotationCrops.length === 0}
          >
            Add Rotation Plan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RotationPlanForm;
