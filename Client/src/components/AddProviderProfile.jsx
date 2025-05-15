import React from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../context/AuthContext.jsx";

export default function AddProviderProfile({ 
  show, 
  onClose, 
  setProviderProfile,
}) {
  if (!show) return null;


  const [formData, setFormData] = React.useState({
    title: "",
    first_name: "",
    last_name: "",
    email: "",
    job_title: "",
    organisation_name: "",
  });
  const [loading, setLoading] = React.useState(false);
  const { auth } = useAuth();




  function handleInputChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/auth/set_user_profile/", {
          title: formData.title,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          job_title: formData.job_title,
          orgnisation_name: formData.organisation_name,
      },{ 
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
      );

      

      if (response.status === 200) {
        console.log("Profile created successfully:", response.data);
        toast.success("Profile created successfully!");

        const providerProfileData = await axios.get("http://localhost:8000/api/auth/get_user_profile/?address=" + `${auth.walletid}`,
          {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        console.log("Provider profile response:", providerProfileData.data);

        setProviderProfile(providerProfileData.data);
        setLoading(false);
        onClose(); 
      }

      console.log("Profile data:", response.data);
      
    }catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-2/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#112D4E]">Create Your Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              placeholder="Title (e.g., Dr, Mr, Ms)"
              value={formData.title}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded"
              required
            />
            <input
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded"
              required
            />
            <input
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded"
              required
            />
            <input
              name="job_title"
              placeholder="Job Title"
              value={formData.job_title}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              name="organisation_name"
              placeholder="Organisation Name"
              value={formData.organisation_name}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={onClose} type="button" className="mr-2 py-2 px-4 rounded bg-gray-300 text-gray-800 font-semibold">Cancel</button>
            <button type="submit" className="py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
