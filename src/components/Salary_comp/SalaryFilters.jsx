// components/SalaryFilters.jsx
import { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import RecipientSearch from "./RecipientSearch";
import DatePicker from "react-datepicker";

const SalaryFilters = ({ filters, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      startDate: "",
      endDate: "",
      type: "",
      recipient: null,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== null && value !== "" && value !== undefined
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300">
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFiltersChange({...filters, startDate:e.target.value})}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
              End Date
            </label>
            <input  
              type="date"
              value={filters.endDate}
              onChange={(e) => onFiltersChange({...filters, endDate:e.target.value})}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
              Type
            </label>
            <select
              value={filters.type || ""}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="operational">Operational</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
              Recipient
            </label>
            <RecipientSearch
              selectedRecipient={filters.recipient}
              onRecipientSelect={(recipient) =>
                handleFilterChange("recipient", recipient)
              }
              onAddNew={() => {}}
              placeholder="Filter by recipient"
              showAddButton={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryFilters;
