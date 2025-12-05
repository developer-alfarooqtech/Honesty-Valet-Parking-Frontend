import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchCreditNoteDetails } from "../../service/creditNoteService";

const formatCurrency = (value) => {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  return `AED ${safeValue.toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "-"
    : parsed.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
};

const calculateLineTotal = (item) => {
  if (!item) return 0;
  const qty = item.itemType === "credit"
    ? 1
    : Number(item.creditedQuantity ?? item.quantity) || 0;
  const unitPrice = Number(
    item.unitPrice ??
      item.price ??
      (qty ? item.lineTotal / qty : item.lineTotal)
  ) || 0;
  return parseFloat((qty * unitPrice).toFixed(2));
};

const getDisplayLineItems = (creditNote) => {
  const rawItems = Array.isArray(creditNote?.items) && creditNote.items.length > 0
    ? creditNote.items
    : Array.isArray(creditNote?.lineItems)
    ? creditNote.lineItems
    : [];

  if (rawItems.length) {
    return rawItems.map((item, index) => {
      const qty =
        item.itemType === "credit"
          ? 1
          : Number(item.creditedQuantity ?? item.quantity ?? item.qty) || 0;
      const safeQty = qty || 1;
      const unitPrice =
        Number(
          item.unitPrice ??
            item.price ??
            (safeQty ? item.lineTotal / safeQty : item.lineTotal)
        ) || 0;
      const total = parseFloat((safeQty * unitPrice).toFixed(2));

      return {
        qty: safeQty,
        description:
          item.description ||
          item.additionalNote ||
          item.note ||
          item.name ||
          item.title ||
          `Credit Item ${index + 1}`,
        vin:
          item.vin ||
          item.vehicleVin ||
          item.VIN ||
          item.vehicle?.vin ||
          "",
        jc:
          item.jc ||
          item.jobCard ||
          item.jobCardNumber ||
          item.jobCardNo ||
          "-",
        unitPrice,
        total,
      };
    });
  }

  const fallbackDescription =
    creditNote?.description ||
    (creditNote?.type === "invoice"
      ? `Credit applied to invoice ${creditNote?.invoice?.name || ""}`.trim()
      : "Credit amount");

  const amount = Number(creditNote?.creditAmount) || 0;
  const fallbackJc =
    creditNote?.invoice?.jobCard ||
    creditNote?.jobCard ||
    creditNote?.jobCardNumber ||
    "-";
  const fallbackVin =
    creditNote?.vehicle?.vin ||
    creditNote?.invoice?.vehicle?.vin ||
    creditNote?.vin ||
    "";

  return [
    {
      qty: 1,
      description: fallbackDescription,
      vin: fallbackVin,
      jc: fallbackJc,
      unitPrice: amount,
      total: amount,
    },
  ];
};

const computeSummaryTotals = (lineItems, creditNote) => {
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const discount = Number(
    creditNote?.discount || creditNote?.discountAmount || creditNote?.discountValue || 0
  );
  const rawVatRate = Number(
    creditNote?.vatRate ?? creditNote?.taxRate ?? creditNote?.vat_percentage ?? 0
  );
  const vatRate = Number.isFinite(rawVatRate) ? rawVatRate : 0;
  const providedVatAmount = Number(creditNote?.vatAmount);
  const vatAmount = Number.isFinite(providedVatAmount)
    ? providedVatAmount
    : parseFloat(((subtotal * vatRate) / 100).toFixed(2));
  const explicitCreditAmount = Number(creditNote?.creditAmount);
  const creditAmount = Number.isFinite(explicitCreditAmount)
    ? explicitCreditAmount
    : parseFloat((subtotal + vatAmount - discount).toFixed(2));

  return {
    subtotal,
    vatRate,
    vatAmount,
    discount,
    creditAmount,
  };
};

const buildBillToLines = (customer) => {
  if (!customer) return [];
  const lines = [];
  if (customer.name) lines.push(customer.name);
  if (customer.Code) lines.push(`Code: ${customer.Code}`);
  if (customer.Phone) lines.push(`Phone: ${customer.Phone}`);
  if (customer.Email) lines.push(`Email: ${customer.Email}`);

  const addressParts = [
    customer?.address?.address1,
    customer?.address?.address2,
    customer?.address?.address3,
    customer?.address?.city,
    customer?.address?.state,
    customer?.address?.country,
  ].filter(Boolean);
  if (addressParts.length) {
    lines.push(addressParts.join(", "));
  }

  const vatFields = [
    customer?.VATNo,
    customer?.VAT,
    customer?.vat,
    customer?.vatNumber,
    customer?.vat_number,
    customer?.TRN,
    customer?.trn,
    customer?.TaxNumber,
    customer?.taxNumber,
  ].filter(Boolean);
  if (vatFields.length) {
    lines.push(`VAT No: ${vatFields[0]}`);
  }
  return lines;
};

const buildMetaRows = (creditNote) => {
  const rows = [
    { label: "Credit Note", value: creditNote?.creditNoteNumber || creditNote?.name || "N/A" },
    { label: "Date", value: formatDate(creditNote?.date || creditNote?.createdAt) },
  ];

  if (creditNote?.invoice?.name) {
    rows.push({ label: "Invoice", value: creditNote.invoice.name });
  }

  if (creditNote?.reference) {
    rows.push({ label: "Reference", value: creditNote.reference });
  }

  if (creditNote?.lpo) {
    rows.push({ label: "LPO", value: creditNote.lpo });
  }

  return rows;
};

const CONTACT_LINES = [
  "Tel: +97142630077",
  "Fax: +97142636786",
  "PO Box: 49112, Dubai-UAE",
  "Email: sales@honestynperfection.com",
  "VAT Reg No: 100596686400003",
];

const drawRoundedRect = (doc, x, y, width, height, radius = 2) => {
  doc.roundedRect(x, y, width, height, radius, radius);
};

const loadImageAsDataUrl = async (path) => {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load asset ${path}`);
    }
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`Failed to parse asset ${path}`));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(error.message || `Unable to load ${path}`);
    return null;
  }
};

const buildNoteSections = (creditNote) => {
  return [
    creditNote?.reason ? `Reason: ${creditNote.reason}` : null,
    creditNote?.description ? `Description: ${creditNote.description}` : null,
    creditNote?.notes ? `Notes: ${creditNote.notes}` : null,
  ].filter(Boolean);
};

const renderCreditNotePage = (doc, creditNote, assets = {}, options = {}) => {
  const { includeSeal = false, includeSignature = false } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  if (assets.logo) {
    const logoWidth = 80;
    const logoHeight = 30;
    doc.addImage(assets.logo, "PNG", margin, yPos, logoWidth, logoHeight);
    yPos += logoHeight + 5;
  }

  doc.setFont("helvetica", "normal");
  CONTACT_LINES.forEach((line, index) => {
    doc.setFontSize(index < 3 ? 10 : 9);
    doc.text(line, margin, yPos);
    yPos += 5;
  });

  yPos += 5;
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);

  const leftBoxWidth = contentWidth * 0.55;
  const rightBoxWidth = contentWidth * 0.4;
  const rightBoxX = margin + leftBoxWidth + (contentWidth - leftBoxWidth - rightBoxWidth);
  const boxStartY = yPos;

  const billToLines = buildBillToLines(creditNote?.customer || {});
  const billTextLines = (billToLines.length ? billToLines : ["-"])
    .map((line) => doc.splitTextToSize(line, leftBoxWidth - 6))
    .flat();
  const billBoxHeight = Math.max(32, billTextLines.length * 4.5 + 10);

  drawRoundedRect(doc, margin, yPos, leftBoxWidth, billBoxHeight, 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  let billTextY = yPos + 6;
  billTextLines.forEach((line) => {
    doc.text(line, margin + 3, billTextY);
    billTextY += 4.5;
  });

  const metaRows = buildMetaRows(creditNote);
  const metaRowHeight = 7.5;
  const metaHeight = Math.max(30, metaRows.length * metaRowHeight);
  const labelColumnWidth = rightBoxWidth * 0.45;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CREDIT NOTE", rightBoxX, yPos - 2);
  drawRoundedRect(doc, rightBoxX, yPos, rightBoxWidth, metaHeight, 2);

  for (let i = 1; i < metaRows.length; i += 1) {
    doc.line(rightBoxX, yPos + metaRowHeight * i, rightBoxX + rightBoxWidth, yPos + metaRowHeight * i);
  }
  doc.line(rightBoxX + labelColumnWidth, yPos, rightBoxX + labelColumnWidth, yPos + metaHeight);

  metaRows.forEach((row, index) => {
    const rowY = yPos + metaRowHeight * index + 5;
    doc.setFont("helvetica", "bold");
    doc.text(row.label, rightBoxX + 1.5, rowY);
    doc.setFont("helvetica", "normal");
    const valueLines = doc.splitTextToSize(row.value || "-", rightBoxWidth - labelColumnWidth - 3);
    valueLines.forEach((valueLine, lineIdx) => {
      doc.text(valueLine, rightBoxX + labelColumnWidth + 1.5, rowY + lineIdx * 4.5);
    });
  });

  yPos = boxStartY + Math.max(billBoxHeight, metaHeight) + 10;

  const noteSections = buildNoteSections(creditNote);
  if (noteSections.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Notes", margin, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    noteSections.forEach((note) => {
      const wrapped = doc.splitTextToSize(note, contentWidth);
      wrapped.forEach((line) => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 2;
    });
    yPos += 4;
  }

  const displayItems = getDisplayLineItems(creditNote);
  autoTable(doc, {
    startY: yPos,
    head: [["Qty", "Description", "JC", "Unit Price", "Total"]],
    body: displayItems.map((item) => [
      item.qty || 0,
      item.vin ? `${item.description}\nVIN: ${item.vin}` : item.description,
      item.jc || "-",
      (item.unitPrice || 0).toFixed(2),
      (item.total || 0).toFixed(2),
    ]),
    theme: "plain",
    styles: {
      fontSize: 9.5,
      cellPadding: 2.5,
      font: "helvetica",
      fontStyle: "normal",
      lineWidth: 0,
    },
    headStyles: {
      fillColor: [164, 168, 177],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9.5,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { halign: "left", cellWidth: "auto" },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "right", cellWidth: 25 },
      4: { halign: "right", cellWidth: 25 },
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : yPos + 8;

  const totals = computeSummaryTotals(displayItems, creditNote);
  
  // Calculate footer position - fixed at bottom
  const pageFooterY = pageHeight - 50;

  const leftSectionWidth = (contentWidth - 10) / 2;
  const boxHeight = 25;
  const smallBoxHeight = 12;

  // Top small signature box
  drawRoundedRect(doc, margin, pageFooterY - 15, leftSectionWidth / 2 - 2, smallBoxHeight, 2);
  if (includeSignature && assets.sign) {
    const signBoxWidth = leftSectionWidth / 2 - 2;
    const padding = 1.5;
    const signWidth = Math.min(16, signBoxWidth - padding * 2);
    const signHeight = smallBoxHeight - padding * 2;
    const signX = margin + (signBoxWidth - signWidth) / 2;
    const signY = pageFooterY - 15 + padding;
    doc.addImage(assets.sign, "PNG", signX, signY, signWidth, signHeight, undefined, "FAST");
  }
  drawRoundedRect(
    doc,
    margin + leftSectionWidth / 2 + 2,
    pageFooterY - 15,
    leftSectionWidth / 2 - 2,
    smallBoxHeight,
    2
  );

  // Seal and customer boxes
  drawRoundedRect(doc, margin, pageFooterY, leftSectionWidth / 2 - 2, boxHeight, 2);
  if (includeSeal && assets.seal) {
    doc.addImage(
      assets.seal,
      "PNG",
      margin + 2,
      pageFooterY + 2,
      leftSectionWidth / 2 - 6,
      boxHeight - 4,
      undefined,
      "FAST"
    );
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    "For Honesty and perfection",
    margin + (leftSectionWidth / 4 - 1),
    pageFooterY + boxHeight + 5,
    { align: "center" }
  );
  doc.text("Sign & Seal", margin + (leftSectionWidth / 4 - 1), pageFooterY + boxHeight + 10, {
    align: "center",
  });

  drawRoundedRect(
    doc,
    margin + leftSectionWidth / 2 + 2,
    pageFooterY,
    leftSectionWidth / 2 - 2,
    boxHeight,
    2
  );
  doc.text(
    "Customer Signature",
    margin + leftSectionWidth / 2 + 2 + (leftSectionWidth / 4 - 1),
    pageFooterY + boxHeight + 5,
    { align: "center" }
  );

  // Totals summary box - aligned to same Y position as seal boxes
  const summaryX = margin + leftSectionWidth + 10;
  const summaryWidth = contentWidth - leftSectionWidth - 10;
  const summaryRowHeight = 10;
  const summaryHeight = summaryRowHeight * 4;
  const summaryY = pageFooterY; // Same Y position as seal boxes

  drawRoundedRect(doc, summaryX, summaryY, summaryWidth, summaryHeight, 2);
  for (let i = 1; i < 4; i += 1) {
    doc.line(summaryX, summaryY + summaryRowHeight * i, summaryX + summaryWidth, summaryY + summaryRowHeight * i);
  }
  doc.line(summaryX + summaryWidth / 2, summaryY, summaryX + summaryWidth / 2, summaryY + summaryHeight);

  const totalsRows = [
    ["Subtotal", formatCurrency(totals.subtotal)],
    [
      `VAT (${Number.isFinite(totals.vatRate) ? totals.vatRate : 0}%)`,
      formatCurrency(totals.vatAmount),
    ],
    ["Discount", `-${formatCurrency(totals.discount)}`],
    ["CREDIT AMOUNT", formatCurrency(totals.creditAmount)],
  ];

  totalsRows.forEach((row, index) => {
    const rowY = summaryY + summaryRowHeight * index + summaryRowHeight / 2 + 1.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(row[0], summaryX + 2, rowY);
    doc.text(row[1], summaryX + summaryWidth - 2, rowY, { align: "right" });
  });
};

const generateCreditNotesPDF = async (creditNotes = [], options = {}) => {
  if (!creditNotes.length) {
    return false;
  }

  const { includeSeal = false, includeSignature = false } = options;

  const assets = {
    logo: await loadImageAsDataUrl("/hvp_logo.png"),
  };

  if (includeSeal) {
    assets.seal = await loadImageAsDataUrl("/hvp_seal.png");
  }

  if (includeSignature) {
    assets.sign = await loadImageAsDataUrl("/hvp_sign.png");
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  creditNotes.forEach((creditNote, index) => {
    if (index > 0) {
      doc.addPage();
    }
    renderCreditNotePage(doc, creditNote, assets, { includeSeal, includeSignature });
  });

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const newWindow = window.open(pdfUrl, "_blank");

  if (!newWindow) {
    throw new Error("Please allow popups to view the PDF");
  }

  return true;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const printMultipleCreditNotes = async ({
  selectedCreditNotes,
  setPrintingCreditNotes,
  includeSeal = false,
  includeSignature = false,
}) => {
  const togglePrinting = (value) => {
    if (typeof setPrintingCreditNotes === "function") {
      setPrintingCreditNotes(value);
    }
  };

  try {
    togglePrinting(true);

    if (!selectedCreditNotes || selectedCreditNotes.length === 0) {
      toast.error("Select at least one credit note to print");
      return;
    }

    if (selectedCreditNotes.length > 10) {
      const confirmed = window.confirm(
        `You are about to print ${selectedCreditNotes.length} credit notes. This may take a moment. Continue?`
      );
      if (!confirmed) {
        return;
      }
    }

    const detailedCreditNotes = [];
    const batchSize = 5;

    for (let i = 0; i < selectedCreditNotes.length; i += batchSize) {
      const batch = selectedCreditNotes.slice(i, i + batchSize);
      toast.loading(
        `Loading credit notes ${i + 1}-${Math.min(
          i + batchSize,
          selectedCreditNotes.length
        )} of ${selectedCreditNotes.length}`,
        { id: "credit-print-progress" }
      );

      const batchDetails = await Promise.all(
        batch.map(async (creditNote) => {
          try {
            const response = await fetchCreditNoteDetails(creditNote._id);
            if (response?.data?.success && response.data.data) {
              return response.data.data;
            }
            throw new Error("Invalid response payload");
          } catch (error) {
            console.error("Failed to load credit note", creditNote.creditNoteNumber, error);
            toast.error(`Failed to load ${creditNote.creditNoteNumber || "credit note"}`);
            return null;
          }
        })
      );

      detailedCreditNotes.push(...batchDetails.filter(Boolean));

      if (i + batchSize < selectedCreditNotes.length) {
        await delay(120);
      }
    }

    toast.dismiss("credit-print-progress");

    if (detailedCreditNotes.length === 0) {
      toast.error("No credit notes could be prepared for printing");
      return;
    }

    await generateCreditNotesPDF(detailedCreditNotes, { includeSeal, includeSignature });
    toast.success(`Generated ${detailedCreditNotes.length} credit note(s) PDF`);
  } catch (error) {
    console.error("Error printing credit notes", error);
    toast.error(error?.message || "Failed to print credit notes");
  } finally {
    toast.dismiss("credit-print-progress");
    togglePrinting(false);
  }
};
