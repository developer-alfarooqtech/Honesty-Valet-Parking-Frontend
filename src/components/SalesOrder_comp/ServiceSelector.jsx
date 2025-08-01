import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { fetchServices } from '../../service/salesOrderService';

const ServiceSelector = ({ onServiceSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 1) {
      searchServices();
    } else {
      setServices([]);
      setShowDropdown(false);
    }
  }, [searchTerm]);

  const searchServices = async () => {
    setLoading(true);
    try {
      const response = await fetchServices(searchTerm);
      const data = await response.data;
      setServices(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (service) => {
    onServiceSelect(service);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search services"
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-100 placeholder-gray-400"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-indigo-400" />
        </div>
      </div>

      {loading && (
        <div className="mt-2 text-sm text-gray-300">Loading...</div>
      )}

      {showDropdown && services.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-xl max-h-60 overflow-auto">
          {services.map((service) => (
            <div
              key={service._id}
              onClick={() => handleSelect(service)}
              className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 transition-colors"
            >
              <div className="font-medium text-gray-200">{service.name}</div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Code: {service.code}</span>
                <span className="text-sm font-medium text-gray-200">{service.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && services.length === 0 && !loading && searchTerm.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3 text-gray-500">
          No services found with this search term
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;