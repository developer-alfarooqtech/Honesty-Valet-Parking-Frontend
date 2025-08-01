import html2pdf from "html2pdf.js";
import { downloadInvoices, fetchInvDetails } from "../../service/invoicesService";
import toast from "react-hot-toast";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const handleDownloadPDF = async ({
  setExportingPDF,
  debouncedSearchTerm,
  startDate,
  endDate,
  showOverdueOnly,
  showPaymentClearedOnly,
  selectedCustomer,
  isExpired,
}) => {
  try {
    setExportingPDF(true);
    // Get raw data for PDF generation
    const response = await downloadInvoices({
      debouncedSearchTerm,
      startDate,
      endDate,
      overdueOnly: showOverdueOnly,
      paymentClearedOnly: showPaymentClearedOnly,
      customerId: selectedCustomer?._id || "",
    });

    if (!response.data || !response.data.invoices) {
      toast.error("Failed to retrieve invoice data");
      return;
    }

    // Check if html2pdf is loaded
    if (typeof html2pdf === "undefined") {
      toast.error("PDF generation library not loaded. Please try again.");
      return;
    }
    const { invoices, invoiceStats } = response.data;

    // Create a temporary container for PDF content
    const element = document.createElement("div");
    element.style.padding = "20px";
    element.style.fontFamily = "Arial, sans-serif";

    // Add header
    const header = document.createElement("div");
    header.innerHTML = `
        <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 5px;">Invoice Report</h1>
        <p style="color: #64748b; font-size: 12px; margin-top: 0; margin-bottom: 8px">
          ${
            startDate && endDate
              ? `Report Period: ${formatDate(startDate)} to ${formatDate(
                  endDate
                )}`
              : "All Time Report"
          }
        </p>
      `;

    element.appendChild(header);

    // Add job cards table
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "20px";
    table.style.fontSize = "12px";

    // Add table header
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr style="background-color: #f8fafc; color: #334155;">
          <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">INV</th>
          <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Customer</th>
          <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">LPO</th>
        
          <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Date</th>
          <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Exp Date</th>
          <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">Total Amount</th>
          <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">Balance</th>
          <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">Payment Status</th>
        </tr>
      `;
    table.appendChild(thead);

    // Add table body
    const tbody = document.createElement("tbody");
    invoices.forEach((inv, index) => {
      const tr = document.createElement("tr");
      tr.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";

      tr.innerHTML = `
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${
            inv.name || "N/A"
          }</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${
            inv?.customer?.Code || "N/A"
          }</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${
            inv?.lpo || "N/A"
          }</td>

        
          
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${formatDate(
            inv?.updatedAt
          )}</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${formatDate(
            inv?.expDate
          )}</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">${inv.totalAmount?.toFixed(
            2
          )}</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">${inv.balanceToReceive?.toFixed(
            2
          )}</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">${
            inv.isPaymentCleared
              ? "Fully Paid"
              : isExpired(inv.expDate)
              ? "Overdue"
              : "Pending"
          }</td>
        `;

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    element.appendChild(table);

    // Add summary section
    const summarySection = document.createElement("div");
    summarySection.style.backgroundColor = "#f8fafc";
    summarySection.style.border = "1px solid #e2e8f0";
    summarySection.style.padding = "15px";
    summarySection.style.marginBottom = "20px";
    summarySection.innerHTML = `
        <h2 style="color: #334155; font-size: 16px; margin-top: 0; margin-bottom: 15px;">Report Summary</h2>
        
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
          <div style="flex: 1; min-width: 200px; background-color: white; padding: 10px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">Total Outstanding</p>
            <p style="color: #2563eb; font-size: 16px; font-weight: bold; margin: 0;">${invoiceStats.totalOutstanding}</p>
          </div>
          
          <div style="flex: 1; min-width: 200px; background-color: white; padding: 10px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">Overdue Amount</p>
            <p style="color: #e11d48; font-size: 16px; font-weight: bold, margin: 0;">${invoiceStats.overdueAmount}</p>
          </div>
          
          <div style="flex: 1; min-width: 200px; background-color: white; padding: 10px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">Total Received</p>
            <p style="color: #16a34a; font-size: 16px; font-weight: bold; margin: 0;">${invoiceStats.totalPaymentsReceived}</p>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
          <div style="flex: 1; min-width: 200px; background-color: white; padding: 10px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">Fully Paid vs Total</p>
            <p style="color: #2563eb; font-size: 16px; font-weight: bold; margin: 0;">
              ${invoiceStats.paidInvoicesCount} / ${invoiceStats.totalInvoicesCount} (${invoiceStats.paymentCompletionRate})
            </p>
          </div>

          <div style="flex: 1; min-width: 200px; background-color: white; padding: 10px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">Overdue Invoices</p>
            <p style="color: #e11d48; font-size: 16px; font-weight: bold; margin: 0;">${invoiceStats.dueCount}</p>
          </div>
          
          <div style="flex: 1; min-width: 200px; background-color: white; padding: 10px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">Pending Invoices</p>
            <p style="color: #f59e0b; font-size: 16px; font-weight: bold; margin: 0;">${invoiceStats.pendingCount}</p>
          </div>
          
          <div style="flex: 1; min-width: 200px; background-color: white; padding: 10px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">Avg. Days to Payment</p>
            <p style="color: #2563eb; font-size: 16px; font-weight: bold; margin: 0;">${invoiceStats.averageDaysToPayment} days</p>
          </div>
        </div>
      `;
    element.appendChild(summarySection);

    // Add footer
    const footer = document.createElement("div");
    footer.style.borderTop = "1px solid #e2e8f0";
    footer.style.paddingTop = "10px";
    footer.style.textAlign = "center";
    footer.style.color = "#64748b";
    footer.style.fontSize = "10px";
    footer.innerHTML = `Generated on ${new Date().toLocaleDateString("en-GB")} - This is a system-generated report`;
    element.appendChild(footer);

    // Append to document temporarily
    document.body.appendChild(element);

    // Generate PDF
    const fileName = "Invoice_Report.pdf";
    const opt = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(element).save();

    // Remove temporary element
    document.body.removeChild(element);

    toast.success("PDF report downloaded successfully");
  } catch (err) {
    console.error("PDF generation error:", err);
    toast.error("Failed to download PDF report");
  } finally {
    setExportingPDF(false);
  }
};

// New function to download multiple invoices as separate PDFs
export const downloadMultipleInvoicesAsPDFs = async ({
  selectedInvoices,
  setExportingPDF
}) => {
  try {
    setExportingPDF(true);
    
    if (!selectedInvoices || selectedInvoices.length === 0) {
      toast.error("No invoices selected for download");
      return;
    }

    // Check if html2pdf is loaded
    if (typeof html2pdf === "undefined") {
      toast.error("PDF generation library not loaded. Please try again.");
      return;
    }

    toast.success(`Starting download of ${selectedInvoices.length} invoice(s)...`);

    let successCount = 0;
    let errorCount = 0;

    // Process each invoice sequentially to avoid overwhelming the browser
    for (let i = 0; i < selectedInvoices.length; i++) {
      const invoice = selectedInvoices[i];
      
      try {
        // Update progress
        toast.loading(`Processing invoice ${i + 1} of ${selectedInvoices.length}: ${invoice.name}`, {
          id: 'download-progress'
        });

        // Fetch detailed invoice data
        const response = await fetchInvDetails(invoice._id);
        if (!response.data || !response.data.success) {
          throw new Error(`Failed to fetch details for invoice ${invoice.name}`);
        }

        const detailedInvoice = response.data.invoice;
        
        // Generate PDF for this invoice
        await generateSingleInvoicePDF(detailedInvoice, i + 1);
        successCount++;
        
        // Small delay between downloads to prevent browser overload
        if (i < selectedInvoices.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Error downloading invoice ${invoice.name}:`, error);
        errorCount++;
      }
    }

    // Clear progress toast
    toast.dismiss('download-progress');

    // Show final result
    if (successCount === selectedInvoices.length) {
      toast.success(`Successfully downloaded ${successCount} invoice PDF(s)!`);
    } else if (successCount > 0) {
      toast.success(`Downloaded ${successCount} of ${selectedInvoices.length} invoices. ${errorCount} failed.`);
    } else {
      toast.error("Failed to download any invoices");
    }

  } catch (error) {
    console.error("Error in bulk PDF download:", error);
    toast.error("Failed to download invoices: " + error.message);
  } finally {
    setExportingPDF(false);
  }
};

// Helper function to generate PDF for a single invoice
const generateSingleInvoicePDF = async (invoice, sequenceNumber) => {
  // Create a temporary container for PDF content
  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.backgroundColor = "white";
  element.style.color = "#000";

  // Generate invoice HTML content
  element.innerHTML = generateInvoiceHTML(invoice);

  // Append to document temporarily
  document.body.appendChild(element);

  try {
    // Generate filename with invoice name and date
    const date = new Date().toISOString().split('T')[0];
    const filename = `Invoice_${invoice.name || `INV_${sequenceNumber}`}_${date}.pdf`;

    const options = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: "mm", 
        format: "a4", 
        orientation: "portrait" 
      },
    };

    // Generate and save PDF
    await html2pdf().set(options).from(element).save();

  } finally {
    // Remove temporary element
    document.body.removeChild(element);
  }
};

// Helper function to generate HTML content for a single invoice
const generateInvoiceHTML = (invoice) => {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString("en-GB") : "N/A";
  };

  const currentDate = new Date().toLocaleDateString('en-GB');

  const combinedItemsTable = (invoice.products && invoice.products.length > 0) || (invoice.services && invoice.services.length > 0) || (invoice.credits && invoice.credits.length > 0) ? `
    <div style="margin-bottom: 12px;">
      <h3 style="padding-bottom: 4px; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 0.5px solid #000;">Items</h3>
      <div style="overflow-x: auto; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); border: 0.5px solid #000;">
        <table style="min-width: 100%; font-size: 14px; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #dbeafe;">
              <th style="width: 80px; padding: 12px; font-weight: 600; text-align: center; white-space: nowrap; border: 0.5px solid #000;">Qty</th>
              <th style="width: 96px; padding: 12px; font-weight: 600; text-align: left; white-space: nowrap; border: 0.5px solid #000;">Code</th>
              <th style="padding: 12px; font-weight: 600; text-align: left; border: 0.5px solid #000;">Item Description</th>
              <th style="width: 112px; padding: 12px; font-weight: 600; text-align: right; white-space: nowrap; border: 0.5px solid #000;">Unit Price</th>
              <th style="width: 112px; padding: 12px; font-weight: 600; text-align: right; white-space: nowrap; border: 0.5px solid #000;">Total</th>
            </tr>
          </thead>
          <tbody style="border-collapse: collapse;">
            ${invoice.products ? invoice.products.map((item, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 8px 12px; text-align: center; vertical-align: top; white-space: nowrap; font-weight: 600; border: 0.5px solid #000;">${item?.quantity || 0}</td>
                <td style="padding: 8px 12px; vertical-align: top; white-space: nowrap; font-family: monospace; font-size: 12px; border: 0.5px solid #000;">${item.product?.code || '-'}</td>
                <td style="padding: 8px 12px; vertical-align: top; border: 0.5px solid #000;">
                  <div style="font-weight: 600; color: #111827;">${item.product?.name || '-'}</div>
                  ${item.note ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${item.note}</div>` : ''}
                </td>
                <td style="padding: 8px 12px; text-align: right; vertical-align: top; white-space: nowrap; font-weight: 600; border: 0.5px solid #000;">AED ${(item?.price || 0).toFixed(2)}</td>
                <td style="padding: 8px 12px; font-weight: 500; text-align: right; vertical-align: top; white-space: nowrap; border: 0.5px solid #000;">AED ${((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}</td>
              </tr>
            `).join('') : ''}
            ${invoice.services ? invoice.services.map((service, index) => `
              <tr style="background-color: ${((invoice.products?.length || 0) + index) % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 8px 12px; text-align: center; vertical-align: top; white-space: nowrap; font-weight: 600; border: 0.5px solid #000;">${service?.quantity || 1}</td>
                <td style="padding: 8px 12px; vertical-align: top; white-space: nowrap; font-family: monospace; font-size: 12px; border: 0.5px solid #000;">SERVICE</td>
                <td style="padding: 8px 12px; vertical-align: top; border: 0.5px solid #000;">
                  <div style="font-weight: 600; color: #111827;">${service?.name || '-'}</div>
                  ${service.description ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${service.description}</div>` : ''}
                </td>
                <td style="padding: 8px 12px; text-align: right; vertical-align: top; white-space: nowrap; font-weight: 600; border: 0.5px solid #000;">AED ${(service?.price || 0).toFixed(2)}</td>
                <td style="padding: 8px 12px; font-weight: 500; text-align: right; vertical-align: top; white-space: nowrap; border: 0.5px solid #000;">AED ${((service?.price || 0) * (service?.quantity || 1)).toFixed(2)}</td>
              </tr>
            `).join('') : ''}
            ${invoice.credits ? invoice.credits.map((credit, index) => `
              <tr style="background-color: ${(((invoice.products?.length || 0) + (invoice.services?.length || 0) + index) % 2 === 0) ? '#fef3e2' : '#fde68a'};">
                <td style="padding: 8px 12px; text-align: center; vertical-align: top; white-space: nowrap; font-weight: 600; color: #6b7280; border: 0.5px solid #000;">N/A</td>
                <td style="padding: 8px 12px; vertical-align: top; white-space: nowrap; font-family: monospace; font-size: 12px; color: #dc2626; border: 0.5px solid #000;">CREDIT</td>
                <td style="padding: 8px 12px; vertical-align: top; border: 0.5px solid #000;">
                  <div style="font-weight: 600; color: #b91c1c;">${credit?.title || 'Credit'}</div>
                  ${(credit.note || credit.additionalNote) ? `<div style="font-size: 12px; color: #dc2626; margin-top: 4px;">${credit.note || credit.additionalNote}</div>` : ''}
                </td>
                <td style="padding: 8px 12px; text-align: right; vertical-align: top; white-space: nowrap; font-weight: 600; color: #dc2626; border: 0.5px solid #000;">-AED ${(credit?.amount || 0).toFixed(2)}</td>
                <td style="padding: 8px 12px; font-weight: 500; text-align: right; vertical-align: top; white-space: nowrap; color: #dc2626; border: 0.5px solid #000;">-AED ${(credit?.amount || 0).toFixed(2)}</td>
              </tr>
            `).join('') : ''}
          </tbody>
        </table>
      </div>
    </div>
  ` : '';

  const creditNotesTable = invoice.creditNote && invoice.creditNote.length > 0 ? `
    <div style="margin-bottom: 12px;">
      <h3 style="padding-bottom: 4px; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #ea580c; border-bottom: 0.5px solid #fed7aa;">Credit Notes</h3>
      <div style="overflow-x: auto; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); border: 0.5px solid #fed7aa;">
        <table style="min-width: 100%; font-size: 14px; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #fef3e2;">
              <th style="width: 96px; padding: 12px; font-weight: 600; text-align: left; white-space: nowrap; color: #ea580c; border: 0.5px solid #fed7aa;">Credit Note #</th>
              <th style="width: 96px; padding: 12px; font-weight: 600; text-align: left; white-space: nowrap; color: #ea580c; border: 0.5px solid #fed7aa;">Date</th>
              <th style="padding: 12px; font-weight: 600; text-align: left; color: #ea580c; border: 0.5px solid #fed7aa;">Description</th>
              <th style="width: 112px; padding: 12px; font-weight: 600; text-align: right; white-space: nowrap; color: #ea580c; border: 0.5px solid #fed7aa;">Amount</th>
            </tr>
          </thead>
          <tbody style="border-collapse: collapse;">
            ${invoice.creditNote.map((creditNote, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#fef3e2'};">
                <td style="padding: 8px 12px; vertical-align: top; white-space: nowrap; font-family: monospace; font-size: 12px; color: #ea580c; border: 0.5px solid #fde68a;">${creditNote?.creditNoteNumber || 'N/A'}</td>
                <td style="padding: 8px 12px; vertical-align: top; white-space: nowrap; font-size: 12px; color: #d97706; border: 0.5px solid #fde68a;">${new Date(creditNote?.date).toLocaleDateString("en-GB") || '-'}</td>
                <td style="padding: 8px 12px; vertical-align: top; border: 0.5px solid #fde68a;">
                  <div style="font-weight: 600; color: #ea580c;">${creditNote?.title || creditNote?.description || 'Credit Note'}</div>
                  ${(creditNote?.description && creditNote?.title) ? `<div style="font-size: 12px; color: #d97706; margin-top: 4px;">${creditNote.description}</div>` : ''}
                </td>
                <td style="padding: 8px 12px; font-weight: 500; text-align: right; vertical-align: top; white-space: nowrap; color: #dc2626; border: 0.5px solid #fde68a;">-AED ${(creditNote?.creditAmount || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  ` : '';

  const paymentHistory = invoice.paymentHistory && invoice.paymentHistory.length > 0 ? `
    <div style="margin-bottom: 12px;">
      <h3 style="padding-bottom: 4px; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 0.25px solid #000;">Payment History</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 0.25px solid #ccc; padding: 8px; text-align: left;">Date</th>
            <th style="border: 0.25px solid #ccc; padding: 8px; text-align: right;">Amount</th>
            <th style="border: 0.25px solid #ccc; padding: 8px; text-align: left;">Bank Account</th>
            <th style="border: 0.25px solid #ccc; padding: 8px; text-align: left;">Note</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.paymentHistory.map((payment, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
              <td style="border: 0.25px solid #ccc; padding: 8px;">${formatDate(payment.date)}</td>
              <td style="border: 0.25px solid #ccc; padding: 8px; text-align: right; font-weight: bold;">AED ${(payment.amount || 0).toFixed(2)}</td>
              <td style="border: 0.25px solid #ccc; padding: 8px;">${payment.bankAccount?.name || "N/A"}</td>
              <td style="border: 0.25px solid #ccc; padding: 8px;">${payment.note || "-"}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

  return `
    <div style="padding: 16px; background-color: white; max-width: 1024px; margin: 0 auto;">
      <!-- Header - Company and Customer details side by side -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 0.5px solid #000;">
        <div style="flex: 1;">
          <h1 style="font-size: 20px; font-weight: bold; color: #2563eb; margin: 0 0 4px 0;">
            HONEST WORLD MOTORS
          </h1>
          <div style="margin-top: 4px; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">Tel: +97142630077</p>
            <p style="margin: 0;">Email: honestworldmotors2004@gmail.com</p>
            <p style="margin: 0;">VAT Reg No: 100596686400003</p>
          </div>
        </div>

        <!-- Invoice Details moved to right side -->
        <div style="flex: 1;">
          <div style="text-align: right; margin-bottom: 8px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #1d4ed8; margin: 0 0 4px 0;">
              Invoice: ${invoice?.name || "-"}
            </h2>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              Date: ${new Date(invoice.date).toLocaleDateString("en-GB")}
            </p>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              Due Date: ${new Date(invoice.expDate).toLocaleDateString("en-GB")}
            </p>
          </div>
          <div style="font-size: 14px; text-align: right;">
            <p style="font-weight: 500; margin: 0;">
              ${invoice?.customer?.name || "-"}
            </p>
            ${invoice?.customer?.Phone ? `
              <p style="color: #6b7280; margin: 0;">
                ${invoice.customer.Phone}
              </p>
            ` : ''}
            ${invoice?.customer?.address?.address1 ? `
              <p style="color: #6b7280; margin: 0;">
                ${invoice.customer.address.address1}
              </p>
            ` : ''}
            ${invoice?.customer?.address?.address2 ? `
              <p style="color: #6b7280; margin: 0;">
                ${invoice.customer.address.address2}
              </p>
            ` : ''}
            ${invoice?.customer?.Email ? `
              <p style="color: #6b7280; margin: 0;">
                ${invoice.customer.Email}
              </p>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Combined Items Table -->
      ${combinedItemsTable}

      <!-- Credit Notes Table -->
      ${creditNotesTable}

      <!-- Payment Summary -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
        <div style="width: 100%; max-width: 384px; padding: 12px; border: 0.5px solid #000; border-radius: 4px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); background-color: #f9fafb;">
          <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 0.5px solid #000;">
            Payment Summary
          </h3>
          <div style="font-size: 14px; line-height: 1.25;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #6b7280;">Net Amount:</span>
              <span style="font-weight: 500;">
                AED ${(invoice?.netAmount || 0).toFixed(2)}
              </span>
            </div>

            ${(invoice?.discount || 0) > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #6b7280;">Discount:</span>
                <span style="font-weight: 500; color: #16a34a;">
                  -AED ${(invoice?.discount || 0).toFixed(2)}
                </span>
              </div>
            ` : ''}

            ${invoice.credits && invoice.credits.length > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #6b7280;">Credits Applied:</span>
                <span style="font-weight: 500; color: #dc2626;">
                  -AED ${invoice.credits.reduce((sum, credit) => sum + (credit.amount || 0), 0).toFixed(2)}
                </span>
              </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #6b7280;">Subtotal:</span>
              <span style="font-weight: 500;">
                AED ${(invoice?.subtotal || 0).toFixed(2)}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #6b7280;">
                VAT (${invoice?.vatRate || 0}%):
              </span>
              <span style="font-weight: 500;">
                AED ${(invoice?.vatAmount || 0).toFixed(2)}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 0.5px solid #000; padding-top: 4px; margin-top: 4px;">
              <span style="color: #374151;">Total Amount:</span>
              <span style="color: #1d4ed8;">
                AED ${(invoice?.totalAmount || 0).toFixed(2)}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #6b7280;">Amount Paid:</span>
              <span style="font-weight: 500; color: #16a34a;">
                AED ${((invoice?.totalAmount || 0) - (invoice?.balanceToReceive || 0)).toFixed(2)}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Balance Due:</span>
              <span style="font-weight: 500; color: #dc2626;">
                AED ${(invoice?.balanceToReceive || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      ${invoice?.description ? `
        <div style="margin-bottom: 12px; padding: 12px; border: 0.5px solid #000; border-radius: 4px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); background-color: #f9fafb;">
          <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 0.5px solid #000;">Notes:</h3>
          <div style="font-size: 14px; color: #374151;">${invoice.description}</div>
        </div>
      ` : ''}

      <!-- Payment History -->
      ${paymentHistory}

      <!-- Signatures -->
      <div style="padding-top: 8px; margin-top: 16px; border-top: 0.5px solid #000;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <p style="margin-bottom: 24px; font-size: 12px; color: #6b7280;">Customer Signature</p>
            <div style="width: 192px; border-top: 0.5px solid #9ca3af;"></div>
            <p style="margin-top: 4px; font-size: 12px; color: #6b7280;">Date: ________________</p>
          </div>
          <div>
            <p style="margin-bottom: 24px; font-size: 12px; color: #6b7280;">Authorized Signature</p>
            <div style="width: 192px; border-top: 0.5px solid #9ca3af;"></div>
            <p style="margin-top: 4px; font-size: 12px; color: #6b7280;">Date: ________________</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding-top: 8px; margin-top: 16px; font-size: 12px; text-align: center; color: #6b7280; border-top: 0.5px solid #000;">
        <p style="font-weight: 500, margin: 0;">
          Thank you for choosing Honest World Motors
        </p>
        <p style="margin: 0;">We appreciate your business!</p>
        <p style="margin-top: 4px;">Generated on ${currentDate}</p>
      </div>
    </div>
  `;
};
