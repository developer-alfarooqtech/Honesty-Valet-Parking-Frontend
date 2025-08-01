import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { fetchProducts } from '../../service/salesOrderService';
import BatchSelectionModal from './BatchSelectionModal';

const ProductSelector = ({ onProductSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => { 
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 1) {
      searchProducts();
    } else {
      setProducts([]);
      setShowDropdown(false);
    }
  }, [searchTerm]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts(searchTerm);
      const data = await response.data;
      setProducts(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setBatchModalOpen(true);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleBatchSelect = (batch, quantity) => {
    // Pass the selected product with batch information to the parent component
    onProductSelect({
      ...selectedProduct,
      quantity: quantity,
      selectedBatch: batch,
      purchasePrice: batch.purchasePrice
    });

    setBatchModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products"
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-100 placeholder-gray-400"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-indigo-400" />
        </div>
      </div>

      {loading && (
        <div className="mt-2 text-sm text-indigo-300 flex items-center">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          Searching products...
        </div>
      )}

      {showDropdown && products.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-2xl max-h-60 overflow-auto">
          {products.map((product) => (
            <div
              key={product._id}
              onClick={() => handleSelect(product)}
              className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 transition-colors"
            >
              <div className="font-medium text-gray-200">{product.name}</div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Code: {product.code}</span>
                <span className="text-sm font-medium text-indigo-300">{product.sellingPrice.toFixed(2)} AED</span>
              </div>
              {product.stock <= 5 && (
                <div className="text-xs text-red-400 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                  Low stock: {product.stock} available
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown && products.length === 0 && !loading && searchTerm.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg p-4 text-gray-300 flex flex-col items-center">
          <div className="p-3 bg-gray-700/50 rounded-full mb-2">
            <Search size={24} className="text-gray-400" />
          </div>
          <p>No products found</p>
          <span className="text-xs text-gray-400 mt-1">Try a different search term</span>
        </div>
      )}

      {/* Batch Selection Modal */}
      <BatchSelectionModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        product={selectedProduct}
        onBatchSelect={handleBatchSelect}
      />
    </div>
  );
};

export default ProductSelector;

// 
//