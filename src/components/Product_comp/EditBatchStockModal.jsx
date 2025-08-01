import React, { useState } from "react";
import { X, Package, AlertCircle } from "lucide-react";
import { updateBatchStock } from "../../service/productService";
import toast from "react-hot-toast";

const EditBatchStockModal = ({
  batch,
  batchIndex,
  productId,
  onClose,
  onUpdate,
}) => {
  const [newStock, setNewStock] = useState(batch.stock || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newStock < 0) {
      setError("Stock cannot be negative");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await updateBatchStock(productId, batchIndex, newStock);
      toast.success("Product stock updated");
      if (onUpdate) {
        await onUpdate();
      }

      onClose();
    } catch (err) {
      console.error("Error updating batch stock:", err);
      setError(err.message || "Failed to update stock. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Edit Batch Stock
                </h2>
                <p className="text-sm text-gray-500">Batch {batchIndex + 1}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-1">Purchase Price</div>
              <div className="text-lg font-semibold text-gray-800">
                ₹{batch.purchasePrice || "N/A"}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Current Stock
            </label>
            <input
              type="number"
              id="stock"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter stock quantity"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Previous stock: {batch.stock || 0} units
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBatchStockModal;
