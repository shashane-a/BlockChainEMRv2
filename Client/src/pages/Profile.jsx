import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { usePatientData } from "../context/PatientDataContext.jsx";

export default function Profile() {

  const { patients } = usePatientData();

  return (
    <div className="profile">
      <div className="p-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">My Patient Record</h2>
        <div className="border p-4 my-5 rounded shadow-sm bg-white">
              <p><strong>Wallet Address:</strong> {patients[0].wallet_address}</p>
              <p><strong>First Name:</strong> {patients[0].first_name}</p>
              <p><strong>Last Name:</strong> {patients[0].last_name}</p>
              <p><strong>Date of Birth:</strong> {patients[0].date_of_birth}</p>
              <p><strong>Sex: </strong> {patients[0].gender}</p>
            </div>
      </div>
    </div>
  );
}