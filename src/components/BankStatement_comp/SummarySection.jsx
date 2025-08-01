import React from 'react';
import { TrendingUp, TrendingDown, Receipt, DollarSign, Notebook, StoreIcon, ShoppingCart } from 'lucide-react';
import SummaryCard from './SummaryCard';

const SummarySection = ({ summaryData, loading }) => {
  const summary = summaryData || {
    invoiceCount: 0,
    invoiceAmount: 0,
    purchaseCount: 0,
    purchaseAmount: 0
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="flex items-center">
              <div className="bg-gray-300 rounded-lg w-12 h-12 mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <SummaryCard
        icon={Notebook}
        title="Invoice Transactions"
        value={summary.invoiceCount.toLocaleString()}
        color="bg-gradient-to-br from-green-500 to-green-600"
        bgColor="bg-white"
      />
      
      <SummaryCard
        icon={DollarSign}
        title="Invoice Amount"
        value={summary.invoiceAmount}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
        bgColor="bg-white"
      />
      
      <SummaryCard
        icon={ShoppingCart}
        title="Purchase Transactions"
        value={summary.purchaseCount.toLocaleString()}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
        bgColor="bg-white"
      />
      
      <SummaryCard
        icon={DollarSign}
        title="Purchase Amount"
        value={summary.purchaseAmount}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
        bgColor="bg-white"
      />
    </div>
  );
};

export default SummarySection;