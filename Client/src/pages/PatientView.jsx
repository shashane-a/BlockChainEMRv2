import { useParams, useNavigate  } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAndDecryptPatient, getEncryptedKeys } from "../utils/patients"; 
import { ToastContainer, toast } from 'react-toastify';
import { SquarePen, Plus, CircleAlert, X, Calendar, PillBottle  } from 'lucide-react';
import ConfirmModal from "../components/ConfirmModal";
import { ethers } from "ethers";
import { prepareEncryptedDataPatientUpdate } from "../utils/encryption"; 
import { contractAddress, contractABI } from "../contracts/PatientRegistryContract";
import  uploadJsonToIPFS  from "../utils/ipfs"; 
import EditNoteModal from "../components/EditNoteModal";
import AddAppointment from "../components/AddAppointment"; 
import AddPrescription from "../components/AddPrescription.jsx";
import { useAuth } from "../context/AuthContext.jsx"; 

export default function PatientView() {
  const { walletAddress } = useParams();
  const [patient, setPatient] = useState(null);
  const [showEditNotes, setShowEditNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingPatient, setUpdatingPatient] = useState(false);
  const { auth } = useAuth();
  const [pendingChanges, setPendingChanges] = useState({
    pending_notes: false,
    pending_appointments: false,
    pending_prescriptions: false,
  });
  const [patientNote, setPatientNote] = useState({
    note_title: "",
    note_description: "",
  })
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [appointment, setAppointment] = useState({
    appointment_title: "",
    appointment_description: "",
    appointment_date: "",
    appointment_time: "",
    appointment_duration: "",
    appointment_location: "",
    appointment_provider: auth?.walletid,
  })

  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [prescription, setPrescription] = useState({
    medication_name: "",
    dosage: "",
    unit: "",
    frequency: "",
    time_frame: "",
    prescribed_by: auth?.wallet_address,
    date_prescribed: new Date().toLocaleDateString(),
    prescription_notes: "",
  })

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    async function loadPatient() {
      try {
        toast.info("Fetching patient record...");
        const data = await fetchAndDecryptPatient(walletAddress);
        setPatient(data);
        console.log("Patient data:", data);
      } catch (error) {
        console.error("Failed to fetch patient record:", error);
        toast.error("Could not fetch patient data.");
      }
    }

    loadPatient();
  }, [walletAddress]);

  function handleAddNote(e) {
    e.preventDefault();
    setLoading(true);
    const note = {
      title: patientNote.note_title,
      description: patientNote.note_description,
      date: new Date().toLocaleDateString(),
    };

    const updatedPatient = {
      ...patient,
      notes: [...(patient.notes || []), note],
    };

    setPatient(updatedPatient);
    setLoading(false);
    setShowEditNotes(false);
    setPatientNote({ note_title: "", note_description: "" });
    setPendingChanges({ ...pendingChanges, pending_notes: true });
    toast.success("Note added successfully!");
  }

  function handleAddAppointment(e) {
    e.preventDefault();
    setLoading(true);
    const newAppointment = {
      title: appointment.appointment_title,
      description: appointment.appointment_description,
      date: appointment.appointment_date,
      time: appointment.appointment_time,
      duration: appointment.appointment_duration,
      location: appointment.appointment_location,
      provider: appointment.appointment_provider,
    };

    const updatedPatient = {
      ...patient,
      appointments: [...(patient.appointments || []), newAppointment],
    };

    setPatient(updatedPatient);
    setLoading(false);
    setShowAddAppointment(false);
    setAppointment({
      appointment_title: "",
      appointment_description: "",
      appointment_date: "",
      appointment_time: "",
      appointment_duration: "",
      appointment_location: "",
      appointment_provider: auth?.wallet_address,
      appointment_completed: false,
    });
    setPendingChanges({ ...pendingChanges, pending_appointments: true });
    toast.success("Appointment added successfully!");
  }

  async function handleAddPrescription(e) {
    e.preventDefault();
    setLoading(true);
    const newPrescription = {
      medication_name: prescription.medication_name,
      dosage: prescription.dosage,
      unit: prescription.unit,
      frequency: prescription.frequency,
      time_frame: prescription.time_frame,
      prescribed_by: prescription.prescribed_by,
      date_prescribed: prescription.date_prescribed,
      prescription_notes: prescription.prescription_notes,
    };

    console.log("New prescription:", newPrescription);

    const updatedPatient = {
      ...patient,
      prescriptions: [...(patient.prescriptions || []), newPrescription],
    };

    setPatient(updatedPatient);
    setLoading(false);
    setShowAddPrescription(false);
    setPrescription({
      medication_name: "",
      dosage: "",
      unit: "",
      frequency: "",
      time_frame: "",
      prescribed_by: auth?.wallet_address,
      date_prescribed: new Date().toLocaleDateString(),
      prescription_notes: "",
    });
    setPendingChanges({ ...pendingChanges, pending_prescriptions: true });
    toast.success("Prescription added successfully!");
  }

  async function handleUpdatePatient(event) {
    event.preventDefault();
    setUpdatingPatient(true);
    // Logic to update patient data in ipfs and smart contract

    console.log("Updating patient data:", patient);

     try {
      if (!window.ethereum) throw new Error("Please install MetaMask!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const wallet_address = patient.wallet_address;
      const adminAddress = await signer.getAddress();

      const encryptedKeys = await getEncryptedKeys(walletAddress);
      console.log("Encrypted keys:", encryptedKeys);
      const encryptedDataPackage = await prepareEncryptedDataPatientUpdate(patient, encryptedKeys);
      console.log("Encrypted package ready:", encryptedDataPackage);

      const uploadResponse = await uploadJsonToIPFS(encryptedDataPackage, `${wallet_address}.json`);
      console.log("Upload response:", uploadResponse);

      if (!uploadResponse) {
        console.error("Error uploading to IPFS");
        toast.error("Error uploading to IPFS");
        setLoading(false);
        return;
      }

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("wallet address:", wallet_address, 'ipf cid', uploadResponse.cid);
      const tx = await contract.updatePatientRecord(wallet_address, uploadResponse.cid);
      await tx.wait();

     } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      toast.error("Error connecting to MetaMask. Please try again.");
     }

    setUpdatingPatient(false);
    //set all pending changes to false
    setPendingChanges({
      pending_notes: false,
      pending_appointments: false,
      pending_prescriptions: false,
    });
    toast.success("Patient data updated successfully!");
    

  }

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
      {(showConfirmModal && Object.values(pendingChanges).some(value => value === true)) && (
        <ConfirmModal
          message="Are you sure you want to leave this page? You have unsaved changes."
          onConfirm={() => {
            setShowConfirmModal(false);
            navigate("/patients");  
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      {showEditNotes && (
        <EditNoteModal
          patientNote={patientNote}
          setPatientNote={setPatientNote}
          loading={loading}
          setShowEditNotes={setShowEditNotes}
          handleAddNote={handleAddNote}
        />
      )}
      {showAddAppointment && ( 
        <AddAppointment
          appointment={appointment}
          setAppointment={setAppointment}
          loading={loading}
          setShowAddAppointment={setShowAddAppointment}
          handleAddAppointment={handleAddAppointment}
        />
      )}
      {showAddPrescription && (
        <AddPrescription
          prescription={prescription}
          setPrescription={setPrescription}
          loading={loading}
          setShowAddPrescription={setShowAddPrescription}
          handleAddPrescription={handleAddPrescription}
        />
      )}

      <div className="flex flex-row justify-between items-center ">
        <button 
          onClick={() => {
            const hasPendingChanges = Object.values(pendingChanges).some(v => v === true);
            () => setShowConfirmModal(true);
            if (!hasPendingChanges) {
              navigate("/patients");
            } else {
              setShowConfirmModal(true);
            }
          }
          }
          className="self-start mb-4 py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
        >
          Back
        </button>
        
        {Object.values(pendingChanges).some(value => value === true) && (
        <button
          className="self-start mb-4 py-2 px-8 rounded bg-[#3F72AF] border-2 border-[#] text-white font-semibold text-sm cursor-pointer" 
          onClick={handleUpdatePatient}
        >
          {updatingPatient ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating Patient...
            </div>  )
            : (<>
              Update Patient
            </>)} 
        </button>
        )}
      </div>
      <div className="flex flex-row gap-5 flex-1 h-1/2">
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
        <div className="p-4 rounded shadow-sm bg-white flex flex-col flex-1 h-full">
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl flex items-center font-bold mb-4 text-[#112D4E]">Notes</h2>
            <button 
              className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
              onClick={() => setShowEditNotes(true)}
            >
              <Plus size={20} strokeWidth={3} />
              Add 
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {patient.notes && patient.notes.length > 0 ? (
              patient.notes.map((note, index) => (
                <div key={index} className="border-b border-gray-300 py-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-[#112D4E]">{note.title}</h3>
                    <p className="text-[#112D4E]">{note.description}</p>
                    <p className="text-sm text-gray-500">{note.date}</p>
                  </div>
                  <div className="relative justify-between items-center mt-2 mr-2">
                    <button 
                      className="justify-self-end text-[#3F72AF] hover:text-[#112D4E] font-semibold text-sm"
                      onClick={() => {
                        setPatient((prev) => ({
                          ...prev,
                          notes: prev.notes.filter((_, i) => i !== index),
                        }));
                        setPendingChanges({ ...pendingChanges, pending_notes: true });
                      }}
                    >
                      <X size={20} strokeWidth={3} className="text-white bg-[#cc6f6f] rounded"  />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No notes available.</p>
            )}
          </div>
          {pendingChanges.pending_notes ? (
            <div className="flex items-center text-[#afafaf] mt-2">
              <div className="flex items-center justify-center">
                <CircleAlert size={20} strokeWidth={3} className="text-[#cc6f6f] mr-2" />
              </div>
              Changes are not saved yet!
            </div>
          ) : ( null )}
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
          <p className="text-gray-500">Providers not added</p>
        </div>
      </div>
      <div className="flex flex-row gap-4 flex-1 overflow-hidden">
        <div className="p-4 my-5 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Appointments</h2>
            <div className="flex gap-2">
              <button 
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
                onClick={() => setShowAddAppointment(true)}
                >
                <SquarePen size={20}/>
                Add 
              </button>
              <button 
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
                onClick={() => navigate("/appointments")}
              >
                <Calendar size={20}/>
                View All 
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {patient.appointments && patient.appointments.length > 0 ? (
              patient.appointments.map((appointment, index) => (
                <div key={index} className="border-b border-gray-300 py-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-[#112D4E]">{appointment.title}</h3>
                    <p className="text-[#112D4E]">{appointment.description}</p>
                    <p className="text-sm text-gray-500">{appointment.date} {appointment.time}</p>
                    <p className="text-sm text-gray-500">{appointment.location}</p>
                  </div>
                  <div className="relative justify-between items-center mt-2 mr-2">
                    <button 
                      className="justify-self-end text-[#3F72AF] hover:text-[#112D4E] font-semibold text-sm"
                      onClick={() => {
                        setPatient((prev) => ({
                          ...prev,
                          appointments: prev.appointments.filter((_, i) => i !== index),
                        }));
                        setPendingChanges({ ...pendingChanges, pending_appointments: true });
                      }}
                    >
                      <X size={20} strokeWidth={3} className="text-white bg-[#cc6f6f] rounded"  />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No appointments available.</p>
            )}
          </div>
          {pendingChanges.pending_appointments ? (
            <div className="flex items-center text-[#afafaf] mt-2">
              <div className="flex items-center justify-center">
                <CircleAlert size={20} strokeWidth={3} className="text-[#cc6f6f] mr-2" />
              </div>
              Changes are not saved yet!
            </div>
          ) : ( null )}

        </div>
        <div className="p-4 my-5 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Prescriptions</h2>
            <div className="flex gap-2">
              <button 
                  className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
                  onClick={() => setShowAddPrescription(true)}
                  >
                  <SquarePen size={20}/>
                Add 
              </button>
              <button 
                  className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
                  onClick={() => navigate("/prescriptions")}
                >
                <PillBottle size={20}/>
                  View All 
              </button>
              
            </div>
            
          </div>
          <div className="flex-1 overflow-y-auto">
            {patient.prescriptions && patient.prescriptions.length > 0 ? (
              patient.prescriptions.map((prescription, index) => (
                <div key={index} className="border-b border-gray-300 py-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-[#112D4E]">{prescription.medication_name}</h3>
                    <p className="text-[#112D4E]">{prescription.dosage} {prescription.unit}</p>
                    <p className="text-[#112D4E]">{prescription.frequency} times per {prescription.time_frame}</p>
                    <p className="text-sm text-gray-500">{prescription.date_prescribed}</p>
                    
                    <p className="text-sm text-gray-500">{prescription.prescription_notes}</p>
                  </div>
                  <div className="relative justify-between items-center mt-2 mr-2">
                    <button 
                      className="justify-self-end text-[#3F72AF] hover:text-[#112D4E] font-semibold text-sm"
                      onClick={() => {
                        setPatient((prev) => ({
                          ...prev,
                          prescriptions: prev.prescriptions.filter((_, i) => i !== index),
                        }));
                        setPendingChanges({ ...pendingChanges, pending_prescriptions: true });
                      }}
                    >
                      <X size={20} strokeWidth={3} className="text-white bg-[#cc6f6f] rounded"  />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No prescriptions available.</p>
            )}
          </div>
          {pendingChanges.pending_prescriptions ? (
            <div className="flex items-center text-[#afafaf] mt-2">
              <div className="flex items-center justify-center">
                <CircleAlert size={20} strokeWidth={3} className="text-[#cc6f6f] mr-2" />
              </div>
              Changes are not saved yet!
            </div>
          ) : ( null )}
          
        </div>
      </div>
    </div>
  );
}
