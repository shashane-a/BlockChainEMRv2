from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken
from eth_account.messages import encode_defunct
from eth_account import Account
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
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
        })
         
        
class RegisterRoleView(APIView):
    def post(self, request):
        address = request.data.get("address")
        role = request.data.get("role")
        if role not in ["patient", "provider"]:
            return Response({"error": "Invalid role"}, status=400)
        user, created = User.objects.get_or_create(wallet_address=address)
        if user.role != "patient" and not created:
            return Response({"error": "Role already set or upgrade denied"}, status=403)
        user.role = role
        user.save()
        return Response({"success": True, "role": user.role})
