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
import { printMultipleInvoicesJsPDF as printMultipleInvoices } from "../components/Invoice_comp/DownloadSelectedInvoices";
import ConfirmationModal from "../components/SalesOrder_comp/ConfirmationModal";
import ProductNoteModal from "../components/SalesOrder_comp/ProductNoteModal";

// Import new components
import InvoiceFiltersPanel from "../components/Invoice_comp/InvoiceFiltersPanel";
import InvoiceCreationForm from "../components/Invoice_comp/InvoiceCreationForm";

// Import custom hooks
import { useInvoiceLogic } from "../hooks/useInvoiceLogic";
import { useInvoiceHandlers } from "../hooks/useInvoiceHandlers";

const Invoices = () => {
  // State for seal and signature checkboxes
  const [includeSeal, setIncludeSeal] = React.useState(true);
  const [includeSignature, setIncludeSignature] = React.useState(false);

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
    creationOrder,
    invoiceDate,
    lpo,
    setLpo,
    discount,
    vatRate,
    emptyRows,
    itemType,
    isEditMode,
    editingInvoice,
    isDuplicateMode,
    duplicateSourceInvoice,
    duplicateGuard,
    batchModalOpen,
    selectedProductForBatch,
    pendingRowId,
    noteInputRefs,
    inlineInsert,
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
    handleDuplicateInvoice,
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
    handleAddLineBelow,
    handleInlineInsertSearch,
    handleInlineItemSelect,
    handleInlineTypeChange,
    handleCancelInlineInsert,
    handleBatchSelect,
    handleCreateInvoice,
    exitDuplicateMode,
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
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            invoices={invoices}
            resetFilters={resetFilters}
            downloadPdf={downloadPdf}
            handleDownloadExcel={handleDownloadExcel}
            exportingPDF={exportingPDF}
            exportingExcel={exportingExcel}
          />

          {/* Print Options Panel - Only show when invoices are selected */}
          {selectedInvoices.length > 0 && (
            <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl shadow-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Print Options */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg">
                    <Printer size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Print Options:</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
                    <input
                      type="checkbox"
                      checked={includeSeal}
                      onChange={(e) => setIncludeSeal(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Seal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors">
                    <input
                      type="checkbox"
                      checked={includeSignature}
                      onChange={(e) => setIncludeSignature(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Signature</span>
                  </label>
                </div>

                {/* Print Button */}
                <button
                  onClick={async () => {
                    setPrintingInvoices(true);
                    try {
                      await printMultipleInvoices(selectedInvoices, includeSeal, includeSignature);
                    } catch (error) {
                      console.error("Print error:", error);
                    } finally {
                      setPrintingInvoices(false);
                    }
                  }}
                  disabled={printingInvoices}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    !printingInvoices
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  title="Print selected invoices"
                >
                  <Printer size={18} />
                  <span>{printingInvoices ? "Printing..." : `Print ${selectedInvoices.length} Invoice${selectedInvoices.length > 1 ? 's' : ''}`}</span>
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
                onDuplicateInvoice={handleDuplicateInvoice}
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
          lpo={lpo}
          setLpo={setLpo}
          itemType={itemType}
          setItemType={invoiceLogic.setItemType}
          selectedProducts={selectedProducts}
          selectedServices={selectedServices}
          selectedCredits={selectedCredits}
          creationOrder={creationOrder}
          inlineInsert={inlineInsert}
          emptyRows={emptyRows}
          handleEmptyRowSearch={handleEmptyRowSearch}
          handleEmptyRowItemSelect={handleEmptyRowItemSelect}
          handleRemoveEmptyRow={handleRemoveEmptyRow}
          handleAddLineBelow={handleAddLineBelow}
          handleInlineInsertSearch={handleInlineInsertSearch}
          handleInlineItemSelect={handleInlineItemSelect}
          handleCancelInlineInsert={handleCancelInlineInsert}
          handleInlineTypeChange={handleInlineTypeChange}
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
          isDuplicateMode={isDuplicateMode}
          duplicateSourceInvoice={duplicateSourceInvoice}
          duplicateGuard={duplicateGuard}
          exitDuplicateMode={exitDuplicateMode}
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
