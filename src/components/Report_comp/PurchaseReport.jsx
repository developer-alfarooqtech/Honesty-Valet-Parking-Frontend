import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { Download, ShoppingCart } from "lucide-react";

const PurchaseReport = ({ data, loading, dateRange, handleDownloadReport, isDownloading }) => {
  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex justify-between">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingCart className="text-blue-500" size={24} />
        Purchase Invoices Report
      </h3>
      <div className="flex justify-end mb-3">
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 shadow-sm"
            disabled={isDownloading}
            onClick={() => handleDownloadReport("purchase")}
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Purchases</div>
          <div className="text-2xl font-bold text-purple-600">AED {data.totalPurchases.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Invoices</div>
          <div className="text-2xl font-bold text-blue-600">{data.totalInvoices}</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Outstanding</div>
          <div className="text-2xl font-bold text-blue-600">AED {data.totalOutstanding.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PurchaseReport);