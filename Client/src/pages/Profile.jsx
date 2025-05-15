import React, {useState, useEffect} from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { usePatientData } from "../context/PatientDataContext.jsx";
import AddProviderProfile from "../components/AddProviderProfile.jsx";
import axios from "axios";
import { SquarePen  } from 'lucide-react';

export default function Profile() {
  const { auth } = useAuth();
  const { patients } = usePatientData();
  const [showAddProviderProfile, setShowAddProviderProfile] = useState(false);
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

  async function getProviderProfile() {
    const response = await axios.get("http://localhost:8000/api/auth/get_user_profile/?address=" + `${auth.walletid}`,
      {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    console.log("Provider profile response:", response.data);
    return response;
  }

  return (
    
    <div className="p-4 flex flex-col gap-4">
      {(auth.role === "admin" || auth.role === "provider") && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
          {/* Admin specific content can go here */}
        </div>
      )}
      
      {auth.role === "patient" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Patient Record</h2>
        
            <div className="p-4 my-5 rounded shadow-sm bg-white">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">General Details</h2>
              <p className="text-[#112D4E]"><strong>Wallet Address:</strong> {patients[0].wallet_address}</p>
              <p className="text-[#112D4E]"><strong>First Name:</strong> {patients[0].first_name}</p>
              <p className="text-[#112D4E]"><strong>Last Name:</strong> {patients[0].last_name}</p>
              <p className="text-[#112D4E]"><strong>Date of Birth:</strong> {patients[0].date_of_birth}</p>
              <p className="text-[#112D4E]"><strong>Gender:</strong> {patients[0].gender}</p>
            </div>
            <div className=" p-4 my-5 rounded shadow-sm bg-white">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Contact Details</h2>
              <p className="text-[#112D4E]"><strong>Phone Number:</strong> {patients[0].phoneNumber}</p>
              <p className="text-[#112D4E]"><strong>Email:</strong> {patients[0].email}</p>
            </div>
            <div className=" p-4 my-5 rounded shadow-sm bg-white">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Address</h2>
              <p className="text-[#112D4E]"><strong>House/Flat Number: </strong>{patients[0]?.address?.house_number} </p>
              <p className="text-[#112D4E]"><strong>Street: </strong>{patients[0]?.address?.street} </p>
              <p className="text-[#112D4E]"><strong>City: </strong>{patients[0]?.address?.city} </p>
              <p className="text-[#112D4E]"><strong>County: </strong>{patients[0]?.address?.county} </p>
              <p className="text-[#112D4E]"><strong>Country: </strong>{patients[0]?.address?.country} </p>
            </div>
            <button 
              className="flex gap-2 self-start py-3 px-5 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer shadow-md" 
              onClick={() => setShowEditNotes(true)}
            >
              <SquarePen size={20} strokeWidth={3} />
              Edit 
            </button>
          </div>
      )}
      
      {(auth.role == "provider" || auth.role == "admin") && (
        <div>
            <div className=" p-4 my-5 rounded shadow-sm bg-white">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">General Details</h2>
              <p className="text-[#112D4E]"><strong>Title:</strong> {providerProfile.title}</p>
              <p className="text-[#112D4E]"><strong>First Name:</strong> {providerProfile.first_name}</p>
              <p className="text-[#112D4E]"><strong>Last Name:</strong> {providerProfile.last_name}</p>
              <p className="text-[#112D4E]"><strong>Wallet Address:</strong> {auth.walletid}</p>
            </div>
            <div className=" p-4 my-5 rounded shadow-sm bg-white">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Contact Details</h2>
              <p className="text-[#112D4E]"><strong>Email:</strong> {providerProfile.email}</p>
            </div>
            <div className=" p-4 my-5 rounded shadow-sm bg-white">
              <h2 className="text-2xl font-bold mb-4 text-[#112D4E]">Organisation Details</h2>
              <p className="text-[#112D4E]"><strong>Organisation</strong> {providerProfile.orgnisation_name}</p>
              <p className="text-[#112D4E]"><strong>Job Title</strong> {providerProfile.job_title}</p>
            </div>
            <button 
              className="flex gap-2 self-start py-3 px-5 rounded bg-[#3F72AF] text-white font-semibold text-sm cursor-pointer shadow-md" 
              onClick={() => setShowEditNotes(true)}
            >
              <SquarePen size={20} strokeWidth={3} />
              Edit 
            </button>
        </div>
      )}
    </div>

  );
}