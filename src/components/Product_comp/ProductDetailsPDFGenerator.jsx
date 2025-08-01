import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";

// PDF Styles Configuration for Product Details
const PDF_STYLES = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
    lineHeight: "1.6",
  },
  header: {
    marginBottom: "30px",
    borderBottom: "3px solid #ea580c",
    paddingBottom: "15px",
  },
  title: {
    color: "#c2410c",
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
  productHeader: {
    backgroundColor: "#fff7ed",
    border: "2px solid #fed7aa",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "30px",
  },
  productName: {
    color: "#1e293b",
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 12px 0",
  },
  productCode: {
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "6px 12px",
    fontFamily: "monospace",
    fontSize: "12px",
    display: "inline-block",
    marginRight: "15px",
  },
  stockBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "inline-block",
  },
  stockInStock: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  stockLowStock: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  stockOutOfStock: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  priceSection: {
    textAlign: "right",
    marginTop: "15px",
  },
  sellingPrice: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#ea580c",
    margin: "0 0 4px 0",
  },
  priceLabel: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    color: "#1e293b",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 15px 0",
    paddingBottom: "8px",
    borderBottom: "1px solid #e2e8f0",
  },
  description: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.6",
    backgroundColor: "#f8fafc",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  statCard: {
    backgroundColor: "#f8fafc",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  statCardblue: {
    backgroundColor: "#fff7ed",
    border: "1px solid #fed7aa",
  },
  statLabel: {
    color: "#64748b",
    fontSize: "12px",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0",
    color: "#1e293b",
  },
  statValueblue: {
    color: "#ea580c",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
    fontSize: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#fff7ed",
    color: "#c2410c",
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
    backgroundColor: "#fefefe",
  },
  tableCell: {
    padding: "10px",
    border: "1px solid #e2e8f0",
    verticalAlign: "middle",
  },
  batchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  batchCard: {
    backgroundColor: "#ffffff",
    padding: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  batchHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  batchLabel: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  batchStock: {
    backgroundColor: "#fff7ed",
    color: "#ea580c",
    fontSize: "10px",
    padding: "3px 8px",
    borderRadius: "12px",
    fontWeight: "600",
  },
  batchPrice: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    color: "#64748b",
    fontSize: "14px",
    fontStyle: "italic",
  },
  footer: {
    borderTop: "2px solid #e5e7eb",
    paddingTop: "15px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "10px",
    marginTop: "30px",
  },
};

// Helper function to apply styles to element
const applyStyles = (element, styles) => {
  Object.assign(element.style, styles);
  return element;
};

// Get stock status
const getStockStatus = (stockLevel) => {
  if (stockLevel > 10)
    return { style: PDF_STYLES.stockInStock, label: "In Stock" };
  if (stockLevel > 0)
    return { style: PDF_STYLES.stockLowStock, label: "Low Stock" };
  return { style: PDF_STYLES.stockOutOfStock, label: "Out of Stock" };
};

// Create PDF header section
const createHeader = () => {
  const header = document.createElement("div");
  applyStyles(header, PDF_STYLES.header);

  const title = document.createElement("h1");
  applyStyles(title, PDF_STYLES.title);
  title.textContent = "Product Details Report";

  const subtitle = document.createElement("p");
  applyStyles(subtitle, PDF_STYLES.subtitle);
  subtitle.textContent = `Generated on ${new Date().toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )}`;

  header.appendChild(title);
  header.appendChild(subtitle);
  return header;
};

// Create product header section
const createProductHeader = (product) => {
  const productHeader = document.createElement("div");
  applyStyles(productHeader, PDF_STYLES.productHeader);

  const productName = document.createElement("h2");
  applyStyles(productName, PDF_STYLES.productName);
  productName.textContent = product.name;

  const detailsRow = document.createElement("div");
  detailsRow.style.display = "flex";
  detailsRow.style.justifyContent = "space-between";
  detailsRow.style.alignItems = "flex-start";
  detailsRow.style.flexWrap = "wrap";
  detailsRow.style.gap = "15px";

  const leftSection = document.createElement("div");

  const productCode = document.createElement("span");
  applyStyles(productCode, PDF_STYLES.productCode);
  productCode.textContent = product.code || "N/A";

  const stockStatus = getStockStatus(product.stock);
  const stockBadge = document.createElement("span");
  applyStyles(stockBadge, { ...PDF_STYLES.stockBadge, ...stockStatus.style });
  stockBadge.textContent = `${stockStatus.label} (${product.stock || 0})`;

  leftSection.appendChild(productCode);
  leftSection.appendChild(stockBadge);

  const priceSection = document.createElement("div");
  applyStyles(priceSection, PDF_STYLES.priceSection);

  const sellingPrice = document.createElement("div");
  applyStyles(sellingPrice, PDF_STYLES.sellingPrice);
  sellingPrice.textContent = product.sellingPrice || "N/A";

  const priceLabel = document.createElement("div");
  applyStyles(priceLabel, PDF_STYLES.priceLabel);
  priceLabel.textContent = "Selling Price";

  priceSection.appendChild(sellingPrice);
  priceSection.appendChild(priceLabel);

  detailsRow.appendChild(leftSection);
  detailsRow.appendChild(priceSection);

  productHeader.appendChild(productName);
  productHeader.appendChild(detailsRow);

  return productHeader;
};

// Create description section
const createDescriptionSection = (product) => {
  const section = document.createElement("div");
  applyStyles(section, PDF_STYLES.section);

  const title = document.createElement("h3");
  applyStyles(title, PDF_STYLES.sectionTitle);
  title.textContent = "Description";

  const description = document.createElement("div");
  applyStyles(description, PDF_STYLES.description);
  description.textContent = product.description || "No description available";

  section.appendChild(title);
  section.appendChild(description);

  return section;
};

// Create stats section
const createStatsSection = (product) => {
  const section = document.createElement("div");
  applyStyles(section, PDF_STYLES.section);

  const title = document.createElement("h3");
  applyStyles(title, PDF_STYLES.sectionTitle);
  title.textContent = "Price Information";

  const statsGrid = document.createElement("div");
  applyStyles(statsGrid, PDF_STYLES.statsGrid);

  // Purchase Price Card
  const purchaseCard = document.createElement("div");
  applyStyles(purchaseCard, PDF_STYLES.statCard);

  const purchaseLabel = document.createElement("div");
  applyStyles(purchaseLabel, PDF_STYLES.statLabel);
  purchaseLabel.textContent = "Purchase Price";

  const purchaseValue = document.createElement("div");
  applyStyles(purchaseValue, PDF_STYLES.statValue);
  purchaseValue.textContent = product.purchasePrice || "N/A";

  purchaseCard.appendChild(purchaseLabel);
  purchaseCard.appendChild(purchaseValue);

  // Selling Price Card
  const sellingCard = document.createElement("div");
  applyStyles(sellingCard, {
    ...PDF_STYLES.statCard,
    ...PDF_STYLES.statCardblue,
  });

  const sellingLabel = document.createElement("div");
  applyStyles(sellingLabel, PDF_STYLES.statLabel);
  sellingLabel.textContent = "Selling Price";

  const sellingValue = document.createElement("div");
  applyStyles(sellingValue, {
    ...PDF_STYLES.statValue,
    ...PDF_STYLES.statValueblue,
  });
  sellingValue.textContent = product.sellingPrice || "N/A";

  sellingCard.appendChild(sellingLabel);
  sellingCard.appendChild(sellingValue);

  statsGrid.appendChild(purchaseCard);
  statsGrid.appendChild(sellingCard);

  section.appendChild(title);
  section.appendChild(statsGrid);

  return section;
};

// Create purchase history table
const createPurchaseHistorySection = (product) => {
  const section = document.createElement("div");
  applyStyles(section, PDF_STYLES.section);

  const title = document.createElement("h3");
  applyStyles(title, PDF_STYLES.sectionTitle);
  title.textContent = "Purchase History";

  if (!product.batches || product.batches.length === 0) {
    const noData = document.createElement("div");
    applyStyles(noData, PDF_STYLES.noData);
    noData.textContent = "No purchase history available";
    section.appendChild(title);
    section.appendChild(noData);
    return section;
  }

  const table = document.createElement("table");
  applyStyles(table, PDF_STYLES.table);

  // Create header
  const thead = document.createElement("thead");
  applyStyles(thead, PDF_STYLES.tableHeader);

  const headerRow = document.createElement("tr");
  const headers = ["Invoice", "Purchase Date", "Quantity", "Price"];

  headers.forEach((headerText) => {
    const th = document.createElement("th");
    applyStyles(th, PDF_STYLES.tableHeaderCell);
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement("tbody");
  product.batches.forEach((batch, index) => {
    const tr = document.createElement("tr");
    const rowStyle =
      index % 2 === 0 ? PDF_STYLES.tableRowEven : PDF_STYLES.tableRowOdd;
    applyStyles(tr, rowStyle);

    const cellData = [
      batch?.purchaseInvoiceName || "N/A",
      batch.purchaseDate
        ? new Date(batch.purchaseDate).toLocaleDateString("en-GB")
        : "N/A",
      batch.quantity || "N/A",
      batch.purchasePrice || "N/A",
    ];

    cellData.forEach((data) => {
      const td = document.createElement("td");
      applyStyles(td, PDF_STYLES.tableCell);
      td.textContent = data;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  section.appendChild(title);
  section.appendChild(table);

  return section;
};

// Create purchase price breakdown section
const createPriceBreakdownSection = (product) => {
  const section = document.createElement("div");
  applyStyles(section, PDF_STYLES.section);

  const title = document.createElement("h3");
  applyStyles(title, PDF_STYLES.sectionTitle);
  title.textContent = "Purchase Price Breakdown";

  if (!product.purchasePricebatch || product.purchasePricebatch.length === 0) {
    const noData = document.createElement("div");
    applyStyles(noData, PDF_STYLES.noData);
    noData.textContent = "No purchase price breakdown available";
    section.appendChild(title);
    section.appendChild(noData);
    return section;
  }

  const batchGrid = document.createElement("div");
  applyStyles(batchGrid, PDF_STYLES.batchGrid);

  product.purchasePricebatch.forEach((batch, index) => {
    const batchCard = document.createElement("div");
    applyStyles(batchCard, PDF_STYLES.batchCard);

    const batchHeader = document.createElement("div");
    applyStyles(batchHeader, PDF_STYLES.batchHeader);

    const batchLabel = document.createElement("span");
    applyStyles(batchLabel, PDF_STYLES.batchLabel);
    batchLabel.textContent = `Batch ${index + 1}`;

    const batchStock = document.createElement("span");
    applyStyles(batchStock, PDF_STYLES.batchStock);
    batchStock.textContent = `${batch.stock || 0} units`;

    batchHeader.appendChild(batchLabel);
    batchHeader.appendChild(batchStock);

    const batchPrice = document.createElement("div");
    applyStyles(batchPrice, PDF_STYLES.batchPrice);
    batchPrice.textContent = batch.purchasePrice || "N/A";

    batchCard.appendChild(batchHeader);
    batchCard.appendChild(batchPrice);

    batchGrid.appendChild(batchCard);
  });

  section.appendChild(title);
  section.appendChild(batchGrid);

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
    <div>This is a computer-generated product details report • No signature required</div>
  `;

  return footer;
};

// Main PDF generation function for product details
export const handleDownloadProductDetailsPDF = async (
  product,
  setDownloading
) => {
  try {
    setDownloading(true);

    // Validate html2pdf availability
    if (typeof html2pdf === "undefined") {
      toast.error(
        "PDF generation library not available. Please refresh and try again."
      );
      return;
    }

    // Validate product data
    if (!product) {
      toast.error("No product data available for PDF generation");
      return;
    }

    // Create main container
    const container = document.createElement("div");
    applyStyles(container, PDF_STYLES.container);

    // Build PDF sections
    const header = createHeader();
    const productHeader = createProductHeader(product);
    const descriptionSection = createDescriptionSection(product);
    const statsSection = createStatsSection(product);
    const purchaseHistorySection = createPurchaseHistorySection(product);
    const priceBreakdownSection = createPriceBreakdownSection(product);
    const footer = createFooter();

    // Assemble PDF content
    container.appendChild(header);
    container.appendChild(productHeader);
    container.appendChild(descriptionSection);
    container.appendChild(statsSection);
    container.appendChild(purchaseHistorySection);
    container.appendChild(priceBreakdownSection);
    container.appendChild(footer);

    // Temporarily add to DOM
    document.body.appendChild(container);

    // PDF generation configuration
    const pdfOptions = {
      margin: [15, 15, 15, 15],
      filename: `Product_Details_${
        product.code || product.name.replace(/\s+/g, "_")
      }_${new Date().toISOString().split("T")[0]}.pdf`,
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
    toast.success("Product details PDF generated and downloaded successfully!");
  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error(`Failed to generate PDF: ${error.message || "Unknown error"}`);
  } finally {
    setDownloading(false);
  }
};
