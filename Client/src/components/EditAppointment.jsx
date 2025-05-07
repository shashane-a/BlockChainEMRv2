import React, { useState } from "react";

export default function EditAppointmentModal({
  appointment,
  setAppointment,
  loading,
  setShowEditAppointment,
  handleUpdateAppointment,
  handleCompleteAppointment,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowEditAppointment(false)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-2/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#112D4E]">Edit Appointment</h2>
          <button
            onClick={() => setShowEditAppointment(false)}
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

        <form onSubmit={handleUpdateAppointment} className="flex flex-col">
          <input
            name="appointment_title"
            placeholder="Title"
            value={appointment.appointment_title}
            onChange={(e) =>
              setAppointment({ ...appointment, appointment_title: e.target.value })
            }
            className="my-5 block w-full p-2 border border-gray-300 rounded"
            required
          />
          <textarea
            name="appointment_description"
            placeholder="Description"
            value={appointment.appointment_description}
            onChange={(e) =>
              setAppointment({ ...appointment, appointment_description: e.target.value })
            }
            maxLength={500}
            className="my-5 block w-full p-2 border border-gray-300 rounded"
            required
            rows={8}
          ></textarea>
          <input
            name="appointment_date"
            type="date"
            value={appointment.appointment_date}
            onChange={(e) =>
              setAppointment({ ...appointment, appointment_date: e.target.value })
            }
            className="my-5 block w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            name="appointment_time"
            type="time"
            value={appointment.appointment_time}
            onChange={(e) =>
              setAppointment({ ...appointment, appointment_time: e.target.value })
            }
            className="my-5 block w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            name="appointment_duration"
            type="number"
            placeholder="Duration (in minutes)"
            value={appointment.appointment_duration}
            onChange={(e) =>
              setAppointment({ ...appointment, appointment_duration: e.target.value })
            }
            className="my-5 block w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            name="appointment_location"
            placeholder="Location"
            value={appointment.appointment_location}
            onChange={(e) =>
              setAppointment({ ...appointment, appointment_location: e.target.value })
            }
            className="my-5 block w-full p-2 border border-gray-300 rounded"
            required
          />

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setShowEditAppointment(false)}
              className="mr-2 py-2 px-4 rounded bg-gray-300 text-gray-800 font-semibold"
            >
              Cancel
            </button>
            {!appointment.completed && (
              <button
                type="button"
                onClick={handleCompleteAppointment}
                className="mr-2 py-2 px-4 rounded bg-green-600 text-white font-semibold"
              >
                Mark Complete
              </button>
            )}
            <button
              type="submit"
              className="py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
