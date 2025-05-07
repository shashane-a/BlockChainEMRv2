import { usePatientData } from "../context/PatientDataContext";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { auth } = useAuth();
  const { patients, setPatients } = usePatientData();
  const [ providers, setProviders ] = useState([
    {
      name: "Dr. John Doe",
      job_title: "Radiologist",
      organisation: "MediCare Clinic",
      added_date: "28/04/2025 10:40",
    },
    {
      name: "Dr. Jane Smith",
      job_title: "Cardiologist",
      organisation: "HeartCare Clinic",
      added_date: "28/04/2025 10:42",
    },
    {
      name: "Emily Johnson",
      job_title: "Radiology Technician",
      organisation: "Radilogy Clinic",
      added_date: "28/04/2025 10:45",
    },
  ])

  const [events, setEvents] = useState([
    {
      type: "User Registerd",
      date: "28/04/2025 10:40",
      description: "User registered with wallet id 0x7A6b2ce68400FC2b1ab66d60ADE56333a11A6c40",
    },
    {
      type: "User Registerd",
      date: "28/04/2025 10:45",
      description: "User registered with wallet id 0xE1e9ADde214305fcBa2eb37daF74410FF32055B5",
    },
    {
      type: "Patient Added",
      date: "28/04/2025 10:51",
      description: "Patient added with wallet id 0xDAD3e36F7E135c67123F4DF53e90472A40cEB01c",
    },
    {
      type: "Patient Added",
      date: "28/04/2025 10:56",
      description: "User registered with wallet id 0xa3C4B27128670e8DF6C39793941DBA7c97191E73",
    },
    {
      type: "User Registerd",
      date: "28/04/2025 11:13",
      description: "0xb295806b76fEc3057F9fBeE9474E25468A5C94fF",
    },
  ]);

  return (
    <div className="p-4 flex flex-col gap-4 h-screen">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      { auth.role === "admin" && (
      <div className="flex flex-row gap-4 flex-1 overflow-hidden">

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">

          <div className="p-4 rounded shadow-md bg-white flex-shrink-0">
            <h2 className="text-2xl font-bold mb-2 text-[#112D4E]">Welcome John Smith</h2>
            <p className="text-gray-800 text-xl font-semibold">Administrator</p>
            <p className="text-gray-500">Radiology Lead</p>
            <p className="text-gray-500">MediCare Clinic</p>
          </div>
        

          {/* Provider Access Section */}
          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Recent Activity</h2>
              
            </div>
            <div>
              {events.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {events.map((event, index) => (
                    <div key={index} className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between">
                      <div>
                        <p><strong>Type:</strong> {event.type}</p>
                        <p><strong>Date:</strong> {event.date}</p>
                        <p><strong>Description:</strong> {event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Appointments + Prescriptions */}
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Appointments */}
          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Recenly joined Providers</h2>
              <div className="flex gap-2">
              <button 
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer">
                View all
              </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto h-full">
              {providers.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {providers.map((provider, index) => (
                    <div key={index} className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between">
                      <div>
                        <p><strong>Name:</strong> {provider.name}</p>
                        <p><strong>Job Title:</strong> {provider.job_title}</p>
                        <p><strong>Organisation:</strong> {provider.organisation}</p>
                        <p><strong>Added Date: </strong>{provider.added_date}</p>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <p className="text-gray-500">No providers added</p>
                </div>
              )}

            </div>

          </div>


          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Recenly added Patients</h2>
              <button 
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer">
                View all
              </button>
            </div>
            {patients.map((patient, index) => (
                <div key={index} className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between">
                  <div>
                    <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
                    <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
                    <p><strong>Gender:</strong> {patient.gender}</p>
                    <p><strong>Added Date: </strong>28/04/2025 10:33</p>
                  </div>
                  
                  <Link 
                    to={`/patients/${patient.wallet_address}`} 
                    className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer"
                  >
                    View
                  </Link>
                </div>
              ))}
              {patients.length === 0 && (
                <div className="flex-1 overflow-y-auto">
                  <p className="text-gray-500">No patients added</p>
                </div>
              )}
            
          </div>
        
        </div>
      </div>
      )}
    </div>


  );
}
