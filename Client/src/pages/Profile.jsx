import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { usePatientData } from "../context/PatientDataContext.jsx";

export default function Profile() {
  const { auth } = useAuth();
  const { patients } = usePatientData();

  return (
    
    <div className="p-4 flex flex-col gap-4">
      {auth.role === "admin" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
          {/* Admin specific content can go here */}
        </div>
      )}
      
      {auth.role === "patient" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Patient Record</h2>
          <div className="border p-4 my-5 rounded shadow-sm bg-white">
            <p><strong>Wallet Address:</strong> {patients[0]?.wallet_address}</p>
            <p><strong>First Name:</strong> {patients[0]?.first_name}</p>
            <p><strong>Last Name:</strong> {patients[0]?.last_name}</p>
            <p><strong>Date of Birth:</strong> {patients[0]?.date_of_birth}</p>
            <p><strong>Sex: </strong> {patients[0]?.gender}</p>
            <p><strong>Phone Number:</strong> {patients[0]?.phoneNumber}</p>
            <p><strong>Email:</strong> {patients[0].email}</p>
            <p><strong>Address:</strong></p>
            <p>House Number: {patients[0]?.address?.house_number}</p>
            <p>Street: {patients[0]?.address?.street}</p>
            <p>City: {patients[0]?.address?.city}</p>
            <p>County: {patients[0]?.address?.county}</p>
            <p>Postcode: {patients[0]?.address?.postcode}</p>
            <p>Country: {patients[0]?.address?.country}</p>
            
          </div>
        </div>
      )}
      
      {auth.role !== "patient" && auth.role !== "admin" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
          <p>Welcome to your profile dashboard.</p>
        </div>
      )}
    </div>

  );
}