import React from "react";
import {
  Search,
  FileText,
  Loader2,
  CheckSquare,
  DollarSign,
  Plus,
  X,
  Printer,
} from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import InvoiceDetailsModal from "../components/Invoice_comp/InvoiceDetailsModal";
import InvoiceRepaymentModal from "../components/Invoice_comp/InvoiceRepaymentModal";
import InvoicesList from "../components/Invoice_comp/InvoicesList";
import UpdateExpDateModal from "../components/Invoice_comp/UpdateExpDateModal";
import InvoiceStats from "../components/Invoice_comp/InvoiceStats";
import { printMultipleInvoices, printLargeInvoiceBatch } from "../components/Invoice_comp/PrintInv";
import ConfirmationModal from "../components/SalesOrder_comp/ConfirmationModal";
import ProductNoteModal from "../components/SalesOrder_comp/ProductNoteModal";

// Import new components
import InvoiceFiltersPanel from "../components/Invoice_comp/InvoiceFiltersPanel";
import InvoiceCreationForm from "../components/Invoice_comp/InvoiceCreationForm";

// Import custom hooks
import { useInvoiceLogic } from "../hooks/useInvoiceLogic";
import { useInvoiceHandlers } from "../hooks/useInvoiceHandlers";

const Invoices = () => {
  // Use custom hooks for logic and handlers
  const invoiceLogic = useInvoiceLogic();
  const invoiceHandlers = useInvoiceHandlers(invoiceLogic);

  // Destructure commonly used state and functions
  const {
    view,
    setView,
    invoices,
    loading,
    searchTerm,
    setSearchTerm,
    selectedInvoice,
    currentPage,
    totalPages,
    isModalOpen,
    selectedInvoices,
    isRepaymentModalOpen,
    isFullPayment,
    banks,
    selectedCustomer,
    exportingPDF,
    setExportingPDF,
    printingInvoices,
    setPrintingInvoices,
    error,
    invoiceStats,
    statsLoading,
    isUpdateExpDateModalOpen,
    invoiceToUpdateExpDate,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    noteModalOpen,
    setNoteModalOpen,
    currentItemForNote,
    noteType,
    // Creation form states
    selectedCustomerForInvoice,
    selectedProducts,
    selectedServices,
    selectedCredits,
    invoiceDate,
    discount,
    vatRate,
    emptyRows,
    itemType,
    isEditMode,
    editingInvoice,
    batchModalOpen,
    selectedProductForBatch,
    pendingRowId,
    noteInputRefs,
    // Filter states
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showOverdueOnly,
    setShowOverdueOnly,
    showPaymentClearedOnly,
    setShowPaymentClearedOnly,
    showPendingOnly,
    setShowPendingOnly,
    showCancelledOnly,
    setShowCancelledOnly,
  sortOrder,
  setSortOrder,
    // Functions
    calculateTotal,
    downloadPdf,
    handleDownloadExcel,
    exportingExcel,
  } = invoiceLogic;

  const {
    handleCustomerSelect,
    handleClearCustomer,
    handlePageChange,
    handleInvoiceSelect,
    closeInvoiceDetails,
    handleInvoiceCheckboxChange,
    openRepaymentModal,
    closeRepaymentModal,
    handleRepayment,
    handleUpdateExpDateFromDetails,
    handleUpdateExpDate,
    closeUpdateExpDateModal,
    resetFilters,
    handleEditInvoice,
    resetInvoiceForm,
    // Creation form handlers
    handleCustomerSelectForInvoice,
    handleProductNoteChange,
    handleServiceNoteChange,
    handleProductQuantityChange,
    handleServiceQuantityChange,
    handleProductPriceChange,
    handleServicePriceChange,
    handleRemoveProduct,
    handleRemoveService,
    handleCreditAdd,
    handleCreditChange,
    handleRemoveCredit,
    handleCreditSelect,
    handleEmptyRowSearch,
    handleEmptyRowItemSelect,
    handleRemoveEmptyRow,
    handleBatchSelect,
    handleCreateInvoice,
  } = invoiceHandlers;

  // Note handling functions
  const openNoteModal = (item, type) => {
    // Implementation from original component
    invoiceLogic.setCurrentItemForNote(item);
    invoiceLogic.setNoteType(type);
    setNoteModalOpen(true);
  };

  const handleSaveNote = (note) => {
    if (noteType === "product") {
      invoiceLogic.setSelectedProducts(
        selectedProducts.map((p) =>
          p._id === currentItemForNote._id ? { ...p, note } : p
        )
      );
    } else if (noteType === "service") {
      invoiceLogic.setSelectedServices(
        selectedServices.map((s) =>
          s._id === currentItemForNote._id ? { ...s, note } : s
        )
      );
    }
    setNoteModalOpen(false);
    invoiceLogic.setCurrentItemForNote(null);
  };

  const handleConfirmDuplicate = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <header className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Invoices</h1>
            <p className="text-blue-500 font-medium">Manage Invoices</p>
          </div>
        </header>

        {view === "list" ? (
          <button
            onClick={() => {
              setView("create");
              resetInvoiceForm();
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Create Invoice
          </button>
        ) : (
          <button
            onClick={() => {
              setView("list");
              resetInvoiceForm();
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

      {view === "list" && (
        <InvoiceStats stats={invoiceStats} loading={statsLoading} />
      )}

      {view === "list" ? (
        <>
          {/* Search bar and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="text"
                placeholder="Search invoices by name..."
                className="pl-10 w-full p-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

              {/* Sort select - server-side */}
              <div className="flex items-center ml-3">
                <label className="mr-2 text-sm text-blue-600">Sort:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 border text-gray-700 border-blue-500 rounded-md"
                  title="Sort invoices by date"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => openRepaymentModal(true)}
                disabled={selectedInvoices.length === 0}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  selectedInvoices.length > 0
                    ? "bg-green-500 text-white hover:bg-green-600 shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <CheckSquare size={16} />
                <span>Full Payment</span>
              </button>

              <button
                onClick={() => openRepaymentModal(false)}
                disabled={selectedInvoices.length === 0}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  selectedInvoices.length > 0
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <DollarSign size={16} />
                <span>Partial Payment</span>
              </button>

              <button
                onClick={() => {
                  // Automatically choose the appropriate printing method based on quantity
                  if (selectedInvoices.length > 30) {
                    printLargeInvoiceBatch({
                      selectedInvoices,
                      setPrintingInvoices
                    });
                  } else {
                    printMultipleInvoices({
                      selectedInvoices,
                      setPrintingInvoices
                    });
                  }
                }}
                disabled={selectedInvoices.length === 0 || printingInvoices}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  selectedInvoices.length > 0 && !printingInvoices
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                title={`Print selected invoices${selectedInvoices.length > 30 ? ' (Large batch mode)' : ''}`}
              >
                <Printer size={16} />
                <span>{printingInvoices ? "Printing..." : `Print Invoices${selectedInvoices.length > 30 ? ' (Batch)' : ''}`}</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <InvoiceFiltersPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCustomer={selectedCustomer}
            handleCustomerSelect={handleCustomerSelect}
            handleClearCustomer={handleClearCustomer}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            showOverdueOnly={showOverdueOnly}
            setShowOverdueOnly={setShowOverdueOnly}
            showPaymentClearedOnly={showPaymentClearedOnly}
            setShowPaymentClearedOnly={setShowPaymentClearedOnly}
            showPendingOnly={showPendingOnly}
            setShowPendingOnly={setShowPendingOnly}
            showCancelledOnly={showCancelledOnly}
            setShowCancelledOnly={setShowCancelledOnly}
            invoices={invoices}
            resetFilters={resetFilters}
            downloadPdf={downloadPdf}
            handleDownloadExcel={handleDownloadExcel}
            exportingPDF={exportingPDF}
            exportingExcel={exportingExcel}
          />

          {/* Selected Invoices Count and Print Button */}
          {selectedInvoices.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-blue-700">
                    {selectedInvoices.length}
                  </span>{" "}
                  <span className="text-blue-600">invoice(s) selected</span>
                  {selectedInvoices.length > 30 && (
                    <div className="text-xs text-orange-600 mt-1">
                      Large batch detected - will use optimized printing mode
                    </div>
                  )}
                  {selectedInvoices.length > 6 && selectedInvoices.length <= 30 && (
                    <div className="text-xs text-blue-500 mt-1">
                    
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    // Automatically choose the appropriate printing method based on quantity
                    if (selectedInvoices.length > 30) {
                      printLargeInvoiceBatch({
                        selectedInvoices,
                        setPrintingInvoices
                      });
                    } else {
                      printMultipleInvoices({
                        selectedInvoices,
                        setPrintingInvoices
                      });
                    }
                  }}
                  disabled={printingInvoices}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    !printingInvoices
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  title={`Print selected invoices${selectedInvoices.length > 30 ? ' (Large batch mode)' : ''}`}
                >
                  <Printer size={18} />
                  <span>{printingInvoices ? "Printing..." : `Print Selected Invoices${selectedInvoices.length > 30 ? ' (Batch)' : ''}`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Invoices Table */}
          {loading && !selectedInvoice ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : selectedInvoice ? (
            <InvoiceDetailsModal
              invoice={selectedInvoice}
              isOpen={isModalOpen}
              onClose={closeInvoiceDetails}
              onUpdateExpDate={handleUpdateExpDateFromDetails}
            />
          ) : (
            <>
              <InvoicesList
                invoices={invoices}
                selectedInvoices={selectedInvoices}
                handleInvoiceCheckboxChange={handleInvoiceCheckboxChange}
                handleInvoiceSelect={handleInvoiceSelect}
                onInvoiceUpdate={() => {
                  invoiceLogic.fetchInvoices();
                  invoiceLogic.fetchStats();
                }}
                onEditInvoice={handleEditInvoice}
              />

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
          )}
        </>
      ) : (
        // Create Invoice Form
        <InvoiceCreationForm
          isEditMode={isEditMode}
          editingInvoice={editingInvoice}
          selectedCustomerForInvoice={selectedCustomerForInvoice}
          handleCustomerSelectForInvoice={handleCustomerSelectForInvoice}
          invoiceDate={invoiceDate}
          setInvoiceDate={invoiceLogic.setInvoiceDate}
          lpo={invoiceLogic.lpo}
          setLpo={invoiceLogic.setLpo}
          itemType={itemType}
          setItemType={invoiceLogic.setItemType}
          selectedProducts={selectedProducts}
          selectedServices={selectedServices}
          selectedCredits={selectedCredits}
          emptyRows={emptyRows}
          setEmptyRows={invoiceLogic.setEmptyRows}
          handleEmptyRowSearch={handleEmptyRowSearch}
          handleEmptyRowItemSelect={handleEmptyRowItemSelect}
          handleRemoveEmptyRow={handleRemoveEmptyRow}
          handleProductNoteChange={handleProductNoteChange}
          handleServiceNoteChange={handleServiceNoteChange}
          handleProductQuantityChange={handleProductQuantityChange}
          handleServiceQuantityChange={handleServiceQuantityChange}
          handleProductPriceChange={handleProductPriceChange}
          handleServicePriceChange={handleServicePriceChange}
          handleRemoveProduct={handleRemoveProduct}
          handleRemoveService={handleRemoveService}
          handleCreditAdd={handleCreditAdd}
          handleCreditChange={handleCreditChange}
          handleRemoveCredit={handleRemoveCredit}
          discount={discount}
          setDiscount={invoiceLogic.setDiscount}
          vatRate={vatRate}
          calculateTotal={calculateTotal}
          loading={loading}
          handleCreateInvoice={handleCreateInvoice}
          setView={setView}
          resetInvoiceForm={resetInvoiceForm}
          noteInputRefs={noteInputRefs}
          batchModalOpen={batchModalOpen}
          setBatchModalOpen={invoiceLogic.setBatchModalOpen}
          selectedProductForBatch={selectedProductForBatch}
          setSelectedProductForBatch={invoiceLogic.setSelectedProductForBatch}
          pendingRowId={pendingRowId}
          setPendingRowId={invoiceLogic.setPendingRowId}
          handleBatchSelect={handleBatchSelect}
        />
      )}

      {/* Modals */}
      {isRepaymentModalOpen && (
        <InvoiceRepaymentModal
          isOpen={isRepaymentModalOpen}
          onClose={closeRepaymentModal}
          selectedInvoices={selectedInvoices}
          onRepayment={handleRepayment}
          isFullPayment={isFullPayment}
          banks={banks}
        />
      )}

      {isUpdateExpDateModalOpen && (
        <UpdateExpDateModal
          isOpen={isUpdateExpDateModalOpen}
          onClose={closeUpdateExpDateModal}
          invoice={invoiceToUpdateExpDate}
          onUpdate={handleUpdateExpDate}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDuplicate}
          message="This product is already selected. Do you want to add it again?"
        />
      )}

      {noteModalOpen && (
        <ProductNoteModal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          onSave={handleSaveNote}
          currentNote={currentItemForNote?.note || ""}
          itemName={currentItemForNote?.name || ""}
          itemType={noteType}
        />
      )}
    </div>
  );
};

export default Invoices;
