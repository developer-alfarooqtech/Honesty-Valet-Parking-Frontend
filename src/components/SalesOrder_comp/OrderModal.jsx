import React, { useEffect, useRef } from 'react';
import { X, Package, Briefcase, User, Calendar, CreditCard, FileText } from 'lucide-react';

const OrderModal = ({ order, isOpen, onClose }) => {
  const modalRef = useRef(null);
  useEffect(() => {
    // Add event listener for clicking outside the modal
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Add event listener for escape key
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center animate-fade-in justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div 
        ref={modalRef} 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header with gradient background */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center p-5 z-10">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="hidden sm:inline">Order Details:</span> {order.OrderId}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {/* Order info section */}
          <div className="p-6 bg-blue-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-md border border-blue-100">
                <h3 className="text-lg font-semibold mb-3 text-blue-600 flex items-center gap-2">
                  <User size={20} />
                  <span>Customer Information</span>
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700"><span className="font-medium">Name:</span> {order.customer.name}</p>
                  <p className="text-gray-700"><span className="font-medium">Email:</span> {order.customer.Email}</p>
                  <p className="text-gray-700"><span className="font-medium">Phone:</span> {order.customer.Phone}</p>
                  <p className="text-gray-700"><span className="font-medium">Address:</span> {order.customer.address.address1}</p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-md border border-blue-100">
                <h3 className="text-lg font-semibold mb-3 text-blue-600 flex items-center gap-2">
                  <CreditCard size={20} />
                  <span>Order Information</span>
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700"><span className="font-medium">Order ID:</span> #{order.OrderId}</p>
                  <p className="text-gray-700"><span className="font-medium">LPO:</span> {order.lpo}</p>
                  <p className="text-gray-700"><span className="font-medium">Date:</span> {new Date(order.date).toLocaleDateString("en-GB")}</p>
                  <p className="text-gray-700 mt-2">
                    <span className="font-medium">NetAmount:</span> 
                    <span className="text-blue-600 font-bold text-lg ml-1">{order?.netAmount?.toFixed(2)}</span>
                  </p>
                  <p className="text-gray-700 mt-2">
                    <span className="font-medium">Vat(5%):</span> 
                    <span className="text-blue-600 font-bold text-lg ml-1">{order?.vatAmount?.toFixed(2)}</span>
                  </p>
                  <p className="text-gray-700 mt-2">
                    <span className="font-medium">Subtotal:</span> 
                    <span className="text-blue-600 font-bold text-lg ml-1">{order?.subtotal?.toFixed(2)}</span>
                  </p>
                  <p className="text-gray-700 mt-2">
                    <span className="font-medium">Discount:</span> 
                    <span className="text-blue-600 font-bold text-lg ml-1">{order?.discount?.toFixed(2)}</span>
                  </p>
                  <p className="text-gray-700 mt-2">
                    <span className="font-medium">Total:</span> 
                    <span className="text-blue-600 font-bold text-lg ml-1">{order?.total.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Description section */}
            {order.description && (
              <div className="mt-6 bg-white p-5 rounded-lg shadow-md border border-blue-100">
                <h3 className="text-lg font-semibold mb-3 text-blue-600 flex items-center gap-2">
                  <FileText size={20} />
                  <span>Description</span>
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{order.description}</p>
              </div>
            )}
          </div>

          {/* Products section */}
          <div className="p-6 border-t border-blue-100">
            <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
              <Package size={20} />
              <span>Products</span>
            </h3>
            {order.products.length > 0 ? (
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Note</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {order.products.map((item) => (
                      <tr key={item.product?._id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-sm">{item.product?.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.product?.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item?.note}</td>
                        <td className="px-4 py-3 text-sm">{item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-blue-500 italic">No products in this order</p>
              </div>
            )}
          </div>

          {/* Services section */}
          <div className="p-6 border-t border-blue-100">
            <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
              <Briefcase size={20} />
              <span>Services</span>
            </h3>
            {order.services.length > 0 ? (
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {order.services.map((item) => (
                      <tr key={item.service._id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-sm">{item.service.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.service.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item?.note}</td>
                        <td className="px-4 py-3 text-sm">{item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-blue-500 italic">No services in this order</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderModal;