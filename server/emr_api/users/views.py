from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache
from .models import User, UserProfile
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
        role = request.data.get("role")  

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
        if role in ['patient', 'provider', 'admin']:
            user.role = role
            user.save()

        refresh = RefreshToken.for_user(user)
        refresh['wallet_address'] = user.wallet_address
        refresh['role'] = user.role
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "created": created,
        })
                
class GetAccessTokenView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = User.objects.get(wallet_address=request.data.get("address"))
        refresh = RefreshToken.for_user(user)
        refresh['wallet_address'] = user.wallet_address
        refresh['role'] = user.role
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
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

class SetUserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user  # Authenticated user from JWT
        data = request.data

        print("User Profile Data:", data)
        
        user_profile_data = {
            "title": data.get("title", ""),
            "first_name": data.get("first_name", ""),
            "last_name": data.get("last_name", ""),
            "email": data.get("email", ""),
            "job_title": data.get("job_title", ""),
            "orgnisation_name": data.get("orgnisation_name", ""),
        }

        # Create or update the user profile
        profile, created = UserProfile.objects.update_or_create(
            user=user,
            defaults=user_profile_data
        )

        return Response({
            "success": True,
            "message": "Profile created" if created else "Profile updated"
        })
    
class GetUserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        address = request.GET.get("address")
        user = User.objects.get(wallet_address=address)
        user_profile = user.profile
        data = {
            "title": user_profile.title,
            "first_name": user_profile.first_name,
            "last_name": user_profile.last_name,
            "email": user_profile.email,
            "job_title": user_profile.job_title,
            "orgnisation_name": user_profile.orgnisation_name,
        }
        return Response(data)