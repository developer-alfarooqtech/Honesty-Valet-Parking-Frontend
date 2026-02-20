import { useState, useEffect, useRef, useMemo } from "react";
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
import { downloadCreditNotes } from "../service/creditNoteService";
import { fetchBanks } from "../service/bankService";
import { downloadInvoicesAsPDF } from "../components/Invoice_comp/DownloadSelectedInvoices";
import useDebounce from "./useDebounce";

export const useInvoiceLogic = () => {
  // View state
  const [view, setView] = useState("list");

  // Invoice list states
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lpoSearchTerm, setLpoSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const [isFullPayment, setIsFullPayment] = useState(true);
  const [banks, setBanks] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [printingInvoices, setPrintingInvoices] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importingInvoices, setImportingInvoices] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importSummary, setImportSummary] = useState(null);

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
  const [lpoFilter, setLpoFilter] = useState('all'); // 'all', 'with', 'without'
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
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  const [duplicateSourceInvoice, setDuplicateSourceInvoice] = useState(null);

  // Form states
  const [itemType, setItemType] = useState('service');
  const [emptyRows, setEmptyRows] = useState([
    { id: uuidv4(), searchTerm: "", type: null, insertAfterKey: null },
  ]);
  const [inlineInsert, setInlineInsert] = useState(null);
  const [creationOrder, setCreationOrder] = useState([]);

  // Modal states
  const [isUpdateExpDateModalOpen, setIsUpdateExpDateModalOpen] = useState(false);
  const [invoiceToUpdateExpDate, setInvoiceToUpdateExpDate] = useState(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] = useState(null);
  const [pendingRowId, setPendingRowId] = useState(null);
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);

  // Refs
  const noteInputRefs = useRef({});

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedLpoSearchTerm = useDebounce(lpoSearchTerm, 500);

  const duplicateGuard = useMemo(() => {
    if (!isDuplicateMode || !duplicateSourceInvoice) {
      return { isReady: true, missingFields: [] };
    }

    const missingFields = [];
    const normalizedLpo = (lpo || "").trim();
    const originalLpo = (duplicateSourceInvoice.lpo || "").trim();

    if (!normalizedLpo) {
      missingFields.push("LPO / Reference");
    } else if (normalizedLpo === originalLpo) {
      missingFields.push("New LPO / Reference");
    }

    return {
      isReady: missingFields.length === 0,
      missingFields,
    };
  }, [isDuplicateMode, duplicateSourceInvoice, lpo]);

  // Utility functions
  const isExpired = (dateString) => {
    const expDate = new Date(dateString);
    expDate.setHours(23, 59, 59, 999);
    const today = new Date();
    return expDate < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
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

  const selectedCustomerIds = useMemo(
    () => selectedCustomers.map((customer) => customer?._id).filter(Boolean),
    [selectedCustomers]
  );

  // Helper function for Excel download
  const getActiveFiltersText = () => {
    const filters = [];
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    if (lpoSearchTerm) filters.push(`LPO: "${lpoSearchTerm}"`);
    if (selectedCustomers.length > 0) {
      const names = selectedCustomers.map((cust) => cust.name).join(", ");
      filters.push(`Customers: ${names}`);
    } else if (selectedCustomer) {
      filters.push(`Customer: ${selectedCustomer.name}`);
    }
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
  }, [selectedCustomer, selectedCustomers]);

  useEffect(() => {
    fetchInvoices();
    loadBanks();
  }, [
    debouncedSearchTerm,
    debouncedLpoSearchTerm,
    currentPage,
    startDate,
    endDate,
    showOverdueOnly,
    showPaymentClearedOnly,
    showPendingOnly,
    showCancelledOnly,
    lpoFilter,
    sortOrder,
    selectedCustomer,
    selectedCustomers,
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
      const customerId = selectedCustomerIds.length === 0 ? selectedCustomer?._id || "" : "";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetchInvoiceStats({
        customerId,
        customerIds: selectedCustomerIds,
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
        debouncedLpoSearchTerm,
        startDate,
        endDate,
        overdueOnly: showOverdueOnly,
        paymentClearedOnly: showPaymentClearedOnly,
        pendingOnly: showPendingOnly,
        cancelledOnly: showCancelledOnly,
        sort: sortOrder,
        customerId: selectedCustomerIds.length === 0 ? selectedCustomer?._id || "" : "",
        customerIds: selectedCustomerIds,
        withLpoOnly: lpoFilter === 'with',
        withoutLpoOnly: lpoFilter === 'without',
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
        debouncedLpoSearchTerm,
        startDate,
        endDate,
        overdueOnly: showOverdueOnly,
        paymentClearedOnly: showPaymentClearedOnly,
        pendingOnly: showPendingOnly,
        cancelledOnly: showCancelledOnly,
        sort: sortOrder,
        customerId: selectedCustomerIds.length === 0 ? selectedCustomer?._id || "" : "",
        customerIds: selectedCustomerIds,
        withLpoOnly: lpoFilter === 'with',
        withoutLpoOnly: lpoFilter === 'without',
      });

      if (!response.data || !response.data.invoices) {
        toast.error("Failed to retrieve invoice data");
        return;
      }

      const { invoices } = response.data;
      const stats = invoiceStats || {};

      // Fetch pending credit notes if downloading pending invoices
      let creditNotes = [];
      if (showPendingOnly) {
        try {
          const creditNoteResponse = await downloadCreditNotes({
            debouncedSearchTerm,
            debouncedLpoSearchTerm,
            startDate,
            endDate,
            showProcessedOnly: false,
            showPendingOnly: true,
            showCancelledOnly: false,
            customerId: selectedCustomerIds.length === 0 ? selectedCustomer?._id || "" : "",
            creditTypeFilter: "all",
          });
          if (creditNoteResponse.data && creditNoteResponse.data.data) {
            creditNotes = creditNoteResponse.data.data;
          }
          console.log("Fetched credit notes:", creditNotes.length);
        } catch (error) {
          console.error("Error fetching credit notes:", error);
          // Continue with just invoices if credit notes fail
        }
      }

      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Flatten invoices with their products/services into one sheet (item titles combined per invoice)
      const worksheetData = [];
      const formatMoney = (value = 0) => (value || 0).toFixed(2);

      invoices.forEach((inv) => {
        const baseInfo = {
          "Invoice Number": inv.name || "N/A",
          "LPO": inv.lpo || "N/A",
          "Customer Name": inv.salesOrderId?.customer?.name || inv.customer?.name || "N/A",
          "Customer Code": inv.salesOrderId?.customer?.Code || inv.customer?.Code || "N/A",
          "Invoice Date": formatDate(inv?.date || inv?.createdAt),
          "Last Updated": formatDate(inv?.updatedAt),
          "Expiry Date": formatDate(inv?.expDate),
          "Days Overdue":
            inv.expDate && isExpired(inv.expDate)
              ? Math.floor((new Date() - new Date(inv.expDate)) / (1000 * 60 * 60 * 24))
              : 0,
        };

        const products = inv.products || [];
        const services = inv.services || [];
        const credits = inv.credits || [];

        const allItems = [
          ...products.map((p) => ({
            type: "Product",
            name: p?.product?.name || "N/A",
            code: p?.product?.code || "",
            quantity: p.quantity ?? 0,
            unitPrice: formatMoney(p.price),
            totalPrice: formatMoney((p.quantity || 0) * (p.price || 0)),
            note: [p.note, p.additionalNote].filter((n) => n && n.trim()).join(" | "),
            batchId: p.batchId || "",
          })),
          ...services.map((s) => ({
            type: "Service",
            name: s?.service?.name || "N/A",
            code: s?.service?.code || "",
            quantity: s.quantity ?? 0,
            unitPrice: formatMoney(s.price),
            totalPrice: formatMoney((s.quantity || 0) * (s.price || 0)),
            note: [s.note, s.additionalNote].filter((n) => n && n.trim()).join(" | "),
            batchId: "",
          })),
          ...credits.map((c) => ({
            type: "Credit",
            name: c.title || "Credit",
            code: "",
            quantity: 1,
            unitPrice: formatMoney(-Math.abs(c.amount || 0)),
            totalPrice: formatMoney(-Math.abs(c.amount || 0)),
            note: [c.note, c.additionalNote].filter((n) => n && n.trim()).join(" | "),
            batchId: "",
          })),
        ];

        const combineValues = (selector) => {
          const values = allItems
            .map(selector)
            .filter((value) => value !== undefined && value !== null && `${value}`.trim() !== "");
          return values.length ? values.join(", ") : "N/A";
        };

        // Get only the first service note (for pending reports only)
        const getFirstServiceNote = () => {
          if (services.length > 0) {
            const firstService = services[0];
            const note = [firstService.note, firstService.additionalNote]
              .filter((n) => n && n.trim())
              .join(" | ");
            return note || "N/A";
          }
          return "N/A";
        };

        // Determine which note to use based on whether it's a pending report
        const getItemNote = () => {
          if (showPendingOnly) {
            // For pending reports, only show first service note
            return getFirstServiceNote();
          } else {
            // For other reports, show all combined notes
            return combineValues((item) => item.note);
          }
        };

        // Show quantities only (e.g., "54, 75") instead of repeating item names
        const quantitySummary = allItems
          .map((item) => item.quantity ?? 0)
          .map((qty) => `${qty}`.trim())
          .filter((qty) => qty !== "")
          .join(", ");

        if (allItems.length === 0) {
          worksheetData.push({
            Type: "Invoice",
            "Invoice Number": baseInfo["Invoice Number"],
            "LPO": baseInfo["LPO"],
            "Customer Name": baseInfo["Customer Name"],
            "Customer Code": baseInfo["Customer Code"],
            "Invoice Date": baseInfo["Invoice Date"],
            "Last Updated": baseInfo["Last Updated"],
            "Expiry Date": baseInfo["Expiry Date"],
            "Days Overdue": baseInfo["Days Overdue"],
            "Item Note": "N/A",
            "Item Code": "N/A",
            "Quantity": "N/A",
            "Unit Price": "N/A",
            "Net Amount": formatMoney(inv.netAmount),
            "VAT Amount": formatMoney(inv.vatAmount),
            "Discount": formatMoney(inv.discount),
            "Total Amount": formatMoney(inv.totalAmount),
            "Amount Paid": formatMoney((inv.totalAmount || 0) - (inv.balanceToReceive || 0)),
            "Balance Due": formatMoney(inv.balanceToReceive),
            "Payment Status": inv.isPaymentCleared ? "Fully Paid" : "Pending",
            "Status":
              inv.isPaymentCleared
                ? "Fully Paid"
                : isExpired(inv.expDate)
                  ? "Overdue"
                  : "Pending",
          });
          return;
        }

        worksheetData.push({
          Type: "Invoice",
          "Invoice Number": inv.name || "N/A",
          "LPO": inv.lpo || "N/A",
          "Customer Name": inv.salesOrderId?.customer?.name || inv.customer?.name || "N/A",
          "Customer Code": inv.salesOrderId?.customer?.Code || inv.customer?.Code || "N/A",
          "Invoice Date": formatDate(inv?.date || inv?.createdAt),
          "Last Updated": formatDate(inv?.updatedAt),
          "Expiry Date": formatDate(inv?.expDate),
          "Days Overdue":
            inv.expDate && isExpired(inv.expDate)
              ? Math.floor((new Date() - new Date(inv.expDate)) / (1000 * 60 * 60 * 24))
              : 0,
          "Item Note": getItemNote(),
          "Item Code": combineValues((item) => item.code),
          "Quantity": quantitySummary || "N/A",
          "Unit Price": combineValues((item) => item.unitPrice),
          "Net Amount": formatMoney(inv.netAmount),
          "VAT Amount": formatMoney(inv.vatAmount),
          "Discount": formatMoney(inv.discount),
          "Total Amount": formatMoney(inv.totalAmount),
          "Amount Paid": formatMoney((inv.totalAmount || 0) - (inv.balanceToReceive || 0)),
          "Balance Due": formatMoney(inv.balanceToReceive),
          "Payment Status": inv.isPaymentCleared ? "Fully Paid" : "Pending",
          "Status":
            inv.isPaymentCleared
              ? "Fully Paid"
              : isExpired(inv.expDate)
                ? "Overdue"
                : "Pending",
        });
      });

      // Add credit notes to the worksheet if downloading pending report
      if (showPendingOnly && creditNotes.length > 0) {
        creditNotes.forEach((cn) => {
          const items = cn.items || [];
          const itemNotes = items.length > 0
            ? items.map(item => {
              const itemName = item.name || item.product?.name || item.service?.name || "";
              const itemNote = item.note || "";
              if (itemName && itemNote) {
                return `${itemName}: ${itemNote}`;
              } else if (itemName) {
                return itemName;
              } else if (itemNote) {
                return itemNote;
              }
              return "";
            }).filter(n => n && n.trim()).join(", ")
            : "N/A";
          const itemCodes = items.length > 0
            ? items.map(item => item.product?.code || item.service?.code || "").filter(c => c).join(", ")
            : "N/A";
          const quantities = items.length > 0
            ? items.map(item => item.creditedQuantity || 0).join(", ")
            : "N/A";

          worksheetData.push({
            Type: "Credit Note",
            "Invoice Number": cn.creditNoteNumber || "N/A",
            "LPO": "N/A",
            "Customer Name": cn.customer?.name || "N/A",
            "Customer Code": cn.customer?.Code || "N/A",
            "Invoice Date": formatDate(cn?.date),
            "Last Updated": formatDate(cn?.updatedAt),
            "Expiry Date": "N/A",
            "Days Overdue": 0,
            "Item Note": itemNotes,
            "Item Code": itemCodes,
            "Quantity": quantities,
            "Unit Price": "N/A",
            "Net Amount": formatMoney(cn.netAmount),
            "VAT Amount": formatMoney(cn.vatAmount),
            "Discount": formatMoney(cn.discount),
            "Total Amount": formatMoney(-Math.abs(cn.creditAmount)),
            "Amount Paid": formatMoney(-Math.abs(cn.creditAmount - cn.remainingBalance)),
            "Balance Due": formatMoney(-Math.abs(cn.remainingBalance)),
            "Payment Status": cn.status === 'processed' ? "Processed" : "Pending",
            "Status": cn.status === 'cancelled' ? "Cancelled" : cn.status === 'processed' ? "Processed" : "Pending",
          });
        });
      }

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const columnWidths = [
        { wch: 12 }, // Type
        { wch: 15 }, // Invoice Number
        { wch: 12 }, // LPO
        { wch: 22 }, // Customer Name
        { wch: 14 }, // Customer Code
        { wch: 12 }, // Invoice Date
        { wch: 12 }, // Last Updated
        { wch: 12 }, // Expiry Date
        { wch: 12 }, // Days Overdue
        { wch: 22 }, // Item Note
        { wch: 14 }, // Item Code
        { wch: 10 }, // Quantity
        { wch: 12 }, // Unit Price
        { wch: 12 }, // Net Amount
        { wch: 12 }, // VAT Amount
        { wch: 10 }, // Discount
        { wch: 12 }, // Total Amount
        { wch: 12 }, // Amount Paid
        { wch: 12 }, // Balance Due
        { wch: 14 }, // Payment Status
        { wch: 10 }, // Status
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
              "Product Note": [product.note, product.additionalNote].filter(n => n && n.trim()).join(" | ") || "N/A",
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
              "Service Note": [service.note, service.additionalNote].filter(n => n && n.trim()).join(" | ") || "N/A",
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
    try {
      setExportingPDF(true);

      // Fetch invoices with current filters
      const response = await downloadInvoices({
        debouncedSearchTerm,
        debouncedLpoSearchTerm,
        startDate,
        endDate,
        overdueOnly: showOverdueOnly,
        paymentClearedOnly: showPaymentClearedOnly,
        sort: sortOrder,
        customerId: selectedCustomerIds.length === 0 ? selectedCustomer?._id || "" : "",
        customerIds: selectedCustomerIds,
        pendingOnly: showPendingOnly,
        cancelledOnly: showCancelledOnly,
      });

      let invoicesData = response.data.invoices || [];

      if (invoicesData.length === 0) {
        toast.error("No invoices found with current filters");
        return;
      }

      // Fetch full details for each invoice to get populated products/services
      console.log("Fetching details for", invoicesData.length, "invoices...");
      const detailedInvoices = await Promise.all(
        invoicesData.map(async (invoice) => {
          try {
            const detailResponse = await fetchInvDetails(invoice._id);
            return detailResponse.data.invoice || invoice;
          } catch (err) {
            console.error(`Failed to fetch details for invoice ${invoice._id}:`, err);
            return invoice; // Fallback to original invoice if details fetch fails
          }
        })
      );

      console.log("Sample detailed invoice:", detailedInvoices[0]);

      // Generate PDF using the new component
      await downloadInvoicesAsPDF(detailedInvoices, setExportingPDF);

    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Failed to download PDF: " + (error.message || "Unknown error"));
    } finally {
      setExportingPDF(false);
    }
  };

  // Return all state and functions
  return {
    // States
    view, setView,
    invoices, setInvoices,
    loading, setLoading,
    searchTerm, setSearchTerm,
    lpoSearchTerm, setLpoSearchTerm,
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
    selectedCustomers, setSelectedCustomers,
    isCustomerPickerOpen, setIsCustomerPickerOpen,
    exportingPDF, setExportingPDF,
    printingInvoices, setPrintingInvoices,
    exportingExcel, setExportingExcel,
    isImportModalOpen, setIsImportModalOpen,
    importingInvoices, setImportingInvoices,
    importProgress, setImportProgress,
    importSummary, setImportSummary,
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
    lpoFilter, setLpoFilter,
    invoiceStats, setInvoiceStats,
    statsLoading, setStatsLoading,
    editingInvoice, setEditingInvoice,
    isEditMode, setIsEditMode,
    isDuplicateMode, setIsDuplicateMode,
    duplicateSourceInvoice, setDuplicateSourceInvoice,
    itemType, setItemType,
    emptyRows, setEmptyRows,
    inlineInsert, setInlineInsert,
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
    duplicateGuard,
  };
};