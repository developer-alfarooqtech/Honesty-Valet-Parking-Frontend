import React, { useState, useEffect } from 'react';
import CustomerSearch from './CustomerSearch';
import SelectedCustomersList from './SelectedCustomersList';

const CustomerForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    Code: '',
    Email: '',
    Phone: '',
    address: {
      address1: '',
      address2: '',
      address3: '',
    },
    VATNo: '',
    creditPeriod:60,
    subCompanies: []
  });
  const [errors, setErrors] = useState({});
  // Initialize form if editing an existing customer
 useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        address: {
          address1: initialData.address?.address1 || '',
          address2: initialData.address?.address2 || '',
          address3: initialData.address?.address3 || '',
        },
        subCompanies: initialData.subCompanies || []
      });
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (address)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle adding a subCompany
const handleAddSubCompany = (customer) => {
    // Prevent duplicate by checking _id
    const isAlreadyAdded = formData.subCompanies.some(
      sub => sub._id === customer._id
    );

    if (isAlreadyAdded) return;

    // Add to selected subCompanies list
    setFormData(prev => ({
      ...prev,
      subCompanies: [...prev.subCompanies, customer]
    }));
  };


  // Handle removing a subCompany
const handleRemoveSubCompany = (customerId) => {
    // Properly filter by comparing _id inside each subCompany object
    setFormData(prev => ({
      ...prev,
      subCompanies: prev.subCompanies.filter(subCompany => subCompany._id !== customerId)
    }));
  };

  // Validate form
const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.Code?.trim()) newErrors.Code = 'Code is required';
    // if (formData.Email && !/\S+@\S+\.\S+/.test(formData.Email)) newErrors.Email = 'Email is invalid';
    if (!formData.Phone?.trim()) newErrors.Phone = 'Phone is required';
    if (!formData.address.address1?.trim()) newErrors['address.address1'] = 'Address line 1 is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Clone and modify formData to send only subCompany IDs
      const updatedFormData = {
        ...formData,
        subCompanies: formData.subCompanies.map(sub => sub._id)
      };

      onSubmit(updatedFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-blue-300'}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code *
          </label>
          <input
            type="text"
            name="Code"
            value={formData.Code}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.Code ? 'border-red-500' : 'border-blue-300'}`}
          />
          {errors.Code && <p className="mt-1 text-sm text-red-500">{errors.Code}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.Email ? 'border-red-500' : 'border-blue-300'}`}
          />
          {errors.Email && <p className="mt-1 text-sm text-red-500">{errors.Email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="Phone"
            value={formData.Phone}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.Phone ? 'border-red-500' : 'border-blue-300'}`}
          />
          {errors.Phone && <p className="mt-1 text-sm text-red-500">{errors.Phone}</p>}
        </div>

        {/* VAT Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VAT Number
          </label>
          <input
            type="text"
            name="VATNo"
            value={formData.VATNo}
            onChange={handleChange}
            className="w-full p-2 border border-blue-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Period (days)
          </label>
          <input
            type="text"
            name="creditPeriod"
            value={formData.creditPeriod}
            onChange={handleChange}
            className="w-full p-2 border border-blue-300 rounded-md"
          />
        </div>
      </div>

      {/* Address */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Address</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="address.address1"
              value={formData.address.address1}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors['address.address1'] ? 'border-red-500' : 'border-blue-300'}`}
            />
            {errors['address.address1'] && <p className="mt-1 text-sm text-red-500">{errors['address.address1']}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="address.address2"
              value={formData.address.address2}
              onChange={handleChange}
              className="w-full p-2 border border-blue-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 3
            </label>
            <input
              type="text"
              name="address.address3"
              value={formData.address.address3}
              onChange={handleChange}
              className="w-full p-2 border border-blue-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Sub Companies */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Sub Companies</h3>
        <div className="space-y-2">
          <CustomerSearch 
            onSelect={handleAddSubCompany} 
            selectedIds={formData.subCompanies} 
            excludeIds={initialData ? [initialData._id] : []}
            label="Search and add sub companies"
          />
          
          <SelectedCustomersList 
            customers={formData.subCompanies} 
            onRemove={handleRemoveSubCompany} 
          />
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white ${loading ? 'bg-blue-300' : 'bg-blue-400'} rounded-md hover:bg-blue-500 transition-colors`}
        >
          {loading ? 'Wait...' : initialData ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;