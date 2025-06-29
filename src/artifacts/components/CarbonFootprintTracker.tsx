import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, PieChart, Pie, Cell } from 'recharts';
import { Leaf, Plus, Trash2, Pencil } from 'lucide-react';
import { CarbonEmissionSource, CarbonSequestrationActivity, FuelRecord } from '../models/sustainability';
import { Farm } from '../types';

interface CarbonFootprintTrackerProps {
  farmId?: number;
  emissionSources: CarbonEmissionSource[];
  setEmissionSources: React.Dispatch<React.SetStateAction<CarbonEmissionSource[]>>;
  sequestrationActivities: CarbonSequestrationActivity[];
  setSequestrationActivities: React.Dispatch<React.SetStateAction<CarbonSequestrationActivity[]>>;
  farms: Farm[];
  fuelRecords?: FuelRecord[];
}

const CarbonFootprintTracker: React.FC<CarbonFootprintTrackerProps> = ({
  farmId,
  emissionSources,
  setEmissionSources,
  sequestrationActivities,
  setSequestrationActivities,
  farms
}) => {
  const [isAddingEmission, setIsAddingEmission] = useState(false);
  const [isAddingSequestration, setIsAddingSequestration] = useState(false);
  const [isEditingEmission, setIsEditingEmission] = useState(false);
  const [isEditingSequestration, setIsEditingSequestration] = useState(false);
  const [editingEmissionId, setEditingEmissionId] = useState<number | null>(null);
  const [editingSequestrationId, setEditingSequestrationId] = useState<number | null>(null);
  
  const [newEmission, setNewEmission] = useState<Omit<CarbonEmissionSource, 'id'>>({
    farmId: farmId || 0,
    date: new Date().toISOString().split('T')[0],
    sourceType: 'Fuel Usage',
    description: '',
    co2Equivalent: 0,
    notes: ''
  });
  
  const [newSequestration, setNewSequestration] = useState<Omit<CarbonSequestrationActivity, 'id'>>({
    farmId: farmId || 0,
    date: new Date().toISOString().split('T')[0],
    activityType: 'Cover Crops',
    description: '',
    co2Sequestered: 0,
    area: 0,
    notes: ''
  });

  // Reset form states when farmId changes
  useEffect(() => {
    if (farmId) {
      setNewEmission(prev => ({ ...prev, farmId }));
      setNewSequestration(prev => ({ ...prev, farmId }));
    }
  }, [farmId]);

  // Filter records by farmId if provided
  const filteredEmissions = React.useMemo(() => 
    farmId ? emissionSources.filter(e => e.farmId === farmId) : emissionSources,
  [farmId, emissionSources]);
  
  const filteredSequestrations = React.useMemo(() => 
    farmId ? sequestrationActivities.filter(s => s.farmId === farmId) : sequestrationActivities,
  [farmId, sequestrationActivities]);

  // Calculate net carbon footprint
  const totalEmissions = filteredEmissions.reduce((sum, source) => sum + source.co2Equivalent, 0);
  const totalSequestration = filteredSequestrations.reduce((sum, activity) => sum + activity.co2Sequestered, 0);
  const netCarbonFootprint = totalEmissions - totalSequestration;

  // Emission functions
  const handleAddEmission = () => {
    setEmissionSources([...emissionSources, { ...newEmission, id: Date.now() }]);
    setIsAddingEmission(false);
    resetEmissionForm();
  };

  const startEditingEmission = (emission: CarbonEmissionSource) => {
    setEditingEmissionId(emission.id);
    setNewEmission({
      farmId: emission.farmId,
      date: emission.date,
      sourceType: emission.sourceType,
      description: emission.description,
      co2Equivalent: emission.co2Equivalent,
      notes: emission.notes || ''
    });
    setIsEditingEmission(true);
  };

  const handleEditEmission = () => {
    if (!editingEmissionId) return;
    
    setEmissionSources(emissionSources.map(source => 
      source.id === editingEmissionId 
        ? { ...newEmission, id: editingEmissionId } 
        : source
    ));
    
    setIsEditingEmission(false);
    setEditingEmissionId(null);
    resetEmissionForm();
  };

  const handleDeleteEmission = (id: number) => {
    setEmissionSources(emissionSources.filter(source => source.id !== id));
  };

  const resetEmissionForm = () => {
    setNewEmission({
      farmId: farmId || 0,
      date: new Date().toISOString().split('T')[0],
      sourceType: 'Fuel Usage',
      description: '',
      co2Equivalent: 0,
      notes: ''
    });
  };

  // Sequestration functions
  const handleAddSequestration = () => {
    setSequestrationActivities([...sequestrationActivities, { ...newSequestration, id: Date.now() }]);
    setIsAddingSequestration(false);
    resetSequestrationForm();
  };

  const startEditingSequestration = (activity: CarbonSequestrationActivity) => {
    setEditingSequestrationId(activity.id);
    setNewSequestration({
      farmId: activity.farmId,
      date: activity.date,
      activityType: activity.activityType,
      description: activity.description,
      co2Sequestered: activity.co2Sequestered,
      area: activity.area,
      notes: activity.notes || ''
    });
    setIsEditingSequestration(true);
  };

  const handleEditSequestration = () => {
    if (!editingSequestrationId) return;
    
    setSequestrationActivities(sequestrationActivities.map(activity => 
      activity.id === editingSequestrationId 
        ? { ...newSequestration, id: editingSequestrationId } 
        : activity
    ));
    
    setIsEditingSequestration(false);
    setEditingSequestrationId(null);
    resetSequestrationForm();
  };

  const handleDeleteSequestration = (id: number) => {
    setSequestrationActivities(sequestrationActivities.filter(activity => activity.id !== id));
  };

  const resetSequestrationForm = () => {
    setNewSequestration({
      farmId: farmId || 0,
      date: new Date().toISOString().split('T')[0],
      activityType: 'Cover Crops',
      description: '',
      co2Sequestered: 0,
      area: 0,
      notes: ''
    });
  };

  // Prepare chart data
  const pieData = [
    { name: 'Carbon Emissions', value: totalEmissions, color: '#ff6b6b' },
    { name: 'Carbon Sequestration', value: totalSequestration, color: '#51cf66' }
  ];

  // Prepare monthly chart data
  const getChartData = () => {
    const data: { month: string; emissions: number; sequestration: number }[] = [];
    
    // Initialize with empty data for all months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
      data.push({
        month,
        emissions: 0,
        sequestration: 0
      });
    });
    
    // Aggregate by month
    filteredEmissions.forEach(source => {
      const date = new Date(source.date);
      const month = date.getMonth();
      if (data[month]) { // Safety check
        data[month].emissions += source.co2Equivalent;
      }
    });
    
    filteredSequestrations.forEach(activity => {
      const date = new Date(activity.date);
      const month = date.getMonth();
      if (data[month]) { // Safety check
        data[month].sequestration += activity.co2Sequestered;
      }
    });
    
    return data;
  };

  const chartData = React.useMemo(() => getChartData(), [filteredEmissions, filteredSequestrations]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Leaf className="h-5 w-5" />
            <span>Carbon Footprint Tracker</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${netCarbonFootprint > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <h3 className={`font-medium ${netCarbonFootprint > 0 ? 'text-red-700' : 'text-green-700'}`}>Net Carbon Footprint</h3>
            <p className="text-2xl font-bold">
              {netCarbonFootprint.toFixed(2)} tons CO2e
            </p>
            <p className="text-sm mt-1">
              {netCarbonFootprint > 0 
                ? 'Your farm is emitting more carbon than it sequesters.' 
                : 'Your farm is carbon negative - great job!'}
            </p>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-medium text-red-700">Total Emissions</h3>
            <p className="text-2xl font-bold">
              {totalEmissions.toFixed(2)} tons CO2e
            </p>
            <div className="mt-2 flex justify-between">
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setIsAddingEmission(true)}>
                <Plus className="h-3 w-3 mr-1" /> Add Emission
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-700">Total Sequestration</h3>
            <p className="text-2xl font-bold">
              {totalSequestration.toFixed(2)} tons CO2e
            </p>
            <div className="mt-2 flex justify-between">
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setIsAddingSequestration(true)}>
                <Plus className="h-3 w-3 mr-1" /> Add Sequestration
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Carbon Balance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => typeof value === 'number' ? `${value.toFixed(2)} tons CO2e` : value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Monthly Carbon Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => typeof value === 'number' ? `${value.toFixed(2)} tons CO2e` : value} />
                <Legend />
                <Bar dataKey="emissions" fill="#ff6b6b" name="Emissions" />
                <Bar dataKey="sequestration" fill="#51cf66" name="Sequestration" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Emission Sources</h3>
              <Button size="sm" variant="outline" onClick={() => setIsAddingEmission(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Source
              </Button>
            </div>
            
            {filteredEmissions.length > 0 ? (
              <div className="space-y-3">
                {filteredEmissions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(source => (
                    <div key={source.id} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{source.sourceType}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(source.date).toLocaleDateString()} • {source.co2Equivalent.toFixed(2)} tons CO2e
                          </p>
                          <p className="text-sm text-gray-600">
                            Farm: {farms.find(f => f.id === source.farmId)?.name}
                          </p>
                          <p className="text-sm text-gray-600">{source.description}</p>
                          {source.notes && (
                            <p className="text-sm text-gray-500 mt-1 italic">{source.notes}</p>
                          )}
                        </div>              <div className="flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditingEmission(source)}
                  className="mr-1"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEmission(source.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-md">
                <p className="text-gray-500">No emission sources recorded yet.</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Sequestration Activities</h3>
              <Button size="sm" variant="outline" onClick={() => setIsAddingSequestration(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Activity
              </Button>
            </div>
            
            {filteredSequestrations.length > 0 ? (
              <div className="space-y-3">
                {filteredSequestrations
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(activity => (
                    <div key={activity.id} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{activity.activityType}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(activity.date).toLocaleDateString()} • {activity.co2Sequestered.toFixed(2)} tons CO2e
                          </p>
                          <p className="text-sm text-gray-600">
                            Farm: {farms.find(f => f.id === activity.farmId)?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Area: {activity.area} acres • {activity.description}
                          </p>
                          {activity.notes && (
                            <p className="text-sm text-gray-500 mt-1 italic">{activity.notes}</p>
                          )}
                        </div>              <div className="flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditingSequestration(activity)}
                  className="mr-1"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSequestration(activity.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-md">
                <p className="text-gray-500">No sequestration activities recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Emission Dialog */}
        <Dialog open={isAddingEmission} onOpenChange={setIsAddingEmission}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Carbon Emission Source</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddEmission(); }}>
              <div>
                <Label htmlFor="emission-farm">Farm</Label>
                <select 
                  id="emission-farm"
                  className="w-full p-2 border rounded"
                  value={newEmission.farmId}
                  onChange={e => setNewEmission({...newEmission, farmId: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="sourceType">Source Type</Label>
                <select
                  id="sourceType"
                  className="w-full p-2 border rounded"
                  value={newEmission.sourceType}
                  onChange={e => setNewEmission({...newEmission, sourceType: e.target.value})}
                  required
                >
                  <option value="Fuel Usage">Fuel Usage</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="co2Equivalent">CO2 Equivalent (tons)</Label>
                <Input
                  id="co2Equivalent"
                  type="number"
                  step="0.01"
                  value={newEmission.co2Equivalent}
                  onChange={e => setNewEmission({...newEmission, co2Equivalent: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="emission-description">Description</Label>
                <Textarea
                  id="emission-description"
                  value={newEmission.description}
                  onChange={e => setNewEmission({...newEmission, description: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="emission-date">Date</Label>
                <Input
                  id="emission-date"
                  type="date"
                  value={newEmission.date}
                  onChange={e => setNewEmission({...newEmission, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="emission-notes">Notes</Label>
                <Textarea
                  id="emission-notes"
                  value={newEmission.notes || ''}
                  onChange={e => setNewEmission({...newEmission, notes: e.target.value})}
                />
              </div>
              
              <Button type="submit" className="w-full">Add Emission Source</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Emission Dialog */}
        <Dialog open={isEditingEmission} onOpenChange={setIsEditingEmission}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Carbon Emission Source</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEditEmission(); }}>
              <div>
                <Label htmlFor="edit-emission-farm">Farm</Label>
                <select 
                  id="edit-emission-farm"
                  className="w-full p-2 border rounded"
                  value={newEmission.farmId}
                  onChange={e => setNewEmission({...newEmission, farmId: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-sourceType">Source Type</Label>
                <select
                  id="edit-sourceType"
                  className="w-full p-2 border rounded"
                  value={newEmission.sourceType}
                  onChange={e => setNewEmission({...newEmission, sourceType: e.target.value})}
                  required
                >
                  <option value="Fuel Usage">Fuel Usage</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-co2Equivalent">CO2 Equivalent (tons)</Label>
                <Input
                  id="edit-co2Equivalent"
                  type="number"
                  step="0.01"
                  value={newEmission.co2Equivalent}
                  onChange={e => setNewEmission({...newEmission, co2Equivalent: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-emission-description">Description</Label>
                <Textarea
                  id="edit-emission-description"
                  value={newEmission.description}
                  onChange={e => setNewEmission({...newEmission, description: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-emission-date">Date</Label>
                <Input
                  id="edit-emission-date"
                  type="date"
                  value={newEmission.date}
                  onChange={e => setNewEmission({...newEmission, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-emission-notes">Notes</Label>
                <Textarea
                  id="edit-emission-notes"
                  value={newEmission.notes || ''}
                  onChange={e => setNewEmission({...newEmission, notes: e.target.value})}
                />
              </div>
              
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Sequestration Dialog */}
        <Dialog open={isAddingSequestration} onOpenChange={setIsAddingSequestration}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Carbon Sequestration Activity</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddSequestration(); }}>
              <div>
                <Label htmlFor="sequestration-farm">Farm</Label>
                <select 
                  id="sequestration-farm"
                  className="w-full p-2 border rounded"
                  value={newSequestration.farmId}
                  onChange={e => setNewSequestration({...newSequestration, farmId: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="activityType">Activity Type</Label>
                <select
                  id="activityType"
                  className="w-full p-2 border rounded"
                  value={newSequestration.activityType}
                  onChange={e => setNewSequestration({...newSequestration, activityType: e.target.value})}
                  required
                >
                  <option value="Cover Crops">Cover Crops</option>
                  <option value="No-Till Farming">No-Till Farming</option>
                  <option value="Reforestation">Reforestation</option>
                  <option value="Agroforestry">Agroforestry</option>
                  <option value="Biochar Application">Biochar Application</option>
                  <option value="Rotational Grazing">Rotational Grazing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="co2Sequestered">CO2 Sequestered (tons)</Label>
                <Input
                  id="co2Sequestered"
                  type="number"
                  step="0.01"
                  value={newSequestration.co2Sequestered}
                  onChange={e => setNewSequestration({...newSequestration, co2Sequestered: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="area">Area (acres)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  value={newSequestration.area}
                  onChange={e => setNewSequestration({...newSequestration, area: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="sequestration-description">Description</Label>
                <Textarea
                  id="sequestration-description"
                  value={newSequestration.description}
                  onChange={e => setNewSequestration({...newSequestration, description: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="sequestration-date">Date</Label>
                <Input
                  id="sequestration-date"
                  type="date"
                  value={newSequestration.date}
                  onChange={e => setNewSequestration({...newSequestration, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="sequestration-notes">Notes</Label>
                <Textarea
                  id="sequestration-notes"
                  value={newSequestration.notes || ''}
                  onChange={e => setNewSequestration({...newSequestration, notes: e.target.value})}
                />
              </div>
              
              <Button type="submit" className="w-full">Add Sequestration Activity</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Sequestration Dialog */}
        <Dialog open={isEditingSequestration} onOpenChange={setIsEditingSequestration}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Carbon Sequestration Activity</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEditSequestration(); }}>
              <div>
                <Label htmlFor="edit-sequestration-farm">Farm</Label>
                <select 
                  id="edit-sequestration-farm"
                  className="w-full p-2 border rounded"
                  value={newSequestration.farmId}
                  onChange={e => setNewSequestration({...newSequestration, farmId: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Select Farm</option>
                  {farms.map(farm => (
                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-activityType">Activity Type</Label>
                <select
                  id="edit-activityType"
                  className="w-full p-2 border rounded"
                  value={newSequestration.activityType}
                  onChange={e => setNewSequestration({...newSequestration, activityType: e.target.value})}
                  required
                >
                  <option value="Cover Crops">Cover Crops</option>
                  <option value="No-Till Farming">No-Till Farming</option>
                  <option value="Reforestation">Reforestation</option>
                  <option value="Agroforestry">Agroforestry</option>
                  <option value="Biochar Application">Biochar Application</option>
                  <option value="Rotational Grazing">Rotational Grazing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-co2Sequestered">CO2 Sequestered (tons)</Label>
                <Input
                  id="edit-co2Sequestered"
                  type="number"
                  step="0.01"
                  value={newSequestration.co2Sequestered}
                  onChange={e => setNewSequestration({...newSequestration, co2Sequestered: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-area">Area (acres)</Label>
                <Input
                  id="edit-area"
                  type="number"
                  step="0.1"
                  value={newSequestration.area}
                  onChange={e => setNewSequestration({...newSequestration, area: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-sequestration-description">Description</Label>
                <Textarea
                  id="edit-sequestration-description"
                  value={newSequestration.description}
                  onChange={e => setNewSequestration({...newSequestration, description: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-sequestration-date">Date</Label>
                <Input
                  id="edit-sequestration-date"
                  type="date"
                  value={newSequestration.date}
                  onChange={e => setNewSequestration({...newSequestration, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-sequestration-notes">Notes</Label>
                <Textarea
                  id="edit-sequestration-notes"
                  value={newSequestration.notes || ''}
                  onChange={e => setNewSequestration({...newSequestration, notes: e.target.value})}
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

export { CarbonFootprintTracker };
export default CarbonFootprintTracker;