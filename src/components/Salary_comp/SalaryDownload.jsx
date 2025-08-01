import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { handleDownloadSalaryPDF } from './SalaryPdfDownload';
import { handleDownloadSalaryExcel } from './SalaryExcelDownload';
const SalaryDownload = ({ filters }) => {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handlePDFDownload = async () => {
    await handleDownloadSalaryPDF({
      setExportingPDF,
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: filters.type,
      recipient: filters.recipient?._id || null,
    });
  };

  const handleExcelDownload = async () => {
    await handleDownloadSalaryExcel({
      setExportingExcel,
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: filters.type,
      recipient: filters.recipient?._id || null,
    });
  };

  return (
    <div className="flex items-center space-x-2">
      {/* PDF Download Button */}
      <button
        onClick={handlePDFDownload}
        disabled={exportingPDF || exportingExcel}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border ${
          exportingPDF || exportingExcel
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
        }`}
      >
        <Download 
          size={18} 
          className={exportingPDF ? 'animate-spin' : ''}
        />
        <span>
          {exportingPDF ? 'Generating PDF...' : 'PDF'}
        </span>
      </button>

      {/* Excel Download Button */}
      <button
        onClick={handleExcelDownload}
        disabled={exportingPDF || exportingExcel}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border ${
          exportingPDF || exportingExcel
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
        }`}
      >
        <FileText 
          size={18} 
          className={exportingExcel ? 'animate-spin' : ''}
        />
        <span>
          {exportingExcel ? 'Generating Excel...' : 'Excel'}
        </span>
      </button>
    </div>
  );
};

export default SalaryDownload;