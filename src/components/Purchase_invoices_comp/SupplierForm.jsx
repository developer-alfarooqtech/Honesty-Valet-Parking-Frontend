import React from "react";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";

const SupplierForm = ({ newSupplier, setNewSupplier, onSave }) => {
  return (
    <div className="mt-4 border border-blue-200 p-5 rounded-lg bg-blue-50/70 backdrop-blur-sm">
      <h4 className="text-md font-semibold mb-3 text-blue-700 flex items-center">
        <User className="w-4 h-4 mr-2" />
        New Supplier
      </h4>
      
      <div className="grid md:grid-cols-2 gap-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-4 w-4 text-blue-400" />
          </div>
          <input
            className="pl-9 w-full border border-blue-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all"
            placeholder="Name"
            value={newSupplier.name}
            onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-blue-400" />
          </div>
          <input
            className="pl-9 w-full border border-blue-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all"
            placeholder="Email"
            value={newSupplier.email}
            onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-4 w-4 text-blue-400" />
          </div>
          <input
            className="pl-9 w-full border border-blue-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all"
            placeholder="Phone"
            value={newSupplier.phone}
            onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-4 w-4 text-blue-400" />
          </div>
          <input
            className="pl-9 w-full border border-blue-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all"
            placeholder="Address"
            value={newSupplier.address}
            onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
          />
        </div>
      </div>
      
      <button
        onClick={onSave}
        className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Supplier
      </button>
    </div>
  );
};

export default SupplierForm;