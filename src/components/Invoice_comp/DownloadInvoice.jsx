import html2pdf from 'html2pdf.js';
import { downloadInvoices, fetchInvDetails } from '../../service/invoicesService';
import toast from 'react-hot-toast';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Create HTML for a single invoice. LPO displayed under invoice title when present.
const generateInvoiceHTML = (invoice) => {
  const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : 'N/A');
  const currentDate = new Date().toLocaleDateString('en-GB');

  const productRows = (invoice.products || []).map((it, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
      <td style="padding:8px;border:0.5px solid #000;text-align:center;">${it.quantity || 0}</td>
      <td style="padding:8px;border:0.5px solid #000;">${it.product?.code || '-'}</td>
      <td style="padding:8px;border:0.5px solid #000;">${it.product?.name || '-'}</td>
      <td style="padding:8px;border:0.5px solid #000;text-align:right;">AED ${(it.price || 0).toFixed(2)}</td>
      <td style="padding:8px;border:0.5px solid #000;text-align:right;">AED ${((it.price || 0) * (it.quantity || 0)).toFixed(2)}</td>
    </tr>
  `).join('');

  const serviceRows = (invoice.services || []).map((it, idx) => `
    <tr style="background:${(invoice.products?.length || 0 + idx) % 2 === 0 ? '#fff' : '#f9fafb'};">
      <td style="padding:8px;border:0.5px solid #000;text-align:center;">${it.quantity || 1}</td>
      <td style="padding:8px;border:0.5px solid #000;">SERVICE</td>
      <td style="padding:8px;border:0.5px solid #000;">${it.name || '-'}${it.description ? `<div style='font-size:12px;color:#6b7280;margin-top:4px;'>${it.description}</div>` : ''}</td>
      <td style="padding:8px;border:0.5px solid #000;text-align:right;">AED ${(it.price || 0).toFixed(2)}</td>
      <td style="padding:8px;border:0.5px solid #000;text-align:right;">AED ${((it.price || 0) * (it.quantity || 1)).toFixed(2)}</td>
    </tr>
  `).join('');

  const creditRows = (invoice.credits || []).map((c, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#fef3e2' : '#fde68a'};">
      <td style="padding:8px;border:0.5px solid #000;text-align:center;">N/A</td>
      <td style="padding:8px;border:0.5px solid #000;">CREDIT</td>
      <td style="padding:8px;border:0.5px solid #000;">${c.title || 'Credit'}${(c.note || c.additionalNote) ? `<div style='font-size:12px;color:#dc2626;margin-top:4px;'>${c.note || c.additionalNote}</div>` : ''}</td>
      <td style="padding:8px;border:0.5px solid #000;text-align:right;color:#dc2626;">-AED ${(c.amount || 0).toFixed(2)}</td>
      <td style="padding:8px;border:0.5px solid #000;text-align:right;color:#dc2626;">-AED ${(c.amount || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="padding:16px;background:#fff;max-width:1024px;margin:0 auto;color:#000;font-family:Arial, sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding-bottom:12px;margin-bottom:12px;border-bottom:0.5px solid #000;">
        <div style="flex:1;">
          <h1 style="font-size:20px;font-weight:bold;color:#2563eb;margin:0 0 4px 0;">HONEST WORLD MOTORS</h1>
          <div style="margin-top:4px;font-size:12px;color:#6b7280;">
            <p style="margin:0;">Tel: +97142630077</p>
            <p style="margin:0;">Email: honestworldmotors2004@gmail.com</p>
            <p style="margin:0;">VAT Reg No: 100596686400003</p>
          </div>
        </div>
        <div style="flex:1;text-align:right;">
          <h2 style="font-size:18px;font-weight:bold;color:#1d4ed8;margin:0 0 4px 0;">Invoice: ${invoice?.name || '-'}</h2>
          ${invoice?.lpo ? `<p style="font-size:14px;color:#2563eb;font-weight:600;margin:0;">LPO: ${invoice.lpo}</p>` : ''}
          <p style="font-size:14px;color:#6b7280;margin:0;">Date: ${fmt(invoice.date)}</p>
          <p style="font-size:14px;color:#6b7280;margin:0;">Due Date: ${fmt(invoice.expDate)}</p>
        </div>
      </div>

      <div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#dbeafe;">
              <th style="padding:8px;border:0.5px solid #000;">Qty</th>
              <th style="padding:8px;border:0.5px solid #000;">Code</th>
              <th style="padding:8px;border:0.5px solid #000;">Description</th>
              <th style="padding:8px;border:0.5px solid #000;text-align:right;">Unit</th>
              <th style="padding:8px;border:0.5px solid #000;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
            ${serviceRows}
            ${creditRows}
          </tbody>
        </table>
      </div>

      <div style="padding-top:8px;margin-top:16px;font-size:12px;text-align:center;color:#6b7280;border-top:0.5px solid #000;">
        <p style="margin:0;">Thank you for choosing Honest World Motors</p>
        <p style="margin:0;">Generated on ${currentDate}</p>
      </div>
    </div>
  `;
};

export const handleDownloadPDF = async ({
  setExportingPDF,
  debouncedSearchTerm,
  startDate,
  endDate,
  showOverdueOnly,
  showPaymentClearedOnly,
  showPendingOnly,
  showCancelledOnly,
  selectedCustomer,
}) => {
  try {
    setExportingPDF(true);
    const response = await downloadInvoices({
      debouncedSearchTerm,
      startDate,
      endDate,
      overdueOnly: showOverdueOnly,
      paymentClearedOnly: showPaymentClearedOnly,
      pendingOnly: showPendingOnly,
      cancelledOnly: showCancelledOnly,
      customerId: selectedCustomer?._id,
    });

    if (!response?.data?.success) {
      toast.error('Failed to fetch invoices for PDF report');
      return;
    }

    const { invoices = [], invoiceStats = {} } = response.data;
    if (invoices.length === 0) {
      toast.error('No invoices found for the selected criteria');
      return;
    }

    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.background = '#fff';

    const header = document.createElement('div');
    header.innerHTML = `
      <h1 style="margin:0;color:#2563eb;">Invoice Report</h1>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">${startDate && endDate ? `Period: ${formatDate(startDate)} - ${formatDate(endDate)}` : 'All time'}</div>
    `;
    container.appendChild(header);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '12px';

    table.innerHTML = `
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:8px;border:1px solid #e2e8f0; text-align:left;">INV</th>
          <th style="padding:8px;border:1px solid #e2e8f0; text-align:left;">Customer</th>
          <th style="padding:8px;border:1px solid #e2e8f0; text-align:left;">LPO</th>
          <th style="padding:8px;border:1px solid #e2e8f0;">Date</th>
          <th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoices.map(inv => `
          <tr>
            <td style="padding:8px;border:1px solid #e2e8f0;">${inv.name || 'N/A'}</td>
            <td style="padding:8px;border:1px solid #e2e8f0;">${inv?.customer?.Code || 'N/A'}</td>
            <td style="padding:8px;border:1px solid #e2e8f0;">${inv?.lpo || 'N/A'}</td>
            <td style="padding:8px;border:1px solid #e2e8f0;">${formatDate(inv?.updatedAt)}</td>
            <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${(inv.totalAmount || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    container.appendChild(table);

    const summary = document.createElement('div');
    summary.style.marginTop = '16px';
    summary.innerHTML = `
      <div style="font-size:13px;color:#374151;">Report Summary</div>
      <div style="margin-top:6px;font-size:12px;color:#6b7280;">Total Outstanding: ${invoiceStats.totalOutstanding || 0}</div>
    `;
    container.appendChild(summary);

    document.body.appendChild(container);

    await html2pdf().set({
      margin: 10,
      filename: 'Invoice_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(container).save();

    document.body.removeChild(container);
    toast.success('PDF report downloaded successfully');
  } catch (err) {
    console.error('PDF generation error:', err);
    toast.error('Failed to download PDF report');
  } finally {
    setExportingPDF(false);
  }
};

export const downloadMultipleInvoicesAsPDFs = async ({ selectedInvoices = [], setExportingPDF }) => {
  try {
    setExportingPDF(true);
    if (!selectedInvoices || selectedInvoices.length === 0) {
      toast.error('No invoices selected for download');
      return;
    }

    for (let i = 0; i < selectedInvoices.length; i++) {
      const inv = selectedInvoices[i];
      try {
        const res = await fetchInvDetails(inv._id);
        if (!res?.data?.success) throw new Error('Failed to fetch invoice details');
        await generateSingleInvoicePDF(res.data.invoice, i + 1);
      } catch (e) {
        console.error('Error generating single invoice PDF', e);
      }
      // small delay between generation
      await new Promise(r => setTimeout(r, 400));
    }

    toast.success('Invoice PDFs generated');
  } catch (err) {
    console.error('Bulk PDF error:', err);
    toast.error('Failed to generate invoices');
  } finally {
    setExportingPDF(false);
  }
};

const generateSingleInvoicePDF = async (invoice, seq) => {
  const el = document.createElement('div');
  el.style.background = '#fff';
  el.style.padding = '16px';
  el.innerHTML = generateInvoiceHTML(invoice);
  document.body.appendChild(el);

  try {
    const filename = `Invoice_${invoice.name || `INV_${seq}`}_${new Date().toISOString().split('T')[0]}.pdf`;
    await html2pdf().set({
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(el).save();
  } finally {
    document.body.removeChild(el);
  }
};

