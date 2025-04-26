import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { contractAddress, contractABI } from "../contracts/PatientRegistryContract.js";

export default function Access() {

  const [ providerAccessAddress, setProviderAccessAddress ] = useState("");
  const [ providerRevokeAddress, setProviderRevokeAddress ] = useState("");
  const [ loading, setLoading ] = useState(false);

  async function handleGrantAccess() {
    setLoading(true);
    // Logic to grant access to the provider
    // This would typically involve a transaction to the smart contract
    // using the providerAccessAddress
    console.log("Granting access to:", providerAccessAddress);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
  }

  function handleRevokeAccess() {

  }

  return (
    <div>
      <div className="p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">
          Manage Access to your medical record
        </h2>
        <h3 className="text-lg font-bold mt-2 text-[#112D4E]/85">
          Grant Access to a Healthcare Provider
        </h3>
        <p className="text-gray-600 text-sm mb-4">Please enter the wallet address of the healthcare provider</p>
        <input 
          name="wallet_address" 
          placeholder="Provider Wallet Address" 
          value={providerAccessAddress} 
          onChange={ (e) => setProviderAccessAddress(e.target.value)} 
          className="block p-2 border border-gray-300 bg-white rounded w-3/4" 
          required 
        />
        <button 
          className="self-start py-2 px-4 mt-3 mb-8 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
          disabled={loading}
        >
          Grant Access
        </button>
        <h3 className="text-lg mt-2 font-bold text-[#112D4E]/85">
          Revoke Access from a Provider
        </h3>
        <p className="text-gray-600 text-sm mb-4">Please enter the wallet address of the healthcare provider</p>
        <input 
          name="wallet_address" 
          placeholder="Provider Wallet Address" 
          value={providerRevokeAddress} 
          onChange={ (e) => setProviderRevokeAddress(e.target.value)} 
          className="block p-2 border border-gray-300 bg-white rounded w-3/4" 
          required 
        />
        <button 
          className="self-start py-2 px-4 rounded mt-3 mb-8  bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
          disabled={loading}
        >
          Revoke Access
        </button>
        <h3 className="text-lg font-bold mt-2 text-[#112D4E]/85">
          Revoke Access from all providers
        </h3>
        <p className="text-gray-600 text-sm mb-4">This will remove access from all health care providers</p>
        <button 
          className="self-start py-2 px-4 rounded mb-8 bg-[#cc6f6f] text-white font-semibold text-sm cursor-pointer" 
          disabled={loading}
        >
          Revoke Access from All
        </button>
      </div>
    </div>
  );
}