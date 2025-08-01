// pages/Salary.jsx
import React, { useState, useEffect } from "react";
import { Euro, Plus } from "lucide-react";
import Pagination from "../components/Pagination";
import SalaryFilters from "../components/Salary_comp/SalaryFilters";
import SalaryTable from "../components/Salary_comp/SalaryTable";
import AddSalaryModal from "../components/Salary_comp/AddSalaryModal";
import SalaryStats from "../components/Salary_comp/SalaryStats";
import {
  fetchSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
  fetchSalaryStats,
} from "../service/salaryService";
import SalaryDownload from "../components/Salary_comp/SalaryDownload";

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 40;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "",
    recipient: null,
  });

  // Fetch salary stats
  const fetchStatsData = async (currentFilters = filters) => {
    setStatsLoading(true);
    try {
      const filterParams = {
        ...currentFilters,
        recipient: currentFilters.recipient?._id || null,
      };

      const response = await fetchSalaryStats(filterParams);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching salary stats:", error);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch salaries
  const fetchSalariesData = async (
    page = currentPage,
    currentFilters = filters
  ) => {
    setLoading(true);
    try {
      const filterParams = {
        ...currentFilters,
        recipient: currentFilters.recipient?._id || null,
      };

      const response = await fetchSalaries(page, itemsPerPage, filterParams);
      const { salaries: salaryData, totalPages: total } = response.data;

      setSalaries(salaryData || []);
      setTotalPages(total || 1);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  };

  // Load salaries and stats on component mount and when filters/page change
  useEffect(() => {
    fetchSalariesData();
    fetchStatsData();
  }, [currentPage, filters]);

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle add salary
  const handleAddSalary = async (salaryData) => {
    setSubmitLoading(true);
    try {
      const dataToSubmit = {
        ...salaryData,
        recipient: salaryData.recipient._id,
      };

      await createSalary(dataToSubmit);
      setShowAddModal(false);
      fetchSalariesData(); // Refresh data
      fetchStatsData(); // Refresh stats
    } catch (error) {
      console.error("Error adding salary:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle edit salary
  const handleEditSalary = (salary) => {
    setEditingSalary(salary);
    setShowAddModal(true);
  };

  // Handle update salary
  const handleUpdateSalary = async (salaryData) => {
    setSubmitLoading(true);
    try {
      const dataToSubmit = {
        ...salaryData,
        recipient: salaryData.recipient._id,
      };

      await updateSalary(editingSalary._id, dataToSubmit);
      setShowAddModal(false);
      setEditingSalary(null);
      fetchSalariesData(); // Refresh data
      fetchStatsData(); // Refresh stats
    } catch (error) {
      console.error("Error updating salary:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete salary
  const handleDeleteSalary = async (salaryId) => {
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      try {
        await deleteSalary(salaryId);
        fetchSalariesData(); // Refresh data
        fetchStatsData(); // Refresh stats
      } catch (error) {
        console.error("Error deleting salary:", error);
      }
    }
  };

  // Close modal and reset editing state
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSalary(null);
  };

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <header className="mb-8 flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
              <Euro size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-500">
                Salary Management
              </h1>
              <p className="text-blue-400 font-medium">
                Manage salary payments
              </p>
            </div>
          </header>
          <div className="flex items-center space-x-3">
            {/* Add Download Button */}
            <SalaryDownload filters={filters} />

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={18} />
              <span>Add Salary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <SalaryFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Stats Section */}
      <SalaryStats stats={stats} loading={statsLoading} />

      {/* Table */}
      <div className="mt-6">
        <SalaryTable
          salaries={salaries}
          onEdit={handleEditSalary}
          onDelete={handleDeleteSalary}
          loading={loading}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showFirstLast={true}
            siblingCount={1}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddSalaryModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={editingSalary ? handleUpdateSalary : handleAddSalary}
        loading={submitLoading}
        editData={editingSalary}
      />
    </div>
  );
};

export default Salary;
