import React from 'react';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-1/3"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-[#112D4E] mb-4 text-center">{message}</h2>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="py-2 px-4 rounded bg-gray-300 text-gray-800 font-semibold"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="py-2 px-4 rounded bg-[#3F72AF] text-white font-semibold"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
