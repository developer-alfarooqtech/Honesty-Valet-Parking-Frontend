import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { fetchCustomersBySearch } from '../../service/invoicesService'
import useDebounce from "../../hooks/useDebounce";

const CustomerSearch = ({ onCustomerSelect, selectedCustomer, onClearCustomer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetchCustomersBySearch(debouncedSearchTerm);
        if (response.data.success) {
          setSuggestions(response.data.customers);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching customer suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex flex-col">
      {/* <label htmlFor="customerSearch" className="text-sm font-medium text-blue-700 mb-1">
        Customer
      </label> */}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-blue-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          id="customerSearch"
          placeholder="Search customers..."
          className="pl-10 w-full p-2 bg-white border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-800 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => debouncedSearchTerm.length >= 2 && setShowSuggestions(true)}
        />
      </div>

      {/* Selected customer badge */}
      {selectedCustomer && (
        <div className="mt-2 flex items-center justify-between bg-blue-100 border border-blue-300 p-2 rounded-md">
          <div>
            <span className="font-medium text-blue-800">{selectedCustomer.name}</span>
            <span className="ml-2 text-xs text-blue-600">{selectedCustomer.Code}</span>
          </div>
          <button
            onClick={onClearCustomer}
            className="text-blue-600 hover:text-blue-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionRef}
          className="absolute top-full mt-1 w-full bg-white border border-blue-200 rounded-md shadow-xl z-10 max-h-60 overflow-y-auto"
        >
          {suggestions.map((customer) => (
            <div
              key={customer._id}
              onClick={() => handleCustomerSelect(customer)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-blue-100 last:border-b-0 flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-gray-900">{customer.name}</div>
                <div className="text-sm text-blue-600">{customer.Code}</div>
              </div>
              <div className="text-xs text-blue-500">
                {customer.email}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && isLoading && (
        <div className="absolute top-full mt-1 w-full bg-white border border-blue-200 rounded-md shadow-xl z-10 p-4 text-center text-blue-600">
          Loading suggestions...
        </div>
      )}

      {showSuggestions && !isLoading && debouncedSearchTerm.length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-blue-200 rounded-md shadow-xl z-10 p-4 text-center text-gray-600">
          No customers found
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;