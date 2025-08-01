import React, { useState, useEffect } from 'react';
import { X, PlusCircle, AlertTriangle } from 'lucide-react';
import { addStock } from '../../service/productService';
import toast from 'react-hot-toast';

const EditProductModal = ({ product, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    code: product?.code || '',
    stock: 0,
    purchasePrice: '',
    sellingPrice: product?.sellingPrice || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        code: product.code,
        stock: 0, // Set to 0 as we're adding stock
        purchasePrice: '',
        sellingPrice: product.sellingPrice,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'purchasePrice' || name === 'sellingPrice' 
        ? value === '' ? '' : Number(value) 
        : value
    }));
  };

  const validateForm = () => {
    if (!formData.stock || formData.stock <= 0) {
      setError('Stock must be greater than 0');
      return false;
    }
    
    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      setError('Purchase price must be greater than 0');
      return false;
    }
    
    if (!formData.sellingPrice || formData.sellingPrice <= 0) {
      setError('Selling price must be greater than 0');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const response =await  addStock({stock: formData.stock, purchasePrice: formData.purchasePrice, sellingPrice: formData.sellingPrice, productId:product._id})
      const data = await response.data?.data
      toast.success('Product stock updated successfully');
      
      // Reset stock and purchasePrice fields after successful update
      setFormData(prev => ({
        ...prev,
        stock: 0,
        purchasePrice: '',
      }));
      
      // Call the onUpdate callback to refresh product data
      if (onUpdate) {
        onUpdate(data);
      }
    } catch (err) {
      console.error(err.message || 'An error occurred');
      toast.error(err.response?.data?.message)
    } finally {
      setLoading(false);
    }
  };

  // Calculate new total stock after addition
  const newTotalStock = (product?.stock || 0) + (formData.stock || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 animate-fade-in backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-blue-500 text-white">
          <h2 className="text-xl font-semibold">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Product Info (Read Only) */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Product Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Name</label>
                  <p className="font-medium text-gray-800">{product?.name}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Code</label>
                  <p className="font-mono text-gray-800">{product?.code}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600">Description</label>
                  <p className="text-gray-800 text-sm">{product?.description}</p>
                </div>
              </div>
            </div>
            
            {/* Current Stock Info */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-blue-700 mb-2">Current Stock Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-blue-600">Current Stock</label>
                  <p className="font-medium text-blue-800">{product?.stock} units</p>
                </div>
                <div>
                  <label className="block text-sm text-blue-600">Current Selling Price</label>
                  <p className="font-medium text-blue-800">{product?.sellingPrice}</p>
                </div>
              </div>
            </div>
            
            {/* Add Stock Section */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                <PlusCircle size={18} className="mr-2 text-green-600" />
                Add New Stock
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Add
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    New total will be: {newTotalStock} units
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start">
                <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md">
                {success}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;