import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import DepartmentModal from './DepartmentModal';
import CategoryModal from './CategoryModal';
import DatePicker from 'react-datepicker';

const ExpenseModal = ({ onClose, onSubmit, departments, setDepartments, categories, setCategories, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    category: '',
    date: new Date(),
    amount: '',
  });
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

  const handleAddDepartment = (newDepartment) => { 
    setDepartments([...departments, newDepartment]);
    setFormData({
      ...formData,
      department: newDepartment._id,
    });
    setIsDepartmentModalOpen(false);
  };

  const handleAddCategory = (newCategory) => {
    setCategories([...categories, newCategory]);
    setFormData({
      ...formData,
      category: newCategory._id,
    });
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-fade-in flex items-center justify-center z-50 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Add Expense</h2>
          <button onClick={onClose} className="text-blue-600 hover:text-blue-800 cursor-pointer">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-blue-600 mb-2">Description</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-blue-600 rounded-lg focus:outline-none focus:border-blue-800"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-blue-600">Department</label>
              <button type="button" onClick={() => setIsDepartmentModalOpen(true)} className="text-white bg-blue-600 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700">
                <Plus size={16} /> New Department
              </button>
            </div>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-blue-600 rounded-lg focus:outline-none focus:border-blue-800 max-h-40"
              required
              style={{ maxHeight: '150px', overflowY: 'auto' }}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} (Available: {dept.availableAmount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-blue-600">Category</label>
              <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="text-white bg-blue-600 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700">
                <Plus size={16} /> New Category
              </button>
            </div>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-blue-600 rounded-lg focus:outline-none focus:border-blue-800 max-h-40"
              required
              style={{ maxHeight: '150px', overflowY: 'auto' }}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-blue-600 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={(e)=>setFormData({...formData,date:e.target.value})}
              className="w-full px-4 py-3 border border-blue-600 rounded-lg focus:outline-none focus:border-blue-800"
              required
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
            />
          </div>

          <div>
            <label className="block text-blue-600 mb-2">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-blue-600 rounded-lg focus:outline-none focus:border-blue-800"
              min="0"
              step="0.01"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
            {isSubmitting ? 'Creating...' : 'Add Expense'}
          </button>
        </form>

        {isDepartmentModalOpen && <DepartmentModal onClose={() => setIsDepartmentModalOpen(false)} onSubmit={handleAddDepartment} />}
        {isCategoryModalOpen && <CategoryModal onClose={() => setIsCategoryModalOpen(false)} onSubmit={handleAddCategory} />}
      </div>
    </div>
  );
};

export default ExpenseModal;