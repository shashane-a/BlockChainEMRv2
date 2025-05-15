from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Event
from rest_framework.permissions import IsAuthenticated

class AddEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        event_type = request.data.get("event_type")
        event_details = request.data.get("event_details")
        related_wallet_address = request.data.get("related_wallet_address")

        if not event_type or not event_details or not related_wallet_address:
            return Response({"error": "Missing required fields."}, status=400)

        event = Event.objects.create(
            event_type=event_type,
            event_details=event_details,
            related_wallet_address=related_wallet_address
        )
        return Response({"message": "Event added successfully.", "event_id": event.id})
    
class GetEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        # if parameters are provided, filter the events accordingly
        events = None
        # for provided related_wallet_address, filter the events
        related_wallet_address = request.query_params.get("related_wallet_address")
        if related_wallet_address:
            events = Event.objects.filter(related_wallet_address=related_wallet_address).values()
        else:
            events = Event.objects.all().values()
        return Response({"events": list(events)})

        