import React, { useState, useEffect } from "react";
import { X, Package2, AlertCircle, Download } from "lucide-react";
import { getProductById } from "../../service/productService";
import { handleDownloadProductDetailsPDF } from "./ProductDetailsPDFGenerator";
import EditBatchStockModal from "./EditBatchStockModal";

const ProductDetailsModal = ({ productId, onClose, loadProducts }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const [editingBatch, setEditingBatch] = useState(null);
  const [editingBatchIndex, setEditingBatchIndex] = useState(null);

  const handleBatchClick = (batch, index) => {
    setEditingBatch(batch);
    setEditingBatchIndex(index);
  };

  const handleBatchUpdate = async () => {
    // Refresh the product data
    try {
      await loadProducts();
      onClose();
    } catch (err) {
      console.error("Failed to fetch updated product details:", err);
    }
  };

  const handleCloseBatchEdit = () => {
    setEditingBatch(null);
    setEditingBatchIndex(null);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // Assuming getProductById is properly set up to make API calls
        const response = await getProductById(productId);
        setProduct(response.data?.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        setError("Failed to load product details. Please try again.");
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleDownloadPDF = async () => {
    if (!product || downloading) return;
    await handleDownloadProductDetailsPDF(product, setDownloading);
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Product Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-8 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="h-40 bg-gray-100 rounded w-full mb-4"></div>
              <div className="h-20 bg-gray-100 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Product Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-gray-800 font-medium">{error}</p>
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No product data
  if (!product) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Product Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <Package2 size={48} className="text-blue-500 mb-4" />
            <p className="text-gray-800 font-medium">Product not found</p>
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get stock status
  const getStockStatusColors = (stockLevel) => {
    if (stockLevel > 10)
      return { bg: "bg-green-100", text: "text-green-800", label: "In Stock" };
    if (stockLevel > 0)
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Low Stock",
      };
    return { bg: "bg-red-100", text: "text-red-800", label: "Out of Stock" };
  };

  const status = getStockStatusColors(product.stock);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            Product Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              {downloading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Product Header Section */}
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {product.name}
                </h1>
                <div className="flex items-center mt-2 gap-3">
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded border border-gray-200">
                    {product.code}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                  >
                    {status.label} ({product.stock})
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-lg font-bold text-blue-600">
                  {product.sellingPrice}
                </div>
                <div className="text-sm text-gray-500">Selling Price</div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Description
            </h3>
            <p className="text-gray-600 mb-6">
              {product.description || "No description available"}
            </p>

            {/* Product Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Latest Purchase Price
                </h4>
                <div className="text-xl font-semibold text-blue-600">
                  {product.sellingPrice}
                </div>
              </div>
            </div>

            {/* Purchase History Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Purchase History
              </h3>

              {product.batches && product.batches.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-100">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                        >
                          Invoice
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                        >
                          Purchase Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                        >
                          Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                        >
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.batches.map((batch, index) => (
                        <tr
                          key={batch._id || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {batch?.purchaseInvoiceName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.purchaseDate
                              ? new Date(batch.purchaseDate).toLocaleDateString(
                                  "en-GB"
                                )
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.quantity || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {batch.purchasePrice || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No purchase history available</p>
                </div>
              )}
            </div>

            {/* Purchase Price Batch Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Purchase Price Breakdown
              </h3>

              {product.purchasePricebatch &&
              product.purchasePricebatch.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.purchasePricebatch.map((batch, index) => (
                    <div
                      key={index}
                      onClick={() => handleBatchClick(batch, index)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Batch {index + 1}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full group-hover:bg-blue-200 transition-colors">
                          {batch.stock} units
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-gray-800 mb-1">
                        ₹{batch.purchasePrice || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                        Click to edit stock
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    No purchase price breakdown available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {editingBatch && (
        <EditBatchStockModal
          batch={editingBatch}
          batchIndex={editingBatchIndex}
          productId={productId}
          onClose={handleCloseBatchEdit}
          onUpdate={handleBatchUpdate}
        />
      )}
    </div>
  );
};

export default ProductDetailsModal;
