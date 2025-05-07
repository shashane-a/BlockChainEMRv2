import { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Appointments.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { toast, ToastContainer } from "react-toastify";
import { fetchAccessiblePatients } from "../utils/patients";
import { usePatientData } from "../context/PatientDataContext";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchPatientData, fetchAndDecryptPatient } from "../utils/patients";
import { Link } from "react-router-dom";

export default function Appointments() {

  const [loadingPatients, setLoadingPatients] = useState(false);
  const { patients, setPatients } = usePatientData();
  const { auth } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleCompleteAppointment = async () => {
    const updatedPatients = [...patients];
  
    for (const patient of updatedPatients) {
      const fullName = `${patient.first_name} ${patient.last_name}`;
      if (fullName === selectedEvent.patientName) {
        const appointment = patient.appointments.find(app => {
          const start = new Date(`${app.date}T${app.time}`);
          return (
            start.getTime() === selectedEvent.start.getTime() &&
            app.title === selectedEvent.title.split(" - ")[0]
          );
        });
  
        if (appointment) {
          appointment.completed = true; 
  
          try {

            toast.success("Appointment marked as completed!");
            setIsModalOpen(false);
            // loadPatients();
          } catch (error) {
            console.error("Error updating patient record:", error);
            toast.error("Failed to update appointment.");
          }
        }
        break;
      }
    }
  };
  

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

        const allAppointments = [];

        for (const patient of decryptedPatients) {
          const fullName = `${patient.first_name} ${patient.last_name}`;
          console.log("Patient:", patient);

          if (Array.isArray(patient.appointments)) {
            patient.appointments.forEach(appointment => {
              const { title, date, time, duration, description, location, provider, isComplete } = appointment;

              const start = new Date(`${date}T${time}`);
              const end = new Date(start.getTime() + parseInt(duration) * 60000); 
              

              allAppointments.push({
                title: `${title} - ${fullName}`, 
                start,
                end,
                description,
                patientName: fullName,
                location: location, 
                backgroundColor: `${isComplete ? '#3f72af' : '#3f72af'}`, // Change color based on completion status
                wallet_address: patient.wallet_address,
                
              });
            });
          }
        }

        setEvents(allAppointments);

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

      const allAppointments = [];

      for (const patient of decryptedPatients) {
        const fullName = `${patient.first_name} ${patient.last_name}`;

        if (Array.isArray(patient.appointments)) {
          patient.appointments.forEach(appointment => {
            const { title, date, time, duration, description, location } = appointment;

            const start = new Date(`${date}T${time}`);
            const end = new Date(start.getTime() + parseInt(duration) * 60000); // convert duration (minutes) to ms

            allAppointments.push({
              title: `${title} - ${fullName}`, // Include patient name in title
              start,
              end,
              description,
              patientName: fullName,
              location: location,
              backgroundColor: '#3F72AF',
              wallet_address: patient.wallet_address,
            });
          });
        }
      }

      setEvents(allAppointments);

      setLoadingPatients(false);
    }

    else if (auth.role == "patient"){
      const patient = await fetchAndDecryptPatient(auth.walletid);
      // console.log(encryptedPatient);
      setPatients([patient]);
      // console.log("Decrypted patient data:", encryptedPatient);

      const allAppointments = [];

      const fullName = `${patient.first_name} ${patient.last_name}`;

      if (Array.isArray(patient.appointments)) {
        patient.appointments.forEach(appointment => {
          const { title, date, time, duration, description, location } = appointment;

          const start = new Date(`${date}T${time}`);
          const end = new Date(start.getTime() + parseInt(duration) * 60000); // convert duration (minutes) to ms

          allAppointments.push({
            title: `${title} - ${fullName}`, // Include patient name in title
            start,
            end,
            description,
            patientName: fullName,
            location: location,
            backgroundColor: '#3F72AF',
            wallet_address: patient.wallet_address,
          });
        });
      }
      setEvents(allAppointments);

      setLoadingPatients(false);

    }

  };

  useEffect(() => {
    loadPatients();
  }, [setPatients]);

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

    
    
    
    <div className="flex flex-col h-[100vh]">
      {isModalOpen && selectedEvent && (

        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#112D4E]">{selectedEvent.title}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">

              <h3 className="text-lg font-semibold text-[#112D4E]">{selectedEvent.description}</h3>
              <p className="text-[#112D4E]">Start: {selectedEvent.start.toLocaleString()}</p>
              <p className="text-[#112D4E]">End: {selectedEvent.date} {selectedEvent.end.toLocaleString()}</p>
              <br></br>
              <p className="text-[#112D4E]">{selectedEvent.location}</p>
            </div>
            {/* <button 
                  className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer" 
                  // onClick={handleCompleteAppointment}
                  >
                  <Check size={20} strokeWidth={3}/>
                Go to Patient Profile 
              </button> */}
              {(auth.role === "admin" ||auth.role === "provider" ) && (
              <Link 
                to={`/patients/${selectedEvent.wallet_address}`} 
                className="inline-block mt-2 p-3 bg-[#3F72AF]  text-white rounded text-sm font-semibold"
              >
                Go to Patient Profile
              </Link>
              )}
          </div>
    </div>
      )}
      <ToastContainer position="bottom-right" autoClose={5000} theme='colored' />
      {/* Header */}
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
      </div>


        <div className="flex-1 overflow-hidden px-4 py-4 pb-4 m-4 bg-white rounded shadow">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]} 
            initialView="dayGridMonth"
            height="100%"
            weekends={true}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short' // shows 'AM' or 'PM'
            }}
            events={events}
            eventClick={(info) => {
              info.jsEvent.preventDefault();
              setSelectedEvent({
                title: info.event.title,
                start: info.event.start,
                end: info.event.end,
                description: info.event.extendedProps.description,
                patientName: info.event.extendedProps.patientName,
                location: info.event.extendedProps.location,
                wallet_address: info.event.extendedProps.wallet_address,
              });
              console.log("Selected event:", info.event.extendedProps.wallet_address);
              setIsModalOpen(true);
            }}
            
          />
        </div>
    </div>
  );
}
