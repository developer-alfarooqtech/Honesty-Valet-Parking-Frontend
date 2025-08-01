import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Download,
  FileText,
  ChevronDown,
} from "lucide-react";
import { handleDownloadSupplierDetailsPDF } from "./SupplierDetailsDownload";

const SupplierDetails = ({ supplierDetails, loading, onLoadMoreInvoices }) => {
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    if (supplierDetails) {
      const spending = supplierDetails.invoices.reduce(
        (sum, invoice) => sum + invoice.total,
        0
      );
      setTotalSpending(spending);
      setTotalInvoices(
        supplierDetails.pagination?.total || supplierDetails.invoices.length
      );
    }
  }, [supplierDetails]);

  const handleDownloadPDF = async () => {
    await handleDownloadSupplierDetailsPDF({
      supplierDetails,
      setExportingPDF,
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-48 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!supplierDetails) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-48 flex justify-center items-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Select a supplier to view details</p>
        </div>
      </div>
    );
  }

  const { supplier, invoices, pagination } = supplierDetails;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white">{supplier.name}</h2>
          <button
            onClick={handleDownloadPDF}
            disabled={exportingPDF}
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
            title="Download Supplier Details"
          >
            <Download className="w-4 h-4 mr-2 text-blue-500" />
            Download Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white text-sm">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 opacity-75" />
            <span className="opacity-90">{supplier.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 opacity-75" />
            <span className="opacity-90">{supplier.phone}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 opacity-75" />
            <span className="opacity-90">{supplier.address}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-100">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-blue-600 text-sm font-medium mb-1">
            Total Invoices
          </p>
          <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-green-600 text-sm font-medium mb-1">
            Total Spending
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {totalSpending.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Invoices */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Purchase Invoices
          </h3>
          <span className="text-sm text-gray-500">
            Showing {invoices.length} of {totalInvoices}
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No purchase invoices found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invoice.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(
                        invoice?.date || invoice.createdAt
                      ).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">
                  {invoice.total.toFixed(2)}
                </span>
              </div>
            ))}

            {pagination?.hasMore && (
              <button
                onClick={onLoadMoreInvoices}
                className="w-full mt-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDetails;
