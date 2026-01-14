import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import {
  fetchInvDetails,
  repayInvoices,
  updateInvoiceExpDate,
  createInvoiceDirectly,
  updateInvoice,
  uploadInvoicesFile,
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
    selectedCustomers, setSelectedCustomers,
    isCustomerPickerOpen, setIsCustomerPickerOpen,
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
    isDuplicateMode, setIsDuplicateMode,
    duplicateSourceInvoice, setDuplicateSourceInvoice,
    itemType, setItemType,
    emptyRows, setEmptyRows,
    inlineInsert, setInlineInsert,
    creationOrder, setCreationOrder,
    isUpdateExpDateModalOpen, setIsUpdateExpDateModalOpen,
    invoiceToUpdateExpDate, setInvoiceToUpdateExpDate,
    batchModalOpen, setBatchModalOpen,
    selectedProductForBatch, setSelectedProductForBatch,
    pendingRowId, setPendingRowId,
    noteInputRefs,
    duplicateGuard,
    setIsImportModalOpen,
    setImportingInvoices,
    setImportProgress,
    setImportSummary,

    // Functions
    getUniqueKey,
    calculateTotal,
    fetchStats,
    fetchInvoices,
  } = invoiceLogic;

  const getItemKey = (item = {}) => item._selectedKey || item.uniqueId || item._id;

  const addToCreationOrder = (key, type, insertIndex = null) => {
    setCreationOrder((prev) => {
      if (prev.some((entry) => entry.key === key)) {
        return prev;
      }

      const entry = { key, type };

      if (typeof insertIndex === "number" && insertIndex >= 0 && insertIndex <= prev.length) {
        const updated = [...prev];
        updated.splice(insertIndex, 0, entry);
        return updated;
      }

      return [...prev, entry];
    });
  };

  const removeFromCreationOrder = (key) => {
    setCreationOrder((prev) => prev.filter((entry) => entry.key !== key));
  };

  const createEmptyRow = () => ({
    id: uuidv4(),
    searchTerm: "",
    insertAfterKey: null,
    type: null,
  });

  const getItemTypeByKey = (key) => {
    if (!key) {
      return null;
    }

    if (selectedProducts.some((product) => getItemKey(product) === key)) {
      return 'product';
    }
    if (selectedServices.some((service) => getItemKey(service) === key)) {
      return 'service';
    }
    if (selectedCredits.some((credit) => getItemKey(credit) === key)) {
      return 'credit';
    }
    return null;
  };

  const getOrderedItemsByType = (type) => {
    const source =
      type === 'product'
        ? selectedProducts
        : type === 'service'
        ? selectedServices
        : selectedCredits;

    const lookup = new Map();
    source.forEach((item) => {
      lookup.set(getItemKey(item), item);
    });

    const ordered = [];

    creationOrder.forEach((entry) => {
      if (entry.type !== type) {
        return;
      }
      const match = lookup.get(entry.key);
      if (match) {
        ordered.push(match);
        lookup.delete(entry.key);
      }
    });

    lookup.forEach((item) => {
      ordered.push(item);
    });

    return ordered;
  };

  // Customer handlers
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSelectedCustomers([]);
    setCurrentPage(1);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setSelectedCustomers([]);
    setCurrentPage(1);
  };

  const openCustomerPicker = () => setIsCustomerPickerOpen(true);

  const closeCustomerPicker = () => setIsCustomerPickerOpen(false);

  const handleApplyCustomerFilters = (customers = []) => {
    setSelectedCustomers(customers);
    setSelectedCustomer(null);
    setCurrentPage(1);
  };

  const handleRemoveCustomerFilter = (customerId) => {
    setSelectedCustomers((prev) => prev.filter((customer) => customer._id !== customerId));
    setCurrentPage(1);
  };

  const handleClearAllCustomers = () => {
    setSelectedCustomers([]);
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
      setShowWithLpoOnly,
      setShowWithoutLpoOnly,
    } = invoiceLogic;

    setStartDate("");
    setEndDate("");
    setShowOverdueOnly(false);
    setShowPaymentClearedOnly(false);
    setShowPendingOnly(false);
    setShowCancelledOnly(false);
    setShowWithLpoOnly(false);
    setShowWithoutLpoOnly(false);
    setSelectedCustomer(null);
    setSelectedCustomers([]);
    setCurrentPage(1);
    await fetchStats();
  };

  const populateInvoiceFormFromDetails = (detailedInvoice) => {
    if (!detailedInvoice) {
      return;
    }

    const updatedCreationOrder = [];

    setSelectedCustomerForInvoice(detailedInvoice.customer || null);
    setInvoiceDate(
      detailedInvoice.date
        ? new Date(detailedInvoice.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setDiscount(detailedInvoice.discount || 0);
    setVatRate(detailedInvoice.vatRate || 5);
    setLpo(detailedInvoice.lpo || "");
    setDescription(detailedInvoice.description || "");

    if (detailedInvoice.products && detailedInvoice.products.length > 0) {
      const formattedProducts = detailedInvoice.products.map((item) => {
        const product = item.product || {};
        const productKey = uuidv4();
        updatedCreationOrder.push({ key: productKey, type: 'product' });

        return {
          _id: product._id,
          _selectedKey: productKey,
          name: product.name || "Unknown Product",
          code: product.code || "",
          sellingPrice: item.price || 0,
          quantity: item.quantity || 0,
          note: item.note || "",
          additionalNote: item.additionalNote || "",
          purchasePrice: item.purchasePrice || product.purchasePrice || 0,
          selectedBatch: item.batchId
            ? { _id: item.batchId }
            : product.purchasePricebatch && product.purchasePricebatch.length > 0
              ? {
                  _id: product.purchasePricebatch[0]._id,
                  purchasePrice: product.purchasePricebatch[0].purchasePrice,
                  stock: product.purchasePricebatch[0].stock,
                }
              : null,
        };
      });

      setSelectedProducts(formattedProducts);
    } else {
      setSelectedProducts([]);
    }

    if (detailedInvoice.services && detailedInvoice.services.length > 0) {
      const formattedServices = detailedInvoice.services.map((item) => {
        const service = item.service || {};
        const serviceKey = uuidv4();
        updatedCreationOrder.push({ key: serviceKey, type: 'service' });

        return {
          _id: service._id,
          _selectedKey: serviceKey,
          name: service.name || "",
          code: service.code || "",
          price: item.price || 0,
          quantity: item.quantity || 0,
          note: item.note || "",
          additionalNote: item.additionalNote || "",
        };
      });

      setSelectedServices(formattedServices);
    } else {
      setSelectedServices([]);
    }

    if (detailedInvoice.credits && detailedInvoice.credits.length > 0) {
      const formattedCredits = detailedInvoice.credits.map((item) => {
        const creditKey = item._id || uuidv4();
        updatedCreationOrder.push({ key: creditKey, type: 'credit' });
        return {
          _id: item._id || creditKey,
          _selectedKey: creditKey,
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

    setCreationOrder(updatedCreationOrder);
    setError("");
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
      setIsDuplicateMode(false);
      setDuplicateSourceInvoice(null);
      populateInvoiceFormFromDetails(detailedInvoice);

      setView("create");
    } catch (error) {
      console.error("Error fetching invoice details for editing:", error);
      toast.error("Error loading invoice details: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateInvoice = async (invoice) => {
    try {
      setLoading(true);
      const response = await fetchInvDetails(invoice._id);

      if (!response.data || !response.data.success) {
        throw new Error("Failed to fetch invoice details");
      }

      const detailedInvoice = response.data.invoice;
      populateInvoiceFormFromDetails(detailedInvoice);
      setIsEditMode(false);
      setEditingInvoice(null);
      setIsDuplicateMode(true);
      setLpo("");
      setDuplicateSourceInvoice({
        _id: detailedInvoice._id,
        name: detailedInvoice.name,
        lpo: detailedInvoice.lpo || "",
      });

      setView("create");
      toast.success(`Duplicating ${detailedInvoice.name || 'invoice'}`);
    } catch (error) {
      console.error("Error preparing duplicate invoice:", error);
      toast.error("Unable to duplicate invoice: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const exitDuplicateMode = () => {
    setIsDuplicateMode(false);
    setDuplicateSourceInvoice(null);
  };

  // Product handlers
  const handleProductSelect = (product, options = {}) => {
    const { insertIndex = null } = options;
    const newKey = getUniqueKey();

    const newProduct = {
      ...product,
      quantity: product.quantity || 1,
      note: product.note || product.name || "",
      selectedBatch: product.selectedBatch,
      purchasePrice: product.purchasePrice || 0,
      _selectedKey: newKey,
    };

    setSelectedProducts((prevProducts) => [...prevProducts, newProduct]);
    addToCreationOrder(newKey, 'product', insertIndex);

    setTimeout(() => {
      const noteInput = noteInputRefs.current[newKey];
      if (noteInput) {
        noteInput.focus();
        noteInput.select();
      }
    }, 100);
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
    removeFromCreationOrder(productId);
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
  const handleServiceSelect = (service, options = {}) => {
    const { insertIndex = null } = options;
    const newKey = getUniqueKey();
    const newService = {
      ...service, 
      quantity: service.quantity || 1, 
      note: service.note || service.name || "",
      _selectedKey: newKey,
      uniqueId: Date.now() + Math.random(),
    };

    setSelectedServices((prevServices) => [...prevServices, newService]);
    addToCreationOrder(newKey, 'service', insertIndex);

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
    removeFromCreationOrder(serviceId);
  };

  // Credit handlers
  const handleCreditAdd = (creditData) => {
    const newKey = getUniqueKey();
    const newCredit = {
      ...creditData,
      _selectedKey: newKey,
    };

    setSelectedCredits((prevCredits) => [...prevCredits, newCredit]);
    addToCreationOrder(newKey, 'credit');

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
    removeFromCreationOrder(creditId);
  };

  // Form handlers
  const handleEmptyRowSearch = (rowId, searchTerm) => {
    setEmptyRows((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, searchTerm } : row))
    );
  };

  const handleRemoveEmptyRow = (rowId) => {
    setEmptyRows((prevRows) => {
      if (prevRows.length <= 1) {
        return prevRows;
      }
      return prevRows.filter((row) => row.id !== rowId);
    });
  };

  const replaceRowWithDefault = (rowId) => {
    setEmptyRows((prevRows) => {
      const remaining = prevRows.filter((row) => row.id !== rowId);
      return [...remaining, createEmptyRow()];
    });
  };

  const finalizeInsertContext = (context) => {
    if (!context) {
      return;
    }

    if (context.source === 'inline') {
      setInlineInsert(null);
    } else if (context.rowId) {
      replaceRowWithDefault(context.rowId);
    }
  };

  const getInsertOptions = (context = {}) => {
    if (typeof context.insertIndex === 'number') {
      return { insertIndex: context.insertIndex };
    }
    return {};
  };

  const startProductInsert = (product, context) => {
    const insertOptions = getInsertOptions(context);

    if (product.purchasePricebatch && product.purchasePricebatch.length > 0) {
      setSelectedProductForBatch({ ...product, _insertContext: context });
      if (context.source === 'default') {
        setPendingRowId(context.rowId);
      } else {
        setPendingRowId(null);
      }
      setBatchModalOpen(true);
      return;
    }

    handleProductSelect(product, insertOptions);
    finalizeInsertContext(context);
  };

  const startServiceInsert = (service, context) => {
    handleServiceSelect(service, getInsertOptions(context));
    finalizeInsertContext(context);
  };

  const startCreditInsert = (credit, context) => {
    handleCreditSelect(credit, getInsertOptions(context));
    finalizeInsertContext(context);
  };

  const handleEmptyRowItemSelect = (rowId, item) => {
    const context = {
      source: 'default',
      rowId,
      insertIndex: creationOrder.length,
    };

    if (itemType === 'product') {
      startProductInsert(item, context);
    } else if (itemType === 'service') {
      startServiceInsert(item, context);
    } else if (itemType === 'credit') {
      startCreditInsert(item, context);
    }
  };

  const handleAddLineBelow = (afterKey) => {
    if (!afterKey) {
      return;
    }

    const targetIndex = creationOrder.findIndex((entry) => entry.key === afterKey);
    if (targetIndex === -1) {
      return;
    }

    setInlineInsert({
      index: targetIndex + 1,
      type: itemType,
      searchTerm: "",
    });
  };

  const handleInlineInsertSearch = (value) => {
    setInlineInsert((prev) => (prev ? { ...prev, searchTerm: value } : prev));
  };

  const handleInlineTypeChange = (type) => {
    setInlineInsert((prev) => (
      prev
        ? { ...prev, type, searchTerm: type === 'credit' ? '' : prev.searchTerm }
        : prev
    ));
  };

  const handleCancelInlineInsert = () => {
    setInlineInsert(null);
  };

  const handleInlineItemSelect = (item) => {
    if (!inlineInsert) {
      return;
    }

    const context = {
      source: 'inline',
      rowId: null,
      insertIndex: typeof inlineInsert.index === 'number' ? inlineInsert.index : creationOrder.length,
    };

    const targetType = inlineInsert.type || itemType;

    if (targetType === 'product') {
      startProductInsert(item, context);
    } else if (targetType === 'service') {
      startServiceInsert(item, context);
    } else if (targetType === 'credit') {
      startCreditInsert(item, context);
    }
  };

  // Add credit select handler
  const handleCreditSelect = (credit, options = {}) => {
    const { insertIndex = null } = options;
    const newKey = getUniqueKey();
    const newCredit = {
      ...credit,
      quantity: 1,
      note: credit.note || credit.description || credit.title || "",
      _selectedKey: newKey,
    };

    setSelectedCredits((prevCredits) => [...prevCredits, newCredit]);
    addToCreationOrder(newKey, 'credit', insertIndex);

    setTimeout(() => {
      const noteInput = noteInputRefs.current[newKey];
      if (noteInput) {
        noteInput.focus();
        noteInput.select();
      }
    }, 100);
  };

  const handleBatchSelect = (batch, quantity) => {
    if (selectedProductForBatch) {
      const { _insertAfterKey, _insertContext, ...productData } = selectedProductForBatch;

      const productWithBatch = {
        ...productData,
        quantity,
        selectedBatch: batch,
        purchasePrice: batch.purchasePrice || 0,
      };

      let insertOptions = {};
      if (_insertContext) {
        insertOptions = getInsertOptions(_insertContext);
      } else if (_insertAfterKey) {
        const targetIndex = creationOrder.findIndex((entry) => entry.key === _insertAfterKey);
        if (targetIndex !== -1) {
          insertOptions = { insertIndex: targetIndex + 1 };
        }
      }

      handleProductSelect(productWithBatch, insertOptions);

      if (_insertContext) {
        finalizeInsertContext(_insertContext);
      } else if (pendingRowId) {
        replaceRowWithDefault(pendingRowId);
      }
    }

    setBatchModalOpen(false);
    setSelectedProductForBatch(null);
    setPendingRowId(null);
  };

  const openImportInvoicesModal = () => {
    setImportSummary(null);
    setImportProgress(0);
    setIsImportModalOpen(true);
  };

  const closeImportInvoicesModal = () => {
    setIsImportModalOpen(false);
  };

  const handleInvoicesImport = async (file) => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const allowedExtensions = [".csv", ".xls", ".xlsx"];
    const fileName = file.name?.toLowerCase() || "";
    const isValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      toast.error("Only .csv, .xls, or .xlsx files are supported");
      return;
    }

    const maxSizeMb = 5;
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`File must be smaller than ${maxSizeMb}MB`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setImportingInvoices(true);
    setImportProgress(0);
    setImportSummary(null);

    try {
      const response = await uploadInvoicesFile(formData, (event) => {
        if (!event?.total) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        setImportProgress(percent);
      });

      const data = response.data;
      const summary = data.summary || null;
      setImportSummary(summary);

      const failureMessage = summary?.failures?.[0]
        ? `Row ${summary.failures[0].rowNumber}: ${summary.failures[0].error}`
        : null;

      if (data.success) {
        toast.success(data.message || "Invoices imported successfully");
      } else {
        const message = failureMessage || data.message || "Some invoices failed to import";
        toast.error(message);
      }

      fetchInvoices();
      fetchStats();
    } catch (error) {
      const responseSummary = error.response?.data?.summary;
      const failure = responseSummary?.failures?.[0];
      const message =
        failure?.error
          ? `Row ${failure.rowNumber}: ${failure.error}`
          : error.response?.data?.message || "Failed to import invoices";

      toast.error(message);

      setImportSummary(
        responseSummary || {
          totalRows: 0,
          importedCount: 0,
          failedCount: 1,
          successes: [],
          failures: [
            {
              rowNumber: "-",
              error: message,
            },
          ],
        }
      );
    } finally {
      setImportingInvoices(false);
      setImportProgress(0);
    }
  };

  // Create/Update invoice handler
  const handleCreateInvoice = async () => {
    const trimmedDescription = description.trim();

    if (isDuplicateMode && duplicateGuard && !duplicateGuard.isReady) {
      const missingSummary = duplicateGuard.missingFields.join(" & ");
      const message = `Please update ${missingSummary} before saving the duplicate`;
      setError(message);
      toast.error(message);
      return;
    }

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

    const orderedProducts = getOrderedItemsByType('product');
    const orderedServices = getOrderedItemsByType('service');
    const orderedCredits = getOrderedItemsByType('credit');

    const productsForInvoice = orderedProducts.map((p) => ({
      product: p._id,
      quantity: p.quantity,
      price: p.sellingPrice,
      purchasePrice: p.purchasePrice || 0,
      note: p.note,
      additionalNote: p.additionalNote,
      batchId: p.selectedBatch?._id
    }));

    const servicesForInvoice = orderedServices.map((s) => ({
      service: s._id,
      quantity: s.quantity,
      price: s.price,
      note: s.note,
      additionalNote: s.additionalNote,
    }));

    const creditsForInvoice = orderedCredits.map((c) => ({
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
    setIsDuplicateMode(false);
    setDuplicateSourceInvoice(null);
    setItemType('service');
    setEmptyRows([createEmptyRow()]);
    setCreationOrder([]);
    setInlineInsert(null);
  };

  return {
    // Customer handlers
    handleCustomerSelect,
    handleClearCustomer,
    openCustomerPicker,
    closeCustomerPicker,
    handleApplyCustomerFilters,
    handleRemoveCustomerFilter,
    handleClearAllCustomers,
    handleCustomerSelectForInvoice,
    
    // Pagination
    handlePageChange,
    
    // Invoice handlers
    handleInvoiceSelect,
    closeInvoiceDetails,
    handleInvoiceCheckboxChange,
    handleEditInvoice,
    handleDuplicateInvoice,
    
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
    handleAddLineBelow,
    handleInlineInsertSearch,
    handleInlineItemSelect,
    handleInlineTypeChange,
    handleCancelInlineInsert,
    handleBatchSelect,
    handleCreateInvoice,
    exitDuplicateMode,
    resetInvoiceForm,
    openImportInvoicesModal,
    closeImportInvoicesModal,
    handleInvoicesImport,
  };
};