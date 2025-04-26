from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Patient
from rest_framework.permissions import IsAuthenticated


# Create your views here.
class GetPatientCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the count of patients in the database
        patient_count = Patient.objects.count()
        return Response({"patient_count": patient_count})

class AddPatientView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Get the wallet address from the request data
        wallet_address = request.data.get("wallet_address")
        
        # Check if the wallet address is provided
        if not wallet_address:
            return Response({"error": "Wallet address is required."}, status=400)
        
        # Create a new patient instance
        patient = Patient(wallet_address=wallet_address)
        patient.save()
        
        return Response({"message": "Patient added successfully."})

class GetPatientWalletAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the wallet address of the authenticated user
        index = request.GET.get("index")
        print("index", index)
        try:
            patient = Patient.objects.get(id=index)
            return Response({"wallet_address": patient.wallet_address})
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=404)