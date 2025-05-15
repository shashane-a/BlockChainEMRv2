import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePatientData } from "../context/PatientDataContext";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchPatientData, fetchPatientRecord, fetchAndDecryptPatient, fetchAccessiblePatients } from "../utils/patients";
import { Link } from "react-router-dom";
import AddPatientModal from "../components/AddPatient.jsx";
import { addPatientRecord } from "../utils/addPatienRecord.js";
import { useMemo } from "react";


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
    created_date: new Date().toISOString().split("T")[0],
    updated_date: new Date().toISOString().split("T")[0],
  });
  
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loading, setLoading] = useState(false);
  const { patients, setPatients } = usePatientData();
  const { auth } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");


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

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, patients]);


  useEffect(() => {
    loadPatients();
  }, [setPatients]); 

  async function handleAddPatient(event) {
    event.preventDefault();
    setLoading(true);
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      const result = await addPatientRecord(patientForm, signer, toast, true);
  
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
        await loadPatients(); 
      }
  
    } finally {
      setLoading(false);
    }
  }
  


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
          <div className="flex flex-row gap-2 justify-between items-center">
            {auth.role === "admin" && (
            <button 
              onClick={() => setShowAddPatient(true)} 
              className="self-start py-2 px-4 mt-6 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
              disabled={loading}
            >
              Add Patient
            </button>
          )}
          <input
            type="text"
            placeholder="Search by patient name"
            className="mt-6 px-4 py-2 shadow-mg rounded flex-1 h-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          </div>
          {filteredPatients.map((patient, index) => (
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
          {patients.length === 0 && <p className="text-gray-500 mt-4">No patients found.</p>}
        </div>

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