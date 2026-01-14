import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import ModalBackdrop from "../ModalBackdrop";

const helperTips = [
  "Customer Code must match an existing customer in Honesty Valet Parking.",
  "Use comma-separated lists to pair product/service codes with their quantities and prices.",
  "Add Product Notes, Service Notes, and Credit Notes columns if you need descriptions per line.",
  "Dates can be YYYY-MM-DD or DD/MM/YYYY. Leave Expiry Date blank to default to +60 days.",
  "Purchase prices are optional but required if you want stock deducted from a specific batch.",
];

const allowedExtensions = ".csv,.xls,.xlsx";

const InvoiceImportModal = ({
  isOpen,
  onClose,
  onUpload,
  importing,
  progress,
  summary,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setLocalError("");
    }
  }, [isOpen]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!allowedExtensions.split(",").some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setLocalError("Please choose a .csv, .xls, or .xlsx file");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setLocalError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setLocalError("Select a file before uploading");
      return;
    }
    onUpload(selectedFile);
  };

  const handleTemplateDownload = async () => {
    const XLSX = await import("xlsx");
    const sampleRows = [
      {
        Name: "50051",
        LPO: "PO-12345",
        "Customer Code": "CUST-001",
        Date: "2025-01-10",
        "Exp Date": "2025-03-11",
        Description: "Airport valet booking",
        "Product Codes": "PROD-001,PROD-009",
        "Product Quantities": "2,1",
        "Product Prices": "150,120",
        "Product Purchase Prices": "90,70",
        "Product Notes": "Valet pass,Extra pass",
        "Product Additional Notes": "Main gate,Lobby desk",
        "Service Codes": "SERV-001",
        "Service Quantities": "1",
        "Service Prices": "250",
        "Service Notes": "On-site setup",
        "Service Additional Notes": "Support shift A",
        "Credit Titles": "Promo Credit",
        "Credit Amounts": "50",
        "Credit Notes": "Launch promo",
        "Credit Additional Notes": "Auto applied",
        "Net Amount": 500,
        "VAT Rate": 5,
        "VAT Amount": 25,
        Subtotal: 525,
        Discount: 0,
        "Total Amount": 525,
      },
    ];

    const columns = [
      "Name",
      "LPO",
      "Customer Code",
      "Date",
      "Exp Date",
      "Description",
      "Product Codes",
      "Product Quantities",
      "Product Prices",
      "Product Purchase Prices",
      "Product Notes",
      "Product Additional Notes",
      "Service Codes",
      "Service Quantities",
      "Service Prices",
      "Service Notes",
      "Service Additional Notes",
      "Credit Titles",
      "Credit Amounts",
      "Credit Notes",
      "Credit Additional Notes",
      "Net Amount",
      "VAT Rate",
      "VAT Amount",
      "Subtotal",
      "Discount",
      "Total Amount",
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: columns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, "invoice-import-template.xlsx");
  };

  if (!isOpen) {
    return null;
  }

  const failureRows = summary?.failures?.slice(0, 5) || [];

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="w-[min(640px,90vw)] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
              Bulk Upload
            </p>
            <h2 className="text-2xl font-bold text-blue-900">Import Invoices</h2>
            <p className="text-sm text-blue-500">
              Upload a spreadsheet to create multiple invoices instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-blue-500 transition hover:bg-blue-100"
            aria-label="Close import modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-4">
            <div className="flex items-center gap-3 text-blue-700">
              <FileSpreadsheet size={20} />
              <p className="text-sm font-semibold">Template expectations</p>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-blue-600">
              {helperTips.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                  {tip}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleTemplateDownload}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-600 hover:text-white"
            >
              <FileSpreadsheet size={16} /> Download template
            </button>
          </div>

          <form className="flex flex-col rounded-xl border border-blue-200 p-4" onSubmit={handleSubmit}>
            <label
              htmlFor="invoice-import-input"
              className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 px-4 py-6 text-center text-blue-500 transition hover:border-blue-400 hover:text-blue-500"
            >
              <UploadCloud className="mb-3 text-blue-500" size={32} />
              <p className="text-sm font-semibold">
                {selectedFile ? selectedFile.name : "Choose .csv, .xls, or .xlsx"}
              </p>
              <p className="text-xs text-blue-400">Max 5 MB</p>
              <input
                id="invoice-import-input"
                type="file"
                accept={allowedExtensions}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {localError && (
              <p className="mt-3 text-xs font-semibold text-red-500">{localError}</p>
            )}

            {importing && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-blue-500">
                  <span>Uploading file</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || importing}
              className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                selectedFile && !importing
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-blue-300"
              }`}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={16} /> Upload & Import
                </>
              )}
            </button>
          </form>
        </div>

        {summary && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={18} /> Imported: {summary.importedCount || 0}
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <FileSpreadsheet size={18} /> Total rows: {summary.totalRows || 0}
              </div>
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle size={18} /> Failed: {summary.failedCount || 0}
              </div>
            </div>

            {failureRows.length > 0 && (
              <div className="mt-4 rounded-lg bg-white p-3 text-sm text-red-600 ring-1 ring-red-100">
                <p className="mb-2 font-semibold">First few issues</p>
                <ul className="space-y-2 text-xs text-red-500">
                  {failureRows.map((failure, index) => (
                    <li key={`${failure.rowNumber}-${index}`}>
                      Row {failure.rowNumber}: {failure.error}
                    </li>
                  ))}
                </ul>
                {summary.failedCount > failureRows.length && (
                  <p className="mt-2 text-xs text-blue-500">
                    +{summary.failedCount - failureRows.length} more issue(s).
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
};

export default InvoiceImportModal;
