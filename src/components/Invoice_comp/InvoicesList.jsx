import { FileText, X, Edit3, Copy } from 'lucide-react';
import React, { useState } from 'react'
import { cancelInvoice as cancelInvoiceAPI } from '../../service/invoicesService'
import toast from 'react-hot-toast';

const InvoicesList = ({invoices, selectedInvoices, handleInvoiceCheckboxChange, handleInvoiceSelect, onInvoiceUpdate, onEditInvoice, onDuplicateInvoice}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const handleCancelClick = (invoice) => {
    setInvoiceToCancel(invoice);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!invoiceToCancel) return;

    setIsLoading(true);
    try {
      const response = await cancelInvoiceAPI(invoiceToCancel._id);
      const data = response.data;

      if (data.success) {
        toast.success("Invoice canceled successfully");
        // Call parent callback to refresh data
        if (onInvoiceUpdate) {
          onInvoiceUpdate();
        }
      } else {
        console.error("Failed to cancel invoice:", data.message);
        toast.error("Failed to cancel invoice: " + data.message);
      }
    } catch (error) {
      console.error("Error canceling invoice:", error);
      toast.error("Error canceling invoice");

      if (error.response && error.response.data) {
        toast.error("Error: " + error.response.data.message);
      }else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
      setShowCancelModal(false);
      setInvoiceToCancel(null);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setInvoiceToCancel(null);
  };

  // Helper function to check if a date is expired
  const isExpired = (dateString) => {
  const expDate = new Date(dateString);
  // Set expDate to end of day (23:59:59)
  expDate.setHours(23, 59, 59, 999);
  const today = new Date();
  return expDate < today;
};

// Calculate days past due
const getDaysPastDue = (dateString) => {
  const expDate = new Date(dateString);
  // Set time to end of day for proper comparison
  expDate.setHours(23, 59, 59, 999);
  const today = new Date();
  // Only count as overdue if we're past the expiry date
  if (expDate >= today) return 0;

  // Get difference in days
  const diffTime = Math.abs(today - expDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

  const getCreatedByLabel = (invoice) => {
    const creator = invoice?.createdBy;
    if (!creator) {
      return "Unknown";
    }

    if (typeof creator === "string") {
      return creator;
    }

    return (
      creator.name ||
      creator.fullName ||
      creator.username ||
      creator.email ||
      creator.displayName ||
      creator._id ||
      "Unknown"
    );
  };

  // Helper function to get selectable invoices  cancelled)
  const getSelectableInvoices = () => {
    return invoices.filter(invoice =>  !invoice.isCancelled);
  };

  // Check if all selectable invoices are selected
  const areAllSelectableSelected = () => {
    const selectableInvoices = getSelectableInvoices();
    if (selectableInvoices.length === 0) return false;
    
    return selectableInvoices.every(invoice => 
      selectedInvoices.some(selected => selected._id === invoice._id)
    );
  };

  // Check if some (but not all) selectable invoices are selected
  const areSomeSelectableSelected = () => {
    const selectableInvoices = getSelectableInvoices();
    if (selectableInvoices.length === 0) return false;
    
    const selectedCount = selectableInvoices.filter(invoice => 
      selectedInvoices.some(selected => selected._id === invoice._id)
    ).length;
    
    return selectedCount > 0 && selectedCount < selectableInvoices.length;
  };

  // Handle select all/deselect all
  const handleSelectAll = () => {
    const selectableInvoices = getSelectableInvoices();
    
    if (areAllSelectableSelected()) {
      // Deselect all - remove all selectable invoices from selection
      selectableInvoices.forEach(invoice => {
        if (selectedInvoices.some(selected => selected._id === invoice._id)) {
          handleInvoiceCheckboxChange(invoice, false);
        }
      });
    } else {
      // Select all - add all selectable invoices to selection
      selectableInvoices.forEach(invoice => {
        if (!selectedInvoices.some(selected => selected._id === invoice._id)) {
          handleInvoiceCheckboxChange(invoice, true);
        }
      });
    }
  };

  return (
    <div className="overflow-x-auto bg-white border border-blue-200 rounded-lg shadow-xl">
      <table className="min-w-full divide-y divide-blue-200">
        <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
          <tr>
            <th className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
              <div className="flex flex-col items-center space-y-1">
                <input
                  type="checkbox"
                  checked={areAllSelectableSelected()}
                  ref={(input) => {
                    if (input) input.indeterminate = areSomeSelectableSelected();
                  }}
                  onChange={handleSelectAll}
                  disabled={getSelectableInvoices().length === 0}
                  className="h-4 w-4 text-blue-500 focus:ring-blue-400 bg-blue-100 border-blue-300 rounded cursor-pointer"
                  title={
                    areAllSelectableSelected() 
                      ? "Deselect all invoices" 
                      : "Select all available invoices"
                  }
                />
                <span className="text-xs">Select</span>
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-blue-200 transition-colors">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Created By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Balance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-blue-100">
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="9" className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
                    <p className="text-gray-500 mt-1">
                      Try adjusting your search criteria or create a new invoice.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => {
              const isCancelled = invoice.isCancelled;
              const isFullyPaid = invoice.isPaymentCleared;
              const canEdit = !isFullyPaid && !isCancelled;
              const editDisabled = isFullyPaid || isCancelled;
              const cancelDisabled = isFullyPaid || isCancelled;

              return (
              <tr key={invoice._id} className="hover:bg-gray-100 transition-colors duration-200">
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.some(inv => inv._id === invoice._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleInvoiceCheckboxChange(invoice, e.target.checked);
                    }}
                    disabled={invoice.isCancelled}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-400 bg-blue-100 border-blue-300 rounded cursor-pointer disabled:cursor-not-allowed"
                    title={selectedInvoices.some(inv => inv._id === invoice._id) ? "Deselect invoice" : "Select invoice"}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{invoice?.customer?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{invoice?.customer?.Code || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{formatDate(invoice?.date)}</p>
                    {/* <p className="text-xs text-gray-500">Created: {formatDate(invoice?.createdAt)}</p> */}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{getCreatedByLabel(invoice)}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    AED {invoice.totalAmount?.toFixed(2) || '0.00'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    AED {invoice.balanceToReceive?.toFixed(2) || '0.00'}
                  </div>
                  <div className={`text-xs mt-1 ${isExpired(invoice.expDate) && !invoice.isPaymentCleared ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                    Due: {formatDate(invoice.expDate)}
                    {isExpired(invoice.expDate) && !invoice.isPaymentCleared && (
                      <span className="block">
                        {getDaysPastDue(invoice.expDate)} days overdue
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      invoice.isCancelled
                        ? "bg-gray-500/20 text-gray-400"
                        : invoice.isPaymentCleared
                        ? "bg-green-500/20 text-green-400"
                        : isExpired(invoice.expDate)
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {invoice.isCancelled
                      ? "Cancelled"
                      : invoice.isPaymentCleared
                      ? "Fully Paid"
                      : isExpired(invoice.expDate)
                        ? "Overdue"
                        : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleInvoiceSelect(invoice._id)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="View Details"
                    >
                      <FileText size={18} />
                    </button>
                    
                    {!isCancelled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!editDisabled) {
                            onEditInvoice(invoice);
                          }
                        }}
                        className={`transition-colors ${
                          editDisabled
                            ? "text-green-300 opacity-60 cursor-not-allowed"
                            : "text-green-400 hover:text-green-300"
                        }`}
                        title={editDisabled ? "Cannot edit fully paid invoice" : "Update Invoice"}
                        disabled={editDisabled}
                      >
                        <Edit3 size={18} />
                      </button>
                    )}

                    {!isCancelled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDuplicateInvoice) {
                            onDuplicateInvoice(invoice);
                          }
                        }}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="Duplicate Invoice"
                      >
                        <Copy size={18} />
                      </button>
                    )}
                    
                    {!isCancelled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!cancelDisabled) {
                            handleCancelClick(invoice);
                          }
                        }}
                        className={`transition-colors ${
                          cancelDisabled
                            ? "text-red-300 opacity-60 cursor-not-allowed"
                            : "text-red-400 hover:text-red-300"
                        }`}
                        title={cancelDisabled ? "Cannot cancel fully paid invoice" : "Cancel Invoice"}
                        disabled={cancelDisabled}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-100">Cancel Invoice</h3>
                <p className="text-sm text-gray-300">
                  Are you sure you want to cancel this invoice?
                </p>
              </div>
            </div>

            {invoiceToCancel && (
              <div className="mb-4 p-3 bg-gray-700 border border-gray-600 rounded-md">
                <p className="text-sm font-medium text-gray-200">
                  Invoice: {invoiceToCancel.name}
                </p>
                <p className="text-sm text-gray-300">
                  Customer: {invoiceToCancel.customer?.name || invoiceToCancel.customer?.Code}
                </p>
                <p className="text-sm text-gray-300">
                  Amount: {invoiceToCancel.totalAmount}
                </p>
              </div>
            )}

            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-md p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-300">
                    <strong>Warning:</strong> This action cannot be undone. The invoice will be marked as canceled and cannot be processed for payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelModalClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Keep Invoice
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Canceling...
                  </div>
                ) : (
                  "Cancel Invoice"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoicesList