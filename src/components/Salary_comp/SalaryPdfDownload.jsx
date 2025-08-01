import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";
import { downloadSalaries } from "../../service/salaryService";

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
    borderBottom: "3px solid #f97316",
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "30px",
    fontSize: "11px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#fed7aa",
    color: "#1e293b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableHeaderCell: {
    padding: "12px 10px",
    border: "1px solid #fb923c",
    textAlign: "left",
  },
  tableRowEven: {
    backgroundColor: "#ffffff",
  },
  tableRowOdd: {
    backgroundColor: "#fff7ed",
  },
  tableCell: {
    padding: "10px",
    border: "1px solid #fed7aa",
    verticalAlign: "middle",
  },
  summarySection: {
    backgroundColor: "#fff7ed",
    border: "2px solid #fed7aa",
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
    border: "1px solid #fb923c",
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
    borderTop: "2px solid #fed7aa",
    paddingTop: "15px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "10px",
    marginTop: "20px",
  },
  typebadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  operationalBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  adminBadge: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
};

// Helper function to apply styles to element
const applyStyles = (element, styles) => {
  Object.assign(element.style, styles);
  return element;
};

// Create PDF header section
const createHeader = (dateFrom, dateTo) => {
  const header = document.createElement("div");
  applyStyles(header, PDF_STYLES.header);

  const title = document.createElement("h1");
  applyStyles(title, PDF_STYLES.title);
  title.textContent = "Salary Report";

  const subtitle = document.createElement("p");
  applyStyles(subtitle, PDF_STYLES.subtitle);
  subtitle.textContent =
    dateFrom && dateTo
      ? `Report Period: ${formatDate(dateFrom)} to ${formatDate(dateTo)}`
      : "Complete Salary History Report";

  header.appendChild(title);
  header.appendChild(subtitle);
  return header;
};

// Create table header
const createTableHeader = () => {
  const thead = document.createElement("thead");
  applyStyles(thead, PDF_STYLES.tableHeader);

  const headerRow = document.createElement("tr");
  const headers = ["Recipient", "Phone", "Address", "Type", "Date", "Amount"];

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
const createTableRow = (salary, index) => {
  const tr = document.createElement("tr");
  const rowStyle =
    index % 2 === 0 ? PDF_STYLES.tableRowEven : PDF_STYLES.tableRowOdd;
  applyStyles(tr, rowStyle);

  const cellData = [
    salary.recipient?.name || "N/A",
    salary.recipient?.Phone || "N/A",
    salary.recipient?.address || "N/A",
    salary.type || "N/A",
    formatDate(salary?.date || salary?.createdAt),
    salary.amount?.toFixed(2) || "0.00",
  ];

  cellData.forEach((data, cellIndex) => {
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
  data.forEach((salary, index) => {
    const row = createTableRow(salary, index);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  return table;
};

// Create summary card
const createSummaryCard = (label, value, valueColor = "#ea580c") => {
  const card = document.createElement("div");
  applyStyles(card, PDF_STYLES.summaryCard);

  const labelElement = document.createElement("p");
  applyStyles(labelElement, PDF_STYLES.summaryLabel);
  labelElement.textContent = label;

  const valueElement = document.createElement("p");
  applyStyles(valueElement, { ...PDF_STYLES.summaryValue, color: valueColor });
  valueElement.textContent = value;

  card.appendChild(labelElement);
  card.appendChild(valueElement);
  return card;
};

// Create summary section
const createSummarySection = (sum) => {
  const section = document.createElement("div");
  applyStyles(section, PDF_STYLES.summarySection);

  const title = document.createElement("h2");
  applyStyles(title, PDF_STYLES.summaryTitle);
  title.textContent = "Summary";

  const grid = document.createElement("div");
  applyStyles(grid, PDF_STYLES.summaryGrid);

  const summaryCards = [
    {
      label: "Total Salaries",
      value: sum.totalRecords,
      color: "#ea580c",
    },
    { 
      label: "Total Amount", 
      value: `${sum.totalAmount.toFixed(2)}`, 
      color: "#059669" 
    },
    { 
      label: "Average Amount", 
      value: `${sum.averageAmount.toFixed(2)}`, 
      color: "#7c3aed" 
    },
    {
      label: "Operational Total",
      value: `${sum.operationalTotal.toFixed(2)}`,
      color: "#059669",
    },
    {
      label: "Operational Count",
      value: sum.operationalCount,
      color: "#059669",
    },
    {
      label: "Admin Total",
      value: `${sum.adminTotal.toFixed(2)}`,
      color: "#1e40af",
    },
    {
      label: "Admin Count",
      value: sum.adminCount,
      color: "#1e40af",
    },
  ];

  summaryCards.forEach(({ label, value, color }) => {
    const card = createSummaryCard(label, value, color);
    grid.appendChild(card);
  });

  section.appendChild(title);
  section.appendChild(grid);
  return section;
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
export const handleDownloadSalaryPDF = async ({
  setExportingPDF,
  startDate,
  endDate,
  type,
  recipient,
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

    const params = new URLSearchParams();

    // Add filters
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (type) params.append("type", type);
    if (recipient) params.append("recipient", recipient);

    // Fetch salary data
    const response = await downloadSalaries(params);

    if (!response?.data) {
      toast.error("No data available for PDF generation");
      return;
    }

    const { salaries, sum } = response.data;

    // Create main container
    const container = document.createElement("div");
    applyStyles(container, PDF_STYLES.container);

    // Build PDF sections
    const header = createHeader(startDate, endDate);
    const dataTable = createDataTable(salaries);
    const summary = createSummarySection(sum);
    const footer = createFooter();

    // Assemble PDF content
    container.appendChild(header);
    container.appendChild(dataTable);
    container.appendChild(summary);
    container.appendChild(footer);

    // Temporarily add to DOM
    document.body.appendChild(container);

    // PDF generation configuration
    const pdfOptions = {
      margin: [15, 15, 15, 15],
      filename: `Salary_Report_${new Date().toISOString().split("T")[0]}.pdf`,
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