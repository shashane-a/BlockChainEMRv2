import React from "react";

export default function EditNoteModal({
  patientNote,
  setPatientNote,
  loading,
  setShowEditNotes,
  handleAddNote,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowEditNotes(false)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-2/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#112D4E]">Add New Note</h2>
          <button
            onClick={() => setShowEditNotes(false)}
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

        <form onSubmit={handleAddNote} className="flex flex-col">
          <input
            name="note_title"
            placeholder="Title"
            value={patientNote.note_title}
            onChange={(e) =>
              setPatientNote({ ...patientNote, note_title: e.target.value })
            }
            className="my-5 block w-full p-2 border border-gray-300 rounded"
            required
          />
          <textarea
            name="note_description"
            placeholder="Description"
            value={patientNote.note_description}
            onChange={(e) =>
              setPatientNote({ ...patientNote, note_description: e.target.value })
            }
            maxLength={500}
            className="my-5 block w-full p-2 border border-gray-300 rounded"
            rows={8}
            required
          />

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowEditNotes(false)}
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
