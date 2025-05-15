from django.urls import path
from .views import AddEventView, GetEventsView

urlpatterns = [
    path('add_event/', AddEventView.as_view(), name='add-event'),
    path('get_events/', GetEventsView.as_view(), name='get-events'),
]