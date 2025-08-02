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

            {invoice.creditNote && invoice.creditNote.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Credit Notes Applied:</span>
                <span className="font-medium text-red-600">
                  -AED {invoice.creditNote.reduce((sum, creditNote) => sum + (creditNote.creditAmount || 0), 0).toFixed(2)}
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

// Direct print function for Invoice - Improved with fallback
const printInvoiceDirectly = (invoice) => {
  if (!invoice) {
    console.error("Invoice data is missing");
    toast.error("Invoice data is missing");
    return;
  }

  // Try popup first, fallback to current window method
  try {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      throw new Error("Popup blocked");
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
              @page { size: A4; margin: 15mm; }
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
                padding: 1rem;
              }
              .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 1000;
              }
              .print-button:hover { background: #2563eb; }
            }
            @media print {
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Print Invoice</button>
          <div id="print-content" class="print-container">${generateInvoiceHTML(invoice)}</div>
          <script>
            // Auto-print after a short delay to allow content to load
            setTimeout(function() {
              window.print();
            }, 1000);
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
  } catch (error) {
    // Popup blocked or other error, use current window method
    console.log("Popup blocked, using fallback method");
    toast.loading("Preparing invoice for printing...", { id: 'single-print' });
    
    printAllInvoicesInCurrentWindow([invoice]).then(() => {
      toast.success("Invoice prepared for printing!", { id: 'single-print' });
    }).catch((error) => {
      console.error("Print error:", error);
      toast.error("Failed to prepare invoice for printing", { id: 'single-print' });
    });
  }
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

// Bulk print function for multiple invoices - Improved to avoid popup blockers
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

    // Show confirmation for large batches
    if (selectedInvoices.length > 10) {
      const confirmed = window.confirm(
        `You are about to print ${selectedInvoices.length} invoices. This may take a while. Do you want to continue?`
      );
      if (!confirmed) {
        setPrintingInvoices(false);
        return;
      }
    }

    toast.success(`Preparing ${selectedInvoices.length} invoice(s) for printing...`);

    // Fetch all invoice details first with batch processing
    const invoiceDetails = [];
    const batchSize = 5; // Process in smaller batches to avoid overwhelming the server
    
    for (let i = 0; i < selectedInvoices.length; i += batchSize) {
      const batch = selectedInvoices.slice(i, i + batchSize);
      
      toast.loading(`Loading invoices ${i + 1}-${Math.min(i + batchSize, selectedInvoices.length)} of ${selectedInvoices.length}`, {
        id: 'print-progress'
      });

      // Process batch in parallel for better performance
      const batchPromises = batch.map(async (invoice) => {
        try {
          const response = await fetchInvDetails(invoice._id);
          if (!response.data || !response.data.success) {
            throw new Error(`Failed to fetch details for invoice ${invoice.name}`);
          }
          return response.data.invoice;
        } catch (error) {
          console.error(`Error loading invoice ${invoice.name}:`, error);
          toast.error(`Failed to load invoice ${invoice.name}`);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      invoiceDetails.push(...batchResults.filter(invoice => invoice !== null));
      
      // Small delay between batches to prevent overwhelming the server
      if (i + batchSize < selectedInvoices.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Clear progress toast
    toast.dismiss('print-progress');

    if (invoiceDetails.length === 0) {
      toast.error("No invoices could be loaded for printing");
      return;
    }

    // Use the improved print method that doesn't rely on popups
    await printAllInvoicesInCurrentWindow(invoiceDetails);
    
    toast.success(`Successfully prepared ${invoiceDetails.length} invoice(s) for printing!`);

  } catch (error) {
    console.error("Error in bulk printing:", error);
    toast.error("Failed to print invoices: " + error.message);
  } finally {
    setPrintingInvoices(false);
  }
};

// Improved print method that doesn't rely on popups - creates content in current window
const printAllInvoicesInCurrentWindow = async (invoices) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a print container that's initially hidden but properly structured
      const printContainer = document.createElement('div');
      printContainer.id = 'bulk-print-container';
      printContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 210mm;
        background-color: white;
        z-index: -1;
        opacity: 0;
        pointer-events: none;
      `;
      
      document.body.appendChild(printContainer);

      // Create print styles with complete isolation
      const printStyles = document.createElement('style');
      printStyles.id = 'bulk-print-styles';
      printStyles.textContent = `
        @media screen {
          #bulk-print-container {
            display: none !important;
            visibility: hidden !important;
          }
        }
        
        @media print {
          /* Hide all body children except our print container */
          body > *:not(#bulk-print-container) {
            display: none !important;
          }
          
          /* Hide specific elements that might interfere */
          #invoice-preview-overlay,
          .no-print,
          nav,
          header,
          footer,
          .sidebar,
          .navigation {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Reset body for clean printing */
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            color: black !important;
          }
          
          /* Make our print container the only visible content */
          #bulk-print-container {
            display: block !important;
            position: static !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            z-index: 1 !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
          }
          
          /* Page configuration */
          @page {
            size: A4;
            margin: 15mm;
          }
          
          /* Page break handling */
          .page-break {
            page-break-before: always !important;
          }
          
          /* First invoice should not have page break */
          .invoice-container:first-child {
            page-break-before: avoid !important;
          }
          
          /* Invoice container print styles */
          .invoice-container {
            page-break-inside: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
            width: 100% !important;
          }
        }
      `;
      
      document.head.appendChild(printStyles);

      // Generate HTML content for all invoices
      let allInvoicesHtml = '';
      
      invoices.forEach((invoice, index) => {
        const invoiceHtml = generateInvoiceHTML(invoice);
        const containerClass = index === 0 ? 'invoice-container' : 'invoice-container page-break';
        allInvoicesHtml += `<div class="${containerClass}">${invoiceHtml}</div>`;
      });

      printContainer.innerHTML = allInvoicesHtml;

      // Show user a preview option
      const shouldPreview = invoices.length > 5 ? 
        window.confirm(`Ready to print ${invoices.length} invoices. Would you like to preview first? (Click Cancel to print directly)`) : 
        false;

      if (shouldPreview) {
        // Create preview in current window instead of popup
        createInWindowPreview(allInvoicesHtml, invoices.length, printContainer, printStyles, resolve);
      } else {
        // Direct print - prepare container for printing
        setTimeout(() => {
          // Trigger print
          window.print();
          
          // Cleanup after print with longer delay to ensure print dialog is handled
          setTimeout(() => {
            try {
              if (document.body.contains(printContainer)) {
                document.body.removeChild(printContainer);
              }
              if (document.head.contains(printStyles)) {
                document.head.removeChild(printStyles);
              }
            } catch (cleanupError) {
              console.warn('Cleanup error:', cleanupError);
            }
            resolve();
          }, 1500);
        }, 500);
      }

    } catch (error) {
      // Cleanup on error
      const container = document.getElementById('bulk-print-container');
      const styles = document.getElementById('bulk-print-styles');
      if (container) document.body.removeChild(container);
      if (styles) document.head.removeChild(styles);
      reject(error);
    }
  });
};

// Helper function to create in-window preview (no popups)
const createInWindowPreview = (allInvoicesHtml, invoiceCount, printContainer, printStyles, resolve) => {
  // Create preview overlay
  const previewOverlay = document.createElement('div');
  previewOverlay.id = 'invoice-preview-overlay';
  previewOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  // Create preview content container
  const previewContent = document.createElement('div');
  previewContent.style.cssText = `
    background: white;
    width: 100%;
    max-width: 900px;
    height: 90%;
    border-radius: 8px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  // Create header with controls
  const previewHeader = document.createElement('div');
  previewHeader.style.cssText = `
    background: #f8fafc;
    padding: 16px 24px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  `;

  const previewTitle = document.createElement('h3');
  previewTitle.textContent = `Print Preview - ${invoiceCount} Invoice(s)`;
  previewTitle.style.cssText = `
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
  `;

  // Print button
  const printButton = document.createElement('button');
  printButton.textContent = 'Print All';
  printButton.style.cssText = `
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  printButton.onmouseover = () => printButton.style.background = '#2563eb';
  printButton.onmouseout = () => printButton.style.background = '#3b82f6';

  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = `
    background: #6b7280;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  closeButton.onmouseover = () => closeButton.style.background = '#4b5563';
  closeButton.onmouseout = () => closeButton.style.background = '#6b7280';

  // Create scrollable content area
  const previewBody = document.createElement('div');
  previewBody.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background: #f3f4f6;
  `;

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.style.cssText = `
    max-width: 800px;
    margin: 0 auto;
  `;

  // Add Tailwind CSS link for styling
  const tailwindLink = document.createElement('link');
  tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
  tailwindLink.rel = 'stylesheet';
  document.head.appendChild(tailwindLink);

  // Style the invoice content for preview
  const styledContent = allInvoicesHtml.replace(
    /class="invoice-container"/g, 
    'class="invoice-container" style="background: white; margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"'
  ).replace(
    /class="invoice-container page-break"/g,
    'class="invoice-container page-break" style="background: white; margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 2px dashed #ccc; margin-top: 2rem; padding-top: 2rem;"'
  );

  contentWrapper.innerHTML = styledContent;

  // Assemble the preview
  buttonContainer.appendChild(printButton);
  buttonContainer.appendChild(closeButton);
  previewHeader.appendChild(previewTitle);
  previewHeader.appendChild(buttonContainer);
  previewBody.appendChild(contentWrapper);
  previewContent.appendChild(previewHeader);
  previewContent.appendChild(previewBody);
  previewOverlay.appendChild(previewContent);

  // Event handlers
  const cleanup = () => {
    if (document.body.contains(previewOverlay)) {
      document.body.removeChild(previewOverlay);
    }
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
    if (document.head.contains(printStyles)) {
      document.head.removeChild(printStyles);
    }
    if (document.head.contains(tailwindLink)) {
      document.head.removeChild(tailwindLink);
    }
    resolve();
  };

  printButton.onclick = () => {
    // Hide preview overlay completely during print
    previewOverlay.style.display = 'none';
    previewOverlay.style.visibility = 'hidden';
    previewOverlay.style.zIndex = '-9999';
    
    setTimeout(() => {
      // Trigger print
      window.print();
      
      // Cleanup after print with proper delay
      setTimeout(() => {
        cleanup();
      }, 1500);
    }, 300);
  };

  closeButton.onclick = cleanup;

  // Close on overlay click (but not on content click)
  previewOverlay.onclick = (e) => {
    if (e.target === previewOverlay) {
      cleanup();
    }
  };

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', handleEscape);
      cleanup();
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Add to DOM
  document.body.appendChild(previewOverlay);
};

// Helper function to generate HTML for a single invoice without React
const generateInvoiceHTML = (invoice) => {
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  // Calculate totals
  const productsTotal = invoice.products?.reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 0)), 0) || 0;
  const servicesTotal = invoice.services?.reduce((sum, service) => sum + ((service?.price || 0) * (service?.quantity || 1)), 0) || 0;
  const creditsTotal = invoice.credits?.reduce((sum, credit) => sum + (credit?.amount || 0), 0) || 0;
  const creditNotesTotal = invoice.creditNote?.reduce((sum, creditNote) => sum + (creditNote?.creditAmount || 0), 0) || 0;
  
  return `
    <div class="p-4 bg-white max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-start gap-4 pb-3 mb-3 border-b">
        <div class="flex-1">
          <h1 class="text-xl font-bold text-blue-600">HONEST WORLD MOTORS</h1>
          <div class="mt-1 text-xs text-gray-600">
            <p>Tel: +97142630077</p>
            <p>Email: honestworldmotors2004@gmail.com</p>
            <p>VAT Reg No: 100596686400003</p>
          </div>
        </div>
        <div class="flex-1">
          <div class="text-right mb-2">
            <h2 class="text-lg font-bold text-blue-700">Invoice: ${invoice?.name || "-"}</h2>
            <p class="text-sm text-gray-500">Date: ${new Date(invoice.date).toLocaleDateString("en-GB")}</p>
            <p class="text-sm text-gray-500">Due Date: ${new Date(invoice.expDate).toLocaleDateString("en-GB")}</p>
          </div>
          <div class="text-sm text-right">
            <p class="font-medium">${invoice?.customer?.name || "-"}</p>
            ${invoice?.customer?.Phone ? `<p class="text-gray-600">${invoice.customer.Phone}</p>` : ''}
            ${invoice?.customer?.address?.address1 ? `<p class="text-gray-600">${invoice.customer.address.address1}</p>` : ''}
            ${invoice?.customer?.address?.address2 ? `<p class="text-gray-600">${invoice.customer.address.address2}</p>` : ''}
            ${invoice?.customer?.Email ? `<p class="text-gray-600">${invoice.customer.Email}</p>` : ''}
          </div>
        </div>
      </div>

      <!-- Items Table -->
      ${(invoice.products?.length > 0 || invoice.services?.length > 0 || invoice.credits?.length > 0) ? `
        <div class="mb-3">
          <h3 class="pb-1 mb-2 text-sm font-semibold text-gray-800 border-b">Items</h3>
          <div class="overflow-x-auto rounded-md shadow-sm border">
            <table class="min-w-full text-sm divide-y divide-gray-200">
              <thead>
                <tr class="bg-blue-50">
                  <th class="w-20 px-3 py-2 font-semibold text-center whitespace-nowrap">Qty</th>
                  <th class="w-24 px-3 py-2 font-semibold text-left whitespace-nowrap">Code</th>
                  <th class="px-3 py-2 font-semibold text-left">Item Description</th>
                  <th class="w-28 px-3 py-2 font-semibold text-right whitespace-nowrap">Unit Price</th>
                  <th class="w-28 px-3 py-2 font-semibold text-right whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${invoice.products?.map((item, index) => `
                  <tr class="${index % 2 === 0 ? "bg-white" : "bg-gray-50"}">
                    <td class="px-3 py-2 text-center align-top whitespace-nowrap font-semibold">${item?.quantity || 0}</td>
                    <td class="px-3 py-2 align-top whitespace-nowrap font-mono text-xs">${item.product?.code || '-'}</td>
                    <td class="px-3 py-2 align-top">
                      <div class="font-semibold text-gray-900">${item.product?.name || '-'}</div>
                      ${item.note ? `<div class="text-xs text-gray-600 mt-1">${item.note}</div>` : ''}
                    </td>
                    <td class="px-3 py-2 text-right align-top whitespace-nowrap font-semibold">AED ${(item?.price || 0).toFixed(2)}</td>
                    <td class="px-3 py-2 font-medium text-right align-top whitespace-nowrap">AED ${((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}</td>
                  </tr>
                `).join('') || ''}
                ${invoice.services?.map((service, index) => `
                  <tr class="${((invoice.products?.length || 0) + index) % 2 === 0 ? "bg-white" : "bg-gray-50"}">
                    <td class="px-3 py-2 text-center align-top whitespace-nowrap font-semibold">${service?.quantity || 1}</td>
                    <td class="px-3 py-2 align-top whitespace-nowrap font-mono text-xs">SERVICE</td>
                    <td class="px-3 py-2 align-top">
                      <div class="font-semibold text-gray-900">${service?.name || '-'}</div>
                      ${service.description ? `<div class="text-xs text-gray-600 mt-1">${service.description}</div>` : ''}
                    </td>
                    <td class="px-3 py-2 text-right align-top whitespace-nowrap font-semibold">AED ${(service?.price || 0).toFixed(2)}</td>
                    <td class="px-3 py-2 font-medium text-right align-top whitespace-nowrap">AED ${((service?.price || 0) * (service?.quantity || 1)).toFixed(2)}</td>
                  </tr>
                `).join('') || ''}
                ${invoice.credits?.map((credit, index) => `
                  <tr class="${(((invoice.products?.length || 0) + (invoice.services?.length || 0) + index) % 2 === 0) ? "bg-orange-50" : "bg-orange-100"}">
                    <td class="px-3 py-2 text-center align-top whitespace-nowrap font-semibold text-gray-500">N/A</td>
                    <td class="px-3 py-2 align-top whitespace-nowrap font-mono text-xs text-red-600">CREDIT</td>
                    <td class="px-3 py-2 align-top">
                      <div class="font-semibold text-red-700">${credit?.title || 'Credit'}</div>
                      ${(credit.note || credit.additionalNote) ? `<div class="text-xs text-red-600 mt-1">${credit.note || credit.additionalNote}</div>` : ''}
                    </td>
                    <td class="px-3 py-2 text-right align-top whitespace-nowrap font-semibold text-red-600">-AED ${(credit?.amount || 0).toFixed(2)}</td>
                    <td class="px-3 py-2 font-medium text-right align-top whitespace-nowrap text-red-600">-AED ${(credit?.amount || 0).toFixed(2)}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Credit Notes Table - Separate section -->
      ${invoice.creditNote?.length > 0 ? `
        <div class="mb-3">
          <h3 class="pb-1 mb-2 text-sm font-semibold text-orange-800 border-b border-orange-300">Credit Notes</h3>
          <div class="overflow-x-auto rounded-md shadow-sm border border-orange-200">
            <table class="min-w-full text-sm divide-y divide-orange-200">
              <thead>
                <tr class="bg-orange-50">
                  <th class="w-24 px-3 py-2 font-semibold text-left whitespace-nowrap text-orange-700">Credit Note #</th>
                  <th class="w-24 px-3 py-2 font-semibold text-left whitespace-nowrap text-orange-700">Date</th>
                  <th class="px-3 py-2 font-semibold text-left text-orange-700">Description</th>
                  <th class="w-28 px-3 py-2 font-semibold text-right whitespace-nowrap text-orange-700">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-orange-100">
                ${invoice.creditNote.map((creditNote, index) => `
                  <tr class="${index % 2 === 0 ? "bg-white" : "bg-orange-50"}">
                    <td class="px-3 py-2 align-top whitespace-nowrap font-mono text-xs text-orange-700">${creditNote?.creditNoteNumber || 'N/A'}</td>
                    <td class="px-3 py-2 align-top whitespace-nowrap text-xs text-orange-600">${new Date(creditNote?.date).toLocaleDateString("en-GB") || '-'}</td>
                    <td class="px-3 py-2 align-top">
                      <div class="font-semibold text-orange-700">${creditNote?.title || creditNote?.description || 'Credit Note'}</div>
                      ${(creditNote?.description && creditNote?.title) ? `<div class="text-xs text-orange-600 mt-1">${creditNote.description}</div>` : ''}
                    </td>
                    <td class="px-3 py-2 font-medium text-right align-top whitespace-nowrap text-red-600">-AED ${(creditNote?.creditAmount || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Payment Summary -->
      <div class="flex justify-end mb-3">
        <div class="w-full max-w-xs p-3 border rounded shadow-sm bg-gray-50">
          <h3 class="pb-1 mb-2 text-sm font-semibold text-gray-800 border-b">Payment Summary</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Net Amount:</span>
              <span class="font-medium">AED ${(invoice?.netAmount || 0).toFixed(2)}</span>
            </div>
            ${(invoice?.discount || 0) > 0 ? `
              <div class="flex justify-between">
                <span class="text-gray-600">Discount:</span>
                <span class="font-medium text-green-600">-AED ${(invoice?.discount || 0).toFixed(2)}</span>
              </div>
            ` : ''}
            ${invoice.credits && invoice.credits.length > 0 ? `
              <div class="flex justify-between">
                <span class="text-gray-600">Credits Applied:</span>
                <span class="font-medium text-red-600">-AED ${creditsTotal.toFixed(2)}</span>
              </div>
            ` : ''}
            ${invoice.creditNote && invoice.creditNote.length > 0 ? `
              <div class="flex justify-between">
                <span class="text-gray-600">Credit Notes Applied:</span>
                <span class="font-medium text-red-600">-AED ${creditNotesTotal.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal:</span>
              <span class="font-medium">AED ${(invoice?.subtotal || 0).toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">VAT (${invoice?.vatRate || 0}%):</span>
              <span class="font-medium">AED ${(invoice?.vatAmount || 0).toFixed(2)}</span>
            </div>
            <div class="flex justify-between font-bold border-t pt-1 mt-1">
              <span class="text-gray-700">Total Amount:</span>
              <span class="text-blue-700">AED ${(invoice?.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Amount Paid:</span>
              <span class="font-medium text-green-600">AED ${((invoice?.totalAmount || 0) - (invoice?.balanceToReceive || 0)).toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Balance Due:</span>
              <span class="font-medium text-red-600">AED ${(invoice?.balanceToReceive || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      ${invoice.description ? `
        <div class="mb-3 p-3 border rounded shadow-sm bg-gray-50">
          <h3 class="pb-1 mb-2 text-sm font-semibold text-gray-800 border-b">Notes:</h3>
          <div class="text-sm text-gray-700">${invoice.description}</div>
        </div>
      ` : ''}

      <!-- Signatures -->
      <div class="pt-2 mt-4 border-t">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="mb-6 text-xs text-gray-500">Customer Signature</p>
            <div class="w-48 border-t border-gray-400"></div>
            <p class="mt-1 text-xs text-gray-500">Date: ________________</p>
          </div>
          <div>
            <p class="mb-6 text-xs text-gray-500">Authorized Signature</p>
            <div class="w-48 border-t border-gray-400"></div>
            <p class="mt-1 text-xs text-gray-500">Date: ________________</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="pt-2 mt-4 text-xs text-center text-gray-500 border-t">
        <p class="font-medium">Thank you for choosing Honest World Motors</p>
        <p>We appreciate your business!</p>
        <p class="mt-1">Generated on ${currentDate}</p>
      </div>
    </div>
  `;
};

// Enhanced batch print function for very large numbers of invoices
export const printLargeInvoiceBatch = async ({
  selectedInvoices,
  setPrintingInvoices,
  chunkSize = 20 // Print in chunks of 20 invoices
}) => {
  try {
    setPrintingInvoices(true);
    
    if (!selectedInvoices || selectedInvoices.length === 0) {
      toast.error("No invoices selected for printing");
      return;
    }

    const totalInvoices = selectedInvoices.length;
    
    // For very large batches, ask for confirmation
    if (totalInvoices > 50) {
      const confirmed = window.confirm(
        `You are about to print ${totalInvoices} invoices. This will be processed in chunks of ${chunkSize} invoices each. This may take several minutes. Do you want to continue?`
      );
      if (!confirmed) {
        setPrintingInvoices(false);
        return;
      }
    }

    // Split invoices into chunks
    const chunks = [];
    for (let i = 0; i < selectedInvoices.length; i += chunkSize) {
      chunks.push(selectedInvoices.slice(i, i + chunkSize));
    }

    toast.success(`Processing ${totalInvoices} invoices in ${chunks.length} batch(es)...`);

    // Process each chunk
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      const chunkStart = chunkIndex * chunkSize + 1;
      const chunkEnd = Math.min((chunkIndex + 1) * chunkSize, totalInvoices);
      
      toast.loading(`Processing batch ${chunkIndex + 1} of ${chunks.length} (Invoices ${chunkStart}-${chunkEnd})`, {
        id: 'batch-progress'
      });

      // Fetch invoice details for this chunk
      const invoiceDetails = [];
      for (const invoice of chunk) {
        try {
          const response = await fetchInvDetails(invoice._id);
          if (response.data && response.data.success) {
            invoiceDetails.push(response.data.invoice);
          }
        } catch (error) {
          console.error(`Error loading invoice ${invoice.name}:`, error);
          toast.error(`Failed to load invoice ${invoice.name}`);
        }
      }

      if (invoiceDetails.length > 0) {
        // Print this chunk
        await printAllInvoicesInCurrentWindow(invoiceDetails);
        
        // Wait a bit between chunks to prevent overwhelming the browser
        if (chunkIndex < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    toast.dismiss('batch-progress');
    toast.success(`Successfully processed all ${totalInvoices} invoices for printing!`);

  } catch (error) {
    console.error("Error in large batch printing:", error);
    toast.error("Failed to print invoice batch: " + error.message);
  } finally {
    setPrintingInvoices(false);
  }
};

// Main PrintInv Component
const PrintInv = ({ invoice }) => {
  return (
    <PrintButton onClick={() => printInvoiceDirectly(invoice)} />
  );
};

export default PrintInv;