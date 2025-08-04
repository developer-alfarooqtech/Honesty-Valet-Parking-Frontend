import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { fetchInvoicesForCreditNote } from '../../service/creditNoteService';
import useDebounce from "../../hooks/useDebounce";

const InvoiceSearch = ({ onInvoiceSelect, selectedInvoice, onClearInvoice, customerId = "" }) => {
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
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetchInvoicesForCreditNote(debouncedSearchTerm, customerId);
        
        // Updated to match the actual API response structure
        if (response.data.success && response.data.invoices) {
          setSuggestions(response.data.invoices || []);
          setShowSuggestions(true);
        } else {
          console.warn('Invoice search failed or no invoices found');
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error fetching invoice suggestions:", error);
        console.error("Error details:", error.response?.data || error.message);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm, customerId]);

  const handleInvoiceSelect = (invoice) => {
    onInvoiceSelect(invoice);
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Invoice <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-blue-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search invoices by name or customer..."
          className="pl-10 w-full p-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-800 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => debouncedSearchTerm.length >= 2 && setShowSuggestions(true)}
        />
      </div>

      {/* Selected invoice badge */}
      {selectedInvoice && (
        <div className="mt-2 flex items-center justify-between bg-blue-100 border border-blue-300 p-3 rounded-lg">
          <div>
            <div className="font-medium text-blue-800">{selectedInvoice.name}</div>
            <div className="text-sm text-blue-600">
              Customer: {selectedInvoice.customer?.name || 'N/A'} | 
              Amount: AED {selectedInvoice.totalAmount?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-blue-500">
              Date: {new Date(selectedInvoice.date).toLocaleDateString('en-GB')}
            </div>
          </div>
          <button
            onClick={onClearInvoice}
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
          className="absolute top-full mt-1 w-full bg-white border border-blue-200 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto"
        >
          {suggestions.map((invoice) => (
            <div
              key={invoice._id}
              onClick={() => handleInvoiceSelect(invoice)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-blue-100 last:border-b-0 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{invoice.name}</div>
                <div className="text-sm text-blue-600">
                  Customer: {invoice.customer?.name || 'N/A'} | 
                  Amount: AED {invoice.totalAmount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-gray-500">
                  Date: {new Date(invoice.date).toLocaleDateString('en-GB')} | 
                  Balance: AED {invoice.balanceToReceive?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="text-xs text-blue-500">
                {invoice.isPaymentCleared ? 'Paid' : 'Pending'}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && isLoading && (
        <div className="absolute top-full mt-1 w-full bg-white border border-blue-200 rounded-lg shadow-xl z-10 p-4 text-center text-blue-600">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            Loading invoices...
          </div>
        </div>
      )}

      {showSuggestions && !isLoading && debouncedSearchTerm.length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-blue-200 rounded-lg shadow-xl z-10 p-4 text-center text-gray-600">
          <div className="flex flex-col items-center">
            <Search className="w-8 h-8 text-gray-300 mb-2" />
            <div>No invoices found</div>
            <div className="text-sm text-gray-400 mt-1">Try a different search term</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceSearch;