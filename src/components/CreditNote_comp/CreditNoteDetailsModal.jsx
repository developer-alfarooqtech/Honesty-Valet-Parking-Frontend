import React, { useState } from "react";
import { X, ReceiptText, FileText, Calendar, User, DollarSign, MessageCircle, CheckCircle, AlertCircle, Printer } from "lucide-react";
import { processCreditNote, cancelCreditNote, deleteCreditNote } from "../../service/creditNoteService";
import { toast } from "react-hot-toast";
import { printMultipleCreditNotes } from "./PrintCreditNote";

const CreditNoteDetailsModal = ({ creditNote, isOpen, onClose, onUpdate, onEdit, onDelete }) => {
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [printingCurrentCredit, setPrintingCurrentCredit] = useState(false);

  if (!creditNote || !isOpen) return null;

  const resolvedLineItems = Array.isArray(creditNote.items) && creditNote.items.length > 0
    ? creditNote.items
    : Array.isArray(creditNote.lineItems)
    ? creditNote.lineItems
    : [];
  const hasLineItems = resolvedLineItems.length > 0;
  const resolvedVatRate = Number.isFinite(Number(creditNote.vatRate))
    ? Number(creditNote.vatRate)
    : 5;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    const numericValue = Number(amount);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
    return `AED ${safeValue.toFixed(2)}`;
  };

  const calculateLineTotal = (item) => {
    const qty = item?.itemType === "credit"
      ? 1
      : Number(item?.creditedQuantity ?? item?.quantity) || 0;
    const price = Number(item?.unitPrice ?? item?.price) || 0;
    return parseFloat((qty * price).toFixed(2));
  };

  const handlePrintCreditNote = async () => {
    await printMultipleCreditNotes({
      selectedCreditNotes: [creditNote],
      setPrintingCreditNotes: setPrintingCurrentCredit,
    });
  };

  const handleEditCreditNote = () => {
    if (creditNote.status === "cancelled") {
      toast.error("Cancelled credit notes cannot be edited");
      return;
    }
    if (onEdit) {
      onEdit(creditNote);
    }
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

  const handleDeleteCreditNote = async () => {
    setDeleting(true);
    try {
      await deleteCreditNote(creditNote._id);

      if (onDelete) {
        onDelete(creditNote._id);
      }

      setDeleting(false);
      setShowDeleteModal(false);
      onClose();
      toast.success("Credit note deleted successfully");
    } catch (error) {
      console.error("Error deleting credit note:", error);
      setDeleting(false);
      toast.error(error?.response?.data?.message || "Failed to delete credit note");
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
            <button
              onClick={handlePrintCreditNote}
              disabled={printingCurrentCredit}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors font-medium border border-white/30 disabled:opacity-60"
            >
              <Printer className="w-4 h-4" />
              {printingCurrentCredit ? "Preparing..." : "Print"}
            </button>
            {creditNote.status !== 'cancelled' && (
              <button
                onClick={handleEditCreditNote}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Edit Credit
              </button>
            )}
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
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-60"
            >
              Delete
            </button>
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
                  <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">VAT Rate:</span>
                    <span className="text-blue-900 font-semibold">{resolvedVatRate}%</span>
                  </div>
                  {Number.isFinite(Number(creditNote.vatAmount)) && (
                    <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">VAT Amount:</span>
                      <span className="text-blue-900 font-semibold">{formatCurrency(creditNote.vatAmount)}</span>
                    </div>
                  )}
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
          {hasLineItems && (
            <div className="mt-8 bg-white border border-blue-200 rounded-lg p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold flex items-center text-blue-800">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  Credited Items
                </h3>
                {creditNote.status !== 'cancelled' && (
                  <span className="text-xs text-blue-500">
                    Click "Edit Credit" to adjust these rows in the creation modal.
                  </span>
                )}
              </div>
              <div className="overflow-x-auto border border-blue-100 rounded-lg">
                <table className="w-full text-sm text-blue-900">
                  <thead className="bg-blue-50 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-center">Quantity</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {resolvedLineItems.map((item, index) => {
                      const lineTotal = calculateLineTotal(item);
                      return (
                        <tr key={`${item.itemId || index}-${index}`} className="bg-white">
                          <td className="px-4 py-2 capitalize">{item.itemType}</td>
                          <td className="px-4 py-2">
                            <div className="font-medium text-blue-900">{item.name || 'Invoice Item'}</div>
                            {item.description && (
                              <div className="text-xs text-blue-500 mt-0.5">{item.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">{item.creditedQuantity ?? item.quantity ?? 0}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice ?? item.price ?? 0)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4 text-sm text-blue-900">
                <span className="font-medium">Total Credited:</span>
                <span className="font-semibold">
                  {formatCurrency(
                    resolvedLineItems.reduce(
                      (sum, item) => sum + calculateLineTotal(item),
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-red-200 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-100 rounded-lg mr-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Delete Credit Note</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to permanently delete credit note <strong>{creditNote.creditNoteNumber}</strong>?
                </p>
                <p className="text-sm text-red-600 mt-3">
                  Any applied credit will be reversed and the linked invoices will regain their original balances.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Keep Credit Note
                </button>
                <button
                  onClick={handleDeleteCreditNote}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    "Delete Credit Note"
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