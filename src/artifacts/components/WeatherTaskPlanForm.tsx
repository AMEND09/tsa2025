import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Farm } from '../types';

interface WeatherTaskPlanFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Farm[];
  newWeatherTaskPlan: {
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    taskType: string;
    weatherCondition: string;
    taskActions: string;
    priority: string;
    notes: string;
  };
  setNewWeatherTaskPlan: React.Dispatch<React.SetStateAction<{
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    taskType: string;
    weatherCondition: string;
    taskActions: string;
    priority: string;
    notes: string;
  }>>;
  handleAddWeatherTaskPlan: (e: React.FormEvent) => void;
}

const WeatherTaskPlanForm: React.FC<WeatherTaskPlanFormProps> = ({
  isOpen,
  onOpenChange,
  farms,
  newWeatherTaskPlan,
  setNewWeatherTaskPlan,
  handleAddWeatherTaskPlan,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Weather Responsive Task Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddWeatherTaskPlan} className="space-y-4">
          <div>
            <Label>Farm</Label>
            <select
              className="w-full p-2 border rounded"
              value={newWeatherTaskPlan.farmId}
              onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, farmId: e.target.value })}
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
              value={newWeatherTaskPlan.title}
              onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newWeatherTaskPlan.description}
              onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Task Type</Label>
            <select
              className="w-full p-2 border rounded"
              value={newWeatherTaskPlan.taskType}
              onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, taskType: e.target.value })}
              required
            >
              <option value="">Select Task Type</option>
              <option value="harvest">Harvest</option>
              <option value="planting">Planting</option>
              <option value="protection">Crop Protection</option>
              <option value="irrigation">Irrigation</option>
              <option value="fertilizing">Fertilizing</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <Label>Weather Condition Trigger</Label>
            <select
              className="w-full p-2 border rounded"
              value={newWeatherTaskPlan.weatherCondition}
              onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, weatherCondition: e.target.value })}
              required
            >
              <option value="">Select Weather Trigger</option>
              <option value="rain">Rain Forecast</option>
              <option value="drought">Drought Conditions</option>
              <option value="frost">Frost Warning</option>
              <option value="heat">Heat Wave</option>
              <option value="wind">High Wind</option>
              <option value="storm">Severe Storm</option>
            </select>
          </div>
          <div>
            <Label>Task Actions</Label>
            <Textarea
              placeholder="Actions to be taken when weather condition occurs"
              value={newWeatherTaskPlan.taskActions}
              onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, taskActions: e.target.value })}
              required
              className="min-h-[80px]"
            />
          </div>
          <div>
            <Label>Priority</Label>
            <select
              className="w-full p-2 border rounded"
              value={newWeatherTaskPlan.priority}
              onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, priority: e.target.value })}
              required
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newWeatherTaskPlan.startDate}
                onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newWeatherTaskPlan.endDate}
                onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={newWeatherTaskPlan.notes}
              onChange={(e) => setNewWeatherTaskPlan({ ...newWeatherTaskPlan, notes: e.target.value })}
              placeholder="Additional notes about this weather task plan"
              className="min-h-[80px]"
            />
          </div>
          <Button type="submit" className="w-full">Add Weather Task Plan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WeatherTaskPlanForm;
