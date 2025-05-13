import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Sprout, Plus, Trash2, AlertCircle, Pencil } from 'lucide-react';

export interface SoilRecord {
  id: number;
  farmId: number;
  date: string;
  ph: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  location: string;
  notes?: string;
  fieldSection?: string;
}

interface SoilHealthTrackerProps {
  soilRecords: SoilRecord[];
  setSoilRecords: React.Dispatch<React.SetStateAction<SoilRecord[]>>;
  farms: Array<{ id: number; name: string }>;
}

const SoilHealthTracker: React.FC<SoilHealthTrackerProps> = ({
  soilRecords,
  setSoilRecords,
  farms
}) => {
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [newRecord, setNewRecord] = useState<Omit<SoilRecord, 'id'>>({
    farmId: 0,
    date: new Date().toISOString().split('T')[0],
    ph: 7.0,
    organicMatter: 3.0,
    nitrogen: 10,
    phosphorus: 10,
    potassium: 10,
    moisture: 25,
    location: '',
    notes: '',
    fieldSection: ''
  });

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setSoilRecords([
      ...soilRecords,
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
      setSoilRecords(soilRecords.map(record => 
        record.id === editingRecordId ? { ...newRecord, id: editingRecordId } : record
      ));
      setIsEditingRecord(false);
      setEditingRecordId(null);
      resetForm();
    }
  };

  const startEditingRecord = (record: SoilRecord) => {
    setNewRecord({
      farmId: record.farmId,
      date: record.date,
      ph: record.ph,
      organicMatter: record.organicMatter,
      nitrogen: record.nitrogen,
      phosphorus: record.phosphorus,
      potassium: record.potassium,
      moisture: record.moisture,
      location: record.location,
      notes: record.notes || '',
      fieldSection: record.fieldSection || ''
    });
    setEditingRecordId(record.id);
    setIsEditingRecord(true);
  };

  const resetForm = () => {
    setNewRecord({
      farmId: 0,
      date: new Date().toISOString().split('T')[0],
      ph: 7.0,
      organicMatter: 3.0,
      nitrogen: 10,
      phosphorus: 10,
      potassium: 10,
      moisture: 25,
      location: '',
      notes: '',
      fieldSection: ''
    });
  };

  const handleDeleteRecord = (id: number) => {
    setSoilRecords(soilRecords.filter(record => record.id !== id));
  };

  // Group soil records by farm
  const soilRecordsByFarm = soilRecords.reduce((acc, record) => {
    const farmId = record.farmId;
    if (!acc[farmId]) acc[farmId] = [];
    acc[farmId].push(record);
    return acc;
  }, {} as Record<number, SoilRecord[]>);

  // Generate data for line chart
  const getLineChartData = () => {
    const farmId = parseInt(Object.keys(soilRecordsByFarm)[0] || '0');
    const records = soilRecordsByFarm[farmId] || [];
    return records
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(record => ({
        date: new Date(record.date).toLocaleDateString(),
        ph: record.ph,
        organicMatter: record.organicMatter,
        nitrogen: record.nitrogen,
        phosphorus: record.phosphorus,
        potassium: record.potassium,
        moisture: record.moisture
      }));
  };

  // Create radar chart data for the most recent soil test for each farm
  const getRadarData = () => {
    const validFarms = farms.map(farm => {
      const farmRecords = soilRecordsByFarm[farm.id] || [];
      if (farmRecords.length === 0) return null;
      
      // Get the most recent record
      const latestRecord = farmRecords.reduce((latest, record) => {
        return new Date(record.date) > new Date(latest.date) ? record : latest;
      }, farmRecords[0]);
      
      // Format data for radar chart
      return {
        farmName: farm.name,
        // Normalize values to 0-100 scale for radar chart
        ph: ((latestRecord.ph - 4) / 10) * 100, // Assuming pH range 4-14
        organicMatter: (latestRecord.organicMatter / 10) * 100, // Assuming target is around 5-10%
        nitrogen: latestRecord.nitrogen,
        phosphorus: latestRecord.phosphorus,
        potassium: latestRecord.potassium,
        moisture: latestRecord.moisture
      };
    }).filter((farm): farm is NonNullable<typeof farm> => farm !== null);
    
    // Return array of valid farm data
    return validFarms.length > 0 ? [validFarms[0]] : [];
  };

  // Get soil health quality assessment
  const getSoilQualityAssessment = () => {
    if (soilRecords.length === 0) return { score: 0, issues: [] };

    let totalScore = 0;
    const issues: string[] = [];

    // Calculate average values across all recent records (last 3 months)
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 3);

    const recentRecords = soilRecords.filter(record => 
      new Date(record.date) >= recentDate
    );

    if (recentRecords.length === 0) return { score: 0, issues: ['No recent soil tests'] };

    // pH assessment (ideal range 6.0-7.5)
    const avgPh = recentRecords.reduce((sum, r) => sum + r.ph, 0) / recentRecords.length;
    if (avgPh < 5.5) {
      issues.push('Soil pH is too acidic');
      totalScore += 10;
    } else if (avgPh > 8.0) {
      issues.push('Soil pH is too alkaline');
      totalScore += 10;
    } else if (avgPh >= 6.0 && avgPh <= 7.5) {
      totalScore += 25;
    } else {
      totalScore += 15;
    }

    // Organic matter assessment (ideal >3%)
    const avgOrganicMatter = recentRecords.reduce((sum, r) => sum + r.organicMatter, 0) / recentRecords.length;
    if (avgOrganicMatter < 2.0) {
      issues.push('Low organic matter content');
      totalScore += 5;
    } else if (avgOrganicMatter >= 5.0) {
      totalScore += 25;
    } else {
      totalScore += avgOrganicMatter * 5;
    }

    // NPK assessment
    const avgNitrogen = recentRecords.reduce((sum, r) => sum + r.nitrogen, 0) / recentRecords.length;
    const avgPhosphorus = recentRecords.reduce((sum, r) => sum + r.phosphorus, 0) / recentRecords.length;
    const avgPotassium = recentRecords.reduce((sum, r) => sum + r.potassium, 0) / recentRecords.length;

    if (avgNitrogen < 10) {
      issues.push('Low nitrogen levels');
      totalScore += 5;
    } else {
      totalScore += 15;
    }

    if (avgPhosphorus < 10) {
      issues.push('Low phosphorus levels');
      totalScore += 5;
    } else {
      totalScore += 15;
    }

    if (avgPotassium < 10) {
      issues.push('Low potassium levels');
      totalScore += 5;
    } else {
      totalScore += 15;
    }

    // Moisture assessment
    const avgMoisture = recentRecords.reduce((sum, r) => sum + r.moisture, 0) / recentRecords.length;
    if (avgMoisture < 15) {
      issues.push('Low soil moisture');
    } else if (avgMoisture > 40) {
      issues.push('Excessive soil moisture');
    } else {
      totalScore += 5;
    }

    // Final score
    return {
      score: Math.min(100, Math.round(totalScore)),
      issues
    };
  };

  const soilQuality = getSoilQualityAssessment();
  const lineChartData = getLineChartData();
  const radarData = getRadarData();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" /> Soil Health Tracker
          </CardTitle>
          <Button onClick={() => setIsAddingRecord(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Soil Test
          </Button>
        </CardHeader>
        <CardContent>
          {soilRecords.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg ${
                  soilQuality.score >= 80 ? 'bg-green-50' :
                  soilQuality.score >= 60 ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <p className="text-sm text-gray-500">Soil Health Score</p>
                  <p className={`text-2xl font-bold ${
                    soilQuality.score >= 80 ? 'text-green-600' :
                    soilQuality.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {soilQuality.score}/100
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Average pH Level</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {soilRecords.length > 0 
                      ? (soilRecords.reduce((sum, r) => sum + r.ph, 0) / soilRecords.length).toFixed(1)
                      : "N/A"}
                  </p>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-500">Organic Matter %</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {soilRecords.length > 0 
                      ? (soilRecords.reduce((sum, r) => sum + r.organicMatter, 0) / soilRecords.length).toFixed(1)
                      : "N/A"}%
                  </p>
                </div>
              </div>

              {soilQuality.issues.length > 0 && (
                <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Soil Health Issues</p>
                      <ul className="mt-1 list-disc list-inside text-sm text-yellow-700">
                        {soilQuality.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {lineChartData.length > 0 && (
                <div className="h-[300px]">
                  <h3 className="text-lg font-medium mb-2">Soil Nutrients Over Time</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="ph" name="pH" stroke="#0ea5e9" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="organicMatter" name="Organic Matter %" stroke="#f97316" />
                      <Line type="monotone" dataKey="nitrogen" name="Nitrogen" stroke="#22c55e" />
                      <Line type="monotone" dataKey="phosphorus" name="Phosphorus" stroke="#8b5cf6" />
                      <Line type="monotone" dataKey="potassium" name="Potassium" stroke="#ec4899" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {radarData.length > 0 && (
                <div className="h-[400px]">
                  <h3 className="text-lg font-medium mb-2">Soil Quality by Farm</h3>                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[radarData[0]]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Soil Quality" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Tooltip />
                      <Legend />
                      <Radar name="pH Balance" dataKey="ph" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                      <Radar name="Organic Matter" dataKey="organicMatter" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                      <Radar name="Nitrogen" dataKey="nitrogen" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                      <Radar name="Phosphorus" dataKey="phosphorus" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Radar name="Potassium" dataKey="potassium" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium">Recent Soil Tests</h3>
                <div className="mt-2 space-y-2">
                  {soilRecords
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(record => (
                      <div 
                        key={record.id} 
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">
                            {farms.find(f => f.id === record.farmId)?.name || 'Unknown Farm'}
                            {record.fieldSection && ` - ${record.fieldSection}`}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-2">{new Date(record.date).toLocaleDateString()}</span>
                            <span className="mr-2">•</span>
                            <span>pH: {record.ph}</span>
                            <span className="mx-2">•</span>
                            <span>OM: {record.organicMatter}%</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <p className="text-sm">N-P-K: {record.nitrogen}-{record.phosphorus}-{record.potassium}</p>
                          </div>                          <div className="flex gap-1">
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
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-500">No soil test records yet. Add your first test to start tracking soil health.</p>
              <Button onClick={() => setIsAddingRecord(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-1" /> Add Soil Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>      <Dialog open={isAddingRecord || isEditingRecord} onOpenChange={(open) => {
        if (!open) {
          setIsAddingRecord(false);
          setIsEditingRecord(false);
          setEditingRecordId(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditingRecord ? 'Edit Soil Test Results' : 'Record Soil Test Results'}</DialogTitle>
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
                <Label htmlFor="fieldSection">Field Section (Optional)</Label>
                <Input
                  id="fieldSection"
                  value={newRecord.fieldSection || ''}
                  onChange={(e) => setNewRecord({...newRecord, fieldSection: e.target.value})}
                  placeholder="e.g., North, South, Field 1, etc."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ph">pH Level (4-14)</Label>
                  <Input
                    id="ph"
                    type="number"
                    value={newRecord.ph}
                    onChange={(e) => setNewRecord({...newRecord, ph: parseFloat(e.target.value) || 7})}
                    step="0.1"
                    min="4"
                    max="14"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="organicMatter">Organic Matter (%)</Label>
                  <Input
                    id="organicMatter"
                    type="number"
                    value={newRecord.organicMatter}
                    onChange={(e) => setNewRecord({...newRecord, organicMatter: parseFloat(e.target.value) || 0})}
                    step="0.1"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nitrogen">Nitrogen (ppm)</Label>
                  <Input
                    id="nitrogen"
                    type="number"
                    value={newRecord.nitrogen}
                    onChange={(e) => setNewRecord({...newRecord, nitrogen: parseFloat(e.target.value) || 0})}
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phosphorus">Phosphorus (ppm)</Label>
                  <Input
                    id="phosphorus"
                    type="number"
                    value={newRecord.phosphorus}
                    onChange={(e) => setNewRecord({...newRecord, phosphorus: parseFloat(e.target.value) || 0})}
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="potassium">Potassium (ppm)</Label>
                  <Input
                    id="potassium"
                    type="number"
                    value={newRecord.potassium}
                    onChange={(e) => setNewRecord({...newRecord, potassium: parseFloat(e.target.value) || 0})}
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="moisture">Soil Moisture (%)</Label>
                <Input
                  id="moisture"
                  type="number"
                  value={newRecord.moisture}
                  onChange={(e) => setNewRecord({...newRecord, moisture: parseFloat(e.target.value) || 0})}
                  step="0.1"
                  min="0"
                  max="100"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="date">Test Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full p-2 border rounded"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">{isEditingRecord ? 'Save Changes' : 'Add Soil Test Record'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SoilHealthTracker;