import React, { useState } from "react";
import {
  X,
  FileText,
  Package,
  DollarSign,
  PercentCircle,
  Calendar,
  Tag,
  Info,
  ShoppingBag,
  BadgeDollarSign,
  Zap,
  CreditCard,
  Building2,
  Phone,
  Mail,
  MapPin,
  Hash,
  Truck,
} from "lucide-react";
import PrintInv from "./PrintInv";
import PaymentModal from "./PaymentModal";

// Header Component
const ModalHeader = ({ onClose, lpo }) => (
  <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500 text-white p-4 rounded-t-2xl flex justify-between items-center z-20 shadow-lg border-b border-blue-400/30">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
        <FileText className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Invoice Details</h2>
        <p className="text-blue-100 text-sm">Complete invoice overview</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <PrintInv lpo={lpo} />
      <button
        onClick={onClose}
        className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-300"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  </div>
);

// Info Card Component
const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-5 border border-blue-100/50 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
  >
    <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800">
      <div className="p-2 bg-blue-100 rounded-xl mr-3">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      {title}
    </h3>
    {children}
  </div>
);

// Info Row Component
const InfoRow = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex items-center justify-between py-2 ${className}`}>
    <div className="flex items-center text-gray-600">
      <Icon className="w-4 h-4 text-blue-500 mr-2" />
      <span className="text-sm font-medium min-w-[100px]">{label}:</span>
    </div>
    <span className="font-semibold text-gray-800 text-right">{value}</span>
  </div>
);

// Payment History Table Component
const PaymentHistoryTable = ({ paymentHistory }) => (
  <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl overflow-hidden border border-blue-100/50 shadow-sm">
    <div className="bg-gradient-to-r from-blue-500 to-amber-500 text-white p-4">
      <h3 className="text-lg font-bold flex items-center">
        <CreditCard className="w-5 h-5 mr-2" />
        Payment History
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
              Bank
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-100/50">
          {paymentHistory && paymentHistory.length > 0 ? (
            paymentHistory.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-blue-50/50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(item.date).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {item.bankAccount?.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-bold text-green-600">
                    {item.amount}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <CreditCard className="w-8 h-8 text-gray-300 mb-2" />
                  <span>No payment history available</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Products Table Component
const ProductsTable = ({ products }) => (
  <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl overflow-hidden border border-blue-100/50 shadow-sm">
    <div className="bg-gradient-to-r from-blue-500 to-amber-500 text-white p-4">
      <h3 className="text-lg font-bold flex items-center">
        <Package className="w-5 h-5 mr-2" />
        Products ({products.length})
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold text-blue-800 uppercase tracking-wider">
              Qty
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">
              Unit Price
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">
              Selling Price
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-100/50">
          {products.map((product, index) => (
            <tr
              key={index}
              className="hover:bg-blue-50/50 transition-colors duration-200"
            >
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {product.description}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Hash className="w-3 h-3 text-blue-400 mr-1" />
                  <span className="text-sm text-gray-600 font-mono">
                    {product.code}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {product.stock}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className="text-sm font-bold text-gray-900">
                  {product.purchasePrice.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className="text-sm font-bold text-green-600">
                  {product.sellingPrice.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className="text-sm font-bold text-blue-600">
                  {(product.purchasePrice * product.stock).toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Totals Component
const TotalsSection = ({ subtotal, currentInvoice, vatAmount }) => (
  <div className="bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl p-6 border border-blue-200/50 shadow-sm">
    <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800">
      <div className="p-2 bg-blue-100 rounded-xl mr-3">
        <DollarSign className="w-5 h-5 text-blue-600" />
      </div>
      Financial Summary
    </h3>

    <div className="space-y-3">
      <div className="flex justify-between items-center py-2 border-b border-blue-200/50">
        <span className="text-gray-600 font-medium">Subtotal:</span>
        <span className="font-bold text-gray-800">
          {subtotal.toFixed(2)} AED
        </span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-blue-200/50">
        <span className="text-gray-600 font-medium flex items-center">
          <PercentCircle className="w-4 h-4 text-blue-400 mr-2" />
          VAT (5%):
        </span>
        <span className="font-bold text-gray-800">
          {currentInvoice.vat.toFixed(2)} AED
        </span>
      </div>

      <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-100 to-amber-100 rounded-xl px-4 border border-blue-200">
        <span className="text-blue-800 font-bold text-lg">Grand Total:</span>
        <span className="font-bold text-xl text-blue-600">
          {currentInvoice.total.toFixed(2)} AED
        </span>
      </div>

      {subtotal + vatAmount !== currentInvoice.total && (
        <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-xl">
          <p className="flex items-center text-amber-800 text-sm">
            <Info className="w-4 h-4 mr-2" />
            Adjusted total amount - (
            {currentInvoice.total - (subtotal + vatAmount)} AED)
          </p>
        </div>
      )}
    </div>
  </div>
);
// Main Modal Component
const InvoiceDetailModal = ({ invoice, onClose, onUpdate }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(invoice);

  if (!currentInvoice) return null;

  const subtotal = currentInvoice.products.reduce(
    (acc, product) => acc + product.purchasePrice * product.stock,
    0
  );
  const vatAmount = subtotal * (5 / 100);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handlePaymentComplete = (updatedInvoice) => {
    setCurrentInvoice(updatedInvoice);
    onUpdate && onUpdate(updatedInvoice);
    // Add toast notification here if needed
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden relative border border-blue-100">
          <ModalHeader onClose={onClose} lpo={currentInvoice} />

          <div className="overflow-y-auto max-h-[85vh] p-4 sm:p-6 space-y-6">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Invoice Information */}
              {currentInvoice.isInvCreated && (
                <InfoCard
                  title="Invoice Information"
                  icon={FileText}
                  className="xl:col-span-1"
                >
                  <div className="space-y-2">
                    <InfoRow
                      icon={Tag}
                      label="Invoice"
                      value={`#${currentInvoice.name}`}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Created"
                      value={formatDate(currentInvoice.invDate)}
                    />
                    <InfoRow
                      icon={DollarSign}
                      label="Total Paid"
                      value={`${currentInvoice?.totalPayedAmount} AED`}
                    />
                    <InfoRow
                      icon={BadgeDollarSign}
                      label="Balance"
                      value={`${currentInvoice?.balanceToPay.toFixed(2)} AED`}
                    />

                    {currentInvoice?.balanceToPay.toFixed(2) > 0 && (
                      <button
                        className="w-full mt-4 bg-gradient-to-r from-blue-500 to-amber-500 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-amber-600 transition-all duration-300 font-semibold flex items-center justify-center space-x-2 shadow-lg"
                        onClick={() => setShowPaymentModal(true)}
                      >
                        <Zap className="w-4 h-4" />
                        <span>Make Payment</span>
                      </button>
                    )}
                  </div>
                </InfoCard>
              )}

              {/* LPO Information */}
              <InfoCard
                title="LPO Information"
                icon={Truck}
                className="xl:col-span-1"
              >
                <div className="space-y-2">
                  <InfoRow
                    icon={Tag}
                    label="LPO"
                    value={`#${currentInvoice.lpo}`}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Created"
                    value={new Date(currentInvoice.date).toLocaleDateString(
                      "en-GB"
                    )}
                  />
                </div>
              </InfoCard>

              {/* Supplier Information */}
              <InfoCard
                title="Supplier Information"
                icon={ShoppingBag}
                className="xl:col-span-1"
              >
                {currentInvoice.supplier ? (
                  <div className="space-y-2">
                    <InfoRow
                      icon={Building2}
                      label="Name"
                      value={currentInvoice.supplier.name}
                    />
                    <InfoRow
                      icon={Mail}
                      label="Email"
                      value={currentInvoice.supplier.email}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Phone"
                      value={currentInvoice.supplier.phone}
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Address"
                      value={currentInvoice.supplier.address}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <div className="text-center">
                      <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p>No supplier information available</p>
                    </div>
                  </div>
                )}
              </InfoCard>
            </div>

            {/* Payment History */}
            {currentInvoice.paymentHistory?.length > 0 && (
              <PaymentHistoryTable
                paymentHistory={currentInvoice.paymentHistory}
              />
            )}

            {/* Products Table */}
            <ProductsTable products={currentInvoice.products} />

            {/* Totals */}
            <TotalsSection
              subtotal={subtotal}
              currentInvoice={currentInvoice}
              vatAmount={vatAmount}
            />
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          invoice={currentInvoice}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default InvoiceDetailModal;
