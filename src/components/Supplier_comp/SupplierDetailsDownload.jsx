import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";

// PDF Styles Configuration
const PDF_STYLES = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
    lineHeight: "1.4",
  },
  header: {
    marginBottom: "30px",
    borderBottom: "3px solid #ea580c",
    paddingBottom: "15px",
  },
  title: {
    color: "#ea580c",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: "0",
    textAlign: "center",
    fontWeight: "400",
  },
  supplierInfo: {
    backgroundColor: "#fff7ed",
    border: "2px solid #fed7aa",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "25px",
  },
  supplierTitle: {
    color: "#9a3412",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 15px 0",
  },
  supplierDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    fontSize: "12px",
  },
  supplierDetailItem: {
    color: "#7c2d12",
    fontWeight: "500",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "30px",
    fontSize: "11px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#fff7ed",
    color: "#9a3412",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableHeaderCell: {
    padding: "12px 10px",
    border: "1px solid #fed7aa",
    textAlign: "left",
  },
  tableRowEven: {
    backgroundColor: "#ffffff",
  },
  tableRowOdd: {
    backgroundColor: "#fefce8",
  },
  tableCell: {
    padding: "10px",
    border: "1px solid #e2e8f0",
    verticalAlign: "middle",
  },
  summarySection: {
    backgroundColor: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    padding: "25px",
    marginBottom: "30px",
  },
  summaryTitle: {
    color: "#1e293b",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 20px 0",
    textAlign: "center",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    padding: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    textAlign: "center",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: "11px",
    margin: "0 0 6px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "0",
  },
  footer: {
    borderTop: "2px solid #e5e7eb",
    paddingTop: "15px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "10px",
    marginTop: "20px",
  },
};

// Helper function to apply styles to element
const applyStyles = (element, styles) => {
  Object.assign(element.style, styles);
  return element;
};

// Create PDF header section
const createHeader = (supplierName) => {
  const header = document.createElement("div");
  applyStyles(header, PDF_STYLES.header);

  const title = document.createElement("h1");
  applyStyles(title, PDF_STYLES.title);
  title.textContent = "Supplier Details Report";

  const subtitle = document.createElement("p");
  applyStyles(subtitle, PDF_STYLES.subtitle);
  subtitle.textContent = `Detailed report for ${supplierName}`;

  header.appendChild(title);
  header.appendChild(subtitle);
  return header;
};

// Create supplier information section
const createSupplierInfo = (supplier) => {
  const section = document.createElement("div");
  applyStyles(section, PDF_STYLES.supplierInfo);

  const title = document.createElement("h2");
  applyStyles(title, PDF_STYLES.supplierTitle);
  title.textContent = "Supplier Information";

  const details = document.createElement("div");
  applyStyles(details, PDF_STYLES.supplierDetails);

  const supplierData = [
    { label: "Name", value: supplier.name || "N/A" },
    { label: "Email", value: supplier.email || "N/A" },
    { label: "Phone", value: supplier.phone || "N/A" },
    { label: "Address", value: supplier.address || "N/A" },
  ];

  supplierData.forEach(({ label, value }) => {
    const item = document.createElement("div");
    applyStyles(item, PDF_STYLES.supplierDetailItem);
    item.innerHTML = `<strong>${label}:</strong> ${value}`;
    details.appendChild(item);
  });

  section.appendChild(title);
  section.appendChild(details);
  return section;
};

// Create summary section
const createSummarySection = (totalInvoices, totalSpending) => {
  const section = document.createElement("div");
  applyStyles(section, PDF_STYLES.summarySection);

  const title = document.createElement("h2");
  applyStyles(title, PDF_STYLES.summaryTitle);
  title.textContent = "Summary Statistics";

  const grid = document.createElement("div");
  applyStyles(grid, PDF_STYLES.summaryGrid);

  const summaryData = [
    { label: "Total Invoices", value: totalInvoices.toString() },
    { label: "Total Spending", value: `${totalSpending.toFixed(2)}` },
  ];

  summaryData.forEach(({ label, value }) => {
    const card = document.createElement("div");
    applyStyles(card, PDF_STYLES.summaryCard);

    const labelEl = document.createElement("p");
    applyStyles(labelEl, PDF_STYLES.summaryLabel);
    labelEl.textContent = label;

    const valueEl = document.createElement("p");
    applyStyles(valueEl, PDF_STYLES.summaryValue);
    valueEl.textContent = value;

    card.appendChild(labelEl);
    card.appendChild(valueEl);
    grid.appendChild(card);
  });

  section.appendChild(title);
  section.appendChild(grid);
  return section;
};

// Create table header
const createTableHeader = () => {
  const thead = document.createElement("thead");
  applyStyles(thead, PDF_STYLES.tableHeader);

  const headerRow = document.createElement("tr");
  const headers = ["Invoice Name", "Date", "Total Amount"];

  headers.forEach((headerText) => {
    const th = document.createElement("th");
    applyStyles(th, PDF_STYLES.tableHeaderCell);
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  return thead;
};

// Create table row
const createTableRow = (invoice, index) => {
  const tr = document.createElement("tr");
  const rowStyle =
    index % 2 === 0 ? PDF_STYLES.tableRowEven : PDF_STYLES.tableRowOdd;
  applyStyles(tr, rowStyle);

  const cellData = [
    invoice.name || "N/A",
    new Date(invoice?.date || invoice.createdAt).toLocaleDateString("en-GB"),
    `${invoice.total.toFixed(2)}`,
  ];

  cellData.forEach((data) => {
    const td = document.createElement("td");
    applyStyles(td, PDF_STYLES.tableCell);
    td.textContent = data;
    tr.appendChild(td);
  });

  return tr;
};

// Create invoices table
const createInvoicesTable = (invoices) => {
  if (!invoices || invoices.length === 0) {
    const noDataDiv = document.createElement("div");
    noDataDiv.style.textAlign = "center";
    noDataDiv.style.padding = "20px";
    noDataDiv.style.color = "#6b7280";
    noDataDiv.textContent = "No invoices found for this supplier";
    return noDataDiv;
  }

  const tableContainer = document.createElement("div");

  const tableTitle = document.createElement("h2");
  applyStyles(tableTitle, PDF_STYLES.summaryTitle);
  tableTitle.textContent = "Purchase Invoices";
  tableTitle.style.marginBottom = "15px";

  const table = document.createElement("table");
  applyStyles(table, PDF_STYLES.table);

  const thead = createTableHeader();
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  invoices.forEach((invoice, index) => {
    const row = createTableRow(invoice, index);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  tableContainer.appendChild(tableTitle);
  tableContainer.appendChild(table);
  return tableContainer;
};

// Create footer section
const createFooter = () => {
  const footer = document.createElement("div");
  applyStyles(footer, PDF_STYLES.footer);

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  footer.innerHTML = `
    <div style="margin-bottom: 5px;">Generated on ${currentDate}</div>
    <div>This is a computer-generated supplier report • No signature required</div>
  `;

  return footer;
};

// Main PDF generation function for supplier details
export const handleDownloadSupplierDetailsPDF = async ({
  supplierDetails,
  setExportingPDF,
}) => {
  try {
    setExportingPDF(true);

    // Validate html2pdf availability
    if (typeof html2pdf === "undefined") {
      toast.error(
        "PDF generation library not available. Please refresh and try again."
      );
      return;
    }

    // Validate supplier details
    if (!supplierDetails?.supplier) {
      toast.error("No supplier data available for PDF generation");
      return;
    }

    const { supplier, invoices = [] } = supplierDetails;
    const totalSpending = invoices.reduce(
      (sum, invoice) => sum + invoice.total,
      0
    );
    const totalInvoices = invoices.length;

    // Create main container
    const container = document.createElement("div");
    applyStyles(container, PDF_STYLES.container);

    // Build PDF sections
    const header = createHeader(supplier.name);
    const supplierInfo = createSupplierInfo(supplier);
    const summary = createSummarySection(totalInvoices, totalSpending);
    const invoicesTable = createInvoicesTable(invoices);
    const footer = createFooter();

    // Assemble PDF content
    container.appendChild(header);
    container.appendChild(supplierInfo);
    container.appendChild(summary);
    container.appendChild(invoicesTable);
    container.appendChild(footer);

    // Temporarily add to DOM
    document.body.appendChild(container);

    // PDF generation configuration
    const pdfOptions = {
      margin: [15, 15, 15, 15],
      filename: `Supplier_Details_${supplier.name.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${new Date().toISOString().split("T")[0]}.pdf`,
      image: {
        type: "jpeg",
        quality: 0.95,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
      },
    };

    // Generate and download PDF
    await html2pdf().set(pdfOptions).from(container).save();

    // Cleanup
    document.body.removeChild(container);
    toast.success(
      "Supplier details PDF generated and downloaded successfully!"
    );
  } catch (error) {
    console.error("Supplier PDF Generation Error:", error);
    toast.error(`Failed to generate PDF: ${error.message || "Unknown error"}`);
  } finally {
    setExportingPDF(false);
  }
};
