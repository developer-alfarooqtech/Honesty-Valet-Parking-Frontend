import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";

const AccountsReceivableReport = ({ data, loading, handleDownloadReport, isDownloading }) => {
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  
  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      // Fetch fresh data with all invoice details
      const { getAccountsReceivableReport } = await import('../../service/reportService');
      const response = await getAccountsReceivableReport();
      const freshData = response.data;
      
      if (!freshData.allInvoices || freshData.allInvoices.length === 0) {
        toast.error('No outstanding invoices found');
        setDownloadingExcel(false);
        return;
      }

      const XLSX = await import('xlsx');
      
      const currentDate = new Date();
      const excelData = freshData.allInvoices.map(invoice => {
        const dueDate = new Date(invoice.expDate);
        const invoiceDate = new Date(invoice.date);
        const daysOverdue = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));
        
        return {
          'Invoice No': invoice.name || 'N/A',
          'Customer Code': invoice.customer?.Code || 'N/A',
          'Customer Name': invoice.customer?.name || 'N/A',
          'Invoice Date': invoiceDate.toLocaleDateString('en-GB'),
          'Due Date': dueDate.toLocaleDateString('en-GB'),
          'Total Amount': invoice.totalAmount || 0,
          'Amount Paid': invoice.amountReceived || 0,
          'Balance Outstanding': invoice.balanceToReceive || 0,
          'Days Overdue': daysOverdue > 0 ? daysOverdue : 0,
          'Status': daysOverdue > 0 ? 'Overdue' : 'Pending',
          'Email': invoice.customer?.Email || 'N/A',
          'Phone': invoice.customer?.Phone || 'N/A'
        };
      });

      // Add summary at the end
      excelData.push({});
      excelData.push({
        'Invoice No': 'SUMMARY',
        'Customer Code': '',
        'Customer Name': '',
        'Invoice Date': '',
        'Due Date': '',
        'Total Amount': freshData.allInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        'Amount Paid': freshData.allInvoices.reduce((sum, inv) => sum + (inv.amountReceived || 0), 0),
        'Balance Outstanding': freshData.totalOutstanding,
        'Days Overdue': '',
        'Status': `${freshData.totalInvoices} Invoices`,
        'Email': '',
        'Phone': ''
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // Invoice No
        { wch: 12 }, // Customer Code
        { wch: 25 }, // Customer Name
        { wch: 12 }, // Invoice Date
        { wch: 12 }, // Due Date
        { wch: 15 }, // Total Amount
        { wch: 15 }, // Amount Paid
        { wch: 18 }, // Balance Outstanding
        { wch: 12 }, // Days Overdue
        { wch: 10 }, // Status
        { wch: 25 }, // Email
        { wch: 15 }  // Phone
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Accounts Receivable');
      
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Accounts_Receivable_${timestamp}.xlsx`);
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download Excel file');
    } finally {
      setDownloadingExcel(false);
    }
  };

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
      <div className="flex gap-2 justify-end mb-3">
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 shadow-sm"
            disabled={downloadingExcel}
            onClick={handleDownloadExcel}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>{downloadingExcel ? 'Generating...' : 'Excel'}</span>
          </button>
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 shadow-sm"
            disabled={isDownloading}
            onClick={() => handleDownloadReport("accounts-receivable")}
          >
            <Download className="w-5 h-5" />
            <span>PDF</span>
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

export default React.memo(AccountsReceivableReport);