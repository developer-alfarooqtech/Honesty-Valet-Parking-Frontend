import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import { searchCustomers } from '../../service/customerService';

const CustomerSearch = ({ onSelect, selectedIds = [], excludeIds = [], label = "Search Customers" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchTerm) {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await searchCustomers(debouncedSearchTerm);
        // Filter out already selected customers and excluded customers
        const filteredResults = response.data.customers.filter(
          customer => !selectedIds.includes(customer._id) && !excludeIds.includes(customer._id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching customers:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [debouncedSearchTerm, selectedIds, excludeIds]);
  
  const handleSelect = (customer) => {
    onSelect(customer);
    setSearchTerm('');
    setShowResults(false);
  };
  
  const handleFocus = () => {
    setShowResults(true);
  };
  
  const handleBlur = () => {
    // Delayed closing to allow for item selection
    setTimeout(() => setShowResults(false), 200);
  };
  
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-blue-700 mb-2">
        {label}
      </label>
      <div className="flex items-center border-2 border-blue-300 rounded-lg overflow-hidden bg-white hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
        <div className="pl-3">
          <Search size={20} className="text-blue-500" />
        </div>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full py-3 px-3 outline-none text-gray-800 placeholder-blue-300"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="pr-3 text-blue-400 hover:text-blue-600 transition-colors duration-200"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* Search results dropdown */}
      {showResults && (searchResults.length > 0 || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-blue-600 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
              Loading...
            </div>
          ) : (
            searchResults.map(customer => (
              <button
                key={customer._id}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-blue-100 last:border-b-0 flex justify-between items-center transition-colors duration-200 group"
                onClick={() => handleSelect(customer)}
              >
                <div>
                  <div className="font-semibold text-gray-800 group-hover:text-blue-700">{customer.name}</div>
                  <div className="text-sm text-blue-500 mt-1">{customer.Code}</div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              </button>
            ))
          )}
          
          {!loading && searchResults.length === 0 && debouncedSearchTerm && (
            <div className="p-4 text-center text-blue-600">
              <Search className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <div>No customers found</div>
              <div className="text-sm text-blue-400 mt-1">Try a different search term</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;