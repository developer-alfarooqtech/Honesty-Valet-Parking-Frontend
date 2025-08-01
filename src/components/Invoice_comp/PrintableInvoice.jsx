import React from "react";
import * as ReactDOM from "react-dom/client";
import { Printer, FileDown } from "lucide-react";

// Improved PrintableContent component with better spacing and responsiveness
const PrintableContent = ({ invoice }) => (
  <div className="p-5 bg-white max-w-4xl mx-auto">
    {/* Header - More responsive with flex layout */}
    <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-4 mb-4 border-b">
      <div className="flex items-start gap-3 mb-3 md:mb-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">HONESTY AND PERFECTION</h1>
          <div className="mt-1 text-xs text-gray-600">
            <p>Ras Al Khor, Dubai</p>
            <p>Phone: +971 111 222 3333</p>
            <p>Phone: +971 444 555 6666</p>
            <p>Email: honesty.perfection@gmail.com</p>
          </div>
        </div>
      </div>
      <div className="text-left md:text-right">
        <h2 className="text-lg md:text-xl font-bold text-blue-700">
          Invoice: {invoice?.name || "N/A"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Date: {invoice?.date ? new Date(invoice.date).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
        </p>
        {invoice?.expDate && (
          <p className="text-sm text-gray-500">
            Expiry: {new Date(invoice.expDate).toLocaleDateString("en-GB")}
          </p>
        )}
        {invoice?.lpo && (
          <p className="text-sm text-gray-500">
            LPO: {invoice.lpo}
          </p>
        )}
      </div>
    </div>

    {/* Customer Details - Responsive grid layout */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      {/* Customer Details */}
      <div className="p-3 border rounded shadow-sm bg-gray-50">
        <h3 className="pb-1 mb-2 text-sm font-semibold text-gray-800 border-b">
          Customer Details
        </h3>
        <div className="text-sm">
          <div className="flex mb-1">
            <span className="w-16 text-gray-500">Name:</span>
            <span className="font-medium">
              {invoice?.customer?.name || "N/A"}
            </span>
          </div>
          {invoice?.customer?.Phone && (
            <div className="flex mb-1">
              <span className="w-16 text-gray-500">Phone:</span>
              <span className="font-medium">{invoice.customer.Phone}</span>
            </div>
          )}
          {invoice?.customer?.address?.address1 && (
            <div className="flex mb-1 gap-2">
              <span className="w-16 text-gray-500">Address: </span>
              <span className="font-medium">{invoice.customer.address.address1}</span>
            </div>
          )}
          {invoice?.customer?.Email && (
            <div className="flex mb-1">
              <span className="w-16 text-gray-500">Email:</span>
              <span className="font-medium">{invoice.customer.Email}</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Products and Services Tables with improved responsiveness */}
    {(invoice.products?.length > 0 || invoice.services?.length > 0) && (
      <div className="mb-4 space-y-4">
        {/* Products Table */}
        {invoice.products?.length > 0 && (
          <div>
            <h3 className="pb-2 mb-2 text-sm font-semibold text-gray-800 border-b">
              Products
            </h3>
            <div className="overflow-x-auto rounded-md shadow-sm border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-3 py-2 font-semibold text-left">Product</th>
                    <th className="px-3 py-2 font-semibold text-left">Description</th>
                    <th className="w-16 px-3 py-2 font-semibold text-center">Qty</th>
                    <th className="w-24 px-3 py-2 font-semibold text-right">Price</th>
                    <th className="w-24 px-3 py-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.products.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-3 py-2 border-t">
                        {item?.product?.code || item?.product?.name || "N/A"}
                      </td>
                      <td className="px-3 py-2 border-t">{item?.note || "-"}</td>
                      <td className="px-3 py-2 text-center border-t">{item?.quantity || 0}</td>
                      <td className="px-3 py-2 text-right border-t">
                        {(item?.price || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 font-medium text-right border-t">
                        {((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Services Table */}
        {invoice.services?.length > 0 && (
          <div>
            <h3 className="pb-2 mb-2 text-sm font-semibold text-gray-800 border-b">
              Services
            </h3>
            <div className="overflow-x-auto rounded-md shadow-sm border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-3 py-2 font-semibold text-left">Service</th>
                    <th className="px-3 py-2 font-semibold text-left">Description</th>
                    <th className="w-16 px-3 py-2 font-semibold text-center">Qty</th>
                    <th className="w-24 px-3 py-2 font-semibold text-right">Price</th>
                    <th className="w-24 px-3 py-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.services.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-3 py-2 border-t">
                        {item?.service?.code || item?.service?.name || "N/A"}
                      </td>
                      <td className="px-3 py-2 border-t">{item?.note || "-"}</td>
                      <td className="px-3 py-2 text-center border-t">{item?.quantity || 0}</td>
                      <td className="px-3 py-2 text-right border-t">
                        {(item?.price || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 font-medium text-right border-t">
                        {((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Invoice Description */}
    {invoice?.description && (
      <div className="mb-4 p-3 border rounded shadow-sm bg-gray-50">
        <h3 className="pb-1 mb-2 text-sm font-semibold text-gray-800 border-b">
          Description
        </h3>
        <p className="text-sm text-gray-700">{invoice.description}</p>
      </div>
    )}

    {/* Payment Summary with improved styling */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
      <div className="col-span-1 md:col-span-3"></div>
      <div className="col-span-1 md:col-span-2 p-3 border rounded shadow-sm bg-gray-50">
        <h3 className="pb-1 mb-2 text-sm font-semibold text-gray-800 border-b">
          Payment Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Net Total:</span>
            <span className="font-medium">
              {(invoice?.netAmount || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">
              VAT ({invoice?.vatRate || 0}%):
            </span>
            <span className="font-medium">
              {(invoice?.vatAmount || 0).toFixed(2)}
            </span>
          </div>

          {(invoice?.discount || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium">
                -{invoice?.discount || 0}
              </span>
            </div>
          )}

          <div className="flex justify-between font-bold border-t pt-2 mt-2">
            <span className="text-gray-700">Total Amount:</span>
            <span className="text-blue-700">
              {(invoice?.totalAmount || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-medium text-green-600">
              {(invoice?.totalPayedAmount || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Balance Due:</span>
            <span className="font-medium text-red-600">
              {(invoice?.balanceToReceive || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${invoice?.isPaymentCleared ? 'text-green-600' : 'text-yellow-600'}`}>
              {invoice?.isPaymentCleared ? 'Fully Paid' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Payment History */}
    {invoice?.paymentHistory && invoice.paymentHistory.length > 0 && (
      <div className="mb-4">
        <h3 className="pb-2 mb-2 text-sm font-semibold text-gray-800 border-b">
          Payment History
        </h3>
        <div className="overflow-x-auto rounded-md shadow-sm border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-3 py-2 font-semibold text-left">Date</th>
                <th className="px-3 py-2 font-semibold text-right">Amount</th>
                <th className="px-3 py-2 font-semibold text-left">Bank Account</th>
              </tr>
            </thead>
            <tbody>
              {invoice.paymentHistory.map((payment, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2 border-t">
                    {new Date(payment.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-3 py-2 text-right border-t font-medium">
                    {(payment.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 border-t">
                    {payment.bankAccount?.name || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}


    {/* Signatures with improved spacing */}
    <div className="pt-3 mt-6 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div>
          <p className="mb-8 text-xs text-gray-500">Customer Signature</p>
          <div className="w-48 border-t border-gray-400"></div>
          <p className="mt-1 text-xs text-gray-500">Date: ________________</p>
        </div>
        <div>
          <p className="mb-8 text-xs text-gray-500">Authorized Signature</p>
          <div className="w-48 border-t border-gray-400"></div>
          <p className="mt-1 text-xs text-gray-500">Date: _________________</p>
        </div>
      </div>
    </div>

    {/* Footer with improved styling */}
    <div className="pt-3 mt-6 text-xs text-center text-gray-500 border-t">
      <p className="font-medium">Thank you for choosing Honesty and Perfection</p>
      <p className="mt-1">We appreciate your business!</p>
    </div>
  </div>
);

// Direct print function that auto-triggers print dialog
const printInvoiceDirectly = (invoice) => {
  if (!invoice) {
    console.error("Invoice data is missing");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popup windows to print the invoice");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice: ${invoice?.name || ""}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @media print {
            body { margin: 0; padding: 0; background-color: white; }
            @page { size: auto; margin: 10mm; }
          }
          
          @media screen {
            body {
              background-color: #f9fafb;
              padding: 1rem;
            }
            .print-container {
              max-width: 900px;
              margin: 0 auto;
              background-color: white;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border-radius: 0.25rem;
            }
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
  
  // Use a setTimeout to ensure the document is fully loaded before rendering and printing
  setTimeout(() => {
    // Create a root for React 18
    const root = ReactDOM.createRoot(printContent);
    root.render(<PrintableContent invoice={invoice} />);
    
    // Add another timeout to ensure content is fully rendered before printing
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }, 200);
};

// Modern button variants for different actions
const PrintButton = ({ onClick, text, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm shadow-sm"
  >
    {icon}
    {text}
  </button>
);

// Main component with options for printing or downloading
const PrintableInvoice = ({ invoice }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <PrintButton 
        onClick={() => printInvoiceDirectly(invoice)}
        text="Print Invoice"
        icon={<Printer className="w-4 h-4" />}
      />
      
      {/* Optional: Add a download button if needed later */}
      {/* <PrintButton 
        onClick={() => {/* Download functionality *//*}}
        text="Download PDF"
        icon={<FileDown className="w-4 h-4" />}
      /> */}
    </div>
  );
};

export default PrintableInvoice;