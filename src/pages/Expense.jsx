import React, { useState, useEffect } from "react";
import { Plus, DollarSign, FileSpreadsheet, FileText } from "lucide-react";
import ExpenseModal from "../components/Expense_comp/ExpenseModal";
import ExpenseList from "../components/Expense_comp/ExpenseList";
import PaymentModal from "../components/Expense_comp/PaymentModal";
import FilterBar from "../components/Expense_comp/FilterBar";
import DepartmentList from "../components/Expense_comp/DepartmentList";
import DepartmentPaymentHistoryModal from "../components/Expense_comp/DepartmentPaymentHistoryModal";
import ExpenseSummary from "../components/Expense_comp/ExpenseSummary";
import {
  getExpense,
  getDepartments,
  getCategories,
  addExpense,
  addDepartmentPayment,
  downloadExpenses,
  updateExpense,
} from "../service/expenseService.js";
import Pagination from "../components/Pagination.jsx";
import toast from "react-hot-toast";
import { handleDownloadExpensePDF } from "../components/Expense_comp/DownloadExpenses.jsx";
import EditExpenseModal from "../components/Expense_comp/EditExpenseModal.jsx";

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [summary, setSummery] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleUpdateExpense = async (updatedExpenseData) => {
    try {
      setIsSubmitting(true);
      await updateExpense(updatedExpenseData.expenseId, {
        name: updatedExpenseData.name,
        department: updatedExpenseData.department,
        category: updatedExpenseData.category,
        date: updatedExpenseData.date,
        amount: updatedExpenseData.amount,
      });
      setIsEditModalOpen(false);
      setSelectedExpense(null);
      fetchExpenses(filters, pagination.currentPage);
      fetchDepartments();
      toast.success("Expense Updated Successfully");
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error(error.response?.data?.message || "Failed to update expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchDepartments();
    fetchCategories();
  }, []);

  const fetchExpenses = async (filterParams = {}, page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Add filters
      if (filterParams.startDate)
        params.append("startDate", filterParams.startDate);
      if (filterParams.endDate) params.append("endDate", filterParams.endDate);
      if (filterParams.category)
        params.append("category", filterParams.category);
      if (filterParams.department)
        params.append("department", filterParams.department);

      // Add pagination
      params.append("page", page);
      params.append("limit", pagination.itemsPerPage);

      const response = await getExpense(params);

      // Updated structure based on the new API response
      setExpenses(response.data?.expenses);
      setSummery(response.data?.summary);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    await handleDownloadExpensePDF({
      setExportingPDF,
      startDate: filters.startDate,
      endDate: filters.endDate,
      category: filters.category,
      department: filters.department,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownloadExcel = async () => {
    try {
      setExportingExcel(true);
      const params = new URLSearchParams();

      // Add FilterSection
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.category) params.append("category", filters.category);
      if (filters.department) params.append("department", filters.department);
      // Get raw data for Excel generation
      const response = await downloadExpenses(params);

      if (!response?.data) {
        toast.error("No data available to create sheet");
        return;
      }

      const { expenses, sum } = response.data;

      // Create a workbook
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Format data for Excel
      const worksheetData = expenses.map((exp) => ({
        Description: exp.name || "N/A",
        Department: exp.department.name || "N/A",
        Category: exp.category?.name || "N/A",
        Date: formatDate(exp.date) || formatDate(exp.createdAt) || "N/A",
        Amount: exp.amount || 0,
      }));

      // Create worksheet with invoice data
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

      // Create summary worksheet
      const summaryData = [
        { Metric: "Total Expenses", Value: sum.count },
        { Metric: "Total Amount", Value: sum.totalAmount },
      ];

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

      // Write to file and trigger download
      XLSX.writeFile(workbook, "Expense_Report.xlsx");

      toast.success("Excel report downloaded successfully");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to download Excel report");
    } finally {
      setExportingExcel(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddExpense = async (newExpense) => {
    try {
      setIsSubmitting(true);
      await addExpense(newExpense);
      setIsExpenseModalOpen(false);
      fetchExpenses(filters, pagination.currentPage);
      fetchDepartments();
      toast.success("Expense Added");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(error.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      setLoading(true);
      await addDepartmentPayment({
        departmentId: paymentData.departmentId,
        date: paymentData.date,
        amount: paymentData.amount,
      });
      setIsPaymentModalOpen(false);
      fetchDepartments();
      toast.success("Payment Added");
    } catch (error) {
      console.error("Error adding payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    fetchExpenses(newFilters, 1);
  };

  const handlePageChange = (page) => {
    fetchExpenses(filters, page);
  };

  const handleViewDepartmentHistory = (department) => {
    setSelectedDepartment(department);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="max-w-8xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <header className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
            <DollarSign size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-500">Expenses</h1>
            <p className="text-blue-400 font-medium">Track your expenses</p>
          </div>
        </header>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            <DollarSign size={16} />
            Add Payment
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      <div className="gap-6 mb-6">
        <div className="lg:col-span-2">
          {/* New Summary Component */}
          <ExpenseSummary summary={summary} />
          <div>
          <DepartmentList
            departments={departments}
            onViewHistory={handleViewDepartmentHistory}
          />
        </div>

          <FilterBar
            categories={categories}
            departments={departments}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <div className="flex justify-end mb-6 gap-2">
            <button
              disabled={exportingPDF}
              onClick={downloadPdf}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <FileText size={16} />
              Download PDF
            </button>
            <button
              disabled={exportingExcel}
              onClick={handleDownloadExcel}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2.5 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {" "}
              <FileSpreadsheet size={16} />
              Download Excel
            </button>
          </div>

          <ExpenseList
            expenses={expenses}
            loading={loading}
            onEditExpense={handleEditExpense}
          />

          {/* Pagination component */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                className="py-4"
              />
            </div>
          )}
        </div>
      </div>

      {isExpenseModalOpen && (
        <ExpenseModal
          onClose={() => setIsExpenseModalOpen(false)}
          onSubmit={handleAddExpense}
          departments={departments}
          setDepartments={setDepartments}
          categories={categories}
          setCategories={setCategories}
          isSubmitting={isSubmitting}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handleAddPayment}
          departments={departments}
          loading={loading}
        />
      )}

      {isHistoryModalOpen && selectedDepartment && (
        <DepartmentPaymentHistoryModal
          department={selectedDepartment}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedExpense(null);
          }}
          onSubmit={handleUpdateExpense}
          departments={departments}
          categories={categories}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default Expense;
