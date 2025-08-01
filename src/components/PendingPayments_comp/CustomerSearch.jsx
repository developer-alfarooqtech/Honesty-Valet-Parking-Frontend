import React, { useState, useEffect, useRef } from 'react';
import { Search, User } from 'lucide-react';
import { searchCustomers } from '../../service/pendingPaymentsService';

const CustomerSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onCustomerSelect, 
  debouncedSearchTerm 
}) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch customers based on search term
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
      fetchCustomers(debouncedSearchTerm);
    } else {
      setCustomers([]);
      setShowDropdown(false);
    }
  }, [debouncedSearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCustomers = async (search) => {
    setLoading(true);
    try {
      const response = await searchCustomers(search);
      const data = await response.data;
      
      if (data.success) {
        setCustomers(data.customers);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    setShowDropdown(false);
    setCustomers([]);
  };

  const handleInputFocus = () => {
    if (customers.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Search customers..."
          className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {customers.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              {loading ? 'Searching...' : 'No customers found'}
            </div>
          ) : (
            customers.map((customer) => (
              <button
                key={customer._id}
                onClick={() => handleCustomerSelect(customer)}
                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Code: {customer.Code}
                      {customer.Email && ` • ${customer.Email}`}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;