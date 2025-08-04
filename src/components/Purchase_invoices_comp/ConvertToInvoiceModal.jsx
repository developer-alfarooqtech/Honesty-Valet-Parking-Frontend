import React, { useState } from "react";
import { X, FileText, Package } from "lucide-react";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";

const ConvertToInvoiceModal = ({
  isOpen,
  onClose,
  invoice,
  onConvert,
  loading,
}) => {
  const [invoiceName, setInvoiceName] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // New state for date

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!invoiceName.trim()) {
      toast.error("Invoice name is required");
      return;
    }
    if (!selectedDate) {
      toast.error("Invoice date is required");
      return;
    }
    onConvert(invoice._id, invoiceName.trim(), selectedDate); // Pass date
  };

  const handleClose = () => {
    setInvoiceName("");
    setSelectedDate(""); // Reset date
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 animate-fade-in backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Convert to Invoice
              </h2>
              <p className="text-sm text-gray-600">LPO: {invoice?.lpo}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">
                    What happens when you convert:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Invoice will be created with the name you provide</li>
                    <li>• All products will be added to your inventory</li>
                    <li>• Product stock levels will be updated</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="invoiceName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Invoice Name *
                </label>
                <input
                  type="text"
                  id="invoiceName"
                  value={invoiceName}
                  onChange={(e) => {
                    setInvoiceName(e.target.value);
                  }}
                  placeholder="Enter invoice name (e.g., INV-001)"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 border-gray-300"
                  disabled={loading}
                />
              </div>

              {/* Date Picker */}
              <div className="mb-4">
                <label
                  htmlFor="invoiceDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Invoice Date *
                </label>
                <input
                  type="date"
                  id="invoiceDate"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 border-gray-300"
                  disabled={loading}
              
                />  
              </div>

              {/* Invoice Details Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Invoice Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Supplier:</span>
                    <p className="font-medium">
                      {invoice?.supplier?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-medium text-blue-600">
                      ${invoice?.total?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Products:</span>
                    <p className="font-medium">
                      {invoice?.products?.length || 0} items
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">
                      {invoice?.date
                        ? new Date(invoice.date).toLocaleDateString("en-GB")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !invoiceName.trim() || !selectedDate}
                  className={`flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                    loading || !invoiceName.trim() || !selectedDate
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loading ? "Converting..." : "Convert to Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvertToInvoiceModal;
