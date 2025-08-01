import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';

const SupplierSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3.5 transition-all duration-300 shadow-sm hover:shadow-md"
            placeholder="Search suppliers by name, email, phone..."
          />
        </div>
        <button
          onClick={handleSearch}
          className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-8 py-3.5 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-tranblue-y-0.5"
        >
          Search
        </button>
      </div>
    </div>
  );
};
export default SupplierSearch;