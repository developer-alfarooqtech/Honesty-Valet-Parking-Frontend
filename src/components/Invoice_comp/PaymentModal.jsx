import React, { useState } from 'react';
import { X } from 'lucide-react';

const PaymentModal = ({ invoice, onClose, onPaymentComplete,banks }) => {
  const [formData, setFormData] = useState({
    bankAccountId: '',
    amount: invoice?.balanceToReceive || '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Pass invoice ID along with payment data
    const paymentData = {
      ...formData,
      invoiceId: invoice?._id,
    };
    
    // Assuming onPaymentComplete handles the API call and updates
    onPaymentComplete(paymentData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-blue-200 rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Record Payment</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Bank Account</label>
            <select
              name="bankAccountId"
              value={formData.bankAccountId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              required
            >
              <option value="">Select Bank Account</option>
              {banks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Payment Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Reference / Note</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Optional reference or note"
              className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-md transition-all duration-300 font-semibold"
          >
            {loading ? "Processing..." : "Record Payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;