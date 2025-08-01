import React, { useState } from "react";
import { Edit, Briefcase } from "lucide-react";
import EditServiceModal from "./EditServiceModal";
import toast from "react-hot-toast";

const ServicesTable = ({ services, isLoading, onUpdateService }) => {
  const [editingService, setEditingService] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditService = (service) => {
    setEditingService(service);
    setIsEditModalOpen(true);
  };

  const handleUpdateService = async (serviceId, serviceData) => {
    try {
      await onUpdateService(serviceId, serviceData);
      setIsEditModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message||"Faild to update service")
    }
      
  };
  // Loading state with skeleton layout
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          {/* Desktop skeleton */}
          <div className="hidden md:block">
            <div className="h-12 bg-gray-100 rounded-lg mb-4"></div>
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-gray-50 rounded-lg mb-2"></div>
            ))}
          </div>

          {/* Mobile skeleton */}
          <div className="md:hidden space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-gray-50 p-5 rounded-xl">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                  <div className="h-6 w-6 bg-gray-100 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!services || services.length === 0) {
    return (
      <div className="py-16 px-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Briefcase size={48} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No services found
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your search didn't match any services or your service list is empty.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop view - table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-blue-500">
            <tr className="text-white border-b border-gray-200">
              <th className="px-6 py-4 text-left font-semibold">
                Service Name
              </th>
              <th className="px-6 py-4 text-left font-semibold">Code</th>
              <th className="px-6 py-4 text-left font-semibold">Price</th>
              <th className="px-6 py-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service._id}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {service.name}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {service.description}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {service.code}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-blue-600">
                  {service.price}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center space-x-2">
                    <button
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EditServiceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingService(null);
        }}
        service={editingService}
        onUpdateService={handleUpdateService}
      />
    </div>
  );
};

export default ServicesTable;
