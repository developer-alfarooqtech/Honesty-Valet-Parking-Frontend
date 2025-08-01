import React, { useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp, Search } from "lucide-react";

const Table = ({ 
  data, 
  columns, 
  title,
  titleIcon: TitleIcon,
  onRowClick,
  searchPlaceholder = "Search...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ 
    key: columns[0]?.key || "", 
    direction: "ascending" 
  });
  const [hoveredRow, setHoveredRow] = useState(null);

  if (!data || data.length === 0) {
    return null;
  }

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort the data
  const sortedData = [...data].sort((a, b) => {
    const column = columns.find(col => col.key === sortConfig.key);
    
    if (column?.sortFn) {
      return sortConfig.direction === 'ascending' 
        ? column.sortFn(a, b)
        : column.sortFn(b, a);
    }
    
    const aValue = column?.accessor ? column.accessor(a) : a[sortConfig.key];
    const bValue = column?.accessor ? column.accessor(b) : b[sortConfig.key];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
    }

    const aString = String(aValue || "").toLowerCase();
    const bString = String(bValue || "").toLowerCase();
    
    return sortConfig.direction === 'ascending' 
      ? aString.localeCompare(bString)
      : bString.localeCompare(aString);
  });

  // Filter data based on search term
  const filteredData = sortedData.filter(item => {
    if (!searchTerm) return true;
    
    return columns.some(column => {
      const value = column.accessor ? column.accessor(item) : item[column.key];
      return String(value || "").toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Generate sort indicator
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp className="w-4 h-4 text-blue-500" /> 
      : <ChevronDown className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/90 to-blue-800/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-blue-700/50">
      <div className="flex justify-between items-center mb-6">
        {title && (
          <h3 className="text-xl font-bold flex items-center text-blue-100">
            {TitleIcon && <TitleIcon className="w-6 h-6 text-blue-400 mr-3" />}
            {title}
          </h3>
        )}
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-blue-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-10 pr-4 py-2 bg-blue-800/60 border border-blue-700 rounded-lg text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-blue-700/50">
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`py-3 px-4 text-blue-300 font-semibold ${column.sortable !== false ? 'cursor-pointer' : ''} ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                  onClick={() => column.sortable !== false && requestSort(column.key)}
                >
                  <div className={`flex items-center ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
                    {column.icon && <column.icon className="w-4 h-4 text-blue-400 mr-2" />}
                    <span>{column.header}</span>
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr 
                key={item.id || index} 
                className={`border-b border-blue-700/30 transition-all duration-200 ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${
                  hoveredRow === (item.id || index) ? 'bg-blue-700/30' : index % 2 === 0 ? 'bg-blue-800/30' : 'bg-transparent'
                }`}
                onClick={() => onRowClick && onRowClick(item)}
                onMouseEnter={() => setHoveredRow(item.id || index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {columns.map((column) => (
                  <td 
                    key={`${item.id || index}-${column.key}`} 
                    className={`py-4 px-4 ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {column.cell ? (
                      column.cell(item)
                    ) : (
                      <div className={column.cellClassName || "text-blue-300"}>
                        {column.accessor ? column.accessor(item) : item[column.key]}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-blue-400 text-sm">
        Showing {filteredData.length} of {data.length} items
      </div>
    </div>
  );
};

export default Table;