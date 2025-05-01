import { Link, redirect, useParams, useNavigate  } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAndDecryptPatient } from "../utils/patients"; // assumes this uses CID + wallet to decrypt
import { ToastContainer, toast } from 'react-toastify';
import { SquarePen, Plus  } from 'lucide-react';


export default function PatientView() {
  const { walletAddress } = useParams();
  const [patient, setPatient] = useState(null);
  const [showEditNotes, setShowEditNotes] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    async function loadPatient() {
      try {
        toast.info("Fetching patient record...");
        const data = await fetchAndDecryptPatient(walletAddress);
        setPatient(data);
      } catch (error) {
        console.error("Failed to fetch patient record:", error);
        toast.error("Could not fetch patient data.");
      }
    }

    loadPatient();
  }, [walletAddress]);

  if (!patient) {
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
    <div className="p-4 flex flex-col h-screen"> 
        
      <ToastContainer position="bottom-right" autoClose={5000} theme='colored' />
      {showEditNotes && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50" 
               onClick={() => setShowEditNotes(false)}>
            {/* Modal Content - Stop propagation to prevent closing when clicking inside the modal */}
            <div className="bg-white p-6 rounded-lg shadow-lg w-2/5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#112D4E]">Add New Note</h2>
                <button 
                  onClick={() => setShowEditNotes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form  className="rounded space-y-6">

                <div>
                  {/* <h3 className="text-base font-semibold text-[#112D4E] mb-2">Title</h3> */}
                  <input 
                    name="note_title" 
                    placeholder="Title" 
                    // value={patientForm.wallet_address} 
                    // onChange={handleChange} 
                    className="my-5 block w-full p-2 border border-gray-300 rounded" 
                    required 
                  />
                  <textarea  
                    name="note_description" 
                    placeholder="Description" 
                    // value={patientForm.wallet_address} 
                    // onChange={handleChange} 
                    className="my-5 block w-full p-2 border border-gray-300 rounded" 
                    rows={8}
                    required 
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end pt-4">
                  <button onClick={() => setShowEditNotes(false)} type="button" className="mr-2 py-2 px-4 rounded bg-gray-300 text-gray-800 font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold" disabled={loading}>
                    {loading ? "Adding..." : "Add Note"}
                  </button>
                </div>
                </form>

            </div>
          </div>
        )}
      <button 
        onClick={() => window.history.back()}
        className="self-start mb-4 py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
      >
        Back
      </button>
      <div className="flex flex-row gap-5 flex-1 overflow-auto">
        <div className="p-4 rounded shadow-md bg-white flex-1">
          <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Patient Details</h2>
          <p className="text-[#112D4E]"><strong>Wallet Address:</strong> {patient.wallet_address}</p>
          <p className="text-[#112D4E]"><strong>First Name:</strong> {patient.first_name}</p>
          <p className="text-[#112D4E]"><strong>Last Name:</strong> {patient.last_name}</p>
          <p className="text-[#112D4E]"><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
          <p className="text-[#112D4E]"><strong>Gender:</strong> {patient.gender}</p>
          <h3 className="text-lg mt-4 font-semibold text-[#112D4E]">Contact Details</h3>
          <p className="text-[#112D4E]"><strong>Phone Number:</strong> {patient.phoneNumber}</p>
          <p className="text-[#112D4E]"><strong>Email:</strong> {patient.email}</p>
          <h3 className="text-lg mt-4 font-semibold text-[#112D4E]">Address</h3>
          <p className="text-[#112D4E]">{patient?.address?.house_number} {patient?.address?.street}</p>
          <p className="text-[#112D4E]">{patient?.address?.city}, {patient?.address?.county}, {patient?.address?.postcode}</p>
          <p className="text-[#112D4E]">{patient?.address?.country}</p>
        </div>
        <div className="p-4 rounded shadow-sm bg-white flex-1">
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Notes</h2>
            <button 
              className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
              onClick={() => setShowEditNotes(true)}
            >
              <Plus size={20} strokeWidth={3} />
              Add 
            </button>
          </div>
        </div>
        <div className="p-4 rounded shadow-sm bg-white flex-1">
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Provider Acccess</h2>
            <button 
              className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer"
              onClick={() => navigate("/access")}
            >
              <SquarePen size={20}/>
              Edit 
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4 flex-1 overflow-auto">
      <div className="p-4 my-5 rounded shadow-sm bg-white flex-1">
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Appointments</h2>
            <button 
              className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
            >
              <SquarePen size={20}/>
              Edit 
            </button>
          </div>
        </div>
        <div className="p-4 my-5 rounded shadow-sm bg-white flex-1">
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Prescriptions</h2>
            <button 
              className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
            >
              <SquarePen size={20}/>
              Edit 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
