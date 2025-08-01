import React, { useState } from 'react';

import { X } from 'lucide-react';
import { addCategory } from '../../service/expenseService';
import toast from 'react-hot-toast';

const CategoryModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [loading,setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const response = await addCategory( name);
      onSubmit(response.data);
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message)
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-500">Add New Category</h2>
          <button onClick={onClose} className="text-blue-500 hover:text-blue-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-500 mb-2">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-blue-500 text-gray-600 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            {loading?"Creating...":"Create Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;