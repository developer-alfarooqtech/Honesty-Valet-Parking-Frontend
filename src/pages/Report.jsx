import { Calendar, Download, TrendingUp } from "lucide-react";
import { useState } from "react";
import DashboardSummary from "../components/Report_comp/DashboardSummery";
import ProfitLossReport from "../components/Report_comp/ProfitLossReport";
import AccountsReceivableReport from "../components/Report_comp/AccountsReceivableReport";
import SalesReport from "../components/Report_comp/SalesReport";
import ExpenseReport from "../components/Report_comp/ExpenseReport";
import InventoryReport from "../components/Report_comp/InventoryReport";
import PurchaseReport from "../components/Report_comp/PurchaseReport";
import useDebounce from "../hooks/useDebounce";
import {
  getAccountsReceivableReport,
  getDashboardSummary,
  getExpenseReport,
  getInventoryReport,
  getProfitLossReport,
  getPurchaseReport,
  getSalesReport,
} from "../service/reportService";
import { downloadReportAsPDF } from "../utils/pdfDownload";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";

const Report = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async (reportType) => {
    setIsDownloading(true);
    try {
      let reportData;

      switch (reportType) {
        case "dashboard":
          const dashboardResponse = await getDashboardSummary();
          reportData = dashboardResponse.data;
          break;
        case "profit-loss":
          const profitLossResponse = await getProfitLossReport({
            startDate: debouncedDateRange.start,
            endDate: debouncedDateRange.end,
          });
          reportData = profitLossResponse.data;
          break;
        case "expense":
          const expenseResponse = await getExpenseReport({
            startDate: debouncedDateRange.start,
            endDate: debouncedDateRange.end,
          });
          reportData = expenseResponse.data;
          break;
        case "sales":
          const salesResponse = await getSalesReport({
            startDate: debouncedDateRange.start,
            endDate: debouncedDateRange.end,
          });
          reportData = salesResponse.data;
          break;
        case "accounts-receivable":
          const arResponse = await getAccountsReceivableReport();
          reportData = arResponse.data;
          break;
        case "inventory":
          const inventoryResponse = await getInventoryReport();
          reportData = inventoryResponse.data;
          break;
        case "purchase":
          const purchaseResponse = await getPurchaseReport({
            startDate: debouncedDateRange.start,
            endDate: debouncedDateRange.end,
          });
          reportData = purchaseResponse.data;
          break;
        default:
          throw new Error("Invalid report type");
      }

      downloadReportAsPDF(reportData, reportType, debouncedDateRange);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAllReports = async () => {
    setIsDownloading(true);
    try {
      const reportTypes = [
        "dashboard",
        "profit-loss",
        "expense",
        "sales",
        "accounts-receivable",
        "inventory",
        "purchase",
      ];

      // Fetch all reports data concurrently
      const reportPromises = reportTypes.map(async (reportType) => {
        let reportData;

        switch (reportType) {
          case "dashboard":
            const dashboardResponse = await getDashboardSummary();
            reportData = dashboardResponse.data;
            break;
          case "profit-loss":
            const profitLossResponse = await getProfitLossReport({
              startDate: debouncedDateRange.start,
              endDate: debouncedDateRange.end,
            });
            reportData = profitLossResponse.data;
            break;
          case "expense":
            const expenseResponse = await getExpenseReport({
              startDate: debouncedDateRange.start,
              endDate: debouncedDateRange.end,
            });
            reportData = expenseResponse.data;
            break;
          case "sales":
            const salesResponse = await getSalesReport({
              startDate: debouncedDateRange.start,
              endDate: debouncedDateRange.end,
            });
            reportData = salesResponse.data;
            break;
          case "accounts-receivable":
            const arResponse = await getAccountsReceivableReport();
            reportData = arResponse.data;
            break;
          case "inventory":
            const inventoryResponse = await getInventoryReport();
            reportData = inventoryResponse.data;
            break;
          case "purchase":
            const purchaseResponse = await getPurchaseReport({
              startDate: debouncedDateRange.start,
              endDate: debouncedDateRange.end,
            });
            reportData = purchaseResponse.data;
            break;
          default:
            throw new Error("Invalid report type");
        }

        return { type: reportType, data: reportData };
      });

      const reports = await Promise.all(reportPromises);

      // Import the downloadAllReportsAsPDF function
      const { downloadAllReportsAsPDF } = await import("../utils/pdfDownload");
      await downloadAllReportsAsPDF(reports, debouncedDateRange);
    } catch (error) {
      console.error("Error downloading all reports:", error);
      toast.error("Failed to download all reports. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Debounce the date range to prevent excessive updates
  const debouncedDateRange = useDebounce(dateRange, 500);
  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* <div>
              <h1 className="text-3xl font-bold text-blue-500 mb-2">
                Business Reports
              </h1>
              <p className="text-blue-400">
                Comprehensive overview of your business performance
              </p>
            </div> */}
            <header className="mb-8 flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-500">
                  Business Reports
                </h1>
                <p className="text-blue-400 font-medium">
                  Comprehensive overview of your business performance
                </p>
              </div>
            </header>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-blue-200">
                <Calendar size={16} className="text-blue-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>setDateRange({ ...dateRange, start: e.target.value })}
                  className="text-sm border-none outline-none"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="text-sm border-none outline-none"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                />
              </div>

              <button
                onClick={handleDownloadAllReports}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                {isDownloading ? "Generating..." : "Download All"}
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {["all", "financial", "orders", "inventory", "expenses"].map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-blue-50 border border-blue-200"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Dashboard Summary */}
        <DashboardSummary
          handleDownloadReport={handleDownloadReport}
          isDownloading={isDownloading}
        />

        {/* Reports Grid */}
        <div className="space-y-8">
          {(activeFilter === "all" || activeFilter === "financial") && (
            <>
              <ProfitLossReport
                dateRange={debouncedDateRange}
                handleDownloadReport={handleDownloadReport}
                isDownloading={isDownloading}
              />
              <AccountsReceivableReport
                handleDownloadReport={handleDownloadReport}
                isDownloading={isDownloading}
              />
            </>
          )}

          {(activeFilter === "all" || activeFilter === "orders") && (
            <SalesReport
              dateRange={debouncedDateRange}
              handleDownloadReport={handleDownloadReport}
              isDownloading={isDownloading}
            />
          )}

          {(activeFilter === "all" || activeFilter === "expenses") && (
            <ExpenseReport
              dateRange={debouncedDateRange}
              handleDownloadReport={handleDownloadReport}
              isDownloading={isDownloading}
            />
          )}

          {(activeFilter === "all" || activeFilter === "inventory") && (
            <InventoryReport
              dateRange={debouncedDateRange}
              handleDownloadReport={handleDownloadReport}
              isDownloading={isDownloading}
            />
          )}

          {(activeFilter === "all" || activeFilter === "financial") && (
            <PurchaseReport
              dateRange={debouncedDateRange}
              handleDownloadReport={handleDownloadReport}
              isDownloading={isDownloading}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Reports generated on {new Date().toLocaleDateString("en-GB")} • Data
            refreshed every 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
