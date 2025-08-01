import {
  AlertTriangle,
  DollarSign,
  Download,
  FileText,
  Notebook,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../service/reportService";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

const DashboardSummary = ({ handleDownloadReport, isDownloading }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardSummary();
      setData(response.data);
    } catch (err) {
      setError("Failed to load dashboard summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const cards = [
    {
      title: "Monthly Sales",
      value: `AED ${data.monthlySales.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
    },
    {
      title: "Monthly Expenses",
      value: `AED ${data.monthlyExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
    },
    {
      title: "Monthly Invoices",
      value: `${data.monthlyInvoices}`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      title: "Outstanding",
      value: `AED ${data.totalOutstanding.toLocaleString()}`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      title: "Total Discounts",
      value: data.totalDiscount,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-100",
    },
    {
      title: "Pending Invoices",
      value: data.pendingInvoicesCount,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <div className="border border-blue-100 mb-3 p-5 shadow-lg rounded-xl">
      <div className="flex justify-between">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Notebook className="text-blue-500" size={24} />
          Dashboard Overview
        </h3>
        <div className="flex justify-end mb-3">
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 shadow-sm"
            disabled={isDownloading}
            onClick={() => handleDownloadReport("dashboard")}
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className={` rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.iconBg} p-3 rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSummary;
