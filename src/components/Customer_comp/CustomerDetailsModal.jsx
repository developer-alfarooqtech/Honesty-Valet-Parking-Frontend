import React from "react";
import { X, MapPin, Phone, Mail, FileText, Building, Building2, DollarSign } from "lucide-react";

const CustomerDetailsModal = ({ customer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/60 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-blue-500">
              Customer Details
            </h2>
            <button
              onClick={onClose}
              className="text-blue-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Customer main details */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-gray-600">Code: {customer.Code}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm">{customer.Email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm">{customer.Phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">VAT Number</p>
                    <p className="text-sm">{customer.VATNo || "-"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    {customer.address ? (
                      <div className="text-sm">
                        {customer.address.address1 && (
                          <p>{customer.address.address1}</p>
                        )}
                        {customer.address.address2 && (
                          <p>{customer.address.address2}</p>
                        )}
                        {customer.address.address3 && (
                          <p>{customer.address.address3}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm">-</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Credit Period</p>
                    <p className="text-sm">{customer.creditPeriod || "-"}</p>
                  </div>
                </div>
                {customer?.parent && (
                  <div className="flex items-start">
                    <Building2 className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Parent</p>
                      {customer.parent ? (
                        <div className="text-sm">
                          <p>{customer.parent?.name}</p>
                          <p>{customer.parent?.Code}</p>
                          <p>{customer.parent?.Phone}</p>
                        </div>
                      ) : (
                        <p className="text-sm">-</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sub companies section */}
            {customer.subCompanies && customer.subCompanies.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Sub Companies ({customer.subCompanies.length})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Phone
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.subCompanies.map((company) => (
                        <tr
                          key={company._id}
                          className="hover:bg-blue-100/50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {company.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {company.Code}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {company.Email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {company.Phone}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Show creation and update times */}
            <div className="flex justify-between text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
              <p>
                Created: {new Date(customer.createdAt).toLocaleDateString('en-GB')}
              </p>
              {customer.updatedAt && (
                <p>
                  Last Updated:{" "}
                  {new Date(customer.updatedAt).toLocaleDateString('en-GB')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
