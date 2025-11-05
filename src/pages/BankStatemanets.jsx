import React, { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  Download,
  DollarSign,
  Sheet,
  FileSpreadsheet,
} from "lucide-react";
import Pagination from "../components/Pagination";
import {
  createBankAccount,
  downloadStatement,
  fetchAllBanks,
  fetchStatements,
  fetchStatementsSummary,
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
  const debouncedFilters = useDebounce(filters, 400);
  const [bankAccounts, setBankAccounts] = useState([]);

  const [showCreateBankModal, setShowCreateBankModal] = useState(false);
  const [createBankLoading, setCreateBankLoading] = useState(false);

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

      setTransactions(data.transactions || []);
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
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Group Payment
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
                        {transaction.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.groupTotal && transaction.groupInvoices && transaction.groupInvoices.length > 1 ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                              Group Payment
                            </div>
                            <div className="text-xs text-gray-600">
                              Total: AED {parseFloat(transaction.groupTotal).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              ({transaction.groupInvoices.length} invoices: {transaction.groupInvoices.join(", ")})
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Individual</span>
                        )}
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
    </div>
  );
};

export default BankStatements;
