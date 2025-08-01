import html2pdf from "html2pdf.js";

export const downloadAllReportsAsPDF = async (reportsData, dateRange) => {
  try {
    // Generate combined HTML content for all reports
    const combinedHTML = generateCombinedReportsHTML(reportsData, dateRange);

    // PDF configuration for comprehensive report
    const options = {
      margin: [12, 12, 12, 12],
      filename: `Business_Reports_${
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
        backgroundColor: "#ffffff",
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        putOnlyUsedFonts: true,
        compress: true,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break-before",
        after: ".page-break-after",
        avoid: ".avoid-page-break",
      },
    };

    // Generate and download combined PDF
    await html2pdf().set(options).from(combinedHTML).save();
  } catch (error) {
    console.error("Error generating combined PDF:", error);
    throw error;
  }
};

export const downloadReportAsPDF = async (
  reportData,
  reportType,
  dateRange
) => {
  try {
    // Create HTML content for the PDF
    const htmlContent = generateReportHTML(reportData, reportType, dateRange);

    // PDF configuration
    const options = {
      margin: [12, 12, 12, 12],
      filename: `${reportType.replace("-", "_")}_Report_${
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
        backgroundColor: "#ffffff",
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        putOnlyUsedFonts: true,
        compress: true,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break-before",
        after: ".page-break-after",
        avoid: ".avoid-page-break",
      },
    };

    // Generate and download PDF
    await html2pdf().set(options).from(htmlContent).save();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

const generateCombinedReportsHTML = (reportsData, dateRange) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateRangeText =
    dateRange?.start && dateRange?.end
      ? `${new Date(dateRange.start).toLocaleDateString("en-GB")} to ${new Date(
          dateRange.end
        ).toLocaleDateString("en-GB")}`
      : "All Time";

  // Generate table of contents
  const reportTitles = {
    dashboard: "Executive Dashboard",
    "profit-loss": "Profit & Loss Statement",
    sales: "Sales Performance Report",
    expense: "Expense Analysis Report",
    "accounts-receivable": "Accounts Receivable Report",
    inventory: "Inventory Management Report",
    purchase: "Purchase Analysis Report",
  };

  const tableOfContents = `
    <div class="toc-page page-break-after">
      <div class="header-section">
        <div class="company-header">
          <h1 class="main-title">Business Performance Report</h1>
          <div class="subtitle">Comprehensive Financial Analysis</div>
        </div>
        <div class="report-meta">
          <div class="meta-item">
            <span class="meta-label">Reporting Period:</span>
            <span class="meta-value">${dateRangeText}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Generated On:</span>
            <span class="meta-value">${currentDate}</span>
          </div>
        </div>
      </div>
      
      <div class="toc-container">
        <h2 class="toc-title">Table of Contents</h2>
        <div class="toc-items">
          ${reportsData
            .map(
              (report, index) => `
            <div class="toc-item">
              <div class="toc-number">${index + 1}.</div>
              <div class="toc-text">${
                reportTitles[report.type] || report.type
              }</div>
              <div class="toc-dots"></div>
              <div class="toc-page-num">${index + 2}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      
      <div class="footer-section">
        <div class="footer-text">
          This report contains confidential business information and financial data.
          Please handle with appropriate care and maintain confidentiality.
        </div>
      </div>
    </div>
  `;

  // Generate individual report sections with proper page breaks and consistent styling
  const reportSections = reportsData
    .map((report, index) => {
      const isLastReport = index === reportsData.length - 1;
      let sectionHTML = "";

      switch (report.type) {
        case "dashboard":
          sectionHTML = generateDashboardHTML(
            report.data,
            dateRangeText,
            currentDate,
            true
          );
          break;
        case "profit-loss":
          sectionHTML = generateProfitLossHTML(
            report.data,
            dateRangeText,
            currentDate,
            true
          );
          break;
        case "expense":
          sectionHTML = generateExpenseHTML(
            report.data,
            dateRangeText,
            currentDate,
            true
          );
          break;
        case "sales":
          sectionHTML = generateSalesHTML(
            report.data,
            dateRangeText,
            currentDate,
            true
          );
          break;
        case "accounts-receivable":
          sectionHTML = generateAccountsReceivableHTML(
            report.data,
            dateRangeText,
            currentDate,
            true
          );
          break;
        case "inventory":
          sectionHTML = generateInventoryHTML(
            report.data,
            dateRangeText,
            currentDate,
            true
          );
          break;
        case "purchase":
          sectionHTML = generatePurchaseHTML(
            report.data,
            dateRangeText,
            currentDate,
            true
          );
          break;
        default:
          sectionHTML = '<div class="error-message">Invalid report type</div>';
      }

      // Wrap each section with consistent page break handling
      return `<div class="report-section ${
        isLastReport ? "" : "page-break-after"
      }">${sectionHTML}</div>`;
    })
    .join("");

  // Return combined content with styles only once at the top
  return `
    <div class="combined-report">
      ${getCommonStyles()}
      ${tableOfContents}
      ${reportSections}
    </div>
  `;
};

const generateReportHTML = (data, reportType, dateRange) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateRangeText =
    dateRange?.start && dateRange?.end
      ? `${new Date(dateRange.start).toLocaleDateString("en-GB")} to ${new Date(
          dateRange.end
        ).toLocaleDateString("en-GB")}`
      : "All Time";

  let content = "";
  switch (reportType) {
    case "profit-loss":
      content = generateProfitLossHTML(data, dateRangeText, currentDate, false);
      break;
    case "expense":
      content = generateExpenseHTML(data, dateRangeText, currentDate, false);
      break;
    case "sales":
      content = generateSalesHTML(data, dateRangeText, currentDate, false);
      break;
    case "accounts-receivable":
      content = generateAccountsReceivableHTML(
        data,
        dateRangeText,
        currentDate,
        false
      );
      break;
    case "inventory":
      content = generateInventoryHTML(data, dateRangeText, currentDate, false);
      break;
    case "purchase":
      content = generatePurchaseHTML(data, dateRangeText, currentDate, false);
      break;
    case "dashboard":
      content = generateDashboardHTML(data, dateRangeText, currentDate, false);
      break;
    default:
      content = '<div class="error-message">Invalid report type</div>';
  }

  return `
    <div class="single-report">
      ${getCommonStyles()}
      ${content}
    </div>
  `;
};

const getCommonStyles = () => `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #2d3748;
      background: #ffffff;
    }
    
    .combined-report,
    .single-report {
      width: 100%;
      max-width: none;
    }
    
    .page-break-before {
      page-break-before: always;
    }
    
    .page-break-after {
      page-break-after: always;
    }
    
    .avoid-page-break {
      page-break-inside: avoid;
    }
    
    .report-section {
      position: relative;
      margin: 0;
      padding: 0;
    }
    
    /* Header Styles */
    .header-section {
      text-align: center;
      margin-bottom: 18px;
      padding: 15px 0;
      border-bottom: 3px solid #2563eb;
    }
    
    .company-header .main-title {
      font-size: 32px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .company-header .subtitle {
      font-size: 18px;
      color: #64748b;
      font-weight: 500;
    }
    
    .report-meta {
      margin-top: 18px;
      display: flex;
      justify-content: center;
      gap: 40px;
      flex-wrap: wrap;
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .meta-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .meta-value {
      font-size: 16px;
      font-weight: 600;
      color: #1e40af;
    }
    
    /* Table of Contents */
    .toc-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }
    
    .toc-container {
      flex: 1;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }
    
    .toc-title {
      font-size: 24px;
      font-weight: 600;
      color: #1e40af;
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .toc-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .toc-item {
      display: flex;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .toc-number {
      font-weight: 600;
      color: #2563eb;
      min-width: 30px;
    }
    
    .toc-text {
      font-weight: 500;
      color: #374151;
      margin-left: 15px;
    }
    
    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #cbd5e0;
      margin: 0 15px;
      height: 1px;
    }
    
    .toc-page-num {
      font-weight: 600;
      color: #2563eb;
      min-width: 30px;
      text-align: right;
    }
    
    .footer-section {
      margin-top: 50px;
      text-align: center;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .footer-text {
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    
    /* Report Content Styles - Fixed spacing issues */
    .report-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
      position: relative;
    }
    
    /* Remove extra margin for combined reports */
    .combined-report .report-container {
      margin-top: 0;
      padding-top: 20px;
    }
    
    /* Ensure first report section doesn't have extra spacing */
    .report-section:first-of-type .report-container {
      padding-top: 20px;
    }
    
    .report-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    .report-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .report-period {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 5px;
    }
    
    .report-date {
      font-size: 14px;
      color: #9ca3af;
    }
    
    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .metric-card {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .metric-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .metric-value {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .metric-positive { color: #059669; }
    .metric-negative { color: #dc2626; }
    .metric-neutral { color: #2563eb; }
    .metric-warning { color: #d97706; }
    
    /* Content Sections */
    .content-section {
      margin-bottom: 40px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .section-header {
      background: #f8fafc;
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e40af;
      margin: 0;
    }
    
    .section-content {
      padding: 20px;
    }
    
    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 13px;
    }
    
    .data-table th {
      background: #f8fafc;
      padding: 12px 15px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e2e8f0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .data-table td {
      padding: 12px 15px;
      border-bottom: 1px solid #f1f5f9;
      color: #4b5563;
    }
    
    .data-table tr:hover {
      background: #f9fafb;
    }
    
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    
    /* Summary Sections */
    .summary-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 25px;
      margin-top: 30px;
    }
    
    .summary-title {
      font-size: 20px;
      font-weight: 600;
      color: #1e40af;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .summary-amount {
      font-size: 32px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 10px;
    }
    
    .summary-description {
      text-align: center;
      color: #64748b;
      font-size: 14px;
      margin-bottom: 15px;
    }
    
    .summary-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .badge-warning {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    
    .badge-info {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    
    /* Responsive Design - Improved for combined reports */
    @media (max-width: 768px) {
      .report-container {
        padding: 15px;
      }
      
      .combined-report .report-container {
        padding: 15px;
        padding-top: 15px;
      }
      
      .company-header .main-title {
        font-size: 24px;
      }
      
      .report-title {
        font-size: 22px;
      }
      
      .metrics-grid {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .metric-value {
        font-size: 18px;
      }
      
      .summary-amount {
        font-size: 24px;
      }
      
      .report-meta {
        flex-direction: column;
        gap: 15px;
      }
      
      .data-table {
        font-size: 12px;
      }
      
      .data-table th,
      .data-table td {
        padding: 8px 10px;
      }
    }
    
    @media (max-width: 480px) {
      .report-container {
        padding: 10px;
      }
      
      .combined-report .report-container {
        padding: 10px;
        padding-top: 10px;
      }
      
      .company-header .main-title {
        font-size: 20px;
      }
      
      .report-title {
        font-size: 18px;
      }
      
      .metric-value {
        font-size: 16px;
      }
      
      .summary-amount {
        font-size: 20px;
      }
      
      .data-table th,
      .data-table td {
        padding: 6px 8px;
        font-size: 11px;
      }
    }
    
    .error-message {
      text-align: center;
      color: #dc2626;
      font-size: 16px;
      padding: 40px;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      margin: 20px;
    }
  </style>
`;

const generateProfitLossHTML = (data, dateRange, currentDate) => `
  <div class="report-container">
    ${getCommonStyles()}
    
    <div class="report-header avoid-page-break">
      <h1 class="report-title">Profit & Loss Statement</h1>
      <div class="report-period">Period: ${dateRange}</div>
      <div class="report-date">Generated on: ${currentDate}</div>
    </div>
    
    <div class="metrics-grid avoid-page-break">
      <div class="metric-card">
        <div class="metric-label">Total Revenue</div>
        <div class="metric-value metric-positive">AED ${
          data.revenue?.toLocaleString() || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Gross Profit</div>
        <div class="metric-value metric-neutral">AED ${
          data.grossProfit?.toLocaleString() || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Net Profit</div>
        <div class="metric-value ${
          data.netProfit >= 0 ? "metric-positive" : "metric-negative"
        }">
          AED ${data.netProfit?.toLocaleString() || "0"}
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Profit Margin</div>
        <div class="metric-value metric-warning">${
          data.netProfitMargin || "0"
        }%</div>
      </div>
    </div>
    
    <div class="content-section avoid-page-break">
      <div class="section-header">
        <h3 class="section-title">Revenue & Direct Costs</h3>
      </div>
      <div class="section-content">
        <table class="data-table">
          <tbody>
            <tr>
              <td class="font-semibold">Total Revenue</td>
              <td class="text-right font-bold metric-positive">AED ${
                data.revenue?.toLocaleString() || "0"
              }</td>
            </tr>
            <tr>
              <td class="font-semibold">Cost of Goods Sold</td>
              <td class="text-right font-bold metric-negative">AED (${
                data.cogs?.toLocaleString() || "0"
              })</td>
            </tr>
            <tr style="border-top: 2px solid #374151;">
              <td class="font-bold">Gross Profit</td>
              <td class="text-right font-bold metric-neutral">AED ${
                data.grossProfit?.toLocaleString() || "0"
              }</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="content-section avoid-page-break">
      <div class="section-header">
        <h3 class="section-title">Operating Expenses</h3>
      </div>
      <div class="section-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(data.categoryBreakdown || {})
              .map(
                ([category, amount]) => `
              <tr>
                <td>${category}</td>
                <td class="text-right font-semibold metric-negative">AED (${
                  amount?.toLocaleString() || "0"
                })</td>
              </tr>
            `
              )
              .join("")}
            <tr style="border-top: 2px solid #374151;">
              <td class="font-bold">Total Operating Expenses</td>
              <td class="text-right font-bold metric-negative">AED (${
                data.expenses?.toLocaleString() || "0"
              })</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    ${
      Object.keys(data.salaryTypeBreakdown || {}).length > 0
        ? `
    <div class="content-section avoid-page-break">
      <div class="section-header">
        <h3 class="section-title">Salaries</h3>
      </div>
      <div class="section-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Salary Type</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(data.salaryTypeBreakdown || {})
              .map(
                ([type, amount]) => `
              <tr>
                <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                <td class="text-right font-semibold metric-negative">AED (${
                  amount?.toLocaleString() || "0"
                })</td>
              </tr>
            `
              )
              .join("")}
            <tr style="border-top: 2px solid #374151;">
              <td class="font-bold">Total Salary</td>
              <td class="text-right font-bold metric-warning">AED (${
                data.salaries?.toLocaleString() || "0"
              })</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    `
        : ""
    }
    
    <div class="summary-card avoid-page-break">
      <div class="summary-title">Final Result</div>
      <div class="summary-amount ${
        data.netProfit >= 0 ? "metric-positive" : "metric-negative"
      }">
        AED ${data.netProfit?.toLocaleString() || "0"}
      </div>
      <div class="summary-description">
        Net ${data.netProfit >= 0 ? "Profit" : "Loss"} • ${
  data.netProfitMargin || "0"
}% Margin
      </div>
    </div>
  </div>
`;

const generateExpenseHTML = (
  data,
  dateRange,
  currentDate,
  isCombined = false
) => {
  const categoryBreakdown = Object.entries(data.categoryBreakdown || {})
    .map(([name, value]) => ({
      name,
      value,
      percentage: ((value / data.totalExpenses) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  const departmentBreakdown = Object.entries(
    data.departmentBreakdown || {}
  ).sort(([, a], [, b]) => b - a);

  return `
    <div class="report-container">
      ${!isCombined ? getCommonStyles() : ""}
      
      <div class="report-header avoid-page-break">
        <h1 class="report-title">Expense Analysis Report</h1>
        <div class="report-period">Period: ${dateRange}</div>
        <div class="report-date">Generated on: ${currentDate}</div>
      </div>
      
      <div class="metrics-grid avoid-page-break">
        <div class="metric-card">
          <div class="metric-label">Total Expenses</div>
          <div class="metric-value metric-negative">AED ${
            data.totalExpenses?.toLocaleString() || "0"
          }</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-label">Total Transactions</div>
          <div class="metric-value metric-neutral">${
            data.totalTransactions || "0"
          }</div>
        </div>
      </div>
      
      <div class="content-section avoid-page-break">
        <div class="section-header">
          <h3 class="section-title">Category Breakdown</h3>
        </div>
        <div class="section-content">
          <table class="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th class="text-right">Amount</th>
                <th class="text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${categoryBreakdown
                .map(
                  (item) => `
                <tr>
                  <td class="font-semibold">${item.name}</td>
                  <td class="text-right font-bold metric-negative">AED ${item.value.toLocaleString()}</td>
                  <td class="text-right">${item.percentage}%</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
      
      ${
        departmentBreakdown.length > 0
          ? `
      <div class="content-section avoid-page-break">
        <div class="section-header">
          <h3 class="section-title">Department Breakdown</h3>
        </div>
        <div class="section-content">
          <table class="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th class="text-right">Amount</th>
                <th class="text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${departmentBreakdown
                .map(([dept, amount]) => {
                  const percentage = (
                    (amount / data.totalExpenses) *
                    100
                  ).toFixed(1);
                  return `
                  <tr>
                    <td class="font-semibold">${dept}</td>
                    <td class="text-right font-bold metric-negative">AED ${amount.toLocaleString()}</td>
                    <td class="text-right">${percentage}%</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
      `
          : ""
      }
    </div>
  `;
};

const generateSalesHTML = (data, dateRange, currentDate) => `
  <div class="report-container">
    ${getCommonStyles()}
    
    <div class="report-header avoid-page-break">
      <h1 class="report-title">Sales Performance Report</h1>
      <div class="report-period">Period: ${dateRange}</div>
      <div class="report-date">Generated on: ${currentDate}</div>
    </div>
    
    <div class="metrics-grid avoid-page-break">
      <div class="metric-card">
        <div class="metric-label">Total Sales Order value</div>
        <div class="metric-value metric-positive">AED ${
          data.totalSales?.toLocaleString() || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Total Orders</div>
        <div class="metric-value metric-neutral">${
          data.totalOrders || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Average Order Value</div>
        <div class="metric-value metric-warning">AED ${
          data.averageOrderValue?.toLocaleString() || "0"
        }</div>
      </div>
    </div>
    
    ${
      data.monthlyData
        ? `
    <div class="content-section avoid-page-break">
      <div class="section-header">
        <h3 class="section-title">Monthly Performance</h3>
      </div>
      <div class="section-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th class="text-right">Sales</th>
              <th class="text-right">Orders</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(data.monthlyData)
              .map(
                ([month, values]) => `
              <tr>
                <td class="font-semibold">${new Date(
                  month + "-01"
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}</td>
                <td class="text-right font-bold metric-positive">AED ${
                  values.sales?.toLocaleString() || "0"
                }</td>
                <td class="text-right">${values.orders || "0"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
    `
        : ""
    }
  </div>
`;

const generateAccountsReceivableHTML = (data, dateRange, currentDate) => `
  <div class="report-container">
    ${getCommonStyles()}
    
    <div class="report-header avoid-page-break">
      <h1 class="report-title">Accounts Receivable Report</h1>
      <div class="report-period">Period: ${dateRange}</div>
      <div class="report-date">Generated on: ${currentDate}</div>
    </div>
    
    <div class="metrics-grid avoid-page-break">
      <div class="metric-card">
        <div class="metric-label">Total Outstanding</div>
        <div class="metric-value metric-warning">AED ${
          data.totalOutstanding?.toLocaleString() || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Total Invoices</div>
        <div class="metric-value metric-neutral">${
          data.totalInvoices || "0"
        }</div>
      </div>
    </div>
    
    <div class="content-section avoid-page-break">
      <div class="section-header">
        <h3 class="section-title">Due Date Analysis</h3>
      </div>
      <div class="section-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Age Range</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-semibold">0-30 Days</td>
              <td class="text-right font-bold metric-positive">AED ${
                data.aging?.current?.toLocaleString() || "0"
              }</td>
            </tr>
            <tr>
              <td class="font-semibold">31-60 Days</td>
              <td class="text-right font-bold metric-warning">AED ${
                data.aging?.days30?.toLocaleString() || "0"
              }</td>
            </tr>
            <tr>
              <td class="font-semibold">61-90 Days</td>
              <td class="text-right font-bold metric-negative">AED ${
                data.aging?.days60?.toLocaleString() || "0"
              }</td>
            </tr>
            <tr>
              <td class="font-semibold">90+ Days</td>
              <td class="text-right font-bold metric-negative">AED ${
                data.aging?.days90Plus?.toLocaleString() || "0"
              }</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;

const generateInventoryHTML = (data, dateRange, currentDate) => `
  <div class="report-container">
    ${getCommonStyles()}
    
    <div class="report-header avoid-page-break">
      <h1 class="report-title">Inventory Management Report</h1>
      <div class="report-period">Period: ${dateRange}</div>
      <div class="report-date">Generated on: ${currentDate}</div>
    </div>
    
    <div class="metrics-grid avoid-page-break">
      <div class="metric-card">
        <div class="metric-label">Total Products</div>
        <div class="metric-value metric-neutral">${
          data.totalProducts || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Stock Value</div>
        <div class="metric-value metric-positive">AED ${
          data.totalStockValue?.toLocaleString() || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Low Stock Items</div>
        <div class="metric-value metric-warning">${
          data.lowStockCount || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Out of Stock Items</div>
        <div class="metric-value metric-negative">${
          data.outOfStockCount || "0"
        }</div>
      </div>
    </div>

  </div>
`;

const generatePurchaseHTML = (data, dateRange, currentDate) => `
  <div class="report-container">
    ${getCommonStyles()}
    
    <div class="report-header avoid-page-break">
      <h1 class="report-title">Purchase Analysis Report</h1>
      <div class="report-period">Period: ${dateRange}</div>
      <div class="report-date">Generated on: ${currentDate}</div>
    </div>
    
    <div class="metrics-grid avoid-page-break">
      <div class="metric-card">
        <div class="metric-label">Total Purchases</div>
        <div class="metric-value metric-neutral">AED ${
          data.totalPurchases?.toLocaleString() || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Total Invoices</div>
        <div class="metric-value metric-neutral">${
          data.totalInvoices || "0"
        }</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Outstanding Amount</div>
        <div class="metric-value metric-warning">AED ${
          data.totalOutstanding?.toLocaleString() || "0"
        }</div>
      </div>
    </div>
  </div>
`;

const generateDashboardHTML = (data, dateRange, currentDate) => `
  <div class="report-container">
    ${getCommonStyles()}
    
    <div class="report-header avoid-page-break">
      <h1 class="report-title">Executive Dashboard Summary</h1>
      <div class="report-period">Period: ${dateRange}</div>
      <div class="report-date">Generated on: ${currentDate}</div>
    </div>
    
    <div class="metrics-grid avoid-page-break">
      <div class="metric-card">
        <div class="metric-label">Monthly Sales</div>
        <div class="metric-value metric-positive">AED ${
          data.monthlySales?.toLocaleString() || "0"
        }</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Monthly Expenses</div>
        <div class="metric-value metric-negative">AED ${
          data.monthlyExpenses?.toLocaleString() || "0"
        }</div>
      </div>
    </div>
    
    <div class="content-section avoid-page-break">
      <div class="section-header">
        <h3 class="section-title">Key Performance Indicators</h3>
      </div>
      <div class="section-content">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Monthly Invoices</div>
            <div class="metric-value metric-neutral">${
              data.monthlyInvoices || "0"
            }</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Outstanding</div>
            <div class="metric-value metric-warning">AED ${
              data.totalOutstanding?.toLocaleString() || "0"
            }</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Discounts Given</div>
            <div class="metric-value metric-warning">${
              data.totalDiscount || "0"
            }</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Pending Invoices</div>
            <div class="metric-value metric-neutral">${
              data.pendingInvoicesCount || "0"
            }</div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
