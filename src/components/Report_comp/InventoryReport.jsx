import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { Download, Package } from "lucide-react";

const InventoryReport = ({ data, loading, handleDownloadReport, isDownloading }) => {
  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex justify-between">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Package className="text-blue-500" size={24} />
          Inventory Report
        </h3>
        <div className="flex justify-end mb-3">
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 shadow-sm"
            disabled={isDownloading}
            onClick={() => handleDownloadReport("inventory")}
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-2xl font-bold text-blue-600">
            {data.totalProducts}
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Stock Value</div>
          <div className="text-2xl font-bold text-green-600">
            AED {data.totalStockValue.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Low Stock</div>
          <div className="text-2xl font-bold text-yellow-600">
            {data.lowStockCount}
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">
            {data.outOfStockCount}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(InventoryReport);
