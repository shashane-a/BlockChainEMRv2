import { ethers } from "ethers";
import {
  contractAddress,
  contractABI,
} from "../contracts/PatientRegistryContract";
import { PinataSDK } from "pinata";
import pinata_credentials from "./config";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const pinata = new PinataSDK({
  pinataJwt: pinata_credentials.pinataJwt,
  pinataGateway: pinata_credentials.pinataGateway,
});

export async function fetchPatientData() {
  // 1. Get provider (read-only is fine)
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
  // 1. Get provider (read-only is fine)
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const cid = await contract.getPatientRecord(wallet_address);

  const { data, contentType } = await pinata.gateways.private.get(cid);
  console.log("IPFS response:", data, contentType);

  const patient = { ...data, wallet_address, cid };
  return patient;
}
