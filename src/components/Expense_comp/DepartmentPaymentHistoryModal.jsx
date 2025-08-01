import React, { useState, useEffect } from 'react';
import { getDepartmentPaymentHistoryById } from '../../service/expenseService';
import { Calendar, X } from 'lucide-react';

const DepartmentPaymentHistoryModal = ({ department, onClose }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentDetails, setDepartmentDetails] = useState({});

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await getDepartmentPaymentHistoryById(department._id);
        setDepartmentDetails(response.data);
        setPaymentHistory(response.data.paymentHistory || []);
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [department._id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  return (
    <div className="fixed inset-0 bg-black/20 animate-fade-in backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-500">
            {department.name} Payment History
          </h2>
          <button onClick={onClose} className="text-blue-500 hover:text-blue-600 cursor-pointer">
            <X size={24} />
          </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Available Balance: <span className="font-medium text-green-600">{departmentDetails.availableAmount || 0}</span>
          </p>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No payment history found for this department.
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((payment, index) => (
                  <div
                    key={index}
                    className="p-4 border border-blue-500 rounded-md shadow flex justify-between items-center"
                  >
                    <div className="flex items-center text-gray-600">
                      <Calendar size={18} className="text-blue-500 mr-2" />
                      <span>{formatDate(payment.date)}</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {payment.amount}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* <div className="p-3 bg-white rounded-b-lg flex justify-end">
        </div> */}
      </div>
    </div>
  );
};

export default DepartmentPaymentHistoryModal;