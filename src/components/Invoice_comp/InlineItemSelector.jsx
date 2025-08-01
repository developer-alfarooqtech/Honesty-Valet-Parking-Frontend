import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { Search, Package, Briefcase } from "lucide-react";
import { fetchProducts, fetchServices } from "../../service/salesOrderService";

const InlineItemSelector = ({
  onItemSelect,
  placeholder = "Search items by name or code...",
  value = "",
  onChange,
  isProduct = false,
  itemType = "service", // 'product', 'service', or 'credit'
}) => {
  // All hooks must be called before any conditional returns
  const [searchTerm, setSearchTerm] = useState(value);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper to update dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (showDropdown && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [showDropdown]);

  // Position dropdown absolutely using portal, and update on scroll/resize
  useEffect(() => {
    if (showDropdown) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [showDropdown, updateDropdownPosition]);

  const searchItems = useCallback(async () => {
    if (searchTerm.length < 1) {
      setItems([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isProduct) {
        response = await fetchProducts(searchTerm);
        const data = response.data;
        setItems(Array.isArray(data) ? data : []);
      } else {
        response = await fetchServices(searchTerm);
        const data = response.data;
        setItems(Array.isArray(data) ? data : []);
      }
      
      setShowDropdown(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error(`Error searching ${isProduct ? "products" : "services"}:`, error);
      setItems([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, [isProduct, searchTerm]);

  useEffect(() => {
    // Only search for products and services, not credits
    if (itemType !== 'credit' && searchTerm.length >= 1) {
      searchItems();
    } else {
      setItems([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [searchTerm, isProduct, searchItems, itemType]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e) => {
    if (itemType === 'credit') {
      // Handle credit-specific key events
      if (e.key === 'Enter' && searchTerm.trim()) {
        e.preventDefault();
        onItemSelect({
          _id: `credit-${Date.now()}`,
          title: searchTerm.trim(),
          amount: 0,
          note: '',
          additionalNote: ''
        });
        setSearchTerm('');
      }
      return;
    }

    if (!showDropdown || items.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          handleSelect(items[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (item) => {
    onItemSelect(item);
    setSearchTerm("");
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Now handle the conditional rendering AFTER all hooks are called
  if (itemType === 'credit') {
    return (
      <div className="w-full">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter credit title manually..."
          className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-white text-gray-800 placeholder-gray-400"
        />
        <div className="text-xs text-gray-500 mt-1">
          Type credit title and press Enter to add
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white text-gray-800 placeholder-gray-400"
          data-item-search
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          ) : (
            <Search size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Loading indicator as portal */}
      {loading &&
        ReactDOM.createPortal(
          <div
            style={dropdownStyle}
            ref={dropdownRef}
            className="bg-white border border-blue-200 rounded-md shadow-lg p-3 text-blue-600 text-sm"
          >
            Loading...
          </div>,
          document.body
        )}

      {/* Dropdown as portal */}
      {showDropdown &&
        items.length > 0 &&
        ReactDOM.createPortal(
          <div
            style={dropdownStyle}
            ref={dropdownRef}
            className="bg-white border border-blue-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {items.map((item, index) => (
              <div
                key={item._id}
                onClick={() => handleSelect(item)}
                className={`p-3 cursor-pointer border-b border-blue-100 last:border-b-0 flex items-center space-x-3 ${
                  index === selectedIndex
                    ? "bg-blue-500 text-white"
                    : "hover:bg-blue-50 text-gray-800"
                }`}
              >
                <div className="flex-shrink-0">
                  {isProduct ? (
                    <Package size={16} className={index === selectedIndex ? "text-white" : "text-blue-500"} />
                  ) : (
                    <Briefcase size={16} className={index === selectedIndex ? "text-white" : "text-blue-600"} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs truncate ${
                      index === selectedIndex ? "text-blue-100" : "text-gray-500"
                    }`}>
                      Code: {item.code}
                    </span>
                    <span className={`text-xs font-medium ${
                      index === selectedIndex ? "text-blue-100" : "text-blue-600"
                    }`}>
                      {(isProduct ? item.sellingPrice : item.price).toFixed(2)} AED
                    </span>
                  </div>
                  {isProduct && item.stock <= 5 && (
                    <div className={`text-xs mt-1 ${
                      index === selectedIndex ? "text-blue-200" : "text-red-500"
                    }`}>
                      Low stock: {item.stock} available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>,
          document.body
        )}

      {/* No results as portal */}
      {showDropdown &&
        items.length === 0 &&
        !loading &&
        searchTerm.length >= 1 &&
        ReactDOM.createPortal(
          <div
            style={dropdownStyle}
            ref={dropdownRef}
            className="bg-white border border-blue-200 rounded-md shadow-lg p-3 text-blue-600 text-sm"
          >
            No {isProduct ? "products" : "services"} found
          </div>,
          document.body
        )}
    </div>
  );
};

export default InlineItemSelector;