import React from 'react';
import { X } from 'lucide-react';

const SelectedCustomersList = ({ customers, onRemove }) => {
  if (!customers || customers.length === 0) {
    return null;
  }
  return (
    <div className="mt-2">
      <ul className="bg-blue-50 border border-blue-200 rounded-lg divide-y divide-blue-200">
        {customers.map(customer => (
          <li 
            key={customer._id} 
            className="flex items-center justify-between px-4 py-3 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <span className="font-medium text-gray-800">{customer.name}</span>
              <span className="ml-2 text-sm text-gray-500">{customer.Code}</span>
            </div>
            <button 
              onClick={() => onRemove(customer._id)}
              className="text-blue-500 hover:text-blue-700 rounded-full p-1 hover:bg-blue-200 transition-colors"
              type="button"
            >
              <X size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectedCustomersList;