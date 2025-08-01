import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash,
  X,
  Eye,
  FileText,
  FileSpreadsheet,
  Building,
} from "lucide-react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  downloadCustomers,
} from "../service/customerService";
import Pagination from "../components/Pagination";
import CustomerForm from "../components/Customer_comp/CustomerForm";
import useDebounce from "../hooks/useDebounce";
import CustomerDetailsModal from "../components/Customer_comp/CustomerDetailsModal";
import toast from "react-hot-toast";
import { handleDownloadCustomersPDF } from "../components/Customer_comp/DownloadCustomers";

const Customers = () => {
  // States
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [limit] = useState(10); // Items per page
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  // Apply debounce to search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch customers on initial load and when search/pagination changes
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, debouncedSearchTerm]); // Use debounced value here

  // Function to fetch customers with pagination and search
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getCustomers({
        page: currentPage,
        limit,
        search: debouncedSearchTerm, // Use debounced value here
      });
      setCustomers(response.data.customers);
      setTotalPages(response.data.totalPages);
      setTotalCustomers(response.data.totalCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCustomersPdf = async () => {
    await handleDownloadCustomersPDF({
      setExportingPDF,
      search: debouncedSearchTerm,
    });
  };

  const handleDownloadExcel = async () => {
    try {
      setExportingExcel(true);
      // Get raw data for Excel generation
      const response = await downloadCustomers({
        search: debouncedSearchTerm,
      });

      if (!response.data || !response.data.customers) {
        toast.error("Failed to retrieve data");
        return;
      }

      const { customers } = response.data;

      // Create a workbook
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Format data for Excel
      const worksheetData = customers.map((customer) => ({
        Name: customer.name || "N/A",
        Code: customer.Code || "N/A",
        Email: customer.Email || "N/A",
        Phone: customer.Phone || "N/A",
        Address: customer.address?.address1 || "N/A",
      }));

      // Create worksheet with invoice data
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

      // Create summary worksheet
      // Write to file and trigger download
      XLSX.writeFile(workbook, "Customers_List.xlsx");

      toast.success("Excel report downloaded successfully");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to download Excel report");
    } finally {
      setExportingExcel(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle form submission for creating/updating customer
  const handleSubmit = async (customerData) => {
    setLoading(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, customerData);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(customerData);
        toast.success("Customer created successfully");
      }
      await fetchCustomers();
      setShowForm(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error(error.response?.data?.message || "Faild to submit");
    } finally {
      setLoading(false);
    }
  };

  // Handle opening form for editing
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  // Handle opening details modal
  const handleViewDetails = (customer) => {
    setViewingCustomer(customer);
    setShowDetailsModal(true);
  };

  // Handle closing the form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  // Handle closing the details modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setViewingCustomer(null);
  };

  return (
    <div className="min-h-screen relative">
      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 py-8">
        <CustomerHeader onAddClick={() => setShowForm(true)} />

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Search bar */}
          <div className="flex justify-between flex-col">
            <SearchBar
              searchTerm={searchTerm}
              onChange={handleSearchChange}
              onClear={() => setSearchTerm("")}
            />
            <div className="flex mb-6 gap-2">
              <button
                disabled={exportingPDF}
                onClick={downloadCustomersPdf}
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
          </div>

          {/* Customers table */}
          <CustomersTable
            customers={customers}
            loading={loading}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalCustomers={totalCustomers}
            itemsShown={customers.length}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerFormModal
          editingCustomer={editingCustomer}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          loading={loading}
        />
      )}

      {/* Customer Details Modal */}
      {showDetailsModal && viewingCustomer && (
        <CustomerDetailsModal
          customer={viewingCustomer}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
};

// Header component with Add Customer button
const CustomerHeader = ({ onAddClick }) => (
  <div className="flex justify-between items-center mb-6">
    {/* <h1 className="text-2xl font-bold text-blue-500">Customers</h1> */}
    <header className="mb-8 flex items-center space-x-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
        <Building size={24} className="text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-blue-500">Customers</h1>
        <p className="text-blue-400 font-medium">
          Manage your Customers
        </p>
      </div>
    </header>
    <button
      onClick={onAddClick}
      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      <Plus size={18} className="mr-2" />
      Add Customer
    </button>
  </div>
);

// Search bar component
const SearchBar = ({ searchTerm, onChange, onClear }) => (
  <div className="mb-6 relative">
    <div className="flex items-center border border-blue-300 rounded-lg overflow-hidden">
      <div className="pl-3">
        <Search size={20} className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search by name or code..."
        value={searchTerm}
        onChange={onChange}
        className="w-full py-2 px-3 outline-none"
      />
      {searchTerm && (
        <button onClick={onClear} className="pr-3">
          <X size={18} className="text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  </div>
);

// Customers table component
const CustomersTable = ({ customers, loading, onEdit, onViewDetails }) => (
  <div className="overflow-x-auto rounded-md">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-blue-500">
          <th className="px-4 py-3 text-left text-sm font-medium text-white">
            Name
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-white">
            Code
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-white">
            Email
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-white">
            Phone
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-white">
            Address
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-white">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {loading && customers.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
              Loading...
            </td>
          </tr>
        ) : customers.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
              No customers found
            </td>
          </tr>
        ) : (
          customers.map((customer) => (
            <tr key={customer._id} className="hover:bg-blue-300/30">
              <td className="px-4 py-3 text-sm text-gray-700">
                {customer.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {customer.Code}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {customer.Email}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {customer.Phone}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {customer.address?.address1 || "-"}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetails(customer)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(customer)}
                    className="p-1 text-yellow-600 hover:text-yellow-800"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// Pagination footer component
const PaginationFooter = ({
  currentPage,
  totalPages,
  totalCustomers,
  itemsShown,
  onPageChange,
}) => (
  <div className="mt-6">
    <div className="flex justify-between items-center">
      <p className="text-sm text-gray-600">
        Showing {itemsShown} of {totalCustomers} customers
      </p>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  </div>
);

// Customer form modal component
const CustomerFormModal = ({ editingCustomer, onSubmit, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/10 backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white/60 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in duration-300">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-500">
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </h2>
          <button
            onClick={onClose}
            className="text-blue-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <CustomerForm
          initialData={editingCustomer}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </div>
  </div>
);

export default Customers;
