import React, { useState } from "react";
import {
  X,
  FileText,
  DollarSign,
  PercentCircle,
  Calendar,
  Tag,
  ShoppingBag,
  CreditCard,
  Building2,
  Phone,
  Mail,
  MapPin,
  Hash,
  User,
  IdCard,
  AlertCircle,
  Receipt,
  CheckCircle,
  Clock,
  Link2
} from "lucide-react";
import PrintInv from "./PrintInv";
import PaymentModal from "./PaymentModal";  

// Simple Header
const ModalHeader = ({ onClose, invoice }) => (
  <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center border-b border-blue-700">
    <div>
      <h2 className="text-lg font-semibold">Invoice #{invoice?.name}</h2>
      <p className="text-blue-100 text-sm">Invoice Details</p>
    </div>
    <button
      onClick={onClose}
      className="text-white hover:bg-blue-700 rounded p-2 transition-colors"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
);

// Payment History Boxes
const PaymentHistoryBoxes = ({ paymentHistory }) => {
  if (!paymentHistory || paymentHistory.length === 0) {
    return (
      <div className="bg-white border border-gray-300 p-6 rounded">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Payment History</h3>
        <p className="text-gray-500 text-sm text-center py-4">No payment history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 p-6 rounded">
      <h3 className="text-base font-semibold text-gray-700 mb-4">Payment History ({paymentHistory.length})</h3>
      
      <div className="space-y-3">
        {paymentHistory.map((payment, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(payment.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(payment.date).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                {payment.bankAccount && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span>{payment.bankAccount.name || 'N/A'}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">AED {payment.amount?.toFixed(2) || '0.00'}</div>
              </div>
            </div>

            {payment.description && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="text-sm text-gray-600">{payment.description}</p>
              </div>
            )}

            {payment.groupTotal && (
              <div className="mt-3 pt-3 border-t-2 border-dashed border-blue-400 bg-blue-50 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700 uppercase">Group Payment</span>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Total Amount for Invoices:</span> AED {payment.groupTotal.toFixed(2)}
                </div>
                {payment.groupInvoices && payment.groupInvoices.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Covers {payment.groupInvoices.length} invoice(s):</p>
                    <div className="flex flex-wrap gap-1">
                      {payment.groupInvoices.slice(0, 5).map((inv, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          #{inv?.name || inv?._id?.toString().slice(-6) || `Inv ${idx + 1}`}
                        </span>
                      ))}
                      {payment.groupInvoices.length > 5 && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          +{payment.groupInvoices.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* <div className="mt-4 pt-4 border-t border-gray-300">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Total Payments:</span>
          <span className="text-lg font-bold text-green-600">
            AED {paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
          </span>
        </div>
      </div> */}
    </div>
  );
};

// Items List
const ItemsList = ({ products = [], services = [], credits = [] }) => {
  const items = [
    ...products.map(product => ({
      ...product,
      type: 'product',
      name: product.product?.name || 'Unknown Product',
      unitPrice: product.price,
      total: (product.price * product.quantity).toFixed(2),
    })),
    ...services.map(service => ({
      ...service,
      type: 'service',
      name: service.service?.name || 'Unknown Service',
      unitPrice: service.price,
      total: (service.price * service.quantity).toFixed(2),
    })),
    ...credits.map(credit => ({
      ...credit,
      type: 'credit',
      name: credit.title || 'Credit',
      unitPrice: credit.amount,
      quantity: 'N/A',
      total: credit.amount ? credit.amount.toFixed(2) : '0.00',
    }))
  ];

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-300 p-6 rounded">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Items</h3>
        <p className="text-gray-500 text-sm text-center py-4">No items found</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded">
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
        <h3 className="text-base font-semibold text-gray-700">Items ({items.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Qty</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={`${item.type}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{item?.note || item.name}</span>
                    </div>
                    {item.additionalNote && (
                      <div className="text-xs text-gray-500 mt-1">{item.additionalNote}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-700">{item.quantity}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-medium ${item.type === 'credit' ? 'text-red-600' : 'text-gray-800'}`}>
                    {item.type === 'credit' ? '-' : ''}AED {item.unitPrice}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-semibold ${item.type === 'credit' ? 'text-red-600' : 'text-blue-600'}`}>
                    {item.type === 'credit' ? '-' : ''}AED {item.total}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Credit Notes Boxes
const CreditNotesBoxes = ({ creditNotes }) => {
  if (!creditNotes || creditNotes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-300 p-6 rounded">
      <h3 className="text-base font-semibold text-gray-700 mb-4">Credit Notes ({creditNotes.length})</h3>
      
      <div className="space-y-3">
        {creditNotes.map((creditNote, index) => (
          <div
            key={creditNote._id || index}
            className="border border-gray-300 rounded p-4 bg-gray-50"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {creditNote.creditNoteNumber || `Credit Note #${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(creditNote.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">-AED {creditNote.creditAmount?.toFixed(2) || '0.00'}</div>
              </div>
            </div>

            {(creditNote.title || creditNote.description) && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                {creditNote.title && <p className="text-sm font-medium text-gray-700 mb-1">{creditNote.title}</p>}
                {creditNote.description && <p className="text-sm text-gray-600">{creditNote.description}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-300">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Total Credit Amount:</span>
          <span className="text-lg font-bold text-red-600">
            -AED {creditNotes.reduce((total, cn) => total + (cn.creditAmount || 0), 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Modal Component
const InvoiceDetailModal = ({ 
  invoice, 
  onClose, 
  onUpdate,
}) => {
  const [currentInvoice, setCurrentInvoice] = useState(invoice);

  if (!currentInvoice) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [address.address1, address.address2, address.address3].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <ModalHeader onClose={onClose} invoice={currentInvoice} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Sidebar - Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Invoice Info */}
              <div className="bg-white border border-gray-300 p-5 rounded">
                <h3 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">Invoice Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice:</span>
                    <span className="font-medium text-gray-800">#{currentInvoice.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-800">{formatDate(currentInvoice.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry:</span>
                    <span className="font-medium text-gray-800">{formatDate(currentInvoice.expDate)}</span>
                  </div>
                  {currentInvoice.lpo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">LPO:</span>
                      <span className="font-medium text-gray-800">{currentInvoice.lpo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              {currentInvoice.customer && (
                <div className="bg-white border border-gray-300 p-5 rounded">
                  <h3 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">Customer</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">Name:</div>
                      <div className="font-medium text-gray-800">{currentInvoice.customer.name}</div>
                    </div>
                    {currentInvoice.customer.Email && (
                      <div>
                        <div className="text-gray-600 mb-1">Email:</div>
                        <div className="font-medium text-gray-800">{currentInvoice.customer.Email}</div>
                      </div>
                    )}
                    {currentInvoice.customer.Phone && (
                      <div>
                        <div className="text-gray-600 mb-1">Phone:</div>
                        <div className="font-medium text-gray-800">{currentInvoice.customer.Phone}</div>
                      </div>
                    )}
                    {currentInvoice.customer.address && (
                      <div>
                        <div className="text-gray-600 mb-1">Address:</div>
                        <div className="font-medium text-gray-800">{formatAddress(currentInvoice.customer.address)}</div>
                      </div>
                    )}
                    {currentInvoice.customer.Code && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Code:</span>
                        <span className="font-medium text-gray-800">{currentInvoice.customer.Code}</span>
                      </div>
                    )}
                    {currentInvoice.customer.VATNo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">VAT No:</span>
                        <span className="font-medium text-gray-800">{currentInvoice.customer.VATNo}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="bg-white border border-gray-300 p-5 rounded">
                <h3 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">Financial Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Amount:</span>
                    <span className="font-medium text-gray-800">AED {currentInvoice.netAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT ({currentInvoice.vatRate || 5}%):</span>
                    <span className="font-medium text-gray-800">AED {currentInvoice.vatAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-800">AED {currentInvoice.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {currentInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-AED {currentInvoice.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total Amount:</span>
                      <span className="text-lg font-bold text-blue-600">AED {currentInvoice.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-medium text-green-600">AED {currentInvoice.totalPayedAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Balance:</span>
                      <span className={`text-lg font-bold ${currentInvoice.balanceToReceive > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        AED {currentInvoice.balanceToReceive?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className="flex items-center gap-2">
                      {currentInvoice.isPaymentCleared ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-600">Cleared</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm font-medium text-orange-600">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  {currentInvoice.isCancelled && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Cancelled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {currentInvoice.description && (
                <div className="bg-white border border-gray-300 p-5 rounded">
                  <h3 className="text-base font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{currentInvoice.description}</p>
                </div>
              )}

              {/* Payment History */}
              <PaymentHistoryBoxes paymentHistory={currentInvoice.paymentHistory} />

              {/* Items */}
              {(currentInvoice.products?.length > 0 || currentInvoice.services?.length > 0 || currentInvoice.credits?.length > 0) && (
                <ItemsList 
                  products={currentInvoice.products} 
                  services={currentInvoice.services} 
                  credits={currentInvoice.credits}
                />
              )}

              {/* Credit Notes */}
              {currentInvoice.creditNote?.length > 0 && (
                <CreditNotesBoxes creditNotes={currentInvoice.creditNote} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
