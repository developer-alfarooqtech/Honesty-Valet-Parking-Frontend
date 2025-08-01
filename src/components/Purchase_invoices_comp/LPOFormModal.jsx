import React from "react";
import { X, TrendingUp, PlusCircle } from "lucide-react";
import InvoiceForm from "./InvoiceForm";
import SupplierForm from "./SupplierForm";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";

const LPOFormModal = ({
  isOpen,
  onClose,
  supplierId,
  setSupplierId,
  suppliers,
  showSupplierForm,
  setShowSupplierForm,
  vatRate,
  onVatRateChange,
  setSelectedDate,
  selectedDate,
  newSupplier,
  setNewSupplier,
  onSaveSupplier,
  newProduct,
  setNewProduct,
  addProduct,
  products,
  onRemoveProduct,
  payedAmount,
  setPayedAmount,
  balanceToPay,
  setBalanceToPay,
  setSelectedBank,
  isEditing,
  handleUpdateLPO,
  createInvoice,
  creating
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md animate-fade-in flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Edit LPO" : "Create New LPO"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Invoice Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <InvoiceForm
              supplierId={supplierId}
              setSupplierId={setSupplierId}
              suppliers={suppliers}
              showSupplierForm={showSupplierForm}
              setShowSupplierForm={setShowSupplierForm}
              vatRate={vatRate}
              onVatRateChange={onVatRateChange}
              setSelectedDate={setSelectedDate}
              selectedDate={selectedDate}
            />

            {showSupplierForm && (
              <div className="mt-4">
                <SupplierForm
                  newSupplier={newSupplier}
                  setNewSupplier={setNewSupplier}
                  onSave={onSaveSupplier}
                />
              </div>
            )}
          </div>

          {/* Product Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <ProductForm
              newProduct={newProduct}
              setNewProduct={setNewProduct}
              addProduct={addProduct}
            />
          </div>

          {/* Products Table */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
              Products in Invoice
            </h3>

            <ProductTable
              products={products}
              onRemoveProduct={onRemoveProduct}
              vatRate={vatRate}
              payedAmount={payedAmount}
              setPayedAmount={setPayedAmount}
              balanceToPay={balanceToPay}
              setBalanceToPay={setBalanceToPay}
              setSelectedBank={setSelectedBank}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={isEditing ? handleUpdateLPO : createInvoice}
            disabled={products.length === 0 || creating}
            className={`flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
              products.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {creating ? "Processing..." : isEditing ? "Update LPO" : "Create LPO"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LPOFormModal;