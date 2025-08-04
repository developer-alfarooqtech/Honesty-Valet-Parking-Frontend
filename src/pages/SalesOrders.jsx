import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  X,
  Trash2,
  MessageSquare,
  ListOrdered,
} from "lucide-react";
import CustomerSelector from "../components/SalesOrder_comp/CustomerSelector";
import InlineItemSelector from "../components/SalesOrder_comp/ItemSelector";
import OrdersList from "../components/SalesOrder_comp/OrdersList";
import OrderSummary from "../components/SalesOrder_comp/OrderSummary";
// import OrderIdSearch from "../components/SalesOrder_comp/OrderIdSearch";
// import ConfirmationModal from "../components/SalesOrder_comp/ConfirmationModal";

import {
  createSalesOrder,
  getSalesOrders,
  downloadSalesOrders,
  checkDuplicateOrderId,
  checkDuplicateLpo,
  // checkDuplicateSalesOrder,
} from "../service/salesOrderService";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";
import EditSalesOrder from "../components/SalesOrder_comp/EditSalesOrder";
import FilterSection from "../components/SalesOrder_comp/FilterSection";
import { handleDownloadPDF } from "../components/SalesOrder_comp/DownloadSalesOrders";
import { v4 as uuidv4 } from "uuid";
import DuplicateWarningModal from "../components/SalesOrder_comp/DuplicateWarningModal";
import ToggleSwitch from "../components/ToggleSwitch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const SalesOrders = () => {
  const [view, setView] = useState("list"); // 'list' or 'create'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lpo, setLpo] = useState("");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [vatRate, setVatRate] = useState(5); // Fixed 5% VAT rate
  const [discount, setDiscount] = useState(0);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [editOrderId, setEditOrderId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [invoiceNotCreated, setInvoiceNotCreated] = useState(false);
  const [orderIdChecked, setOrderIdChecked] = useState(false);
  const [lpoChecked, setLpoChecked] = useState(false);

  const [itemType, setItemType] = useState(false); // false for services, true for products
  const [emptyRows, setEmptyRows] = useState([
    { id: uuidv4(), searchTerm: "" },
  ]);

  const handleEmptyRowSearch = (rowId, searchTerm) => {
    setEmptyRows(
      emptyRows.map((row) => (row.id === rowId ? { ...row, searchTerm } : row))
    );
  };

  const handleEmptyRowItemSelect = (rowId, item) => {
    // Find the JC value from the empty row
    const row = emptyRows.find((r) => r.id === rowId);
    const jcValue = row && row.jc ? row.jc : "";
    if (itemType) {
      // Product selected
      handleProductSelect({ ...item, jc: jcValue });
    } else {
      // Service selected
      handleServiceSelect({ ...item, jc: jcValue });
    }

    // Remove the current row and add a new empty row
    setEmptyRows((prev) => [
      ...prev.filter((r) => r.id !== rowId),
      { id: uuidv4(), searchTerm: "" },
    ]);
  };

  const handleRemoveEmptyRow = (rowId) => {
    if (emptyRows.length > 1) {
      setEmptyRows(emptyRows.filter((row) => row.id !== rowId));
    }
  };

  const [duplicateModal, setDuplicateModal] = useState({
    isOpen: false,
    type: "", // 'orderid' or 'lpo'
    value: "",
    existingOrder: null,
  });
  // Use the debounce hook for search
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (view === "create") {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        const customerInput = document.querySelector("[data-customer-search]");
        if (customerInput) {
          customerInput.focus();
        }
      }, 100);
    }
  }, [view]);

  // Handle F4 key press to focus item selector
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F4" && view === "create") {
        event.preventDefault();
        const itemSelectorInput = document.querySelector("[data-item-search]");
        if (itemSelectorInput) {
          itemSelectorInput.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [view]);

  // Update the fetchOrders callback
  const fetchOrders = useCallback(
    async (page = 1, search = "") => {
      setLoading(true);
      try {
        const response = await getSalesOrders({
          page,
          limit: itemsPerPage,
          search,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          isInvCreated:
            invoiceCreated !== invoiceNotCreated
              ? invoiceCreated
                ? "true"
                : "false"
              : undefined,
        });

        const { orders, pagination } = response.data;
        setOrders(orders);
        setTotalPages(pagination.totalPages);
        setCurrentPage(pagination.currentPage);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, startDate, endDate, invoiceCreated, invoiceNotCreated]
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadPdf = async () => {
    await handleDownloadPDF({
      setExportingPDF,
      search: debouncedSearch,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      isInvCreated:
        invoiceCreated !== invoiceNotCreated
          ? invoiceCreated
            ? "true"
            : "false"
          : undefined,
    });
  };

  const handleDownloadExcel = async () => {
    try {
      setExportingExcel(true);
      // Get raw data for Excel generation
      const response = await downloadSalesOrders({
        search: debouncedSearch,
        startDate,
        endDate,
        isInvCreated:
          invoiceCreated !== invoiceNotCreated
            ? invoiceCreated
              ? "true"
              : "false"
            : undefined,
      });

      if (!response.data || !response.data.orders) {
        toast.error("Failed to retrieve invoice data");
        return;
      }

      const data = response.data.orders;

      // Create a workbook
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Format data for Excel
      const worksheetData = data.map((order) => ({
        "Work Order": order.OrderId || "N/A",
        LPO: order.lpo || "N/A",
        Date: formatDate(order.date || order.createdAt) || "N/A",
        Custimer: order.customer.Code || "N/A",
        Total: order.total.toFixed(2),
        Status: order.isInvCreated
          ? "Invoiced"
          : order.isCancelled
          ? "Cancelled"
          : "Active",
      }));

      // Create worksheet with invoice data
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

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

  const checkOrderIdDuplicate = async (value) => {
    if (!value || value.trim() === "") {
      setOrderIdChecked(false);
      return;
    }

    try {
      const response = await checkDuplicateOrderId(value.trim());
      if (response.data.exists) {
        setDuplicateModal({
          isOpen: true,
          type: "orderid",
          value: value.trim(),
          existingOrder: response.data.order,
        });
      } else {
        setOrderIdChecked(true);
      }
    } catch (error) {
      console.error("Error checking duplicate order ID:", error);
    }
  };

  const checkLpoDuplicate = async (value) => {
    if (!value || value.trim() === "") {
      setLpoChecked(false);
      return;
    }

    try {
      const response = await checkDuplicateLpo(value.trim());
      if (response.data.exists) {
        setDuplicateModal({
          isOpen: true,
          type: "lpo",
          value: value.trim(),
          existingOrder: response.data.order,
        });
      } else {
        setLpoChecked(true);
      }
    } catch (error) {
      console.error("Error checking duplicate LPO:", error);
    }
  };

  const debouncedOrderId = useDebounce(orderId, 800);
  const debouncedLpo = useDebounce(lpo, 800);

  useEffect(() => {
    if (debouncedOrderId && view === "create") {
      checkOrderIdDuplicate(debouncedOrderId);
    }
  }, [debouncedOrderId, view]);

  useEffect(() => {
    if (debouncedLpo && view === "create") {
      checkLpoDuplicate(debouncedLpo);
    }
  }, [debouncedLpo, view]);

  // Add a function to apply filters
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchOrders(1, debouncedSearch);
  };
  useEffect(() => {
    if (view === "list") {
      setCurrentPage(1);
      fetchOrders(1, debouncedSearch);
    }
  }, [view, debouncedSearch, fetchOrders]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrders(page, debouncedSearch);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleEditOrder = (orderId) => {
    setEditOrderId(orderId);
    setView("edit"); // Add a new view state "edit"
  };

  const handleEditSuccess = () => {
    setEditOrderId(null);
    setView("list");
    fetchOrders(); // Refresh the orders list
  };

  const handleProductSelect = (product) => {
    const newKey = getUniqueKey();
    setSelectedProducts((prev) => {
      const updated = [
        ...prev,
        {
          ...product,
          quantity: product.quantity || 1,
          note: product.name || "",
          selectedBatch: product.selectedBatch,
          purchasePrice: product.purchasePrice || 0,
          vin: "",
          jc: product.jc || "", // Use the JC value from the product
          _selectedKey: newKey, // Unique key for this selection
        },
      ];
      setTimeout(() => {
        const noteInput = document.querySelector(
          `input[data-note-key='${newKey}']`
        );
        if (noteInput) noteInput.focus();
        // Scroll the note input into view for better keyboard workflow
        if (noteInput && typeof noteInput.scrollIntoView === "function") {
          noteInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return updated;
    });
  };

  const handleProductQuantityChange = (selectedKey, quantity) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p._selectedKey === selectedKey
          ? { ...p, quantity: parseInt(quantity) || 0 }
          : p
      )
    );
  };

  const handleProductPriceChange = (selectedKey, price) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p._selectedKey === selectedKey
          ? { ...p, sellingPrice: parseFloat(price) || 0 }
          : p
      )
    );
  };

  const handleRemoveProduct = (selectedKey) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p._selectedKey !== selectedKey)
    );
  };

  const handleProductNoteChange = (selectedKey, note) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p._selectedKey === selectedKey ? { ...p, note } : p
      )
    );
  };

  // Service handlers
  const handleServiceSelect = (service) => {
    const newKey = getUniqueKey();
    setSelectedServices((prev) => {
      const updated = [
        ...prev,
        {
          ...service,
          quantity: 1,
          note: service.name || "",
          vin: "",
          jc: service.jc || "", // Use the JC value from the service
          _selectedKey: newKey,
        },
      ];
      setTimeout(() => {
        const noteInput = document.querySelector(
          `input[data-note-key='${newKey}']`
        );
        if (noteInput) noteInput.focus();
        // Scroll the note input into view for better keyboard workflow
        if (noteInput && typeof noteInput.scrollIntoView === "function") {
          noteInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return updated;
    });
  };

  const handleServiceQuantityChange = (selectedKey, quantity) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s._selectedKey === selectedKey
          ? { ...s, quantity: parseInt(quantity) || 0 }
          : s
      )
    );
  };

  const handleServicePriceChange = (selectedKey, value) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s._selectedKey === selectedKey
          ? { ...s, price: parseFloat(value) || 0 }
          : s
      )
    );
  };

  const handleRemoveService = (selectedKey) => {
    setSelectedServices(
      selectedServices.filter((s) => s._selectedKey !== selectedKey)
    );
  };

  const handleServiceNoteChange = (selectedKey, note) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s._selectedKey === selectedKey ? { ...s, note } : s
      )
    );
  };

  const handleCreateOrder = async () => {
    // Validate inputs
    const trimmedOrderId = orderId.trim();
    const trimmedLpo = lpo.trim();
    if (!selectedCustomer) {
      setError("Please select a customer");
      toast.error("Please Select a customer");
      return;
    }

    if (trimmedOrderId == "") {
      toast.error("Please Enter Work Order");
      return;
    }

    if (selectedProducts.length === 0 && selectedServices.length === 0) {
      setError("Please select at least one product or service");
      toast.error("Please select at least one product or service");
      return;
    }

    // Calculate totals
    const productTotal = selectedProducts.reduce(
      (sum, product) => sum + product.sellingPrice * product.quantity,
      0
    );

    const serviceTotal = selectedServices.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0
    );

    const netAmount = productTotal + serviceTotal;
    const vatAmount = netAmount * (vatRate / 100);
    const subtotal = netAmount + vatAmount;
    const finalTotal = subtotal - discount;

    const productsForOrder = selectedProducts.map((p) => ({
      product: p._id,
      quantity: p.quantity,
      price: p.sellingPrice,
      purchasePrice: p.purchasePrice || 0,
      note: p.note,
      vin: p.vin || null,
      jc: p.jc || null,
      batchId: p.selectedBatch ? p.selectedBatch._id : null,
    }));

    // Create order object
    const orderData = {
      OrderId: trimmedOrderId,
      lpo: trimmedLpo,
      customer: selectedCustomer._id,
      products: productsForOrder,
      services: selectedServices.map((s) => ({
        service: s._id,
        quantity: s.quantity,
        price: s.price,
        note: s.note,
        vin: s.vin || null,
        jc: s.jc || null,
      })),
      netAmount,
      vatRate,
      vatAmount,
      subtotal,
      total: finalTotal,
      date: orderDate,
      discount,
    };

    // Proceed with order creation
    setLoading(true);
    try {
      const response = await createSalesOrder(orderData);

      if (response.status !== 201) {
        const errorData = await response.data;
        throw new Error(errorData.message || "Failed to create order");
      }

      // Reset form and return to list view
      resetForm();
      toast.success("Sales Order Created");
      setView("list");
    } catch (err) {
      setError(err.response?.data.message);
      toast.error(err.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedProducts([]);
    setSelectedServices([]);
    setOrderDate(new Date().toISOString().split("T")[0]);
    setError("");
    setOrderId("");
    setLpo("");
    setDiscount(0);
    setOrderIdChecked(false);
    setLpoChecked(false);
    setItemType(false); // Reset to services
    setEmptyRows([{ id: uuidv4(), searchTerm: "" }]);
    setDuplicateModal({
      isOpen: false,
      type: "",
      value: "",
      existingOrder: null,
    });
  };
  const handleDuplicateModalClose = () => {
    setDuplicateModal({
      isOpen: false,
      type: "",
      value: "",
      existingOrder: null,
    });
    // Reset the corresponding input
    if (duplicateModal.type === "orderid") {
      setOrderId("");
      setOrderIdChecked(false);
    } else if (duplicateModal.type === "lpo") {
      setLpo("");
      setLpoChecked(false);
    }
  };

  const handleDuplicateModalContinue = () => {
    // Mark as checked to allow form submission
    if (duplicateModal.type === "orderid") {
      setOrderIdChecked(true);
    } else if (duplicateModal.type === "lpo") {
      setLpoChecked(true);
    }
    setDuplicateModal({
      isOpen: false,
      type: "",
      value: "",
      existingOrder: null,
    });
  };

  const calculateTotal = () => {
    const productTotal = selectedProducts.reduce(
      (sum, product) => sum + product.sellingPrice * product.quantity,
      0
    );

    const serviceTotal = selectedServices.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0
    );

    return productTotal + serviceTotal;
  };

  const SearchInput = () => (
    <div className="mb-6">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by Work Order..."
        className="block w-full p-2 pl-10 text-sm border border-blue-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  const PaginationComponent = () => (
    <div className="mt-6">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="py-4"
      />
    </div>
  );

  // Helper to generate unique key for each selected item
  const getUniqueKey = () => uuidv4();

  return (
    <div className="max-w-8xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <header className="mb-8 flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
            <ListOrdered size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-500">Sales Orders</h1>
            <p className="text-blue-400 font-medium">
              Manage your Sales Orders
            </p>
          </div>
        </header>
        {view === "list" ? (
          <button
            onClick={() => setView("create")}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={20} className="mr-2" />
            Create New Order
          </button>
        ) : (
          <button
            onClick={() => setView("list")}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
          >
            <X size={20} className="mr-2" />
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {view === "list" ? (
        <>
          <FilterSection
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            invoiceCreated={invoiceCreated}
            setInvoiceCreated={setInvoiceCreated}
            invoiceNotCreated={invoiceNotCreated}
            setInvoiceNotCreated={setInvoiceNotCreated}
            applyFilters={applyFilters}
            downloadPdf={downloadPdf}
            exportingPDF={exportingPDF}
            handleDownloadExcel={handleDownloadExcel}
            exportingExcel={exportingExcel}
            loading={loading}
          />
          {SearchInput()}
          <OrdersList
            orders={orders}
            loading={loading}
            setLoading={setLoading}
            fetchOrders={fetchOrders}
            onEditOrder={handleEditOrder}
          />
          {PaginationComponent()}
        </>
      ) : view === "create" ? (
        // Replace the view === "create" section with this updated responsive design
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 sm:px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Plus size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Create New Sales Order
                </h2>
                <p className="text-blue-100 text-sm">
                  Fill in the details to create a new order
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer Selection
                  <span className="text-red-500 ml-1">*</span>
                </h3>
              </div>
              <div className="p-6">
                <CustomerSelector
                  onCustomerSelect={handleCustomerSelect}
                  selectedCustomer={selectedCustomer}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare size={20} className="text-blue-500 mr-2" />
                  Order Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="col-span-full sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Work Order <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      placeholder="Enter Work Order"
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    />
                  </div>

                  <div className="col-span-full sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer LPO
                    </label>
                    <input
                      type="text"
                      value={lpo}
                      placeholder="Enter LPO"
                      onChange={(e) => setLpo(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    />
                  </div>

                  <div className="col-span-full sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order Date
                    </label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      dateFormat="dd/MM/yyyy"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      Products & Services
                      <span className="text-red-500 ml-1">*</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Search and select items in the table below
                    </p>
                  </div>
                  {/* Item Type Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Service</span>
                    <ToggleSwitch checked={itemType} onChange={setItemType} />
                    <span className="text-sm text-gray-600">Product</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            J/C
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            VIN
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Selected Items */}
                        {[...selectedProducts, ...selectedServices].map(
                          (item) => {
                            const isProduct = "sellingPrice" in item;
                            return (
                              <tr
                                key={item._selectedKey}
                                className="hover:bg-gray-50 transition-colors duration-150"
                              >
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <input
                                    type="text"
                                    value={item.jc || ""}
                                    onChange={(e) => {
                                      const newJc = e.target.value;
                                      if (isProduct) {
                                        setSelectedProducts(
                                          selectedProducts.map((p) =>
                                            p._selectedKey === item._selectedKey
                                              ? { ...p, jc: newJc }
                                              : p
                                          )
                                        );
                                      } else {
                                        setSelectedServices(
                                          selectedServices.map((s) =>
                                            s._selectedKey === item._selectedKey
                                              ? { ...s, jc: newJc }
                                              : s
                                          )
                                        );
                                      }
                                    }}
                                    placeholder="Enter J/C"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="text"
                                    value={item.note || ""}
                                    onChange={(e) =>
                                      isProduct
                                        ? handleProductNoteChange(
                                            item._selectedKey,
                                            e.target.value
                                          )
                                        : handleServiceNoteChange(
                                            item._selectedKey,
                                            e.target.value
                                          )
                                    }
                                    placeholder="Add item description..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    data-note-key={item._selectedKey}
                                  />
                                </td>

                                <td className="px-4 py-4 whitespace-nowrap">
                                  <input
                                    type="text"
                                    value={item.vin || ""}
                                    onChange={(e) => {
                                      const newVin = e.target.value;
                                      if (newVin && newVin.length > 17) return;
                                      if (isProduct) {
                                        setSelectedProducts(
                                          selectedProducts.map((p) =>
                                            p._selectedKey === item._selectedKey
                                              ? { ...p, vin: newVin }
                                              : p
                                          )
                                        );
                                      } else {
                                        setSelectedServices(
                                          selectedServices.map((s) =>
                                            s._selectedKey === item._selectedKey
                                              ? { ...s, vin: newVin }
                                              : s
                                          )
                                        );
                                      }
                                    }}
                                    placeholder="Enter VIN (17 chars)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <input
                                    type="number"
                                    min="1"
                                    max={
                                      isProduct && item.selectedBatch
                                        ? item.selectedBatch.stock
                                        : 999
                                    }
                                    value={item.quantity}
                                    onChange={(e) =>
                                      isProduct
                                        ? handleProductQuantityChange(
                                            item._selectedKey,
                                            e.target.value
                                          )
                                        : handleServiceQuantityChange(
                                            item._selectedKey,
                                            e.target.value
                                          )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={
                                        isProduct
                                          ? item.sellingPrice
                                          : item.price
                                      }
                                      onChange={(e) =>
                                        isProduct
                                          ? handleProductPriceChange(
                                              item._selectedKey,
                                              e.target.value
                                            )
                                          : handleServicePriceChange(
                                              item._selectedKey,
                                              e.target.value
                                            )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                </td>

                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-lg font-bold text-gray-900">
                                    {(
                                      (isProduct
                                        ? item.sellingPrice
                                        : item.price) * item.quantity
                                    ).toFixed(2)}{" "}
                                    AED
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                  <button
                                    onClick={() =>
                                      isProduct
                                        ? handleRemoveProduct(item._selectedKey)
                                        : handleRemoveService(item._selectedKey)
                                    }
                                    className="inline-flex items-center p-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors duration-150"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          }
                        )}

                        {/* Empty Rows for Search */}
                        {emptyRows.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={row.jc || ""}
                                onChange={(e) => {
                                  const newJc = e.target.value;
                                  setEmptyRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id ? { ...r, jc: newJc } : r
                                    )
                                  );
                                }}
                                placeholder="Enter J/C"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <InlineItemSelector
                                value={row.searchTerm}
                                onChange={(value) =>
                                  handleEmptyRowSearch(row.id, value)
                                }
                                onItemSelect={(item) =>
                                  handleEmptyRowItemSelect(row.id, item)
                                }
                                isProduct={itemType}
                                placeholder={`Search ${
                                  itemType ? "products" : "services"
                                } by name or code...`}
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"></div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"></div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"></div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"></div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              {emptyRows.length > 1 && (
                                <button
                                  onClick={() => handleRemoveEmptyRow(row.id)}
                                  className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-150"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {(selectedProducts.length > 0 || selectedServices.length > 0) && (
              <div className="lg:flex justify-end">
                <div className="lg:w-1/2">
                  <OrderSummary
                    products={selectedProducts}
                    services={selectedServices}
                    total={calculateTotal()}
                    discount={discount}
                    setDiscount={setDiscount}
                    vatRate={vatRate}
                    setVatRate={setVatRate}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={resetForm}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
              >
                <X size={18} className="mr-2" />
                Reset Form
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-tranblue-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Creating Order...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Create Sales Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // New edit view
        <EditSalesOrder
          orderId={editOrderId}
          onCancel={() => {
            setEditOrderId(null);
            setView("list");
          }}
          onSuccess={handleEditSuccess}
        />
      )}
      <DuplicateWarningModal
        isOpen={duplicateModal.isOpen}
        onClose={handleDuplicateModalClose}
        onContinue={handleDuplicateModalContinue}
        duplicateType={duplicateModal.type === "orderid" ? "Work Order" : "LPO"}
        duplicateValue={duplicateModal.value}
        existingOrder={duplicateModal.existingOrder}
      />
    </div>
  );
};

export default SalesOrders;
