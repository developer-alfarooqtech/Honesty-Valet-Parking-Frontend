import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { Download, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

const ExpenseReport = ({ data, loading, dateRange, handleDownloadReport, isDownloading }) => {
  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  // Sort categories by value (highest first) for better visualization
  const categoryData = Object.entries(data.categoryBreakdown)
    .map(([name, value]) => ({
      name,
      value,
      percentage: ((value / data.totalExpenses) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  // Generate distinct colors for categories
  const generateColors = (count) => {
    const colors = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
      const hue = i * hueStep;
      const saturation = 65 + (i % 3) * 10; // Vary saturation slightly
      const lightness = 45 + (i % 2) * 10; // Vary lightness slightly
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  };

  const categoryColors = generateColors(categoryData.length);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800 mb-1">{label}</p>
          <p className="text-lg font-bold text-blue-600">
            AED {data.value?.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            {data.payload?.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex justify-between">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingDown className="text-blue-500" size={24} />
          Expense Report
        </h3>
        <div className="flex justify-end mb-3">
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 shadow-sm"
            disabled={isDownloading}
            onClick={() => handleDownloadReport("expense")}
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">
            AED {data.totalExpenses.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Transactions</div>
          <div className="text-2xl font-bold text-blue-600">
            {data.totalTransactions}
          </div>
        </div>
      </div>

      {/* Category Breakdown - Bar Chart */}
      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-4">
          Category Breakdown
        </h4>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Category Summary Table */}
          <div className="mt-6 max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium text-gray-700">
                    Category
                  </th>
                  <th className="text-right p-2 font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="text-right p-2 font-medium text-gray-700">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((item, index) => (
                  <tr
                    key={item.name}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-2 flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: categoryColors[index] }}
                      ></div>
                      <span className="text-gray-700 truncate">
                        {item.name}
                      </span>
                    </td>
                    <td className="p-2 text-right font-medium text-gray-800">
                      AED {item.value.toLocaleString()}
                    </td>
                    <td className="p-2 text-right text-gray-600">
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Department Breakdown */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              Department Breakdown
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(data.departmentBreakdown)
                .sort(([, a], [, b]) => b - a) // Sort by amount
                .map(([dept, amount], index) => {
                  const percentage = (
                    (amount / data.totalExpenses) *
                    100
                  ).toFixed(1);
                  return (
                    <div
                      key={dept}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium block">
                          {dept}
                        </span>
                        <span className="text-sm text-gray-500">
                          {percentage}% of total
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600 block">
                          AED {amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ExpenseReport);
