import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, orderId }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Portal the modal to the document body to ensure full coverage */}
      {typeof document !== 'undefined' && document.body && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-blue-600">Order ID Already Exists</h3>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                The Order ID "<span className="font-medium">{orderId}</span>" is already used. 
                Are you sure you want to continue?
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ConfirmationModal;