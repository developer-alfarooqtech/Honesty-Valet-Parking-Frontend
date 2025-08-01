import React, { useState } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';

const PaymentModal = ({ onClose, onSubmit, departments, loading }) => {
  const [formData, setFormData] = useState({
    departmentId: '',
    amount: '',
    date: new Date(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-500">Add Payment to Department</h2>
          <button onClick={onClose} className="text-blue-500 hover:text-blue-600 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-500 mb-2">Department</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-500 text-gray-600 rounded-md"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-blue-500 mb-2">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-500 text-gray-600 rounded-md"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-blue-500 mb-2">Payment Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={(e)=>setFormData({...formData,date:e.target.value})}
              className="w-full px-3 py-2 border border-blue-500 text-gray-600 rounded-md"
              required
              placeholderText="dd/mm/yyyy"
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            {loading?"Adding...":"Add Payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;