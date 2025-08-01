import React, { useState, useEffect, useRef } from 'react';
import { X, Package } from 'lucide-react';
import ReactDOM from 'react-dom';

const BatchSelectionModal = ({ isOpen, onClose, product, onBatchSelect }) => {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef(null);
  const tableRef = useRef(null);

  // Filter out batches with no stock - moved after hooks
  const availableBatches = product?.purchasePricebatch?.filter(batch => batch.stock > 0) || [];

  // Set initial selected batch when modal opens
  useEffect(() => {
    if (isOpen && availableBatches.length > 0) {
      setSelectedIndex(0);
      setSelectedBatch(availableBatches[0]);
      setQuantity(1);
      
      // Focus the modal for keyboard navigation
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }
  }, [isOpen, availableBatches.length]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (availableBatches.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < availableBatches.length - 1 ? prev + 1 : prev;
          setSelectedBatch(availableBatches[newIndex]);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : 0;
          setSelectedBatch(availableBatches[newIndex]);
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedBatch) {
          handleSelect();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Scroll selected row into view
  useEffect(() => {
    if (tableRef.current && selectedIndex >= 0) {
      const selectedRow = tableRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedRow) {
        selectedRow.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }, [selectedIndex]);

  const handleSelect = () => {
    if (!selectedBatch) {
      return;
    }
    
    onBatchSelect(selectedBatch, quantity);
    onClose();
  };

  const handleBatchClick = (batch, index) => {
    setSelectedBatch(batch);
    setSelectedIndex(index);
  };

  // Early return after all hooks are called
  if (!isOpen || !product) return null;

  return (
    <>
    {typeof document !== 'undefined' && document.body && ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div 
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-6 w-full max-w-md animate-fadeIn focus:outline-none"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md mr-3">
              <Package size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">Select Batch for {product.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-3 flex items-center">
            <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-1 rounded-full mr-2">
              Available: {product.stock}
            </span>
            Select a batch and quantity (Use ↑↓ to navigate, Enter to select)
          </p>
          
          {availableBatches.length === 0 ? (
            <div className="p-4 bg-red-900/30 border border-red-800/30 text-red-300 rounded-md">
              No batches with stock available
            </div>
          ) : (
            <div className="border border-gray-700 rounded-md overflow-hidden">
              <table ref={tableRef} className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Select</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Purchase Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {availableBatches.map((batch, index) => (
                    <tr 
                      key={index} 
                      data-index={index}
                      onClick={() => handleBatchClick(batch, index)}
                      className={`cursor-pointer transition-colors ${
                        selectedIndex === index 
                          ? "bg-blue-500 text-white" 
                          : "hover:bg-gray-700/50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="batch"
                            checked={selectedBatch === batch}
                            onChange={() => handleBatchClick(batch, index)}
                            className="form-radio h-4 w-4 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                          />
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm ${
                        selectedIndex === index ? "text-white" : "text-gray-300"
                      }`}>
                        {batch.purchasePrice?.toFixed(2) || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedIndex === index 
                            ? "bg-white/20 text-white" 
                            : batch.stock > 5 
                              ? "bg-green-900/30 text-green-300" 
                              : "bg-amber-900/30 text-amber-300"
                        }`}>
                          {batch.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedBatch && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              max={selectedBatch.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-100 placeholder-gray-400"
            />
            {selectedBatch.stock < 5 && (
              <p className="mt-2 text-xs text-amber-300">
                Low stock warning: Only {selectedBatch.stock} items available in this batch
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedBatch}
            className={`px-4 py-2 rounded-md transition-colors ${
              !selectedBatch 
                ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            }`}
          >
            Select Batch
          </button>
        </div>
      </div>
    </div>,
        document.body
      )}
    </>
  );
};

export default BatchSelectionModal;