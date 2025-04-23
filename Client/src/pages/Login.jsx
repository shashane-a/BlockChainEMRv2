import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

export default function Login() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const loginWithWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) return alert('Please install MetaMask!');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);

      const { data: nonceData } = await axios.post('http://localhost:8000/api/auth/nonce/', {
        address: userAddress,
      });

      const signature = await signer.signMessage(nonceData.nonce);

      const { data: loginData } = await axios.post('http://localhost:8000/api/auth/login/', {
        address: userAddress,
        signature,
      });

      localStorage.setItem('accessToken', loginData.access);
      setIsLoggedIn(true);
      alert(`Logged in as ${userAddress} with role ${loginData.role}`);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };
//https://colorhunt.co/palette/f9f7f7dbe2ef3f72af112d4e
  return (
    <div 
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: 'url("/src/assets/backdrop.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      >
      <div className='flex flex-col items-center justify-center w-full  p-6'>
        <div className='flex flex-col items-center justify-center w-full  p-6'>
          <h1 className="text-6xl font-bold text-[#112D4E]">Medix</h1>
          <h2 className="text-3xl font-bold text-[#3F72AF]">Welcome to the new era of medical records</h2>
        </div>
        <div className="w-1/5 p-5 mt-5 bg-white/40 rounded-lg shadow-md">
          <div className="text-center">
            
            <p className="mt-2 text-gray-600">Sign in with your wallet to continue</p>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={loginWithWallet} 
              disabled={loading || isLoggedIn}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoggedIn ? 'bg-[#3faf71]' : 'bg-[#3F72AF] hover:bg-[#3f71afb7]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : isLoggedIn ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Logged In
                </>
              ) : (
                <>
                  <img src="https://cdn.worldvectorlogo.com/logos/metamask.svg" className="w-5 h-5 mr-2" alt="MetaMask" />
                  Login with MetaMask
                </>
              )}
            </button>
          </div>
          
          {address && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Connected:</span> 
                <span className="font-mono ml-2 text-xs break-all">{address}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
