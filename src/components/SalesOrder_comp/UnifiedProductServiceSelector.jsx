import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Briefcase, Plus, X, Trash2 } from 'lucide-react';
import { fetchProducts, fetchServices } from '../../service/salesOrderService';
import BatchSelectionModal from './BatchSelectionModal';

const UnifiedProductServiceSelector = ({ 
  onProductSelect, 
  onServiceSelect, 
  selectedProducts = [], 
  selectedServices = [],
  setSelectedProducts,
  setSelectedServices
}) => {
  // Search and data states
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Toggle state for product/service selection
  const [activeTab, setActiveTab] = useState('services'); // 'products' or 'services' - default to services
  
  // Keyboard navigation states
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Batch selection for products
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Order tracking for chronological display
  const [itemOrder, setItemOrder] = useState([]);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch data when search term changes
  useEffect(() => {
    if (searchTerm.length >= 1) {
      searchItems();
      setShowSuggestions(true);
    } else {
      setProducts([]);
      setServices([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1); // Reset selected index when search term changes
  }, [searchTerm, activeTab]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchItems = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const response = await fetchProducts(searchTerm);
        setProducts(response.data || []);
        setServices([]);
      } else {
        const response = await fetchServices(searchTerm);
        setServices(response.data || []);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setBatchModalOpen(true);
    setShowSuggestions(false);
    setSearchTerm('');
    setSelectedIndex(-1);
  };

  const handleServiceSelect = (service) => {
    onServiceSelect(service);
    setShowSuggestions(false);
    setSearchTerm('');
    setSelectedIndex(-1);
  };

  const handleBatchSelect = (batch, quantity) => {
    onProductSelect({
      ...selectedProduct,
      quantity: quantity,
      selectedBatch: batch,
      purchasePrice: batch.purchasePrice || 0
    });
    setBatchModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    if (searchTerm.length >= 1) {
      setShowSuggestions(true);
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const currentItems = activeTab === 'products' ? products : services;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < currentItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < currentItems.length) {
          const selectedItem = currentItems[selectedIndex];
          if (activeTab === 'products') {
            handleProductSelect(selectedItem);
          } else {
            handleServiceSelect(selectedItem);
          }
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }, [selectedIndex]);

  const handleProductQuantityChange = (productId, quantity) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p._id === productId ? { ...p, quantity: parseInt(quantity) || 0 } : p
      )
    );
  };

  const handleProductPriceChange = (productId, price) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p._id === productId ? { ...p, sellingPrice: parseFloat(price) || 0 } : p
      )
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
  };

  const handleServiceQuantityChange = (serviceId, quantity) => {
    setSelectedServices(
      selectedServices.map((s) => {
        if (s.uniqueId) {
          return s.uniqueId === serviceId ? { ...s, quantity: parseInt(quantity) || 0 } : s;
        }
        return s._id === serviceId ? { ...s, quantity: parseInt(quantity) || 0 } : s;
      })
    );
  };

  const handleServicePriceChange = (serviceId, value) => {
    setSelectedServices(
      selectedServices.map((s) => {
        if (s.uniqueId) {
          return s.uniqueId === serviceId ? { ...s, price: parseFloat(value) || 0 } : s;
        }
        return s._id === serviceId ? { ...s, price: parseFloat(value) || 0 } : s;
      })
    );
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter((s) => {
      if (s.uniqueId) {
        return s.uniqueId !== serviceId;
      }
      return s._id !== serviceId;
    }));
  };

  const handleProductNoteChange = (productId, note) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p._id === productId ? { ...p, note } : p
      )
    );
  };

  const handleServiceNoteChange = (serviceId, note) => {
    setSelectedServices(
      selectedServices.map((s) => {
        if (s.uniqueId) {
          return s.uniqueId === serviceId ? { ...s, note } : s;
        }
        return s._id === serviceId ? { ...s, note } : s;
      })
    );
  };

  // Get current suggestions based on active tab
  const currentSuggestions = activeTab === 'products' ? products : services;

  // Create chronologically ordered items list
  const selectedItems = [];
  
  // Add products with their timestamps or indices
  selectedProducts.forEach((product, index) => {
    selectedItems.push({
      ...product,
      type: 'product',
      orderIndex: `product-${product._id}`,
      addedAt: product.addedAt || Date.now() - (selectedProducts.length - index) * 1000, // Fallback for existing items
    });
  });
  
  // Add services with their timestamps or indices
  selectedServices.forEach((service, index) => {
    selectedItems.push({
      ...service,
      type: 'service',
      orderIndex: service.uniqueId ? `service-${service.uniqueId}` : `service-${service._id}`,
      addedAt: service.addedAt || Date.now() - (selectedServices.length - index) * 1000, // Fallback for existing items
    });
  });
  
  // Sort by addedAt timestamp (newest first)
  selectedItems.sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div className="space-y-4">
      {/* Tab Toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-600 bg-gray-700">
        <button
          onClick={() => {
            setActiveTab('services');
            setSearchTerm('');
            setShowSuggestions(false);
            setSelectedIndex(-1);
          }}
          className={`flex-1 py-3 px-4 font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'services'
              ? 'bg-purple-600 text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Briefcase size={18} />
          <span>Services</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('products');
            setSearchTerm('');
            setShowSuggestions(false);
            setSelectedIndex(-1);
          }}
          className={`flex-1 py-3 px-4 font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Package size={18} />
          <span>Products</span>
        </button>
      </div>

      {/* Main Table with Search in Item Column */}
      <div className="bg-gray-700 border border-gray-600 rounded-lg overflow-visible">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <h4 className="text-lg font-semibold">Add Items to Invoice</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {/* Search Row */}
              <tr className="bg-gray-600">
                <td className="px-4 py-3 relative">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={handleSearchFocus}
                      onKeyDown={handleKeyDown}
                      placeholder={`Search ${activeTab} by name...`}
                      className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-100 placeholder-gray-400 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      {activeTab === 'products' ? (
                        <Package size={16} className="text-indigo-400" />
                      ) : (
                        <Briefcase size={16} className="text-purple-400" />
                      )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                      <div 
                        ref={suggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto"
                        style={{
                          minHeight: currentSuggestions.length > 0 ? 'auto' : '60px',
                          maxHeight: '320px'
                        }}
                      >
                        {loading && (
                          <div className="px-4 py-3 text-center text-indigo-300">
                            <div className="flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                              Searching {activeTab}...
                            </div>
                          </div>
                        )}

                        {!loading && currentSuggestions.length > 0 && (
                          <div className="py-2">
                            {currentSuggestions.map((item, index) => (
                              <button
                                key={item._id}
                                data-index={index}
                                onClick={() => activeTab === 'products' ? handleProductSelect(item) : handleServiceSelect(item)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`w-full px-4 py-2 text-left transition-colors flex items-center justify-between ${
                                  selectedIndex === index 
                                    ? activeTab === 'products' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
                                    : 'hover:bg-gray-600'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="mr-3">
                                    {activeTab === 'products' ? (
                                      <Package size={16} className={selectedIndex === index ? "text-white" : "text-indigo-400"} />
                                    ) : (
                                      <Briefcase size={16} className={selectedIndex === index ? "text-white" : "text-purple-400"} />
                                    )}
                                  </div>
                                  <div>
                                    <div className={`text-sm font-medium ${selectedIndex === index ? 'text-white' : 'text-gray-200'}`}>
                                      {item.name}
                                    </div>
                                    <div className={`text-xs ${selectedIndex === index ? 'text-gray-200' : 'text-gray-400'}`}>
                                      {item.code} • {activeTab === 'products' ? item.sellingPrice?.toFixed(2) : item.price?.toFixed(2)} AED
                                    </div>
                                  </div>
                                </div>
                                <Plus size={16} className={selectedIndex === index ? "text-white" : activeTab === 'products' ? "text-indigo-400" : "text-purple-400"} />
                              </button>
                            ))}
                          </div>
                        )}

                        {!loading && currentSuggestions.length === 0 && searchTerm.length >= 1 && (
                          <div className="px-4 py-3 text-center text-gray-400">
                            <div className="flex flex-col items-center">
                              {activeTab === 'products' ? <Package size={16} className="mb-2" /> : <Briefcase size={16} className="mb-2" />}
                              <p className="text-xs">No {activeTab} found</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs text-gray-400">-</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-gray-400">-</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-gray-400">-</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs text-gray-400">-</span>
                </td>
              </tr>

              {/* Selected Items */}
              {selectedItems.map((item) => (
                <tr key={item.orderIndex} className="hover:bg-gray-600/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {item.type === 'product' ? (
                          <Package size={16} className="text-indigo-400" />
                        ) : (
                          <Briefcase size={16} className="text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) => 
                            item.type === 'product' 
                              ? handleProductNoteChange(item._id, e.target.value)
                              : handleServiceNoteChange(item.uniqueId || item._id, e.target.value)
                          }
                          placeholder={`${item.name} - Enter note...`}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                        />
                        <div className="text-xs text-gray-400 mt-1">{item.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => 
                        item.type === 'product' 
                          ? handleProductQuantityChange(item._id, e.target.value)
                          : handleServiceQuantityChange(item.uniqueId || item._id, e.target.value)
                      }
                      className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-gray-100 text-sm text-center"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={item.type === 'product' ? item.sellingPrice : item.price}
                      onChange={(e) => 
                        item.type === 'product' 
                          ? handleProductPriceChange(item._id, e.target.value)
                          : handleServicePriceChange(item.uniqueId || item._id, e.target.value)
                      }
                      className="w-20 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-gray-100 text-sm text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    <span className={item.type === 'product' ? 'text-indigo-300' : 'text-purple-300'}>
                      AED {(
                        (item.type === 'product' ? item.sellingPrice : item.price) * item.quantity
                      ).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => 
                        item.type === 'product' 
                          ? handleRemoveProduct(item._id)
                          : handleRemoveService(item.uniqueId || item._id)
                      }
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty state when no items */}
              {selectedItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      {activeTab === 'products' ? (
                        <Package size={24} className="mb-2 text-gray-500" />
                      ) : (
                        <Briefcase size={24} className="mb-2 text-gray-500" />
                      )}
                      <p className="text-sm">No items added yet</p>
                      <p className="text-xs">Search for {activeTab} in the item field above</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Selection Modal for Products */}
      <BatchSelectionModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        product={selectedProduct}
        onBatchSelect={handleBatchSelect}
      />
    </div>
  );
};

export default UnifiedProductServiceSelector;