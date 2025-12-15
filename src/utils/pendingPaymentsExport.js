import * as XLSX from "xlsx";

const formatCurrency = (value) => {
  const numeric = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!Number.isFinite(numeric)) {
    return "0.00";
  }
  return numeric.toFixed(2);
};

const formatQuantity = (value) => {
  const numeric = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!Number.isFinite(numeric)) {
    return "";
  }
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-GB");
};

const sanitizeFileSegment = (value) => {
  if (!value) {
    return "customer";
  }
  return String(value).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
};

const collectLineItems = (invoice) => {
  const items = [];
  const appendItem = (entry) => {
    if (!entry) {
      return;
    }
    items.push({
      note: entry.note || entry.additionalNote || "",
      price: entry.price,
      quantity: entry.quantity,
    });
  };

  (Array.isArray(invoice?.products) ? invoice.products : []).forEach(appendItem);
  (Array.isArray(invoice?.services) ? invoice.services : []).forEach(appendItem);

  return items;
};

const joinLineItemField = (items, selector) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  return items
    .map((item) => selector(item))
    .filter((value) => value !== undefined && value !== null && value !== "")
    .join(", ");
};

export const exportPendingPaymentsToExcel = ({ customer, payments }) => {
  if (!payments || payments.length === 0) {
    return;
  }

  const rows = payments.map(({ invoice, paymentData, totals }, index) => {
    const lineItems = collectLineItems(invoice);

    return {
      "#": index + 1,
      "Invoice Name": invoice?.name || "",
      "Customer Name": invoice?.customer?.name || "",
      "Customer Code": invoice?.customer?.Code || "",
      "Invoice Date": formatDate(invoice?.createdAt),
      "Due Date": formatDate(invoice?.expDate),
      "Total Amount (AED)": formatCurrency(invoice?.totalAmount),
      "Balance Before (AED)": formatCurrency(invoice?.balanceToReceive),
      "Original Discount (AED)": formatCurrency(paymentData?.originalDiscount),
      "Applied Discount (AED)": formatCurrency(paymentData?.discount),
      "Payment Amount (AED)": formatCurrency(paymentData?.amount),
      "Balance After (AED)": formatCurrency(totals?.balanceToPay),
      "Total Paid After (AED)": formatCurrency(totals?.totalPaid),
      "Item Notes": joinLineItemField(lineItems, (item) =>
        typeof item.note === "string" ? item.note.trim() : ""
      ),
      "Item Unit Prices (AED)": joinLineItemField(lineItems, (item) =>
        formatCurrency(item.price)
      ),
      "Item Quantities": joinLineItemField(lineItems, (item) =>
        formatQuantity(item.quantity)
      ),
      Description: paymentData?.description || "",
    };
  });

  const totalPayment = payments.reduce((sum, { paymentData }) => {
    const amount = typeof paymentData?.amount === "string"
      ? parseFloat(paymentData.amount)
      : Number(paymentData?.amount);
    if (!Number.isFinite(amount)) {
      return sum;
    }
    return sum + amount;
  }, 0);

  rows.push({
    "Invoice Name": "Total",
    "Payment Amount (AED)": formatCurrency(totalPayment),
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Payments");

  const customerSegment = sanitizeFileSegment(customer?.name || customer?.Code);
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `Pending_Payments_${customerSegment}_${timestamp}.xlsx`;

  XLSX.writeFile(workbook, filename);
};
