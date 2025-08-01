import React from "react";
import { FileText, DollarSign, AlertCircle, TrendingUp } from "lucide-react";

const InvoiceStatsBar = ({ stats, loading }) => {
  const StatCard = ({
    icon: Icon,
    title,
    value,
    bgColor,
    textColor,
    isLoading,
  }) => (
    <div
      className={`${bgColor} rounded-lg p-3 flex items-center gap-3 transform hover:scale-105 transition-all duration-300`}
    >
      <div className="rounded-lg p-2 bg-white/20">
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-white/80">{title}</p>
        <p className={`text-lg font-bold ${textColor}`}>
          {isLoading ? "..." : value}
        </p>
      </div>
    </div>
  );

  // Calculate payment percentage
  const paymentPercentage =
    stats.totalAmount > 0
      ? ((stats.totalPaidAmount / stats.totalAmount) * 100).toFixed(1)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <StatCard
        icon={FileText}
        title="Total Invoices"
        value={stats.totalInvoices}
        bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
        textColor="text-white"
        isLoading={loading}
      />

      <StatCard
        icon={DollarSign}
        title="Total Amount"
        value={stats.totalAmount.toFixed(2)}
        bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
        textColor="text-white"
        isLoading={loading}
      />

      <StatCard
        icon={AlertCircle}
        title="Balance Due"
        value={stats.totalBalanceToPay.toFixed(2)}
        bgColor="bg-gradient-to-br from-red-500 to-red-600"
        textColor="text-white"
        isLoading={loading}
      />

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-white/20">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/80">Amount Paid</p>
              <p className="text-lg font-bold text-white">
                {loading ? "..." : stats.totalPaidAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/80">Progress</span>
            <p className="text-lg font-bold text-white">{paymentPercentage}%</p>
          </div>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(parseFloat(paymentPercentage), 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceStatsBar;
