import { usePatientData } from "../context/PatientDataContext";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { use, useEffect, useState } from "react";
import axios from "axios";
import AddProviderProfile from "../components/AddProviderProfile.jsx";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { contractABI, contractAddress } from "../contracts/PatientRegistryContract.js";
import { ethers } from "ethers";
import { fetchAndDecryptPatient } from "../utils/patients.js";


export default function Dashboard() {
  const { auth } = useAuth();
  const { patients, setPatients } = usePatientData();
  const [showAddProviderProfile, setShowAddProviderProfile] = useState(false);
  const [ providers, setProviders ] = useState([])
  const [events, setEvents] = useState([]);
  const [providerProfile, setProviderProfile] = useState({});

  

useEffect(() => {
  //open provider profile modal if user is a provider/admin and has no profile
  const fetchProfile = async () => {

    if (auth.role === "provider" || auth.role === "admin") {
      const response = await getProviderProfile();
      const profileExists = response.data.profileExists;
      if (!profileExists) {
        setShowAddProviderProfile(true);
        
      }else {
        setProviderProfile(response.data);
      }
    }
  };

  if (auth.role === "provider" || auth.role === "admin") {
    fetchProfile();
  }
  
  console.log("Provider profile:", providerProfile);
  //fetch profile data from the server

}, [auth.role])

useEffect(() => {
  const fetchProviders = async () => {
    try {
      const response = await getProviders();
      setProviders(response);
      console.log(providers)
      console.log("Providers data:", response);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  fetchProviders();
},[auth.role])

async function getProviderProfile() {
  const response = await axios.get("http://localhost:8000/api/auth/get_user_profile/?address=" + `${auth.walletid}`,
    {
    headers: { Authorization: `Bearer ${auth.accessToken}` }
  });
  console.log("Provider profile response:", response.data);
  return response;
}

async function getProviders() {
  const response = await axios.get("http://127.0.0.1:8000/api/auth/get_all_profiles/",
    {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
  return response.data;

}

async function getEvents() {

  if (auth.role === "admin" || auth.role === "provider") {

    const response = await axios.get("http://localhost:8000/api/events/get_events/?related_wallet_address=" + `${auth.walletid}`,
      {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    console.log("events", response.data);
    return response;
  }

  if (auth.role === "patient") {

    const response = await axios.get("http://localhost:8000/api/events/get_events/?related_patient_wallet_address=" + `${auth.walletid}`,
      {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    console.log("events", response.data);
    return response;
  }
}

useEffect(() => {
  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(response.data.events);
      console.log(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  fetchEvents();
},[auth.role])



const loadPatient = async () => {
  const encryptedPatient = await fetchAndDecryptPatient(auth.walletid);
  console.log(encryptedPatient);
  setPatients([encryptedPatient]);
}

useEffect(() => {
  if (auth.role === "patient") {
    loadPatient();
  }
}, [auth.walletid])
    

useEffect(() => {
  async function getProvidersForPatient(){
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const providers = await getProviders()
    console.log("Providers data from patient:", providers); 

    //check if each provider has access to the patient
    const accessibleProviders = [];

    for (const provider of providers) {
      const hasAccess = await contract.canProviderAccess(patients[0].wallet_address, provider.wallet_address);
      console.log("Access status for provider:", provider.wallet_address, ":", hasAccess);
      if (hasAccess) {
        accessibleProviders.push(provider);
      }
    }


    console.log("Accessible providers:", accessibleProviders);
    setProviders(accessibleProviders);

  }

  if (auth.role === "patient") {
    getProvidersForPatient()
  }

}, [patients])



  return (
   
    <div className="p-4 flex flex-col gap-4 h-screen">
      {showAddProviderProfile && (
       <AddProviderProfile 
        show={showAddProviderProfile}
        onClose={
          () => {
            setShowAddProviderProfile(false)
          }
        }
        setProviderProfile={setProviderProfile}
      />
      )}
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      { auth.role === "admin" && (
      <div className="flex flex-row gap-4 flex-1 overflow-hidden">

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">

          <div className="p-4 rounded shadow-md bg-white flex-shrink-0">
          {providerProfile.first_name == undefined ? <p className="text-gray-500">Profile not set up</p> : 
          
          <div>
            <h2 className="text-2xl font-bold mb-2 text-[#112D4E]">Welcome {`${providerProfile.title} ${providerProfile.first_name} ${providerProfile.last_name}`}</h2>
            <p className="text-gray-800 text-xl font-semibold">{providerProfile.job_title}</p>
            <p className="text-gray-500">Administrator</p>
            <p className="text-gray-500">{providerProfile.orgnisation_name}</p>
          </div>
          }
          </div>
        

          {/* Provider Access Section */}
          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Recent Activity</h2>
              
            </div>
            <div className="flex-1 overflow-y-auto h-full">
              {events.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {events.map((event, index) => (
                    <div key={index} className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between">
                      <div>
                        <p><strong>Type:</strong> {event.event_type}</p>
                        <p><strong>Date:</strong> {event.timestamp ? new Date(event.timestamp).toLocaleString(): ''}</p>
                        <p className="text-sm text-gray-500" ><strong>Description:</strong> {event.event_details}</p>
                        
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
              {/* <button 
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer">
                View all
              </button> */}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto h-full">
              {providers.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {providers.map((provider, index) => (
                    <div key={index} className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between">
                      <div>
                        <p><strong>Name:</strong> {provider?.first_name} {provider?.last_name}</p>
                        <p><strong>Job Title:</strong> {provider?.job_title}</p>
                        <p><strong>Organisation:</strong> {provider?.orgnisation_name}</p>
                        <p><strong>Added Date: </strong>{provider?.date_joined ? new Date(provider.date_joined).toLocaleDateString() : ''}</p>
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
              <Link 
                to="/patients"
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer">
                View all
              </Link>
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
      { auth.role === "provider" && (
      <div className="flex flex-row gap-4 flex-1 overflow-hidden">

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">

          <div className="p-4 rounded shadow-md bg-white flex-shrink-0">
          {providerProfile.first_name == undefined ? <p className="text-gray-500">Profile not set up</p> : (
              <div>
              <h2 className="text-2xl font-bold mb-2 text-[#112D4E]">Welcome {`${providerProfile.title} ${providerProfile.first_name} ${providerProfile.last_name}`}</h2>
              <p className="text-gray-800 text-xl font-semibold">{providerProfile.job_title}</p>
              <p className="text-gray-500">Healthcare Provider</p>
              <p className="text-gray-500">{providerProfile.orgnisation_name}</p>
              </div>
            )            
          }
          </div>
        

          {/* Provider Access Section */}
          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Recent Activity</h2>
              
            </div>
            <div className="flex-1 overflow-y-auto h-full">
              {events.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {events.map((event, index) => (
                    <div key={index} className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between">
                      <div>
                        <p><strong>Type:</strong> {event.event_type}</p>
                        <p><strong>Date:</strong> {event.timestamp ? new Date(event.timestamp).toLocaleString(): ''}</p>
                        <p className="text-sm text-gray-500" ><strong>Description:</strong> {event.event_details}</p>
                        
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

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Appointments */}
          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Added Patients</h2>
              <div className="flex gap-2">
              <Link 
                to="/patients"
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer">
                View all
              </Link>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto h-full">
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


          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Upcoming Appointments</h2>
              <Link 
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer"
                to="/appointments"
                >
                View all
              </Link>
            </div> 
            <div className="flex-1 overflow-y-auto h-full">
              {patients.map((patient, index) => (
                <div key={index} className="my-4">

                  {patient.appointments && patient.appointments.length > 0 ? (
                    patient.appointments.map((appointment, aIndex) => (
                      <div
                        key={aIndex}
                        className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between"
                      >
                        <div>
                          <p className="text-xl text-[#112D4E]"><strong>{appointment.title}</strong></p>
                          <p><strong>Patient Name:</strong> {patient.first_name} {patient.last_name}</p>
                          <p><strong>Date:</strong> {appointment.date}</p>
                          <p><strong>Time:</strong> {appointment.time}</p>
                          <p><strong>Description:</strong> {appointment.description}</p>
                        </div>

                        <Link
                          to={`/patients/${patient.wallet_address}`}
                          className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer"
                        >
                          View Patient
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No appointments available.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        
        </div>
      </div>
      )}
      { auth.role === "patient" && (
      <div className="flex flex-row gap-4 flex-1 overflow-hidden">

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">

          <div className="p-4 rounded shadow-md bg-white flex-shrink-0 flex flex-col">
          
            <div>
              <h2 className="text-2xl font-bold mb-2 text-[#112D4E]">Welcome {` ${patients[0].first_name} ${patients[0].last_name}`}</h2>
              <p className="text-[#6d6d6d] text-lg font-semibold">Date Of birth: {patients[0].date_of_birth}</p>
              <p className="text-gray-500 text-lg font-semibold">Gender: {patients[0].gender}</p>
              <p className="text-gray-500 ">Wallet Address: {patients[0].wallet_address}</p>
              <p className="text-gray-500">Created Date: {patients[0].created_date}</p>
            </div>
            <Link 
              className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer mt-4"
              to="/profile"
            >
              View Profile
            </Link>
            
          </div>
        

          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Recent Activity</h2>
              
            </div>
            <div className="flex-1 overflow-y-auto h-full">
              {events.filter(event =>
                event.event_type === "Patient Prescriptions Updated" ||
                event.event_type === "Patient Appointments Updated"
              ).length > 0 ? (
                <div className="flex flex-col gap-1">
                  {events
                    .filter(event =>
                      event.event_type === "Patient Prescriptions Updated" ||
                      event.event_type === "Patient Appointments Updated"
                    )
                    .map((event, index) => (
                      <div key={index} className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between">
                        <div>
                          <p><strong>Type:</strong> {event.event_type}</p>
                          <p><strong>Date:</strong> {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}</p>
                          <p className="text-sm text-gray-500"><strong>Description:</strong> {event.event_details}</p>
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

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Upcoming Appointments</h2>
              <Link 
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer"
                to="/appointments"
                >
                View all
              </Link>
            </div> 
            <div className="flex-1 overflow-y-auto h-full">
              {patients.map((patient, index) => (
                <div key={index} className="my-4">

                  {patient.appointments && patient.appointments.length > 0 ? (
                    patient.appointments.map((appointment, aIndex) => (
                      <div
                        key={aIndex}
                        className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between"
                      >
                        <div>
                          <p className="text-xl text-[#112D4E]"><strong>{appointment.title}</strong></p>
                          <p><strong>Date:</strong> {appointment.date}</p>
                          <p><strong>Time:</strong> {appointment.time}</p>
                          <p><strong>Description:</strong> {appointment.description}</p>
                        </div>

                        <Link
                          to={`/appointments`}
                          className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer"
                        >
                          View Calender
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No appointments available.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Recenly Added Providers</h2>
              <div className="flex gap-2">
              {/* <button 
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer">
                View all
              </button> */}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto h-full">
              {providers.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {providers.map((provider, index) => (
                    <div key={index} className="p-4 my-2 rounded shadow-md bg-[#edeff1] flex flex-row justify-between">
                      <div>
                        <p><strong>Name:</strong> {provider?.first_name} {provider?.last_name}</p>
                        <p><strong>Job Title:</strong> {provider?.job_title}</p>
                        <p><strong>Organisation:</strong> {provider?.orgnisation_name}</p>
                        <p><strong>Added Date: </strong>{provider?.date_joined ? new Date(provider.date_joined).toLocaleDateString() : ''}</p>
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

          
        
        </div>
      </div>
      )}
      
    </div>


  );
}
