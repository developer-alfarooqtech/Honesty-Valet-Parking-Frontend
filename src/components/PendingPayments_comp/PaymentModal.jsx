import React, { useState, useEffect } from "react";
import { X, Calendar, CreditCard, DollarSign } from "lucide-react";
import { fetchAllBanks } from "../../service/bankServices";
import { applyPayment } from "../../service/pendingPaymentsService";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";

const PaymentModal = ({ payments, onClose, onSuccess }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetchAllBanks();
      const data = await response.data;

      if (data) {
        setBankAccounts(data);
        if (data.length > 0) {
          setSelectedBankAccount(data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBankAccount) {
      toast.error("Please select a bank account");
      return;
    }

    if (!paymentDate) {
      toast.error("Please select a payment date");
      return;
    }

    setSubmitting(true);

    try {
      const paymentPayload = payments.map(({ invoice, paymentData }) => ({
        invoiceId: invoice._id,
        discount: paymentData.discount || 0,
        amount: paymentData.amount || 0,
        bankAccount: selectedBankAccount,
        date: paymentDate,
        description: paymentData.description || "", // Add description
      }));

      const response = await applyPayment({ payment: paymentPayload });

      const data = await response.data;

      if (data.success) {
        toast.success(data.message || "Payments processed successfully");
        onSuccess();
      } else {
        toast.error(data.message || "Error processing payments");
      }
    } catch (error) {
      console.error("Error processing payments:", error);
      toast.error("Error processing payments. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md animate-fade-in flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Process Payments
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Bank Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBankAccount}
                      onChange={(e) => setSelectedBankAccount(e.target.value)}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Bank Account</option>
                      {bankAccounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                    <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(date) => setPaymentDate(date)}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                    />
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selected Invoices ({payments.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Balance
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Payment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map(({ invoice, paymentData }) => {
                      const currentDiscount =
                        paymentData.discount !== undefined
                          ? paymentData.discount
                          : invoice.discount || 0;
                      const newFinalAmount =
                        invoice.totalAmount - currentDiscount;
                      const newTotalPaid =
                        (invoice.totalPayedAmount || 0) +
                        (paymentData.amount || 0);
                      const remaining = newFinalAmount - newTotalPaid;

                      return (
                        <tr key={invoice._id}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {invoice.customer?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.customer?.Code}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-medium text-red-600">
                              {(
                                newFinalAmount - (invoice.totalPayedAmount || 0)
                              ).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-medium text-green-600">
                              {currentDiscount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-medium text-blue-600">
                              {(paymentData.amount || 0).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {paymentData.description || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div
                              className={`text-sm font-medium ${
                                remaining <= 0
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {Math.max(0, remaining).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <DollarSign size={16} />
                Process Payments
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
