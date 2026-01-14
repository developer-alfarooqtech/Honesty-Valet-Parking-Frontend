import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import SummaryCard from "./SummaryCard";
import ProfitLossChart from "./ProfitLossChart";
import { Download, TrendingUp, DollarSign, Users, ShoppingCart, CreditCard, BarChart3 } from "lucide-react";

const ProfitLossReport = ({
  data,
  loading,
  dateRange,
  handleDownloadReport,
  isDownloading,
}) => {
  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-6 py-4 border-b border-blue-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={24} />
            Profit & Loss Statement
          </h3>
          <button
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            disabled={isDownloading}
            onClick={() => handleDownloadReport("profit-loss")}
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  Total Revenue
                </div>
                <div className="text-xl font-bold text-blue-700 mt-1">
                  AED {data.revenue.toLocaleString()}
                </div>
              </div>
              <DollarSign className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  Gross Profit
                </div>
                <div className="text-xl font-bold text-blue-700 mt-1">
                  AED {data.grossProfit.toLocaleString()}
                </div>
              </div>
              <BarChart3 className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-purple-600 uppercase tracking-wide">
                  Net Profit
                </div>
                <div className={`text-xl font-bold mt-1 ${data.netProfit >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                  AED {data.netProfit.toLocaleString()}
                </div>
              </div>
              <TrendingUp className="text-purple-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  Net Margin
                </div>
                <div className="text-xl font-bold text-blue-700 mt-1">
                  {data.netProfitMargin}%
                </div>
              </div>
              <div className="text-blue-400 text-2xl font-bold">%</div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Financial Breakdown */}
          <div className="space-y-6">
            {/* Revenue & COGS */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <DollarSign className="text-blue-500" size={20} />
                Revenue & Direct Costs
              </h4>
              <div className="space-y-3">
                <SummaryCard label="Total Revenue" amount={data.revenue} icon={DollarSign} />
                <SummaryCard label="Cost of Goods Sold" amount={data.cogs} isNegative={true} icon={ShoppingCart} />
                <div className="pt-2 border-t border-blue-300">
                  <SummaryCard label="Gross Profit" amount={data.grossProfit} isHighlight={true} />
                </div>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <CreditCard className="text-blue-500" size={20} />
                Operating Expenses
              </h4>
              <div className="space-y-2">
                {Object.entries(data.categoryBreakdown).map(([category, amount]) => (
                  <SummaryCard 
                    key={category}
                    label={category} 
                    amount={amount} 
                    isNegative={true}
                    icon={CreditCard}
                  />
                ))}
                <div className="pt-2 border-t border-blue-300">
                  <SummaryCard 
                    label="Total Operating Expenses" 
                    amount={data.expenses} 
                    isNegative={true}
                    isHighlight={true}
                  />
                </div>
              </div>
            </div>

            {/* Salaries Costs */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <Users className="text-purple-500" size={20} />
                Salaries
              </h4>
              <div className="space-y-2">
                {Object.entries(data.salaryTypeBreakdown).map(([type, amount]) => (
                  <SummaryCard 
                    key={type}
                    label={`${type.charAt(0).toUpperCase() + type.slice(1)} Salary`} 
                    amount={amount} 
                    isNegative={true}
                    icon={Users}
                  />
                ))}
                <div className="pt-2 border-t border-blue-300">
                  <SummaryCard 
                    label="Total Salary" 
                    amount={data.salaries} 
                    isNegative={true}
                    isHighlight={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Charts & Analysis */}
          <div className="space-y-6">
            {/* Financial Overview Chart */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <BarChart3 className="text-blue-500" size={20} />
                Financial Overview
              </h4>
              <ProfitLossChart data={data} />
            </div>

            {/* Profitability Analysis */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4">Profitability Analysis</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
                  <span className="font-medium text-blue-600">Gross Profit Margin</span>
                  <span className="font-bold text-blue-600 text-lg">{data.grossProfitMargin}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
                  <span className="font-medium text-blue-600">Operating Margin</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {(((data.grossProfit - data.expenses) / data.revenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-200">
                  <span className="font-medium text-blue-600">Net Profit Margin</span>
                  <span className={`font-bold text-lg ${data.netProfitMargin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {data.netProfitMargin}%
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown Summary */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-700 mb-4">Cost Structure</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-600">COGS as % of Revenue</span>
                  <span className="font-semibold text-red-600">
                    {((data.cogs / data.revenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600">Operating Expenses as % of Revenue</span>
                  <span className="font-semibold text-blue-600">
                    {((data.expenses / data.revenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600">Salary as % of Revenue</span>
                  <span className="font-semibold text-purple-600">
                    {((data.salaries / data.revenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-300">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700">Total Costs as % of Revenue</span>
                    <span className="font-bold text-blue-800">
                      {(((data.cogs + data.expenses + data.salaries) / data.revenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-100 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Final Result</h4>
            <div className="text-3xl font-bold mb-1">
              <span className={data.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}>
                AED {data.netProfit.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-blue-600">
              Net {data.netProfit >= 0 ? 'Profit' : 'Loss'} • {data.netProfitMargin}% Margin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfitLossReport);