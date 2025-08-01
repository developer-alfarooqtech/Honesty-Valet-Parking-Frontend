import React from "react";
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  Filter,
  X,
  Download,
} from "lucide-react";

const FilterSection = ({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  showUnpaid,
  setShowUnpaid,
  onClearFilters,
  hasActiveFilters,
  downloadPdf,
  handleDownloadExcel,
  exportingExcel,
  exportingPDF,
  loading,
  documentType,
  setDocumentType,
}) => {
  // Helper function to handle date changes properly
  const handleDateFromChange = (e) => {
    const value = e.target.value;
    setDateFrom(value); // This will be a string in YYYY-MM-DD format
  };

  const handleDateToChange = (e) => {
    const value = e.target.value;
    setDateTo(value); // This will be a string in YYYY-MM-DD format
  };

  // Helper function to ensure date is in proper format for input
  const formatDateForInput = (date) => {
    if (!date) return "";

    // If it's already a string in correct format, return as is
    if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }

    // If it's a Date object, convert to YYYY-MM-DD
    if (date instanceof Date && !isNaN(date)) {
      return date.toISOString().split("T")[0];
    }

    // If it's a string that can be parsed as date
    if (typeof date === "string") {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate)) {
        return parsedDate.toISOString().split("T")[0];
      }
    }

    return "";
  };

  return (
    <div className="bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left side - Filters */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Date Range - Takes 2 columns on xl screens */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-blue-600 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={formatDateForInput(dateFrom)}
                    onChange={handleDateFromChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700"
                    max={
                      formatDateForInput(dateTo) ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={formatDateForInput(dateTo)}
                    onChange={handleDateToChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700"
                    min={formatDateForInput(dateFrom)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>

            {/* Document Type */}
            <div className="xl:col-span-1">
              <label className="block text-sm font-medium text-blue-600 mb-2">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700"
              >
                <option value="all">All Documents</option>
                <option value="invoice">Invoices Only</option>
                <option value="lpo">LPO Only</option>
              </select>
            </div>

            {/* Payment Status Toggle */}
            <div className="xl:col-span-1">
              <label className="block text-sm font-medium text-blue-600 mb-2">
                Payment Status
              </label>
              <div className="flex items-center justify-between px-3 py-2 border border-blue-200 rounded-lg h-[38px]">
                <span className="text-sm text-blue-600">Unpaid only</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUnpaid}
                    onChange={(e) => setShowUnpaid(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-blue-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:tranblue-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-blue-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="xl:col-span-4 flex justify-start">
                <button
                  onClick={onClearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Export */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-blue-600 mb-2">
            Export Options
          </label>
          <div className="flex gap-2">
            <button
              onClick={downloadPdf}
              disabled={exportingPDF || loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={exportingExcel || loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(loading || exportingPDF || exportingExcel) && (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
