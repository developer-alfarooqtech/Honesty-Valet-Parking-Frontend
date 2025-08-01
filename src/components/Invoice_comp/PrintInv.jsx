import React from "react";
import * as ReactDOM from "react-dom/client";
import { Printer } from "lucide-react";
import { fetchInvDetails } from "../../service/invoicesService";
import toast from "react-hot-toast";

// Invoice Printable Content Component with improved styling
const InvoicePrintableContent = ({ invoice }) => {
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  return (
    <div className="p-4 bg-white max-w-4xl mx-auto">
      {/* Header - Company and Customer details side by side */}
      <div className="flex justify-between items-start gap-4 pb-3 mb-3 border-b">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-blue-600">
            HONEST WORLD MOTORS
          </h1>
          <div className="mt-1 text-xs text-gray-600">
            <p>Tel: +97142630077</p>
            <p>Email: honestworldmotors2004@gmail.com</p>
            <p>VAT Reg No: 100596686400003</p>
          </div>
        </div>

        {/* Invoice Details moved to right side */}
        <div className="flex-1">
          <div className="text-right mb-2">
            <h2 className="text-lg font-bold text-blue-700">
              Invoice: {invoice?.name || "-"}
            </h2>
            <p className="text-sm text-gray-500">
              Date: {new Date(invoice.date).toLocaleDateString("en-GB")}
            </p>
            <p className="text-sm text-gray-500">
              Due Date: {new Date(invoice.expDate).toLocaleDateString("en-GB")}
            </p>
          </div>
          <div className="text-sm text-right">
            <p className="font-medium">
              {invoice?.customer?.name || "-"}
            </p>
            {invoice?.customer?.Phone && (
              <p className="text-gray-600">
                {invoice.customer.Phone}
              </p>
            )}
            {invoice?.customer?.address?.address1 && (
              <p className="text-gray-600">
                {invoice.customer.address.address1}
              </p>
            )}
            {invoice?.customer?.address?.address2 && (
              <p className="text-gray-600">
                {invoice.customer.address.address2}
              </p>
            )}
            {invoice?.customer?.Email && (
              <p className="text-gray-600">
                {invoice.customer.Email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Combined Items Table - Products, Services, and Credits */}
      {(invoice.products?.length > 0 || invoice.services?.length > 0 || invoice.credits?.length > 0) && (
        <div className="mb-3">
          <h3 className="pb-1 mb-2 text-sm font-semibold text-gray-800 border-b">
            Items
          </h3>
          <div className="overflow-x-auto rounded-md shadow-sm border">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead>
                <tr className="bg-blue-50">
                  <th className="w-20 px-3 py-2 font-semibold text-center whitespace-nowrap">
                    Qty
                  </th>
                  <th className="w-24 px-3 py-2 font-semibold text-left whitespace-nowrap">
                    Code
                  </th>
                  <th className="px-3 py-2 font-semibold text-left">Item Description</th>
                  <th className="w-28 px-3 py-2 font-semibold text-right whitespace-nowrap">
                    Unit Price
                  </th>
                  <th className="w-28 px-3 py-2 font-semibold text-right whitespace-nowrap">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Products */}
                {invoice.products?.map((item, index) => (
                  <tr
                    key={`product-${index}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2 text-center align-top whitespace-nowrap font-semibold">
                      {item?.quantity || 0}
                    </td>
                    <td className="px-3 py-2 align-top whitespace-nowrap font-mono text-xs">
                      {item.product?.code || '-'}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-semibold text-gray-900">{item.product?.name || '-'}</div>
                      {item.note && <div className="text-xs text-gray-600 mt-1">{item.note}</div>}
                    </td>
                    <td className="px-3 py-2 text-right align-top whitespace-nowrap font-semibold">
                      AED {(item?.price || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-medium text-right align-top whitespace-nowrap">
                      AED {((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {/* Services */}
                {invoice.services?.map((service, index) => (
                  <tr
                    key={`service-${index}`}
                    className={(invoice.products?.length + index) % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2 text-center align-top whitespace-nowrap font-semibold">
                      {service?.quantity || 1}
                    </td>
                    <td className="px-3 py-2 align-top whitespace-nowrap font-mono text-xs">
                      SERVICE
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-semibold text-gray-900">{service?.name || '-'}</div>
                      {service.description && <div className="text-xs text-gray-600 mt-1">{service.description}</div>}
                    </td>
                    <td className="px-3 py-2 text-right align-top whitespace-nowrap font-semibold">
                      AED {(service?.price || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-medium text-right align-top whitespace-nowrap">
                      AED {((service?.price || 0) * (service?.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {/* Credits */}
                {invoice.credits?.map((credit, index) => (
                  <tr
                    key={`credit-${index}`}
                    className={((invoice.products?.length || 0) + (invoice.services?.length || 0) + index) % 2 === 0 ? "bg-orange-50" : "bg-orange-100"}
                  >
                    <td className="px-3 py-2 text-center align-top whitespace-nowrap font-semibold text-gray-500">
                      N/A
                    </td>
                    <td className="px-3 py-2 align-top whitespace-nowrap font-mono text-xs text-red-600">
                      CREDIT
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-semibold text-red-700">{credit?.title || 'Credit'}</div>
                      {(credit.note || credit.additionalNote) && (
                        <div className="text-xs text-red-600 mt-1">{credit.note || credit.additionalNote}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right align-top whitespace-nowrap font-semibold text-red-600">
                      -AED {(credit?.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-medium text-right align-top whitespace-nowrap text-red-600">
                      -AED {(credit?.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credit Notes Table - Separate section */}
      {invoice.creditNote?.length > 0 && (
        <div className="mb-3">
          <h3 className="pb-1 mb-2 text-sm font-semibold text-orange-800 border-b border-orange-300">
            Credit Notes
          </h3>
          <div className="overflow-x-auto rounded-md shadow-sm border border-orange-200">
            <table className="min-w-full text-sm divide-y divide-orange-200">
              <thead>
                <tr className="bg-orange-50">
                  <th className="w-24 px-3 py-2 font-semibold text-left whitespace-nowrap text-orange-700">
                    Credit Note #
                  </th>
                  <th className="w-24 px-3 py-2 font-semibold text-left whitespace-nowrap text-orange-700">
                    Date
                  </th>
                  <th className="px-3 py-2 font-semibold text-left text-orange-700">Description</th>
                  <th className="w-28 px-3 py-2 font-semibold text-right whitespace-nowrap text-orange-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {invoice.creditNote.map((creditNote, index) => (
                  <tr
                    key={`creditNote-${index}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-orange-50"}
                  >
                    <td className="px-3 py-2 align-top whitespace-nowrap font-mono text-xs text-orange-700">
                      {creditNote?.creditNoteNumber || 'N/A'}
                    </td>
                    <td className="px-3 py-2 align-top whitespace-nowrap text-xs text-orange-600">
                      {new Date(creditNote?.date).toLocaleDateString("en-GB") || '-'}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-semibold text-orange-700">{creditNote?.title || creditNote?.description || 'Credit Note'}</div>
                      {creditNote?.description && creditNote?.title && (
                        <div className="text-xs text-orange-600 mt-1">{creditNote.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium text-right align-top whitespace-nowrap text-red-600">
                      -AED {(creditNote?.creditAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Summary - Made more compact */}
      <div className="flex justify-end mb-3">
        <div className="w-full max-w-xs p-3 border rounded shadow-sm bg-gray-50">
          <h3 className="pb-1 mb-2 text-sm font-semibold text-gray-800 border-b">
            Payment Summary
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Net Amount:</span>
              <span className="font-medium">
                AED {(invoice?.netAmount || 0).toFixed(2)}
              </span>
            </div>

            {(invoice?.discount || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">
                  -AED {(invoice?.discount || 0).toFixed(2)}
                </span>
              </div>
            )}

            {invoice.credits && invoice.credits.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Credits Applied:</span>
                <span className="font-medium text-red-600">
                  -AED {invoice.credits.reduce((sum, credit) => sum + (credit.amount || 0), 0).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                AED {(invoice?.subtotal || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                VAT ({invoice?.vatRate || 0}%):
              </span>
              <span className="font-medium">
                AED {(invoice?.vatAmount || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between font-bold border-t pt-1 mt-1">
              <span className="text-gray-700">Total Amount:</span>
              <span className="text-blue-700">
                AED {(invoice?.totalAmount || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium text-green-600">
                AED {((invoice?.totalAmount || 0) - (invoice?.balanceToReceive || 0)).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Balance Due:</span>
              <span className="font-medium text-red-600">
                AED {(invoice?.balanceToReceive || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description if any */}
      {invoice.description && (
        <div className="mb-3 p-3 border rounded shadow-sm bg-gray-50">
          <h3 className="pb-1 mb-2 text-sm font-semibold text-gray-800 border-b">Notes:</h3>
          <div className="text-sm text-gray-700">{invoice.description}</div>
        </div>
      )}

      {/* Signatures - Made more compact */}
      <div className="pt-2 mt-4 border-t">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-6 text-xs text-gray-500">Customer Signature</p>
            <div className="w-48 border-t border-gray-400"></div>
            <p className="mt-1 text-xs text-gray-500">Date: ________________</p>
          </div>
          <div>
            <p className="mb-6 text-xs text-gray-500">Authorized Signature</p>
            <div className="w-48 border-t border-gray-400"></div>
            <p className="mt-1 text-xs text-gray-500">Date: ________________</p>
          </div>
        </div>
      </div>

      {/* Footer - Made more compact */}
      <div className="pt-2 mt-4 text-xs text-center text-gray-500 border-t">
        <p className="font-medium">
          Thank you for choosing Honest World Motors
        </p>
        <p>We appreciate your business!</p>
        <p className="mt-1">Generated on {currentDate}</p>
      </div>
    </div>
  );
};

// Direct print function for Invoice
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
  
  setTimeout(() => {
    const root = ReactDOM.createRoot(printContent);
    root.render(<InvoicePrintableContent invoice={invoice} />);
    
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }, 200);
};

// Print Button Component with blue theme
const PrintButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm shadow-sm"
  >
    <Printer className="w-4 h-4" />
    Print Invoice
  </button>
);

// Bulk print function for multiple invoices
export const printMultipleInvoices = async ({
  selectedInvoices,
  setPrintingInvoices
}) => {
  try {
    setPrintingInvoices(true);
    
    if (!selectedInvoices || selectedInvoices.length === 0) {
      toast.error("No invoices selected for printing");
      return;
    }

    toast.success(`Preparing ${selectedInvoices.length} invoice(s) for printing...`);

    // Fetch all invoice details first
    const invoiceDetails = [];
    for (let i = 0; i < selectedInvoices.length; i++) {
      const invoice = selectedInvoices[i];
      
      try {
        toast.loading(`Loading invoice ${i + 1} of ${selectedInvoices.length}: ${invoice.name}`, {
          id: 'print-progress'
        });

        const response = await fetchInvDetails(invoice._id);
        if (!response.data || !response.data.success) {
          throw new Error(`Failed to fetch details for invoice ${invoice.name}`);
        }

        invoiceDetails.push(response.data.invoice);
        
      } catch (error) {
        console.error(`Error loading invoice ${invoice.name}:`, error);
        toast.error(`Failed to load invoice ${invoice.name}`);
      }
    }

    // Clear progress toast
    toast.dismiss('print-progress');

    if (invoiceDetails.length === 0) {
      toast.error("No invoices could be loaded for printing");
      return;
    }

    // Create a single print window with all invoices
    await printAllInvoicesInSingleWindow(invoiceDetails);
    
    toast.success(`Successfully prepared ${invoiceDetails.length} invoice(s) for printing!`);

  } catch (error) {
    console.error("Error in bulk printing:", error);
    toast.error("Failed to print invoices: " + error.message);
  } finally {
    setPrintingInvoices(false);
  }
};

// Helper function to print all invoices in a single window with page breaks
const printAllInvoicesInSingleWindow = async (invoices) => {
  return new Promise((resolve, reject) => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Please allow popup windows to print invoices. Check your browser's popup blocker settings.");
      }

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoices - ${invoices.length} Invoice(s)</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                  background-color: white; 
                  font-size: 12px;
                }
                @page { 
                  size: A4; 
                  margin: 15mm; 
                }
                .page-break {
                  page-break-before: always;
                }
                .invoice-container {
                  page-break-inside: avoid;
                }
                .no-print {
                  display: none;
                }
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
                }
                .page-break {
                  border-top: 2px dashed #ccc;
                  margin: 2rem 0;
                  padding-top: 2rem;
                }
                .invoice-container {
                  margin-bottom: 2rem;
                  padding: 1rem;
                  border: 1px solid #e5e7eb;
                  border-radius: 0.5rem;
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
      
      setTimeout(() => {
        // Create invoice components for each invoice
        const invoiceElements = invoices.map((invoice, index) => {
          const invoiceDiv = document.createElement("div");
          invoiceDiv.className = index === 0 ? "invoice-container" : "invoice-container page-break";
          
          const root = ReactDOM.createRoot(invoiceDiv);
          root.render(<InvoicePrintableContent invoice={invoice} />);
          
          return invoiceDiv;
        });

        // Add all invoice elements to the print content
        invoiceElements.forEach(element => {
          printContent.appendChild(element);
        });
        
        setTimeout(() => {
          // Auto-trigger print dialog
          printWindow.print();
          
          // Handle print completion
          printWindow.onafterprint = () => {
            printWindow.close();
            resolve();
          };
          
          // Fallback to close window after delay
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close();
            }
            resolve();
          }, 10000);
          
        }, 1000); // Wait for React components to render
      }, 500);

    } catch (error) {
      reject(error);
    }
  });
};

// Main PrintInv Component
const PrintInv = ({ invoice }) => {
  return (
    <PrintButton onClick={() => printInvoiceDirectly(invoice)} />
  );
};

export default PrintInv;