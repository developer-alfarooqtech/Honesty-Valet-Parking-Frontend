import React, { useState, useEffect } from "react";
import {
  getInvoices,
  getSuppliers,
  createInvoices,
  cancelLPO,
  getInvoiceStats,
  downloadPurchaseInvs,
  convertToInvoice,
  getLPOById,
  updateLPO,
  createSupplier,
} from "../service/productService";
import {
  FileText,
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import InvoiceList from "../components/Purchase_invoices_comp/InvoiceList";
import InvoiceDetailModal from "../components/Purchase_invoices_comp/InvoiceDetailModal";
import ConvertToInvoiceModal from "../components/Purchase_invoices_comp/ConvertToInvoiceModal";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";
import toast from "react-hot-toast";
import FilterSection from "../components/Purchase_invoices_comp/FilterSection";
import { handleDownloadPDF } from "../components/Purchase_invoices_comp/DownloadPurchaseInoices";
import InvoiceStatsBar from "../components/Purchase_invoices_comp/InvoiceStatsBar";
import LPOFormModal from "../components/Purchase_invoices_comp/LPOFormModal";

const resolveCreatorLabel = (createdBy) => {
  if (!createdBy) {
    return "Unknown";
  }

  if (typeof createdBy === "string") {
    return createdBy;
  }

  return (
    createdBy.name ||
    createdBy.fullName ||
    createdBy.username ||
    createdBy.loginId ||
    createdBy.email ||
    createdBy.displayName ||
    createdBy._id ||
    "Unknown"
  );
};

const PurchaseInvoices = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [supplierId, setSupplierId] = useState("");
  const [vatRate, setVatRate] = useState(0);
  const [payedAmount, setPayedAmount] = useState(0);
  const [balanceToPay, setBalanceToPay] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    code: "",
    stock: 1,
    purchasePrice: 0,
    sellingPrice: 0,
  });
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [selectedBank, setSelectedBank] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [dateFrom, setDateFrom] = useState(""); 
  const [dateTo, setDateTo] = useState(""); 
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLPO, setEditingLPO] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Convert to Invoice Modal states
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [invoiceToConvert, setInvoiceToConvert] = useState(null);
  const [converting, setConverting] = useState(false);
  const [documentType, setDocumentType] = useState("all");

  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    totalBalanceToPay: 0,
    totalPaidAmount: 0,
  });

  // New state for pagination and search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("invoice");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Use debounce for search to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch suppliers on mount
  useEffect(() => {
    getSuppliers().then((res) => setSuppliers(res.data));
  }, []);

  // Fetch invoices with pagination and search
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await getInvoices({
        page: currentPage,
        limit: 20,
        search: debouncedSearchQuery,
        searchType,
        dateFrom,
        dateTo,
        showUnpaid,
        documentType: documentType,
      });

      setInvoices(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, [
    currentPage,
    debouncedSearchQuery,
    dateFrom,
    dateTo,
    showUnpaid,
    documentType,
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getInvoiceStats({
          search: debouncedSearchQuery,
          dateFrom,
          dateTo,
          showUnpaid,
        });

        setStats(res.data?.data);
      } catch (error) {
        console.error("Error fetching invoice stats:", error);
        // Reset stats on error
        setStats({
          totalInvoices: 0,
          totalAmount: 0,
          totalBalanceToPay: 0,
          totalPaidAmount: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [debouncedSearchQuery, dateFrom, dateTo, showUnpaid]);

  const handleEditLPO = async (lpo) => {
    try {
      const response = await getLPOById(lpo._id);
      const data = response.data;
      setEditingLPO(data);
      setIsEditing(true);
      setShowForm(true);
      setSupplierId(data.supplierId._id);
      setProducts(data.products);
      setSelectedDate(new Date(data.date));
    } catch (error) {
      toast.error("Error fetching LPO details");
    }
  };

  const handleUpdateLPO = async () => {
    const finalTotal = calculatedTotal;

    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!products || products.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (isNaN(finalTotal) || finalTotal <= 0) {
      toast.error("Total amount must be a valid positive number");
      return;
    }
    try {
      const payload = {
        products,
        vat: vatRate,
        total: finalTotal,
        supplierId,
        date: selectedDate,
        bankAccount: selectedBank,
        payedAmount,
        balanceToPay,
      };
      setCreating(true);
      await updateLPO(editingLPO._id, payload);
      toast.success("LPO updated successfully");
      setProducts([]);
      setSupplierId("");
      setPayedAmount(0);
      setBalanceToPay(0);
      await fetchInvoices();
      setEditingLPO(null);
      setShowForm(false);
      setSelectedDate(null);
      // Reset form and refresh the list
    } catch (error) {
      toast.error("Error updating LPO");
    } finally {
      setIsEditing(false);
      setCreating(false);
    }
  };

  const handleClearFilters = () => {
    setDateFrom(""); // ✅ Reset to empty string
    setDateTo(""); // ✅ Reset to empty string
    setShowUnpaid(false);
    setCurrentPage(1);
  };

  const downloadPdf = async () => {
    await handleDownloadPDF({
      setExportingPDF,
      stats: stats,
      search: debouncedSearchQuery,
      dateFrom,
      dateTo,
      showUnpaid,
      searchType: searchType,
      documentType: documentType,
    });
  };

  const handleDownloadExcel = async () => {
    try {
      setExportingExcel(true);
      // Get raw data for Excel generation
      const response = await downloadPurchaseInvs({
        search: debouncedSearchQuery,
        dateFrom,
        dateTo,
        showUnpaid,
        searchType: searchType,
        documentType: documentType,
      });

      if (!response.data || !response.data.data) {
        toast.error("Failed to retrieve invoice data");
        return;
      }

      const { data } = response.data;

      // Create a workbook
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Format data for Excel
      const worksheetData = data.map((inv) => ({
        Invoice: inv.name || "N/A",
        Date: formatDate(inv.date) || formatDate(inv.createdAt) || "N/A",
        Supplier: inv.supplierId?.name || "N/A",
        "Created By": resolveCreatorLabel(inv.createdBy),
        Total: inv?.total || "N/A",
        Balance: inv.balanceToPay,
      }));

      // Create worksheet with invoice data
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

      // Create summary worksheet
      const summaryData = [
        { Metric: "Total amount", Value: stats.totalAmount },
        { Metric: "Total Paid", Value: stats.totalPaidAmount },
        { Metric: "Balance to pay", Value: stats.totalBalanceToPay },
        { Metric: "Total Invoices", Value: stats.totalInvoices },
      ];

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

      // Write to file and trigger download
      XLSX.writeFile(workbook, "Invoice_Report.xlsx");

      toast.success("Excel report downloaded successfully");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to download Excel report");
    } finally {
      setExportingExcel(false);
    }
  };

  const hasActiveFilters = dateFrom || dateTo || showUnpaid;

  const onUpdate = async (updatedInvoice) => {
    if (updatedInvoice) {
      setInvoices(
        invoices.map((inv) =>
          inv._id === updatedInvoice._id ? updatedInvoice : inv
        )
      );
    }
    setSelectedInvoice(null);
  };

  // Convert to Invoice handlers
  const handleConvertToInvoice = (invoice) => {
    setInvoiceToConvert(invoice);
    setShowConvertModal(true);
  };

  const handleConvertSubmit = async (id, invoiceName, selectedDate) => {
    try {
      setConverting(true);
      const response = await convertToInvoice(id, invoiceName, selectedDate);

      if (response.data.success) {
        toast.success("LPO converted to invoice successfully!");

        // Update the invoice in the list
        setInvoices(
          invoices.map((inv) => (inv._id === id ? response?.data?.data : inv))
        );

        // Refresh stats
        const statsRes = await getInvoiceStats({
          search: debouncedSearchQuery,
          dateFrom,
          dateTo,
          showUnpaid,
        });
        setStats(statsRes.data?.data);

        setShowConvertModal(false);
        setInvoiceToConvert(null);
      }
    } catch (error) {
      console.error("Error converting to invoice:", error);
      toast.error(
        error.response?.data?.message || "Failed to convert to invoice"
      );
    } finally {
      setConverting(false);
    }
  };

  const handleCloseConvertModal = () => {
    setShowConvertModal(false);
    setInvoiceToConvert(null);
  };

  useEffect(() => {
    const subTotal = products.reduce(
      (acc, item) => acc + item.purchasePrice * item.stock,
      0
    );
    setVatRate(subTotal * (5 / 100));
    const newCalculatedTotal = subTotal + vatRate;
    setCalculatedTotal(newCalculatedTotal);
    if (parseFloat(payedAmount) === 0) {
      setBalanceToPay(newCalculatedTotal);
    } else {
      const remainingBalance = newCalculatedTotal - parseFloat(payedAmount);
      setBalanceToPay(remainingBalance > 0 ? remainingBalance : 0);
    }
  }, [products, vatRate]);

  const addProduct = () => {
    if (newProduct.name && newProduct.code) {
      setProducts([...products, newProduct]);
      setNewProduct({
        name: "",
        description: "",
        code: "",
        stock: 1,
        purchasePrice: 0,
        sellingPrice: 0,
      });
    }
  };

  const removeProduct = (indexToRemove) => {
    setProducts(products.filter((_, index) => index !== indexToRemove));
  };

  const createInvoice = async () => {
    const finalTotal = calculatedTotal;

    if (payedAmount > finalTotal) {
      toast.error("Payed amount should not be greater than total amount");
      return;
    }

    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!products || products.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (isNaN(finalTotal) || finalTotal <= 0) {
      toast.error("Total amount must be a valid positive number");
      return;
    }

    // Include payment information in the payload
    const payload = {
      vat: vatRate,
      total: finalTotal,
      supplierId,
      products,
      date: selectedDate,
      bankAccount: selectedBank,
      payedAmount: parseFloat(payedAmount) || 0,
      balanceToPay: parseFloat(balanceToPay) || finalTotal,
    };

    try {
      setCreating(true);
      await createInvoices(payload);

      // Reset form and refresh data
      setProducts([]);
      setSupplierId("");
      setPayedAmount(0);
      setBalanceToPay(0);
      toast.success("New Invoice created");
      setShowForm(false);
      setSelectedDate(null);

      // Refresh invoices data
      const updated = await getInvoices({
        page: currentPage,
        search: debouncedSearchQuery,
        limit: 10,
      });

      setInvoices(updated.data.data);
      setTotalPages(updated.data.pagination.pages);
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveSupplier = async () => {
    const res = await createSupplier(newSupplier);
    const updated = await getSuppliers();
    setSuppliers(updated.data);
    setSupplierId(res.data._id); // Auto-select new
    setShowSupplierForm(false);
    setNewSupplier({ name: "", email: "", phone: "", address: "" });
  };

  const handleVatRateChange = (newRate) => {
    setVatRate(newRate);
  };
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseInvoiceModal = () => {
    setSelectedInvoice(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleCancelLPO = async (id) => {
    try {
      setCancelling(true);
      const response = await cancelLPO(id);
      if (response.data.success) {
        toast.success("LPO cancelled successfully");
        // Update the invoice in the list
        setInvoices(
          invoices.map((inv) => (inv._id === id ? response.data.data : inv))
        );

        // Refresh stats
        const statsRes = await getInvoiceStats({
          search: debouncedSearchQuery,
          dateFrom,
          dateTo,
          showUnpaid,
        });
        setStats(statsRes.data?.data);
      }
    } catch (error) {
      console.error("Error cancelling LPO:", error);
      toast.error(error.response?.data?.message || "Failed to cancel LPO");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="relative">
      <div className="max-w-8xl mx-auto p-6 relative z-10">
        <div className="flex justify-between">
          <header className="mb-8 flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-500">
                Purchase-Invoices
              </h1>
              <p className="text-blue-400 font-medium">
                Manage your inventory
              </p>
            </div>
          </header>
          <div className="flex space-x-3">
            <button
              className="px-4 h-10 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={16} />
              <span>{showForm ? "Hide" : "Create LPO"}</span>
            </button>
          </div>
        </div>

        <LPOFormModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          suppliers={suppliers}
          showSupplierForm={showSupplierForm}
          setShowSupplierForm={setShowSupplierForm}
          vatRate={vatRate}
          onVatRateChange={handleVatRateChange}
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
          newSupplier={newSupplier}
          setNewSupplier={setNewSupplier}
          onSaveSupplier={handleSaveSupplier}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          addProduct={addProduct}
          products={products}
          onRemoveProduct={removeProduct}
          payedAmount={payedAmount}
          setPayedAmount={setPayedAmount}
          balanceToPay={balanceToPay}
          setBalanceToPay={setBalanceToPay}
          setSelectedBank={setSelectedBank}
          isEditing={isEditing}
          handleUpdateLPO={handleUpdateLPO}
          createInvoice={createInvoice}
          creating={creating}
        />
        {/* Search bar */}

        <InvoiceStatsBar stats={stats} loading={loading} />
        
        <FilterSection
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          showUnpaid={showUnpaid}
          setShowUnpaid={setShowUnpaid}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          downloadPdf={downloadPdf}
          exportingPDF={exportingPDF}
          handleDownloadExcel={handleDownloadExcel}
          exportingExcel={exportingExcel}
          loading={loading}
          documentType={documentType}
          setDocumentType={setDocumentType}
        />


        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={
                  searchType === "invoice" ? "Search invoices" : "Search LPO"
                }
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Text Toggle with Arrow Indicator */}
            <div className="flex items-center gap-2">
              <span
                onClick={() => setSearchType("invoice")}
                className={`text-sm font-medium cursor-pointer transition ${
                  searchType === "invoice"
                    ? "text-white bg-blue-500 px-2 py-1 rounded"
                    : "text-gray-500"
                }`}
              >
                Invoice
              </span>

              {/* Arrow (visual only) */}
              {searchType === "invoice" ? (
                <ChevronRight className="h-5 w-5 text-blue-500" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-blue-500" />
              )}

              <span
                onClick={() => setSearchType("lpo")}
                className={`text-sm font-medium cursor-pointer transition ${
                  searchType === "lpo"
                    ? "text-white bg-blue-500 px-2 py-1 rounded"
                    : "text-gray-500"
                }`}
              >
                LPO
              </span>
            </div>
          </div>
        </div>

        {/* Invoice list with loading state */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg mb-6 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : invoices.length > 0 ? (
            <InvoiceList
              invoices={invoices}
              onViewInvoice={handleViewInvoice}
              onConvertToInvoice={handleConvertToInvoice}
              onEditLPO={handleEditLPO}
              onCancelLPO={handleCancelLPO}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              {debouncedSearchQuery
                ? "No invoices found matching your search."
                : "No invoices found. Create your first invoice!"}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="my-6"
          />
        )}

        {/* Invoice Detail Modal - now at root level */}
        {selectedInvoice && (
          <InvoiceDetailModal
            invoice={selectedInvoice}
            onClose={handleCloseInvoiceModal}
            onUpdate={onUpdate}
          />
        )}
        {showConvertModal && (
          <ConvertToInvoiceModal
            isOpen={showConvertModal}
            onClose={handleCloseConvertModal}
            invoice={invoiceToConvert}
            onConvert={handleConvertSubmit}
            loading={converting}
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseInvoices;
