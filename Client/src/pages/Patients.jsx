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
import { fetchPatientData, fetchPatientRecord } from "../utils/patients";

export default function Patients() {

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    wallet_address: "",
  });
  
  const [loading, setLoading] = useState(false);
  const { patients, setPatients } = usePatientData();
  const { auth } = useAuth();

  // Add useEffect to fetch patients data when component mounts
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const allPatients = await fetchPatientData();
        setPatients(allPatients);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error("Failed to load patients data");
      }
    };
    
    loadPatients();
  }, [setPatients]); // Only re-run when setPatients changes (which should be never)

  async function handleAddPatient(event) {
    event.preventDefault();
    setLoading(true);

    try {
      if (!window.ethereum) throw new Error("Please install MetaMask!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const wallet_address = patientForm.wallet_address;

      const uploadResponse = await uploadJsonToIPFS(patientForm, "patient.json");
      if (!uploadResponse) {
        console.error("Error uploading to IPFS");
        toast.error("Error uploading to IPFS");
        setLoading(false);
        return;
      }
      console.log("IPFS upload response:", uploadResponse);

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.addPatientRecord(wallet_address, uploadResponse.cid);
      await tx.wait();

      //add patient wallet address to django backend

      const response = await axios.post('http://localhost:8000/api/patients/addPatient/', {
        wallet_address: wallet_address,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      if (response.status !== 200) {
        console.error("Error adding patient to backend:", response.data);
        toast.error("Error adding patient wallet to backend");
      }

      const userRegistryContract = new ethers.Contract(userRegistryAddress, userRegistryABI, signer);
      const tx2 = await userRegistryContract.adminAddPatient(wallet_address);
      await tx2.wait();

      toast.success("Patient added successfully!")
      setLoading(false);
      setShowAddPatient(false);

      setPatientForm({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        wallet_address: "",
      });

      const allPatients = await fetchPatientData();
      console.log(allPatients); 
      setPatients(allPatients);

    } catch (error) {
      console.error("Error adding patient:", error);
      if (error.message.includes("User already exists")) {
        toast.error("User already exists in the registry.");
      } else {
        toast.error("Error adding patient. Please try again.");
      }
      setShowAddPatient(false);
      setLoading(false);
      return;
    } 

  }

  function handleChange(e) {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  }

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={5000} theme='colored' />
      <div className="p-4 flex flex-col gap-4">
        {auth.role === "admin" && (
          <button 
            onClick={() => setShowAddPatient(true)} 
            className="self-start py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
            disabled={loading}
          >
            Add Patient
          </button>
        )}
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patients List</h2>
          {/* loop over patient array */}
          {patients.map((patient, index) => (
            <div key={index} className="border p-4 my-5 rounded shadow-sm bg-white">
              <p><strong>Wallet Address:</strong> {patient.wallet_address}</p>
              <p><strong>First Name:</strong> {patient.first_name}</p>
              <p><strong>Last Name:</strong> {patient.last_name}</p>
              <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
              <p><strong>Sex: </strong> {patient.gender}</p>
            </div>
          ))}
          {patients.length === 0 && <p className="text-gray-500">No patients found.</p>}
        </div>
        {/* Modal Overlay */}
        {showAddPatient && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50" 
               onClick={() => setShowAddPatient(false)}>
            {/* Modal Content - Stop propagation to prevent closing when clicking inside the modal */}
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Patient</h2>
                <button 
                  onClick={() => setShowAddPatient(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddPatient} className="rounded">
                <input name="wallet_address" placeholder="Wallet Address" value={patientForm.wallet_address} onChange={handleChange} className="block w-full mb-2 p-2 border border-gray-300 rounded" required />
                <input name="first_name" placeholder="First Name" value={patientForm.first_name} onChange={handleChange} className="block w-full mb-2 p-2 border border-gray-300 rounded" required />
                <input name="last_name" placeholder="Last Name" value={patientForm.last_name} onChange={handleChange} className="block w-full mb-2 p-2 border border-gray-300 rounded" required />
                <input name="date_of_birth" type="date" value={patientForm.date_of_birth} onChange={handleChange} className="block w-full mb-2 p-2 border border-gray-300 rounded" required />
                <select name="gender" value={patientForm.gender} onChange={handleChange} className="block w-full mb-2 p-2 border border-gray-300 rounded" required>
                  <option value="">Select Gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex justify-end mt-4">
                  <button onClick={() => setShowAddPatient(false)} type="button" className="mr-2 py-2 px-4 rounded bg-gray-300 text-gray-800 font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="py-2 px-4 rounded bg-blue-600 text-white font-semibold" disabled={loading}>
                    {loading ? "Adding..." : "Add Patient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}