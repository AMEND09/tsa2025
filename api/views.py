from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
import json
from datetime import datetime
from .models import (
    Farm, WaterHistory, FertilizerHistory, HarvestHistory, Task, Issue,
    CropPlanEvent, PlanItem, FuelRecord, SoilRecord, EmissionSource,
    SequestrationActivity, EnergyRecord, Livestock, UserLocalStorage # Added UserLocalStorage
)
from .serializers import (
    ExportDataSerializer, UserLocalStorageSerializer # Added UserLocalStorageSerializer
    # Make sure all other serializers like FarmSerializer, TaskSerializer are imported if used directly in this file
)
# Import other necessary serializers if they are not already imported
# from .serializers import FarmSerializer, TaskSerializer, IssueSerializer, CropPlanEventSerializer, PlanItemSerializer, FuelRecordSerializer, SoilRecordSerializer, EmissionSourceSerializer, SequestrationActivitySerializer, EnergyRecordSerializer, LivestockSerializer


class ImportDataView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        try:
            file = request.FILES.get('file')
            if not file:
                return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            data = json.load(file)
            Farm.objects.all().delete()
            Task.objects.all().delete()
            Issue.objects.all().delete()
            CropPlanEvent.objects.all().delete()
            PlanItem.objects.all().delete()
            FuelRecord.objects.all().delete()
            SoilRecord.objects.all().delete()
            EmissionSource.objects.all().delete()
            SequestrationActivity.objects.all().delete()
            EnergyRecord.objects.all().delete()
            Livestock.objects.all().delete()
            for farm_data in data.get('farms', []):
                farm = Farm.objects.create(
                    id=farm_data.get('id'),
                    name=farm_data.get('name'),
                    size=farm_data.get('size'),
                    crop=farm_data.get('crop'),
                    soil_type=farm_data.get('soilType', ''),
                    slope_ratio=farm_data.get('slopeRatio')
                )
                for water_data in farm_data.get('waterHistory', []):
                    WaterHistory.objects.create(farm=farm, **water_data)
                for fertilizer_data in farm_data.get('fertilizerHistory', []):
                    FertilizerHistory.objects.create(farm=farm, **fertilizer_data)
                for harvest_data in farm_data.get('harvestHistory', []):
                    HarvestHistory.objects.create(farm=farm, yield_amount=harvest_data['yield'], date=harvest_data['date'])
            for task_data in data.get('tasks', []):
                Task.objects.create(**task_data)
            for issue_data in data.get('issues', []):
                Issue.objects.create(**issue_data)
            for event_data in data.get('cropPlanEvents', []):
                CropPlanEvent.objects.create(**event_data)
            for plan_data in data.get('plantingPlans', []):
                PlanItem.objects.create(plan_type='Planting', **plan_data)
            for plan_data in data.get('fertilizerPlans', []):
                PlanItem.objects.create(plan_type='Fertilizer', **plan_data)
            for plan_data in data.get('pestManagementPlans', []):
                PlanItem.objects.create(plan_type='PestManagement', **plan_data)
            for plan_data in data.get('irrigationPlans', []):
                PlanItem.objects.create(plan_type='Irrigation', **plan_data)
            for plan_data in data.get('weatherTaskPlans', []):
                PlanItem.objects.create(plan_type='WeatherTask', **plan_data)
            for plan_data in data.get('rotationPlans', []):
                PlanItem.objects.create(plan_type='Rotation', **plan_data)
            for plan_data in data.get('rainwaterPlans', []):
                PlanItem.objects.create(plan_type='Rainwater', **plan_data)
            for fuel_data in data.get('fuelRecords', []):
                farm = Farm.objects.get(id=fuel_data['farmId'])
                FuelRecord.objects.create(farm=farm, **{k: v for k, v in fuel_data.items() if k != 'farmId'})
            for soil_data in data.get('soilRecords', []):
                farm = Farm.objects.get(id=soil_data['farmId'])
                SoilRecord.objects.create(farm=farm, **{k: v for k, v in soil_data.items() if k != 'farmId'})
            for emission_data in data.get('emissionSources', []):
                farm = Farm.objects.get(id=emission_data['farmId'])
                EmissionSource.objects.create(farm=farm, **{k: v for k, v in emission_data.items() if k != 'farmId'})
            for seq_data in data.get('sequestrationActivities', []):
                farm = Farm.objects.get(id=seq_data['farmId'])
                SequestrationActivity.objects.create(farm=farm, **{k: v for k, v in seq_data.items() if k != 'farmId'})
            for energy_data in data.get('energyRecords', []):
                farm = Farm.objects.get(id=energy_data['farmId'])
                EnergyRecord.objects.create(farm=farm, **{k: v for k, v in energy_data.items() if k != 'farmId'})
            for livestock_data in data.get('livestock', []):
                farm = Farm.objects.get(id=livestock_data['farmId'])
                Livestock.objects.create(farm=farm, **{k: v for k, v in livestock_data.items() if k != 'farmId'})
            return Response({'message': 'Data imported successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ExportDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # This view seems to use serializers not fully shown (e.g. FarmSerializer)
        # Ensure they are correctly defined and imported in api/serializers.py
        # For brevity, assuming those serializers (FarmSerializer, TaskSerializer, etc.) exist
        # and are correctly imported or defined in api.serializers
        # from .serializers import FarmSerializer, TaskSerializer, ... (etc.)

        data = {
            'version': '1.0',
            'exportDate': datetime.now().isoformat(),
            # 'farms': FarmSerializer(Farm.objects.all(), many=True).data,
            # 'tasks': TaskSerializer(Task.objects.all(), many=True).data,
            # ... and so on for other data types
            # The above lines are commented out if serializers are not fully available in the context.
            # Replace with actual working code if serializers are defined.
        }
        # For now, returning a simplified response if serializers are not fully defined in context
        # return Response(data)
        # Fallback if serializers are not fully defined for ExportDataView
        return Response({"message": "ExportDataView needs specific serializers defined and imported."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class SaveLocalStorageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        data_payload = request.data

        if not isinstance(data_payload, dict):
            return Response({'error': 'Invalid data format. Expected a JSON object.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            local_storage_instance, created = UserLocalStorage.objects.update_or_create(
                user=user,
                defaults={'data': data_payload}
            )
            # We don't need to return the full data back, just a success message.
            # Frontend already has the data.
            status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            return Response({'message': 'LocalStorage snapshot saved successfully.'}, status=status_code)
        except Exception as e:
            # Log the exception e for debugging
            return Response({'error': 'Could not save localStorage data.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoadLocalStorageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            local_storage_instance = UserLocalStorage.objects.get(user=user)
            return Response(local_storage_instance.data, status=status.HTTP_200_OK)
        except UserLocalStorage.DoesNotExist:
            # Frontend expects an object, even if empty, to populate localStorage
            return Response({}, status=status.HTTP_200_OK) 
        except Exception as e:
            # Log the exception e for debugging
            return Response({'error': 'Could not load localStorage data.', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)