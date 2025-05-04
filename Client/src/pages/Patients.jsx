import { useEffect, useState } from "react";
import { ethers } from "ethers";
import uploadJsonToIPFS from "../utils/ipfs.js";
import { contractAddress, contractABI } from "../contracts/PatientRegistryContract";
import { contractAddress as userRegistryAddress, contractABI as userRegistryABI } from "../contracts/UserRegistryContract";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePatientData } from "../context/PatientDataContext";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchPatientData, fetchPatientRecord, fetchAndDecryptPatient, fetchAccessiblePatients } from "../utils/patients";
import { prepareEncryptedData } from "../utils/encryption"; 
import { Link } from "react-router-dom";
import AddPatientModal from "../components/AddPatient.jsx";
import { addPatientRecord } from "../utils/addPatienRecord.js";


export default function Patients() {

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    address: {
      house_number: "",
      street: "",
      city: "",
      county: "",
      postcode: "",
      country: "",
    },
    wallet_address: "",
  });
  
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loading, setLoading] = useState(false);
  const { patients, setPatients } = usePatientData();
  const { auth } = useAuth();


  const loadPatients = async () => {

    setLoadingPatients(true);
    if (auth.role == "admin"){
      console.log('fetching patient data for admin');
      const allPatients = await fetchPatientData();  // still fetch all patients (encrypted)
        const decryptedPatients = [];
      
        for (const patient of allPatients) {
          try {
            const decrypted = await fetchAndDecryptPatient(patient.wallet_address);
            decryptedPatients.push(decrypted);
          } catch (error) {
            console.error(`Failed to decrypt patient ${patient.wallet_address}:`, error);
          }
        }
      
        console.log("Decrypted patients for Admin:", decryptedPatients);
        setPatients(decryptedPatients);
        setLoadingPatients(false);
    }
    else if (auth.role == "provider"){
      console.log('auth',auth);
      const accessiblePatients = await fetchAccessiblePatients(auth.walletid);  // list of patients accessible
      const decryptedPatients = [];
      console.log("Accessible patients:", accessiblePatients);
    
      for (const patient of accessiblePatients) {
        try {
          const decrypted = await fetchAndDecryptPatient(patient.wallet_address);
          decryptedPatients.push(decrypted);
        } catch (error) {
          console.error(`Failed to decrypt patient ${patient.wallet_address}:`, error);
        }
      }
    
      console.log(decryptedPatients);
      setPatients(decryptedPatients);
      setLoadingPatients(false);
    }
    
  };

  // Add useEffect to fetch patients data when component mounts
  useEffect(() => {
    loadPatients();
  }, [setPatients]); // Only re-run when setPatients changes (which should be never)

  async function handleAddPatient(event) {
    event.preventDefault();
    setLoading(true);
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      const result = await addPatientRecord(patientForm, signer, toast);
  
      if (result.success) {
        setShowAddPatient(false);
        setPatientForm({
          first_name: "",
          last_name: "",
          date_of_birth: "",
          gender: "",
          phoneNumber: "",
          email: "",
          address: {
            house_number: "",
            street: "",
            city: "",
            county: "",
            postcode: "",
            country: "",
          },
          wallet_address: "",
        });
        await loadPatients(); // Refresh list
      }
  
    } finally {
      setLoading(false);
    }
  }
  

  // async function handleAddPatient(event) {
  //   event.preventDefault();
  //   setLoading(true);

  //   try {
  //     if (!window.ethereum) throw new Error("Please install MetaMask!");
  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     const signer = await provider.getSigner();
  //     const wallet_address = patientForm.wallet_address;
  //     const adminAddress = await signer.getAddress();

  //     // Determine which addresses need access to this data
  //     const authorizedWallets = [
  //       wallet_address,  // The patient
  //       adminAddress,    // The admin adding the patient
  //       // Additional providers could be added here
  //     ];

  //     const encryptedDataPackage = await prepareEncryptedData(patientForm, authorizedWallets);
  //     console.log("Encrypted package ready:", encryptedDataPackage);

  //     const uploadResponse = await uploadJsonToIPFS(encryptedDataPackage, `${wallet_address}.json`);
  //     console.log("Upload response:", uploadResponse);
      
  //     if (!uploadResponse) {
  //       console.error("Error uploading to IPFS");
  //       toast.error("Error uploading to IPFS");
  //       setLoading(false);
  //       return;
  //     }

  //     const contract = new ethers.Contract(contractAddress, contractABI, signer);
  //     const tx = await contract.addPatientRecord(wallet_address, uploadResponse.cid);
  //     await tx.wait();

  //     //add patient wallet address to django backend

  //     const response = await axios.post('http://localhost:8000/api/patients/addPatient/', {
  //       wallet_address: wallet_address,
  //     }, {
  //       headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  //     });

  //     if (response.status !== 200) {
  //       console.error("Error adding patient to backend:", response.data);
  //       toast.error("Error adding patient wallet to backend");
  //     }

  //     const userRegistryContract = new ethers.Contract(userRegistryAddress, userRegistryABI, signer);
  //     const tx2 = await userRegistryContract.adminAddPatient(wallet_address);
  //     await tx2.wait();

  //     toast.success("Patient added successfully!")
  //     setLoading(false);
  //     setShowAddPatient(false);

  //     setPatientForm({
  //       first_name: "",
  //       last_name: "",
  //       date_of_birth: "",
  //       gender: "",
  //       wallet_address: "",
  //     });

  //     const allPatients = await fetchPatientData();
  //     console.log(allPatients); 
  //     loadPatients(); // Refresh the patient list after adding a new one

  //   } catch (error) {
  //     console.error("Error adding patient:", error);
  //     if (error.message.includes("User already exists")) {
  //       toast.error("User already exists in the registry.");
  //     } else {
  //       toast.error("Error adding patient. Please try again.");
  //     }
  //     setShowAddPatient(false);
  //     setLoading(false);
  //     return;
  //   } 

  // }

  function handleChange(e) {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  }

  if (loadingPatients) {
    return (
      <div className="p-4 flex flex-col h-screen justify-center items-center"> 
        <div className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3F72AF] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading patient data...
        </div>
      </div>
    )
  }

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={5000} theme='colored' />
      <div className="p-4 flex flex-col gap-4"> 
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient List</h2>
          {auth.role === "admin" && (
          <button 
            onClick={() => setShowAddPatient(true)} 
            className="self-start py-2 px-4 mt-6 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
            disabled={loading}
          >
            Add Patient
          </button>
        )}
          {patients.map((patient, index) => (
            <div key={index} className="p-4 my-5 rounded shadow-md bg-white">
              <p><strong>Wallet Address:</strong> {patient.wallet_address}</p>
              <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
              <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
              <p><strong>Gender:</strong> {patient.gender}</p>

              <Link 
                to={`/patients/${patient.wallet_address}`} 
                className="inline-block mt-2 py-1 px-3 bg-[#3F72AF] text-white rounded text-sm font-semibold"
              >
                View
              </Link>
            </div>
          ))}
          {patients.length === 0 && <p className="text-gray-500">No patients found.</p>}
        </div>
        {/* Modal Overlay */}
        {showAddPatient && (
          <AddPatientModal
            show={showAddPatient}
            onClose={() => setShowAddPatient(false)}
            loading={loading}
            patientForm={patientForm}
            setPatientForm={setPatientForm}
            handleAddPatient={handleAddPatient}
          />
        )}

      </div>
    </div>
  );
}