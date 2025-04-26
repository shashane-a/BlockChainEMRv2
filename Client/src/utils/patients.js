import { ethers } from "ethers";
import {
  contractAddress,
  contractABI,
} from "../contracts/PatientRegistryContract";
import { PinataSDK } from "pinata";
import pinata_credentials from "./config";

const pinata = new PinataSDK({
  pinataJwt: pinata_credentials.pinataJwt,
  pinataGateway: pinata_credentials.pinataGateway,
});

export async function fetchPatientData() {
  // 1. Get provider (read-only is fine)
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const count = await contract.getPatientCount();

  const patients = [];

  for (let i = 0; i < count; i++) {
    const address = await contract.getPatientAddress(i);
    const cid = await contract.getPatientRecord(address);

    // 3. Fetch from IPFS (Pinata gateway or public IPFS)
    const { data, contentType } = await pinata.gateways.private.get(cid);
    console.log("IPFS response:", data, contentType);

    patients.push({ ...data, wallet_address: address, cid });
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
