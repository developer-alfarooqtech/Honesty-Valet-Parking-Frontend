import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// SortButton Component
const SortButton = ({ field, currentSort, onSort, children }) => {
  const getSortIcon = () => {
    if (currentSort.field !== field) {
      return <ChevronsUpDown size={14} className="text-white/70" />;
    }
    return currentSort.direction === 'asc' ? 
      <ChevronUp size={14} className="text-white" /> : 
      <ChevronDown size={14} className="text-white" />;
  };

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-white/80 transition-colors"
    >
      {children}
      {getSortIcon()}
    </button>
  );
};

// Updated Table Headers (replace your existing table headers)
const TableHeaders = ({ sort, onSort, selectAll, onSelectAll }) => {
  return (
    <thead className="bg-blue-500">
      <tr>
        <th className="px-4 py-3 text-left">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
          <SortButton field="name" currentSort={sort} onSort={onSort}>
            Invoice
          </SortButton>
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
          Customer
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
          <SortButton field="createdAt" currentSort={sort} onSort={onSort}>
            Date
          </SortButton>
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
          <SortButton field="expDate" currentSort={sort} onSort={onSort}>
            Due Date
          </SortButton>
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
          Total Amount
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
          Balance to Pay
        </th>

        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
          Discount
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
          Payment Amount
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
          Description
        </th>
      </tr>
    </thead>
  );
};

export { SortButton, TableHeaders };