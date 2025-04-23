from django.urls import path
from .views import GetNonceView, WalletLoginView, RegisterRoleView

urlpatterns = [
    path('nonce/', GetNonceView.as_view()),
    path('login/', WalletLoginView.as_view()),
    path('register_role/', RegisterRoleView.as_view()),
]