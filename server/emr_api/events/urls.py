from django.urls import path
from .views import AddEventView

urlpatterns = [
    path('add_event/', AddEventView.as_view(), name='add-event'),
]