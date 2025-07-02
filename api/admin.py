from django.contrib import admin

# Register your models here.
# your_app/admin.py
from django.contrib import admin
from .models import (
    Farm, WaterHistory, FertilizerHistory, HarvestHistory, Task, Issue,
    CropPlanEvent, PlanItem, FuelRecord, SoilRecord, EmissionSource,
    SequestrationActivity, EnergyRecord, Livestock, UserData
)

# Inlines for related models
class WaterHistoryInline(admin.TabularInline):
    model = WaterHistory
    extra = 1

class FertilizerHistoryInline(admin.TabularInline):
    model = FertilizerHistory
    extra = 1

class HarvestHistoryInline(admin.TabularInline):
    model = HarvestHistory
    extra = 1

class FuelRecordInline(admin.TabularInline):
    model = FuelRecord
    extra = 1

class SoilRecordInline(admin.TabularInline):
    model = SoilRecord
    extra = 1

class EmissionSourceInline(admin.TabularInline):
    model = EmissionSource
    extra = 1

class SequestrationActivityInline(admin.TabularInline):
    model = SequestrationActivity
    extra = 1

class EnergyRecordInline(admin.TabularInline):
    model = EnergyRecord
    extra = 1

class LivestockInline(admin.TabularInline):
    model = Livestock
    extra = 1

@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'size', 'crop', 'soil_type', 'slope_ratio')
    search_fields = ('name', 'crop')
    list_filter = ('soil_type',)
    inlines = [
        WaterHistoryInline, FertilizerHistoryInline, HarvestHistoryInline,
        FuelRecordInline, SoilRecordInline, EmissionSourceInline,
        SequestrationActivityInline, EnergyRecordInline, LivestockInline
    ]

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'due_date', 'priority', 'completed')
    search_fields = ('title',)
    list_filter = ('priority', 'completed')
    list_editable = ('completed',)

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status')
    search_fields = ('title',)
    list_filter = ('status',)

@admin.register(CropPlanEvent)
class CropPlanEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'date')
    search_fields = ('title',)
    list_filter = ('date',)

@admin.register(PlanItem)
class PlanItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'plan_type', 'description')
    search_fields = ('description',)
    list_filter = ('plan_type',)

@admin.register(FuelRecord)
class FuelRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'farm', 'date', 'equipment_name', 'fuel_type', 'gallons', 'cost')
    search_fields = ('equipment_name', 'fuel_type')
    list_filter = ('fuel_type', 'date')
    list_select_related = ('farm',)

@admin.register(SoilRecord)
class SoilRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'farm', 'date', 'location', 'ph', 'organic_matter')
    search_fields = ('location',)
    list_filter = ('date',)
    list_select_related = ('farm',)

@admin.register(EmissionSource)
class EmissionSourceAdmin(admin.ModelAdmin):
    list_display = ('id', 'farm', 'date', 'source_type', 'co2_equivalent')
    search_fields = ('source_type', 'description')
    list_filter = ('source_type', 'date')
    list_select_related = ('farm',)

@admin.register(SequestrationActivity)
class SequestrationActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'farm', 'date', 'activity_type', 'co2_sequestered', 'area')
    search_fields = ('activity_type', 'description')
    list_filter = ('activity_type', 'date')
    list_select_related = ('farm',)

@admin.register(EnergyRecord)
class EnergyRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'farm', 'date', 'energy_type', 'amount', 'renewable', 'cost')
    search_fields = ('energy_type', 'purpose')
    list_filter = ('energy_type', 'renewable', 'date')
    list_select_related = ('farm',)

@admin.register(Livestock)
class LivestockAdmin(admin.ModelAdmin):
    list_display = ('id', 'farm', 'type', 'count')
    search_fields = ('type',)
    list_filter = ('type',)
    list_select_related = ('farm',)

@admin.register(UserData)
class UserDataAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'last_updated')
    list_filter = ('user', 'key')
    search_fields = ('user__username', 'key')
    readonly_fields = ('last_updated',)