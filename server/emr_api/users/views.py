from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken
from eth_account.messages import encode_defunct
from eth_account import Account
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import random

class GetNonceView(APIView):
    def post(self, request):
        address = request.data.get("address")
        nonce = str(random.randint(100000, 999999))
        cache.set(address, nonce, timeout=300)
        return Response({"nonce": nonce})

class WalletLoginView(APIView):
    def post(self, request):
        address = request.data.get("address")
        signature = request.data.get("signature")
        role = request.data.get("role")  # This may be None

        nonce = cache.get(address)
        if not nonce:
            return Response({"error": "Nonce expired."}, status=400)

        message = encode_defunct(text=nonce)
        try:
            recovered = Account.recover_message(message, signature=signature)
        except:
            return Response({"error": "Invalid signature."}, status=400)

        if recovered.lower() != address.lower():
            return Response({"error": "Signature mismatch."}, status=400)

        user, created = User.objects.get_or_create(wallet_address=address)
        # If role provided (from chain), use it
        if role in ['patient', 'provider', 'admin']:
            user.role = role
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "created": created,
        })
                
        
class SetUserRoleView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        print("User:", request.data)
        address = request.data.get("address")
        role = request.data.get("role")
        if role not in ['patient', 'provider', 'admin']:
            return Response({"error": "Invalid role"}, status=400)
        try:
            user = User.objects.get(wallet_address=address)
            user.role = role
            user.save()
            return Response({"success": True, "role": role})
        except User.DoesNotExist:
            return Response({"error": "User not founddd"}, status=404)
