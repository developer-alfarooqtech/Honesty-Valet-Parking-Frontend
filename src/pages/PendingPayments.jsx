import React, { useState, useEffect } from "react";
import { Search, Calendar, X, DollarSign, XCircle } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import Pagination from "../components/Pagination";
import CustomerSearch from "../components/PendingPayments_comp/CustomerSearch";
import PaymentModal from "../components/PendingPayments_comp/PaymentModal";
import { getPendingPayments } from "../service/pendingPaymentsService";
import toast from "react-hot-toast";
import {
  SortButton,
  TableHeaders,
} from "../components/PendingPayments_comp/TableHead";
import DatePicker from "react-datepicker";

const PendingPayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    customer: null,
    startDate: "",
    endDate: "",
    customerSearch: "",
    invoiceName: "",
  });

  const [sort, setSort] = useState({
    field: "createdAt",
    direction: "desc",
  });

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Debounced customer search
  const debouncedCustomerSearch = useDebounce(filters.customerSearch, 300);
  const debouncedInvoiceSearch = useDebounce(filters.invoiceName, 300);

  // Selected invoices and their payment data
  const [selectedInvoices, setSelectedInvoices] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enteredTotalAmount, setEnteredTotalAmount] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [hasManualReceivedAmount, setHasManualReceivedAmount] = useState(false);

  // Select all functionality
  const [selectAll, setSelectAll] = useState(false);

  // Fetch invoices
  const fetchInvoices = async (page = 1) => {
    if (!filters.customer) {
      setInvoices([]);
      setTotalPages(1);
      setTotalCount(0);
      setCurrentPage(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortField: sort.field,
        sortDirection: sort.direction,
        ...(filters.customer && { customer: filters.customer._id }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.invoiceName && { invoiceName: filters.invoiceName }),
      });

      const response = await getPendingPayments(queryParams);
      const data = await response.data;

      if (data.success) {
        setInvoices(data.invoices);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        setCurrentPage(data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error(error?.response?.data?.message || "Error fetching invoices:");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filters.customer) {
      setInvoices([]);
      setTotalPages(1);
      setTotalCount(0);
      setCurrentPage(1);
      return;
    }

    fetchInvoices(1);
    setCurrentPage(1);
  }, [
    filters.customer,
    filters.startDate,
    filters.endDate,
    debouncedInvoiceSearch,
    sort,
  ]);

  // Handle page change
  const handlePageChange = (page) => {
    if (!filters.customer) {
      return;
    }
    fetchInvoices(page);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setFilters((prev) => ({
      ...prev,
      customer,
      customerSearch: customer ? customer.name : "",
    }));
  };

  // Clear customer filter
  const clearCustomerFilter = () => {
    setFilters((prev) => ({
      ...prev,
      customer: null,
      customerSearch: "",
    }));
  };

  // Handle date filter changes
  const handleDateChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle invoice selection
  const handleInvoiceSelect = (invoice, checked) => {
    setSelectedInvoices((prev) => {
      const updated = { ...prev };
      if (checked) {
        updated[invoice._id] = invoice;
        // Initialize payment data with current discount and calculate remaining balance
        const originalDiscount = invoice.discount || 0;
        const originalBalance = invoice.balanceToReceive;

        setPaymentData((prevData) => ({
          ...prevData,
          [invoice._id]: {
            originalDiscount: originalDiscount, // Store original discount for reference
            discount: originalDiscount,
            amount: originalBalance,
            description: "",
          },
        }));
      } else {
        delete updated[invoice._id];
        // Remove payment data for this invoice
        setPaymentData((prev) => {
          const updatedData = { ...prev };
          delete updatedData[invoice._id];
          return updatedData;
        });
      }
      return updated;
    });
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      const allSelected = {};
      const allPaymentData = {};
      invoices.forEach((invoice) => {
        allSelected[invoice._id] = invoice;
        const originalDiscount = invoice.discount || 0;
        const originalBalance = invoice.balanceToReceive;

        allPaymentData[invoice._id] = {
          originalDiscount: originalDiscount,
          discount: originalDiscount,
          amount: originalBalance,
          description: "",
        };
      });
      setSelectedInvoices(allSelected);
      setPaymentData(allPaymentData);
    } else {
      setSelectedInvoices({});
      setPaymentData({});
    }
  };

  // Handle payment data changes
  const handlePaymentDataChange = (invoiceId, field, value) => {
    const invoice = selectedInvoices[invoiceId];
    if (!invoice) return;

    setPaymentData((prev) => {
      const updated = { ...prev };
      if (!updated[invoiceId]) {
        const originalDiscount = invoice.discount || 0;
        updated[invoiceId] = {
          originalDiscount: originalDiscount,
          discount: originalDiscount,
          amount: 0,
          description: "",
        };
      }

      if (field === "description") {
        updated[invoiceId].description = value;
        return updated;
      }

      let newValue = parseFloat(value) || 0;

      if (field === "discount") {
        // Maximum discount is the total amount
        newValue = Math.min(newValue, invoice.totalAmount);
        const originalDiscount = updated[invoiceId].originalDiscount;
        const discountChange = originalDiscount - newValue; // Positive if discount decreased

        updated[invoiceId].discount = newValue;

        // Calculate new balance: original balance + discount reduction
        const newBalance = invoice.balanceToReceive + discountChange;
        updated[invoiceId].amount = Math.max(0, newBalance);
      } else if (field === "amount") {
        // Calculate maximum payment based on current discount
        const currentDiscount = updated[invoiceId].discount || 0;
        const originalDiscount = updated[invoiceId].originalDiscount;
        const discountChange = originalDiscount - currentDiscount;
        const maxPaymentAmount = Math.max(
          0,
          invoice.balanceToReceive + discountChange
        );

        newValue = Math.min(newValue, maxPaymentAmount);
        updated[invoiceId].amount = newValue;
      }

      return updated;
    });
  };

  const calculateRealTimeValues = (invoice, paymentData) => {
    if (!paymentData) {
      return {
        finalAmount: invoice.totalAmount,
        totalPaid: invoice.totalPayedAmount || 0,
        balanceToPay: invoice.balanceToReceive,
      };
    }

    const currentDiscount = paymentData.discount || 0;
    const currentPayment = paymentData.amount || 0;
    const originalDiscount = paymentData.originalDiscount || 0;

    // Calculate discount change (positive if discount decreased)
    const discountChange = originalDiscount - currentDiscount;

    // New final amount after discount
    const newFinalAmount = invoice.totalAmount - currentDiscount;

    // Total paid includes new payment
    const newTotalPaid = (invoice.totalPayedAmount || 0) + currentPayment;

    // New balance to pay = original balance + discount change - current payment
    const newBalanceToPay = Math.max(
      0,
      invoice.balanceToReceive + discountChange - currentPayment
    );

    return {
      finalAmount: newFinalAmount,
      totalPaid: newTotalPaid,
      balanceToPay: newBalanceToPay,
    };
  };

  // Calculate total payment amount from selected invoices
  const normalizeCurrency = (value) => {
    const numeric = typeof value === "string" ? parseFloat(value) : Number(value);
    if (!Number.isFinite(numeric)) {
      return 0;
    }
    return Number(numeric.toFixed(2));
  };

  const calculateTotalPaymentAmount = () => {
    return Object.keys(paymentData).reduce((sum, invoiceId) => {
      return sum + (parseFloat(paymentData[invoiceId]?.amount) || 0);
    }, 0);
  };

  useEffect(() => {
    if (hasManualReceivedAmount) {
      return;
    }
    const total = normalizeCurrency(calculateTotalPaymentAmount());
    if (total > 0) {
      setEnteredTotalAmount(total.toFixed(2));
    } else {
      setEnteredTotalAmount("");
    }
  }, [paymentData, hasManualReceivedAmount]);

  useEffect(() => {
    if (Object.keys(selectedInvoices).length === 0) {
      setHasManualReceivedAmount(false);
      setEnteredTotalAmount("");
    }
  }, [selectedInvoices]);

  // Handle payment submission
  const handlePaymentSubmit = () => {
    const totalPaymentAmount = normalizeCurrency(calculateTotalPaymentAmount());
    const enteredAmount = normalizeCurrency(enteredTotalAmount);

    const amountsMatch = Math.abs(enteredAmount - totalPaymentAmount) < 0.01;

    if (!amountsMatch) {
      setShowDeclineModal(true);
      return;
    }

    // If amounts match, proceed to payment modal
    setShowPaymentModal(true);
  };

  // Calculate totals for selected invoices with valid payment data
  const getValidPayments = () => {
    return Object.keys(paymentData).map((invoiceId) => ({
      invoice: selectedInvoices[invoiceId],
      paymentData: paymentData[invoiceId],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <header className="mb-8 flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
            <DollarSign size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-500">
              Payment Receipts
            </h1>
            <p className="text-blue-400 font-medium">Manage Payments</p>
          </div>
        </header>
        <div className="text-sm text-gray-500">
          Total: {totalCount} invoices
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-300 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Customer Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <div className="relative">
              {filters.customer ? (
                <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-sm">
                    {filters.customer.name} ({filters.customer.Code})
                  </span>
                  <button
                    onClick={clearCustomerFilter}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <CustomerSearch
                  searchTerm={filters.customerSearch}
                  onSearchChange={(value) =>
                    setFilters((prev) => ({ ...prev, customerSearch: value }))
                  }
                  onCustomerSelect={handleCustomerSelect}
                  debouncedSearchTerm={debouncedCustomerSearch}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Invoice Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.invoiceName}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    invoiceName: e.target.value,
                  }))
                }
                placeholder="Search by invoice name..."
                className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Actions */}
      {Object.keys(selectedInvoices).length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-blue-800 flex flex-col md:flex-row md:items-center md:gap-4">
              <span>
                {Object.keys(selectedInvoices).length} invoice(s) selected
              </span>
              <span className="font-semibold">
                Total Payment: AED {calculateTotalPaymentAmount().toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <label className="text-gray-700">Received Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={enteredTotalAmount}
                  onChange={(e) => {
                    setEnteredTotalAmount(e.target.value);
                    setHasManualReceivedAmount(true);
                  }}
                  className="w-28 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <button
              onClick={handlePaymentSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <DollarSign size={16} />
              Process Payments
            </button>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-300 overflow-hidden">
        {!filters.customer ? (
          <div className="p-8 text-center text-blue-600">
            Select a customer to view pending invoices.
          </div>
        ) : loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending invoices found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <TableHeaders
                  sort={sort}
                  onSort={handleSort}
                  selectAll={selectAll}
                  onSelectAll={handleSelectAll}
                />
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => {
                    const realTimeValues = calculateRealTimeValues(
                      invoice,
                      paymentData[invoice._id]
                    );

                    // Calculate dynamic max values
                    const maxDiscount = invoice.totalAmount;
                    const currentDiscount =
                      paymentData[invoice._id]?.discount || 0;
                    const originalDiscount =
                      paymentData[invoice._id]?.originalDiscount || 0;
                    const discountChange = originalDiscount - currentDiscount;
                    const maxPayment = Math.max(
                      0,
                      invoice.balanceToReceive + discountChange
                    );

                    return (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={!!selectedInvoices[invoice._id]}
                            onChange={(e) =>
                              handleInvoiceSelect(invoice, e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.name}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.customer?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.customer?.Code}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(invoice.createdAt).toLocaleDateString(
                              "en-GB"
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(invoice.expDate).toLocaleDateString(
                              "en-GB"
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.totalAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-red-600">
                            {selectedInvoices[invoice._id] ? (
                              <>
                                <div className="text-gray-400 text-xs line-through">
                                  {invoice.balanceToReceive.toFixed(2)}
                                </div>
                                <div className="font-bold">
                                  {realTimeValues.balanceToPay.toFixed(2)}
                                </div>
                              </>
                            ) : (
                              invoice.balanceToReceive.toFixed(2)
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            max={maxDiscount}
                            step="0.01"
                            value={
                              paymentData[invoice._id]?.discount !== undefined
                                ? paymentData[invoice._id].discount
                                : invoice.discount || 0
                            }
                            onChange={(e) =>
                              handlePaymentDataChange(
                                invoice._id,
                                "discount",
                                e.target.value
                              )
                            }
                            disabled={!selectedInvoices[invoice._id]}
                            className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            max={maxPayment}
                            step="0.01"
                            value={paymentData[invoice._id]?.amount || ""}
                            onChange={(e) =>
                              handlePaymentDataChange(
                                invoice._id,
                                "amount",
                                e.target.value
                              )
                            }
                            disabled={!selectedInvoices[invoice._id]}
                            className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={paymentData[invoice._id]?.description || ""}
                            onChange={(e) =>
                              handlePaymentDataChange(
                                invoice._id,
                                "description",
                                e.target.value
                              )
                            }
                            disabled={!selectedInvoices[invoice._id]}
                            className="w-32 p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="Enter description..."
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="justify-center"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          payments={getValidPayments()}
          onClose={() => {
            setShowPaymentModal(false);
            setEnteredTotalAmount("");
            setHasManualReceivedAmount(false);
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            setSelectedInvoices({});
            setPaymentData({});
            setEnteredTotalAmount("");
            setHasManualReceivedAmount(false);
            setSelectAll(false);
            fetchInvoices(currentPage);
          }}
        />
      )}

      {/* Mismatch Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-blue-600">Amount Mismatch</h3>
            </div>
            <div className="p-4 space-y-2 text-sm text-gray-700">
              <p>The received amount does not match the total payment amount.</p>
              <p>Please ensure both amounts are the same before processing.</p>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPayments;
