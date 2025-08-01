import React, { useEffect, useState } from "react";
import { X, Calendar, DollarSign } from "lucide-react";
import { addRepayment } from "../../service/productService";
import toast from "react-hot-toast";
import { fetchBanks } from "../../service/bankService";
import DatePicker from "react-datepicker";

const PaymentModal = ({ invoice, onClose, onPaymentComplete }) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    amount: 0,
    bankAccount: "",
  });
  const [banks, setBanks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const res = await fetchBanks();
        setBanks(res.data || []);
      } catch (err) {
        console.error("Error fetching banks:", err);
        toast.error("Failed to load bank accounts. Please try again.");
      }
    };
    loadBanks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.date) {
      setError("Please select a date");
      return;
    }

    if (formData.amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (formData.amount > invoice.balanceToPay) {
      setError(`Amount cannot exceed the balance (${invoice.balanceToPay})`);
      return;
    }

    if (!formData.bankAccount) {
      setError("Please select a bank account");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await addRepayment(
        formData.date,
        formData.amount,
        invoice._id,
        formData.bankAccount
      );
      setIsSubmitting(false);
      onPaymentComplete && onPaymentComplete(res.data?.data);
      onClose();
    } catch (error) {
      setIsSubmitting(false);
      setError("Failed to process payment. Please try again.");
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative my-2 sm:my-0">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-t-xl flex justify-between items-center z-10">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 mr-3" />
            <h2 className="text-base sm:text-xl font-bold">Make Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4 bg-blue-50 p-3 rounded-lg">
            <p className="text-gray-700">
              <span className="font-medium">Invoice:</span> #{invoice?.name}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Balance to Pay:</span>{" "}
              {invoice?.balanceToPay}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date:e.target.value })}
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  max={invoice?.balanceToPay}
                  min="0.01"
                  step="0.01"
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="bankAccount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Bank
                </label>
                <select
                  name="bankAccount"
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a Bank</option>
                  {banks.map((bank) => (
                    <option key={bank._id} value={bank._id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Make Payment"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
