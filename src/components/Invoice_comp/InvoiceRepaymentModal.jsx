import React, { useState, useEffect } from "react";
import { X, Calendar, CreditCard } from "lucide-react";

const InvoiceRepaymentModal = ({
  isOpen,
  onClose,
  selectedInvoices,
  banks,
  onSubmit,
  onRepayment,
  isFullPayment = false,
  loading
}) => {
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBank, setSelectedBank] = useState("");
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Initialize payment amounts for partial payments
    if (!isFullPayment && selectedInvoices.length > 0) {
      const initialAmounts = {};
      selectedInvoices.forEach((invoice) => {
        initialAmounts[invoice._id] = "";
      });
      setPaymentAmounts(initialAmounts);
    }
  }, [selectedInvoices, isFullPayment]);

  const handleAmountChange = (invoiceId, value) => {
    setPaymentAmounts({
      ...paymentAmounts,
      [invoiceId]: value,
    });

    // Clear error for this invoice if exists
    if (errors[invoiceId]) {
      const newErrors = { ...errors };
      delete newErrors[invoiceId];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!selectedBank) {
      newErrors.bank = "Please select a bank";
      isValid = false;
    }

    if (!paymentDate) {
      newErrors.date = "Please select a date";
      isValid = false;
    }

    // Validate amounts for partial payments
    if (!isFullPayment) {
      selectedInvoices.forEach((invoice) => {
        const amount = paymentAmounts[invoice._id];
        if (!amount || amount === "") {
          newErrors[invoice._id] = "Amount is required";
          isValid = false;
        } else if (isNaN(amount) || parseFloat(amount) <= 0) {
          newErrors[invoice._id] = "Amount must be a positive number";
          isValid = false;
        } else if (parseFloat(amount) > invoice.balanceToReceive) {
          newErrors[invoice._id] = "Amount cannot exceed balance to receive";
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const paymentData = {
        paymentDate,
        bankId: selectedBank,
        paymentAmounts: isFullPayment ? null : paymentAmounts,
      };
      
      // Use onSubmit if provided, otherwise fall back to onRepayment for compatibility
      const submitFunction = onSubmit || onRepayment;
      if (submitFunction) {
        submitFunction(paymentData);
      } else {
        console.error("No submit function provided to InvoiceRepaymentModal");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-blue-200 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-500/30 rounded-t-xl">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-3">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isFullPayment ? "Complete Payment" : "Partial Payment"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Info Note */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> The selected payment
              date and bank account will be applied to all invoices in this
              batch.
            </p>
          </div>

          {/* Payment Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="pl-10 w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Bank Account */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Account
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="pl-10 w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              >
                <option value="">Select Bank Account</option>
                {banks && banks.map((bank) => (
                  <option key={bank._id} value={bank._id}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.bank && (
              <p className="mt-1 text-xs text-red-500">{errors.bank}</p>
            )}
          </div>

          {isFullPayment ? (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                Selected Invoices
              </h3>
              <div className="bg-white border border-blue-200 p-4 rounded-lg max-h-64 overflow-y-auto shadow-lg">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="px-2 py-2 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {selectedInvoices && selectedInvoices.map((invoice) => (
                      <tr
                        key={invoice._id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-2 py-2 whitespace-nowrap text-gray-800">
                          {invoice.name}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-right text-gray-800">
                          {invoice.balanceToReceive}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-blue-300">
                      <td className="px-2 py-3 font-bold text-gray-800">Total</td>
                      <td className="px-2 py-3 text-right font-bold text-blue-600">
                        {selectedInvoices && selectedInvoices
                          .reduce(
                            (total, invoice) =>
                              total + invoice.balanceToReceive,
                            0
                          )
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                Payment Amounts
              </h3>
              <div className="bg-white border border-blue-200 p-4 rounded-lg max-h-64 overflow-y-auto space-y-4 shadow-lg">
                {selectedInvoices && selectedInvoices.map((invoice) => (
                  <div
                    key={invoice._id}
                    className="bg-blue-50 border border-blue-200 p-3 rounded-lg"
                  >
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-800">
                        {invoice.name}
                      </label>
                      <span className="text-xs text-gray-600">
                        Balance: {invoice.balanceToReceive}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={invoice.balanceToReceive}
                      value={paymentAmounts[invoice._id] || ""}
                      onChange={(e) =>
                        handleAmountChange(invoice._id, e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-400"
                      placeholder="Enter amount"
                    />
                    {errors[invoice._id] && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[invoice._id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-blue-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Please Wait...
                </div>
              ) : isFullPayment ? (
                "Complete Full Payment"
              ) : (
                "Make Partial Payment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceRepaymentModal;
