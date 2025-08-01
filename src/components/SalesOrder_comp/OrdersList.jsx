import React, { useState } from "react";
import { FileText, Edit } from "lucide-react";
import OrderModal from "./OrderModal";
import { createInvoices } from "../../service/salesOrderService";
import toast from "react-hot-toast";

const OrdersList = ({ orders, loading, setLoading, fetchOrders, onEditOrder }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCheckboxChange = (orderId) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleCreateInvoices = async () => {
    try {
      setLoading(true);
      const response = await createInvoices({ orderIds: selectedOrders });

      if (response.status === 201) {
        // Reset selection and refresh orders list
        setSelectedOrders([]);
        // You might want to add a callback to refresh the orders list
        // For example: fetchOrders();
        toast.success("Invoices created successfully");
        await fetchOrders();
      }
    } catch (error) {
      console.error("Error creating invoices:", error);
      toast.error(error.response?.data?.message || "Failed to create invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e, order) => {
    e.stopPropagation(); // Prevent opening the modal
    onEditOrder(order._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-md p-6 text-center">
        <p className="text-gray-500">
          No sales orders found. Create your first order!
        </p>
      </div>
    );
  }

  return (
    <>
      {selectedOrders.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleCreateInvoices}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={loading}
          >
            <FileText size={18} className="mr-2" />
            {loading
              ? "Creating..."
              : `Create Invoices (${selectedOrders.length || 0})`}
          </button>
        </div>
      )}

      <div className="bg-white shadow-md rounded-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Select
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                LPO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {!order.isInvCreated && !order.isCancelled ? (
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleCheckboxChange(order._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="h-4 w-4 bg-gray-300 border-gray-500 rounded cursor-not-allowed"
                      />
                    </>
                  )}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer"
                  onClick={() => openOrderModal(order)}
                >
                  {order.OrderId}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer"
                  onClick={() => openOrderModal(order)}
                >
                  {order.lpo}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                  onClick={() => openOrderModal(order)}
                >
                  {new Date(order.date).toLocaleDateString("en-GB")}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                  onClick={() => openOrderModal(order)}
                >
                  {order.customer.Code}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer"
                  onClick={() => openOrderModal(order)}
                >
                  {order.total.toFixed(2)}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer"
                  onClick={() => openOrderModal(order)}
                >
                  {order.isInvCreated ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Invoiced
                    </span>
                  ) : order.isCancelled ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Cancelled
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* {!order.isInvCreated && !order.isCancelled && ( */}
                    <button
                      onClick={(e) => handleEdit(e, order)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={18} />
                    </button>
                  {/* )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default OrdersList;