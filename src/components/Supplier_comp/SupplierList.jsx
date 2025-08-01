import React from "react";
import { Users, Mail, Phone, MapPin } from "lucide-react";

const SupplierList = ({
  suppliers,
  loading,
  onSelectSupplier,
  selectedSupplierId,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!suppliers.length) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
        <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <p className="text-blue-800 font-medium text-sm">
          No suppliers found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
      {suppliers.map((supplier) => (
        <div
          key={supplier._id}
          onClick={() => onSelectSupplier(supplier._id)}
          className={`group cursor-pointer transition-all duration-200 ${
            selectedSupplierId === supplier._id
              ? "bg-blue-50 border-blue-500"
              : "bg-white hover:bg-gray-50 border-transparent"
          } border rounded-xl p-4 relative`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedSupplierId === supplier._id
                  ? "bg-blue-500"
                  : "bg-gray-100 group-hover:bg-gray-200"
              }`}
            >
              <Users
                className={`w-5 h-5 ${
                  selectedSupplierId === supplier._id
                    ? "text-white"
                    : "text-gray-600"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate mb-1">
                {supplier.name}
              </h3>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{supplier.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{supplier.address}</span>
                </div>
              </div>
            </div>

            <div
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                selectedSupplierId === supplier._id
                  ? "bg-blue-500"
                  : "bg-gray-300 group-hover:bg-gray-400"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupplierList;
