import React from "react";
import { Building2, Plus } from "lucide-react";

const BankListSection = ({ banks, loading, onCreateBank }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">
              Bank Accounts
            </h2>
          </div>
          <button
            onClick={onCreateBank}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Bank Account
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : banks.length === 0 ? (
        <div className="text-center py-12">
          <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No bank accounts found</p>
          <button
            onClick={onCreateBank}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Create First Bank Account
          </button>
        </div>
      ) : (
        <>
          {/* Bank Accounts List */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banks.map((bank) => (
                <div
                  key={bank._id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {bank.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Created:{" "}
                        {new Date(bank?.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">
                          Balance:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(bank.balance || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Building2 size={16} className="text-blue-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BankListSection;
