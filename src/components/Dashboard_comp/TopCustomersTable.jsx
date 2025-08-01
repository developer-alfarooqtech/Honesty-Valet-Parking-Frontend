// components/dashboard/TopCustomersTable.jsx
import React from 'react';
import { User } from 'lucide-react';

const TopCustomersTable = ({ customers }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-blue-500">Top Customers</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div key={customer._id} className="flex items-center justify-between p-4 bg-blue-500 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 bg-white">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{customer.customerName}</p>
                  <p className="text-xs text-white">{customer.invoiceCount} invoices</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                 AED {customer.totalRevenue}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopCustomersTable