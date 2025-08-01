import React from 'react';

const SummaryCard = ({ icon: Icon, title, value, color, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-200`}>
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-lg mr-4`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;