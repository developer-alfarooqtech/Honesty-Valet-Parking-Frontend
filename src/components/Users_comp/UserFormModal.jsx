import React, { useState, useEffect } from "react";
import { Save, User, Key, AtSign, CheckSquare, X } from "lucide-react";
import ModalBackdrop from "../ModalBackdrop";
import ToggleSwitch from "../ToggleSwitch";

const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editUser,
  currentUser,
  isLoading,
}) => {
  const initialPermissions = {
    dashboard: false,
    customers: false,
    "products-services": false,
    "credit-note": false,
    "purchase-invoices": false,
    "bank-statements": false,
    "pending-payments": false,
    invoices: false,
    expense: false,
    suppliers: false,
    salary: false,
  };

  const [formData, setFormData] = useState({
    name: "",
    loginId: "",
    password: "",
    permissions: initialPermissions,
  });

  const [errors, setErrors] = useState({});

  // Check if the current user is super admin
  const isSuperAdmin = currentUser?.is_Super;

  useEffect(() => {
    if (editUser) {
      setFormData({
        name: editUser.name || "",
        loginId: editUser.loginId || "",
        password: "", // Don't include password when editing
        permissions: editUser.permissions || initialPermissions,
      });
    } else {
      // Reset form when opening for new user
      setFormData({
        name: "",
        loginId: "",
        password: "",
        permissions: initialPermissions,
      });
    }

    // Reset errors when form opens
    setErrors({});
  }, [editUser, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.loginId.trim()) newErrors.loginId = "Login ID is required";
    if (!editUser && !formData.password.trim())
      newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (editUser) {
      // Only include password if it's been entered
      const userData = { ...formData };
      if (!userData.password) delete userData.password;
      onSubmit(editUser._id, userData);
    } else {
      onSubmit(formData);
    }
  };

  const permissionOptions = [
    { id: "dashboard", label: "Dashboard Access" },
    { id: "customers", label: "Customer Management" },
    { id: "products-services", label: "Products/Setvices Management" },
    { id: "credit-note", label: "Credit Note Management" },
    { id: "invoices", label: "invoices Management" },
    { id: "expense", label: "Expense Management" },
    { id: "salary", label: "Salary Management" },
    { id: "purchase-invoices", label: "Purchase Inv Management" },
    { id: "suppliers", label: "Supplier management" },
    { id: "bank-statements", label: "Bank Statements" },
    { id: "pending-payments", label: "Pending Statements" },
  ];

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-xl bg-blue-100/40 backdrop-blur-lg p-6 rounded-xl shadow-xl border border-blue-100/50 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-600">
            {editUser ? "Edit User" : "Create New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-blue-700 mb-2 font-medium"
              htmlFor="name"
            >
              Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                <User size={16} />
              </span>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full py-2 pl-10 pr-3 bg-white/50 backdrop-blur-md border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${
                  errors.name
                    ? "border-red-300 focus:ring-red-200"
                    : "border-blue-200 focus:ring-blue-200"
                }`}
                placeholder="Enter full name"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-blue-700 mb-2 font-medium"
              htmlFor="loginId"
            >
              Login ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                <AtSign size={16} />
              </span>
              <input
                id="loginId"
                name="loginId"
                type="text"
                value={formData.loginId}
                onChange={handleChange}
                className={`w-full py-2 pl-10 pr-3 bg-white/50 backdrop-blur-md border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${
                  errors.loginId
                    ? "border-red-300 focus:ring-red-200"
                    : "border-blue-200 focus:ring-blue-200"
                }`}
                placeholder="Enter login ID"
              />
            </div>
            {errors.loginId && (
              <p className="text-red-500 text-sm mt-1">{errors.loginId}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-blue-700 mb-2 font-medium"
              htmlFor="password"
            >
              {editUser
                ? "Password (leave blank to keep unchanged)"
                : "Password"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                <Key size={16} />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full py-2 pl-10 pr-3 bg-white/50 backdrop-blur-md border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${
                  errors.password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-blue-200 focus:ring-blue-200"
                }`}
                placeholder={editUser ? "Enter new password" : "Enter password"}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Permissions Section - Only visible to Super Admin */}
          {isSuperAdmin && (
            <div className="mb-6">
              <h3 className="flex items-center text-blue-700 font-medium mb-3">
                <CheckSquare size={16} className="mr-2" />
                User Permissions
              </h3>
              <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-blue-100/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissionOptions.map((permission) => (
                  <ToggleSwitch
                    key={permission.id}
                    id={`permission-${permission.id}`}
                    checked={formData.permissions[permission.id]}
                    onChange={() => handlePermissionChange(permission.id)}
                    label={permission.label}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 py-2 px-6 rounded-lg transition-all duration-300 shadow-md
    ${
      isLoading
        ? "bg-blue-300 cursor-not-allowed opacity-60"
        : "bg-blue-500 hover:bg-blue-600 text-white"
    }`}
            >
              {isLoading ? (
                editUser ? (
                  "Updating..."
                ) : (
                  "Creating..."
                )
              ) : (
                <>
                  <Save size={16} />
                  {editUser ? "Update User" : "Create User"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};

export default UserFormModal;
