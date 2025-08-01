// Update the ProductsTable component to include the EditProductModal

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Edit, 
  Trash2, 
  Package2, 
} from 'lucide-react';
import ProductDetailsModal from './ProductDetailsModal';
import EditProductModal from './EditProductModal';

const ProductsTable = ({ products, isLoading, setProducts,loadProducts }) => {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Loading state with skeleton layout
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          {/* Desktop skeleton */}
          <div className="hidden md:block">
            <div className="h-12 bg-gray-100 rounded-lg mb-4"></div>
            {[1, 2, 3].map(n => (
              <div key={n} className="h-16 bg-gray-50 rounded-lg mb-2"></div>
            ))}
          </div>
          
          {/* Mobile skeleton */}
          <div className="md:hidden space-y-4">
            {[1, 2].map(n => (
              <div key={n} className="bg-gray-50 p-5 rounded-xl">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                  <div className="h-6 w-6 bg-gray-100 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="py-16 px-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Package2 size={48} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Your search didn't match any products or your inventory is empty.</p>
        </div>
      </div>
    );
  }

  // Get stock status colors and label
  const getStockStatusColors = (stockLevel) => {
    if (stockLevel > 10) return { bg: 'bg-green-100', text: 'text-green-800', label: 'In Stock' };
    if (stockLevel > 0) return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Low Stock' };
    return { bg: 'bg-red-100', text: 'text-red-800', label: 'Out of Stock' };
  };

  // Function to handle viewing product details
  const handleViewProduct = (productId) => {
    setSelectedProductId(productId);
  };

  // Function to handle editing product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setSelectedProductId(null);
    setEditingProduct(null);
  };

  // Function to handle product updates
  const handleProductUpdate = (updatedProduct) => {
    if (setProducts) {
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === updatedProduct._id ? updatedProduct : p
        )
      );
    }
    setEditingProduct(null)
  };

  return (
    <div>
      {/* Desktop view - enhanced table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-blue-500">
            <tr className="text-white border-b border-gray-200">
              <th className="px-6 py-4 text-left font-semibold">Product Name</th>
              <th className="px-6 py-4 text-left font-semibold">Code</th>
              <th className="px-6 py-4 text-left font-semibold">Stock</th>
              <th className="px-6 py-4 text-left font-semibold">Purchase Price</th>
              <th className="px-6 py-4 text-left font-semibold">Selling Price</th>
              <th className="px-6 py-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const status = getStockStatusColors(product.stock);
              
              return (
                <tr 
                  key={product._id} 
                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{product.name}</span>
                      <span className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{product.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                      {product.stock} · {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{product.purchasePrice}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{product.sellingPrice}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleViewProduct(product._id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        aria-label="View product details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                        aria-label="Edit product"
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Product Details Modal */}
      {selectedProductId && (
        <ProductDetailsModal 
          productId={selectedProductId}
          loadProducts={loadProducts}
          onClose={handleCloseModal} 
        />
      )}

      {/* Product Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={handleCloseModal}
          onUpdate={handleProductUpdate}
        />
      )}
    </div>
  );
};

export default ProductsTable;