# your_app/urls.py
from django.urls import path
from .views import ImportDataView, ExportDataView

urlpatterns = [
    path('import-data/', ImportDataView.as_view(), name='import_data'),
    path('export-data/', ExportDataView.as_view(), name='export_data'),
]