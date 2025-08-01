import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddProductModal = ({ isOpen, onClose, onAddProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    stock: '',
    purchasePrice: '',
    sellingPrice: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear the error for this field when it's edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    if (!formData.stock || isNaN(Number(formData.stock))) {
      newErrors.stock = 'Valid stock number is required';
    }
    if (!formData.purchasePrice || isNaN(Number(formData.purchasePrice))) {
      newErrors.purchasePrice = 'Valid purchase price is required';
    }
    if (!formData.sellingPrice || isNaN(Number(formData.sellingPrice))) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const productData = {
        ...formData,
        stock: Number(formData.stock),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        seperateProduct: true
      };
      
      await onAddProduct(productData);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        code: '',
        stock: '',
        purchasePrice: '',
        sellingPrice: '',
      });
    } catch (error) {
      console.error('Error adding product:', error);
      // Handle error - could set a form submission error state here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        {/* Improved overlay - now it will be properly positioned and sized */}
        <div 
          className="fixed inset-0 bg-gray-900/10 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        ></div>
        
        {/* Modal content */}
        <div className="inline-block animate-fade-in align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                
                {/* Code */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Product Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                
                {/* Stock, Purchase Price, Selling Price */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                      Stock
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.stock ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      id="purchasePrice"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.purchasePrice ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.purchasePrice && <p className="mt-1 text-xs text-red-600">{errors.purchasePrice}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
                      Selling Price
                    </label>
                    <input
                      type="number"
                      id="sellingPrice"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.sellingPrice ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.sellingPrice && <p className="mt-1 text-xs text-red-600">{errors.sellingPrice}</p>}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;