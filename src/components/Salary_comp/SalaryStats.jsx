import React from "react";
import { DollarSign, TrendingUp, Activity } from "lucide-react";

const SalaryStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const { overview, monthlyBreakdown } = stats;

  const formatMonth = (year, month) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  const statCards = [
    {
      title: "Total Amount",
      value: overview.totalAmount,
      icon: DollarSign,
      gradient: "from-blue-500 to-cyan-500",
      lightGradient: "from-blue-50 to-cyan-50",
      text:"text-blue-600",
    },
    {
      title: "Total Records",
      value: overview.totalRecords?.toLocaleString() || "0",
      icon: Activity,
      gradient: "from-blue-500 to-amber-500",
      lightGradient: "from-blue-50 to-amber-50",
      text: "text-blue-600",
    },
    {
      title: "Average Amount",
      value: overview.averageAmount,
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      lightGradient: "from-purple-50 to-pink-50",
      text: "text-purple-600",
    },
  ];

  // Calculate percentage for type breakdown
  const totalAmount = overview.totalAmount || 0;
  const operationalPercent =
    totalAmount > 0
      ? Math.round((overview.operationalTotal / totalAmount) * 100)
      : 0;
  const adminPercent =
    totalAmount > 0 ? Math.round((overview.adminTotal / totalAmount) * 100) : 0;

  return (
    <div className="space-y-4 mt-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${stat.lightGradient}`}
              >
                <stat.icon
                  size={20}
                  className={`bg-gradient-to-br ${stat.gradient} ${stat.text} bg-clip-text`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className="text-xl font-bold mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Type Distribution and Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Payment Type Distribution
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-600">Operational</span>
                <span className="font-medium text-green-600">
                  {overview.operationalTotal}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${operationalPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overview.operationalCount} records ({operationalPercent}%)
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-600">Admin</span>
                <span className="font-medium text-blue-600">
                  {overview.adminTotal}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-500"
                  style={{ width: `${adminPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {overview.adminCount} records ({adminPercent}%)
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Monthly Trend
          </h3>
          <div className="space-y-3">
            {monthlyBreakdown?.slice(0, 3).map((month, index) => {
              const maxCount = Math.max(
                ...monthlyBreakdown.map((m) => m.totalCount)
              );
              const widthPercent = (month.totalCount / maxCount) * 100;

              return (
                <div key={index} className="group">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600">
                      {formatMonth(month._id.year, month._id.month)}
                    </span>
                    <span className="font-medium text-purple-600">
                      {month.total}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {month.totalCount} payments
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryStats;
