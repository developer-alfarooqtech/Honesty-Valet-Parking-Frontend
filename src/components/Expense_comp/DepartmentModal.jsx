import React, { useState } from "react";
import { X } from "lucide-react";
import { createDepartment } from "../../service/expenseService";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const DepartmentModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: new Date(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await createDepartment(formData);
      onSubmit(response.data);
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-500">
            Add New Department
          </h2>
          <button
            onClick={onClose}
            className="text-blue-500 hover:text-blue-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-500 mb-2">
              Department Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-500 text-gray-600 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-blue-500 mb-2">Initial Amount</label>
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
              name="date"
              selected={formData.date}
              onChange={
                (e) => setFormData({ ...formData, date:e.target.value }) // set the date directly
              }
              className="w-full px-3 py-2 border border-blue-500 text-gray-600 rounded-md"
        
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            {loading ? "Creating..." : "Create Department"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;
