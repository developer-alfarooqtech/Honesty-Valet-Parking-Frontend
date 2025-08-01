import React, { useEffect, useState } from "react";
import {
  Package,
  Barcode,
  ShoppingCart,
  DollarSign,
  Tag,
  PercentCircle,
  Trash2,
} from "lucide-react";
import { fetchBanks } from "../../service/bankService";
import toast from "react-hot-toast";

const ProductTable = ({
  products,
  onRemoveProduct,
  vatRate,
  payedAmount,
  setPayedAmount,
  setBalanceToPay,
  setSelectedBank,
}) => {
  // Calculate totals
  const subtotal = products.reduce(
    (acc, item) => acc + item.purchasePrice * item.stock,
    0
  );
  const calculatedTotal = subtotal + vatRate;

  const total =  calculatedTotal;


  // Initialize or update balance to pay when total changes
  useEffect(() => {
    // When total changes, update balance to pay only if no payment has been made yet
    if (parseFloat(payedAmount) === 0) {
      setBalanceToPay(total);
    } else {
      // If payment already exists, recalculate balance
      const paymentValue = parseFloat(payedAmount) || 0;
      const balanceValue = total - paymentValue;
      setBalanceToPay(balanceValue >= 0 ? balanceValue : 0);
    }
  }, [total, setBalanceToPay, payedAmount]);



  const handlePaymentChange = (val) => {
    const paymentValue = parseFloat(val) || 0;
    setPayedAmount(val); // Keep the original input value for the input field
    // Calculate balance to pay by subtracting payment from total
    const balanceValue = total - paymentValue;
    setBalanceToPay(balanceValue >= 0 ? balanceValue : 0); // Ensure balance is not negative
  };

  const handleBankChange = (e) => {
    setSelectedBank(e.target.value);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-blue-200 rounded-lg bg-blue-50/50">
        <Package className="w-12 h-12 text-blue-300 mx-auto mb-3" />
        <p className="text-gray-500">
          No products added yet. Add products to your invoice above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full mt-2 table-auto border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-left">
              <th className="px-4 py-3 border-b border-blue-200 font-semibold text-blue-800">
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Name
                </div>
              </th>
              <th className="px-4 py-3 border-b border-blue-200 font-semibold text-blue-800">
                <div className="flex items-center">
                  <Barcode className="w-4 h-4 mr-2" />
                  Code
                </div>
              </th>
              <th className="px-4 py-3 border-b border-blue-200 font-semibold text-blue-800 text-center">
                <div className="flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Qty
                </div>
              </th>
              <th className="px-4 py-3 border-b border-blue-200 font-semibold text-blue-800 text-right">
                <div className="flex items-center justify-end">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Purchase Price
                </div>
              </th>
              <th className="px-4 py-3 border-b border-blue-200 font-semibold text-blue-800 text-right">
                <div className="flex items-center justify-end">
                  <Tag className="w-4 h-4 mr-2" />
                  Selling Price
                </div>
              </th>
              <th className="px-4 py-3 border-b border-blue-200 font-semibold text-blue-800 text-right">
                <div className="flex items-center justify-end">
                  <PercentCircle className="w-4 h-4 mr-2" />
                  VAT (5%)
                </div>
              </th>
              <th className="px-4 py-3 border-b border-blue-200 font-semibold text-blue-800 text-right">
                <div className="flex items-center justify-end">
                  <PercentCircle className="w-4 h-4 mr-2" />
                  Total
                </div>
              </th>
              <th className="px-4 py-3 border-b border-blue-200 font-semibold text-blue-800 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => {
              const itemVat = p.purchasePrice * p.stock * (5 / 100);

              return (
                <tr
                  key={idx}
                  className={`border-b border-blue-100 hover:bg-blue-50/50 transition-colors duration-150 ${
                    idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                  }`}
                >
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-sm">{p.code}</td>
                  <td className="px-4 py-3 text-center">{p.stock}</td>
                  <td className="px-4 py-3 text-right">
                    {p.purchasePrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.sellingPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600">
                    {itemVat.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600">
                    {(p.purchasePrice * p.stock + itemVat).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onRemoveProduct(idx)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-150"
                      title="Remove product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
  {/* Empty space for left side on large screens */}
  <div className="hidden lg:block lg:col-span-2"></div>

  {/* Invoice Summary */}
  <div className="bg-blue-50 rounded-lg w-full p-4 border border-blue-200">
    <h4 className="text-lg font-semibold mb-3 text-gray-800">
      Invoice Summary
    </h4>

    <div className="space-y-2">
      <div className="flex justify-between items-center pb-2">
        <span className="text-gray-600 flex items-center">
          <DollarSign className="w-4 h-4 text-blue-500 mr-1" />
          Subtotal:
        </span>
        <span className="font-medium">{subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center pb-2 border-b border-blue-200">
        <span className="text-gray-600 flex items-center">
          <PercentCircle className="w-4 h-4 text-blue-500 mr-1" />
          VAT (5%):
        </span>
        <span className="font-medium text-blue-600">
          {vatRate.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-gray-800 font-semibold flex items-center">
          <DollarSign className="w-5 h-5 text-blue-500 mr-1" />
          Total:
        </span>
        <span
          className="text-xl font-bold text-blue-600"
        >
          {total.toFixed(2)}
        </span>
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default ProductTable;
