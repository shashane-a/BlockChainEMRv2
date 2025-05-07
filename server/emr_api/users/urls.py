from django.urls import path
from .views import GetNonceView, WalletLoginView, SetUserRoleView, GetAccessTokenView, SetUserProfileView

urlpatterns = [
    path('nonce/', GetNonceView.as_view(), name='get-nonce'),
    path('login/', WalletLoginView.as_view(), name='wallet-login'),
    path('set_role/', SetUserRoleView.as_view(), name='set-role'), 
    path('get_access_token/', GetAccessTokenView.as_view(), name='get-token'),
    path('set_user_profile/', SetUserProfileView.as_view()  ),
]