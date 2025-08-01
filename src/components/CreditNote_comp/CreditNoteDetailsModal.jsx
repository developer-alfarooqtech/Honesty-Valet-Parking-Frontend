import React, { useState } from "react";
import { X, ReceiptText, FileText, Calendar, User, DollarSign, MessageCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { processCreditNote, cancelCreditNote } from "../../service/creditNoteService";
import { toast } from "react-hot-toast";

const CreditNoteDetailsModal = ({ creditNote, isOpen, onClose, onUpdate }) => {
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!creditNote || !isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount).toFixed(2)}`;
  };

  const handleProcessCreditNote = async () => {
    setProcessing(true);
    try {
      await processCreditNote(creditNote._id);
      
      // Update credit note status
      const updatedCreditNote = {
        ...creditNote,
        status: "processed",
        processedDate: new Date().toISOString()
      };
      
      if (onUpdate) {
        onUpdate(updatedCreditNote);
      }
      
      setProcessing(false);
      setShowProcessModal(false);
      onClose();
      toast.success("Credit note processed successfully");
    } catch (error) {
      console.error("Error processing credit note:", error);
      setProcessing(false);
      toast.error("Failed to process credit note");
    }
  };

  const handleCancelCreditNote = async () => {
    setCancelling(true);
    try {
      // Call the real API function with reason parameter
      await cancelCreditNote(creditNote._id, "Cancelled by user");
      
      // Update credit note status
      const updatedCreditNote = {
        ...creditNote,
        status: "cancelled",
        cancelledDate: new Date().toISOString()
      };
      
      if (onUpdate) {
        onUpdate(updatedCreditNote);
      }
      
      setCancelling(false);
      onClose();
      toast.success("Credit note cancelled successfully");
    } catch (error) {
      console.error("Error cancelling credit note:", error);
      setCancelling(false);
      toast.error("Failed to cancel credit note");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-blue-200 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-xl flex justify-between items-center z-20 shadow-lg border-b border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Credit Note Details</h2>
              <p className="text-blue-100 text-sm">
                Credit Note #{creditNote.creditNoteNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {creditNote.status === 'pending' && (
              <>
                <button
                  onClick={() => setShowProcessModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Process Credit
                </button>
                <button
                  onClick={handleCancelCreditNote}
                  disabled={cancelling}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {cancelling ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Cancelling...
                    </div>
                  ) : (
                    "Cancel Credit"
                  )}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center text-gray-600">
                      <ReceiptText className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium min-w-[120px]">Credit Note #:</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-right">{creditNote.creditNoteNumber}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center text-gray-600">
                      <FileText className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium min-w-[120px]">Invoice:</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-right">{creditNote.invoice?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium min-w-[120px]">Customer:</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-right">{creditNote.customer?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium min-w-[120px]">Credit Date:</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-right">{formatDate(creditNote.date)}</span>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  Financial Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg px-4 border border-blue-500/30">
                    <span className="text-blue-700 font-semibold text-lg">Credit Amount:</span>
                    <span className="font-bold text-xl text-blue-600">{formatCurrency(creditNote.creditAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Status Information */}
              <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  Status Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 font-medium">Current Status:</span>
                    <div className="flex items-center">
                      {creditNote.status === 'processed' ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-green-600 font-semibold">Processed</span>
                        </>
                      ) : creditNote.status === 'cancelled' ? (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-red-600 font-semibold">Cancelled</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          <span className="text-orange-600 font-semibold">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium">Created:</span>
                    </div>
                    <span className="font-semibold text-gray-800">{formatDate(creditNote.createdAt)}</span>
                  </div>
                  {creditNote.processedDate && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium">Processed:</span>
                      </div>
                      <span className="font-semibold text-green-600">{formatDate(creditNote.processedDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason and Description */}
              <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  Reason & Description
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason:</label>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-blue-700 font-medium">{creditNote.reason}</span>
                    </div>
                  </div>
                  {creditNote.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-700">{creditNote.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Confirmation Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-blue-200 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Process Credit Note</h3>
                  <p className="text-sm text-gray-600">Confirm processing of this credit note</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to process credit note <strong>{creditNote.creditNoteNumber}</strong> 
                  for <strong>{formatCurrency(creditNote.creditAmount)}</strong>?
                </p>
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Once processed, this action cannot be undone. The credit will be applied to the customer's account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowProcessModal(false)}
                  disabled={processing}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessCreditNote}
                  disabled={processing}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Process Credit Note"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditNoteDetailsModal;