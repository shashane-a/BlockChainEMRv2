import { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Appointments.css';

import { toast, ToastContainer } from "react-toastify";
import { fetchAccessiblePatients } from "../utils/patients";
import { usePatientData } from "../context/PatientDataContext";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchPatientData, fetchAndDecryptPatient } from "../utils/patients";
import { useMemo } from "react";
import { all } from "axios";
import { Link } from "react-router-dom";


export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
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

        const allPrescriptions = []

        for (const patient of decryptedPatients) {
          const fullName = `${patient.first_name} ${patient.last_name}`;
          console.log('patient 🦊',patient);
          if (Array.isArray(patient.prescriptions)) {
            for (const prescription of patient.prescriptions) {
              allPrescriptions.push({
                id: `${patient.wallet_address}-${prescription.date_prescribed}`,
                patientName: fullName,
                medication_name: prescription.medication_name,
                dosage: prescription.dosage,
                unit: prescription.unit,
                frequency: prescription.frequency,
                time_frame: prescription.time_frame,
                prescribedBy: prescription.prescribed_by, 
                datePrescribed: prescription.date_prescribed, 
                notes: prescription.prescription_notes,
                wallet_address: patient.wallet_address,
              });
            }
          }
        }
        console.log("All prescriptions:", allPrescriptions);
        setPrescriptions(allPrescriptions);
        
        setLoadingPatients(false);
    }
    else if (auth.role == "patient"){
      const patient = await fetchAndDecryptPatient(auth.walletid);
      // console.log(encryptedPatient);
      setPatients([patient]);
      // console.log("Decrypted patient data:", encryptedPatient);

      const allPrescriptions = []

      const fullName = `${patient.first_name} ${patient.last_name}`;
      console.log('patient 🦊',patient);
      if (Array.isArray(patient.prescriptions)) {
        for (const prescription of patient.prescriptions) {
          allPrescriptions.push({
            id: `${patient.wallet_address}-${prescription.date_prescribed}`,
            patientName: fullName,
            medication_name: prescription.medication_name,
            dosage: prescription.dosage,
            unit: prescription.unit,
            frequency: prescription.frequency,
            time_frame: prescription.time_frame,
            prescribedBy: prescription.prescribed_by, 
            datePrescribed: prescription.date_prescribed, 
            notes: prescription.prescription_notes,
            wallet_address: patient.wallet_address,
          });
        }
      }
        

        setPrescriptions(allPrescriptions);
        
        setLoadingPatients(false);

    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) =>
      prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, prescriptions]);

  if (loadingPatients) {
    return (
      <div className="p-4 flex flex-col h-screen justify-center items-center">
        <div className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3F72AF] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading prescriptions...
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={5000} theme="colored" />
      <div className="p-4 flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Prescriptions</h2>
          <div className="flex flex-row gap-2 justify-between items-center">
            <input
              type="text"
              placeholder="Search by patient name"
              className="mt-6 px-4 py-2 shadow-mg rounded flex-1 h-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
{/* 
          {filteredPrescriptions.map((prescription,index) => (
            <div key={index} className="p-4 my-5 rounded shadow-md bg-white">
              <p><strong>Patient Name:</strong> {prescription.patientName}</p>
              <p><strong>Medication:</strong> {prescription.medication_name}</p>
              <p><strong>Dosage:</strong> {prescription.dosage} {prescription.unit}</p>
              <p><strong>Frequency:</strong> {prescription.frequency} times per {prescription.time_frame}</p>
              <p><strong>Notes:</strong> {prescription.notes}</p>
              <p><strong>Prescribed By:</strong> {prescription.prescribedBy}</p>
              <p><strong>Date Prescribed:</strong> {prescription.datePrescribed}</p>
            </div>
          ))} */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {filteredPrescriptions.map((prescription, index) => (
              <div key={index} className="p-6 rounded-lg shadow-md bg-white border border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-[#112D4E] rounded-lg mb-4">{prescription.patientName}</h3>

                </div>
                
                <div className="flex flex-col">
                  <div className="grid grid-cols-1 gap-y-0 text-[#112D4E]">
                    <div ><p><strong>Medication:</strong> {prescription.medication_name}</p></div>
                    <p><strong>Dosage:</strong> {prescription.dosage} {prescription.unit}</p>
                    <p><strong>Frequency:</strong> {prescription.frequency} times per {prescription.time_frame}</p>
                    <p><strong>Date Prescribed:</strong> {prescription.datePrescribed}</p>
                    <p><strong>Prescribed By:</strong> {prescription.prescribedBy}</p>
                    <p><strong>Notes:</strong> {prescription.notes || <span className="text-gray-400 italic">No notes provided</span>}</p>
                  </div>
                </div>
                {(auth.role === "admin" ||auth.role === "provider" ) && (
                <Link 
                to={`/patients/${prescription.wallet_address}`} 
                className="inline-block mt-2 py-1 px-3 bg-[#3F72AF] text-white rounded text-sm font-semibold"
              >
                View Patient
              </Link>
                )}
              </div>
            ))}
          </div>


          {!loadingPatients && filteredPrescriptions.length === 0 && (
            <p className="text-gray-500 mt-4">No prescriptions match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
