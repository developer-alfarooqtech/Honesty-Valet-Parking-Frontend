import React from "react";
import { Receipt, Truck, Plus, Calendar, Notebook } from "lucide-react";
import DatePicker from "react-datepicker";

const InvoiceForm = ({
  supplierId,
  setSupplierId,
  suppliers,
  showSupplierForm,
  setShowSupplierForm,
  setSelectedDate,
  selectedDate
}) => {
  return (
    <>
      <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
        <Notebook className="w-5 h-5 text-blue-500 mr-2" />
        LPO Form
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="">
          <label className="block text-sm font-medium text-blue-700 mb-1 flex items-center">
            <Calendar className="h-5 w-5 text-blue-400 mr-2" />
            <span>Date</span>
          </label>
          <input
            type="date"
            className="w-full border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
        
          />
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-700 mb-1 flex items-center">
              <Truck className="h-5 w-5 text-blue-400 mr-2" />
              <span>Select Supplier</span>
            </label>
            <select
              className="w-full border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all bg-white appearance-none"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Select Supplier</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowSupplierForm(!showSupplierForm)}
            className={`${
              showSupplierForm
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } px-4 py-3 rounded-lg flex items-center font-medium transition-colors duration-200`}
          >
            <Plus className="h-5 w-5 mr-1" />
            {showSupplierForm ? "Cancel" : "New"}
          </button>
        </div>
      </div>
    </>
  );
};

export default InvoiceForm;
