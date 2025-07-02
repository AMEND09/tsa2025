# your_app/serializers.py
from rest_framework import serializers
from .models import (
    Farm, WaterHistory, FertilizerHistory, HarvestHistory, Task, Issue,
    CropPlanEvent, PlanItem, FuelRecord, SoilRecord, EmissionSource,
    SequestrationActivity, EnergyRecord, Livestock, UserData
)

class WaterHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterHistory
        fields = ['amount', 'date', 'efficiency']

class FertilizerHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FertilizerHistory
        fields = ['type', 'amount', 'date']

class HarvestHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvestHistory
        fields = ['yield_amount', 'date']

class FarmSerializer(serializers.ModelSerializer):
    water_history = WaterHistorySerializer(many=True, read_only=True)
    fertilizer_history = FertilizerHistorySerializer(many=True, read_only=True)
    harvest_history = HarvestHistorySerializer(many=True, read_only=True)
    fuel_records = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    soil_records = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    emission_sources = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    sequestration_activities = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    energy_records = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    livestock = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Farm
        fields = ['id', 'name', 'size', 'crop', 'soil_type', 'slope_ratio',
                  'water_history', 'fertilizer_history', 'harvest_history',
                  'fuel_records', 'soil_records', 'emission_sources',
                  'sequestration_activities', 'energy_records', 'livestock']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'due_date', 'priority', 'completed']

class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['id', 'title', 'status']

class CropPlanEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropPlanEvent
        fields = ['id', 'title', 'date']

class PlanItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanItem
        fields = ['id', 'plan_type', 'description']

class FuelRecordSerializer(serializers.ModelSerializer):
    farm_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = FuelRecord
        fields = ['id', 'farm_id', 'date', 'equipment_name', 'fuel_type',
                  'gallons', 'hours_operated', 'cost', 'notes']

class SoilRecordSerializer(serializers.ModelSerializer):
    farm_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SoilRecord
        fields = ['id', 'farm_id', 'date', 'location', 'ph', 'organic_matter',
                  'nitrogen', 'phosphorus', 'potassium', 'moisture', 'notes']

class EmissionSourceSerializer(serializers.ModelSerializer):
    farm_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = EmissionSource
        fields = ['id', 'farm_id', 'date', 'source_type', 'description',
                  'co2_equivalent', 'notes']

class SequestrationActivitySerializer(serializers.ModelSerializer):
    farm_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SequestrationActivity
        fields = ['id', 'farm_id', 'date', 'activity_type', 'description',
                  'co2_sequestered', 'area', 'notes']

class EnergyRecordSerializer(serializers.ModelSerializer):
    farm_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = EnergyRecord
        fields = ['id', 'farm_id', 'date', 'energy_type', 'amount', 'unit',
                  'renewable', 'cost', 'purpose', 'notes']

class LivestockSerializer(serializers.ModelSerializer):
    farm_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Livestock
        fields = ['id', 'farm_id', 'type', 'count']

class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ['key', 'value']

class ExportDataSerializer(serializers.Serializer):
    farms = FarmSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True)
    issues = IssueSerializer(many=True)
    crop_plan_events = CropPlanEventSerializer(many=True, source='cropPlanEvents')
    planting_plans = PlanItemSerializer(many=True, source='plantingPlans')
    fertilizer_plans = PlanItemSerializer(many=True, source='fertilizerPlans')
    pest_management_plans = PlanItemSerializer(many=True, source='pestManagementPlans')
    irrigation_plans = PlanItemSerializer(many=True, source='irrigationPlans')
    weather_task_plans = PlanItemSerializer(many=True, source='weatherTaskPlans')
    rotation_plans = PlanItemSerializer(many=True, source='rotationPlans')
    rainwater_plans = PlanItemSerializer(many=True, source='rainwaterPlans')
    fuel_records = FuelRecordSerializer(many=True)
    soil_records = SoilRecordSerializer(many=True)
    emission_sources = EmissionSourceSerializer(many=True)
    sequestration_activities = SequestrationActivitySerializer(many=True)
    energy_records = EnergyRecordSerializer(many=True)
    livestock = LivestockSerializer(many=True)