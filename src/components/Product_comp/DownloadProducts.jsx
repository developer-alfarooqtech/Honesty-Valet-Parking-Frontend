import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";
import { downloadProducts } from "../../service/productService";

// Utility function for date formatting
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

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
    borderBottom: "3px solid #2563eb",
    paddingBottom: "15px",
  },
  title: {
    color: "#1e40af",
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "30px",
    fontSize: "11px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#f1f5f9",
    color: "#1e293b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableHeaderCell: {
    padding: "12px 10px",
    border: "1px solid #cbd5e1",
    textAlign: "left",
  },
  tableRowEven: {
    backgroundColor: "#ffffff",
  },
  tableRowOdd: {
    backgroundColor: "#f8fafc",
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
const createHeader = () => {
  const header = document.createElement("div");
  applyStyles(header, PDF_STYLES.header);

  const title = document.createElement("h1");
  applyStyles(title, PDF_STYLES.title);
  title.textContent = "Products List";

  const subtitle = document.createElement("p");
  applyStyles(subtitle, PDF_STYLES.subtitle);

  header.appendChild(title);
  header.appendChild(subtitle);
  return header;
};

// Create table header
const createTableHeader = () => {
  const thead = document.createElement("thead");
  applyStyles(thead, PDF_STYLES.tableHeader);

  const headerRow = document.createElement("tr");
  const headers = ["Product", "Code", "Stock", "Purchase Price", "Selling Price"];

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
const createTableRow = (product, index) => {
  const tr = document.createElement("tr");
  const rowStyle =
    index % 2 === 0 ? PDF_STYLES.tableRowEven : PDF_STYLES.tableRowOdd;
  applyStyles(tr, rowStyle);

  const cellData = [
    product.name || "N/A",
    product.code || "N/A",
    product.stock||0,
    product.purchasePrice ||0,
    product.sellingPrice,
  ];

  cellData.forEach((data) => {
    const td = document.createElement("td");
    applyStyles(td, PDF_STYLES.tableCell);
    td.textContent = data;
    tr.appendChild(td);
  });

  return tr;
};

// Create data table
const createDataTable = (data) => {
  const table = document.createElement("table");
  applyStyles(table, PDF_STYLES.table);

  const thead = createTableHeader();
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  data.forEach((product, index) => {
    const row = createTableRow(product, index);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  return table;
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
    <div>This is a computer-generated report • No signature required</div>
  `;

  return footer;
};

// Main PDF generation function
export const handleDownloadProductsPDF = async ({
  setExportingPDF,
  search,
  availableOnly,
  unavailableOnly,
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

    // Fetch invoice data
    const response = await downloadProducts({
      search,
      availableOnly,
      unavailableOnly,
    });

    if (!response?.data) {
      toast.error("No data available for PDF generation");
      return;
    }

    const data = response.data.products;

    // Create main container
    const container = document.createElement("div");
    applyStyles(container, PDF_STYLES.container);

    // Build PDF sections
    const header = createHeader();
    const dataTable = createDataTable(data);
    // const summary = createSummarySection(stats);
    const footer = createFooter();

    // Assemble PDF content
    container.appendChild(header);
    container.appendChild(dataTable);
    // container.appendChild(summary);
    container.appendChild(footer);

    // Temporarily add to DOM
    document.body.appendChild(container);

    // PDF generation configuration
    const pdfOptions = {
      margin: [15, 15, 15, 15],
      filename: `Products_List${
        new Date().toISOString().split("T")[0]
      }.pdf`,
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
    toast.success("PDF report generated and downloaded successfully!");
  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error(`Failed to generate PDF: ${error.message || "Unknown error"}`);
  } finally {
    setExportingPDF(false);
  }
};
