import React, { useState, useEffect } from "react";
import { ReceiptText, Search, Plus, Calendar, DollarSign, Clock, CheckSquare, X, FileText, FileSpreadsheet, ArrowRight, User, Building2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";
import CreditNoteDetailsModal from "../components/CreditNote_comp/CreditNoteDetailsModal";
import CustomerSearch from "../components/Customer_comp/CustomerSearch";
import InvoiceSearch from "../components/Invoice_comp/InvoiceSearch";
import {
  fetchAllCreditNotes,
  fetchCreditNoteStats,
  createInvoiceCreditNote,
  createIndependentCreditNote,
  downloadCreditNotes
} from "../service/creditNoteService";

const CreditNotes = () => {
  // View state - 'list', 'create-invoice', or 'create-independent'
  const [view, setView] = useState("list");
  
  // Main data states
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreditNotes, setSelectedCreditNotes] = useState([]);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showProcessedOnly, setShowProcessedOnly] = useState(false);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showCancelledOnly, setShowCancelledOnly] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [creditTypeFilter, setCreditTypeFilter] = useState("all"); // 'all', 'invoice', 'independent'
  
  // Create form states - Invoice-based
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditDate, setCreditDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [processImmediately, setProcessImmediately] = useState(false); // Add this
  const [error, setError] = useState("");
  
  // Create form states - Independent
  const [independentCustomer, setIndependentCustomer] = useState(null);
  const [independentAmount, setIndependentAmount] = useState(0);
  const [independentDate, setIndependentDate] = useState(new Date().toISOString().split("T")[0]);
  const [independentDescription, setIndependentDescription] = useState("");
  const [independentReference, setIndependentReference] = useState("");
  const [independentProcessImmediately, setIndependentProcessImmediately] = useState(false); // Add this
  
  // Statistics
  const [stats, setStats] = useState({
    totalCreditNotes: 0,
    totalCreditAmount: 0,
    pendingCredits: 0,
    processedCredits: 0,
    invoiceBasedCredits: 0,
    independentCredits: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    fetchCreditNotes();
    fetchStats();
  }, [
    debouncedSearchTerm,
    currentPage,
    startDate,
    endDate,
    showProcessedOnly,
    showPendingOnly,
    showCancelledOnly,
    selectedCustomer,
    creditTypeFilter,
  ]);
  
  const fetchCreditNotes = async () => {
    setLoading(true);
    try {
      const response = await fetchAllCreditNotes({
        currentPage,
        limit,
        debouncedSearchTerm,
        startDate,
        endDate,
        showProcessedOnly,
        showPendingOnly,
        showCancelledOnly,
        customerId: selectedCustomer?._id || "",
        creditTypeFilter,
      });
      
      const data = response.data;
      if (data.success) {
        // Backend returns 'data' array, not 'creditNotes'
        setCreditNotes(data.data || []);
        // Backend returns pagination object with totalPages
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error("Failed to fetch credit notes:", data.message);
        setCreditNotes([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching credit notes:", error);
      setCreditNotes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetchCreditNoteStats({ 
        customerId: selectedCustomer?._id || "" 
      });
      
      const data = response.data;
      if (data.success && data.data) {
        // Backend returns stats in data.data, not data.stats
        setStats({
          totalCreditNotes: data.data.totalCreditNotes || 0,
          totalCreditAmount: data.data.totalCreditAmount || 0,
          pendingCredits: data.data.pendingCredits || 0,
          processedCredits: data.data.processedCredits || 0,
          invoiceBasedCredits: data.data.invoiceBasedCredits || 0,
          independentCredits: data.data.independentCredits || 0,
        });
      } else {
        console.error("Failed to fetch credit note stats:", data.message);
        // Set default stats on failure
        setStats({
          totalCreditNotes: 0,
          totalCreditAmount: 0,
          pendingCredits: 0,
          processedCredits: 0,
          invoiceBasedCredits: 0,
          independentCredits: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching credit note stats:", error);
      // Set default stats on error
      setStats({
        totalCreditNotes: 0,
        totalCreditAmount: 0,
        pendingCredits: 0,
        processedCredits: 0,
        invoiceBasedCredits: 0,
        independentCredits: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount).toFixed(2)}`;
  };
  
  const handleCreditNoteSelect = (creditNote) => {
    setSelectedCreditNote(creditNote);
    setIsModalOpen(true);
  };
  
  const closeCreditNoteDetails = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCreditNote(null), 300);
  };

  const handleCreditNoteUpdate = (updatedCreditNote) => {
    // Update the credit note in the list
    setCreditNotes(prevNotes => 
      prevNotes.map(note => 
        note._id === updatedCreditNote._id ? updatedCreditNote : note
      )
    );
    // Refresh stats
    fetchStats();
    toast.success("Credit note processed successfully");
  };

  const handleCreditNoteCheckboxChange = (creditNote, checked) => {
    if (checked) {
      setSelectedCreditNotes((prev) => [...prev, creditNote]);
    } else {
      setSelectedCreditNotes((prev) =>
        prev.filter((cn) => cn._id !== creditNote._id)
      );
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setShowProcessedOnly(false);
    setShowPendingOnly(false);
    setShowCancelledOnly(false);
    setSelectedCustomer(null);
    setCurrentPage(1);
  };
  
  const handleCreateInvoiceCreditNote = async () => {
    if (!selectedInvoice) {
      setError("Please select an invoice");
      toast.error("Please select an invoice");
      return;
    }
    
    if (!creditAmount || creditAmount <= 0) {
      setError("Please enter a valid credit amount");
      toast.error("Please enter a valid credit amount");
      return;
    }

    
    setLoading(true);
    try {
      const creditNoteData = {
        invoiceId: selectedInvoice._id,
        creditAmount: parseFloat(creditAmount),
        description: description.trim(),
        date: creditDate,
        processImmediately: processImmediately
      };

      const response = await createInvoiceCreditNote(creditNoteData);
      const data = response.data;

      if (data.success) {
        toast.success("Invoice credit note created successfully");
        setView("list");
        resetInvoiceCreditNoteForm();
        fetchCreditNotes();
        fetchStats();
      } else {
        setError(data.message || "Failed to create credit note");
        toast.error(data.message || "Failed to create credit note");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create credit note";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateIndependentCreditNote = async () => {
    if (!independentCustomer) {
      setError("Please select a customer");
      toast.error("Please select a customer");
      return;
    }
    
    if (!independentAmount || independentAmount <= 0) {
      setError("Please enter a valid credit amount");
      toast.error("Please enter a valid credit amount");
      return;
    }
    
  
    
    setLoading(true);
    try {
      const creditNoteData = {
        customerId: independentCustomer._id,
        creditAmount: parseFloat(independentAmount),
        description: independentDescription.trim(),
        reference: independentReference.trim(),
        date: independentDate,
        processImmediately: independentProcessImmediately
      };

      const response = await createIndependentCreditNote(creditNoteData);
      const data = response.data;

      if (data.success) {
        toast.success("Independent credit note created successfully");
        setView("list");
        resetIndependentCreditNoteForm();
        fetchCreditNotes();
        fetchStats();
      } else {
        setError(data.message || "Failed to create credit note");
        toast.error(data.message || "Failed to create credit note");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create credit note";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const resetInvoiceCreditNoteForm = () => {
    setSelectedInvoice(null);
    setCreditAmount(0);
    setCreditDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setProcessImmediately(false); // Add this
    setError("");
  };
  
  const resetIndependentCreditNoteForm = () => {
    setIndependentCustomer(null);
    setIndependentAmount(0);
    setIndependentDate(new Date().toISOString().split("T")[0]);
    setIndependentDescription("");
    setIndependentReference("");
    setIndependentProcessImmediately(false); // Add this
    setError("");
  };
  
  const downloadPdf = async () => {
    setExportingPDF(true);
    try {
      // Simulate PDF generation
      setTimeout(() => {
        toast.success("PDF report downloaded successfully");
        setExportingPDF(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to download PDF report");
      setExportingPDF(false);
    }
  };
  
  const handleDownloadExcel = async () => {
    setExportingExcel(true);
    try {
      // Simulate Excel generation
      setTimeout(() => {
        toast.success("Excel report downloaded successfully");
        setExportingExcel(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to download Excel report");
      setExportingExcel(false);
    }
  };
  
  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <header className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-lg shadow-lg">
              <ReceiptText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Credit Notes</h1>
              <p className="text-blue-500 font-medium">Manage customer credit notes</p>
            </div>
          </header>

          {view === "list" ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setView("create-invoice");
                  resetInvoiceCreditNoteForm();
                }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg"
              >
                <FileText size={20} className="mr-2" />
                Invoice Credit
              </button>
              <button
                onClick={() => {
                  setView("create-independent");
                  resetIndependentCreditNoteForm();
                }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-lg"
              >
                <Edit size={20} className="mr-2" />
                Manual Credit
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setView("list");
                resetInvoiceCreditNoteForm();
                resetIndependentCreditNoteForm();
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg"
            >
              <X size={20} className="mr-2" />
              Cancel
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {view === "list" ? (  
          <>
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-500 uppercase tracking-wide">Total Credit Notes</p>
                    <p className="text-3xl font-bold text-blue-600">{statsLoading ? "..." : stats.totalCreditNotes}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <ReceiptText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-500 uppercase tracking-wide">Total Amount</p>
                    <p className="text-3xl font-bold text-blue-600">{statsLoading ? "..." : formatCurrency(stats.totalCreditAmount)}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-500 uppercase tracking-wide">Pending Credits</p>
                    <p className="text-3xl font-bold text-orange-600">{statsLoading ? "..." : stats.pendingCredits}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-500 uppercase tracking-wide">Processed Credits</p>
                    <p className="text-3xl font-bold text-green-600">{statsLoading ? "..." : stats.processedCredits}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckSquare className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-500 uppercase tracking-wide">Invoice Credits</p>
                    <p className="text-3xl font-bold text-blue-600">{statsLoading ? "..." : stats.invoiceBasedCredits}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div> */}
{/* 
              <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-500 uppercase tracking-wide">Manual Credits</p>
                    <p className="text-3xl font-bold text-purple-600">{statsLoading ? "..." : stats.independentCredits}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Edit className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div> */}
            </div>

            {/* Search and Filters */}
            <div className="bg-white border border-blue-200 rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Search className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">Filters & Search</h3>
                      <p className="text-sm text-blue-600">Refine your credit note search</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{creditNotes.length}</div>
                      <div className="text-xs text-blue-500">Results</div>
                    </div>
                    {(startDate || endDate || showProcessedOnly || showPendingOnly || showCancelledOnly || selectedCustomer || creditTypeFilter !== 'all') && (
                      <button
                        onClick={resetFilters}
                        className="flex items-center px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors text-xs font-medium"
                      >
                        <X size={14} className="mr-1" />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Search Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Credit Notes</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by credit note number or customer..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                  {/* Date Range */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 text-sm"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Credit Type Filter */}
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit Type</label>
                    <select
                      value={creditTypeFilter}
                      onChange={(e) => setCreditTypeFilter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="invoice">Invoice Credits</option>
                      <option value="independent">Manual Credits</option>
                    </select>
                  </div>

                  {/* Status Filters */}
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Filters</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={showPendingOnly}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShowPendingOnly(true);
                              setShowProcessedOnly(false);
                              setShowCancelledOnly(false);
                            } else {
                              setShowPendingOnly(false);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Pending Only</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={showProcessedOnly}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShowProcessedOnly(true);
                              setShowPendingOnly(false);
                              setShowCancelledOnly(false);
                            } else {
                              setShowProcessedOnly(false);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Processed Only</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={showCancelledOnly}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShowCancelledOnly(true);
                              setShowPendingOnly(false);
                              setShowProcessedOnly(false);
                            } else {
                              setShowCancelledOnly(false);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Cancelled Only</span>
                      </label>
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Data</label>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={downloadPdf}
                        disabled={exportingPDF}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm font-medium"
                      >
                        <FileText size={14} />
                        {exportingPDF ? "Generating..." : "PDF"}
                      </button>
                      <button
                        onClick={handleDownloadExcel}
                        disabled={exportingExcel}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm font-medium"
                      >
                        <FileSpreadsheet size={14} />
                        {exportingExcel ? "Generating..." : "Excel"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Notes Table */}
            <div className="bg-white border border-blue-200 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200">
                  <thead className="bg-blue-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCreditNotes(creditNotes);
                            } else {
                              setSelectedCreditNotes([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Credit Note</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Invoice/Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-blue-600">Loading credit notes...</span>
                          </div>
                        </td>
                      </tr>
                    ) : creditNotes.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-blue-500">
                          {debouncedSearchTerm
                            ? "No credit notes found matching your search."
                            : "No credit notes found. Create your first credit note!"}
                        </td>
                      </tr>
                    ) : (
                      creditNotes.map((creditNote) => (
                        <tr key={creditNote._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedCreditNotes.some(cn => cn._id === creditNote._id)}
                              onChange={(e) => handleCreditNoteCheckboxChange(creditNote, e.target.checked)}
                              className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleCreditNoteSelect(creditNote)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {creditNote.creditNoteNumber}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              creditNote.type === 'invoice'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {creditNote.type === 'invoice' ? (
                                <>
                                  <FileText size={12} className="mr-1" />
                                  Invoice
                                </>
                              ) : (
                                <>
                                  <Edit size={12} className="mr-1" />
                                  Manual
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {creditNote.type === 'invoice' 
                              ? creditNote.invoice?.name || 'N/A'
                              : creditNote.reference || 'N/A'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {creditNote.customer?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                            -{formatCurrency(creditNote.creditAmount)}
                          </td>
                        
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              creditNote.status === 'processed'
                                ? 'bg-green-100 text-green-800'
                                : creditNote.status === 'pending'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {creditNote.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatDate(creditNote.date)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="py-4"
                />
              </div>
            )}
          </>
        ) : view === "create-invoice" ? (
          // Create Invoice-Based Credit Note Form
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-8">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-slate-500 to-slate-600 p-3 rounded-lg mr-4">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Create Credit Note Against Invoice</h2>
                <p className="text-slate-600 text-sm">Issue a credit note for a specific customer invoice</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Invoice Selection */}
              <InvoiceSearch
                onInvoiceSelect={setSelectedInvoice}
                selectedInvoice={selectedInvoice}
                onClearInvoice={() => setSelectedInvoice(null)}
                customerId={selectedInvoice?.customer?._id || ""}
              />

              {/* Credit Amount and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Amount (AED) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 text-gray-700"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={creditDate}
                    onChange={(e) => setCreditDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 text-gray-700"
                  />
                </div>
              </div>

           

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 text-gray-700 resize-none"
                  placeholder="Enter additional details about the credit note..."
                />
              </div>

              {/* Process Immediately Checkbox */}
              <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="processImmediately"
                  checked={processImmediately}
                  onChange={(e) => setProcessImmediately(e.target.checked)}
                  className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                />
                <label htmlFor="processImmediately" className="text-sm text-gray-700 cursor-pointer">
                  <span className="font-medium">Process immediately</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Credit will be active right away (bypasses pending status)
                  </p>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setView("list");
                    resetInvoiceCreditNoteForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handleCreateInvoiceCreditNote}
                  disabled={loading || !selectedInvoice || !creditAmount }
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    loading || !selectedInvoice || !creditAmount
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-lg"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      {processImmediately ? "Create & Process Credit Note" : "Create Credit Note"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Create Independent Credit Note Form
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-8">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-3 rounded-lg mr-4">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Create Independent Credit Note</h2>
                <p className="text-slate-600 text-sm">Issue a standalone credit note for a customer</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {independentCustomer ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-800">{independentCustomer.name}</div>
                        <div className="text-sm text-blue-600">{independentCustomer.Code}</div>
                      </div>
                      <button
                        onClick={() => setIndependentCustomer(null)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <CustomerSearch
                      onSelect={setIndependentCustomer}
                      selectedIds={[]}
                      excludeIds={[]}
                      label="Search and select a customer"
                    />
                  )}
                </div>
              </div>

              {/* Credit Amount, Date, and Reference */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Amount (AED) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={independentAmount}
                    onChange={(e) => setIndependentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 text-gray-700"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={independentDate}
                    onChange={(e) => setIndependentDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={independentReference}
                    onChange={(e) => setIndependentReference(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 text-gray-700"
                    placeholder="REF-001"
                  />
                </div>
              </div>

            

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={independentDescription}
                  onChange={(e) => setIndependentDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 text-gray-700 resize-none"
                  placeholder="Enter additional details about the credit note..."
                />
              </div>

              {/* Process Immediately Checkbox */}
              <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="independentProcessImmediately"
                  checked={independentProcessImmediately}
                  onChange={(e) => setIndependentProcessImmediately(e.target.checked)}
                  className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                />
                <label htmlFor="independentProcessImmediately" className="text-sm text-gray-700 cursor-pointer">
                  <span className="font-medium">Process immediately</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Credit will be active right away (bypasses pending status)
                  </p>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setView("list");
                    resetIndependentCreditNoteForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handleCreateIndependentCreditNote}
                  disabled={loading || !independentCustomer || !independentAmount}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    loading || !independentCustomer || !independentAmount 
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      {independentProcessImmediately ? "Create & Process Credit Note" : "Create Credit Note"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credit Note Details Modal */}
        <CreditNoteDetailsModal
          creditNote={selectedCreditNote}
          isOpen={isModalOpen}
          onClose={closeCreditNoteDetails}
          onUpdate={handleCreditNoteUpdate}
        />
      </div>
    </div>
  );
};

export default CreditNotes;