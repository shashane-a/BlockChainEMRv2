from django.test import TestCase
from rest_framework.test import APIClient
from django.core.cache import cache
from django.urls import reverse
from eth_account import Account
from eth_account.messages import encode_defunct
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User  

class AuthViewTests(TestCase):
    def setUp(self):
        """
        Set up the test client and any other necessary setup.
        """
        self.client = APIClient()
        self.test_address = '0x1234567890abcdef1234567890abcdef12345678'

    def test_get_nonce(self):
        """
        Test that a nonce is generated and cached for the given address.
        """
        response = self.client.post('/api/auth/nonce/', {'address': self.test_address})
        self.assertEqual(response.status_code, 200)
        self.assertIn('nonce', response.data)
        cached_nonce = cache.get(self.test_address)
        self.assertEqual(cached_nonce, response.data['nonce'])


    def test_wallet_login_success(self):
        """
        Test that a user can log in successfully with a valid address and signature.
        """
        acct = Account.create()
        address = acct.address
        nonce = '123456'
        cache.set(address, nonce, timeout=300)

        message = encode_defunct(text=nonce)
        signature = Account.sign_message(message, acct.key).signature.hex()

        response = self.client.post('/api/auth/login/', {
            'address': address,
            'signature': signature,
            'role': 'patient'
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)


    def test_get_access_token(self):
        """
        Test that a user can get an access token using their wallet address.
        """
        user = User.objects.create(wallet_address=self.test_address, role='provider')
        refresh = RefreshToken.for_user(user)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

        response = self.client.post('/api/auth/get_access_token/', {'address': self.test_address})
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_set_user_role(self):
        """
        Test that a user can set their role successfully.
        """
        user = User.objects.create(wallet_address=self.test_address, role='patient')
        refresh = RefreshToken.for_user(user)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')

        response = self.client.post('/api/auth/set_role/', {
            'address': self.test_address,
            'role': 'admin'
        })
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.role, 'admin')

