import React from "react";
import { Calendar, Tag, Building2 } from "lucide-react";
import DatePicker from "react-datepicker";

const FilterBar = ({ categories, departments, filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const resetFilters = {
      startDate: "",
      endDate: "",
      category: "",
      department: "",
    };
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-blue-500">
          Filter Expenses
        </h2>
        <button
          onClick={handleClearFilters}
          className="text-white text-sm bg-blue-500 p-2 rounded-md cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="flex items-center mb-1">
            <Calendar size={16} className="mr-1 text-blue-500" />
            <label className="text-sm text-blue-600">Start Date</label>
          </div>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 border text-gray-700 border-blue-500 rounded-md"
          />
        </div>

        <div>
          <div className="flex items-center mb-1">
            <Calendar size={16} className="mr-1 text-blue-500" />
            <label className="text-sm text-blue-600">End Date</label>
          </div>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 border text-gray-700 border-blue-500 rounded-md"
     
          />
        </div>

        <div>
          <div className="flex items-center mb-1">
            <Tag size={16} className="mr-1 text-blue-500" />
            <label className="text-sm text-blue-600">Category</label>
          </div>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border text-gray-700 border-blue-500 rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center mb-1">
            <Building2 size={16} className="mr-1 text-blue-500" />
            <label className="text-sm text-blue-600">Department</label>
          </div>
          <select
            name="department"
            value={filters.department}
            onChange={handleChange}
            className="w-full px-3 py-2 border text-gray-700 border-blue-500 rounded-md"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
