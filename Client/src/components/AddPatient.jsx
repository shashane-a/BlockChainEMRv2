import React, { useEffect } from 'react';

export default function AddPatientModal({ 
  show, 
  onClose, 
  loading, 
  patientForm, 
  setPatientForm, 
  handleAddPatient,
  isAdminAddPatient = true,
  walletid = null,
  updatePatient = false,
}) {

  useEffect(() => {
    if (!isAdminAddPatient && walletid) {
      setPatientForm((prevForm) => ({
        ...prevForm,
        wallet_address: walletid,
      }));
    }
  }, [walletid, isAdminAddPatient, show]);

  const handleInputChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };


  const handleAddressChange = (field, value) => {
    setPatientForm({
      ...patientForm,
      address: {
        ...patientForm.address,
        [field]: value,
      },
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-2/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          {updatePatient ? (
            <h2 className="text-xl font-bold text-[#112D4E]">Update Profile</h2>) :(
            <h2 className="text-xl font-bold text-[#112D4E]">Add New Patient</h2>
          )}   
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleAddPatient} className="rounded space-y-6">
          {/* Wallet */}
          <div>
            <h3 className="text-base font-semibold text-[#112D4E] mb-2">Wallet</h3>
            <input 
              name="wallet_address" 
              placeholder="Wallet Address" 
              value= {walletid || patientForm.wallet_address}
              onChange={handleInputChange} 
              className="block w-full p-2 border border-gray-300 rounded" 
              disabled={!isAdminAddPatient}
              required 
            />
            <p className="text-sm text-gray-500 mt-1">Must be a valid Ethereum wallet address.</p>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-base font-semibold text-[#112D4E] mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="first_name" placeholder="First Name" value={patientForm.first_name} onChange={handleInputChange} className="p-2 border border-gray-300 rounded" required />
              <input name="last_name" placeholder="Last Name" value={patientForm.last_name} onChange={handleInputChange} className="p-2 border border-gray-300 rounded" required />
              <input name="date_of_birth" type="date" value={patientForm.date_of_birth} onChange={handleInputChange} className="p-2 border border-gray-300 rounded" required />
              <select name="gender" value={patientForm.gender} onChange={handleInputChange} className="p-2 border border-gray-300 rounded" required>
                <option value="">Select Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold text-[#112D4E] mb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="phoneNumber" placeholder="Phone Number" value={patientForm.phoneNumber} onChange={handleInputChange} className="p-2 border border-gray-300 rounded" required />
              <input name="email" type="email" placeholder="Email" value={patientForm.email} onChange={handleInputChange} className="p-2 border border-gray-300 rounded" required />
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-base font-semibold text-[#112D4E] mb-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="house_number" placeholder="House Number" value={patientForm.address.house_number} onChange={(e) => handleAddressChange("house_number", e.target.value)} className="p-2 border border-gray-300 rounded" required />
              <input name="street" placeholder="Street" value={patientForm.address.street} onChange={(e) => handleAddressChange("street", e.target.value)} className="p-2 border border-gray-300 rounded" required />
              <input name="city" placeholder="City" value={patientForm.address.city} onChange={(e) => handleAddressChange("city", e.target.value)} className="p-2 border border-gray-300 rounded" required />
              <input name="county" placeholder="County" value={patientForm.address.county} onChange={(e) => handleAddressChange("county", e.target.value)} className="p-2 border border-gray-300 rounded" />
              <input name="postcode" placeholder="Postcode" value={patientForm.address.postcode} onChange={(e) => handleAddressChange("postcode", e.target.value)} className="p-2 border border-gray-300 rounded" required />
              <input name="country" placeholder="Country" value={patientForm.address.country} onChange={(e) => handleAddressChange("country", e.target.value)} className="p-2 border border-gray-300 rounded" required />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={onClose} type="button" className="mr-2 py-2 px-4 rounded bg-gray-300 text-gray-800 font-semibold">Cancel</button>
            {updatePatient ?  (
              <button type="submit" className="py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold" disabled={loading}>
              {loading ? "Adding..." : "Update Profile"}
            </button>
            ):(
              <button type="submit" className="py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold" disabled={loading}>
              {loading ? "Adding..." : "Add Patient"}
            </button>
            )}
            
          </div>
        </form>
      </div>
    </div>
  );
}
