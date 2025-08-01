import React from "react";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

// Utility function for formatting numbers
const formatValue = (val) => {
  if (typeof val === "string" && val.includes("%")) return val;
  if (typeof val === "number") {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  }
  return val;
};

// Main StatsCard Component
const StatsCard = ({ title, value, icon: Icon, sub }) => {
  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ease-in-out">
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide">
          {title}
        </h3>
        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Main value */}
      <div className="mb-2">
        <span className="text-3xl font-bold text-gray-900">
          {formatValue(value)}
        </span>
      </div>
      <span className="text-gray-500 ml-1">{sub||""}</span>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 group-hover:bg-blue-500 transition-all duration-300 rounded-b-xl"></div>
    </div>
  );
};

// Alternative StatsCard with gradient background

export default StatsCard;
