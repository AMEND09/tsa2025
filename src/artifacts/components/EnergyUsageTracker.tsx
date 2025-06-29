import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Zap, Plus, Trash2, Lightbulb, Pencil } from 'lucide-react';
import { FuelRecord, EnergyRecord } from '../models/sustainability';

// Internal component types (compatible with the model types)
interface EnergyRecordInternal {
  id: number;
  farmId: number;
  date: string;
  energyType: string;  // electricity, propane, natural gas, solar, etc.
  amount: number;      // quantity
  unit: string;        // kWh, gallons, therms, etc.
  cost: number;        // in dollars
  purpose: string;     // irrigation, lighting, heating, etc.
  renewable: boolean;  // whether the energy source is renewable
  notes: string;
}

interface EnergyUsageTrackerProps {
  energyRecords: EnergyRecord[];
  setEnergyRecords: React.Dispatch<React.SetStateAction<EnergyRecord[]>>;
  farms: Array<{ id: number; name: string }>;
  fuelRecords: FuelRecord[]; // To incorporate fuel usage data
}

const getUnitForEnergyType = (energyType: string) => {
  switch (energyType) {
    case 'electricity':
      return 'kWh';
    case 'propane':
    case 'diesel':
    case 'gasoline':
      return 'gallons';
    case 'natural_gas':
      return 'therms';
    case 'solar':
      return 'kWh';
    case 'wind':
      return 'kWh';
    default:
      return '';
  }
};

const EnergyUsageTracker: React.FC<EnergyUsageTrackerProps> = ({
  energyRecords,
  setEnergyRecords,
  farms,
  fuelRecords
}) => {
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [newRecord, setNewRecord] = useState<Omit<EnergyRecordInternal, 'id'>>({
    farmId: 0,
    date: new Date().toISOString().split('T')[0],
    energyType: '',
    amount: 0,
    unit: '',
    cost: 0,
    purpose: '',
    renewable: false,
    notes: ''
  });

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setEnergyRecords([
      ...energyRecords,
      {
        ...newRecord,
        id: Date.now()
      }
    ]);
    setIsAddingRecord(false);
    resetForm();
  };

  const handleEditRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecordId !== null) {
      setEnergyRecords(energyRecords.map(record => 
        record.id === editingRecordId ? { ...newRecord, id: editingRecordId } : record
      ));
      setIsEditingRecord(false);
      setEditingRecordId(null);
      resetForm();
    }
  };

  const startEditingRecord = (record: EnergyRecord) => {
    setNewRecord({
      farmId: record.farmId,
      date: record.date,
      energyType: record.energyType,
      amount: record.amount,
      unit: record.unit,
      cost: record.cost,
      purpose: record.purpose,
      renewable: record.renewable,
      notes: record.notes || ''
    });
    setEditingRecordId(record.id);
    setIsEditingRecord(true);
  };

  const resetForm = () => {
    setNewRecord({
      farmId: 0,
      date: new Date().toISOString().split('T')[0],
      energyType: '',
      amount: 0,
      unit: '',
      cost: 0,
      purpose: '',
      renewable: false,
      notes: ''
    });
  };

  const handleDeleteRecord = (id: number) => {
    setEnergyRecords(energyRecords.filter(record => record.id !== id));
  };

  const energyTypeChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const energyType = e.target.value;
    const unit = getUnitForEnergyType(energyType);
    const renewable = ['solar', 'wind', 'hydro', 'biomass'].includes(energyType);
    setNewRecord(prev => ({ ...prev, energyType, unit, renewable }));
  };

  // Calculate total energy usage by type including fuel records
  const energyUsageByType = useMemo(() => {
    // Initialize result object
    const result: Record<string, {
      total: number,
      renewable: number,
      cost: number,
      unit: string
    }> = {};

    // Process energy records
    energyRecords.forEach(record => {
      const type = record.energyType;
      if (!result[type]) {
        result[type] = {
          total: 0,
          renewable: 0,
          cost: 0,
          unit: record.unit
        };
      }
      
      result[type].total += record.amount;
      if (record.renewable) {
        result[type].renewable += record.amount;
      }
      result[type].cost += record.cost;
    });

    // Process fuel records - convert to energy equivalent
    fuelRecords.forEach(record => {
      const type = record.fuelType?.toLowerCase() || 'unknown';
      if (!result[type]) {
        result[type] = {
          total: 0,
          renewable: 0,
          cost: 0,
          unit: 'gallons'
        };
      }
      
      result[type].total += record.gallons;
      if (type === 'biodiesel' || type === 'electric') {
        result[type].renewable += record.gallons;
      }
      // We don't have cost info from fuel records
    });

    return result;
  }, [energyRecords, fuelRecords]);

  // Calculate energy metrics
  const energyMetrics = useMemo(() => {
    let totalEnergy = 0;
    let renewableEnergy = 0;
    let totalCost = 0;
    
    // Convert all energy to a common unit (kWh equivalent)
    Object.entries(energyUsageByType).forEach(([type, data]) => {
      let kWhEquivalent = 0;
      
      switch (type) {
        case 'electricity':
        case 'solar':
        case 'wind':
          kWhEquivalent = data.total; // already in kWh
          break;
        case 'propane':
          kWhEquivalent = data.total * 27.1; // 27.1 kWh per gallon
          break;
        case 'natural_gas':
          kWhEquivalent = data.total * 29.3; // 29.3 kWh per therm
          break;
        case 'diesel':
          kWhEquivalent = data.total * 40.7; // 40.7 kWh per gallon
          break;
        case 'gasoline':
          kWhEquivalent = data.total * 33.7; // 33.7 kWh per gallon
          break;
        case 'biodiesel':
          kWhEquivalent = data.total * 37.8; // 37.8 kWh per gallon
          break;
        default:
          kWhEquivalent = data.total;
      }
      
      totalEnergy += kWhEquivalent;
      
      if (['solar', 'wind', 'hydro', 'biodiesel'].includes(type)) {
        renewableEnergy += kWhEquivalent;
      }
      
      totalCost += data.cost;
    });
    
    return {
      totalEnergy,
      renewableEnergy,
      renewablePercentage: totalEnergy > 0 ? (renewableEnergy / totalEnergy) * 100 : 0,
      totalCost
    };
  }, [energyUsageByType]);

  // Prepare chart data
  const chartData = useMemo(() => {
    // Group by month
    const monthlyData: Record<string, {
      month: string;
      electricity: number;
      propane: number;
      diesel: number;
      gasoline: number;
      natural_gas: number;
      solar: number;
      wind: number;
      other: number;
      renewable: number;
      nonRenewable: number;
    }> = {};

    // Process energy records
    energyRecords.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          electricity: 0,
          propane: 0,
          diesel: 0,
          gasoline: 0,
          natural_gas: 0,
          solar: 0,
          wind: 0,
          other: 0,
          renewable: 0,
          nonRenewable: 0
        };
      }      // Track by specific type
      if (record.energyType === 'electricity' || 
          record.energyType === 'propane' || 
          record.energyType === 'diesel' || 
          record.energyType === 'gasoline' || 
          record.energyType === 'natural_gas' || 
          record.energyType === 'solar' || 
          record.energyType === 'wind') {
        monthlyData[month][record.energyType] += record.amount;
      } else {
        monthlyData[month].other += record.amount;
      }

      // Track renewable vs non-renewable
      if (record.renewable) {
        monthlyData[month].renewable += record.amount; // Convert to kWh equivalent
      } else {
        monthlyData[month].nonRenewable += record.amount; // Convert to kWh equivalent
      }
    });

    // Process fuel records
    fuelRecords.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          electricity: 0,
          propane: 0,
          diesel: 0,
          gasoline: 0,
          natural_gas: 0,
          solar: 0,
          wind: 0,
          other: 0,
          renewable: 0,
          nonRenewable: 0
        };
      }

      const type = record.fuelType?.toLowerCase() || 'unknown';
      if (type === 'diesel') {
        monthlyData[month].diesel += record.gallons;
        monthlyData[month].nonRenewable += record.gallons * 40.7; // Convert to kWh
      } else if (type === 'gasoline') {
        monthlyData[month].gasoline += record.gallons;
        monthlyData[month].nonRenewable += record.gallons * 33.7; // Convert to kWh
      } else if (type === 'biodiesel') {
        monthlyData[month].other += record.gallons;
        monthlyData[month].renewable += record.gallons * 37.8; // Convert to kWh
      } else if (type === 'electric') {
        monthlyData[month].electricity += record.gallons;
        // Assume electric equipment runs on grid electricity (not necessarily renewable)
        monthlyData[month].nonRenewable += record.gallons * 30; // Approximate kWh
      }
    });

    // Convert to array and sort by date
    return Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
  }, [energyRecords, fuelRecords]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" /> Energy Usage Tracker
          </CardTitle>
          <Button onClick={() => setIsAddingRecord(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Energy Record
          </Button>
        </CardHeader>
        <CardContent>
          {(energyRecords.length > 0 || fuelRecords.length > 0) ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Energy Usage (approx.)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(energyMetrics.totalEnergy).toLocaleString()} kWh
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Renewable Energy</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-green-600">
                      {energyMetrics.renewablePercentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {Math.round(energyMetrics.renewableEnergy).toLocaleString()} kWh
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Energy Cost</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${energyMetrics.totalCost.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="h-[300px]">
                <h3 className="text-lg font-medium mb-2">Energy Usage by Month</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(1) : value} units`} />
                    <Legend />
                    <Bar dataKey="electricity" name="Electricity" fill="#74b9ff" />
                    <Bar dataKey="propane" name="Propane" fill="#ff7675" />
                    <Bar dataKey="diesel" name="Diesel" fill="#636e72" />
                    <Bar dataKey="gasoline" name="Gasoline" fill="#fab1a0" />
                    <Bar dataKey="natural_gas" name="Natural Gas" fill="#fdcb6e" />
                    <Bar dataKey="solar" name="Solar" fill="#55efc4" />
                    <Bar dataKey="wind" name="Wind" fill="#81ecec" />
                    <Bar dataKey="other" name="Other" fill="#a29bfe" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <h3 className="text-lg font-medium mb-2">Renewable vs. Non-Renewable Energy</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(1) : value} kWh`} />
                    <Legend />
                    <Line type="monotone" dataKey="renewable" name="Renewable Energy" stroke="#55efc4" strokeWidth={2} />
                    <Line type="monotone" dataKey="nonRenewable" name="Non-Renewable Energy" stroke="#ff7675" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-medium">Energy Breakdown by Type</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(energyUsageByType).map(([type, data]) => (
                    <div key={type} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Lightbulb className={`h-5 w-5 mr-2 ${
                            ['solar', 'wind', 'hydro', 'biomass'].includes(type) ? 'text-green-500' : 'text-blue-500'
                          }`} />
                          <p className="font-medium">{type.replace('_', ' ')}</p>
                        </div>
                        <p className={`text-sm ${
                          ['solar', 'wind', 'hydro', 'biomass'].includes(type) ? 'text-green-500' : 'text-blue-500'
                        }`}>
                          {['solar', 'wind', 'hydro', 'biomass'].includes(type) ? 'Renewable' : 'Non-Renewable'}
                        </p>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-gray-500">{data.total.toFixed(1)} {data.unit}</p>
                        {data.cost > 0 && <p className="font-medium">${data.cost.toFixed(2)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Recent Energy Records</h3>
                <div className="mt-2 space-y-2 max-h-[300px] overflow-y-auto">
                  {energyRecords
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(record => (
                      <div 
                        key={record.id} 
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{record.energyType.replace('_', ' ')}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-2">{farms.find(f => f.id === record.farmId)?.name || 'Unknown Farm'}</span>
                            <span className="mr-2">•</span>
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>{record.purpose}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <p className="font-medium">{record.amount} {record.unit}</p>
                            <p className="text-sm text-gray-500">${record.cost.toFixed(2)}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => startEditingRecord(record)}
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
                    ))}
                    {energyRecords.length === 0 && (
                      <p className="text-center p-3 text-gray-500">No energy records added yet</p>
                    )}
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Energy Savings Opportunities</p>
                    <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                      {energyMetrics.renewablePercentage < 20 && (
                        <li>Consider adding renewable energy sources like solar panels</li>
                      )}
                      {Object.entries(energyUsageByType).some(([type, data]) => 
                        ['electricity', 'propane', 'natural_gas'].includes(type) && data.total > 1000
                      ) && (
                        <li>Look for ways to reduce high electricity or fuel consumption</li>
                      )}
                      <li>Implement energy-efficient equipment and practices</li>
                      <li>Schedule energy-intensive operations during off-peak hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-500">No energy usage records yet. Add your first record to start tracking.</p>
              <Button onClick={() => setIsAddingRecord(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-1" /> Add Energy Record
              </Button>
            </div>
          )}
        </CardContent>
      </Card>      <Dialog open={isAddingRecord || isEditingRecord} onOpenChange={(open) => {
        setIsAddingRecord(open);
        setIsEditingRecord(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditingRecord ? 'Edit Energy Usage Record' : 'Add Energy Usage Record'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={isEditingRecord ? handleEditRecord : handleAddRecord} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="farm">Farm</Label>
                <select
                  id="farm" 
                  className="w-full p-2 border rounded"
                  value={newRecord.farmId}
                  onChange={(e) => setNewRecord({...newRecord, farmId: Number(e.target.value)})}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="energyType">Energy Type</Label>
                <select
                  id="energyType" 
                  className="w-full p-2 border rounded"
                  value={newRecord.energyType}
                  onChange={energyTypeChanged}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="electricity">Electricity (Grid)</option>
                  <option value="propane">Propane</option>
                  <option value="natural_gas">Natural Gas</option>
                  <option value="diesel">Diesel</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="solar">Solar</option>
                  <option value="wind">Wind</option>
                  <option value="hydro">Hydro</option>
                  <option value="biomass">Biomass</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newRecord.amount || ''}
                    onChange={(e) => setNewRecord({...newRecord, amount: parseFloat(e.target.value) || 0})}
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newRecord.unit}
                    readOnly
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={newRecord.cost || ''}
                  onChange={(e) => setNewRecord({...newRecord, cost: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <select
                  id="purpose" 
                  className="w-full p-2 border rounded"
                  value={newRecord.purpose}
                  onChange={(e) => setNewRecord({...newRecord, purpose: e.target.value})}
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="lighting">Lighting</option>
                  <option value="heating">Heating</option>
                  <option value="cooling">Cooling</option>
                  <option value="processing">Crop Processing</option>
                  <option value="transportation">Transportation</option>
                  <option value="farm_equipment">Farm Equipment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  id="renewable"
                  type="checkbox"
                  checked={newRecord.renewable}
                  onChange={(e) => setNewRecord({...newRecord, renewable: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="renewable">Renewable Energy Source</Label>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  className="w-full p-2 border rounded"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">{isEditingRecord ? 'Save Changes' : 'Add Energy Record'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnergyUsageTracker;