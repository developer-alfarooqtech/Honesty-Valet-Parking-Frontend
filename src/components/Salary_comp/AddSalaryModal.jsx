// components/AddSalaryModal.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import RecipientSearch from "./RecipientSearch";
import AddRecipientModal from "./AddRecipientModal";
import { createRecipient } from "../../service/salaryService";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";

const AddSalaryModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  editData = null,
}) => {
  const [formData, setFormData] = useState({
    recipient: null,
    amount: "",
    type: "operational",
    date: new Date(),
  });

  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);
  const [addingRecipient, setAddingRecipient] = useState(false);

  // Update form data when editData changes
  useEffect(() => {
    if (editData) {
      setFormData({
        recipient: editData.recipient || null,
        amount: editData.amount || "",
        type: editData.type || "operational",
        date: editData.date
          ? new Date(editData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        recipient: null,
        amount: "",
        type: "operational",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? (value ? Number(value) : "") : value,
    }));
  };

  const handleRecipientSelect = (recipient) => {
    setFormData((prev) => ({
      ...prev,
      recipient,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      recipient: null,
      amount: "",
      type: "operational",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleClose = () => {
    if (!editData) resetForm();
    onClose();
  };

  const handleAddRecipient = async (recipientData) => {
    setAddingRecipient(true);
    try {
      const response = await createRecipient(recipientData);
      const newRecipient = response.data;
      setFormData((prev) => ({
        ...prev,
        recipient: newRecipient,
      }));
      setShowAddRecipientModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Faild to create Recipient");
      console.error("Error adding recipient:", error);
    } finally {
      setAddingRecipient(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-md animate-fade-in flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editData ? "Edit Salary" : "Add New Salary"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient *
              </label>
              <RecipientSearch
                selectedRecipient={formData.recipient}
                onRecipientSelect={handleRecipientSelect}
                onAddNew={() => setShowAddRecipientModal(true)}
                placeholder="Search and select recipient"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter salary amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="operational">Operational</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.recipient || !formData.amount}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? editData
                    ? "Updating..."
                    : "Adding..."
                  : editData
                  ? "Update Salary"
                  : "Add Salary"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AddRecipientModal
        isOpen={showAddRecipientModal}
        onClose={() => setShowAddRecipientModal(false)}
        onSubmit={handleAddRecipient}
        loading={addingRecipient}
      />
    </>
  );
};

export default AddSalaryModal;
