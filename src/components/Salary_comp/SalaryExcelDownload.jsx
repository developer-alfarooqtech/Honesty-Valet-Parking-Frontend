import * as XLSX from 'xlsx';
import toast from "react-hot-toast";
import { downloadSalaries } from '../../service/salaryService';

// Utility function for date formatting
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Main Excel generation function
export const handleDownloadSalaryExcel = async ({
  setExportingExcel,
  startDate,
  endDate,
  type,
  recipient,
}) => {
  try {
    setExportingExcel(true);

    const params = new URLSearchParams();

    // Add filters
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (type) params.append("type", type);
    if (recipient) params.append("recipient", recipient);

    // Fetch salary data
    const response = await downloadSalaries(params);

    if (!response?.data) {
      toast.error("No data available for Excel generation");
      return;
    }

    const { salaries, sum } = response.data;

    // Prepare salary data for Excel
    const salaryData = salaries.map((salary, index) => ({
      'S.No': index + 1,
      'Recipient Name': salary.recipient?.name || 'N/A',
      'Phone': salary.recipient?.Phone || 'N/A',
      'Address': salary.recipient?.address || 'N/A',
      'Type': salary.type || 'N/A',
      'Date': formatDate(salary?.date || salary?.createdAt),
      'Amount': salary.amount || 0,
    }));

    // Prepare summary data
    const summaryData = [
      { 'Metric': 'Total Records', 'Value': sum.totalRecords },
      { 'Metric': 'Total Amount', 'Value': sum.totalAmount },
      { 'Metric': 'Average Amount', 'Value': sum.averageAmount },
      { 'Metric': '', 'Value': '' }, // Empty row
      { 'Metric': 'Operational Total', 'Value': sum.operationalTotal },
      { 'Metric': 'Operational Count', 'Value': sum.operationalCount },
      { 'Metric': 'Admin Total', 'Value': sum.adminTotal },
      { 'Metric': 'Admin Count', 'Value': sum.adminCount },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create salary data worksheet
    const salaryWorksheet = XLSX.utils.json_to_sheet(salaryData);
    
    // Set column widths for salary sheet
    const salaryColWidths = [
      { wch: 8 },  // S.No
      { wch: 20 }, // Recipient Name
      { wch: 15 }, // Phone
      { wch: 25 }, // Address
      { wch: 12 }, // Type
      { wch: 12 }, // Date
      { wch: 12 }, // Amount
    ];
    salaryWorksheet['!cols'] = salaryColWidths;

    // Create summary worksheet
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    
    // Set column widths for summary sheet
    const summaryColWidths = [
      { wch: 20 }, // Metric
      { wch: 15 }, // Value
    ];
    summaryWorksheet['!cols'] = summaryColWidths;

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, salaryWorksheet, 'Salary Data');
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Generate filename
    const filename = `Salary_Report_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Write and download the file
    XLSX.writeFile(workbook, filename);

    toast.success("Excel report generated and downloaded successfully!");
  } catch (error) {
    console.error("Excel Generation Error:", error);
    toast.error(`Failed to generate Excel: ${error.message || "Unknown error"}`);
  } finally {
    setExportingExcel(false);
  }
};