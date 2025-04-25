from django.urls import path
from .views import GetNonceView, WalletLoginView, SetUserRoleView, GetAccessTokenView

urlpatterns = [
    path('nonce/', GetNonceView.as_view()),
    path('login/', WalletLoginView.as_view()),
    path('set_role/', SetUserRoleView.as_view()), 
    path('get_access_token/', GetAccessTokenView.as_view()),
]