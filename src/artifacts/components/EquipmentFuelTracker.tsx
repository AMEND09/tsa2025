import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Fuel, Plus, Trash2, Pencil } from 'lucide-react';
import { FuelRecord } from '../models/sustainability';
import { Farm } from '../types';

interface EquipmentFuelTrackerProps {
  farmId?: number;
  fuelRecords: FuelRecord[];
  setFuelRecords: React.Dispatch<React.SetStateAction<FuelRecord[]>>;
  farms: Farm[];
}

const EquipmentFuelTracker: React.FC<EquipmentFuelTrackerProps> = ({
  farmId,
  fuelRecords,
  setFuelRecords,
  farms
}) => {
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  
  const [newRecord, setNewRecord] = useState<Omit<FuelRecord, 'id'>>({
    farmId: farmId || 0,
    date: new Date().toISOString().split('T')[0],
    equipmentName: '',
    fuelType: 'Diesel',
    gallons: 0,
    hoursOperated: 0,
    cost: 0,
    notes: ''
  });

  // Reset newRecord when farmId changes
  useEffect(() => {
    if (farmId) {
      setNewRecord(prev => ({
        ...prev,
        farmId
      }));
    }
  }, [farmId]);

  const handleAddRecord = () => {
    setFuelRecords([
      ...fuelRecords,
      {
        ...newRecord,
        id: Date.now()
      }
    ]);
    setIsAddingRecord(false);
    resetForm();
  };

  const startEditingRecord = (record: FuelRecord) => {
    setEditingRecordId(record.id);
    setNewRecord({
      farmId: record.farmId,
      date: record.date,
      equipmentName: record.equipmentName,
      fuelType: record.fuelType,
      gallons: record.gallons,
      hoursOperated: record.hoursOperated,
      cost: record.cost,
      notes: record.notes || ''
    });
    setIsEditingRecord(true);
  };

  const handleEditRecord = () => {
    if (!editingRecordId) return;
    
    setFuelRecords(fuelRecords.map(record => 
      record.id === editingRecordId 
        ? { ...newRecord, id: editingRecordId } 
        : record
    ));
    
    setIsEditingRecord(false);
    setEditingRecordId(null);
    resetForm();
  };

  const handleDeleteRecord = (id: number) => {
    setFuelRecords(fuelRecords.filter(record => record.id !== id));
  };

  const resetForm = () => {
    setNewRecord({
      farmId: farmId || 0,
      date: new Date().toISOString().split('T')[0],
      equipmentName: '',
      fuelType: 'Diesel',
      gallons: 0,
      hoursOperated: 0,
      cost: 0,
      notes: ''
    });
  };

  const calculateEfficiency = (record: FuelRecord) => {
    return record.hoursOperated > 0 ? (record.gallons / record.hoursOperated).toFixed(2) : 'N/A';
  };

  // Filter records by farmId if provided
  const filteredRecords = React.useMemo(() => {
    return farmId 
      ? fuelRecords.filter(record => record.farmId === farmId)
      : fuelRecords;
  }, [farmId, fuelRecords]);

  // Group data by month for chart visualization
  const chartData = React.useMemo(() => {
    const data: { month: string; Diesel: number; Gasoline: number; Propane: number; Natural_Gas: number }[] = [];
    
    // Initialize with empty data for all months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
      data.push({
        month,
        Diesel: 0,
        Gasoline: 0,
        Propane: 0,
        Natural_Gas: 0
      });
    });
    
    // Aggregate fuel usage by month and type
    filteredRecords.forEach(record => {
      const date = new Date(record.date);
      const month = date.getMonth();
      const type = record.fuelType;
      
      if (type === 'Diesel') {
        data[month].Diesel += record.gallons;
      } else if (type === 'Gasoline') {
        data[month].Gasoline += record.gallons;
      } else if (type === 'Propane') {
        data[month].Propane += record.gallons;
      } else if (type === 'Natural Gas') {
        data[month].Natural_Gas += record.gallons;
      }
    });
    
    return data;
  }, [filteredRecords]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Fuel className="h-5 w-5" />
            <span>Equipment Fuel Tracker</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsAddingRecord(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredRecords.length > 0 ? (
          <>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Diesel" fill="#0088FE" name="Diesel" />
                  <Bar dataKey="Gasoline" fill="#00C49F" name="Gasoline" />
                  <Bar dataKey="Propane" fill="#FFBB28" name="Propane" />
                  <Bar dataKey="Natural_Gas" fill="#FF8042" name="Natural Gas" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {filteredRecords
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(record => (
                  <div key={record.id} className="p-3 border rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{record.equipmentName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString()} •{" "}
                          {record.fuelType} • {record.gallons} gallons
                        </p>
                        <p className="text-sm text-gray-600">
                          Farm: {farms.find(f => f.id === record.farmId)?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Hours: {record.hoursOperated} • Efficiency: {calculateEfficiency(record)} gal/hr
                        </p>
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            {record.notes}
                          </p>
                        )}
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingRecord(record)}
                          className="mr-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-700">Total Fuel Used</h3>
                <p className="text-2xl font-bold">
                  {filteredRecords.reduce((sum, record) => sum + record.gallons, 0).toFixed(1)} gal
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-700">Avg. Efficiency</h3>
                <p className="text-2xl font-bold">
                  {filteredRecords.filter(r => r.hoursOperated > 0).length === 0 
                    ? 'N/A' 
                    : (filteredRecords.filter(r => r.hoursOperated > 0).reduce((sum, r) => sum + (r.gallons / r.hoursOperated), 0) / filteredRecords.filter(r => r.hoursOperated > 0).length).toFixed(2)
                  } gal/hr
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-700">Total Cost</h3>
                <p className="text-2xl font-bold">
                  ${filteredRecords.reduce((sum, r) => sum + r.cost, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No fuel records yet.</p>
            <Button onClick={() => setIsAddingRecord(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Fuel Record
            </Button>
          </div>
        )}
        
        {/* Add Record Dialog */}        <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
          <DialogContent className="max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Add Fuel Record</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddRecord(); }}>
              <div>
                <Label htmlFor="farm" className="mb-1 block">Farm</Label>
                <select 
                  id="farm"
                  className="w-full p-2 border rounded"
                  value={newRecord.farmId}
                  onChange={e => setNewRecord({...newRecord, farmId: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="equipmentName">Equipment Name</Label>
                <Input
                  id="equipmentName"
                  value={newRecord.equipmentName}
                  onChange={e => setNewRecord({...newRecord, equipmentName: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <select
                  id="fuelType"
                  className="w-full p-2 border rounded"
                  value={newRecord.fuelType}
                  onChange={e => setNewRecord({...newRecord, fuelType: e.target.value})}
                  required
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Propane">Propane</option>
                  <option value="Natural Gas">Natural Gas</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="gallons">Gallons Used</Label>
                <Input
                  id="gallons"
                  type="number"
                  step="0.1"
                  value={newRecord.gallons}
                  onChange={e => setNewRecord({...newRecord, gallons: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="hoursOperated">Hours Operated</Label>
                <Input
                  id="hoursOperated"
                  type="number"
                  step="0.1"
                  value={newRecord.hoursOperated}
                  onChange={e => setNewRecord({...newRecord, hoursOperated: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={newRecord.cost}
                  onChange={e => setNewRecord({...newRecord, cost: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRecord.date}
                  onChange={e => setNewRecord({...newRecord, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newRecord.notes || ''}
                  onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
                />
              </div>
                <Button type="submit" className="w-full mt-6">Add Record</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Record Dialog */}
        <Dialog open={isEditingRecord} onOpenChange={setIsEditingRecord}>
          <DialogContent className="max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Edit Fuel Record</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEditRecord(); }}>
              <div>
                <Label htmlFor="edit-farm">Farm</Label>
                <select 
                  id="edit-farm"
                  className="w-full p-2 border rounded"
                  value={newRecord.farmId}
                  onChange={e => setNewRecord({...newRecord, farmId: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-equipmentName">Equipment Name</Label>
                <Input
                  id="edit-equipmentName"
                  value={newRecord.equipmentName}
                  onChange={e => setNewRecord({...newRecord, equipmentName: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-fuelType">Fuel Type</Label>
                <select
                  id="edit-fuelType"
                  className="w-full p-2 border rounded"
                  value={newRecord.fuelType}
                  onChange={e => setNewRecord({...newRecord, fuelType: e.target.value})}
                  required
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Propane">Propane</option>
                  <option value="Natural Gas">Natural Gas</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-gallons">Gallons Used</Label>
                <Input
                  id="edit-gallons"
                  type="number"
                  step="0.1"
                  value={newRecord.gallons}
                  onChange={e => setNewRecord({...newRecord, gallons: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-hoursOperated">Hours Operated</Label>
                <Input
                  id="edit-hoursOperated"
                  type="number"
                  step="0.1"
                  value={newRecord.hoursOperated}
                  onChange={e => setNewRecord({...newRecord, hoursOperated: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-cost">Cost ($)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  step="0.01"
                  value={newRecord.cost}
                  onChange={e => setNewRecord({...newRecord, cost: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={newRecord.date}
                  onChange={e => setNewRecord({...newRecord, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={newRecord.notes || ''}
                  onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
                />
              </div>
              
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export { EquipmentFuelTracker };
export default EquipmentFuelTracker;