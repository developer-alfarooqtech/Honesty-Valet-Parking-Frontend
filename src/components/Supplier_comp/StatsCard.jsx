import React from "react";

const StatsCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    green: "from-green-500 to-green-600 shadow-green-500/25",
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/25",
    red: "from-red-500 to-red-600 shadow-red-500/25",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-5 group">
      <div className="flex items-center space-x-4">
        <div
          className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <div className="text-white">{icon}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
