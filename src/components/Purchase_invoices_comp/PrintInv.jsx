import React from "react";
import * as ReactDOM from "react-dom/client";
import { Printer } from "lucide-react";
import toast from "react-hot-toast";

// LPO Printable Content Component
const LPOPrintableContent = ({ lpo }) => {
  const currentDate = new Date().toLocaleDateString("en-GB");
  const subtotal = lpo.products.reduce(
    (acc, product) => acc + product.purchasePrice * product.stock,
    0
  );
  const vatAmount = subtotal * 0.05;
  const total = subtotal + vatAmount;

  return (
    <div
      className="bg-white p-4 max-w-full mx-auto"
      style={{
        fontSize: "11px",
        lineHeight: "1.4",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header Section */}
      <div className="mb-4 border-b-2 border-blue-600 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-2xl font-bold text-blue-800 mb-2">
              HONEST WORLD MOTORS
            </div>
            {/* <div className="text-sm space-y-1 text-gray-700">
              <div className="flex items-center gap-4">
                <span className="font-medium">Tel:</span>
                <span>+97142630077</span>
                <span className="font-medium ml-4">Email:</span>
                <span>honestworldmotors2004@gmail.com</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">VAT Reg No:</span>
                <span className="font-semibold text-blue-700">100596686400003</span>
              </div>
            </div> */}
            <div className="text-sm text-gray-700 mt-2">
              <p>Tel: +97142630077</p>
              <p>Email: honestworldmotors2004@gmail.com</p>
              <p>VAT Reg No: 100596686400003</p>
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4 min-w-48">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-800 mb-1">
                PURCHASE ORDER
              </div>
              <div className="text-lg font-bold text-blue-700 mt-2">
                {lpo.lpo}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Information Section */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Supplier Information */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
            Supplier Details
          </div>
          <div className="space-y-1">
            <div className="text-base font-bold text-gray-900">
              {lpo.supplier?.name}
            </div>
            {lpo.supplier?.address && (
              <div className="text-sm text-gray-700">
                {lpo.supplier.address}
              </div>
            )}
            {lpo.supplier?.contact && (
              <div className="text-sm text-gray-700">
                Contact: {lpo.supplier.contact}
              </div>
            )}
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">
            Order Information
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Order No:</span>
              <span className="font-semibold text-gray-900">{lpo.lpo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Order Date:</span>
              <span className="font-bold text-blue-700">
                {new Date(lpo.date).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VAT Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
        <div className="text-sm font-medium text-yellow-800">
          ⚠️ This is not a V.A.T Invoice - Purchase Order Only
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-4">
        <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg">
          <div className="text-sm font-bold uppercase tracking-wide">
            Order Items
          </div>
        </div>
        <table className="w-full border-collapse border border-gray-300 rounded-b-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-800 w-16">
                Qty
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-800 w-24">
                Code
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-800">
                Product Description
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-800 w-24">
                Unit Price
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-800 w-24 bg-blue-50">
                Net Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {lpo.products.map((product, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                  {product.stock}
                </td>
                <td className="border border-gray-300 px-3 py-2 font-mono text-xs">
                  {product.code}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  <div className="font-semibold text-gray-900">
                    {product.name}
                  </div>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                  AED {product.purchasePrice.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold bg-blue-50">
                  AED {(product.purchasePrice * product.stock).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-between items-start">
        {/* Financial Summary */}
        <div className="w-1/2">
          <div className="bg-blue-50 rounded-lg border-2 border-blue-200 overflow-hidden">
            <div className="bg-blue-600 text-white px-4 py-2">
              <div className="text-sm font-bold uppercase tracking-wide">
                Order Summary
              </div>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium text-gray-700">
                      Total Net Amount
                    </td>
                    <td className="py-2 text-right font-bold">
                      AED {subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium text-gray-700">
                      VAT Amount (5%)
                    </td>
                    <td className="py-2 text-right font-bold text-blue-600">
                      AED {vatAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-blue-800 text-base">
                      Order Total
                    </td>
                    <td className="py-3 text-right font-bold text-blue-800 text-lg">
                      AED {total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div>Generated on {currentDate}</div>
          <div className="font-medium">
            Honest World Motors - Purchase Order
          </div>
        </div>
      </div>
    </div>
  );
};

// Direct print function for LPO
const printLPODirectly = (lpo) => {
  if (!lpo) {
    console.error("LPO data is missing");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow popup windows to print the LPO");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Purchase Order: ${lpo?.lpo || ""}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @media print {
            body { 
              margin: 0; 
              padding: 8px; 
              background-color: white;
              font-size: 11px;
              line-height: 1.4;
              color: black;
            }
            @page { 
              size: A4; 
              margin: 10mm; 
            }
            .no-print { display: none; }
            .bg-blue-50, .bg-gray-50, .bg-yellow-50 {
              background-color: #f8f9fa !important;
            }
            .bg-blue-600, .bg-gray-800 {
              background-color: #374151 !important;
              color: white !important;
            }
            .border-blue-600, .border-blue-200 {
              border-color: #6b7280 !important;
            }
            .text-blue-800, .text-blue-700, .text-blue-600 {
              color: #1f2937 !important;
            }
          }
          
          @media screen {
            body {
              background-color: #f9fafb;
              padding: 1rem;
            }
            .print-container {
              max-width: 1000px;
              margin: 0 auto;
              background-color: white;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
              border-radius: 0.5rem;
              overflow: hidden;
            }
          }
          
          table {
            border-collapse: collapse !important;
          }
        </style>
      </head>
      <body>
        <div id="print-content" class="print-container"></div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  const printContent = printWindow.document.getElementById("print-content");

  setTimeout(() => {
    const root = ReactDOM.createRoot(printContent);
    root.render(<LPOPrintableContent lpo={lpo} />);

    setTimeout(() => {
      printWindow.print();
    }, 500);
  }, 300);
};

// Print Button Component
const PrintButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 px-6 py-3 rounded-lg flex items-center gap-3 text-sm shadow-lg hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-105"
  >
    <Printer className="w-4 h-4" />
    Print Purchase Order
  </button>
);

// Main PrintInv Component
const PrintInv = ({ lpo }) => {
  return <PrintButton onClick={() => printLPODirectly(lpo)} />;
};

export default PrintInv;
