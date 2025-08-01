import React, { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  ShoppingBag,
} from "lucide-react";
import {
  getAllSuppliers,
  searchSuppliers,
  getSupplierDetails,
} from "../service/supplierService";

// Import components
import SupplierSearch from "../components/Supplier_comp/SupplierSearch";
import SupplierList from "../components/Supplier_comp/SupplierList";
import SupplierDetails from "../components/Supplier_comp/SupplierDetails";
import StatsCard from "../components/Supplier_comp/StatsCard";
import { handleDownloadSupplierPDF } from "../components/Supplier_comp/DownloadSuppliers";
import toast from "react-hot-toast";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    totalInvoices: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(20);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplierId) {
      setCurrentPage(1);
      fetchSupplierDetails(selectedSupplierId, 1);
    }
  }, [selectedSupplierId]);

  const downloadSupplierPdf = async () => {
    await handleDownloadSupplierPDF({
      setExportingPDF,
    });
  };

  const handleDownloadExcel = async () => {
    try {
      setExportingExcel(true);
      // Create a workbook
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Format data for Excel
      const worksheetData = filteredSuppliers.map((supplier) => ({
        Name: supplier.name || "N/A",
        Email: supplier.email || "N/A",
        Phone: supplier.phone || "N/A",
        Address: supplier.address || "N/A",
      }));

      // Create worksheet with invoice data
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");

      // Create summary worksheet
      // Write to file and trigger download
      XLSX.writeFile(workbook, "Suppliers_List.xlsx");

      toast.success("Excel report downloaded successfully");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to download Excel report");
    } finally {
      setExportingExcel(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await getAllSuppliers();
      setSuppliers(response.data);
      setFilteredSuppliers(response.data);
      setStats({
        totalSuppliers: response.data.length,
        totalInvoices: 0,
      });

      setError(null);
    } catch (err) {
      setError("Failed to load suppliers. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      setSearchLoading(true);

      if (!query.trim()) {
        setFilteredSuppliers(suppliers);
      } else {
        const response = await searchSuppliers(query);
        setFilteredSuppliers(response.data);
      }
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchSupplierDetails = async (supplierId, page = 1) => {
    try {
      setDetailsLoading(true);

      const response = await getSupplierDetails(
        supplierId,
        page,
        invoicesPerPage
      );

      if (page === 1) {
        setSupplierDetails(response.data);
        setStats((prevStats) => ({
          ...prevStats,
          totalInvoices: response.data.pagination.total,
        }));
      } else {
        setSupplierDetails((prevDetails) => ({
          ...prevDetails,
          invoices: [...prevDetails.invoices, ...response.data.invoices],
          pagination: response.data.pagination,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSelectSupplier = (supplierId) => {
    setSelectedSupplierId(supplierId);
  };

  const handleLoadMoreInvoices = () => {
    if (supplierDetails?.pagination?.hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchSupplierDetails(selectedSupplierId, nextPage);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <header className="mb-8 flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
              <ShoppingBag size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-500">Suppliers</h1>
              <p className="text-blue-400 font-medium">
                Manage your suppliers
              </p>
            </div>
          </header>
          <div className="flex gap-3">
            <button
              onClick={downloadSupplierPdf}
              disabled={exportingPDF}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
            >
              {exportingPDF ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Export PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={exportingExcel}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200"
            >
              {exportingExcel ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Export Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatsCard
            icon={<Users className="w-6 h-6 text-white" />}
            title="Total Suppliers"
            value={stats.totalSuppliers}
            color="blue"
          />
          <StatsCard
            icon={<ClipboardList className="w-6 h-6 text-white" />}
            title="Total Invoices"
            value={stats.totalInvoices}
            color="green"
          />
        </div>

        {/* Search Bar */}
        <SupplierSearch onSearch={handleSearch} loading={searchLoading} />
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Supplier List */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Supplier List
                </h2>
              </div>
              <div className="p-4">
                <SupplierList
                  suppliers={filteredSuppliers}
                  loading={loading}
                  onSelectSupplier={handleSelectSupplier}
                  selectedSupplierId={selectedSupplierId}
                />
              </div>
            </div>
          </div>

          {/* Supplier Details */}
          <div className="lg:col-span-7 xl:col-span-8">
            <SupplierDetails
              supplierDetails={supplierDetails}
              loading={detailsLoading}
              onLoadMoreInvoices={handleLoadMoreInvoices}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
