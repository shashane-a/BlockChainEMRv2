import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { contractAddress, contractABI } from "../contracts/PatientRegistryContract.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from "ethers";
import { getEncryptedData, fetchAndDecryptPatient } from "../utils/patients.js";
import { decryptAESkeyAndEncrypt } from "../utils/encryption.js";
import uploadJsonToIPFS from "../utils/ipfs.js";

export default function Access() {

  const [ providerAccessAddress, setProviderAccessAddress ] = useState("");
  const [ providerRevokeAddress, setProviderRevokeAddress ] = useState("");
  const [ patientAccessAddress, setPatientAccessAddress ] = useState("");
  const [ patientRevokeAddress, setPatientRevokeAddress ] = useState("");
  const [ accessLoading, setAccessLoading ] = useState(false);
  const [ revokeLoading, setRevokeLoading ] = useState(false);
  const { auth } = useAuth();

  async function handlePatientAccess(access) {
    const providerAddress = access ? providerAccessAddress : providerRevokeAddress;

    if (!providerAddress) {
      toast.error("Please enter wallet address");
      return;
    }

    access ? setAccessLoading(true) : setRevokeLoading(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      const tx = await contract.setAccess(providerAddress, access);
      await tx.wait();
      console.log(`Access ${access ? 'granted' : 'revoked'} successfully:`, tx);
      toast.success(`Access ${access ? 'granted' : 'revoked'} successfully!`);
      setProviderAccessAddress("");
      setProviderRevokeAddress("");
    } catch (error) {
      console.error(`Error ${access ? 'granting' : 'revoking'} access:`, error);
      toast.error(`Error ${access ? 'granting' : 'revoking'}. Please try again.`);
    } 

    //add provider address to patient record
    if (access) {
      try {
        const encrypted = await getEncryptedData(auth.walletid);
        console.log("Encrypted patient data in access page:", encrypted); 

        //get encrypted key for provider address
        const newEncryptedKey = await decryptAESkeyAndEncrypt(encrypted, providerAddress, auth.walletid);
        console.log("New encrypted key for provider address:", newEncryptedKey);

        //update encrypted data with new encrypted key by adding it to the keys object
        const encryptedDataWithNewKey = {
          ...encrypted,
          keys: {
            ...encrypted.keys,
            [providerAddress]: newEncryptedKey,
          },
        }

        console.log("Encrypted data with new key:", encryptedDataWithNewKey);

        //upload new encrypted data to IPFS
        const response = await uploadJsonToIPFS(encryptedDataWithNewKey, auth.walletid);
        console.log("CID of new encrypted data:", response.cid);

        //update smart contract with new cid
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const tx = await contract.updatePatientRecord(auth.walletid, response.cid);
        await tx.wait();
        console.log("Updated patient record successfully:", tx);
        toast.success("Updated patient record successfully!");

      } catch (error) {
        console.error("Error fetching and decrypting patient data:", error);
      } finally {
        setAccessLoading(false);
        setRevokeLoading(false);
      }
    } else{
      console.log("Revoking access from provider address:", providerAddress);
        try {
          const encrypted = await getEncryptedData(auth.walletid);
          console.log("Encrypted patient data in access page:", encrypted); 

          //remove provider address from keys object
          const { [providerAddress]: _, ...newKeys } = encrypted.keys;
          console.log("New keys object:", newKeys);

          //update encrypted data with new keys object
          const encryptedDataWithNewKeys = {
            ...encrypted,
            keys: newKeys,
          }
          console.log("Encrypted data with new keys:", encryptedDataWithNewKeys);
          
          //upload new encrypted data to IPFS
          const response = await uploadJsonToIPFS(encryptedDataWithNewKeys, providerAddress);
          console.log("CID of new encrypted data:", response.cid);

          //update smart contract with new cid
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);

          const tx = await contract.updatePatientRecord(auth.walletid, response.cid);
          await tx.wait();
          console.log("Updated patient record successfully:", tx);
          toast.success("Updated patient record successfully!");

        } catch (error) {
          console.error("Error fetching and decrypting patient data:", error);
        } finally {
          setAccessLoading(false);
          setRevokeLoading(false);
        }
    }
  }

  async function handleAdminAccess(access) {
    const patientAddress = access ? patientAccessAddress : patientRevokeAddress;
    const providerAddress = access ? providerAccessAddress : providerRevokeAddress;

    if (!patientAddress || !providerAddress) {
      toast.error("Please enter wallet addresses");
      return;
    }

    access ? setAccessLoading(true) : setRevokeLoading(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      const tx = await contract.adminSetAccess(patientAddress, providerAddress, access);
      await tx.wait();
      console.log(`Access ${access ? 'granted' : 'revoked'} successfully:`, tx);
      toast.success(`Access ${access ? 'granted' : 'revoked'} successfully!`);
      setPatientAccessAddress("");
      setPatientRevokeAddress("");
      setProviderAccessAddress("");
      setProviderRevokeAddress("");
    } catch (error) {
      console.error(`Error ${access ? 'granting' : 'revoking'} access:`, error);
      toast.error(`Error ${access ? 'granting' : 'revoking'}. Please try again.`);
    } 

    //add provider address to patient record
    if (access) {
      try {
        const encrypted = await getEncryptedData(patientAccessAddress);
        console.log("Encrypted patient data in access page:", encrypted); 

        //get encrypted key for provider address
        const newEncryptedKey = await decryptAESkeyAndEncrypt(encrypted, providerAccessAddress, auth.walletid);
        console.log("New encrypted key for provider address:", newEncryptedKey);

        //update encrypted data with new encrypted key by adding it to the keys object
        const encryptedDataWithNewKey = {
          ...encrypted,
          keys: {
            ...encrypted.keys,
            [providerAccessAddress]: newEncryptedKey,
          },
        }

        console.log("Encrypted data with new key:", encryptedDataWithNewKey);

        //upload new encrypted data to IPFS
        const response = await uploadJsonToIPFS(encryptedDataWithNewKey, patientAccessAddress);
        console.log("CID of new encrypted data:", response.cid);

        //update smart contract with new cid
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const tx = await contract.updatePatientRecord(patientAccessAddress, response.cid);
        await tx.wait();
        console.log("Updated patient record successfully:", tx);
        toast.success("Updated patient record successfully!");

      } catch (error) {
        console.error("Error fetching and decrypting patient data:", error);
      } finally {
        setAccessLoading(false);
        setRevokeLoading(false);
      }
    } else {
        console.log("Revoking access from provider address:", providerAddress);
        try {
          const encrypted = await getEncryptedData(patientRevokeAddress);
          console.log("Encrypted patient data in access page:", encrypted); 

          //remove provider address from keys object
          const { [providerAddress]: _, ...newKeys } = encrypted.keys;
          console.log("New keys object:", newKeys);

          //update encrypted data with new keys object
          const encryptedDataWithNewKeys = {
            ...encrypted,
            keys: newKeys,
          }
          console.log("Encrypted data with new keys:", encryptedDataWithNewKeys);
          
          //upload new encrypted data to IPFS
          const response = await uploadJsonToIPFS(encryptedDataWithNewKeys, patientRevokeAddress);
          console.log("CID of new encrypted data:", response.cid);

          //update smart contract with new cid
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);

          const tx = await contract.updatePatientRecord(patientRevokeAddress, response.cid);
          await tx.wait();
          console.log("Updated patient record successfully:", tx);
          toast.success("Updated patient record successfully!");

        } catch (error) {
          console.error("Error fetching and decrypting patient data:", error);
        } finally {
          setAccessLoading(false);
          setRevokeLoading(false);
        }
    }
  }

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={5000} theme='colored' />
      <div className="p-4 flex flex-col">
        
        {auth.role === "admin" ? (
          <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">
            Manage Access to Patient records
          </h2>
        ) : (
          <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">
            Manage Access to your medical record
          </h2>
        )}
        <div className="bg-white p-4 rounded shadow-md mb-8">
          {auth.role === "admin" ? (
            <h3 className="text-lg font-bold mt-2 text-[#112D4E]/85">
              Grant Patient access to a Healthcare Provider
            </h3>
          ) : (
            <h3 className="text-lg font-bold mt-2 text-[#112D4E]/85">
              Grant access to a Healthcare Provider
            </h3>
          )}
          {auth.role === "admin" ? (
            <p className="text-gray-600 text-sm mb-4">Please enter the wallet address of the healthcare provider and patient</p>
          ) : (
            <p className="text-gray-600 text-sm mb-4">Please enter the wallet address of the healthcare provider</p>
          )}
          
          {auth.role === "admin" && (
            <input 
              name="patient_acc_wallet_address" 
              placeholder="Patient Wallet Address" 
              value={patientAccessAddress} 
              onChange={ (e) => setPatientAccessAddress(e.target.value)} 
              className="block p-2 border border-gray-300 bg-white rounded w-3/4 mb-4" 
              required 
            />
          )}
          <input 
            name="provider_acc_wallet_address" 
            placeholder="Provider Wallet Address" 
            value={providerAccessAddress} 
            onChange={ (e) => setProviderAccessAddress(e.target.value)} 
            className="block p-2 border border-gray-300 bg-white rounded w-3/4" 
            required 
          />
          {/* {auth.role === "admin" ? ( */}
          <button 
            className="flex self-start py-2 px-4 mt-3 mb-8 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
            disabled={accessLoading}
            onClick={auth.role === "admin" ? () => handleAdminAccess(true) : () => handlePatientAccess(true)}
          >
            {accessLoading ? 
            (<>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
                Granting Access...
              </>
            ) : (
              <>
                Grant Access
              </>
            )}
          </button>
        </div>

          
        <div className="bg-white p-4 rounded shadow-md mb-8">

        {auth.role === "admin" ? (
          <h3 className="text-lg font-bold mt-2 text-[#112D4E]/85">
            Revoke Patient access to a Healthcare Provider
          </h3>
        ) : (
          <h3 className="text-lg font-bold mt-2 text-[#112D4E]/85">
            Revoke Access from a Provider
          </h3>
        )}
        <p className="text-gray-600 text-sm mb-4">Please enter the wallet address of the healthcare provider</p>
        {auth.role === "admin" && (
          <input 
            name="patient_rev_wallet_address" 
            placeholder="Patient Wallet Address" 
            value={patientRevokeAddress} 
            onChange={ (e) => setPatientRevokeAddress(e.target.value)} 
            className="block p-2 border border-gray-300 bg-white rounded w-3/4 mb-4" 
            required 
          />
        )}
        <input 
          name="provider_rev_wallet_address" 
          placeholder="Provider Wallet Address" 
          value={providerRevokeAddress} 
          onChange={ (e) => setProviderRevokeAddress(e.target.value)} 
          className="block p-2 border border-gray-300 bg-white rounded w-3/4" 
          required 
        />
        {/* {auth.role === "admin" ? ( */}
          <button 
            className="flex self-start py-2 px-4 mt-3 mb-8 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
            disabled={revokeLoading}
            onClick={auth.role === "admin" ? () => handleAdminAccess(false) : () => handlePatientAccess(false)}
          >
            {revokeLoading ? 
            (<>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
                Revoking Access...
              </>
            ) : (
              <>
                Revoke Access
              </>
            )}
          </button>
        </div>
   
        {auth.role === "patient" && (
          <div>
            <h3 className="text-lg font-bold mt-2 text-[#112D4E]/85">
              Revoke Access from all providers
            </h3>
            <p className="text-gray-600 text-sm mb-4">This will remove access from all health care providers</p>
              <button 
              className="self-start py-2 px-4 rounded mb-8 bg-[#cc6f6f] text-white font-semibold text-sm cursor-pointer" 
              // disabled={loading}
            >
              Revoke Access from All
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}