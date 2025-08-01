// TotalAdjustmentModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Calculator, PlusCircle, MinusCircle, DollarSign, InfoIcon } from "lucide-react";

const TotalAdjustmentModal = ({ calculatedTotal, currentTotal, onAdjustTotal, onClose }) => {
  const [adjustedTotal, setAdjustedTotal] = useState(currentTotal.toFixed(2));
  const [reason, setReason] = useState("");
  const [difference, setDifference] = useState(0);
  const inputRef = useRef(null);
  
  // Calculate difference between calculated and adjusted total
  useEffect(() => {
    const diff = parseFloat(adjustedTotal) - calculatedTotal;
    setDifference(diff);
  }, [adjustedTotal, calculatedTotal]);
  
  // Focus input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isNaN(parseFloat(adjustedTotal))) {
      onAdjustTotal(parseFloat(adjustedTotal));
    }
  };

  const handleQuickAdjust = (amount) => {
    const newTotal = (parseFloat(adjustedTotal) + amount).toFixed(2);
    setAdjustedTotal(newTotal);
  };

  return (
    <div className="fixed animate-fade-in inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Calculator className="w-6 h-6 text-blue-500 mr-2" />
          Adjust Invoice Total
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2 flex items-start">
              <InfoIcon className="w-4 h-4 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
              <span>
                System calculated total is <strong>{calculatedTotal.toFixed(2)}</strong>. 
                You can adjust this amount if needed for discounts, additional fees, or corrections.
              </span>
            </div>
            
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjusted Total
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                min="0"
                value={adjustedTotal}
                onChange={(e) => setAdjustedTotal(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <button
                type="button"
                onClick={() => handleQuickAdjust(-10)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 text-gray-700"
              >
                <MinusCircle className="h-4 w-4 mr-1" />
                -10
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(-5)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 -ml-px"
              >
                <MinusCircle className="h-4 w-4 mr-1" />
                -5
              </button>
              <button
                type="button"
                onClick={() => setAdjustedTotal(calculatedTotal.toFixed(2))}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 -ml-px"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(5)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 -ml-px"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                +5
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(10)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-700 -ml-px"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                +10
              </button>
            </div>
            
            <div className={`mt-3 py-2 px-3 rounded-md ${
              difference > 0 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : difference < 0 
                  ? "bg-blue-50 text-blue-800 border border-blue-200" 
                  : "bg-gray-50 text-gray-600 border border-gray-200"
            }`}>
              <p className="text-sm font-medium">
                {difference > 0
                  ? `Adding ${difference.toFixed(2)} to calculated total`
                  : difference < 0
                    ? `Reducing calculated total by ${Math.abs(difference).toFixed(2)}`
                    : "No change from calculated total"}
              </p>
            </div>
          </div>
          
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 shadow-sm"
            >
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TotalAdjustmentModal;