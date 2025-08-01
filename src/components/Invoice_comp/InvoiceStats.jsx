import React from 'react';
import { DollarSign, AlertTriangle, Calendar, CheckSquare, TrendingUp, PieChart } from 'lucide-react';

const InvoiceStats = ({ stats, loading }) => {
  const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(amount);
};

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-pulse">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-blue-100 p-6 rounded-lg shadow-sm h-32"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* Total Outstanding Amount */}
      <div className="bg-white p-6 rounded-lg shadow-xl border border-blue-200 border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {stats.totalOutstanding.toFixed(2)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">All unpaid invoices</p>
          </div>
          <div className="bg-blue-500/20 p-3 rounded-full">
            <DollarSign size={20} className="text-blue-600" />
          </div>
        </div>
      </div>

      {/* Overdue Amount */}
      <div className="bg-white p-6 rounded-lg shadow-xl border border-blue-200 border-l-4 border-l-red-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {stats.overdueAmount.toFixed(2)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Past due date</p>
          </div>
          <div className="bg-red-500/20 p-3 rounded-full">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Payments Last 30 Days */}
      <div className="bg-white p-6 rounded-lg shadow-xl border border-blue-200 border-l-4 border-l-green-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Received</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {stats.totalPaymentsReceived.toFixed(2)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Total amount received</p>
          </div>
          <div className="bg-green-500/20 p-3 rounded-full">
            <TrendingUp size={20} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Invoices Stats */}
      <div className="bg-white p-6 rounded-lg shadow-xl border border-blue-200 border-l-4 border-l-blue-600">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">Invoices</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {stats.paidInvoicesCount} / {stats.totalInvoicesCount}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Paid vs Total</p>
          </div>
          <div className="bg-blue-500/20 p-3 rounded-full">
            <PieChart size={20} className="text-blue-600" />
          </div>
        </div>
        {stats.totalInvoicesCount > 0 && (
          <div className="mt-3 w-full bg-blue-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full"
              style={{ width: `${(stats.paidInvoicesCount / stats.totalInvoicesCount) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Due Soon Count */}
      <div className="bg-white p-6 rounded-lg shadow-xl border border-blue-200 border-l-4 border-l-yellow-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">Overdue Invoices</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {stats.dueCount}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Invoices due soon</p>
          </div>
          <div className="bg-yellow-500/20 p-3 rounded-full">
            <Calendar size={20} className="text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Payment Rate */}
      <div className="bg-white p-6 rounded-lg shadow-xl border border-blue-200 border-l-4 border-l-blue-400">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">Payment Rate</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {stats.totalInvoicesCount > 0
                ? `${Math.round((stats.paidInvoicesCount / stats.totalInvoicesCount) * 100)}%`
                : '0%'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Percentage of invoices paid</p>
          </div>
          <div className="bg-blue-500/20 p-3 rounded-full">
            <CheckSquare size={20} className="text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceStats;