import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import {
  fetchAllInvoices,
  fetchInvDetails,
  fetchInvoiceStats,
  repayInvoices,
  updateInvoiceExpDate,
  downloadInvoices,
  createInvoiceDirectly,
  updateInvoice,
} from "../service/invoicesService";
import { fetchBanks } from "../service/bankService";
import { handleDownloadPDF } from "../components/Invoice_comp/DownloadInvoice";
import useDebounce from "./useDebounce";

export const useInvoiceLogic = () => {
  // View state
  const [view, setView] = useState("list");

  // Invoice list states
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const [isFullPayment, setIsFullPayment] = useState(true);
  const [banks, setBanks] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [printingInvoices, setPrintingInvoices] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Invoice creation states
  const [selectedCustomerForInvoice, setSelectedCustomerForInvoice] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCredits, setSelectedCredits] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [lpo, setLpo] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [vatRate, setVatRate] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentItemForNote, setCurrentItemForNote] = useState(null);
  const [noteType, setNoteType] = useState("");

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showPaymentClearedOnly, setShowPaymentClearedOnly] = useState(false);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showCancelledOnly, setShowCancelledOnly] = useState(false);
  // Server-side sort order: 'newest' or 'oldest'
  const [sortOrder, setSortOrder] = useState('newest');

  // Invoice stats
  const [invoiceStats, setInvoiceStats] = useState({
    totalOutstanding: 0,
    overdueAmount: 0,
    totalPaymentsReceived: 0,
    totalInvoicesCount: 0,
    paidInvoicesCount: 0,
    dueCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Edit states
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [itemType, setItemType] = useState('service');
  const [emptyRows, setEmptyRows] = useState([
    { id: uuidv4(), searchTerm: "", type: 'service' },
  ]);
  const [creationOrder, setCreationOrder] = useState([]);

  // Modal states
  const [isUpdateExpDateModalOpen, setIsUpdateExpDateModalOpen] = useState(false);
  const [invoiceToUpdateExpDate, setInvoiceToUpdateExpDate] = useState(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] = useState(null);
  const [pendingRowId, setPendingRowId] = useState(null);

  // Refs
  const noteInputRefs = useRef({});

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Utility functions
  const isExpired = (dateString) => {
    const expDate = new Date(dateString);
    expDate.setHours(23, 59, 59, 999);
    const today = new Date();
    return expDate < today;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUniqueKey = () => uuidv4();

  const calculateTotal = () => {
    const productTotal = selectedProducts.reduce(
      (sum, product) => sum + product.sellingPrice * product.quantity,
      0
    );
    const serviceTotal = selectedServices.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0
    );
    const creditTotal = selectedCredits.reduce(
      (sum, credit) => sum + (credit.amount || 0),
      0
    );
    
    // Return gross amount minus credits (same logic as in handleCreateInvoice)
    return (productTotal + serviceTotal) - creditTotal;
  };

  // Helper function for Excel download
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

  // Effects
  useEffect(() => {
    fetchStats();
  }, [selectedCustomer]);

  useEffect(() => {
    fetchInvoices();
    loadBanks();
  }, [
    debouncedSearchTerm,
    currentPage,
    startDate,
    endDate,
    showOverdueOnly,
    showPaymentClearedOnly,
    showPendingOnly,
    showCancelledOnly,
    sortOrder,
    selectedCustomer,
  ]);

  useEffect(() => {
    if (!isUpdateExpDateModalOpen) {
      fetchStats();
    }
  }, [isUpdateExpDateModalOpen]);

  useEffect(() => {
    if (!isRepaymentModalOpen && selectedInvoices.length === 0) {
      fetchStats();
    }
  }, [isRepaymentModalOpen, selectedInvoices]);

  // API functions
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const customerId = selectedCustomer?._id || "";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      
      const response = await fetchInvoiceStats({ 
        customerId,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      const data = await response.data;

      if (data.success) {
        setInvoiceStats(data.stats);
      } else {
        console.error("Failed to fetch invoice stats:", data.message);
        setInvoiceStats({
          totalOutstanding: 0,
          overdueAmount: 0,
          totalPaymentsReceived: 0,
          totalInvoicesCount: 0,
          paidInvoicesCount: 0,
          dueCount: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      
      if (error.name !== 'AbortError' && error.code !== 'ECONNABORTED') {
        toast.error("Failed to load statistics. Using default values.", {
          duration: 3000,
          position: 'top-right'
        });
      } else {
        toast.error("Statistics are taking longer to load. Please try refreshing the page.", {
          duration: 5000,
          position: 'top-right'
        });
      }
      
      setInvoiceStats({
        totalOutstanding: 0,
        overdueAmount: 0,
        totalPaymentsReceived: 0,
        totalInvoicesCount: 0,
        paidInvoicesCount: 0,
        dueCount: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetchAllInvoices({
        currentPage,
        limit,
        debouncedSearchTerm,
        startDate,
        endDate,
        overdueOnly: showOverdueOnly,
        paymentClearedOnly: showPaymentClearedOnly,
        pendingOnly: showPendingOnly,
        cancelledOnly: showCancelledOnly,
        sort: sortOrder,
        customerId: selectedCustomer?._id || "",
      });
      const data = await response?.data;

      if (data.success) {
        setInvoices(data.invoices);
        setTotalPages(data.totalPages);
      } else {
        console.error("Failed to fetch invoices:", data.message);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBanks = async () => {
    try {
      const response = await fetchBanks();
      const data = await response.data;
      setBanks(data);
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast.error(error.response?.data?.message || "Failed to fetch banks");
    }
  };

  // Excel download function
  const handleDownloadExcel = async () => {
    try {
      setExportingExcel(true);
      const response = await downloadInvoices({
        debouncedSearchTerm,
        startDate,
        endDate,
        overdueOnly: showOverdueOnly,
        paymentClearedOnly: showPaymentClearedOnly,
        pendingOnly: showPendingOnly,
        cancelledOnly: showCancelledOnly,
        sort: sortOrder,
        customerId: selectedCustomer?._id || "",
      });

      if (!response.data || !response.data.invoices) {
        toast.error("Failed to retrieve invoice data");
        return;
      }

      const { invoices } = response.data;
      const stats = invoiceStats || {};

      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Format data for Excel
      const worksheetData = invoices.map((inv) => ({
        "Invoice Number": inv.name || "N/A",
        "LPO": inv.lpo || "N/A",
        "Customer Name": inv.salesOrderId?.customer?.name || inv.customer?.name || "N/A",
        "Invoice Date": formatDate(inv?.date || inv?.createdAt),
        "Last Updated": formatDate(inv?.updatedAt),
        "Expiry Date": formatDate(inv?.expDate),
        "Days Overdue":
          inv.expDate && isExpired(inv.expDate)
            ? Math.floor((new Date() - new Date(inv.expDate)) / (1000 * 60 * 60 * 24))
            : 0,
        "Net Amount": (inv.netAmount || 0).toFixed(2),
        "VAT Amount": (inv.vatAmount || 0).toFixed(2),
        "Discount": (inv.discount || 0).toFixed(2),
        "Total Amount": (inv.totalAmount || 0).toFixed(2),
        "Amount Paid": ((inv.totalAmount || 0) - (inv.balanceToReceive || 0)).toFixed(2),
        "Balance Due": (inv.balanceToReceive || 0).toFixed(2),
        "Payment Status": inv.isPaymentCleared ? "Fully Paid" : "Pending",
        "Status":
          inv.isPaymentCleared
            ? "Fully Paid"
            : isExpired(inv.expDate)
            ? "Overdue"
            : "Pending",
        "Description": inv.description || "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const columnWidths = [
        { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 30 },
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

      // Add products worksheet
      const productsData = [];
      invoices.forEach(inv => {
        if (inv.products && inv.products.length > 0) {
          inv.products.forEach(product => {
            productsData.push({
              "Invoice Number": inv.name || "N/A",
              "Customer Name": inv.salesOrderId?.customer?.name || inv.customer?.name || "N/A",
              "Product Name": product.product?.name || "N/A",
              "Product Code": product.product?.code || "N/A",
              "Quantity": product.quantity || 0,
              "Unit Price": (product.price || 0).toFixed(2),
              "Total Price": ((product.quantity || 0) * (product.price || 0)).toFixed(2),
              "Purchase Price": (product.purchasePrice || 0).toFixed(2),
              "Profit": (((product.price || 0) - (product.purchasePrice || 0)) * (product.quantity || 0)).toFixed(2),
              "Notes": product.note || "N/A",
              "Batch ID": product.batchId || "N/A",
            });
          });
        }
      });

      if (productsData.length > 0) {
        const productsWorksheet = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(workbook, productsWorksheet, "Products");
      }

      // Add services worksheet
      const servicesData = [];
      invoices.forEach(inv => {
        if (inv.services && inv.services.length > 0) {
          inv.services.forEach(service => {
            servicesData.push({
              "Invoice Number": inv.name || "N/A",
              "Customer Name": inv.salesOrderId?.customer?.name || inv.customer?.name || "N/A",
              "Service Name": service.service?.name || "N/A",
              "Service Code": service.service?.code || "N/A",
              "Quantity": service.quantity || 0,
              "Unit Price": (service.price || 0).toFixed(2),
              "Total Price": ((service.quantity || 0) * (service.price || 0)).toFixed(2),
              "Notes": service.note || "N/A",
            });
          });
        }
      });

      if (servicesData.length > 0) {
        const servicesWorksheet = XLSX.utils.json_to_sheet(servicesData);
        XLSX.utils.book_append_sheet(workbook, servicesWorksheet, "Services");
      }

      // Add summary worksheet
      const summaryData = [
        { Metric: "Total Outstanding", Value: (stats.totalOutstanding || 0).toFixed(2), Currency: "AED" },
        { Metric: "Overdue Amount", Value: (stats.overdueAmount || 0).toFixed(2), Currency: "AED" },
        { Metric: "Total Received", Value: (stats.totalPaymentsReceived || 0).toFixed(2), Currency: "AED" },
        { Metric: "Fully Paid Invoices", Value: stats.paidInvoicesCount || 0, Currency: "Count" },
        { Metric: "Total Invoices", Value: stats.totalInvoicesCount || 0, Currency: "Count" },
        { Metric: "Payment Completion Rate", Value: (stats.paymentCompletionRate || 0) + "%", Currency: "Percentage" },
        { Metric: "Overdue Invoices", Value: stats.dueCount || 0, Currency: "Count" },
        { Metric: "Pending Invoices", Value: stats.pendingCount || 0, Currency: "Count" },
        { Metric: "Avg. Days to Payment", Value: (stats.averageDaysToPayment || 0) + " days", Currency: "Days" },
        { Metric: "Report Generated On", Value: new Date().toLocaleString(), Currency: "DateTime" },
        { Metric: "Filter Applied", Value: getActiveFiltersText(), Currency: "Text" },
        { Metric: "Total Records Exported", Value: invoices.length, Currency: "Count" },
      ];

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `Invoice_Report_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);
      toast.success("Excel report downloaded successfully");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to download Excel report: " + (err.message || "Unknown error"));
    } finally {
      setExportingExcel(false);
    }
  };

  // PDF download function
  const downloadPdf = async () => {
    await handleDownloadPDF({
      setExportingPDF,
      debouncedSearchTerm,
      startDate,
      endDate,
      showOverdueOnly,
      showPaymentClearedOnly,
      showPendingOnly,
      showCancelledOnly,
      selectedCustomer,
      sortOrder,
      isExpired,
    });
  };

  // Return all state and functions
  return {
    // States
    view, setView,
    invoices, setInvoices,
    loading, setLoading,
    searchTerm, setSearchTerm,
    selectedInvoice, setSelectedInvoice,
    currentPage, setCurrentPage,
    totalPages, setTotalPages,
    limit,
    isModalOpen, setIsModalOpen,
    selectedInvoices, setSelectedInvoices,
    isRepaymentModalOpen, setIsRepaymentModalOpen,
    isFullPayment, setIsFullPayment,
    banks, setBanks,
    selectedCustomer, setSelectedCustomer,
    exportingPDF, setExportingPDF,
    printingInvoices, setPrintingInvoices,
    exportingExcel, setExportingExcel,
  selectedCustomerForInvoice, setSelectedCustomerForInvoice,
  selectedProducts, setSelectedProducts,
  selectedServices, setSelectedServices,
  selectedCredits, setSelectedCredits,
  invoiceDate, setInvoiceDate,
  lpo, setLpo,
  description, setDescription,
    error, setError,
    vatRate, setVatRate,
    discount, setDiscount,
    isConfirmModalOpen, setIsConfirmModalOpen,
    noteModalOpen, setNoteModalOpen,
    currentItemForNote, setCurrentItemForNote,
    noteType, setNoteType,
    startDate, setStartDate,
    endDate, setEndDate,
    showOverdueOnly, setShowOverdueOnly,
    showPaymentClearedOnly, setShowPaymentClearedOnly,
    showPendingOnly, setShowPendingOnly,
    showCancelledOnly, setShowCancelledOnly,
    invoiceStats, setInvoiceStats,
    statsLoading, setStatsLoading,
    editingInvoice, setEditingInvoice,
    isEditMode, setIsEditMode,
    itemType, setItemType,
    emptyRows, setEmptyRows,
    creationOrder, setCreationOrder,
    isUpdateExpDateModalOpen, setIsUpdateExpDateModalOpen,
    invoiceToUpdateExpDate, setInvoiceToUpdateExpDate,
    batchModalOpen, setBatchModalOpen,
    selectedProductForBatch, setSelectedProductForBatch,
    pendingRowId, setPendingRowId,
    noteInputRefs,
    debouncedSearchTerm,
  sortOrder, setSortOrder,

    // Functions
    isExpired,
    formatDate,
    getUniqueKey,
    calculateTotal,
    getActiveFiltersText,
    fetchStats,
    fetchInvoices,
    loadBanks,
    handleDownloadExcel,
    downloadPdf,
  };
};