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
  User,
  Briefcase,
  IdCard,
  AlertCircle,
  Receipt,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import PrintInv from "./PrintInv";
import PaymentModal from "./PaymentModal";  

// Header Component
const ModalHeader = ({ onClose, invoice }) => (
  <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-xl flex justify-between items-center z-20 shadow-lg border-b border-blue-500/30">
    <div className="flex items-center space-x-3">
      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
        <FileText className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Invoice Details</h2>
        <p className="text-blue-100 text-sm">
          Invoice #{invoice?.name}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <PrintInv invoice={invoice}/>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-300"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  </div>
);

// Info Card Component
const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white border border-blue-200 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
    <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
      <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
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
  <div className="bg-white border border-blue-200 rounded-lg overflow-hidden shadow-lg">
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
      <h3 className="text-lg font-semibold flex items-center">
        <CreditCard className="w-5 h-5 mr-2" />
        Payment History
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Bank</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-100">
          {paymentHistory && paymentHistory.length > 0 ? (
            paymentHistory.map((item, index) => (
              <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-800">
                      {new Date(item.date).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700">{item.bankAccount?.name || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-semibold text-green-600">AED {item.amount}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <CreditCard className="w-8 h-8 text-blue-300 mb-2" />
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

// Items Table Component (combines products and services)
const ItemsTable = ({ products = [], services = [], credits = [] }) => {
  // Combine products and services into a single items array
  const items = [
    ...products.map(product => ({
      ...product,
      type: 'product',
      name: product.product?.name || 'Unknown Product',
      code: product.product?.code || 'N/A',
      unitPrice: product.price,
      total: (product.price * product.quantity).toFixed(2),
    })),
    ...services.map(service => ({
      ...service,
      type: 'service',
      name: service.service?.name || 'Unknown Service',
      code: service.service?.code || 'N/A',
      unitPrice: service.price,
      total: (service.price * service.quantity).toFixed(2),
    })),
    ...credits.map(credit => ({
      ...credit,
      type: 'credit',
      name: credit.title || 'Credit',
      code: 'N/A',
      unitPrice: credit.amount,
      quantity: 'N/A', // Credits don't have quantity
      total: credit.amount ? credit.amount.toFixed(2) : '0.00',
      additionalNote: credit.additionalNote || '',
    }))
  ];

  return (
    <div className="bg-white border border-blue-200 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <h3 className="text-lg font-semibold flex items-center">
          <ShoppingBag className="w-5 h-5 mr-2" />
          Items ({items.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Item</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">Qty</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={`${item.type}-${index}`} className="hover:bg-blue-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{item?.note || item.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.additionalNote}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-semibold ${
                      item.type === 'credit' ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {item.type === 'credit' ? '-' : ''}AED {item.unitPrice}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-semibold ${
                      item.type === 'credit' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {item.type === 'credit' ? '-' : ''}AED {item.total}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <ShoppingBag className="w-8 h-8 text-blue-300 mb-2" />
                    <span>No items found</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Totals Component
const TotalsSection = ({ currentInvoice }) => (
  <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-lg">
    <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
      <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
        <DollarSign className="w-5 h-5 text-blue-600" />
      </div>
      Financial Summary
    </h3>

    <div className="space-y-3">
      <div className="flex justify-between items-center py-2 border-b border-blue-200">
        <span className="text-gray-600 font-medium">Net Amount:</span>
        <span className="font-semibold text-gray-800">AED {currentInvoice.netAmount?.toFixed(2) || '0.00'}</span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-blue-200">
        <span className="text-gray-600 font-medium flex items-center">
          <PercentCircle className="w-4 h-4 text-blue-500 mr-2" />
          VAT ({currentInvoice.vatRate || 5}%):
        </span>
        <span className="font-semibold text-gray-800">AED {currentInvoice.vatAmount?.toFixed(2) || '0.00'}</span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-blue-200">
        <span className="text-gray-600 font-medium">Subtotal:</span>
        <span className="font-semibold text-gray-800">AED {currentInvoice.subtotal?.toFixed(2) || '0.00'}</span>
      </div>

      {currentInvoice.discount > 0 && (
        <div className="flex justify-between items-center py-2 border-b border-blue-200">
          <span className="text-gray-600 font-medium">Discount:</span>
          <span className="font-semibold text-red-600">- AED {currentInvoice.discount?.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg px-4 border border-blue-500/30">
        <span className="text-blue-700 font-semibold text-lg">Total Amount:</span>
        <span className="font-bold text-xl text-blue-600">AED {currentInvoice.totalAmount?.toFixed(2) || '0.00'}</span>
      </div>

      <div className="flex justify-between items-center py-2 border-b border-blue-200">
        <span className="text-gray-600 font-medium">Total Paid:</span>
        <span className="font-semibold text-green-600">AED {currentInvoice.totalPayedAmount?.toFixed(2) || '0.00'}</span>
      </div>

      <div className="flex justify-between items-center py-2">
        <span className="text-gray-600 font-medium">Balance to Receive:</span>
        <span className={`font-semibold ${currentInvoice.balanceToReceive > 0 ? 'text-red-600' : 'text-green-600'}`}>
          AED {currentInvoice.balanceToReceive?.toFixed(2) || '0.00'}
        </span>
      </div>

      {/* Payment Status */}
      <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Payment Status:</span>
          <div className="flex items-center">
            {currentInvoice.isPaymentCleared ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 font-semibold">Cleared</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-600 font-semibold">Pending</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Status */}
      {currentInvoice.isCancelled && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-red-600 font-semibold">Invoice Cancelled</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Credit Notes Table Component
const CreditNotesTable = ({ creditNotes }) => {
  return (
    <div className="bg-white border border-blue-200 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Receipt className="w-5 h-5 mr-2" />
          Credit Notes ({creditNotes?.length || 0})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-orange-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Credit Note #</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Note</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-orange-700 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100">
            {creditNotes && creditNotes.length > 0 ? (
              creditNotes.map((creditNote, index) => (
                <tr key={creditNote._id || index} className="hover:bg-orange-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-sm font-medium text-gray-800">
                        {creditNote.creditNoteNumber || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {new Date(creditNote.date).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800">
                      {creditNote.title || creditNote.description || 'N/A'}
                      {creditNote.description && (
                        <div className="text-xs text-gray-500 mt-1">{creditNote.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-red-600">
                      -AED {creditNote.creditAmount?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Receipt className="w-8 h-8 text-orange-300 mb-2" />
                    <span>No credit notes available</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Credit Notes Summary */}
      {creditNotes && creditNotes.length > 0 && (
        <div className="bg-orange-50 border-t border-orange-200 p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-orange-700">Total Credit Amount:</span>
            <span className="font-bold text-red-600">
              -AED {creditNotes.reduce((total, cn) => total + (cn.creditAmount || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Modal Component
const InvoiceDetailModal = ({ 
  invoice, 
  onClose, 
  onUpdate,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(invoice);

  if (!currentInvoice) return null;

  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [address.address1, address.address2, address.address3].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };

  const handlePaymentComplete = (updatedInvoice) => {
    setCurrentInvoice(updatedInvoice);
    onUpdate && onUpdate(updatedInvoice);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-gray-200 border border-gray-700 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
          <ModalHeader onClose={onClose} invoice={currentInvoice} />
          
          <div className="overflow-y-auto max-h-[85vh] p-4 sm:p-6 space-y-6">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Invoice Information */}
              <InfoCard title="Invoice Information" icon={FileText} className="xl:col-span-1">
                <div className="space-y-2">
                  <InfoRow icon={Tag} label="Invoice" value={`#${currentInvoice.name}`} />
                  <InfoRow icon={Calendar} label="Date" value={formatDate(currentInvoice.date)} />
                  <InfoRow icon={Calendar} label="Expiry Date" value={formatDate(currentInvoice.expDate)} />
                  <InfoRow icon={Calendar} label="Created" value={formatDate(currentInvoice.createdAt)} />
                  
          
                </div>
              </InfoCard>

              {/* Customer Information */}
              {currentInvoice.customer && (
                <InfoCard title="Customer Information" icon={User} className="xl:col-span-1">
                  <div className="space-y-2">
                    <InfoRow icon={User} label="Name" value={currentInvoice.customer.name} />
                    <InfoRow icon={Mail} label="Email" value={currentInvoice.customer.Email || 'N/A'} />
                    <InfoRow icon={Phone} label="Phone" value={currentInvoice.customer.Phone || 'N/A'} />
                    <InfoRow icon={MapPin} label="Address" value={formatAddress(currentInvoice.customer.address)} />
                    {currentInvoice.customer.Code && (
                      <InfoRow icon={IdCard} label="Code" value={currentInvoice.customer.Code} />
                    )}
                    {currentInvoice.customer.VATNo && (
                      <InfoRow icon={Hash} label="VAT No" value={currentInvoice.customer.VATNo} />
                    )}
                  </div>
                </InfoCard>
              )}

              {/* Additional Information */}
              <InfoCard title="Additional Details" icon={Info} className="xl:col-span-1">
                <div className="space-y-2">
                  <InfoRow icon={FileText} label="Description" value={currentInvoice.description || 'N/A'} />
                  <InfoRow icon={DollarSign} label="Net Amount" value={`AED ${currentInvoice.netAmount?.toFixed(2) || '0.00'}`} />
                  <InfoRow icon={PercentCircle} label="VAT Rate" value={`${currentInvoice.vatRate || 5}%`} />
                  <InfoRow icon={BadgeDollarSign} label="Balance" value={`AED ${currentInvoice.balanceToReceive?.toFixed(2) || '0.00'}`} />
                </div>
              </InfoCard>
            </div>

            {/* Payment History */}
            {currentInvoice.paymentHistory?.length > 0 && (
              <PaymentHistoryTable paymentHistory={currentInvoice.paymentHistory} />
            )}

            {/* Items Table */}
            {(currentInvoice.products?.length > 0 || currentInvoice.services?.length > 0 || currentInvoice.credits?.length > 0) && (
              <ItemsTable 
                products={currentInvoice.products} 
                services={currentInvoice.services} 
                credits={currentInvoice.credits}
              />
            )}

            {/* Credit Notes Table */}
            {currentInvoice.creditNote?.length > 0 && (
              <CreditNotesTable creditNotes={currentInvoice.creditNote} />
            )}

            {/* Totals */}
            <TotalsSection currentInvoice={currentInvoice} />
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetailModal;