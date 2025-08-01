import React from "react";
import { DollarSign, TrendingUp, FileText } from "lucide-react";

const ExpenseSummary = ({ summary }) => {

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg sm:text-xl font-medium text-gray-700">
          Expense Summary
        </h2>
        <div className="bg-blue-50 text-blue-500 p-1.5 rounded-full">
          <TrendingUp size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center bg-blue-50/50 rounded-lg p-3">
          <div className="bg-blue-500 p-2 rounded-lg mr-3">
            <DollarSign size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Expenses</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {summary?.totalAmount.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        <div className="flex items-center bg-blue-50/50 rounded-lg p-3">
          <div className="bg-blue-500 p-2 rounded-lg mr-3">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Records</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {summary?.count || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;
