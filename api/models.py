# Create your models here.
# your_app/models.py
from django.db import models

class Farm(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    size = models.CharField(max_length=50)
    crop = models.CharField(max_length=100)
    soil_type = models.CharField(max_length=50, blank=True)
    slope_ratio = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = 'farms'

    def __str__(self):
        return self.name

class WaterHistory(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='water_history')
    amount = models.IntegerField()
    date = models.DateField()
    efficiency = models.IntegerField()

    class Meta:
        db_table = 'water_history'

class FertilizerHistory(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='fertilizer_history')
    type = models.CharField(max_length=50)
    amount = models.IntegerField()
    date = models.DateField()

    class Meta:
        db_table = 'fertilizer_history'

class HarvestHistory(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='harvest_history')
    yield_amount = models.IntegerField()
    date = models.DateField()

    class Meta:
        db_table = 'harvest_history'

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    due_date = models.DateField()
    priority = models.CharField(max_length=20)
    completed = models.BooleanField(default=False)

    class Meta:
        db_table = 'tasks'

    def __str__(self):
        return self.title

class Issue(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=50)

    class Meta:
        db_table = 'issues'

    def __str__(self):
        return self.title

class CropPlanEvent(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200, blank=True)
    date = models.DateField()

    class Meta:
        db_table = 'crop_plan_events'

    def __str__(self):
        return self.title

class PlanItem(models.Model):
    id = models.AutoField(primary_key=True)
    plan_type = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'plan_items'

    def __str__(self):
        return f"{self.plan_type}: {self.description[:50]}"

class FuelRecord(models.Model):
    id = models.AutoField(primary_key=True)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='fuel_records')
    date = models.DateField()
    equipment_name = models.CharField(max_length=100)
    fuel_type = models.CharField(max_length=50)
    gallons = models.FloatField()
    hours_operated = models.FloatField()
    cost = models.FloatField()
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'fuel_records'

class SoilRecord(models.Model):
    id = models.AutoField(primary_key=True)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='soil_records')
    date = models.DateField()
    location = models.CharField(max_length=100)
    ph = models.FloatField()
    organic_matter = models.FloatField()
    nitrogen = models.FloatField()
    phosphorus = models.FloatField()
    potassium = models.FloatField()
    moisture = models.FloatField()
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'soil_records'

class EmissionSource(models.Model):
    id = models.AutoField(primary_key=True)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='emission_sources')
    date = models.DateField()
    source_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    co2_equivalent = models.FloatField()
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'emission_sources'

class SequestrationActivity(models.Model):
    id = models.AutoField(primary_key=True)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='sequestration_activities')
    date = models.DateField()
    activity_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    co2_sequestered = models.FloatField()
    area = models.FloatField()
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'sequestration_activities'

class EnergyRecord(models.Model):
    id = models.AutoField(primary_key=True)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='energy_records')
    date = models.DateField()
    energy_type = models.CharField(max_length=50)
    amount = models.FloatField()
    unit = models.CharField(max_length=20)
    renewable = models.BooleanField(default=False)
    cost = models.FloatField()
    purpose = models.CharField(max_length=100)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'energy_records'

class Livestock(models.Model):
    id = models.AutoField(primary_key=True)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='livestock')
    type = models.CharField(max_length=50)
    count = models.IntegerField()

    class Meta:
        db_table = 'livestock'

    def __str__(self):
        return f"{self.type} ({self.count})"