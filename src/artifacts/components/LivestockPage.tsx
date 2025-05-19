import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Removed DialogTrigger
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PawPrint, Edit3, Trash2 } from 'lucide-react';
import { Farm } from '../types'; // Assuming Farm type is in types.ts or default.tsx

// Define Livestock types locally or import if they become global
export type LivestockType = 'Cattle' | 'Sheep' | 'Poultry' | 'Pigs' | 'Goats' | 'Other';
export const livestockTypes: LivestockType[] = ['Cattle', 'Sheep', 'Poultry', 'Pigs', 'Goats', 'Other'];

export interface Livestock {
  id: string;
  farmId: number;
  type: LivestockType;
  breed?: string;
  count: number;
  notes?: string;
  addedDate: string;
}

interface LivestockPageProps {
  livestockList: Livestock[];
  farms: Farm[];
  onAddLivestock: (livestock: Omit<Livestock, 'id' | 'addedDate'>) => void;
  onEditLivestock: (livestock: Livestock) => void;
  onDeleteLivestock: (livestockId: string) => void;
}

const LivestockPage: React.FC<LivestockPageProps> = ({
  livestockList,
  farms,
  onAddLivestock,
  onEditLivestock,
  onDeleteLivestock,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLivestock, setCurrentLivestock] = useState<Omit<Livestock, 'id' | 'addedDate'>>({
    farmId: farms[0]?.id || 0,
    type: 'Cattle',
    breed: '',
    count: 1,
    notes: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpenDialog = (livestockItem?: Livestock) => {
    if (livestockItem) {
      setIsEditing(true);
      setEditingId(livestockItem.id);
      setCurrentLivestock({
        farmId: livestockItem.farmId,
        type: livestockItem.type,
        breed: livestockItem.breed || '',
        count: livestockItem.count,
        notes: livestockItem.notes || '',
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setCurrentLivestock({
        farmId: farms[0]?.id || 0,
        type: 'Cattle',
        breed: '',
        count: 1,
        notes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLivestock.farmId && farms.length > 0) {
        alert("Please select a farm.");
        return;
    }
    if (isEditing && editingId) {
      onEditLivestock({ ...currentLivestock, id: editingId, addedDate: livestockList.find(l=>l.id === editingId)?.addedDate || new Date().toISOString().split('T')[0] });
    } else {
      onAddLivestock(currentLivestock);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Livestock Management</h2>
        <Button onClick={() => handleOpenDialog()}>
          <PawPrint className="h-4 w-4 mr-2" /> Add Livestock
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit' : 'Add'} Livestock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="livestockFarm">Farm</Label>
              <select
                id="livestockFarm"
                value={currentLivestock.farmId}
                onChange={(e) => setCurrentLivestock({ ...currentLivestock, farmId: parseInt(e.target.value) })}
                required
                className="w-full p-2 border rounded mt-1"
                disabled={farms.length === 0}
              >
                <option value="">{farms.length === 0 ? "No farms available" : "Select Farm"}</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="livestockType">Type</Label>
              <select
                id="livestockType"
                value={currentLivestock.type}
                onChange={(e) => setCurrentLivestock({ ...currentLivestock, type: e.target.value as LivestockType })}
                required
                className="w-full p-2 border rounded mt-1"
              >
                {livestockTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="livestockBreed">Breed (Optional)</Label>
              <Input
                id="livestockBreed"
                value={currentLivestock.breed}
                onChange={(e) => setCurrentLivestock({ ...currentLivestock, breed: e.target.value })}
                className="border rounded px-2 py-1 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="livestockCount">Count</Label>
              <Input
                id="livestockCount"
                type="number"
                min="1"
                value={currentLivestock.count}
                onChange={(e) => setCurrentLivestock({ ...currentLivestock, count: parseInt(e.target.value) || 1 })}
                required
                className="border rounded px-2 py-1 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="livestockNotes">Notes (Optional)</Label>
              <Input
                id="livestockNotes"
                value={currentLivestock.notes}
                onChange={(e) => setCurrentLivestock({ ...currentLivestock, notes: e.target.value })}
                className="border rounded px-2 py-1 mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={farms.length === 0 && !isEditing}>
              {isEditing ? 'Save Changes' : 'Add Livestock'}
            </Button>
            {farms.length === 0 && !isEditing && <p className="text-red-500 text-sm text-center">Please add a farm first before adding livestock.</p>}
          </form>
        </DialogContent>
      </Dialog>

      {livestockList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {livestockList.map(item => {
            const farm = farms.find(f => f.id === item.farmId);
            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.type} ({item.count})</span>
                    <PawPrint className="h-5 w-5 text-gray-400" />
                  </CardTitle>
                  <p className="text-sm text-gray-500">{item.breed || 'N/A Breed'}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Farm: {farm ? farm.name : 'Unknown Farm'}</p>
                  <p className="text-sm">Added: {new Date(item.addedDate).toLocaleDateString()}</p>
                  {item.notes && <p className="text-sm mt-1 italic">Notes: {item.notes}</p>}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteLivestock(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg border-dashed">
          <PawPrint className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No livestock recorded yet.</p>
          <p className="text-sm text-gray-400">Click "Add Livestock" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default LivestockPage;
