import { ethers } from "ethers";
import uploadJsonToIPFS from "./ipfs";
import {
  contractAddress,
  contractABI,
} from "../contracts/PatientRegistryContract";
import {
  contractAddress as userRegistryAddress,
  contractABI as userRegistryABI,
} from "../contracts/UserRegistryContract";
import axios from "axios";
import { prepareEncryptedData } from "./encryption";

export async function addPatientRecord(
  patientForm,
  signer,
  toast,
  adminAddPatient
) {
  try {
    const wallet_address = patientForm.wallet_address;
    const adminAddress = await signer.getAddress();
    let authorizedWallets = [];

    if (!adminAddPatient) {
      const userRegistryContract = new ethers.Contract(
        userRegistryAddress,
        userRegistryABI,
        signer
      );

      const tx3 = await userRegistryContract.getAllAdmins();
      console.log("Admins:", tx3);

      //push all admins to authorizedWallets
      for (let i = 0; i < tx3.length; i++) {
        authorizedWallets.push(tx3[i]);
      }
    }

    authorizedWallets.push(adminAddress);
    authorizedWallets.push(wallet_address);

    const encryptedDataPackage = await prepareEncryptedData(
      patientForm,
      authorizedWallets
    );
    const uploadResponse = await uploadJsonToIPFS(
      encryptedDataPackage,
      `${wallet_address}.json`
    );

    if (!uploadResponse) {
      toast?.error("Error uploading to IPFS");
      return { success: false, error: "IPFS upload failed" };
    }

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.addPatientRecord(
      wallet_address,
      uploadResponse.cid
    );
    await tx.wait();

    // Add to Django backend
    const response = await axios.post(
      "http://localhost:8000/api/patients/addPatient/",
      { wallet_address },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    if (response.status !== 200) {
      toast?.error("Error adding patient wallet to backend");
      return { success: false, error: "Backend error" };
    }

    if (adminAddPatient) {
      const userRegistryContract = new ethers.Contract(
        userRegistryAddress,
        userRegistryABI,
        signer
      );

      console.log("Admin adding patient:", wallet_address);
      const tx2 = await userRegistryContract.adminAddPatient(wallet_address);
      await tx2.wait();
    }

    toast?.success("Patient added successfully!");

    const eventResponse = await axios.post(
      "http://localhost:8000/api/events/add_event/",
      {
        related_wallet_address: adminAddress,
        event_type: "Patient Added",
        event_details: `Patient ${wallet_address} added by ${adminAddress}`,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding patient:", error);
    if (error.message?.includes("User already exists")) {
      toast?.error("User already exists in the registry.");
    } else {
      toast?.error("Error adding patient. Please try again.");
    }
    return { success: false, error: error.message || "Unknown error" };
  }
}
