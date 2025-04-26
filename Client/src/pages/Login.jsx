import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { contractAddress, contractABI } from '../contracts/UserRegistryContract.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../context/AuthContext.jsx"; // import the hook
import { jwtDecode } from "jwt-decode";// import jwt-decode
import { useNavigate } from "react-router-dom";
import { usePatientData } from '../context/PatientDataContext.jsx';
import { fetchPatientData, fetchPatientRecord } from "../utils/patients";

export default function Login() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [userRole, setUserRole] = useState('');
  const { auth, setAuth } = useAuth();
  const { patients, setPatients } = usePatientData();
  const navigate = useNavigate();

  const loginWithWallet = async () => {
    setLoading(true);
    let onChainRole = null
    try {
      if (!window.ethereum) return toast.error('Please install MetaMask!');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);
  
      // 1. Always check blockchain for role
      onChainRole = await getRoleOnChain(userAddress);
  
      const { data: nonceData } = await axios.post('http://localhost:8000/api/auth/nonce/', {
        address: userAddress,
      });
  
      const signature = await signer.signMessage(nonceData.nonce);
  
      const { data: loginData } = await axios.post('http://localhost:8000/api/auth/login/', {
        address: userAddress,
        signature,

      });
      
      localStorage.setItem('accessToken', loginData.access);
      const decoded = jwtDecode(loginData.access);
      setAuth({
        accessToken: loginData.access,
        role: decoded.role,
        walletid: decoded.wallet_address,
      });

      if (!onChainRole) {
        console.log('No role on chain, show role picker');
        setShowRolePicker(true);
        setUserRole(""); 

      } else {
        setIsLoggedIn(true);
        console.log('logged in: ',isLoggedIn);
        setUserRole(onChainRole);
        setShowRolePicker(false);
        toast.success(`Logged in with role ${onChainRole}`);
        // (Optional) Sync backend role if different
        if (loginData.role !== onChainRole) {
          // Call set_role to sync Django
          const token = localStorage.getItem('accessToken');
          console.log(token);
          await axios.post('http://localhost:8000/api/auth/set_role/', {
            address: userAddress,
            role: onChainRole,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
      
      console.log('User role:', onChainRole);
      if (onChainRole === 'admin') {
        const allPatients = await fetchPatientData();
        console.log(allPatients); 
        setPatients(allPatients);  // populate global context
      }

      if (onChainRole === 'patient') {
        const patientData = await fetchPatientRecord(userAddress);
        console.log(patientData); 
        setPatients([patientData]);  // populate global context with single patient
      } 

    } catch (err) {
      console.error(err);
      toast.error('Login failed');
    } finally {
      setLoading(false);
      if (onChainRole){
        navigate('/dashboard');
      }
    }
  };
  

  async function getRoleOnChain(address) {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    try {
      // Returns a number: 0=None, 1=Patient, 2=Provider, 3=Admin
      const roleId = await contract.getRole(address);
      console.log('Role ID:', roleId.toString());
      switch (roleId.toString()) {
        case '1': return 'patient';
        case '2': return 'provider';
        case '3': return 'admin';
        default: return null;
      }
    } catch (err) {
      console.error('Could not get role on chain', err);
      return null;
    }
  }
  

  const handleRoleSubmit = async () => {
    setLoading(true);
    if (!selectedRole) return toast.warning('Please select a role!');
    const success = await registerRoleOnChain(selectedRole);
    if (!success) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8000/api/auth/set_role/', {
        address,
        role: selectedRole,
      },{
        headers: { Authorization: `Bearer ${token}` }
      });

      const { data: accessData } = await axios.post('http://localhost:8000/api/auth/get_access_token/', {
        address,
        role: selectedRole,
      },{
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(accessData);
      const decoded = jwtDecode(accessData.access);
      console.log(decoded);
      setAuth({
        accessToken: accessData.access,
        role: decoded.role,
        walletid: decoded.wallet_address,
      });

      setIsLoggedIn(true);
      setUserRole(selectedRole);
      setShowRolePicker(false);

      toast.success(`Role set to ${selectedRole}`);
      setLoading(false);
      navigate('/dashboard');

    } catch (err) {
      console.log(err);
      toast.error('Role selection failed');
    }
  };


async function registerRoleOnChain(selectedRole) {
  if (!window.ethereum) return alert('MetaMask not found!');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    let tx;
    if (selectedRole === 'patient') {
      tx = await contract.registerAsPatient();
    } else if (selectedRole === 'provider') {
      tx = await contract.registerAsProvider();
    } else {
      throw new Error("Invalid role");
    }
    await tx.wait(); // Wait for tx confirmation
    // alert('Role registered on blockchain!');
    toast.success('Role registered on blockchain!');
    return true;
  } catch (err) {
    console.error('Smart contract error:', err);
    // alert('Blockchain registration failed');
    toast.error('Blockchain registration failed');
    return false;
  }
}

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
      <ToastContainer position="bottom-right" autoClose={5000} theme='colored' />
      
      <div className='flex flex-col items-center justify-center w-full  p-6'>
        <div className='flex flex-col items-center justify-center w-full  p-6'>
          <h1 className="text-6xl font-bold text-[#112D4E]">Medix</h1>
          <h2 className="text-3xl font-bold text-[#3F72AF]">Welcome to the new era of medical records</h2>
        </div>
        <div className="w-1/5 p-5 mt-5 bg-white/40 rounded-lg shadow-md">
          <div className="text-center">
            
            { !isLoggedIn ? <p className="mt-2 text-gray-600">Sign in with your wallet to continue</p> : null }
          </div>
          
          <div className={`${isLoggedIn ? 'mt-2' : 'mt-8'}`}>
            <button 
              onClick={loginWithWallet} 
              disabled={loading || isLoggedIn || showRolePicker}
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
                  Logged In as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
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

          {showRolePicker && (

              <div className="rounded-xl  p-8 flex flex-col items-center">
                <h2 className="mb-4 text-gray-600 font-bold">Select Your Role</h2>
                <div className="flex gap-6 mb-6">
                  <button
                    onClick={() => setSelectedRole('patient')}
                    className={`py-2 px-4 rounded ${selectedRole==='patient'?'bg-[#4e86db] text-white':'bg-gray-100'}`}>
                    Patient
                  </button>
                  <button
                    onClick={() => setSelectedRole('provider')}
                    className={`py-2 px-4 rounded ${selectedRole==='provider'?'bg-[#41ad72] text-white':'bg-gray-100'}`}>
                    Healthcare Provider
                  </button>
                </div>
                <button
                  onClick={handleRoleSubmit}
                  className="py-2 px-6 rounded bg-[#3F72AF] text-white font-semibold"
                  disabled={loading}
                >{ loading ? (
                  <div className="flex items-center w-full">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm">
                      Setting Role...
                    </p>
                    
                  </div>
                ) : (
                  <p className="text-sm">
                      Continue
                    </p>
                )
                }</button>
              </div>

          )}
        </div>
      </div>
    </div>
  );
}
