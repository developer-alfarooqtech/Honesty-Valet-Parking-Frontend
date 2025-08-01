import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ProfitLossChart = ({ data }) => {
  const chartData = [
    { 
      name: "Revenue", 
      value: data.revenue, 
      color: "#059669",
      type: "positive"
    },
    { 
      name: "COGS", 
      value: data.cogs, 
      color: "#dc2626",
      type: "negative"
    },
    { 
      name: "Expenses", 
      value: data.expenses, 
      color: "#ea580c",
      type: "negative"
    },
    { 
      name: "Salaries", 
      value: data.salaries, 
      color: "#7c3aed",
      type: "negative"
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-blue-200">
          <p className="font-semibold text-blue-700 mb-1">{label}</p>
          <p className="text-blue-600">
            <span className="font-mono font-semibold text-blue-800">
              AED {data.value.toLocaleString()}
            </span>
          </p>
          <div className="mt-2 text-xs text-blue-500">
            {data.payload.type === 'positive' ? '↗ Income' : '↘ Outgoing'}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props) => {
    const { fill, payload } = props;
    return <Bar {...props} fill={payload.color} radius={[6, 6, 0, 0]} />;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          barCategoryGap="20%"
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            strokeOpacity={0.5}
          />
          <XAxis 
            dataKey="name" 
            tick={{ 
              fill: "#64748b", 
              fontSize: 12,
              fontWeight: 500
            }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis 
            tick={{ 
              fill: "#64748b", 
              fontSize: 11,
              fontWeight: 400
            }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={{ stroke: "#cbd5e1" }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            shape={<CustomBar />}
            className="hover:opacity-80 transition-opacity duration-200"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitLossChart;