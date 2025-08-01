import React, { useState } from 'react';
import { Calendar, X, Loader2 } from 'lucide-react';

const UpdateExpDateModal = ({ isOpen, onClose, invoice, onSubmit, loading }) => {
  const [newExpDate, setNewExpDate] = useState(
    invoice?.expDate ? new Date(invoice.expDate).toISOString().split('T')[0] : ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newExpDate) return;
    onSubmit(invoice._id, newExpDate);
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking on the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalContentClick = (e) => {
    // Prevent event bubbling when clicking inside the modal
    e.stopPropagation();
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 animate-fade-in backdrop-blur-md flex items-center justify-center z-60 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white border border-blue-200 rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300"
        onClick={handleModalContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Update Invoice Expiry Date
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Invoice Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice:</span>
              <span className="font-medium text-gray-800">{invoice?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Expiry:</span>
              <span className="font-medium text-gray-800">
                {invoice?.expDate ? new Date(invoice.expDate).toLocaleDateString("en-GB") : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label 
              htmlFor="newExpDate" 
              className="text-sm font-medium text-gray-700 mb-2 flex items-center"
            >
              <Calendar size={16} className="mr-2 text-blue-500" />
              New Expiry Date
            </label>
            <input
              type="date"
              id="newExpDate"
              value={newExpDate}
              onChange={(e) => setNewExpDate(e.target.value)}
              className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-800 placeholder-gray-400"
              required
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Expiry Date'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateExpDateModal;