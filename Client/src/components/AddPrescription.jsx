import React from "react";

export default function AddPrescription({
  prescription,
  setPrescription,
  loading,
  setShowAddPrescription,
  handleAddPrescription,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowAddPrescription(false)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-2/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#112D4E]">Add New Prescription</h2>
          <button
            onClick={() => setShowAddPrescription(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

    {/* 
    fields to add a prescription

    medication_name
    dosage
    frequency
    prescribed_by
    date_prescribed
    prescription_notes */}


        <form onSubmit={handleAddPrescription} className="flex flex-col">
          <input
            name="medication_name"
            placeholder="Medication Name"
            value={prescription.medication_name}
            onChange={(e) =>
              setPrescription({ ...prescription, medication_name: e.target.value })
            }
            className="my-5 block w-full p-2 border border-gray-300 rounded"
            required
          />
          <div className="flex flex-row gap-2">
            <input
              name="dosage"
              placeholder="Dosage"
              value={prescription.dosage}
              onChange={(e) =>
                setPrescription({ ...prescription, dosage: e.target.value })
              }
              type="number"
              className="my-2 block w-full p-2 border border-gray-300 rounded  flex-2"
              required
            />
            <input
              name="unit"
              placeholder="Unit"
              value={prescription.unit}
              onChange={(e) =>
                setPrescription({ ...prescription, unit: e.target.value })
              }
              className="my-2 block w-full p-2 border border-gray-300 rounded flex-1"
              required
            />
          </div>
          <div className="flex flex-row gap-2">
            <input
              name="frequency"
              placeholder="Frequency"
              value={prescription.frequency}
              onChange={(e) =>
                setPrescription({ ...prescription, frequency: e.target.value })
              }
              type="number"
              className="my-2 block w-full p-2 border border-gray-300 rounded  flex-2"
              required
            />
            <input
              name="time_frame"
              placeholder="Time Frame"
              value={prescription.time_frame}
              onChange={(e) =>
                setPrescription({ ...prescription, time_frame: e.target.value })
              }
              
              className="my-2 block w-full p-2 border border-gray-300 rounded  flex-1"
              required
            />
          </div>
          
            <textarea
            name="prescription_notes"
             placeholder="Notes"
             value={prescription.prescription_notes}
             onChange={(e) =>
               setPrescription({ ...prescription, prescription_notes: e.target.value })
             }
             className="my-2 block w-full p-2 border border-gray-300 rounded  flex-2"
             required
             rows={4}
             ></textarea>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowAddPrescription(false)}
              type="button"
              className="mr-2 py-2 px-4 rounded bg-gray-300 text-gray-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
