import { useEffect, useState } from "react";
import { getAccountsReceivableReport } from "../../service/reportService";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { Download, FileText } from "lucide-react";

const AccountsReceivableReport = ({handleDownloadReport,isDownloading}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAccountsReceivableReport();
      setData(response.data);
    } catch (err) {
      setError('Failed to load accounts receivable data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const agingData = [
    { name: '0-30 Days', value: data.aging.current, color: '#22c55e' },
    { name: '31-60 Days', value: data.aging.days30, color: '#f59e0b' },
    { name: '61-90 Days', value: data.aging.days60, color: '#f97316' },
    { name: '90+ Days', value: data.aging.days90Plus, color: '#ef4444' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex justify-between">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="text-blue-500" size={24} />
        Accounts Receivable
      </h3>
      <div className="flex justify-end mb-3">
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 shadow-sm"
            disabled={isDownloading}
            onClick={() => handleDownloadReport("accounts-receivable")}
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Outstanding</div>
          <div className="text-2xl font-bold text-blue-600">AED {data.totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Invoices</div>
          <div className="text-2xl font-bold text-blue-600">{data.totalInvoices}</div>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Due Date Analysis</h4>
        <div className="space-y-4">
          {agingData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-700 font-medium">{item.name}</span>
              </div>
              <span className="text-lg font-bold" style={{ color: item.color }}>
                AED {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsReceivableReport