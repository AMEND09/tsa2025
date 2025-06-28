# your_app/urls.py
from django.urls import path
from .views import (
    ImportDataView, ExportDataView, # Assuming these are your existing views
    SaveLocalStorageView, LoadLocalStorageView,
    UserLoginView, UserRegisterView, UserLogoutView, UserProfileView,
    # Add other view imports here e.g., FarmListCreateView, FarmDetailView etc.
)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', UserLoginView.as_view(), name='api_login'),
    path('auth/register/', UserRegisterView.as_view(), name='api_register'),
    path('auth/logout/', UserLogoutView.as_view(), name='api_logout'),
    path('auth/profile/', UserProfileView.as_view(), name='api_profile'),
    
    # Data management endpoints
    path('import/', ImportDataView.as_view(), name='import_data'),
    path('export/', ExportDataView.as_view(), name='export_data'),
    
    # Local storage sync endpoints
    path('sync/localstorage/save/', SaveLocalStorageView.as_view(), name='save_local_storage'),
    path('sync/localstorage/load/', LoadLocalStorageView.as_view(), name='load_local_storage'),
]