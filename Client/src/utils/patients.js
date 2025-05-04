import { ethers } from "ethers";
import {
  contractAddress,
  contractABI,
} from "../contracts/PatientRegistryContract";
import { PinataSDK } from "pinata";
import pinata_credentials from "./config";
import axios from "axios";
import { decryptPatientData } from "./encryption"; // Import your decryption function

const pinata = new PinataSDK({
  pinataJwt: pinata_credentials.pinataJwt,
  pinataGateway: pinata_credentials.pinataGateway,
});

export async function fetchPatientData() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  // const count = await contract.getPatientCount();

  //get patient count from django backend
  const response = await axios.get(
    "http://localhost:8000/api/patients/getPatientCount/",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  const count = response.data.patient_count;
  console.log("Patient count from backend:", count);

  const patients = [];

  for (let i = 0; i < count; i++) {
    // const address = await contract.getPatientAddress(i);

    console.log(localStorage.getItem("accessToken"));
    const response = await axios.get(
      "http://localhost:8000/api/patients/getPatientWalletAddress/?index=" +
        `${i + 1}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    console.log(response.data.wallet_address);

    const cid = await contract.getPatientRecord(response.data.wallet_address);

    // 3. Fetch from IPFS (Pinata gateway or public IPFS)
    const { data, contentType } = await pinata.gateways.private.get(cid);
    console.log("IPFS response:", data, contentType);

    patients.push({
      ...data,
      wallet_address: response.data.wallet_address,
      cid,
    });
  }

  return patients;
}

export async function fetchPatientRecord(wallet_address) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  console.log("Fetching patient record for wallet:", wallet_address);
  const cid = await contract.getPatientRecord(wallet_address);
  if (!cid || cid === "") {
    console.error("No patient record found for this wallet.");
    return null; // No patient record found for this wallet
  }

  console.log("CID from contract:", cid);
  const { data, contentType } = await pinata.gateways.private.get(cid);
  console.log("IPFS response:", data, contentType);

  const patient = { ...data, wallet_address, cid };
  return patient;
}

export async function fetchAccessiblePatients(providerAddress) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  console.log("Provider address:", providerAddress);

  //get patient count from django backend
  const response = await axios.get(
    "http://localhost:8000/api/patients/getPatientCount/",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  const count = response.data.patient_count;
  console.log("Patient count from backend:", count);

  const patients = [];

  for (let i = 0; i < count; i++) {
    // const address = await contract.getPatientAddress(i);

    console.log(localStorage.getItem("accessToken"));
    const response = await axios.get(
      "http://localhost:8000/api/patients/getPatientWalletAddress/?index=" +
        `${i + 1}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    console.log("reponse", response.data.wallet_address);

    // Check if the user has access to the patient record

    console.log("Checking access for provider:", providerAddress);
    console.log("patient wallet:", response.data.wallet_address);

    const hasAccess = await contract.canProviderAccess(
      response.data.wallet_address,
      providerAddress
    );

    console.log("Access status:", hasAccess);

    if (hasAccess) {
      console.log(
        "User has access to patient record:",
        response.data.wallet_address
      );

      console.log("Fetching CID for patient:", response.data.wallet_address);
      const cid = await contract.getPatientRecord(response.data.wallet_address);

      // 3. Fetch from IPFS (Pinata gateway or public IPFS)
      const { data, contentType } = await pinata.gateways.private.get(cid);
      console.log("IPFS response:", data, contentType);

      patients.push({
        ...data,
        wallet_address: response.data.wallet_address,
        cid,
      });
    }
  }

  return patients;
}

export async function fetchAndDecryptPatient(walletAddress) {
  try {
    if (!window.ethereum) throw new Error("MetaMask not detected!");

    console.log("Fetching patient record for wallet:", walletAddress);

    // 🔥 Connect to Ethereum blockchain
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    const cid = await contract.getPatientRecord(walletAddress);
    console.log("CID from smart contract:", cid);

    if (!cid || cid === "") {
      throw new Error("No patient record found for this wallet.");
    }

    const { data, contentType } = await pinata.gateways.private.get(cid);
    console.log("IPFS response:", data, contentType);

    console.log("Encrypted data package:", data);

    const patientData = await decryptPatientData(data);

    console.log("Successfully decrypted patient data:", patientData);

    return patientData;
  } catch (error) {
    console.error("Error fetching or decrypting patient:", error);
    throw error;
  }
}

export async function getEncryptedData(walletAddress) {
  try {
    if (!window.ethereum) throw new Error("MetaMask not detected!");

    console.log("Fetching patient record for wallet:", walletAddress);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    const cid = await contract.getPatientRecord(walletAddress);
    console.log("CID from smart contract:", cid);

    if (!cid || cid === "") {
      throw new Error("No patient record found for this wallet.");
    }

    const { data, contentType } = await pinata.gateways.private.get(cid);
    console.log("IPFS response:", data, contentType);

    console.log("Encrypted data package:", data);

    return data;
  } catch (error) {
    console.error("Error fetching or decrypting patient:", error);
    throw error;
  }
}

export async function getEncryptedKeys(walletAddress) {
  try {
    if (!window.ethereum) throw new Error("MetaMask not detected!");

    console.log("Fetching patient record for wallet:", walletAddress);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    const cid = await contract.getPatientRecord(walletAddress);
    console.log("CID from smart contract:", cid);

    if (!cid || cid === "") {
      throw new Error("No patient record found for this wallet.");
    }

    const { data, contentType } = await pinata.gateways.private.get(cid);
    console.log("IPFS response:", data, contentType);

    console.log("Encrypted data package:", data);

    return data.keys;
  } catch (error) {
    console.error("Error fetching or decrypting patient:", error);
    throw error;
  }
}
