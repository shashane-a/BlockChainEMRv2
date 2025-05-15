import { usePatientData } from "../context/PatientDataContext";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AddProviderProfile from "../components/AddProviderProfile.jsx";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

  fetchProfile();
  
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


          <div className="p-4 rounded shadow-sm bg-white flex-1 flex flex-col">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Upcoming Appointments</h2>
              <Link 
                className="flex gap-2 self-start py-2 px-2 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer"
                to="/appointments"
                >
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
    </div>


  );
}
