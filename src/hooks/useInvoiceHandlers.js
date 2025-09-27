import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import {
  fetchInvDetails,
  repayInvoices,
  updateInvoiceExpDate,
  createInvoiceDirectly,
  updateInvoice,
} from "../service/invoicesService";

export const useInvoiceHandlers = (invoiceLogic) => {
  const {
    // States
    view, setView,
    loading, setLoading,
    selectedInvoice, setSelectedInvoice,
    currentPage, setCurrentPage,
    isModalOpen, setIsModalOpen,
    selectedInvoices, setSelectedInvoices,
    isRepaymentModalOpen, setIsRepaymentModalOpen,
    isFullPayment, setIsFullPayment,
    selectedCustomer, setSelectedCustomer,
    selectedCustomerForInvoice, setSelectedCustomerForInvoice,
    selectedProducts, setSelectedProducts,
    selectedServices, setSelectedServices,
    selectedCredits, setSelectedCredits,
    invoiceDate, setInvoiceDate,
    lpo, setLpo,
    description, setDescription,
    error, setError,
    vatRate, setVatRate,
    discount, setDiscount,
    editingInvoice, setEditingInvoice,
    isEditMode, setIsEditMode,
    itemType, setItemType,
    emptyRows, setEmptyRows,
    creationOrder, setCreationOrder,
    isUpdateExpDateModalOpen, setIsUpdateExpDateModalOpen,
    invoiceToUpdateExpDate, setInvoiceToUpdateExpDate,
    batchModalOpen, setBatchModalOpen,
    selectedProductForBatch, setSelectedProductForBatch,
    pendingRowId, setPendingRowId,
    noteInputRefs,

    // Functions
    getUniqueKey,
    calculateTotal,
    fetchStats,
    fetchInvoices,
  } = invoiceLogic;

  // Customer handlers
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCurrentPage(1);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCurrentPage(1);
  };

  const handleCustomerSelectForInvoice = (customer) => {
    setSelectedCustomerForInvoice(customer);
  };

  // Pagination handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Invoice selection handlers
  const handleInvoiceSelect = async (invoiceId) => {
    setLoading(true);
    try {
      const response = await fetchInvDetails(invoiceId);
      const data = await response.data;

      if (data.success) {
        setSelectedInvoice(data.invoice);
        setIsModalOpen(true);
      } else {
        console.error("Failed to fetch invoice details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeInvoiceDetails = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedInvoice(null), 300);
  };

  const handleInvoiceCheckboxChange = (invoice, checked) => {
    if (checked) {
      setSelectedInvoices((prev) => [...prev, invoice]);
    } else {
      setSelectedInvoices((prev) =>
        prev.filter((inv) => inv._id !== invoice._id)
      );
    }
  };

  // Payment handlers
  const openRepaymentModal = (fullPayment = true) => {
    if (selectedInvoices.length === 0) {
      toast.error("Please select at least one invoice");
      return;
    }
    setIsFullPayment(fullPayment);
    setIsRepaymentModalOpen(true);
  };

  const closeRepaymentModal = () => {
    setIsRepaymentModalOpen(false);
  };

  const handleRepayment = async (paymentDetails) => {
    setLoading(true);
    try {
      const paymentData = {
        invoices: selectedInvoices.map((invoice) => ({
          invoiceId: invoice._id,
          amount: isFullPayment
            ? invoice.balanceToReceive
            : parseFloat(paymentDetails.paymentAmounts[invoice._id]),
        })),
        bankId: paymentDetails.bankId,
        paymentDate: paymentDetails.paymentDate,
        isFullPayment,
      };

      const response = await repayInvoices(paymentData);
      const data = response.data;

      if (data.success) {
        fetchInvoices();
        setSelectedInvoices([]);
        closeRepaymentModal();
        toast.success("Payment processed successfully");
      } else {
        console.error("Failed to process payment:", data.message);
        toast.error("Failed to process payment: " + data.message);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Error processing payment");
    } finally {
      setLoading(false);
    }
  };

  // Expiry date handlers
  const openUpdateExpDateModal = (invoice) => {
    setInvoiceToUpdateExpDate(invoice);
    setIsUpdateExpDateModalOpen(true);
  };

  const closeUpdateExpDateModal = () => {
    closeInvoiceDetails();
    setIsUpdateExpDateModalOpen(false);
    setTimeout(() => setInvoiceToUpdateExpDate(null), 300);
  };

  const handleUpdateExpDate = async (invoiceId, newExpDate) => {
    setLoading(true);
    try {
      const response = await updateInvoiceExpDate(invoiceId, newExpDate);
      const data = response.data;

      if (data.success) {
        fetchInvoices();
        closeUpdateExpDateModal();

        if (selectedInvoice && selectedInvoice._id === invoiceId) {
          handleInvoiceSelect(invoiceId);
        }

        toast.success("Invoice expiry date updated successfully");
      } else {
        console.error("Failed to update expiry date:", data.message);
        toast.error("Failed to update expiry date: " + data.message);
      }
    } catch (error) {
      console.error("Error updating expiry date:", error);
      toast.error("Error updating expiry date");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpDateFromDetails = () => {
    if (selectedInvoice) {
      setIsModalOpen(false);
      setTimeout(() => {
        openUpdateExpDateModal(selectedInvoice);
      }, 300);
    }
  };

  // Filter handlers
  const resetFilters = async () => {
    // These setters should be passed from the main component
    const {
      setStartDate,
      setEndDate,
      setShowOverdueOnly,
      setShowPaymentClearedOnly,
      setShowPendingOnly,
      setShowCancelledOnly,
    } = invoiceLogic;

    setStartDate("");
    setEndDate("");
    setShowOverdueOnly(false);
    setShowPaymentClearedOnly(false);
    setShowPendingOnly(false);
    setShowCancelledOnly(false);
    setSelectedCustomer(null);
    setCurrentPage(1);
    await fetchStats();
  };

  // Edit invoice handler
  const handleEditInvoice = async (invoice) => {
    try {
      setLoading(true);
      const response = await fetchInvDetails(invoice._id);
      
      if (!response.data || !response.data.success) {
        throw new Error("Failed to fetch invoice details");
      }
      
      const detailedInvoice = response.data.invoice;
      setEditingInvoice(detailedInvoice);
      setIsEditMode(true);

      setSelectedCustomerForInvoice(detailedInvoice.customer);
      setInvoiceDate(
        detailedInvoice.date
          ? new Date(detailedInvoice.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setDiscount(detailedInvoice.discount || 0);
      setVatRate(detailedInvoice.vatRate || 5);

      if (detailedInvoice.products && detailedInvoice.products.length > 0) {
        const formattedProducts = detailedInvoice.products.map((item) => {
          const product = item.product || {};
          
          return {
            _id: product._id,
            name: product.name || "Unknown Product",
            code: product.code || "",
            sellingPrice: item.price || 0,
            quantity: item.quantity || 0,
            note: item.note || "",
            purchasePrice: item.purchasePrice || product.purchasePrice || 0,
            selectedBatch: item.batchId 
              ? { _id: item.batchId }
              : (product.purchasePricebatch && product.purchasePricebatch.length > 0)
                ? {
                    _id: product.purchasePricebatch[0]._id,
                    purchasePrice: product.purchasePricebatch[0].purchasePrice,
                    stock: product.purchasePricebatch[0].stock
                  }
                : null
          };
        });
        
        setSelectedProducts(formattedProducts);
      } else {
        setSelectedProducts([]);
      }
      
      if (detailedInvoice.services && detailedInvoice.services.length > 0) {
        const formattedServices = detailedInvoice.services.map((item) => {
          const service = item.service || {};
          
          return {
            _id: service._id,
            name: service.name || "Unknown Service",
            code: service.code || "",
            price: item.price || 0,
            quantity: item.quantity || 0,
            note: item.note || "",
          };
        });
        
        setSelectedServices(formattedServices);
      } else {
        setSelectedServices([]);
      }

      // Add missing credits loading logic
      if (detailedInvoice.credits && detailedInvoice.credits.length > 0) {
        const formattedCredits = detailedInvoice.credits.map((item) => {
          return {
            _id: item._id || `credit-${Date.now()}-${Math.random()}`,
            title: item.title || "Credit",
            amount: item.amount || 0,
            note: item.note || "",
            additionalNote: item.additionalNote || "",
          };
        });
        
        setSelectedCredits(formattedCredits);
      } else {
        setSelectedCredits([]);
      }

      setView("create");
    } catch (error) {
      console.error("Error fetching invoice details for editing:", error);
      toast.error("Error loading invoice details: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Product handlers
  const handleProductSelect = (product) => {
    const newKey = getUniqueKey();
    const exists = selectedProducts.some((p) => p._selectedKey === newKey);
    if (!exists) {
      const newProduct = {
        ...product,
        quantity: product.quantity || 1,
        note: product.name || "",
        selectedBatch: product.selectedBatch,
        purchasePrice: product.purchasePrice || 0,
        _selectedKey: newKey,
        creationIndex: creationOrder.length,
      };

      setSelectedProducts([newProduct, ...selectedProducts]);
      setCreationOrder(prev => [...prev, { key: newKey, type: 'product' }]);

      setTimeout(() => {
        const noteInput = noteInputRefs.current[newKey];
        if (noteInput) {
          noteInput.focus();
          noteInput.select();
        }
      }, 100);
    }
  };

  const handleProductQuantityChange = (productId, quantity) => {
    setSelectedProducts(
      selectedProducts.map((p) => {
        const matchKey = p._selectedKey || p._id;
        return matchKey === productId ? { ...p, quantity: parseInt(quantity) || 0 } : p;
      })
    );
  };

  const handleProductPriceChange = (productId, price) => {
    setSelectedProducts(
      selectedProducts.map((p) => {
        const matchKey = p._selectedKey || p._id;
        return matchKey === productId ? { ...p, sellingPrice: parseFloat(price) || 0 } : p;
      })
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => {
      const matchKey = p._selectedKey || p._id;
      return matchKey !== productId;
    }));
  };

  const handleProductNoteChange = (productId, note, field, value) => {
    setSelectedProducts(
      selectedProducts.map((p) => {
        const matchKey = p._selectedKey || p._id;
        if (matchKey === productId) {
          if (field && value !== undefined) {
            // Handle specific field updates (like showAdditionalNote, additionalNote)
            return { ...p, [field]: value };
          } else {
            // Handle main note update
            return { ...p, note };
          }
        }
        return p;
      })
    );
  };

  // Service handlers
  const handleServiceSelect = (service) => {
    const newKey = getUniqueKey();
    const newService = {
      ...service, 
      quantity: 1, 
      note: service.name || "",
      _selectedKey: newKey,
      uniqueId: Date.now() + Math.random(),
      creationIndex: creationOrder.length,
    };

    setSelectedServices([newService, ...selectedServices]);
    setCreationOrder(prev => [...prev, { key: newKey, type: 'service' }]);

    setTimeout(() => {
      const noteInput = noteInputRefs.current[newKey];
      if (noteInput) {
        noteInput.focus();
        noteInput.select();
      }
    }, 100);
  };

  const handleServiceQuantityChange = (serviceId, quantity) => {
    setSelectedServices(
      selectedServices.map((s) => {
        const matchKey = s._selectedKey || s.uniqueId || s._id;
        return matchKey === serviceId ? { ...s, quantity: parseInt(quantity) || 0 } : s;
      })
    );
  };

  const handleServicePriceChange = (serviceId, value) => {
    setSelectedServices(
      selectedServices.map((s) => {
        const matchKey = s._selectedKey || s.uniqueId || s._id;
        return matchKey === serviceId ? { ...s, price: parseFloat(value) || 0 } : s;
      })
    );
  };

  const handleServiceNoteChange = (serviceId, note, field, value) => {
    setSelectedServices(
      selectedServices.map((s) => {
        const matchKey = s._selectedKey || s.uniqueId || s._id;
        if (matchKey === serviceId) {
          if (field && value !== undefined) {
            // Handle specific field updates (like showAdditionalNote, additionalNote)
            return { ...s, [field]: value };
          } else {
            // Handle main note update
            return { ...s, note };
          }
        }
        return s;
      })
    );
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter((s) => {
      const matchKey = s._selectedKey || s.uniqueId || s._id;
      return matchKey !== serviceId;
    }));
  };

  // Credit handlers
  const handleCreditAdd = (creditData) => {
    const newKey = getUniqueKey();
    const newCredit = {
      ...creditData,
      _selectedKey: newKey,
      creationIndex: creationOrder.length,
    };

    setSelectedCredits([newCredit, ...selectedCredits]);
    setCreationOrder(prev => [...prev, { key: newKey, type: 'credit' }]);

    setTimeout(() => {
      const noteInput = noteInputRefs.current[newKey];
      if (noteInput) {
        noteInput.focus();
        noteInput.select();
      }
    }, 100);
  };

  const handleCreditChange = (creditId, field, value) => {
    setSelectedCredits(
      selectedCredits.map((c) => {
        const matchKey = c._selectedKey || c._id;
        return matchKey === creditId ? { ...c, [field]: value } : c;
      })
    );
  };

  const handleRemoveCredit = (creditId) => {
    setSelectedCredits(selectedCredits.filter((c) => {
      const matchKey = c._selectedKey || c._id;
      return matchKey !== creditId;
    }));
  };

  // Form handlers
  const handleEmptyRowSearch = (rowId, searchTerm) => {
    setEmptyRows(
      emptyRows.map((row) => (row.id === rowId ? { ...row, searchTerm } : row))
    );
  };

  const handleRemoveEmptyRow = (rowId) => {
    if (emptyRows.length > 1) {
      setEmptyRows(emptyRows.filter((row) => row.id !== rowId));
    }
  };

  const handleEmptyRowItemSelect = (rowId, item) => {
    if (itemType === 'product') {
      if (item.purchasePricebatch && item.purchasePricebatch.length > 0) {
        setSelectedProductForBatch(item);
        setPendingRowId(rowId);
        setBatchModalOpen(true);
      } else {
        handleProductSelect(item);
        setEmptyRows((prev) => [
          ...prev.filter((r) => r.id !== rowId),
          { id: uuidv4(), searchTerm: "" },
        ]);
      }
    } else if (itemType === 'service') {
      handleServiceSelect(item);
      setEmptyRows((prev) => [
        ...prev.filter((r) => r.id !== rowId),
        { id: uuidv4(), searchTerm: "" },
      ]);
    } else if (itemType === 'credit') {
      handleCreditSelect(item);
      setEmptyRows((prev) => [
        ...prev.filter((r) => r.id !== rowId),
        { id: uuidv4(), searchTerm: "" },
      ]);
    }
  };

  // Add credit select handler
  const handleCreditSelect = (credit) => {
    const newKey = getUniqueKey();
    const newCredit = {
      ...credit,
      note: credit.description || credit.title || "",
      _selectedKey: newKey,
      creationIndex: creationOrder.length,
    };

    setSelectedCredits([newCredit, ...selectedCredits]);
    setCreationOrder(prev => [...prev, { key: newKey, type: 'credit' }]);

    // Auto-focus on the note input field for the newly added credit
    setTimeout(() => {
      const noteInput = noteInputRefs.current[newKey];
      if (noteInput) {
        noteInput.focus();
        noteInput.select();
      }
    }, 100);
  };

  const handleBatchSelect = (batch, quantity) => {
    if (selectedProductForBatch && pendingRowId) {
      const productWithBatch = {
        ...selectedProductForBatch,
        quantity: quantity,
        selectedBatch: batch,
        purchasePrice: batch.purchasePrice || 0
      };
      
      handleProductSelect(productWithBatch);
      
      setEmptyRows((prev) => [
        ...prev.filter((r) => r.id !== pendingRowId),
        { id: uuidv4(), searchTerm: "" },
      ]);
    }
    
    setBatchModalOpen(false);
    setSelectedProductForBatch(null);
    setPendingRowId(null);
  };

  // Create/Update invoice handler
  const handleCreateInvoice = async () => {
    const trimmedDescription = description.trim();

    if (!selectedCustomerForInvoice) {
      setError("Please select a customer");
      toast.error("Please select a customer");
      return;
    }

    if (selectedProducts.length === 0 && selectedServices.length === 0 && selectedCredits.length === 0) {
      setError("Please select at least one product, service, or credit");
      toast.error("Please select at least one product, service, or credit");
      return;
    }

    const productTotal = selectedProducts.reduce(
      (sum, product) => sum + product.sellingPrice * product.quantity,
      0
    );

    const serviceTotal = selectedServices.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0
    );

    const creditTotal = selectedCredits.reduce(
      (sum, credit) => sum + (credit.amount || 0),
      0
    );

    const grossAmount = productTotal + serviceTotal;
    const netAmount = grossAmount - creditTotal;
    const vatAmount = netAmount * (vatRate / 100);
    const subtotal = netAmount + vatAmount;
    const finalTotal = Math.max(0, subtotal - discount);

    const productsForInvoice = selectedProducts.map((p) => ({
      product: p._id,
      quantity: p.quantity,
      price: p.sellingPrice,
      purchasePrice: p.purchasePrice || 0,
      note: p.note,
      additionalNote: p.additionalNote,
      batchId: p.selectedBatch?._id
    }));

    const servicesForInvoice = selectedServices.map((s) => ({
      service: s._id,
      quantity: s.quantity,
      price: s.price,
      note: s.note,
      additionalNote: s.additionalNote,
    }));

    const creditsForInvoice = selectedCredits.map((c) => ({
      title: c.title,
      amount: c.amount,
      note: c.note,
      additionalNote: c.additionalNote,
    }));

    const invoiceData = {
  customer: selectedCustomerForInvoice._id,
  products: productsForInvoice,
  services: servicesForInvoice,
  credits: creditsForInvoice,
  netAmount,
  vatRate,
  vatAmount,
  subtotal,
  total: finalTotal,
  date: invoiceDate,
  lpo,
  description: trimmedDescription,
  discount,
    };

    setLoading(true);
    try {
      if (isEditMode && editingInvoice) {
        await updateInvoice(editingInvoice._id, invoiceData);
        toast.success("Invoice Updated Successfully");
      } else {
        await createInvoiceDirectly(invoiceData);
        toast.success("Invoice Created Successfully");
      }
      setView("list");
      fetchInvoices();
      fetchStats();
      resetInvoiceForm();
    } catch (err) {
      setError(err.response?.data.message);
      toast.error(err.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Form reset handler
  const resetInvoiceForm = () => {
  setSelectedCustomerForInvoice(null);
  setSelectedProducts([]);
  setSelectedServices([]);
  setSelectedCredits([]);
  setInvoiceDate(new Date().toISOString().split("T")[0]);
  setLpo("");
  setError("");
  setDescription("");
  setDiscount(0);
  setEditingInvoice(null);
  setIsEditMode(false);
  setItemType('service');
  setEmptyRows([{ id: uuidv4(), searchTerm: "", type: 'service' }]);
  setCreationOrder([]);
  };

  return {
    // Customer handlers
    handleCustomerSelect,
    handleClearCustomer,
    handleCustomerSelectForInvoice,
    
    // Pagination
    handlePageChange,
    
    // Invoice handlers
    handleInvoiceSelect,
    closeInvoiceDetails,
    handleInvoiceCheckboxChange,
    handleEditInvoice,
    
    // Payment handlers
    openRepaymentModal,
    closeRepaymentModal,
    handleRepayment,
    
    // Expiry date handlers
    openUpdateExpDateModal,
    closeUpdateExpDateModal,
    handleUpdateExpDate,
    handleUpdateExpDateFromDetails,
    
    // Filter handlers
    resetFilters,
    
    // Product handlers
    handleProductSelect,
    handleProductQuantityChange,
    handleProductPriceChange,
    handleRemoveProduct,
    handleProductNoteChange,
    
    // Service handlers
    handleServiceSelect,
    handleServiceQuantityChange,
    handleServicePriceChange,
    handleServiceNoteChange,
    handleRemoveService,
    
    // Credit handlers
    handleCreditAdd,
    handleCreditChange,
    handleRemoveCredit,
    handleCreditSelect,
    
    // Form handlers
    handleEmptyRowSearch,
    handleRemoveEmptyRow,
    handleEmptyRowItemSelect,
    handleBatchSelect,
    handleCreateInvoice,
    resetInvoiceForm,
  };
};