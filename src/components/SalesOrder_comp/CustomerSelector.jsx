import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import {  fetchCustomers } from '../../service/salesOrderService';

const CustomerSelector = ({  onCustomerSelect, selectedCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 1) {
      searchCustomers();
    } else {
      setCustomers([]);
      setShowDropdown(false);
    }
    setSelectedIndex(-1); // Reset selected index when search term changes
  }, [searchTerm]);

  // Scroll selected customer into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }, [selectedIndex]);

  const searchCustomers = async () => {
    setLoading(true);
    try {
        const response = await fetchCustomers(searchTerm)
      const data = await response.data;
      setCustomers(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer) => {
    onCustomerSelect(customer);
    setSearchTerm('');
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const clearSelection = () => {
    onCustomerSelect(null);
    setSearchTerm('');
  };

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!showDropdown || customers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < customers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < customers.length) {
          handleSelect(customers[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 1) {
      setShowDropdown(true);
    }
  };

  const handleCustomerClick = (customer, index) => {
    setSelectedIndex(index);
    handleSelect(customer);
  };

  const handleCustomerMouseEnter = (index) => {
    setSelectedIndex(index);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {selectedCustomer ? (
        <div className="flex items-center justify-between p-3 border border-blue-500 rounded-md bg-blue-50">
          <div>
            <div className="font-medium text-gray-800">{selectedCustomer.name}</div>
            <div className="text-sm text-blue-600">
              Code: {selectedCustomer.Code} | Email: {selectedCustomer.Email}
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="text-blue-500 hover:text-blue-700 transition-colors focus:ring-2 focus:ring-blue-500/50 focus:outline-none rounded"
            title="Clear selection (or press Delete)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.key === 'Delete') {
                e.preventDefault();
                clearSelection();
                inputRef.current?.focus();
              }
            }}
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              placeholder="Search Customer by name or code"
              className="w-full pl-10 pr-4 py-2 bg-white border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-800 placeholder-gray-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-blue-500" />
            </div>
          </div>

          {loading && (
            <div className="mt-2 text-sm text-blue-600 flex items-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Searching customers...
            </div>
          )}

          {showDropdown && customers.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-blue-200 rounded-md shadow-xl max-h-60 overflow-auto">
              {customers.map((customer, index) => (
                <div
                  key={customer._id}
                  data-index={index}
                  onClick={() => handleCustomerClick(customer, index)}
                  onMouseEnter={() => handleCustomerMouseEnter(index)}
                  className={`p-3 cursor-pointer border-b border-blue-100 transition-colors ${
                    selectedIndex === index 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-blue-50 text-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`font-medium ${
                        selectedIndex === index ? 'text-white' : 'text-gray-900'
                      }`}>
                        {customer.name}
                      </div>
                      <div className={`text-sm ${
                        selectedIndex === index ? 'text-blue-100' : 'text-blue-600'
                      }`}>
                        {customer.Code}
                      </div>
                    </div>
                    <div className={`text-xs ${
                      selectedIndex === index ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {customer.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showDropdown && !loading && searchTerm.length >= 2 && customers.length === 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-blue-200 rounded-md shadow-xl p-4 text-center text-blue-600">
              <Search size={24} className="mx-auto mb-2 text-blue-400" />
              <p>No customers found</p>
              <span className="text-xs text-gray-500 mt-1">Try a different search term</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerSelector;