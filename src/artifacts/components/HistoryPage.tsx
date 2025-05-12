import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Droplet, Leaf, LayoutDashboard, RotateCw, Edit3, Trash2 } from 'lucide-react';
import { Farm, WaterUsage, AnyHistoryEntry, ConfirmDelete } from '../types';

interface HistoryPageProps {
  farms: Farm[];
  setConfirmDelete: (confirm: ConfirmDelete | null) => void;
  isEditingWaterUsage: boolean;
  setIsEditingWaterUsage: (isEditing: boolean) => void;
  editingWaterUsage: WaterUsage | null;
  setEditingWaterUsage: (usage: WaterUsage | null) => void;
  newWaterUsage: { farmId: string; amount: string; date: string };
  setNewWaterUsage: (usage: { farmId: string; amount: string; date: string }) => void;
  handleEditWaterUsage: (e: React.FormEvent) => void;
  isEditingFertilizer: boolean;
  setIsEditingFertilizer: (isEditing: boolean) => void;
  editingFertilizer: any | null;
  setEditingFertilizer: (fertilizer: any | null) => void;
  newFertilizer: { farmId: string; type: string; amount: string; date: string };
  setNewFertilizer: (fertilizer: { farmId: string; type: string; amount: string; date: string }) => void;
  handleEditFertilizer: (e: React.FormEvent) => void;
  isEditingHarvest: boolean;
  setIsEditingHarvest: (isEditing: boolean) => void;
  editingHarvest: any | null;
  setEditingHarvest: (harvest: any | null) => void;
  newHarvest: { farmId: string; amount: string; date: string };
  setNewHarvest: (harvest: { farmId: string; amount: string; date: string }) => void;
  handleEditHarvest: (e: React.FormEvent) => void;
  isAddingRotation: boolean; 
  setIsAddingRotation: (isAdding: boolean) => void;
  newRotation: { farmId: string; crop: string; startDate: string; endDate: string };
  setNewRotation: (rotation: { farmId: string; crop: string; startDate: string; endDate: string }) => void;
  handleAddRotation: (e: React.FormEvent) => void;
  setIsAddingWaterUsage: (isAdding: boolean) => void;
  setIsAddingFertilizer: (isAdding: boolean) => void;
  setIsAddingHarvest: (isAdding: boolean) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({
  farms,
  setConfirmDelete,
  isEditingWaterUsage,
  setIsEditingWaterUsage,
  setEditingWaterUsage,
  newWaterUsage,
  setNewWaterUsage,
  handleEditWaterUsage,
  isEditingFertilizer,
  setIsEditingFertilizer,
  setEditingFertilizer,
  newFertilizer,
  setNewFertilizer,
  handleEditFertilizer,
  isEditingHarvest,
  setIsEditingHarvest,
  setEditingHarvest,
  newHarvest,
  setNewHarvest,
  handleEditHarvest,
  isAddingRotation,
  setIsAddingRotation,
  newRotation,
  setNewRotation,
  handleAddRotation,
  setIsAddingWaterUsage,
  setIsAddingFertilizer,
  setIsAddingHarvest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all');

  const allHistory = useMemo(() => {
    const history: AnyHistoryEntry[] = farms.flatMap(farm => [
      ...farm.waterHistory.map(usage => ({
        type: 'Water Usage' as const,
        date: new Date(usage.date),
        farm: farm.name,
        amount: `${usage.amount} gallons`,
        icon: <Droplet className="h-4 w-4 text-blue-500" />,
        color: 'blue',
        farmId: farm.id,
        usage
      })),
      ...farm.fertilizerHistory.map(fertilizer => ({
        type: 'Fertilizer Usage' as const,
        date: new Date(fertilizer.date),
        farm: farm.name,
        amount: `${fertilizer.amount} lbs`,
        icon: <Leaf className="h-4 w-4 text-green-500" />,
        color: 'green',
        farmId: farm.id,
        fertilizer
      })),
      ...farm.harvestHistory.map(harvest => ({
        type: 'Harvest' as const,
        date: new Date(harvest.date),
        farm: farm.name,
        amount: `${harvest.amount} bushels`,
        icon: <LayoutDashboard className="h-4 w-4 text-purple-500" />,
        color: 'purple',
        farmId: farm.id,
        harvest
      })),
      ...(farm.rotationHistory || []).map(rotation => ({
        type: 'Crop Rotation' as const,
        date: new Date(rotation.startDate),
        endDate: new Date(rotation.endDate),
        farm: farm.name,
        crop: rotation.crop,
        icon: <RotateCw className="h-4 w-4 text-orange-500" />,
        color: 'orange',
        farmId: farm.id,
        rotation
      }))
    ]);
    return history.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [farms]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return allHistory;
    return allHistory.filter(entry => {
      switch (searchBy) {
        case 'farm':
          return entry.farm.toLowerCase().includes(searchTerm.toLowerCase());
        case 'type':
          return entry.type.toLowerCase().includes(searchTerm.toLowerCase());
        case 'amount':
          return entry.amount?.toLowerCase().includes(searchTerm.toLowerCase());
        case 'date':
          return entry.date.toLocaleDateString().includes(searchTerm);
        case 'crop':
          return entry.crop?.toLowerCase().includes(searchTerm.toLowerCase());
        default:
          return (
            entry.farm.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.amount && entry.amount.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (entry.crop && entry.crop.toLowerCase().includes(searchTerm.toLowerCase())) ||
            entry.date.toLocaleDateString().includes(searchTerm)
          );
      }
    });
  }, [searchTerm, searchBy, allHistory]);

  const handleEditHistory = (entry: AnyHistoryEntry) => {
    switch (entry.type) {
      case 'Water Usage':
        setEditingWaterUsage(entry.usage!);
        setNewWaterUsage({ farmId: entry.farmId.toString(), amount: entry.usage!.amount.toString(), date: entry.usage!.date });
        setIsEditingWaterUsage(true);
        setIsAddingWaterUsage(true); // Open the main dialog for editing
        break;
      case 'Fertilizer Usage':
        setEditingFertilizer(entry.fertilizer!);
        setNewFertilizer({ farmId: entry.farmId.toString(), type: entry.fertilizer!.type, amount: entry.fertilizer!.amount.toString(), date: entry.fertilizer!.date });
        setIsEditingFertilizer(true);
        setIsAddingFertilizer(true); // Open the main dialog for editing
        break;
      case 'Harvest':
        setEditingHarvest(entry.harvest!);
        setNewHarvest({ farmId: entry.farmId.toString(), amount: entry.harvest!.amount.toString(), date: entry.harvest!.date });
        setIsEditingHarvest(true);
        setIsAddingHarvest(true); // Open the main dialog for editing
        break;
      case 'Crop Rotation':
        setNewRotation({
          farmId: entry.farmId.toString(),
          crop: entry.rotation!.crop,
          startDate: new Date(entry.rotation!.startDate).toISOString().split('T')[0],
          endDate: new Date(entry.rotation!.endDate).toISOString().split('T')[0]
        });
        setIsAddingRotation(true); // Open the main dialog for editing rotation
        break;
      default:
        break;
    }
  };

  const handleDeleteHistory = (entry: AnyHistoryEntry) => {
    switch (entry.type) {
      case 'Water Usage':
        setConfirmDelete({ id: entry.farmId, type: 'waterUsage', date: entry.usage!.date });
        break;
      case 'Fertilizer Usage':
        setConfirmDelete({ id: entry.farmId, type: 'fertilizer', date: entry.fertilizer!.date });
        break;
      case 'Harvest':
        setConfirmDelete({ id: entry.farmId, type: 'harvest', date: entry.harvest!.date });
        break;
      case 'Crop Rotation':
        setConfirmDelete({ 
          id: entry.farmId, 
          type: 'rotation', 
          date: entry.rotation!.startDate 
        });
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 border rounded px-2 py-1"
            />
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              className="border rounded px-2 py-1 mb-4 h-[38px]"
            >
              <option value="all">All</option>
              <option value="farm">Farm</option>
              <option value="type">Type</option>
              <option value="amount">Amount</option>
              <option value="date">Date</option>
              <option value="crop">Crop</option>
            </select>
          </div>
          {filteredHistory.map((entry, index) => (
            <div key={index} className={`p-2 border-l-4 ${
              entry.type === 'Crop Rotation' ? 'border-orange-500' : `border-${entry.color}-500`
            } rounded`}>
              <div className="flex items-center gap-2">
                {entry.icon}
                <p><strong>{entry.type}</strong></p>
              </div>
              <p><strong>Farm:</strong> {entry.farm}</p>
              <p><strong>Date:</strong> {entry.date.toLocaleDateString()}</p>
              {entry.type === 'Crop Rotation' ? (
                <>
                  <p><strong>Crop:</strong> {entry.crop}</p>
                  <p><strong>End Date:</strong> {entry.endDate?.toLocaleDateString()}</p>
                </>
              ) : (
                <p><strong>Amount:</strong> {entry.amount}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditHistory(entry)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteHistory(entry)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      {/* Dialogs for editing history items -> These should be part of the main DefaultComponent to control their open state based on which quick action dialog is open */}
      {/* Water Usage Edit Dialog */}
      <Dialog 
        open={isEditingWaterUsage} 
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingWaterUsage(false);
            setEditingWaterUsage(null);
            setNewWaterUsage({ farmId: '', amount: '', date: '' });
            setIsAddingWaterUsage(false); // Close the main dialog as well
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Water Usage</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditWaterUsage} className="space-y-4">
            <div>
              <Label>Farm</Label>
              <select 
                className="w-full p-2 border rounded"
                value={newWaterUsage.farmId}
                onChange={(e) => setNewWaterUsage({...newWaterUsage, farmId: e.target.value})}
                required
                disabled // Farm selection shouldn't change when editing a specific record
              >
                <option value="">Select Farm</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Amount (gallons)</Label>
              <Input 
                type="number"
                value={newWaterUsage.amount}
                onChange={(e) => setNewWaterUsage({...newWaterUsage, amount: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input 
                type="date"
                value={newWaterUsage.date}
                onChange={(e) => setNewWaterUsage({...newWaterUsage, date: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <Button type="submit" className="w-full">Save Water Usage</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fertilizer Edit Dialog */}
      <Dialog 
        open={isEditingFertilizer} 
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingFertilizer(false);
            setEditingFertilizer(null);
            setNewFertilizer({ farmId: '', type: '', amount: '', date: '' });
            setIsAddingFertilizer(false); // Close the main dialog as well
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fertilizer Usage</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFertilizer} className="space-y-4">
            <div>
              <Label>Farm</Label>
              <select 
                className="w-full p-2 border rounded"
                value={newFertilizer.farmId}
                onChange={(e) => setNewFertilizer({...newFertilizer, farmId: e.target.value})}
                required
                disabled
              >
                <option value="">Select Farm</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <Input 
                value={newFertilizer.type}
                onChange={(e) => setNewFertilizer({...newFertilizer, type: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <Label>Amount (lbs)</Label>
              <Input 
                type="number"
                value={newFertilizer.amount}
                onChange={(e) => setNewFertilizer({...newFertilizer, amount: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input 
                type="date"
                value={newFertilizer.date}
                onChange={(e) => setNewFertilizer({...newFertilizer, date: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <Button type="submit" className="w-full">Save Fertilizer Usage</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Harvest Edit Dialog */}
      <Dialog 
        open={isEditingHarvest} 
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingHarvest(false);
            setEditingHarvest(null);
            setNewHarvest({ farmId: '', amount: '', date: '' });
            setIsAddingHarvest(false); // Close the main dialog as well
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Harvest</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditHarvest} className="space-y-4">
            <div>
              <Label>Farm</Label>
              <select 
                className="w-full p-2 border rounded"
                value={newHarvest.farmId}
                onChange={(e) => setNewHarvest({...newHarvest, farmId: e.target.value})}
                required
                disabled
              >
                <option value="">Select Farm</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Amount (bushels)</Label>
              <Input 
                type="number"
                value={newHarvest.amount}
                onChange={(e) => setNewHarvest({...newHarvest, amount: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input 
                type="date"
                value={newHarvest.date}
                onChange={(e) => setNewHarvest({...newHarvest, date: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <Button type="submit" className="w-full">Save Harvest</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Crop Rotation Edit Dialog (using isAddingRotation state) */}
      <Dialog 
        open={isAddingRotation} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingRotation(false);
            setNewRotation({ farmId: '', crop: '', startDate: '', endDate: '' });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Crop Rotation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRotation} className="space-y-4"> {/* Assuming handleAddRotation can also handle edits if newRotation has an ID or similar logic */}
            <div>
              <Label>Farm</Label>
              <select 
                className="w-full p-2 border rounded"
                value={newRotation.farmId}
                onChange={(e) => setNewRotation({...newRotation, farmId: e.target.value})}
                required
                disabled
              >
                <option value="">Select Farm</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Crop</Label>
              <Input 
                value={newRotation.crop}
                onChange={(e) => setNewRotation({...newRotation, crop: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date"
                value={newRotation.startDate}
                onChange={(e) => setNewRotation({...newRotation, startDate: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input 
                type="date"
                value={newRotation.endDate}
                onChange={(e) => setNewRotation({...newRotation, endDate: e.target.value})}
                required
                className="border rounded px-2 py-1"
              />
            </div>
            <Button type="submit" className="w-full">Save Crop Rotation</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HistoryPage;