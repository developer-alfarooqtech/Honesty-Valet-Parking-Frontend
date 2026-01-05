import React, { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  Download,
  DollarSign,
  FileSpreadsheet,
  Eye,
  Pencil,
  RotateCcw,
  X,
} from "lucide-react";
import Pagination from "../components/Pagination";
import {
  createBankAccount,
  downloadStatement,
  fetchAllBanks,
  fetchStatements,
  fetchStatementsSummary, 
  updateBankTransaction,
  reverseBankTransaction,
} from "../service/bankServices";
import useDebounce from "../hooks/useDebounce";
import SummarySection from "../components/BankStatement_comp/SummarySection";
import { handleDownloadBankPDF } from "../components/BankStatement_comp/DownloadStatement";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import CreateBankModal from "../components/BankStatement_comp/CreateBankModal";
import BankListSection from "../components/BankStatement_comp/BankListSection";

const BankStatements = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [filters, setFilters] = useState({
    bankAccount: "",
    transactionType: "all", // 'all', 'invoice', 'purchase-invoice'
    dateFrom: "",
    dateTo: "",
  });

  const getTimestamp = (value) => {
    const parsed = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const sortTransactionsByDateDesc = (items = []) =>
    [...items].sort((a, b) => getTimestamp(b?.date) - getTimestamp(a?.date));

  const renderCreatedBy = (createdBy) => {
    if (!createdBy) return "-";
    const displayName = createdBy?.name || createdBy?.loginId;
    const secondary = createdBy?.name && createdBy?.loginId ? createdBy.loginId : "";

    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-900">{displayName || "-"}</span>
        {secondary && (
          <span className="text-xs text-gray-500">{secondary}</span>
        )}
      </div>
    );
  };
  const debouncedFilters = useDebounce(filters, 400);
  const [bankAccounts, setBankAccounts] = useState([]);

  const [showCreateBankModal, setShowCreateBankModal] = useState(false);
  const [createBankLoading, setCreateBankLoading] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [activeGroupTransaction, setActiveGroupTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [reversingTransactionId, setReversingTransactionId] = useState(null);

  const handleCreateBank = async (bankData) => {
    setCreateBankLoading(true);
    try {
      const response = await createBankAccount(bankData);
      const isSuccess = response?.data?.success === true || response?.status === 201;
      if (isSuccess) {
        toast.success("Bank account created successfully");
        setShowCreateBankModal(false);
        // Refresh bank accounts list
        await fetchBankAccounts();
      } else {
        toast.error(response?.data?.message || "Failed to create bank account");
      }
    } catch (error) {
      console.error("Error creating bank account:", error);
      const message = error?.response?.data?.message || "Failed to create bank account";
      toast.error(message);
    } finally {
      setCreateBankLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
    fetchTransactions();
    fetchSummary(); // Add this line
  }, [currentPage, debouncedFilters]);

  const fetchBankAccounts = async () => {
    try {
      const response = await fetchAllBanks();
      const data = await response?.data;
      setBankAccounts(data);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        ...debouncedFilters,
      });
      const response = await fetchStatements(queryParams);
      const data = response?.data;

      const sortedTransactions = sortTransactionsByDateDesc(
        data.transactions || []
      );

      setTransactions(sortedTransactions);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    const queryParams = new URLSearchParams({
      ...debouncedFilters,
    });

    await handleDownloadBankPDF({ queryParams, setExportingPDF });
  };

  const handleDownloadExcel = async () => {
    try {
      setExportingExcel(true);
      // Get raw data for Excel generation
      const queryParams = new URLSearchParams({
        ...debouncedFilters,
      });

      const response = await downloadStatement(queryParams);

      if (!response.data || !response.data.transactions) {
        toast.error("Failed to retrieve data");
        return;
      }

      const data = response.data.transactions;

      // Create a workbook
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Format data for Excel
      const worksheetData = data.map((item) => ({
        Date: formatDate(item.date) || "N/A",
        Type: item.type || "N/A",
        Reference: item.referenceName || "N/A",
        Account: item.bankAccountName || "N/A",
        "Created By": item?.createdBy?.name || item?.createdBy?.loginId || "N/A",
          Description: item.description || "-",
        Invoices: formatInvoiceList(item),
        Amount: item.amount,
      }));

      // Create worksheet with invoice data
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

      // Create summary worksheet
      // const summaryData = [
      //   { Metric: "Total amount", Value: stats.totalAmount },
      //   { Metric: "Total Paid", Value: stats.totalPaidAmount },
      //   { Metric: "Balance to pay", Value: stats.totalBalanceToPay },
      //   { Metric: "Total Invoices", Value: stats.totalInvoices },
      // ];

      // const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      // XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

      // Write to file and trigger download
      XLSX.writeFile(workbook, "Transactions_Report.xlsx");

      toast.success("Excel report downloaded successfully");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to download Excel report");
    } finally {
      setExportingExcel(false);
    }
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...debouncedFilters,
      });

      const response = await fetchStatementsSummary(queryParams);
      const data = response?.data;

      setSummaryData(data.summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      bankAccount: "",
      transactionType: "all",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    const numericValue = Number(value);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
    return `AED ${safeValue.toFixed(2)}`;
  };
const formatInvoiceList = (transaction) => {
    if (!transaction) return "-";
    if (Array.isArray(transaction.groupInvoiceDetails) && transaction.groupInvoiceDetails.length) {
      return transaction.groupInvoiceDetails
        .map((inv) => inv?.name || inv?._id || "Invoice")
        .join(", ");
    }
    if (Array.isArray(transaction.groupInvoices) && transaction.groupInvoices.length) {
      return transaction.groupInvoices.join(", ");
    }
    if (transaction.referenceName) return transaction.referenceName;
    return "-";
  };
  
  const openGroupInvoicesModal = (transaction) => {
    if (!transaction) return;

    const invoices = transaction.groupInvoiceDetails?.length
      ? transaction.groupInvoiceDetails
      : Array.isArray(transaction.groupInvoices)
      ? transaction.groupInvoices.map((name, index) => ({
          name,
          totalAmount: null,
          _id: `${transaction.referenceName || "invoice"}-${index}`,
        }))
      : [];

    setActiveGroupTransaction({
      invoices,
      total: transaction.groupTotal,
      referenceName: transaction.referenceName,
      bankAccountName: transaction.bankAccountName,
      date: transaction.date,
    });
    setIsGroupModalOpen(true);
  };

  const closeGroupInvoicesModal = () => {
    setIsGroupModalOpen(false);
    setActiveGroupTransaction(null);
  };

  const openEditTransactionModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const closeEditTransactionModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const handleEditTransactionSubmit = async (formValues) => {
    if (!editingTransaction) return;
    setSavingTransaction(true);
    try {
      const payload = {
        transactionType: editingTransaction.type,
        amount: formValues.amount,
        bankAccount: formValues.bankAccount,
        date: formValues.date,
        description: formValues.description,
      };

      await updateBankTransaction(editingTransaction.transactionId, payload);
      toast.success("Transaction updated successfully");
      closeEditTransactionModal();
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error("Error updating transaction:", error);
      const message = error?.response?.data?.message || "Failed to update transaction";
      toast.error(message);
    } finally {
      setSavingTransaction(false);
    }
  };

  const handleReverseTransaction = async (transaction) => {
    if (!transaction) return;
    const confirmed = window.confirm(
      "Are you sure you want to reverse this transaction? This will restore the previous balances."
    );
    if (!confirmed) return;

    setReversingTransactionId(transaction.transactionId);
    try {
      await reverseBankTransaction(transaction.transactionId, {
        transactionType: transaction.type,
      });
      toast.success("Transaction reversed successfully");
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error("Error reversing transaction:", error);
      const message = error?.response?.data?.message || "Failed to reverse transaction";
      toast.error(message);
    } finally {
      setReversingTransactionId(null);
    }
  };

  const getTransactionTypeBadge = (type) => {
    if (type === "invoice") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Invoice Payment
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Purchase Payment
        </span>
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        {/* <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Statements</h1>
          <p className="text-gray-600">View all payment transactions across invoices and purchases</p>
        </div> */}
        <header className="mb-8 flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
            <DollarSign size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-500">
              Bank Receipts
            </h1>
            <p className="text-blue-400 font-medium">
              View all payment transactions across invoices and purchases
            </p>
          </div>
        </header>

        <BankListSection
          banks={bankAccounts}
          loading={loading}
          onCreateBank={() => setShowCreateBankModal(true)}
        />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bank Account Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Account
              </label>
              <select
                value={filters.bankAccount}
                onChange={(e) =>
                  handleFilterChange("bankAccount", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Accounts</option>
                {bankAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={filters.transactionType}
                onChange={(e) =>
                  handleFilterChange("transactionType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="invoice">Invoice Payments</option>
                <option value="purchase-invoice">Purchase Payments</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
       
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <SummarySection summaryData={summaryData} loading={summaryLoading} />

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction History
              </h2>

              <div className="flex flex-wrap gap-3">
                <button
                  className="flex items-center rounded-md text-white gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-colors"
                  onClick={downloadPdf}
                  disabled={exportingPDF}
                >
                  <Download size={16} />
                  Download PDF
                </button>

                <button
                  className="flex items-center gap-2 rounded-md text-white px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 transition-colors"
                  onClick={handleDownloadExcel}
                  disabled={exportingExcel}
                >
                  <FileSpreadsheet size={16} />
                  Download Excel
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto px-2 ">
              <table className="w-full">
                <thead className="bg-blue-500 rounded">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Bank Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Group Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTransactionTypeBadge(transaction.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.referenceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.bankAccountName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderCreatedBy(transaction.createdBy)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.groupTotal &&
                        ((transaction.groupInvoices && transaction.groupInvoices.length > 1) ||
                          (transaction.groupInvoiceDetails && transaction.groupInvoiceDetails.length > 1)) ? (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-600">
                              Total: {formatCurrency(transaction.groupTotal)}
                            </div>
                            <button
                              type="button"
                              onClick={() => openGroupInvoicesModal(transaction)}
                              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Eye size={14} className="mr-1" /> View Invoices
                              <span className="ml-1 text-blue-500">
                                ({transaction.groupInvoiceDetails?.length || transaction.groupInvoices.length})
                              </span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Individual</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => openEditTransactionModal(transaction)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReverseTransaction(transaction)}
                            disabled={reversingTransactionId === transaction.transactionId}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold disabled:opacity-60"
                          >
                            <RotateCcw size={14} />
                            {reversingTransactionId === transaction.transactionId
                              ? "Reversing..."
                              : "Reverse"}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {transaction.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="justify-center"
              />
            </div>
          )}
        </div>
      </div>
      <CreateBankModal
  isOpen={showCreateBankModal}
  onClose={() => setShowCreateBankModal(false)}
  onSubmit={handleCreateBank}
  loading={createBankLoading}
/>
      <GroupInvoicesModal
        isOpen={isGroupModalOpen}
        onClose={closeGroupInvoicesModal}
        data={activeGroupTransaction}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={closeEditTransactionModal}
        transaction={editingTransaction}
        banks={bankAccounts}
        onSubmit={handleEditTransactionSubmit}
        loading={savingTransaction}
      />
    </div>
  );
};

const GroupInvoicesModal = ({ isOpen, onClose, data, formatCurrency, formatDate }) => {
  if (!isOpen || !data) return null;

  const invoices = Array.isArray(data.invoices) ? data.invoices : [];

  const resolveAmount = (invoice) => {
    const amount =
      invoice?.finalAmount ??
      invoice?.totalAmount ??
      invoice?.total ??
      invoice?.amount ??
      0;
    const numericAmount = Number(amount);
    return Number.isFinite(numericAmount) ? numericAmount : 0;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-blue-100">
        <div className="flex items-start justify-between px-6 py-4 border-b border-blue-50 bg-blue-50/60">
          <div>
            <h3 className="text-xl font-semibold text-blue-900">Grouped Invoices</h3>
            <p className="text-sm text-blue-600">
              {data.referenceName ? `Reference: ${data.referenceName}` : "Multiple invoices"} -
              {" "}
              {data.date ? formatDate(data.date) : "Date unavailable"}
            </p>
            {data.bankAccountName && (
              <p className="text-xs text-blue-500">Bank Account: {data.bankAccountName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {invoices.length === 0 ? (
            <p className="text-sm text-gray-500">No invoice details were provided for this transaction.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b">
                  <th className="py-2">Invoice</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr key={invoice?._id || invoice?.name || index} className="border-b last:border-b-0">
                    <td className="py-2 font-medium text-gray-800">
                      #{invoice?.name || invoice}
                    </td>
                    <td className="py-2 text-right text-gray-700">
                      {formatCurrency(resolveAmount(invoice))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-blue-50 bg-blue-50/60 flex items-center justify-between">
          <div className="text-sm text-blue-700">
            Total Paid:
            <span className="ml-2 font-semibold text-blue-900">
              {formatCurrency(data.total ?? 0)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const EditTransactionModal = ({
  isOpen,
  onClose,
  transaction,
  banks,
  onSubmit,
  loading,
}) => {
  const [formState, setFormState] = useState({
    amount: "",
    bankAccount: "",
    date: "",
    description: "",
  });

  const formatDateForInput = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!transaction || !isOpen) return;

    setFormState({
      amount: transaction.amount ?? "",
      bankAccount: transaction.bankAccountId || "",
      date: formatDateForInput(transaction.date),
      description: transaction.description || "",
    });
  }, [transaction, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const numericAmount = Number(formState.amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (!formState.bankAccount) {
      toast.error("Please choose a bank account");
      return;
    }

    if (!formState.date) {
      toast.error("Please choose a date");
      return;
    }

    const isoDate = new Date(formState.date).toISOString();

    onSubmit({
      amount: numericAmount,
      bankAccount: formState.bankAccount,
      date: isoDate,
      description: formState.description,
    });
  };

  if (!isOpen || !transaction) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-blue-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-50 bg-blue-50/60">
          <div>
            <h3 className="text-xl font-semibold text-blue-900">Edit Transaction</h3>
            <p className="text-sm text-blue-600">{transaction.referenceName || "Payment"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={formState.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
            <select
              name="bankAccount"
              value={formState.bankAccount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select bank account</option>
              {banks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formState.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankStatements;
