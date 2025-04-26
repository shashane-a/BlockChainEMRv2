from django.urls import path
from .views import GetPatientCountView, AddPatientView, GetPatientWalletAddressView

urlpatterns = [
    path('getPatientCount/', GetPatientCountView.as_view()),
    path('addPatient/', AddPatientView.as_view()),
    path('getPatientWalletAddress/', GetPatientWalletAddressView.as_view()),
]