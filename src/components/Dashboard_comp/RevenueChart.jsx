// components/dashboard/RevenueChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-blue-500 mb-4">Monthly Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString()}`, 'Revenue']}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#F97316"  // blue-500
            strokeWidth={3}
            dot={{ fill: '#F97316' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
