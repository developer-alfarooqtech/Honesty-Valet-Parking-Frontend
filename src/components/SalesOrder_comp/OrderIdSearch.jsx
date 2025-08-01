import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { searchExistSalesOrder } from '../../service/salesOrderService';

const OrderIdSearch = ({ value, onChange, onOrderIdExist }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Add click outside handler to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchOrderIds = async () => {
      if (!value || value.length < 1) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchExistSalesOrder(value);
        setSearchResults(response.data || []);
        setIsDropdownOpen(response.data && response.data.length > 0);
      } catch (error) {
        console.error('Error searching order IDs:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search request
    const timeoutId = setTimeout(() => {
      searchOrderIds();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleSelectResult = (orderId) => {
    onChange(orderId);
    setIsDropdownOpen(false);
    // Notify parent component that this order ID already exists
    onOrderIdExist();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && setIsDropdownOpen(true)}
          className="w-full px-3 py-2 border border-blue-500 rounded-md pr-10"
          placeholder="Enter Order ID"
        />
        <Search size={18} className="absolute right-3 top-1/2 transform -tranblue-y-1/2 text-gray-400" />
      </div>
      
      {isDropdownOpen && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-blue-500 rounded-md shadow-lg max-h-60 overflow-auto">
          {searchResults.map((orderId, index) => (
            <div
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
              onClick={() => handleSelectResult(orderId)}
            >
              {orderId}
            </div>
          ))}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -tranblue-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default OrderIdSearch;