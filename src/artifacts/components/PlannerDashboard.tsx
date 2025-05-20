import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Leaf, BugPlay, Trash2, Droplet, Cloud, RotateCw, CloudRain, FlaskConical } from 'lucide-react'; // Added FlaskConical
import { Farm, PlanItem, CropPlanEvent, WeatherData } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlannerDashboardProps {
  currentView: string;
  farms: Farm[];
  plantingPlans: PlanItem[];
  fertilizerPlans: PlanItem[];
  pestManagementPlans: PlanItem[];
  irrigationPlans: PlanItem[];
  weatherTaskPlans: PlanItem[];
  rotationPlans: PlanItem[];
  rainwaterPlans: PlanItem[];
  setIsAddingPlantingPlan: (value: boolean) => void;
  setIsAddingFertilizerPlan: (value: boolean) => void;
  setIsAddingPestPlan: (value: boolean) => void;
  setIsAddingIrrigationPlan: (value: boolean) => void;
  setIsAddingWeatherTaskPlan: (value: boolean) => void;
  setIsAddingRotationPlan: (value: boolean) => void;
  setIsAddingRainwaterPlan: (value: boolean) => void;
  updatePlanStatus: (planType: 'planting' | 'fertilizer' | 'pest' | 'irrigation' | 'weatherTask' | 'rotation' | 'rainwater', id: number, status: 'planned' | 'in-progress' | 'completed' | 'cancelled') => void;
  handleDeletePlan: (planType: 'planting' | 'fertilizer' | 'pest' | 'irrigation' | 'weatherTask' | 'rotation' | 'rainwater', id: number) => void;
  cropPlanEvents: CropPlanEvent[];
  setCropPlanEvents: React.Dispatch<React.SetStateAction<CropPlanEvent[]>>;
  handleDeleteEvent: (eventId: number) => void;
  weatherData: WeatherData[];
}

const PlannerDashboard = (props: PlannerDashboardProps): JSX.Element => {
  const {
    currentView,
    farms,
    plantingPlans,
    fertilizerPlans,
    pestManagementPlans,
    irrigationPlans,
    weatherTaskPlans,
    rotationPlans,
    rainwaterPlans,
    setIsAddingPlantingPlan,
    setIsAddingFertilizerPlan,
    setIsAddingPestPlan,
    setIsAddingIrrigationPlan,
    setIsAddingWeatherTaskPlan,
    setIsAddingRotationPlan,
    setIsAddingRainwaterPlan,
    updatePlanStatus,
    handleDeletePlan,
    cropPlanEvents,
    setCropPlanEvents,
    handleDeleteEvent,
    weatherData
  } = props;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<CropPlanEvent, 'id'>>({ // Ensure type matches CropPlanEvent structure
    title: '',
    start: new Date(),
    end: new Date(),
    farmId: farms[0]?.id || 0, // Default to first farm or 0
    type: 'planting',
    notes: ''
  });

  const nextWeekWeather = useMemo(() => weatherData.slice(0, 7), [weatherData]);
  
  const shouldRecommendIrrigation = useMemo(() => {
    return nextWeekWeather.some(day => day.temp > 85 && (day.weather.includes('Clear') || day.weather.includes('Sunny')));
  }, [nextWeekWeather]);

  const shouldDelayFertilizer = useMemo(() => {
    return nextWeekWeather.slice(0, 3).some(day => 
      day.weather.includes('Rain') || day.weather.includes('Shower')
    );
  }, [nextWeekWeather]);

  const shouldHarvestSoon = useMemo(() => {
    return nextWeekWeather.slice(0, 5).some(day => 
      day.weather.includes('Storm') || day.weather.includes('Heavy rain') || day.weather.includes('Thunderstorm')
    );
  }, [nextWeekWeather]);

  const renderPlanItem = (plan: PlanItem, planType: 'planting' | 'fertilizer' | 'pest' | 'irrigation' | 'weatherTask' | 'rotation' | 'rainwater'): JSX.Element => {
    const farmName = farms.find(f => f.id === parseInt(plan.farmId))?.name || 'Unknown';
    return (
      <div
        key={plan.id}
        className={`p-4 border rounded-md ${
          plan.status === 'planned' ? 'bg-blue-50 border-blue-200' :
          plan.status === 'in-progress' ? 'bg-yellow-50 border-yellow-200' :
          plan.status === 'completed' ? 'bg-green-50 border-green-200' :
          'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{plan.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="font-medium">Farm:</span> {farmName}</p>
              {planType === 'fertilizer' && plan.fertilizerType && (
                <>
                  <p><span className="font-medium">Fertilizer Type:</span> {plan.fertilizerType}</p>
                  <p><span className="font-medium">Application Rate:</span> {plan.applicationRate}</p>
                </>
              )}
              {planType === 'pest' && plan.pestType && (
                <>
                  <p><span className="font-medium">Pest Type:</span> {plan.pestType}</p>
                  <p><span className="font-medium">Control Method:</span> {plan.controlMethod}</p>
                </>
              )}
              <p><span className="font-medium">Duration:</span> {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</p>
              {plan.notes && <p><span className="font-medium">Notes:</span> {plan.notes}</p>}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <span className={`px-2 py-1 rounded-full text-xs text-center capitalize ${
              plan.status === 'planned' ? 'bg-blue-100 text-blue-800' :
              plan.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
              plan.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {plan.status}
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Update Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updatePlanStatus(planType, plan.id, 'planned')}>Planned</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updatePlanStatus(planType, plan.id, 'in-progress')}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updatePlanStatus(planType, plan.id, 'completed')}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updatePlanStatus(planType, plan.id, 'cancelled')}>Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(planType, plan.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Crop Calendar functions
  const daysInMonth = useMemo(() => new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate(), [selectedDate]);

  const firstDayOfMonth = useMemo(() => new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  ).getDay(), [selectedDate]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.farmId === 0 && farms.length > 0) {
      // Attempt to set a default farmId if none selected and farms exist
      // Or, better, make farm selection mandatory / provide a clear "Select Farm"
      alert("Please select a farm for the event.");
      return;
    }
    setCropPlanEvents([...cropPlanEvents, {
      id: Date.now(),
      ...newEvent,
      type: newEvent.type as 'planting' | 'fertilizing' | 'harvesting' | 'other' // Ensure type assertion
    }]);
    setIsAddingEvent(false);
    setNewEvent({
      title: '',
      start: new Date(),
      end: new Date(),
      farmId: farms[0]?.id || 0,
      type: 'planting',
      notes: ''
    });
  };

  const getEventsForDay = (date: Date) => {
    const dayEvents: Array<{
      id: string;
      title: string;
      type: string;
      notes?: string;
      farmName?: string;
      originalType: 'cropEvent' | 'planItem';
    }> = [];

    // Process CropPlanEvents
    cropPlanEvents.forEach(event => {
      const eventStartDate = new Date(event.start);
      // Check if the event's start date is the current calendar day
      if (eventStartDate.getDate() === date.getDate() &&
          eventStartDate.getMonth() === date.getMonth() &&
          eventStartDate.getFullYear() === date.getFullYear()) {
        dayEvents.push({
          id: `crop-${event.id}`,
          title: event.title,
          type: event.type, // 'planting', 'fertilizing', 'harvesting', 'other'
          notes: event.notes,
          farmName: farms.find(f => f.id === event.farmId)?.name || 'Unknown',
          originalType: 'cropEvent'
        });
      }
    });

    // Process PlanItems
    const allPlans = [
      { items: plantingPlans, typeDisplay: 'Planting Plan', typeInternal: 'plantingPlan', icon: <Leaf size={12} className="mr-1 inline-block" /> },
      { items: fertilizerPlans, typeDisplay: 'Fertilizer Plan', typeInternal: 'fertilizerPlan', icon: <FlaskConical size={12} className="mr-1 inline-block" /> },
      { items: pestManagementPlans, typeDisplay: 'Pest Mgmt Plan', typeInternal: 'pestPlan', icon: <BugPlay size={12} className="mr-1 inline-block" /> },
      { items: irrigationPlans, typeDisplay: 'Irrigation Plan', typeInternal: 'irrigationPlan', icon: <Droplet size={12} className="mr-1 inline-block" /> },
      { items: weatherTaskPlans, typeDisplay: 'Weather Task', typeInternal: 'weatherTaskPlan', icon: <Cloud size={12} className="mr-1 inline-block" /> },
      { items: rotationPlans, typeDisplay: 'Rotation Plan', typeInternal: 'rotationPlan', icon: <RotateCw size={12} className="mr-1 inline-block" /> },
      { items: rainwaterPlans, typeDisplay: 'Rainwater Plan', typeInternal: 'rainwaterPlan', icon: <CloudRain size={12} className="mr-1 inline-block" /> },
    ];

    allPlans.forEach(planGroup => {
      planGroup.items.forEach(plan => {
        const planStartDate = new Date(plan.startDate);
        // Check if the plan's start date is the current calendar day
        if (plan.status !== 'cancelled' && // Optionally filter out cancelled plans
            planStartDate.getDate() === date.getDate() &&
            planStartDate.getMonth() === date.getMonth() &&
            planStartDate.getFullYear() === date.getFullYear()) {
          dayEvents.push({
            id: `${planGroup.typeInternal}-${plan.id}`,
            title: plan.title,
            type: planGroup.typeInternal, 
            notes: plan.description || plan.notes,
            farmName: farms.find(f => f.id === parseInt(plan.farmId))?.name || 'Unknown',
            originalType: 'planItem'
          });
        }
      });
    });
    return dayEvents.sort((a,b) => a.title.localeCompare(b.title)); // Sort events for consistent order
  };

  const eventColors: Record<string, string> = {
    planting: 'bg-blue-100 text-blue-800', 
    fertilizing: 'bg-green-100 text-green-800', 
    harvesting: 'bg-purple-100 text-purple-800', 
    other: 'bg-gray-100 text-gray-800', 
    plantingPlan: 'bg-sky-100 text-sky-800',
    fertilizerPlan: 'bg-emerald-100 text-emerald-800',
    pestPlan: 'bg-amber-100 text-amber-800',
    irrigationPlan: 'bg-cyan-100 text-cyan-800',
    weatherTaskPlan: 'bg-slate-100 text-slate-800',
    rotationPlan: 'bg-orange-100 text-orange-800',
    rainwaterPlan: 'bg-indigo-100 text-indigo-800',
    default: 'bg-stone-100 text-stone-800'
  };

  const getIconForEventType = (type: string): JSX.Element | null => {
    switch (type) {
      case 'planting': return <Leaf size={12} className="mr-1 inline-block text-blue-800" />;
      case 'fertilizing': return <FlaskConical size={12} className="mr-1 inline-block text-green-800" />; // Ensure FlaskConical is imported
      case 'harvesting': return <Calendar size={12} className="mr-1 inline-block text-purple-800" />;
      case 'plantingPlan': return <Leaf size={12} className="mr-1 inline-block text-sky-800" />;
      case 'fertilizerPlan': return <FlaskConical size={12} className="mr-1 inline-block text-emerald-800" />;
      case 'pestPlan': return <BugPlay size={12} className="mr-1 inline-block text-amber-800" />;
      case 'irrigationPlan': return <Droplet size={12} className="mr-1 inline-block text-cyan-800" />;
      case 'weatherTaskPlan': return <Cloud size={12} className="mr-1 inline-block text-slate-800" />;
      case 'rotationPlan': return <RotateCw size={12} className="mr-1 inline-block text-orange-800" />;
      case 'rainwaterPlan': return <CloudRain size={12} className="mr-1 inline-block text-indigo-800" />;
      default: return null;
    }
  };

  const renderCalendarView = (): JSX.Element => (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Crop Planning Calendar</CardTitle>
            <div className="flex gap-2 items-center"> {/* Added items-center */}
              <Button
                variant="outline"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
              >
                Next
              </Button>
              <div className="space-x-2">
                <Button onClick={() => setIsAddingEvent(true)}>Add Event</Button>
                <Button variant="outline" onClick={() => {/* handleExportPlan placeholder */ console.log("Export plan clicked")}}>
                  Export
                </Button>
                <div className="relative inline-block">
                  <Button variant="outline" onClick={() => document.getElementById('importFilePlanner')?.click()}>
                    Import
                  </Button>
                  <input
                    type="file"
                    id="importFilePlanner" // Unique ID for this import input
                    className="hidden"
                    accept=".json"
                    onChange={(e) => {/* handleImportPlan placeholder */ console.log("Import plan file selected", e.target.files)}}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-lg font-medium">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2 border min-h-[100px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), index + 1);
              const events = getEventsForDay(date);
              
              return (
                <div key={index} className="p-2 border min-h-[100px] overflow-hidden">
                  <div className="font-medium">{index + 1}</div>
                  <div className="space-y-1 mt-1">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className={`group relative p-1 rounded text-xs ${eventColors[event.type] || eventColors.default}`}
                        title={`${event.title}\nFarm: ${event.farmName}\nNotes: ${event.notes || ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate flex items-center">
                            {getIconForEventType(event.type)}
                            {event.title}
                          </span>
                          {event.originalType === 'cropEvent' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Ensure event.id for cropEvent is correctly parsed if it was prefixed
                                const actualId = event.id.startsWith('crop-') ? Number(event.id.substring(5)) : Number(event.id);
                                handleDeleteEvent(actualId);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weather-Informed Recommendations */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Weather-Based Planning Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shouldRecommendIrrigation && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-700 flex items-center">
                  <Droplet className="h-4 w-4 mr-2" />
                  Irrigation Recommendation
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  Hot, dry weather is forecasted. Consider scheduling irrigation in the next 2-3 days.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-blue-700 border-blue-300"
                  onClick={() => setIsAddingIrrigationPlan(true)}
                >
                  Create Irrigation Plan
                </Button>
              </div>
            )}
            
            {shouldDelayFertilizer && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-700 flex items-center">
                  <Leaf className="h-4 w-4 mr-2" />
                  Fertilizer Timing Advisory
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  Rain is forecasted soon. Consider postponing fertilizer application to avoid runoff.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-green-700 border-green-300"
                  onClick={() => setIsAddingFertilizerPlan(true)}
                >
                  Schedule Fertilizer Plan
                </Button>
              </div>
            )}
            
            {shouldHarvestSoon && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Harvesting Alert
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  Severe weather forecasted in the coming days. Consider harvesting mature crops early.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-purple-700 border-purple-300"
                  onClick={() => setIsAddingEvent(true)} // This should ideally set the newEvent type to harvesting
                >
                  Log Harvest Event
                </Button>
              </div>
            )}
            
            {!shouldRecommendIrrigation && !shouldDelayFertilizer && !shouldHarvestSoon && (
              <p className="text-center text-gray-500 py-4">
                No weather-based recommendations at this time. Weather conditions look favorable for normal operations.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderPlantingView = (): JSX.Element => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Planting Plans</CardTitle>
        <Button onClick={() => setIsAddingPlantingPlan(true)}>
          <Calendar className="h-4 w-4 mr-2" />
          Add Planting Plan
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plantingPlans.length > 0 ? (
            plantingPlans.map((plan) => renderPlanItem(plan, 'planting'))
          ) : (
            <div className="text-center py-8 border border-dashed rounded-md">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No planting plans yet. Create your first planting plan!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderFertilizerView = (): JSX.Element => (
     <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fertilizer Application Plans</CardTitle>
          <Button onClick={() => setIsAddingFertilizerPlan(true)}>
            <Leaf className="h-4 w-4 mr-2" />
            Add Fertilizer Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fertilizerPlans.length > 0 ? (
              fertilizerPlans.map((plan) => renderPlanItem(plan, 'fertilizer'))
            ) : (
              <div className="text-center py-8 border border-dashed rounded-md">
                <Leaf className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No fertilizer plans yet. Create your first fertilizer application plan!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
  );

  const renderPestView = (): JSX.Element => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pest Management Plans</CardTitle>
        <Button onClick={() => setIsAddingPestPlan(true)}>
          <BugPlay className="h-4 w-4 mr-2" />
          Add Pest Management Plan
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pestManagementPlans.length > 0 ? (
            pestManagementPlans.map((plan) => renderPlanItem(plan, 'pest'))
          ) : (
            <div className="text-center py-8 border border-dashed rounded-md">
              <BugPlay className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No pest management plans yet. Create your first plan!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderIrrigationView = (): JSX.Element => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Smart Irrigation Plans</CardTitle>
        <Button onClick={() => setIsAddingIrrigationPlan(true)}>
          <Droplet className="h-4 w-4 mr-2" />
          Add Irrigation Plan
        </Button>
      </CardHeader>
      <CardContent>
        {nextWeekWeather.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium text-blue-800">Weather Forecast for Irrigation Planning</h3>
            <div className="flex mt-2 overflow-x-auto pb-2">
              {nextWeekWeather.map((day, index) => (
                <div key={index} className="flex-shrink-0 text-center mr-4 w-20">
                  <p className="text-xs font-medium">{new Date(day.date).toLocaleDateString('en-US', {weekday: 'short'})}</p>
                  <div className="text-xl my-1">{day.icon}</div>
                  <p className="text-sm font-bold">{day.temp}°F</p>
                  <p className="text-xs text-gray-600">{day.weather}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-4">
          {irrigationPlans.length > 0 ? (
            irrigationPlans.map((plan) => renderPlanItem(plan, 'irrigation'))
          ) : (
            <div className="text-center py-8 border border-dashed rounded-md">
              <Droplet className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No irrigation plans yet. Create your first smart irrigation plan!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderWeatherTaskView = (): JSX.Element => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weather Responsive Task Plans</CardTitle>
        <Button onClick={() => setIsAddingWeatherTaskPlan(true)}>
          <Cloud className="h-4 w-4 mr-2" />
          Add Weather Task Plan
        </Button>
      </CardHeader>
      <CardContent>
        {nextWeekWeather.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="font-medium">Current Weather Conditions</h3>
            <div className="flex items-center mt-2">
              <div className="text-3xl mr-3">{nextWeekWeather[0].icon}</div>
              <div>
                <p className="font-bold text-lg">{nextWeekWeather[0].temp}°F</p>
                <p>{nextWeekWeather[0].weather} today</p>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {weatherTaskPlans.length > 0 ? (
            weatherTaskPlans.map((plan) => renderPlanItem(plan, 'weatherTask'))
          ) : (
            <div className="text-center py-8 border border-dashed rounded-md">
              <Cloud className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No weather task plans yet. Create your first weather responsive task plan!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderRotationView = (): JSX.Element => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Crop Rotation Plans</CardTitle>
        <Button onClick={() => setIsAddingRotationPlan(true)}>
          <RotateCw className="h-4 w-4 mr-2" />
          Add Rotation Plan
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rotationPlans.length > 0 ? (
            rotationPlans.map((plan) => renderPlanItem(plan, 'rotation'))
          ) : (
            <div className="text-center py-8 border border-dashed rounded-md">
              <RotateCw className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No crop rotation plans yet. Create your first crop rotation plan!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderRainwaterView = (): JSX.Element => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rainwater Harvesting Plans</CardTitle>
        <Button onClick={() => setIsAddingRainwaterPlan(true)}>
          <CloudRain className="h-4 w-4 mr-2" />
          Add Rainwater Plan
        </Button>
      </CardHeader>
      <CardContent>
        {nextWeekWeather.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium">Rain Forecast for Harvesting Planning</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {nextWeekWeather.filter(day => day.weather.includes('Rain')).length > 0 ? (
                nextWeekWeather.map((day, index) => (
                  day.weather.includes('Rain') && (
                    <div key={index} className="bg-blue-100 rounded-md p-2 text-sm">
                      <p className="font-medium">{new Date(day.date).toLocaleDateString('en-US', {weekday: 'long'})}</p>
                      <div className="flex items-center">
                        <span className="mr-1">{day.icon}</span>
                        <span>{day.weather}</span>
                      </div>
                    </div>
                  )
                ))
              ) : (
                <p className="text-gray-600">No rain forecasted in the next 7 days.</p>
              )}
            </div>
          </div>
        )}
        <div className="space-y-4">
          {rainwaterPlans.length > 0 ? (
            rainwaterPlans.map((plan) => renderPlanItem(plan, 'rainwater'))
          ) : (
            <div className="text-center py-8 border border-dashed rounded-md">
              <CloudRain className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No rainwater harvesting plans yet. Create your first plan!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderActiveView = (): JSX.Element => {
    switch (currentView) {
      case 'calendar':
        return renderCalendarView();
      case 'planting':
        return renderPlantingView();
      case 'fertilizer':
        return renderFertilizerView();
      case 'pest':
        return renderPestView();
      case 'irrigation':
        return renderIrrigationView();
      case 'weatherTask':
        return renderWeatherTaskView();
      case 'rotation':
        return renderRotationView();
      case 'rainwater':
        return renderRainwaterView();
      default: 
        return renderCalendarView();
    }
  };

  return (
    <div className="space-y-4">
      {renderActiveView()}

      {/* Upcoming Plans Preview - this can stay as a summary section */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Plans (Next 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...plantingPlans, ...fertilizerPlans, ...pestManagementPlans, 
               ...irrigationPlans, ...weatherTaskPlans, ...rotationPlans, ...rainwaterPlans]
              .filter(plan => {
                const startDate = new Date(plan.startDate);
                const today = new Date();
                const nextWeek = new Date();
                nextWeek.setDate(today.getDate() + 7);
                return startDate >= today && startDate <= nextWeek && plan.status !== 'cancelled';
              })
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 5)
              .map(plan => {
                let planType = 'fertilizerType' in plan ? 'Fertilizer' : 
                               'pestType' in plan ? 'Pest Management' : 
                               'irrigationMethod' in plan ? 'Irrigation' :
                               'weatherCondition' in plan ? 'Weather Task' :
                               'rotationCrops' in plan ? 'Crop Rotation' :
                               'harvestingCapacity' in plan ? 'Rainwater Harvesting' : 
                               'Planting';
                return (
                  <div key={plan.id} className="p-2 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{plan.title}</p>
                        <p className="text-xs text-gray-600">
                          {planType} • {new Date(plan.startDate).toLocaleDateString()} •
                          {farms.find(f => f.id === parseInt(plan.farmId))?.name}
                        </p>
                      </div>
                      <span className={`px-2 h-fit py-0.5 rounded-full text-xs capitalize ${
                        plan.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        plan.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            {[...plantingPlans, ...fertilizerPlans, ...pestManagementPlans,
               ...irrigationPlans, ...weatherTaskPlans, ...rotationPlans, ...rainwaterPlans].filter(plan => {
              const startDate = new Date(plan.startDate);
              const today = new Date();
              const nextWeek = new Date();
              nextWeek.setDate(today.getDate() + 7);
              return startDate >= today && startDate <= nextWeek && plan.status !== 'cancelled';
            }).length === 0 && (
              <p className="text-center text-gray-500 py-4">No plans scheduled for the next 7 days</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Calendar Event Dialog - this is part of the calendar view, ensure it's accessible */}
      <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Crop Plan Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Farm</Label>
              <select
                className="w-full p-2 border rounded"
                value={newEvent.farmId}
                onChange={(e) => setNewEvent({ ...newEvent, farmId: Number(e.target.value) })}
                required
              >
                <option value="">Select Farm</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="w-full p-2 border rounded"
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                required
              >
                <option value="planting">Planting</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="harvesting">Harvesting</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newEvent.start.toISOString().split('T')[0]}
                onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newEvent.end.toISOString().split('T')[0]}
                onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={newEvent.notes}
                onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">Add Event</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlannerDashboard;
