import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { Download, ShoppingCart } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SalesReport = ({ data, loading, dateRange, handleDownloadReport, isDownloading }) => {
  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const chartData = Object.entries(data.monthlyData).map(([month, values]) => ({
    month: new Date(month + "-01").toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    sales: values.sales,
    orders: values.orders,
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex justify-between">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ShoppingCart className="text-blue-500" size={24} />
          Invoices Report
        </h3>
        <div className="flex justify-end mb-3">
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 shadow-sm"
            disabled={isDownloading}
            onClick={() => handleDownloadReport("sales")}
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Invoice value</div>
          <div className="text-2xl font-bold text-blue-600">
            AED {data.totalSales.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Invoices</div>
          <div className="text-2xl font-bold text-blue-600">
            {data.totalOrders}
          </div>
        </div>
        {/* <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Avg Order Value</div>
          <div className="text-2xl font-bold text-green-600">
            AED {data.averageOrderValue}
          </div>
        </div> */}
      </div>

      <p className="text-sm text-gray-500 mb-2">
        Showing data for{" "}
        {dateRange?.start && dateRange?.end
          ? `${new Date(dateRange.start).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })} - ${new Date(dateRange.end).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}`
          : "the last 6 months"}
      </p>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill: "#64748b" }} />
            <YAxis tick={{ fill: "#64748b" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #f97316",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#f97316"
              fill="url(#salesGradient)"
              strokeWidth={3}
            />
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(SalesReport);
