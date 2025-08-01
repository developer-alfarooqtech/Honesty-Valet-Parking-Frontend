import React from "react";
import {
  Search,
  Calendar,
  Clock,
  CheckSquare,
  X,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import CustomerSearch from "./CustomerSearch";

const InvoiceFiltersPanel = ({
  searchTerm,
  setSearchTerm,
  selectedCustomer,
  handleCustomerSelect,
  handleClearCustomer,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showOverdueOnly,
  setShowOverdueOnly,
  showPaymentClearedOnly,
  setShowPaymentClearedOnly,
  showPendingOnly,
  setShowPendingOnly,
  showCancelledOnly,
  setShowCancelledOnly,
  invoices,
  resetFilters,
  downloadPdf,
  handleDownloadExcel,
  exportingPDF,
  exportingExcel,
}) => {
  const hasActiveFilters = startDate || endDate || showOverdueOnly || showPaymentClearedOnly || selectedCustomer;

  const getActiveFiltersText = () => {
    const filters = [];
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    if (selectedCustomer) filters.push(`Customer: ${selectedCustomer.name}`);
    if (startDate) filters.push(`From: ${new Date(startDate).toLocaleDateString("en-GB")}`);
    if (endDate) filters.push(`To: ${new Date(endDate).toLocaleDateString("en-GB")}`);
    if (showOverdueOnly) filters.push("Overdue Only");
    if (showPaymentClearedOnly) filters.push("Fully Paid Only");
    if (showPendingOnly) filters.push("Pending Only");
    if (showCancelledOnly) filters.push("Cancelled Only");
    
    return filters.length > 0 ? filters.join(", ") : "No filters applied";
  };

  return (
    <div className="mb-6 bg-white border border-blue-200 rounded-xl shadow-lg overflow-hidden">
      {/* Filter Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">
                Filters & Search
              </h3>
              <p className="text-sm text-blue-600">
                Refine your invoice search
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {invoices.length}
              </div>
              <div className="text-xs text-blue-500">Results</div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors text-xs font-medium"
              >
                <X size={14} className="mr-1" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-6">
        {/* Main Search Row */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Invoices
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by invoice name"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Customer Filter */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <div className="relative">
              <CustomerSearch
                onCustomerSelect={handleCustomerSelect}
                selectedCustomer={selectedCustomer}
                onClearCustomer={handleClearCustomer}
              />
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 text-sm"
                  placeholder="Start Date"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 text-sm"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Data
            </label>
            <div className="flex flex-col gap-2">
              <button
                onClick={downloadPdf}
                disabled={exportingPDF}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm font-medium"
              >
                <FileText size={14} />
                {exportingPDF ? "Generating..." : "PDF"}
              </button>
              <button
                onClick={handleDownloadExcel}
                disabled={exportingExcel}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm font-medium"
              >
                <FileSpreadsheet size={14} />
                {exportingExcel ? "Generating..." : "Excel"}
              </button>
            </div>
          </div>
        </div>

        {/* Status Toggles */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Filter by Status
          </label>
          <div className="flex flex-wrap gap-4">
            {/* Overdue Toggle */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showOverdueOnly}
                  onChange={(e) => setShowOverdueOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-red-600"></div>
                <div className="ml-3 flex items-center">
                  <Clock
                    size={16}
                    className={`mr-2 ${
                      showOverdueOnly ? "text-red-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      showOverdueOnly ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    Overdue
                  </span>
                </div>
              </label>
            </div>

            {/* Pending Toggle */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showPendingOnly}
                  onChange={(e) => setShowPendingOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-blue-500"></div>
                <div className="ml-3 flex items-center">
                  <Clock
                    size={16}
                    className={`mr-2 ${
                      showPendingOnly ? "text-yellow-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      showPendingOnly ? "text-yellow-600" : "text-gray-700"
                    }`}
                  >
                    Pending
                  </span>
                </div>
              </label>
            </div>

            {/* Paid Toggle */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showPaymentClearedOnly}
                  onChange={(e) => setShowPaymentClearedOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600"></div>
                <div className="ml-3 flex items-center">
                  <CheckSquare
                    size={16}
                    className={`mr-2 ${
                      showPaymentClearedOnly ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      showPaymentClearedOnly ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    Fully Paid
                  </span>
                </div>
              </label>
            </div>

            {/* Cancelled Toggle */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showCancelledOnly}
                  onChange={(e) => setShowCancelledOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-gray-500 peer-checked:to-gray-600"></div>
                <div className="ml-3 flex items-center">
                  <X
                    size={16}
                    className={`mr-2 ${
                      showCancelledOnly ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      showCancelledOnly ? "text-gray-600" : "text-gray-700"
                    }`}
                  >
                    Cancelled
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(startDate ||
          endDate ||
          showOverdueOnly ||
          showPaymentClearedOnly ||
          showPendingOnly ||
          showCancelledOnly ||
          selectedCustomer ||
          searchTerm) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Active Filters:
              </span>
              <span className="text-xs text-gray-500">
                {invoices.length} result
                {invoices.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                  <Search size={12} className="mr-1" />
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedCustomer && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                  Customer: {selectedCustomer.name}
                  <button
                    onClick={handleClearCustomer}
                    className="ml-2 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {startDate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                  <Calendar size={12} className="mr-1" />
                  From: {new Date(startDate).toLocaleDateString("en-GB")}
                  <button
                    onClick={() => setStartDate("")}
                    className="ml-2 hover:text-purple-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                  <Calendar size={12} className="mr-1" />
                  To: {new Date(endDate).toLocaleDateString("en-GB")}
                  <button
                    onClick={() => setEndDate("")}
                    className="ml-2 hover:text-purple-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {showOverdueOnly && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                  <Clock size={12} className="mr-1" />
                  Overdue
                  <button
                    onClick={() => setShowOverdueOnly(false)}
                    className="ml-2 hover:text-red-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {showPaymentClearedOnly && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  <CheckSquare size={12} className="mr-1" />
                  Fully Paid
                  <button
                    onClick={() => setShowPaymentClearedOnly(false)}
                    className="ml-2 hover:text-green-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {showPendingOnly && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                  <Clock size={12} className="mr-1" />
                  Pending
                  <button
                    onClick={() => setShowPendingOnly(false)}
                    className="ml-2 hover:text-yellow-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {showCancelledOnly && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  <X size={12} className="mr-1" />
                  Cancelled
                  <button
                    onClick={() => setShowCancelledOnly(false)}
                    className="ml-2 hover:text-gray-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceFiltersPanel;