import React from "react";
import { Calendar, Filter, CheckCircle, XCircle } from "lucide-react";

// Toggle Switch Component
const ToggleSwitch = ({ id, checked, onChange, label }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          id={id} 
          className="sr-only" 
          checked={checked}
          onChange={onChange}
        />
        <div 
          onClick={onChange}
          className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}
        >
          <div 
            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ease-in-out ${checked ? 'transform tranblue-x-5' : ''}`}
          ></div>
        </div>
      </div>
      <label onClick={onChange} className="text-sm font-medium text-gray-700 cursor-pointer">
        {label}
      </label>
    </div>
  );
};

const FilterSection = ({ 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate, 
  invoiceCreated, 
  setInvoiceCreated, 
  invoiceNotCreated, 
  setInvoiceNotCreated,
  applyFilters
}) => {
  return (
    <div className="mb-6 bg-white p-6 rounded-xl shadow-md border border-blue-100">
      <div className="flex items-center mb-5">
        <Filter size={20} className="text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-blue-500">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Date Filters */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar size={16} className="text-blue-400" />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10 w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar size={16} className="text-blue-400" />
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10 w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        
        {/* Invoice Status Toggles */}
        <div className="flex flex-col justify-center">
          <label className="block text-sm font-medium text-gray-700 mb-3">Invoice Status</label>
          <div className="flex justify-between items-center">
            <ToggleSwitch
              id="invoiceCreated"
              checked={invoiceCreated}
              onChange={() => setInvoiceCreated(!invoiceCreated)}
              label="Invoice Created"
            />
            <ToggleSwitch
              id="invoiceNotCreated"
              checked={invoiceNotCreated}
              onChange={() => setInvoiceNotCreated(!invoiceNotCreated)}
              label="Invoice Not Created"
            />
          </div>
        </div>
        
        {/* Apply Filters Button */}
        <div className="flex items-end">
          <button
            onClick={applyFilters}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;