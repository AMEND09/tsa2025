import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Droplet, Leaf, LayoutDashboard, Info, Trash2, Edit3, RotateCw, Download, Upload, Settings, Cloud, CloudRain, Bug } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {
  WaterUsage,
  Farm,
  WeatherData,
  Task,
  Issue,
  ConfirmDelete,
  CropPlanEvent,
  SustainabilityMetrics as ISustainabilityMetrics,
  ExportData,
  PlanItem
} from './types';

import {
  walkthroughStyles,
  calculateSustainabilityMetrics,
  getWeatherInfo
} from './utils';

// Import the component files
import Walkthrough from './components/Walkthrough';
import CropFilter from './components/CropFilter';
import SustainabilityScoreCard from './components/SustainabilityScoreCard';
import WeatherPreview from './components/WeatherPreview';
import TaskManager from './components/TaskManager';
import IssueTracker from './components/IssueTracker';
import HistoryPage from './components/HistoryPage';
import Instructions from './components/Instructions';
import PlannerDashboard from './components/PlannerDashboard';
import PlantingPlanForm from './components/PlantingPlanForm';
import FertilizerPlanForm from './components/FertilizerPlanForm';
import PestManagementPlanForm from './components/PestManagementPlanForm';
import IrrigationPlanForm from './components/IrrigationPlanForm';
import WeatherTaskPlanForm from './components/WeatherTaskPlanForm';
import RotationPlanForm from './components/RotationPlanForm';
import RainwaterPlanForm from './components/RainwaterPlanForm';

const DefaultComponent = (): React.ReactNode => {
  // Define walkthrough steps for the Walkthrough component
  const WALKTHROUGH_STEPS = [
    {
      target: '[data-walkthrough="overview-tab"]',
      title: 'Overview Dashboard',
      content: 'This is your main dashboard where you can see a summary of your farm data.',
      placement: 'bottom' as const,
      tabId: 'overview'
    },
    {
      target: '[data-walkthrough="quick-actions"]',
      title: 'Quick Actions',
      content: 'Use these buttons to quickly record water usage, fertilizer applications, and harvests.',
      placement: 'right' as const,
      tabId: 'overview'
    },
    {
      target: '[data-walkthrough="sustainability"]',
      title: 'Sustainability Score',
      content: 'This shows your farm\'s sustainability metrics based on your recorded activities.',
      placement: 'left' as const,
      tabId: 'overview'
    },
    {
      target: '[data-walkthrough="water-tab"]',
      title: 'Water Management',
      content: 'Track your water usage and efficiency here.',
      placement: 'bottom' as const,
      tabId: 'water'
    },
    {
      target: '[data-walkthrough="farms-tab"]',
      title: 'Farms',
      content: 'Manage your farms, crops, and view historical data.',
      placement: 'bottom' as const,
      tabId: 'farms'
    },
    {
      target: '[data-walkthrough="add-farm"]',
      title: 'Add New Farm',
      content: 'Click here to add a new farm to your dashboard.',
      placement: 'right' as const,
      tabId: 'farms'
    },
    {
      target: '[data-walkthrough="issues-tab"]',
      title: 'Farm Issues',
      content: 'Track and manage farm problems here.',
      placement: 'bottom' as const,
      tabId: 'issues'
    },
    {
      target: '[data-walkthrough="reports-tab"]',
      title: 'Reports',
      content: 'View detailed reports about your farm performance.',
      placement: 'bottom' as const,
      tabId: 'reports'
    },
    {
      target: '[data-walkthrough="crop-plan"]',
      title: 'Crop Plan',
      content: 'Plan and schedule your farming activities throughout the year.',
      placement: 'bottom' as const,
      tabId: 'cropplan'
    },
    {
      target: '[data-walkthrough="planners-tab"]',
      title: 'Farm Planners',
      content: 'Plan your planting, fertilizing, and pest management activities here.',
      placement: 'bottom' as const,
      tabId: 'planners'
    }
  ];

  const [farms, setFarms] = useState<Farm[]>(() => {
    const savedFarms = localStorage.getItem('farms');
    return savedFarms ? JSON.parse(savedFarms) : [];
  });

  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [newFarm, setNewFarm] = useState({ 
    name: '', 
    size: '', 
    crop: '',
    rotationHistory: [] as { crop: string; startDate: string; endDate: string }[]
  });
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [newWaterUsage, setNewWaterUsage] = useState({ farmId: '', amount: '', date: '' });
  const [isAddingWaterUsage, setIsAddingWaterUsage] = useState(false);
  const [isEditingWaterUsage, setIsEditingWaterUsage] = useState(false);
  const [editingWaterUsage, setEditingWaterUsage] = useState<WaterUsage | null>(null);
  const [isAddingFertilizer, setIsAddingFertilizer] = useState(false);
  const [isEditingFertilizer, setIsEditingFertilizer] = useState(false);
  const [editingFertilizer, setEditingFertilizer] = useState<any | null>(null);
  const [isAddingHarvest, setIsAddingHarvest] = useState(false);
  const [isEditingHarvest, setIsEditingHarvest] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<any | null>(null);
  const [newFertilizer, setNewFertilizer] = useState({ farmId: '', type: '', amount: '', date: '' });
  const [newHarvest, setNewHarvest] = useState({ farmId: '', amount: '', date: '' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null);
  const [cropPlanEvents, setCropPlanEvents] = useState<CropPlanEvent[]>(() => {
    const savedEvents = localStorage.getItem('cropPlanEvents');
    return savedEvents ? JSON.parse(savedEvents, (key, value) => {
      if (key === 'start' || key === 'end') return new Date(value);
      return value;
    }) : [];
  });

  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    return !localStorage.getItem('walkthroughCompleted');
  });

  const [isAddingRotation, setIsAddingRotation] = useState(false);
  const [newRotation, setNewRotation] = useState({
    farmId: '',
    crop: '',
    startDate: '',
    endDate: ''
  });

  const [cropFilter, setCropFilter] = useState<string>("all");

  const [importNotification, setImportNotification] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [plantingPlans, setPlantingPlans] = useState<PlanItem[]>(() => {
    const saved = localStorage.getItem('plantingPlans');
    return saved ? JSON.parse(saved) : [];
  });

  const [fertilizerPlans, setFertilizerPlans] = useState<PlanItem[]>(() => {
    const saved = localStorage.getItem('fertilizerPlans');
    return saved ? JSON.parse(saved) : [];
  });

  const [pestManagementPlans, setPestManagementPlans] = useState<PlanItem[]>(() => {
    const saved = localStorage.getItem('pestManagementPlans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [irrigationPlans, setIrrigationPlans] = useState<PlanItem[]>(() => {
    const saved = localStorage.getItem('irrigationPlans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [weatherTaskPlans, setWeatherTaskPlans] = useState<PlanItem[]>(() => {
    const saved = localStorage.getItem('weatherTaskPlans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [rotationPlans, setRotationPlans] = useState<PlanItem[]>(() => {
    const saved = localStorage.getItem('rotationPlans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [rainwaterPlans, setRainwaterPlans] = useState<PlanItem[]>(() => {
    const saved = localStorage.getItem('rainwaterPlans');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddingPlantingPlan, setIsAddingPlantingPlan] = useState(false);
  const [isAddingFertilizerPlan, setIsAddingFertilizerPlan] = useState(false);
  const [isAddingPestPlan, setIsAddingPestPlan] = useState(false);
  const [isAddingIrrigationPlan, setIsAddingIrrigationPlan] = useState(false);
  const [isAddingWeatherTaskPlan, setIsAddingWeatherTaskPlan] = useState(false);
  const [isAddingRotationPlan, setIsAddingRotationPlan] = useState(false);
  const [isAddingRainwaterPlan, setIsAddingRainwaterPlan] = useState(false);
  
  const [newPlantingPlan, setNewPlantingPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [newFertilizerPlan, setNewFertilizerPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    fertilizerType: string;
    applicationRate: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    fertilizerType: '',
    applicationRate: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [newPestPlan, setNewPestPlan] = useState<Omit<PlanItem, 'id' | 'status'> & { 
    farmId: string; 
    title: string; 
    description: string; 
    pestType: string; 
    controlMethod: string; 
    startDate: string; 
    endDate: string; 
    notes: string; 
  }>({
    farmId: '',
    title: '',
    description: '',
    pestType: '',
    controlMethod: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // New state for irrigation plan
  const [newIrrigationPlan, setNewIrrigationPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    irrigationMethod: string;
    waterSource: string;
    frequency: string;
    soilMoistureThreshold: string;
    weatherConditions: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    irrigationMethod: '',
    waterSource: '',
    frequency: '',
    soilMoistureThreshold: '',
    weatherConditions: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // New state for weather task plan
  const [newWeatherTaskPlan, setNewWeatherTaskPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    taskType: string;
    weatherCondition: string;
    taskActions: string;
    priority: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    taskType: '',
    weatherCondition: '',
    taskActions: '',
    priority: 'medium',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // New state for crop rotation plan
  const [newRotationPlan, setNewRotationPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    rotationCrops: string[];
    rotationInterval: string;
    soilPreparation: string;
    expectedBenefits: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    rotationCrops: [],
    rotationInterval: '',
    soilPreparation: '',
    expectedBenefits: '',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // New state for rainwater harvesting plan
  const [newRainwaterPlan, setNewRainwaterPlan] = useState<Omit<PlanItem, 'id' | 'status'> & {
    farmId: string;
    title: string;
    description: string;
    harvestingMethod: string;
    storageType: string;
    harvestingCapacity: string;
    collectionArea: string;
    filteringMethod: string;
    usageIntent: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    farmId: '',
    title: '',
    description: '',
    harvestingMethod: '',
    storageType: '',
    harvestingCapacity: '',
    collectionArea: '',
    filteringMethod: '',
    usageIntent: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const getFilteredFarms = () => {
    if (cropFilter === "all") return farms;
    return farms.filter(farm => farm.crop === cropFilter);
  };

  useEffect(() => {
    localStorage.setItem('farms', JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    fetchUserLocation();
  }, []);

  useEffect(() => {
    localStorage.setItem('cropPlanEvents', JSON.stringify(cropPlanEvents));
  }, [cropPlanEvents]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = walkthroughStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    localStorage.setItem('plantingPlans', JSON.stringify(plantingPlans));
  }, [plantingPlans]);

  useEffect(() => {
    localStorage.setItem('fertilizerPlans', JSON.stringify(fertilizerPlans));
  }, [fertilizerPlans]);

  useEffect(() => {
    localStorage.setItem('pestManagementPlans', JSON.stringify(pestManagementPlans));
  }, [pestManagementPlans]);
  
  useEffect(() => {
    localStorage.setItem('irrigationPlans', JSON.stringify(irrigationPlans));
  }, [irrigationPlans]);
  
  useEffect(() => {
    localStorage.setItem('weatherTaskPlans', JSON.stringify(weatherTaskPlans));
  }, [weatherTaskPlans]);
  
  useEffect(() => {
    localStorage.setItem('rotationPlans', JSON.stringify(rotationPlans));
  }, [rotationPlans]);
  
  useEffect(() => {
    localStorage.setItem('rainwaterPlans', JSON.stringify(rainwaterPlans));
  }, [rainwaterPlans]);

  const fetchUserLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const { latitude, longitude } = data;
      fetchWeatherData(latitude, longitude);
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  };

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=10`
      );
      const data = await response.json();

      const formattedData = data.daily.time.map((date: string, index: number) => {
        const weatherInfo = getWeatherInfo(data.daily.weathercode[index]);
        return {
          date: new Date(date).toLocaleDateString(),
          temp: data.daily.temperature_2m_max[index],
          weather: weatherInfo.desc,
          icon: weatherInfo.icon
        };
      });

      setWeatherData(formattedData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData([]);
    }
  };

  const handleAddFarm = () => {
    setFarms([...farms, {
      id: farms.length + 1,
      name: newFarm.name,
      size: newFarm.size,
      crop: newFarm.crop,
      rotationHistory: newFarm.rotationHistory,
      waterHistory: [],
      fertilizerHistory: [],
      harvestHistory: []
    }]);
    setIsAddingFarm(false);
    setNewFarm({ 
      name: '', 
      size: '', 
      crop: '', 
      rotationHistory: [] 
    });
  };

  // Update handleEditFarm to include rotationHistory
  const handleEditFarm = () => {
    if (editingFarm) {
      const updatedFarms = farms.map(farm => 
        farm.id === editingFarm.id ? { ...editingFarm, ...newFarm } : farm
      );
      setFarms(updatedFarms);
      setIsEditingFarm(false);
      setEditingFarm(null);
      setNewFarm({ 
        name: '', 
        size: '', 
        crop: '', 
        rotationHistory: [] 
      });
    }
  };

  const handleDeleteFarm = (id: number) => {
    setConfirmDelete({ id, type: 'farm' });
  };

  const handleAddWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newWaterUsage.farmId)) {
        return {
          ...farm,
          waterHistory: [...farm.waterHistory, {
            amount: parseFloat(newWaterUsage.amount),
            date: newWaterUsage.date
          }]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setNewWaterUsage({ farmId: '', amount: '', date: '' });
  };

  const handleEditWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWaterUsage) {
      const updatedFarms = farms.map(farm => {
        if (farm.id === parseInt(newWaterUsage.farmId)) {
          return {
            ...farm,
            waterHistory: farm.waterHistory.map(usage =>
              usage.date === editingWaterUsage.date ? { ...usage, amount: parseFloat(newWaterUsage.amount), date: newWaterUsage.date } : usage
            )
          };
        }
        return farm;
      });
      setFarms(updatedFarms);
      setIsEditingWaterUsage(false);
      setEditingWaterUsage(null);
      setNewWaterUsage({ farmId: '', amount: '', date: '' });
    }
  };

  const handleAddFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newFertilizer.farmId)) {
        return {
          ...farm,
          fertilizerHistory: [...farm.fertilizerHistory, {
            type: newFertilizer.type,
            amount: parseFloat(newFertilizer.amount),
            date: newFertilizer.date
          }]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setNewFertilizer({ farmId: '', type: '', amount: '', date: '' });
  };

  const handleEditFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFertilizer) {
      const updatedFarms = farms.map(farm => {
        if (farm.id === parseInt(newFertilizer.farmId)) {
          return {
            ...farm,
            fertilizerHistory: farm.fertilizerHistory.map(fertilizer =>
              fertilizer.date === editingFertilizer.date ? { ...fertilizer, type: newFertilizer.type, amount: parseFloat(newFertilizer.amount), date: newFertilizer.date } : fertilizer
            )
          };
        }
        return farm;
      });
      setFarms(updatedFarms);
      setIsEditingFertilizer(false);
      setEditingFertilizer(null);
      setNewFertilizer({ farmId: '', type: '', amount: '', date: '' });
    }
  };

  const handleAddHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newHarvest.farmId)) {
        return {
          ...farm,
          harvestHistory: [...farm.harvestHistory, {
            amount: parseFloat(newHarvest.amount),
            date: newHarvest.date
          }]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setNewHarvest({ farmId: '', amount: '', date: '' });
  };

  const handleEditHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHarvest) {
      const updatedFarms = farms.map(farm => {
        if (farm.id === parseInt(newHarvest.farmId)) {
          return {
            ...farm,
            harvestHistory: farm.harvestHistory.map(harvest =>
              harvest.date === editingHarvest.date ? { ...harvest, amount: parseFloat(newHarvest.amount), date: newHarvest.date } : harvest
            )
          };
        }
        return farm;
      });
      setFarms(updatedFarms);
      setIsEditingHarvest(false);
      setEditingHarvest(null);
      setNewHarvest({ farmId: '', amount: '', date: '' });
    }
  };

  const handleResolveIssue = (id: number) => {
    setIssues(issues.filter(issue => issue.id !== id));
  };

  const handleDeleteTask = (id: number) => {
    setConfirmDelete({ id, type: 'task' });
  };

  const handleAddRotation = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFarms = farms.map(farm => {
      if (farm.id === parseInt(newRotation.farmId)) {
        return {
          ...farm,
          rotationHistory: [
            ...(farm.rotationHistory || []),
            {
              crop: newRotation.crop,
              startDate: newRotation.startDate,
              endDate: newRotation.endDate
            }
          ]
        };
      }
      return farm;
    });
    setFarms(updatedFarms);
    setIsAddingRotation(false);
    setNewRotation({ farmId: '', crop: '', startDate: '', endDate: '' });
  };

  const handleAddPlantingPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setPlantingPlans([...plantingPlans, {
      id: Date.now(),
      status: 'planned',
      ...newPlantingPlan
    }]);
    setIsAddingPlantingPlan(false);
    setNewPlantingPlan({
      farmId: '',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
  };

  const handleAddFertilizerPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setFertilizerPlans([...fertilizerPlans, {
      id: Date.now(),
      status: 'planned',
      ...newFertilizerPlan
    }]);
    setIsAddingFertilizerPlan(false);
    setNewFertilizerPlan({
      farmId: '',
      title: '',
      description: '',
      fertilizerType: '',
      applicationRate: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
  };

  const handleAddPestPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setPestManagementPlans([...pestManagementPlans, {
      ...newPestPlan,
      id: Date.now(),
      status: 'planned'
    }]);
    setIsAddingPestPlan(false);
    setNewPestPlan({
      farmId: '',
      title: '',
      description: '',
      pestType: '',
      controlMethod: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
  };
  
  // New handler for irrigation plan
  const handleAddIrrigationPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIrrigationPlans([...irrigationPlans, {
      ...newIrrigationPlan,
      id: Date.now(),
      status: 'planned'
    }]);
    setIsAddingIrrigationPlan(false);
    setNewIrrigationPlan({
      farmId: '',
      title: '',
      description: '',
      irrigationMethod: '',
      waterSource: '',
      frequency: '',
      soilMoistureThreshold: '',
      weatherConditions: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
  };
  
  // New handler for weather task plan
  const handleAddWeatherTaskPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setWeatherTaskPlans([...weatherTaskPlans, {
      ...newWeatherTaskPlan,
      id: Date.now(),
      status: 'planned'
    }]);
    setIsAddingWeatherTaskPlan(false);
    setNewWeatherTaskPlan({
      farmId: '',
      title: '',
      description: '',
      taskType: '',
      weatherCondition: '',
      taskActions: '',
      priority: 'medium',
      startDate: '',
      endDate: '',
      notes: ''
    });
  };
  
  // New handler for rotation plan
  const handleAddRotationPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setRotationPlans([...rotationPlans, {
      ...newRotationPlan,
      id: Date.now(),
      status: 'planned'
    }]);
    setIsAddingRotationPlan(false);
    setNewRotationPlan({
      farmId: '',
      title: '',
      description: '',
      rotationCrops: [],
      rotationInterval: '',
      soilPreparation: '',
      expectedBenefits: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
  };
  
  // New handler for rainwater harvesting plan
  const handleAddRainwaterPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setRainwaterPlans([...rainwaterPlans, {
      ...newRainwaterPlan,
      id: Date.now(),
      status: 'planned'
    }]);
    setIsAddingRainwaterPlan(false);
    setNewRainwaterPlan({
      farmId: '',
      title: '',
      description: '',
      harvestingMethod: '',
      storageType: '',
      harvestingCapacity: '',
      collectionArea: '',
      filteringMethod: '',
      usageIntent: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
  };

  const updatePlanStatus = (planType: 'planting' | 'fertilizer' | 'pest' | 'irrigation' | 'weatherTask' | 'rotation' | 'rainwater', id: number, status: 'planned' | 'in-progress' | 'completed' | 'cancelled') => {
    switch (planType) {
      case 'planting':
        setPlantingPlans(plantingPlans.map(plan => 
          plan.id === id ? { ...plan, status } : plan
        ));
        break;
      case 'fertilizer':
        setFertilizerPlans(fertilizerPlans.map(plan => 
          plan.id === id ? { ...plan, status } : plan
        ));
        break;
      case 'pest':
        setPestManagementPlans(pestManagementPlans.map(plan => 
          plan.id === id ? { ...plan, status } : plan
        ));
        break;
      case 'irrigation':
        setIrrigationPlans(irrigationPlans.map(plan => 
          plan.id === id ? { ...plan, status } : plan
        ));
        break;
      case 'weatherTask':
        setWeatherTaskPlans(weatherTaskPlans.map(plan => 
          plan.id === id ? { ...plan, status } : plan
        ));
        break;
      case 'rotation':
        setRotationPlans(rotationPlans.map(plan => 
          plan.id === id ? { ...plan, status } : plan
        ));
        break;
      case 'rainwater':
        setRainwaterPlans(rainwaterPlans.map(plan => 
          plan.id === id ? { ...plan, status } : plan
        ));
        break;
    }
  };

  const handleDeletePlan = (planType: 'planting' | 'fertilizer' | 'pest' | 'irrigation' | 'weatherTask' | 'rotation' | 'rainwater', id: number) => {
    setConfirmDelete({ id, type: `${planType}Plan` });
  };

  const confirmDeleteAction = () => {
    if (confirmDelete) {
      switch (confirmDelete.type) {
        case 'farm':
          setFarms(farms.filter(farm => farm.id !== confirmDelete.id));
          break;
        case 'waterUsage':
          setFarms(farms.map(farm => {
            if (farm.id === confirmDelete.id) {
              return {
                ...farm,
                waterHistory: farm.waterHistory.filter(usage => 
                  new Date(usage.date).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return farm;
          }));
          break;
        case 'fertilizer':
          setFarms(farms.map(farm => {
            if (farm.id === confirmDelete.id) {
              return {
                ...farm,
                fertilizerHistory: farm.fertilizerHistory.filter(fertilizer => 
                  new Date(fertilizer.date).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return farm;
          }));
          break;
        case 'harvest':
          setFarms(farms.map(farm => {
            if (farm.id === confirmDelete.id) {
              return {
                ...farm,
                harvestHistory: farm.harvestHistory.filter(harvest => 
                  new Date(harvest.date).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return farm;
          }));
          break;
        case 'rotation':
          setFarms(farms.map(farm => {
            if (farm.id === confirmDelete.id) {
              return {
                ...farm,
                rotationHistory: (farm.rotationHistory || []).filter(rotation => 
                  new Date(rotation.startDate).toISOString() !== new Date(confirmDelete.date!).toISOString()
                )
              };
            }
            return farm;
          }));
          break;
        case 'task':
          setTasks(tasks.filter(task => task.id !== confirmDelete.id));
          break;
        case 'cropEvent':
          setCropPlanEvents(prev => prev.filter(event => event.id !== confirmDelete.eventId));
          break;
        case 'plantingPlan':
          setPlantingPlans(plantingPlans.filter(plan => plan.id !== confirmDelete.id));
          break;
        case 'fertilizerPlan':
          setFertilizerPlans(fertilizerPlans.filter(plan => plan.id !== confirmDelete.id));
          break;
        case 'pestPlan':
          setPestManagementPlans(pestManagementPlans.filter(plan => plan.id !== confirmDelete.id));
          break;
        case 'irrigationPlan':
          setIrrigationPlans(irrigationPlans.filter(plan => plan.id !== confirmDelete.id));
          break;
        case 'weatherTaskPlan':
          setWeatherTaskPlans(weatherTaskPlans.filter(plan => plan.id !== confirmDelete.id));
          break;
        case 'rotationPlan':
          setRotationPlans(rotationPlans.filter(plan => plan.id !== confirmDelete.id));
          break;
        case 'rainwaterPlan':
          setRainwaterPlans(rainwaterPlans.filter(plan => plan.id !== confirmDelete.id));
          break;
        default:
          break;
      }
      setConfirmDelete(null);
    }
  };

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    localStorage.setItem('walkthroughCompleted', 'true');
  };

  const handleStartWalkthrough = () => {
    setShowWalkthrough(true);
    localStorage.removeItem('walkthroughCompleted');
    setActiveTab('overview'); // Switch to overview tab when starting walkthrough
  };

  const handleExportData = () => {
    const exportData: ExportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      farms,
      tasks,
      issues,
      cropPlanEvents,
      plantingPlans,
      fertilizerPlans,
      pestManagementPlans
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as ExportData;
        
        // Validate the imported data structure
        if (!importedData.version || !importedData.exportDate) {
          throw new Error('Invalid file format');
        }

        // Convert date strings back to Date objects in cropPlanEvents
        const processedEvents = importedData.cropPlanEvents.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));

        // Update all state
        setFarms(importedData.farms);
        setTasks(importedData.tasks);
        setIssues(importedData.issues);
        setCropPlanEvents(processedEvents);

        // Update planner data if available
        if (importedData.plantingPlans) setPlantingPlans(importedData.plantingPlans);
        if (importedData.fertilizerPlans) setFertilizerPlans(importedData.fertilizerPlans);
        if (importedData.pestManagementPlans) setPestManagementPlans(importedData.pestManagementPlans);

        setImportNotification({
          success: true,
          message: 'Data imported successfully'
        });
      } catch (error) {
        setImportNotification({
          success: false,
          message: 'Error importing file: Invalid format'
        });
      }
    };
    reader.readAsText(file);
  };

  const sustainabilityMetrics = useMemo<ISustainabilityMetrics | null>(() => calculateSustainabilityMetrics(getFilteredFarms(), weatherData), [farms, weatherData, cropFilter]);

  const handleDeleteEvent = (eventId: number) => {
    setConfirmDelete({ id: 0, type: 'cropEvent', eventId });
  };

  const PlannerView = () => {
    return (
      <PlannerDashboard
        farms={farms}
        plantingPlans={plantingPlans}
        fertilizerPlans={fertilizerPlans}
        pestManagementPlans={pestManagementPlans}
        irrigationPlans={irrigationPlans}
        weatherTaskPlans={weatherTaskPlans}
        rotationPlans={rotationPlans}
        rainwaterPlans={rainwaterPlans}
        setIsAddingPlantingPlan={setIsAddingPlantingPlan}
        setIsAddingFertilizerPlan={setIsAddingFertilizerPlan}
        setIsAddingPestPlan={setIsAddingPestPlan}
        setIsAddingIrrigationPlan={setIsAddingIrrigationPlan}
        setIsAddingWeatherTaskPlan={setIsAddingWeatherTaskPlan}
        setIsAddingRotationPlan={setIsAddingRotationPlan}
        setIsAddingRainwaterPlan={setIsAddingRainwaterPlan}
        updatePlanStatus={updatePlanStatus}
        handleDeletePlan={handleDeletePlan}
        cropPlanEvents={cropPlanEvents}
        setCropPlanEvents={setCropPlanEvents}
        handleDeleteEvent={handleDeleteEvent}
        weatherData={weatherData}
      />
    );
  };

  const UpcomingCropPlan = () => {
    const nextTwoWeeks = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const twoWeeksFromNow = new Date(today);
      twoWeeksFromNow.setDate(today.getDate() + 14);
  
      return cropPlanEvents
        .filter(event => {
          const eventDate = new Date(event.start);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today && eventDate <= twoWeeksFromNow;
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 5); // Show only next 5 events for cleaner UI
    }, [cropPlanEvents]);
  
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upcoming Events</span>
            <span className="text-sm font-normal text-gray-500">Next 14 days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {nextTwoWeeks.length > 0 ? (
              nextTwoWeeks.map(event => (
                <div 
                  key={event.id} 
                  className={`p-2 rounded ${
                    event.type === 'planting' ? 'bg-blue-50 border-l-4 border-blue-500' :
                    event.type === 'fertilizing' ? 'bg-green-50 border-l-4 border-green-500' :
                    event.type === 'harvesting' ? 'bg-purple-50 border-l-4 border-purple-500' : 
                    'bg-gray-50 border-l-4 border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Farm: {farms.find(f => f.id === event.farmId)?.name}</span>
                        <span>•</span>
                        <span>{event.type}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(event.start).toLocaleDateString()}
                    </p>
                  </div>
                  {event.notes && (
                    <p className="mt-1 text-sm text-gray-500 italic">
                      {event.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No upcoming events in the next two weeks
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const FarmIssues = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Farm Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.length > 0 ? (
              issues.map(issue => (
                <div key={issue.id} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{issue.type}</h3>
                      <p className="text-sm text-gray-600">{issue.description}</p>
                    </div>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Reported: {new Date(issue.dateReported).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No active issues</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const Reports = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Farm Performance Report</CardTitle>
        </CardHeader>          <CardContent>
          <CropFilter 
            farms={farms}
            cropFilter={cropFilter}
            setCropFilter={setCropFilter}
          />
          {getFilteredFarms().length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Droplet className="h-6 w-6 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-500">Total Water Usage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {getFilteredFarms()
                      .reduce(
                        (total, farm) =>
                          total +
                          farm.waterHistory.reduce(
                            (sum, record) => sum + record.amount,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}{" "}
                    gal
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Leaf className="h-6 w-6 text-green-500 mb-2" />
                  <p className="text-sm text-gray-500">Total Fertilizer Used</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getFilteredFarms()
                      .reduce(
                        (total, farm) =>
                          total +
                          farm.fertilizerHistory.reduce(
                            (sum, record) => sum + record.amount,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}{" "}
                    lbs
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <LayoutDashboard className="h-6 w-6 text-purple-500 mb-2" />
                  <p className="text-sm text-gray-500">Total Harvest</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {getFilteredFarms()
                      .reduce(
                        (total, farm) =>
                          total +
                          farm.harvestHistory.reduce(
                            (sum, record) => sum + record.amount,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}{" "}
                    bu
                  </p>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFilteredFarms().flatMap((farm) =>
                      farm.harvestHistory.map((harvest) => ({
                        farm: farm.name,
                        amount: harvest.amount,
                        date: new Date(harvest.date).toLocaleDateString(),
                      }))
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="#8884d8"
                      name="Harvest Amount (bu)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">
                {farms.length === 0
                  ? "No data available. Add farms and record activities to see reports."
                  : "No farms found for the selected crop."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Add this new function component for planner recommendations
  const PlannerRecommendations = () => {
    // Combine all plan types
    const allPlans = [
      ...plantingPlans.map(plan => ({ ...plan, type: 'planting' })),
      ...fertilizerPlans.map(plan => ({ ...plan, type: 'fertilizer' })),
      ...pestManagementPlans.map(plan => ({ ...plan, type: 'pest' })),
      ...irrigationPlans.map(plan => ({ ...plan, type: 'irrigation' })),
      ...weatherTaskPlans.map(plan => ({ ...plan, type: 'weatherTask' })),
      ...rotationPlans.map(plan => ({ ...plan, type: 'rotation' })),
      ...rainwaterPlans.map(plan => ({ ...plan, type: 'rainwater' })),
    ];
    
    // Get upcoming plans (next 30 days) that are not completed or cancelled
    const upcomingPlans = allPlans
      .filter(plan => {
        const startDate = new Date(plan.startDate);
        const today = new Date();
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        return startDate >= today && 
               startDate <= thirtyDaysFromNow && 
               plan.status !== 'completed' && 
               plan.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 4); // Show only next 4 plans
    
    const getTypeIcon = (type: string) => {
      switch(type) {
        case 'planting': return <Leaf className="h-4 w-4 text-green-600" />;
        case 'fertilizer': return <Leaf className="h-4 w-4 text-blue-600" />;
        case 'pest': return <Bug className="h-4 w-4 text-red-600" />;
        case 'irrigation': return <Droplet className="h-4 w-4 text-blue-600" />;
        case 'weatherTask': return <Cloud className="h-4 w-4 text-gray-600" />;
        case 'rotation': return <RotateCw className="h-4 w-4 text-orange-600" />;
        case 'rainwater': return <CloudRain className="h-4 w-4 text-indigo-600" />;
        default: return <Info className="h-4 w-4 text-gray-600" />;
      }
    };

    const getTypeLabel = (type: string) => {
      switch(type) {
        case 'planting': return 'Planting';
        case 'fertilizer': return 'Fertilizer';
        case 'pest': return 'Pest Management';
        case 'irrigation': return 'Irrigation';
        case 'weatherTask': return 'Weather Task';
        case 'rotation': return 'Crop Rotation';
        case 'rainwater': return 'Rainwater';
        default: return 'Plan';
      }
    };
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Planner Recommendations</span>
            <span className="text-sm font-normal text-gray-500">Next 30 days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingPlans.length > 0 ? (
              upcomingPlans.map(plan => {
                const farmName = farms.find(f => f.id === parseInt(plan.farmId))?.name || "Unknown Farm";
                
                return (
                  <div 
                    key={`${plan.type}-${plan.id}`} 
                    className={`p-3 rounded-lg border ${
                      plan.status === 'in-progress' ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getTypeIcon(plan.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-800">{plan.title}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            plan.status === 'planned' ? 'bg-yellow-100 text-yellow-800' : 
                            plan.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="font-medium text-gray-600 mr-2">{getTypeLabel(plan.type)}</span>
                          <span>•</span>
                          <span className="mx-2">{farmName}</span>
                          <span>•</span>
                          <span className="ml-2">
                            {new Date(plan.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-4 text-gray-500">
                No upcoming plans for the next 30 days
              </div>
            )}
            
            {upcomingPlans.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => setActiveTab('planners')}
              >
                View All Plans
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Using our imported Walkthrough component */}
      {showWalkthrough && <Walkthrough 
        onComplete={handleWalkthroughComplete} 
        setActiveTab={setActiveTab} 
        WALKTHROUGH_STEPS={WALKTHROUGH_STEPS}
      />}
      <div className="p-6 max-w-7xl mx-auto bg-white">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Farm Management Dashboard</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleExportData}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export Data</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => document.getElementById('importDataFile')?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Import Data</span>
                  <input
                    type="file"
                    id="importDataFile"
                    className="hidden"
                    accept=".json"
                    onChange={handleImportData}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStartWalkthrough}>
                  <Info className="mr-2 h-4 w-4" />
                  <span>Start Tutorial</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList className="hidden md:flex">
                <TabsTrigger data-walkthrough="overview-tab" value="overview">Overview</TabsTrigger>
                <TabsTrigger data-walkthrough="water-tab" value="water">Water Management</TabsTrigger>
                <TabsTrigger data-walkthrough="farms-tab" value="farms">Farms</TabsTrigger>
                <TabsTrigger data-walkthrough="issues-tab" value="issues">Farm Issues</TabsTrigger>
                <TabsTrigger data-walkthrough="reports-tab" value="reports">Reports</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger data-walkthrough="crop-plan" value="cropplan">Crop Plan</TabsTrigger>
                <TabsTrigger data-walkthrough="planners-tab" value="planners">Planners</TabsTrigger>
                <TabsTrigger value="instructions"><Info className="h-4 w-4 mr-2" />Instructions</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card data-walkthrough="quick-actions">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Dialog open={isAddingWaterUsage} onOpenChange={setIsAddingWaterUsage}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-blue-500 hover:bg-blue-600">
                            <Droplet className="h-4 w-4 mr-2" />
                            Record Water Usage
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Water Usage</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={isEditingWaterUsage ? handleEditWaterUsage : handleAddWaterUsage} className="space-y-4">
                            <div>
                              <Label>Farm</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newWaterUsage.farmId}
                                onChange={(e) => setNewWaterUsage({...newWaterUsage, farmId: e.target.value})}
                                required
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

                      <Dialog open={isAddingFertilizer} onOpenChange={setIsAddingFertilizer}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-green-500 hover:bg-green-600">
                            <Leaf className="h-4 w-4 mr-2" />
                            Record Fertilizer Application
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Fertilizer Application</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={isEditingFertilizer ? handleEditFertilizer : handleAddFertilizer} className="space-y-4">
                            <div>
                              <Label>Farm</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newFertilizer.farmId}
                                onChange={(e) => setNewFertilizer({...newFertilizer, farmId: e.target.value})}
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
                            <Button type="submit" className="w-full">Save Fertilizer Application</Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isAddingHarvest} onOpenChange={setIsAddingHarvest}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-purple-500 hover:bg-purple-600">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Record Harvest
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Harvest</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={isEditingHarvest ? handleEditHarvest : handleAddHarvest} className="space-y-4">
                            <div>
                              <Label>Farm</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newHarvest.farmId}
                                onChange={(e) => setNewHarvest({...newHarvest, farmId: e.target.value})}
                                required
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

                      <Dialog open={isAddingRotation} onOpenChange={setIsAddingRotation}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-orange-500 hover:bg-orange-600">
                            <RotateCw className="h-4 w-4 mr-2" />
                            Record Crop Rotation
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Crop Rotation</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddRotation} className="space-y-4">
                            <div>
                              <Label>Farm</Label>
                              <select 
                                className="w-full p-2 border rounded"
                                value={newRotation.farmId}
                                onChange={(e) => setNewRotation({...newRotation, farmId: e.target.value})}
                                required
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
                    </div>
                  </CardContent>
                </Card>
                {/* Use the imported SustainabilityScoreCard component */}
                <SustainabilityScoreCard 
                  sustainabilityMetrics={sustainabilityMetrics} 
                  cropFilter={cropFilter} 
                  setCropFilter={setCropFilter}
                  farms={getFilteredFarms()}
                />
                {/* Add the new PlannerRecommendations component */}
                <PlannerRecommendations />
                {/* Use the imported WeatherPreview component */}
                <WeatherPreview weatherData={weatherData} />
                <UpcomingCropPlan />
                <FarmIssues />
                {/* Use the imported TaskManager component */}
                <TaskManager tasks={tasks} setTasks={setTasks} handleDeleteTask={handleDeleteTask} />
              </div>
            </TabsContent>

            <TabsContent value="issues">
              {/* Use the imported IssueTracker component with props */}
              <IssueTracker 
                issues={issues} 
                setIssues={setIssues} 
                handleResolveIssue={handleResolveIssue}
              />
            </TabsContent>

            <TabsContent value="water">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Water Usage Tracker</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {farms.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={farms.flatMap(farm => 
                            farm.waterHistory.map(usage => ({
                              farm: farm.name,
                              amount: usage.amount,
                              date: new Date(usage.date).toLocaleDateString()
                            }))
                          )}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#3b82f6" name="Water Usage (gal)" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No water usage data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="farms">
              <div className="space-y-4">
                <Button
                  data-walkthrough="add-farm"
                  onClick={() => setIsAddingFarm(true)}
                  className="mb-4"
                >
                  Add New Farm
                </Button>

                <Dialog open={isAddingFarm} onOpenChange={setIsAddingFarm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Farm</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddFarm} className="space-y-4">
                      <div>
                        <Label>Farm Name</Label>
                        <Input
                          value={newFarm.name}
                          onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Size (acres)</Label>
                        <Input
                          type="number"
                          value={newFarm.size}
                          onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Current Crop</Label>
                        <Input
                          value={newFarm.crop}
                          onChange={(e) => setNewFarm({ ...newFarm, crop: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Crop Rotation History</Label>
                        <div className="space-y-2">
                          {newFarm.rotationHistory.map((rotation, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <Input
                                placeholder="Crop"
                                value={rotation.crop}
                                onChange={(e) => {
                                  const updated = [...newFarm.rotationHistory];
                                  updated[index].crop = e.target.value;
                                  setNewFarm({ ...newFarm, rotationHistory: updated });
                                }}
                                className="border rounded px-2 py-1"
                              />
                              <Input
                                type="date"
                                value={rotation.startDate}
                                onChange={(e) => {
                                  const updated = [...newFarm.rotationHistory];
                                  updated[index].startDate = e.target.value;
                                  setNewFarm({ ...newFarm, rotationHistory: updated });
                                }}
                                className="border rounded px-2 py-1"
                              />
                              <Input
                                type="date"
                                value={rotation.endDate}
                                onChange={(e) => {
                                  const updated = [...newFarm.rotationHistory];
                                  updated[index].endDate = e.target.value;
                                  setNewFarm({ ...newFarm, rotationHistory: updated });
                                }}
                                className="border rounded px-2 py-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = newFarm.rotationHistory.filter((_, i) => i !== index);
                                  setNewFarm({ ...newFarm, rotationHistory: updated });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setNewFarm({
                                ...newFarm,
                                rotationHistory: [
                                  ...newFarm.rotationHistory,
                                  { crop: '', startDate: '', endDate: '' }
                                ]
                              });
                            }}
                          >
                            Add Rotation Entry
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        Add Farm
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditingFarm} onOpenChange={setIsEditingFarm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Farm</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditFarm} className="space-y-4">
                      <div>
                        <Label>Farm Name</Label>
                        <Input
                          value={newFarm.name}
                          onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Size (acres)</Label>
                        <Input
                          type="number"
                          value={newFarm.size}
                          onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <Label>Crop Type</Label>
                        <Input
                          value={newFarm.crop}
                          onChange={(e) => setNewFarm({ ...newFarm, crop: e.target.value })}
                          required
                          className="border rounded px-2 py-1"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Save Changes
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farms.length > 0 ? (
                    farms.map((farm) => (
                      <Card
                        key={farm.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle>{farm.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-gray-500">Current Crop: {farm.crop}</p>
                            <p className="text-gray-500">Size: {farm.size.toLocaleString()} acres</p>
                            
                            {farm.rotationHistory && farm.rotationHistory.length > 0 && (
                              <div className="mt-4">
                                <p className="font-medium mb-2">Crop Rotation History</p>
                                <div className="space-y-1">
                                  {farm.rotationHistory.map((rotation, index) => (
                                    <div key={index} className="text-sm text-gray-600">
                                      {rotation.crop}: {new Date(rotation.startDate).toLocaleDateString()} - {new Date(rotation.endDate).toLocaleDateString()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Droplet className="h-4 w-4 text-blue-500" />
                                <span>
                                  Last watered:{" "}
                                  {farm.waterHistory.length > 0
                                    ? new Date(
                                        farm.waterHistory[farm.waterHistory.length - 1].date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-green-500" />
                                <span>
                                  Last fertilized:{" "}
                                  {farm.fertilizerHistory.length > 0
                                    ? new Date(
                                        farm.fertilizerHistory[farm.fertilizerHistory.length - 1]
                                          .date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4 text-purple-500" />
                                <span>
                                  Last harvest:{" "}
                                  {farm.harvestHistory.length > 0
                                    ? new Date(
                                        farm.harvestHistory[farm.harvestHistory.length - 1].date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <RotateCw className="h-4 w-4 text-orange-500" />
                                <span>
                                  Last rotation:{" "}
                                  {farm.rotationHistory && farm.rotationHistory.length > 0
                                    ? `${farm.rotationHistory[farm.rotationHistory.length - 1].crop} (${
                                        new Date(farm.rotationHistory[farm.rotationHistory.length - 1].startDate).toLocaleDateString()
                                      })`
                                    : "Never"}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingFarm(farm);
                                  setNewFarm({ 
                                    name: farm.name, 
                                    size: farm.size, 
                                    crop: farm.crop,
                                    rotationHistory: farm.rotationHistory || []
                                  });
                                  setIsEditingFarm(true);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteFarm(farm.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center p-8 border rounded-lg border-dashed">
                      <p className="text-gray-500">
                        No farms added yet. Click "Add New Farm" to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <Reports />
            </TabsContent>

            <TabsContent value="instructions">
              {/* Use our imported Instructions component */}
              <Instructions onStartWalkthrough={handleStartWalkthrough} />
            </TabsContent>

            <TabsContent value="history">
              {/* Use the imported HistoryPage component with props */}
              <HistoryPage 
                farms={farms} 
                setEditingWaterUsage={setEditingWaterUsage}
                editingWaterUsage={editingWaterUsage}
                isEditingWaterUsage={isEditingWaterUsage}
                newWaterUsage={newWaterUsage}
                handleEditWaterUsage={handleEditWaterUsage}
                setNewWaterUsage={setNewWaterUsage} 
                setIsEditingWaterUsage={setIsEditingWaterUsage} 
                setIsAddingWaterUsage={setIsAddingWaterUsage}
                
                editingFertilizer={editingFertilizer}
                isEditingFertilizer={isEditingFertilizer}
                newFertilizer={newFertilizer}
                handleEditFertilizer={handleEditFertilizer}
                setEditingFertilizer={setEditingFertilizer} 
                setNewFertilizer={setNewFertilizer} 
                setIsEditingFertilizer={setIsEditingFertilizer} 
                setIsAddingFertilizer={setIsAddingFertilizer} 
                
                editingHarvest={editingHarvest}
                isEditingHarvest={isEditingHarvest}
                newHarvest={newHarvest}
                handleEditHarvest={handleEditHarvest}
                setEditingHarvest={setEditingHarvest} 
                setNewHarvest={setNewHarvest} 
                setIsEditingHarvest={setIsEditingHarvest} 
                setIsAddingHarvest={setIsAddingHarvest} 
                
                newRotation={newRotation}
                isAddingRotation={isAddingRotation}
                handleAddRotation={handleAddRotation}
                setNewRotation={setNewRotation} 
                setIsAddingRotation={setIsAddingRotation} 
                
                setConfirmDelete={setConfirmDelete} 
              />
            </TabsContent>

            <TabsContent value="cropplan">
              <PlannerView />
            </TabsContent>

            <TabsContent value="planners">
              <PlannerView />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this {confirmDelete?.type}?</p>
            <Button onClick={confirmDeleteAction} className="w-full">Confirm</Button>
            <Button variant="outline" onClick={() => setConfirmDelete(null)} className="w-full">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <PlantingPlanForm
        isOpen={isAddingPlantingPlan}
        onOpenChange={setIsAddingPlantingPlan}
        farms={farms}
        newPlantingPlan={newPlantingPlan}
        setNewPlantingPlan={setNewPlantingPlan}
        handleAddPlantingPlan={handleAddPlantingPlan}
      />

      <FertilizerPlanForm
        isOpen={isAddingFertilizerPlan}
        onOpenChange={setIsAddingFertilizerPlan}
        farms={farms}
        newFertilizerPlan={newFertilizerPlan}
        setNewFertilizerPlan={setNewFertilizerPlan}
        handleAddFertilizerPlan={handleAddFertilizerPlan}
      />

      <PestManagementPlanForm
        isOpen={isAddingPestPlan}
        onOpenChange={setIsAddingPestPlan}
        farms={farms}
        newPestPlan={newPestPlan}
        setNewPestPlan={setNewPestPlan}
        handleAddPestPlan={handleAddPestPlan}
      />
      
      <IrrigationPlanForm
        isOpen={isAddingIrrigationPlan}
        onOpenChange={setIsAddingIrrigationPlan}
        farms={farms}
        newIrrigationPlan={newIrrigationPlan}
        setNewIrrigationPlan={setNewIrrigationPlan}
        handleAddIrrigationPlan={handleAddIrrigationPlan}
      />
      
      <WeatherTaskPlanForm
        isOpen={isAddingWeatherTaskPlan}
        onOpenChange={setIsAddingWeatherTaskPlan}
        farms={farms}
        newWeatherTaskPlan={newWeatherTaskPlan}
        setNewWeatherTaskPlan={setNewWeatherTaskPlan}
        handleAddWeatherTaskPlan={handleAddWeatherTaskPlan}
      />
      
      <RotationPlanForm
        isOpen={isAddingRotationPlan}
        onOpenChange={setIsAddingRotationPlan}
        farms={farms}
        newRotationPlan={newRotationPlan}
        setNewRotationPlan={setNewRotationPlan}
        handleAddRotationPlan={handleAddRotationPlan}
      />
      
      <RainwaterPlanForm
        isOpen={isAddingRainwaterPlan}
        onOpenChange={setIsAddingRainwaterPlan}
        farms={farms}
        newRainwaterPlan={newRainwaterPlan}
        setNewRainwaterPlan={setNewRainwaterPlan}
        handleAddRainwaterPlan={handleAddRainwaterPlan}
      />
      
      <Dialog 
        open={!!importNotification} 
        onOpenChange={() => setImportNotification(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {importNotification?.success ? 'Import Successful' : 'Import Failed'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{importNotification?.message}</p>
            <Button 
              variant="outline" 
              onClick={() => setImportNotification(null)} 
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DefaultComponent;
