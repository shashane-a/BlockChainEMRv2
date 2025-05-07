import React from 'react';

export default function AddProviderProfile({ 
  show, 
  onClose, 
  loading, 
  formData, 
  setFormData, 
  handleSubmit 
}) {
  if (!show) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-2/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#112D4E]">Add User</h2>
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
