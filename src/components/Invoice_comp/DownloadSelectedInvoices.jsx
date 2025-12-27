// InvoicePDFDownload.js
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatDate";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper function to draw rounded rectangles
const drawRoundedRect = (doc, x, y, width, height, radius) => {
  doc.roundedRect(x, y, width, height, radius, radius);
};

// New direct jsPDF implementation
export const printMultipleInvoicesJsPDF = async (invoices, includeSeal = false, includeSignature = false) => {
  if (!invoices || invoices.length === 0) {
    toast.error("No invoices selected for printing");
    return;
  }

  try {
    toast.loading(`Generating PDF for ${invoices.length} invoice(s)...`, { id: 'pdf-gen' });
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // A4 dimensions
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);

    // Load images if needed
    let logoImg = null;
    let sealImg = null;
    let signImg = null;

    try {
      // Load logo
      const logoResponse = await fetch('/hvp.png');
      const logoBlob = await logoResponse.blob();
      logoImg = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });

      // Load seal if needed
      if (includeSeal) {
        const sealResponse = await fetch('/hvp_seal.png');
        const sealBlob = await sealResponse.blob();
        sealImg = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(sealBlob);
        });
      }

      // Load signature if needed
      if (includeSignature) {
        const signResponse = await fetch('/hvp.png');
        const signBlob = await signResponse.blob();
        signImg = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(signBlob);
        });
      }
    } catch (err) {
      console.error('Error loading images:', err);
    }

    // Process each invoice
    for (let invoiceIndex = 0; invoiceIndex < invoices.length; invoiceIndex++) {
      const invoice = invoices[invoiceIndex];
      const customer = invoice?.customer;
      const customerVAT = customer?.VATNo || null;

      // Add new page for subsequent invoices
      if (invoiceIndex > 0) {
        doc.addPage();
      }

      let yPos = margin;

      // Header Section - Logo at top left
      if (logoImg) {
        const logoWidth = 80;
        const logoHeight = 30;
        doc.addImage(logoImg, 'PNG', margin, yPos, logoWidth, logoHeight);
        yPos += logoHeight + 5;
      }
      
      // Company details below logo (left aligned) - 10pt / 9pt
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Tel: +97142630077', margin, yPos);
      yPos += 5;
      doc.text('Fax: +97142636786', margin, yPos);
      yPos += 5;
      doc.text('PO Box: 49112, Dubai-UAE', margin, yPos);
      yPos += 5;
      doc.setFontSize(10);
      doc.text('Email: sales@honestynperfection.com', margin, yPos);
      yPos += 5;
      doc.text('VAT Reg No: 100596686400003', margin, yPos);
      yPos += 5;

      yPos += 5;

      // Customer Details and Tax Invoice Panel (side by side)
      const leftBoxWidth = contentWidth * 0.55;
      const rightBoxWidth = contentWidth * 0.40;
      const boxStartY = yPos;

      // Left: Bill To - 11pt
      doc.setDrawColor(0);
      doc.setLineWidth(0.4);
      drawRoundedRect(doc, margin, yPos, leftBoxWidth, 30, 2);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      yPos += 5;
      
      // Wrap customer name if too long
      const customerName = customer?.name || 'N/A';
      const nameLines = doc.splitTextToSize(customerName, leftBoxWidth - 4);
      doc.text(nameLines, margin + 2, yPos);
      yPos += nameLines.length * 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      if (customer?.Phone) {
        const phoneText = `Phone: ${customer.Phone}`;
        const phoneLines = doc.splitTextToSize(phoneText, leftBoxWidth - 4);
        doc.text(phoneLines, margin + 2, yPos);
        yPos += phoneLines.length * 5;
      }
      
      if (customer?.address?.address1) {
        const addressText = `Address: ${customer.address.address1}${customer.address.address3 ? ', ' + customer.address.address3 : ''}`;
        const addressLines = doc.splitTextToSize(addressText, leftBoxWidth - 4);
        doc.text(addressLines, margin + 2, yPos);
        yPos += addressLines.length * 5;
      }
      
      if (customer?.address?.address2) {
        const address2Lines = doc.splitTextToSize(customer.address.address2, leftBoxWidth - 4);
        doc.text(address2Lines, margin + 2, yPos);
        yPos += address2Lines.length * 5;
      }
      
      if (customerVAT) {
        const vatText = `VAT No: ${customerVAT}`;
        const vatLines = doc.splitTextToSize(vatText, leftBoxWidth - 4);
        doc.text(vatLines, margin + 2, yPos);
      }

      // Right: Tax Invoice Panel - TAX INVOICE Label 11pt, Meta Table 11pt
      const rightBoxX = margin + leftBoxWidth + (contentWidth - leftBoxWidth - rightBoxWidth);
      yPos = boxStartY;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TAX INVOICE', rightBoxX, yPos - 2);
      
      drawRoundedRect(doc, rightBoxX, yPos, rightBoxWidth, 30, 2);
      
      // Draw internal lines
      doc.line(rightBoxX, yPos + 7.5, rightBoxX + rightBoxWidth, yPos + 7.5);
      doc.line(rightBoxX, yPos + 15, rightBoxX + rightBoxWidth, yPos + 15);
      doc.line(rightBoxX, yPos + 22.5, rightBoxX + rightBoxWidth, yPos + 22.5);
      doc.line(rightBoxX + rightBoxWidth * 0.4, yPos, rightBoxX + rightBoxWidth * 0.4, yPos + 30);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Invoice No', rightBoxX + 1, yPos + 5);
      doc.text('Date:', rightBoxX + 1, yPos + 12.5);
      doc.text('Account Ref:', rightBoxX + 1, yPos + 20);
      doc.text('LPO:', rightBoxX + 1, yPos + 27.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(invoice?.name || 'N/A', rightBoxX + rightBoxWidth * 0.42, yPos + 5);
      doc.text(formatDate(invoice?.date || invoice?.createdAt || new Date()), rightBoxX + rightBoxWidth * 0.42, yPos + 12.5);
      doc.text(customer?.Code || '', rightBoxX + rightBoxWidth * 0.42, yPos + 20);
      doc.text(invoice?.lpo || '', rightBoxX + rightBoxWidth * 0.42, yPos + 27.5);

      yPos = boxStartY + 35;

      // Items Table
      const products = invoice?.products || [];
      const services = invoice?.services || [];
      const credits = invoice?.credits || [];
      const allItems = [
        ...products,
        ...services,
        ...credits.map(credit => ({
          quantity: 1,
          price: -Math.abs(credit.amount || 0),
          note: credit.title || 'Credit',
          additionalNote: credit.note || credit.additionalNote,
          isCredit: true
        }))
      ];
      const vatRate = invoice?.vatRate || 5;

      const tableData = allItems.map(item => {
        const netAmount = (item.price || 0) * (item.quantity || 0);
        const vatAmount = netAmount * (vatRate / 100);
        const totalAmount = netAmount + vatAmount;

        const baseDescription = item?.note || item?.service?.name || item?.product?.name || 'N/A';
        const additionalNote = item?.additionalNote?.trim();
        const descriptionParts = [baseDescription];
        if (additionalNote) {
          descriptionParts.push(`${additionalNote}`);
        }
        const description = descriptionParts.join('\n');
        
        return [
          item.quantity || 0,
          description,
          (item.price || 0).toFixed(2),
          netAmount.toFixed(2),
          vatAmount.toFixed(2),
          totalAmount.toFixed(2)
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Qty', 'Description', 'Unit Price', 'Net Amt', `VAT (${vatRate}%)`, 'Total']],
        body: tableData,
        theme: 'plain',
        styles: {
          fontSize: 9.5,
          cellPadding: 2.5,
          font: 'helvetica',
          fontStyle: 'normal',
          lineWidth: 0
        },
        headStyles: {
          fillColor: [164, 168, 177],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 9.5,
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'left', cellWidth: 'auto' },
          2: { halign: 'right', cellWidth: 25 },
          3: { halign: 'right', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 25 },
          5: { halign: 'right', cellWidth: 25 }
        },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Footer Section
      const totalNetAmount = allItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
      const totalVatAmount = totalNetAmount * (vatRate / 100);
      const invoiceTotal = totalNetAmount + totalVatAmount;

      // Signature boxes at bottom
      const footerY = pageHeight - 45;

      // Black separator line matching table border thickness (≈1.5px)
      doc.setDrawColor(0);
      doc.setLineWidth(0.4);
      const separatorY = footerY - 18;
      doc.line(margin, separatorY, pageWidth - margin, separatorY);
      
      // Left side - Seal and Customer Signature
      const boxWidth = (contentWidth - 10) / 2;
      const boxHeight = 25;
      const smallBoxHeight = 12;
      
      // Top small boxes (signature and empty)
      drawRoundedRect(doc, margin, footerY - 15, boxWidth / 2 - 2, smallBoxHeight, 2);
      if (includeSignature && signImg) {
        // Add signature with aspect ratio maintained, centered in box
        const signBoxWidth = boxWidth / 2 - 2;
        const signBoxHeight = smallBoxHeight;
        const padding = 2;
        const maxSignWidth = signBoxWidth - (padding * 2);
        const maxSignHeight = signBoxHeight - (padding * 2);
        
        // Calculate aspect ratio preserving dimensions
        const signWidth = 16; // Adjust width as needed
        const signHeight = maxSignHeight;
        const signX = margin + (signBoxWidth - signWidth) / 2; // Center horizontally
        const signY = footerY - 15 + padding;
        
        doc.addImage(signImg, 'PNG', signX, signY, signWidth, signHeight, undefined, 'FAST');
      }
      drawRoundedRect(doc, margin + boxWidth / 2 + 2, footerY - 15, boxWidth / 2 - 2, smallBoxHeight, 2);

      // Seal box
      drawRoundedRect(doc, margin, footerY, boxWidth / 2 - 2, boxHeight, 2);
      if (includeSeal && sealImg) {
        doc.addImage(sealImg, 'PNG', margin + 2, footerY + 2, (boxWidth / 2 - 2) - 4, boxHeight - 4);
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('For Honesty and perfection', margin + (boxWidth / 4 - 2), footerY + boxHeight + 5, { align: 'center' });
      doc.text('Sign & Seal', margin + (boxWidth / 4 - 2), footerY + boxHeight + 10, { align: 'center' });

      // Customer Signature box
      drawRoundedRect(doc, margin + boxWidth / 2 + 2, footerY, boxWidth / 2 - 2, boxHeight, 2);
      doc.text('Customer Signature', margin + boxWidth / 2 + 2 + (boxWidth / 4 - 2), footerY + boxHeight + 5, { align: 'center' });

      // Right side - Payment summary - Totals Box 10.5pt
      const summaryX = margin + boxWidth + 10;
      const summaryWidth = contentWidth - boxWidth - 10;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      
      const rowHeight = boxHeight / 3;
      // Draw outer rounded rectangle for payment summary
      drawRoundedRect(doc, summaryX, footerY, summaryWidth, boxHeight, 2);
      
      // Draw internal lines for rows
      doc.line(summaryX, footerY + rowHeight, summaryX + summaryWidth, footerY + rowHeight);
      doc.line(summaryX, footerY + rowHeight * 2, summaryX + summaryWidth, footerY + rowHeight * 2);
      doc.line(summaryX + summaryWidth / 2, footerY, summaryX + summaryWidth / 2, footerY + boxHeight);
      
      doc.text('Total Net Amount:', summaryX + 2, footerY + rowHeight / 2 + 1.5);
      doc.text(`AED ${totalNetAmount.toFixed(2)}`, summaryX + summaryWidth - 2, footerY + rowHeight / 2 + 1.5, { align: 'right' });
      
      doc.text(`Total Tax Amount (${vatRate}%):`, summaryX + 2, footerY + rowHeight + rowHeight / 2 + 1.5);
      doc.text(`AED ${totalVatAmount.toFixed(2)}`, summaryX + summaryWidth - 2, footerY + rowHeight + rowHeight / 2 + 1.5, { align: 'right' });
      
      doc.text('INVOICE TOTAL:', summaryX + 2, footerY + rowHeight * 2 + rowHeight / 2 + 1.5);
      doc.text(`AED ${invoiceTotal.toFixed(2)}`, summaryX + summaryWidth - 2, footerY + rowHeight * 2 + rowHeight / 2 + 1.5, { align: 'right' });
    }

    toast.dismiss('pdf-gen');

    // Open PDF in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const newWindow = window.open(pdfUrl, '_blank');
    
    if (!newWindow) {
      toast.error('Please allow popups to view the PDF');
    } else {
      toast.success(`${invoices.length} invoice(s) generated successfully!`);
    }

  } catch (error) {
    console.error('PDF generation failed:', error);
    toast.dismiss('pdf-gen');
    toast.error('Failed to generate PDF: ' + error.message);
  }
};

// Old html2canvas implementation (kept for backward compatibility)
export const printMultipleInvoices = async (invoices, includeSeal = false, includeSignature = false) => {
  if (!invoices || invoices.length === 0) {
    console.error("No invoices provided for printing");
    toast.error("No invoices selected for printing");
    return;
  }

  // Warn user about large batches
  if (invoices.length > 25) {
    toast.loading(`Processing ${invoices.length} invoices... This may take a moment.`, {
      duration: 5000,
      id: 'pdf-processing'
    });
  }

  try {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 210mm;
      margin: 0 auto;
      font-family: 'Tahoma', 'Arial Black', 'Segoe UI', Geneva, sans-serif;
      font-weight: bold;
      background: white;
      color: #000000ff;
      line-height: 1.4;
      visibility: visible;
      opacity: 1;
      display: block;
      position: relative;
      z-index: 1;
    `;
    container.id = 'pdf-container';

    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
      * {
        font-family: 'Tahoma', 'Arial Black', 'Segoe UI', Geneva, sans-serif !important;
        box-sizing: border-box;
      }
      .invoice-page * {
        font-weight: bold !important;
      }
      .invoice-page .company-details *,
      .invoice-page .normal-text,
      .invoice-page .normal-text *,
      .invoice-page table tbody td {
        font-weight: normal !important;
      }
      .invoice-page {
        width: 210mm;
        height: 297mm;
        padding: 5mm 10mm 10mm 10mm;
        margin: 0;
        background: white;
        display: flex;
        flex-direction: column;
        position: relative;
        box-sizing: border-box;
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      .invoice-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .footer-area {
        position: absolute;
        bottom: 10mm;
        left: 10mm;
        right: 10mm;
        width: calc(100% - 20mm);
        background: white;
        z-index: 10;
        border-top: 1.5px solid #000;
        padding-top: 10px;
        box-sizing: border-box;
      }
      .footer-area.relative {
        position: relative;
        bottom: auto;
        left: auto;
        right: auto;
        width: 100%;
        margin-top: auto;
      }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      .force-page-break {
        page-break-before: always !important;
        page-break-after: auto !important;
        break-before: page !important;
        break-after: auto !important;
        display: block !important;
        height: 1px !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        clear: both !important;
        visibility: hidden !important;
      }
    `;
    container.appendChild(style);

    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      const pageResult = createInvoicePage(invoice, i, includeSeal, includeSignature);
      
      // Check if result is a single page or multiple pages
      if (pageResult.isMultiple) {
        // Multiple pages - add each page
        pageResult.pages.forEach((page, index) => {
          page.setAttribute('data-page-type', `invoice-${i + 1}-page-${index + 1}`);
          
          
          container.appendChild(page);
        });
      } else {
        // Single page
        pageResult.setAttribute('data-page-type', `invoice-${i + 1}-single`);
        container.appendChild(pageResult);
      }
      
      // Add page break between different invoices (not after the last one)
      if (i < invoices.length - 1) {
        if (pageResult.isMultiple) {
          // For multiple page invoices, set page break on the last page
          const lastPage = pageResult.pages[pageResult.pages.length - 1];
          lastPage.style.pageBreakAfter = 'always';
        } else {
          // For single page invoices, set page break on the page itself
          pageResult.style.pageBreakAfter = 'always';
        }
      }
    }

    document.body.appendChild(container);
    
    console.log(`Generating PDF for ${invoices.length} invoice(s)...`);
    console.log(`Container dimensions: ${container.scrollWidth}px x ${container.scrollHeight}px`);
    
    // Give browser time to render, especially for large batches
    const renderDelay = invoices.length > 25 ? 3000 : invoices.length > 10 ? 1500 : 500;
    await new Promise(resolve => setTimeout(resolve, renderDelay));

    // Optimized scaling for quality and performance
    let scale, quality, imageType;
    if (invoices.length > 40) {
      scale = 1.0;
      quality = 0.85;
      imageType = 'jpeg';
    } else if (invoices.length > 25) {
      scale = 1.2;
      quality = 0.88;
      imageType = 'jpeg';
    } else if (invoices.length > 10) {
      scale = 1.3;
      quality = 0.92;
      imageType = 'jpeg';
    } else {
      scale = 1.5;
      quality = 0.96;
      imageType = 'png';
    }

    console.log(`Using scale: ${scale}, quality: ${quality}, type: ${imageType}`);

    const opt = {
      margin: 0,
      filename: `Invoices_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: imageType, quality: quality },
      html2canvas: {
        scale: scale,
        useCORS: true,
        letterRendering: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff',
        logging: true,
        onclone: function(clonedDoc) {
          console.log('html2canvas cloning document...');
        }
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { 
        mode: 'avoid-all'
      }
    };

    console.log('Starting PDF generation with html2pdf...');
    const pdfBlob = await html2pdf().set(opt).from(container).outputPdf('blob');
    
    console.log('PDF blob generated:', pdfBlob ? `${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB` : 'null/undefined');
    
    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('Generated PDF is empty. Try selecting fewer invoices.');
    }
    
    document.body.removeChild(container);

    // Dismiss loading toast
    toast.dismiss('pdf-processing');

    const pdfUrl = URL.createObjectURL(pdfBlob);
    const newWindow = window.open(pdfUrl, '_blank');
    if (!newWindow) {
      toast.error('Please allow popups to view the PDF');
    } else {
      toast.success(`${invoices.length} invoice(s) opened in new tab!`);
    }

  } catch (error) {
    console.error('PDF generation failed:', error);
    toast.dismiss('pdf-processing');
    
    if (invoices.length > 30) {
      toast.error(`Failed to generate PDF. Try selecting fewer invoices (maximum 30 recommended). Error: ${error.message}`);
    } else {
      toast.error('Failed to generate PDF: ' + error.message);
    }
    
    // Clean up container if it exists
    const existingContainer = document.getElementById('pdf-container');
    if (existingContainer) {
      document.body.removeChild(existingContainer);
    }
  }
};



const createInvoicePage = (invoice, index = 0, includeSeal = false, includeSignature = false) => {
  const customer = invoice?.customer;
  let customerVAT = customer?.VATNo || null;

  // Create temporary content to measure height
  const tempContainer = document.createElement('div');
  tempContainer.style.cssText = `
    position: absolute;
    top: -9999px;
    left: -9999px;
    width: 190mm;
    visibility: hidden;
    font-family: 'Tahoma', 'Arial Black', 'Segoe UI', Geneva, sans-serif;
    font-weight: bold;
  `;
  
  // Build content for measurement
  tempContainer.appendChild(createHeader(invoice, customer));
  
  const detailsGrid = document.createElement('div');
  detailsGrid.style.cssText = `display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: flex-start; margin-bottom: 8px;`;
  
  const billToSection = document.createElement('div');
  const billToLabel = document.createElement('div');
  billToLabel.innerHTML = '&nbsp;';
  billToLabel.style.cssText = `font-size: 13px; font-weight: 700; margin-bottom: 6px; height: 18.2px;`;
  billToSection.appendChild(billToLabel);
  billToSection.appendChild(createBillToSection(customer, customerVAT));
  detailsGrid.appendChild(billToSection);

  const taxInvoiceSection = document.createElement('div');
  const taxInvoiceLabel = document.createElement('div');
  taxInvoiceLabel.textContent = 'TAX INVOICE';
  taxInvoiceLabel.style.cssText = `font-size: 13px; font-weight: 700; margin-bottom: 6px; display: block; padding-bottom: 0; width: 80%; margin-left: auto;`;
  taxInvoiceSection.appendChild(taxInvoiceLabel);
  taxInvoiceSection.appendChild(createTaxInvoicePanel(invoice, customer));
  detailsGrid.appendChild(taxInvoiceSection);
  
  tempContainer.appendChild(detailsGrid);

  const itemsTable = createItemsTable(invoice);
  if (itemsTable) {
    tempContainer.appendChild(itemsTable);
  }

  document.body.appendChild(tempContainer);
  const contentHeight = tempContainer.offsetHeight;
  document.body.removeChild(tempContainer);

  // Calculate available space (A4 height - margins - footer space)
  const footerHeight = 180; // Approximate footer height in pixels (increased)
  const availableHeight = (297 - 20) * 3.779527559; // Convert mm to px (277mm available)
  const maxContentHeight = availableHeight - footerHeight - 50; // Add buffer



  // Check if content fits on one page
  if (contentHeight <= maxContentHeight) {
    // Content fits - create single page
    console.log(`Invoice ${index + 1} - Creating single page (content fits)`);
    return createSinglePage(invoice, customer, customerVAT, includeSeal, includeSignature);
  } else {
    // Content overflows - create multiple pages
    console.log(`Invoice ${index + 1} - Creating multiple pages (overflow: ${contentHeight - maxContentHeight}px over)`);
    return createMultiplePages(invoice, customer, customerVAT, maxContentHeight, includeSeal, includeSignature);
  }
};

const createSinglePage = (invoice, customer, customerVAT, includeSeal = false, includeSignature = false) => {
  const page = document.createElement('div');
  page.className = 'invoice-page';

  const content = document.createElement('div');
  content.className = 'invoice-content';

  // Header
  content.appendChild(createHeader(invoice, customer));

  // Bill To + Tax Invoice
  const detailsGrid = document.createElement('div');
  detailsGrid.style.cssText = `display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: flex-start; margin-bottom: 8px;`;
  
  const billToSection = document.createElement('div');
  const billToLabel = document.createElement('div');
  billToLabel.innerHTML = '&nbsp;';
  billToLabel.style.cssText = `font-size: 13px; font-weight: 700; margin-bottom: 6px; height: 18.2px;`;
  billToSection.appendChild(billToLabel);
  billToSection.appendChild(createBillToSection(customer, customerVAT));
  detailsGrid.appendChild(billToSection);

  const taxInvoiceSection = document.createElement('div');
  const taxInvoiceLabel = document.createElement('div');
  taxInvoiceLabel.textContent = 'TAX INVOICE';
  taxInvoiceLabel.style.cssText = `font-size: 13px; font-weight: 700; margin-bottom: 6px; display: block; width: 80%; margin-left: auto;`;
  taxInvoiceSection.appendChild(taxInvoiceLabel);
  taxInvoiceSection.appendChild(createTaxInvoicePanel(invoice, customer));
  detailsGrid.appendChild(taxInvoiceSection);
  
  content.appendChild(detailsGrid);

  // Items table
  const itemsTable = createItemsTable(invoice);
  if (itemsTable) {
    content.appendChild(itemsTable);
  }

  page.appendChild(content);

  // Footer - Always positioned at bottom
  const footer = createFooterSection(invoice, includeSeal, includeSignature);
  if (footer) {
    page.appendChild(footer);
  }

  return page;
};

const createMultiplePages = (invoice, customer, customerVAT, maxContentHeight, includeSeal = false, includeSignature = false) => {
  const products = invoice?.products || [];
  const services = invoice?.services || [];
  const credits = invoice?.credits || [];
  const allItems = [
    ...products,
    ...services,
    ...credits.map(credit => ({
      quantity: 1,
      price: -Math.abs(credit.amount || 0),
      note: credit.title || 'Credit',
      additionalNote: credit.note || credit.additionalNote,
      isCredit: true
    }))
  ];
  const vatRate = invoice?.vatRate || 5;
  
  // Calculate items that can fit up to signature box area
  // A4 page: 297mm total, 10mm margins = 277mm content height
  // Footer (signature area): ~40mm from bottom
  // Available for content: ~237mm = ~895px at 96dpi
  const pageHeightPx = 277 * 3.779527559; // Convert 277mm to pixels
  const footerReservedPx = 40 * 3.779527559; // Reserve 40mm for signature boxes
  const availableContentPx = pageHeightPx - footerReservedPx; // ~744px available
  
  const estimatedRowHeight = 22; // Reduced estimate for smaller font table rows
  const headerAndDetailsHeight = 320; // Reduced estimate for smaller font header section
  const availableSpaceForItems = availableContentPx - headerAndDetailsHeight; // ~424px for items
  const maxRowsFirstPage = Math.floor(availableSpaceForItems / estimatedRowHeight); // ~19 rows
  
  // Use most of the available space, but leave small buffer
  const maxItemsFirstPage = Math.max(5, Math.min(maxRowsFirstPage - 1, allItems.length - 2)); // At least 5, leave 2 for second page
  
  const firstPageItems = allItems.slice(0, maxItemsFirstPage);
  const continuationItems = allItems.slice(maxItemsFirstPage);
  
  console.log(`Splitting ${allItems.length} items: ${firstPageItems.length} on first page, ${continuationItems.length} on continuation`);
  console.log(`Available content space: ${availableContentPx}px (${availableContentPx/3.779527559}mm)`);
  console.log(`Space for items: ${availableSpaceForItems}px, Max rows: ${maxRowsFirstPage}, Selected items: ${maxItemsFirstPage}`);
  
  const pages = [];
  
  // First page with header, details, and partial items
  const firstPage = document.createElement('div');
  firstPage.className = 'invoice-page';
  firstPage.style.position = 'relative';
  firstPage.style.height = '297mm'; // Force exact A4 height
  firstPage.style.pageBreakAfter = 'always';

  const firstContent = document.createElement('div');
  firstContent.className = 'invoice-content';
  firstContent.style.position = 'static';
  firstContent.style.height = 'auto';
  firstContent.style.paddingBottom = '0';

  // Header with logo and address
  firstContent.appendChild(createHeader(invoice, customer));

  // Bill To + Tax Invoice
  const detailsGrid = document.createElement('div');
  detailsGrid.style.cssText = `display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: flex-start; margin-bottom: 8px;`;
  
  const billToSection = document.createElement('div');
  const billToLabel = document.createElement('div');
  billToLabel.innerHTML = '&nbsp;';
  billToLabel.style.cssText = `font-size: 13px; font-weight: 700; margin-bottom: 6px; height: 18.2px;`;
  billToSection.appendChild(billToLabel);
  billToSection.appendChild(createBillToSection(customer, customerVAT));
  detailsGrid.appendChild(billToSection);

  const taxInvoiceSection = document.createElement('div');
  const taxInvoiceLabel = document.createElement('div');
  taxInvoiceLabel.textContent = 'TAX INVOICE';
  taxInvoiceLabel.style.cssText = `font-size: 13px; font-weight: 700; margin-bottom: 6px; display: block; width: 80%; margin-left: auto;`;
  taxInvoiceSection.appendChild(taxInvoiceLabel);
  taxInvoiceSection.appendChild(createTaxInvoicePanel(invoice, customer));
  detailsGrid.appendChild(taxInvoiceSection);
  
  firstContent.appendChild(detailsGrid);

  // First part of items table
  if (firstPageItems.length > 0) {
    const firstTable = createContinuationTable(firstPageItems, vatRate);
    if (firstTable) {
      firstContent.appendChild(firstTable);
    }
  }

  // Add page number to first page
  const firstPageNumber = document.createElement('div');
  firstPageNumber.style.cssText = `position: absolute; top: 5mm; right: 10mm; font-size: 11px; font-weight: 700;`;
  firstPageNumber.textContent = 'Page 1 of 2';
  firstPage.appendChild(firstPageNumber);

  firstPage.appendChild(firstContent);
  pages.push(firstPage);

  // Second page - Continuation items with header and footer
  const secondPage = document.createElement('div');
  secondPage.className = 'invoice-page';
  secondPage.style.height = '297mm'; // Force exact A4 height

  // Add page number to second page
  const secondPageNumber = document.createElement('div');
  secondPageNumber.style.cssText = `position: absolute; top: 5mm; right: 10mm; font-size: 11px; font-weight: 700;`;
  secondPageNumber.textContent = 'Page 2 of 2';
  secondPage.appendChild(secondPageNumber);

  const secondContent = document.createElement('div');
  secondContent.className = 'invoice-content';

  // Add company header for continuity
  secondContent.appendChild(createHeader(invoice, customer));

  // Continuation items with table header
  if (continuationItems.length > 0) {
    const continuationLabel = document.createElement('div');
    continuationLabel.textContent = 'Items (Continued)';
    continuationLabel.style.cssText = `font-size: 11px; font-weight: 700; margin: 8px 0 4px 0; color: #555;`;
    secondContent.appendChild(continuationLabel);

    const continuationTable = createContinuationTable(continuationItems, vatRate);
    if (continuationTable) {
      secondContent.appendChild(continuationTable);
    }
  }

  // Add spacing before footer
  const spacer = document.createElement('div');
  spacer.style.height = '20px';
  secondContent.appendChild(spacer);

  secondPage.appendChild(secondContent);

  // Footer on second page
  const footer = createFooterSection(invoice, includeSeal, includeSignature);
  if (footer) {
    secondPage.appendChild(footer);
  }

  pages.push(secondPage);
  
  // Return object with pages array to distinguish from single page
  return { isMultiple: true, pages: pages };
};

const createHeader = (invoice, customer) => {
  const header = document.createElement('div');
  header.style.cssText = `display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; padding-bottom: 5px;`;

  const companyInfo = document.createElement('div');
  const logo = document.createElement('img');
  logo.src = '/hvp.png';
  logo.alt = 'Honesty Valet Parking Logo';
  logo.style.cssText = `height: 110px; margin-bottom: 5px; display: block;`;
  logo.onerror = function() {
    console.log('Logo failed to load');
    this.style.display = 'none';
  };
  logo.onload = function() {
    console.log('Logo loaded successfully');
  };
  companyInfo.appendChild(logo);

  const companyDetails = document.createElement('div');
  companyDetails.className = 'company-details';
  companyDetails.style.cssText = `font-size: 14px; line-height: 1.1; color: #1a1a1a; visibility: visible; opacity: 1; font-weight: normal !important;`;
  companyDetails.innerHTML = `
    <p style="margin: 0; color: #1a1a1a; font-weight: normal !important;">Tel: +97142630077</p>
    <p style="margin: 0; color: #1a1a1a; font-weight: normal !important;">Fax: +97142636786</p>
    <p style="margin: 0; color: #1a1a1a; font-weight: normal !important;">PO Box : 49112, Dubai-UAE</p>
    <p style="margin: 0; color: #1a1a1a; font-weight: normal !important;">Email: sales@honestynperfection.com</p>
    <p style="margin: 0; color: #1a1a1a; font-weight: normal !important;">VAT Reg No: 100596686400003</p>
  `;
  companyInfo.appendChild(companyDetails);
  header.appendChild(companyInfo);

  return header;
};

const createBillToSection = (customer, customerVAT) => {
  const billTo = document.createElement('div');
  billTo.className = 'normal-text';
  billTo.style.cssText = `border: 1.5px solid #000; border-radius: 4px; padding: 6px; font-size: 10px;`;
  billTo.innerHTML = `
    <p style="font-size: 14px; margin: 0 0 3px 0;">${customer?.name || "N/A"}</p>
   
    ${customer?.Phone ? `<p style="font-size: 14px; margin: 1px 0;">Phone: ${customer.Phone}</p>` : ''}
${customer?.address?.address1 
  ? `<p style="font-size: 14px; margin: 1px 0;"> 
      ${customer.address.address1}${customer.address.address3 ? ', ' + customer.address.address3 : ''}
     </p>` 
  : ''}

    ${customer?.address?.address2 ? `<p style="font-size: 14px; margin: 1px 0;">${customer.address.address2}</p>` : ''}
    ${customerVAT ? `<p style="font-size: 14px; margin: 1px 0;">VAT No: ${customerVAT}</p>` : ''}
  `;
  return billTo;
};

const createTaxInvoicePanel = (invoice, customer) => {
    const panel = document.createElement('div');
    panel.className = 'normal-text';
    panel.style.cssText = `border: 1.5px solid #000; border-radius: 4px; overflow: hidden; width: 80%; margin-left: auto;`;
    const html = `
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <tr style="border-bottom: 1.5px solid #000;">
            <td style="padding: 6px; font-size: 14px; border-right: 1.5px solid #000;">Invoice No</td>
            <td style="font-size: 14px; padding: 6px;">${invoice?.name || 'N/A'}</td>
          </tr>
          <tr style="border-bottom: 1.5px solid #000;">
            <td style="padding: 6px; font-size: 14px; border-right: 1.5px solid #000;">Date:</td>
            <td style="padding: 6px; font-size: 14px;">${formatDate(invoice?.date || invoice?.createdAt || new Date())}</td>
          </tr>
          <tr style="border-bottom: 1.5px solid #000;">
            <td style="padding: 6px; font-size: 14px; border-right: 1.5px solid #000;">Account Ref:</td>
            <td style="padding: 6px; font-size: 14px;">${customer?.Code || ''}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-size: 14px; border-right: 1.5px solid #000;">LPO:</td>
            <td style="padding: 6px; font-size: 14px;">${invoice?.lpo || ''}</td>
          </tr>
        </table>
    `;
    panel.innerHTML = html;
    return panel;
};

// Helper function to create table header
const createTableHeader = () => {
  const thead = document.createElement('thead');
  thead.style.backgroundColor = '#a4a8b1ff';
  const headerRow = thead.insertRow();
  headerRow.style.verticalAlign = 'middle';
  const headers = ['Qty', 'Description', 'Unit Price', 'Net Amt', 'VAT (5%)', 'Total'];
  const aligns = ['center', 'left', 'right', 'right', 'right', 'right'];
  headers.forEach((text, i) => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.cssText = `padding: 8px 5px; text-align: ${aligns[i]}; vertical-align: middle; border: none; font-size: 14px; line-height: 1.2;`;
    headerRow.appendChild(th);
  });
  return thead;
};

// Helper function to create table rows for items
const createTableRows = (items, vatRate = 5) => {
  const tbody = document.createElement('tbody');
  const aligns = ['center', 'left', 'right', 'right', 'right', 'right'];
  
  items.forEach(item => {
    const row = tbody.insertRow();
    const netAmount = (item.price || 0) * (item.quantity || 0);
    const vatAmount = netAmount * (vatRate / 100);
    const totalAmount = netAmount + vatAmount;

    const baseDescription = item?.note || item?.service?.name || item?.product?.name || "N/A";
    const additionalNote = item?.additionalNote?.trim();

    const quantityCell = row.insertCell();
    quantityCell.textContent = item.quantity || 0;
    quantityCell.style.cssText = `padding: 5px; text-align: ${aligns[0]}; border: none; font-weight: normal; font-size: 15px;`;

    const descriptionCell = row.insertCell();
    descriptionCell.style.cssText = `padding: 5px; text-align: ${aligns[1]}; border: none; font-weight: normal; font-size: 15px;`;
    const mainDescription = document.createElement('div');
    mainDescription.textContent = baseDescription;
    descriptionCell.appendChild(mainDescription);
    if (additionalNote) {
      const noteEl = document.createElement('div');
      noteEl.textContent = `Additional Note: ${additionalNote}`;
      noteEl.style.cssText = 'font-size: 13px; color: #444; margin-top: 2px;';
      descriptionCell.appendChild(noteEl);
    }

    const unitPriceCell = row.insertCell();
    unitPriceCell.textContent = (item.price || 0).toFixed(2);
    unitPriceCell.style.cssText = `padding: 5px; text-align: ${aligns[2]}; border: none; font-weight: normal; font-size: 15px;`;

    const netCell = row.insertCell();
    netCell.textContent = netAmount.toFixed(2);
    netCell.style.cssText = `padding: 5px; text-align: ${aligns[3]}; border: none; font-weight: normal; font-size: 15px;`;

    const vatCell = row.insertCell();
    vatCell.textContent = vatAmount.toFixed(2);
    vatCell.style.cssText = `padding: 5px; text-align: ${aligns[4]}; border: none; font-weight: normal; font-size: 15px;`;

    const totalCell = row.insertCell();
    totalCell.textContent = totalAmount.toFixed(2);
    totalCell.style.cssText = `padding: 5px; text-align: ${aligns[5]}; border: none; font-weight: normal; font-size: 15px;`;
  });
  
  return tbody;
};

// Create items table with all items
const createItemsTable = (invoice) => {
  const products = invoice?.products || [];
  const services = invoice?.services || [];
  const credits = invoice?.credits || [];
  const allItems = [
    ...products,
    ...services,
    ...credits.map(credit => ({
      quantity: 1,
      price: -Math.abs(credit.amount || 0),
      note: credit.title || 'Credit',
      additionalNote: credit.note || credit.additionalNote,
      isCredit: true
    }))
  ];
  if (allItems.length === 0) return null;

  const table = document.createElement('table');
  table.style.cssText = `width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 15px;`;

  table.appendChild(createTableHeader());
  table.appendChild(createTableRows(allItems, invoice?.vatRate || 5));

  return table;
};

// Create continuation table with header for next page
const createContinuationTable = (items, vatRate = 5) => {
  if (!items || items.length === 0) return null;

  const table = document.createElement('table');
  table.style.cssText = `width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 15px;`;

  table.appendChild(createTableHeader());
  table.appendChild(createTableRows(items, vatRate));

  return table;
};

const createFooterSection = (invoice, includeSeal = false, includeSignature = false) => {
  const footer = document.createElement('div');
  footer.className = 'footer-area';
  
  const products = invoice?.products || [];
  const services = invoice?.services || [];
  const credits = invoice?.credits || [];
  const allItems = [
    ...products,
    ...services,
    ...credits.map(credit => ({
      quantity: 1,
      price: -Math.abs(credit.amount || 0),
      note: credit.title || 'Credit',
      additionalNote: credit.note || credit.additionalNote,
      isCredit: true
    }))
  ];
  const vatRate = invoice?.vatRate || 5;
  const totalNetAmount = allItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const totalVatAmount = totalNetAmount * (vatRate / 100);
  const invoiceTotal = totalNetAmount + totalVatAmount;

  // Always show full footer with boxes, but conditionally include seal/signature images
  footer.innerHTML = `
    <div style="width: 100%; height: 1.5px; background: #000; margin-bottom: 12px; margin-top: -18px;"></div>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div style="display: flex; justify-content: space-between; gap: 20px;">
        <!-- Top boxes with signature and empty -->
        <div style="flex: 1.125; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="border: 1.5px solid #000; padding: 5px; text-align: center; border-radius: 4px; height: 46.4px; display: flex; align-items: center; justify-content: center;">
            ${includeSignature ? '<img src="/hvp_sign.png" alt="Signature" style="max-height: 39.4px; max-width: 100%;" onerror="console.log(\'Signature image failed to load\'); this.style.display=\'none\'">' : ''}
          </div>
          <div style="border: 1.5px solid #000; padding: 5px; text-align: center; border-radius: 4px; height: 46.4px;">
          </div>
        </div>
        <div style="flex: 1;"></div>
      </div>
      
      <!-- Main section with seal and customer signature -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 20px;">
        <div style="flex: 1.125; display: flex; flex-direction: column;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <div style="border: 1.5px solid #000; padding: 5px; text-align: center; border-radius: 4px; margin-bottom: 5px; height: 92.8px; display: flex; align-items: center; justify-content: center;">
                ${includeSeal ? '<img src="/hvp_seal.png" alt="Seal" style="max-height: 85px; max-width: 100%;" onerror="console.log(\'Seal image failed to load\'); this.style.display=\'none\'">' : ''}
              </div>
              <p style="margin: 0; font-weight: 700; text-align: center; font-size: 14px;">For Honesty and perfection  </p>
              <p style="margin: 0; font-weight: 700; text-align: center; font-size: 14px;">Sign & Seal</p>
            </div>
            <div>
              <div style="border: 1.5px solid #000; padding: 5px; text-align: center; border-radius: 4px; margin-bottom: 5px; height: 92.8px; display: flex; align-items: center; justify-content: center;">
                <div style="height: 92.8px;"></div>
              </div>
              <p style="margin: 0; font-weight: 700; text-align: center; font-size: 14px;">Customer Signature</p>
            </div>
          </div>
        </div>
        <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 0; align-self: flex-end; margin-bottom: 65px;">
          <div style="border: 1.5px solid #000; border-radius: 4px 0 0 6px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <tbody>
                <tr style="border-bottom: 1.5px solid #000;">
                  <td style="padding: 6px; font-size: 14px; font-weight: 700;">Total Net Amount:</td>
                </tr>
                <tr style="border-bottom: 1.5px solid #000;">
                  <td style="padding: 6px; font-size: 14px; font-weight: 700;">Total Tax Amount (${vatRate}%):</td>
                </tr>
                <tr>
                  <td style="padding: 6px; font-size: 14px; font-weight: 700;">INVOICE TOTAL:</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="border: 1.5px solid #000; border-left: none; border-radius: 0 4px 4px 0; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                <tr style="border-bottom: 1.5px solid #000;">
                  <td style="padding: 6px; font-size: 14px; text-align: right;">AED ${totalNetAmount.toFixed(2)}</td>
                </tr>
                <tr style="border-bottom: 1.5px solid #000;">
                  <td style="padding: 6px; font-size: 14px; text-align: right;">AED ${totalVatAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px; font-size: 14px; text-align: right;">AED ${invoiceTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return footer;
};

// Kept for compatibility
export const downloadInvoicesAsPDF = async (invoices, setExportingPDF) => {
  try {
    setExportingPDF && setExportingPDF(true);
    await printMultipleInvoices(invoices);
  } catch (error) {
    console.error("PDF generation failed:", error);
    toast.error("Failed to generate PDF.");
  } finally {
    setExportingPDF && setExportingPDF(false);
  }
};