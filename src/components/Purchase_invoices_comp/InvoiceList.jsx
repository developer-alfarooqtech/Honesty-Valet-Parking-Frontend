import React, { useState } from "react";
import {
  FileText,
  Truck,
  Calendar,
  ShoppingBag,
  Edit,
  Recycle,
  Repeat,
  X,
} from "lucide-react";
import CancelLPOModal from "./CancelLPOModal";

const InvoiceList = ({
  invoices,
  onViewInvoice,
  onConvertToInvoice,
  onEditLPO,
  onCancelLPO,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedLPO, setSelectedLPO] = useState(null);

  if (invoices.length === 0) {
    return null;
  }

  const handleConvertClick = (e, invoice) => {
    e.stopPropagation(); // Prevent row click
    onConvertToInvoice(invoice);
  };

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
        <ShoppingBag className="w-6 h-6 text-blue-500 mr-3" />
        Existing Invoices
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-3 text-left font-semibold border-b border-blue-100">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-white mr-2" />
                  LPO
                </div>
              </th>
              <th className="p-3 text-left font-semibold border-b border-blue-100">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-white mr-2" />
                  Invoice
                </div>
              </th>
              <th className="p-3 text-left font-semibold border-b border-blue-100">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-white mr-2" />
                  Supplier
                </div>
              </th>
              <th className="p-3 text-left font-semibold border-b border-blue-100">
                Total
              </th>
              <th className="p-3 text-left font-semibold border-b border-blue-100">
                Balance To Pay
              </th>
              <th className="p-3 text-left font-semibold border-b border-blue-100">
                Status
              </th>
              <th className="p-3 text-left font-semibold border-b border-blue-100">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv._id}
                className="border-b border-blue-50 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => onViewInvoice(inv)}
              >
                <td className="p-3 text-gray-800 font-medium">
                  <p>{inv.lpo}</p>
                  <p className="text-xs">
                    {new Date(inv.date).toLocaleDateString('en-GB')}
                  </p>
                </td>
                <td className="p-3 text-gray-800 font-medium">
                  {inv.isCancelled ? (
                    <span className="text-red-600 font-semibold">
                      Cancelled
                    </span>
                  ) : inv.isInvCreated ? (
                    <span className="text-green-600 font-semibold">
                      <p>{inv.name}</p>
                      <p className="text-xs text-gray-800">
                        {new Date(inv.date).toLocaleDateString('en-GB')}
                      </p>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold">
                      Not created
                    </span>
                  )}
                </td>
                <td className="p-3 text-gray-600">
                  {inv.supplier?.name || "N/A"}
                </td>
                <td className="p-3 text-blue-600 font-bold">
                  {inv.total.toFixed(2)}
                </td>
                <td className="p-3 text-blue-600 font-bold">
                  {inv.isCancelled ? (
                    <span className="text-red-600">Cancelled</span>
                  ) : inv.isInvCreated ? (
                    `${inv.balanceToPay?.toFixed(2) || "0.00"}`
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </td>
                <td className="p-3">
                  {inv.isCancelled ? (
                    <span className="bg-red-100 text-red-700 px-3 py-1 text-sm rounded-full font-medium">
                      Cancelled
                    </span>
                  ) : inv.isInvCreated ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded-full font-medium">
                      Invoice Created
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 text-sm rounded-full font-medium">
                      LPO Created
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {!inv.isCancelled && !inv.isInvCreated && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleConvertClick(e, inv)}
                        className="bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-600 hover:text-blue-700 px-3 py-1 text-sm rounded-lg font-medium transition-colors duration-200"
                      >
                        <Repeat className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditLPO(inv);
                        }}
                        className="bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-600 hover:text-blue-700 px-3 py-1 text-sm rounded-lg font-medium transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>{" "}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLPO(inv);
                          setShowCancelModal(true);
                        }}
                        className="bg-red-100 hover:bg-red-200 cursor-pointer text-red-600 hover:text-red-700 px-3 py-1 text-sm rounded-lg font-medium transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CancelLPOModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedLPO(null);
        }}
        onConfirm={() => {
          if (selectedLPO) {
            onCancelLPO(selectedLPO._id);
            setShowCancelModal(false);
            setSelectedLPO(null);
          }
        }}
      />
    </div>
  );
};

export default InvoiceList;
