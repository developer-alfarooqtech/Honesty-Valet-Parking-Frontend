import React, { useRef, useEffect, useMemo } from "react";
import { FileText, Briefcase, Package, Trash2, Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import CustomerSelector from "../SalesOrder_comp/CustomerSelector";
import InlineItemSelector from "./InlineItemSelector";
import BatchSelectionModal from "../SalesOrder_comp/BatchSelectionModal";
const InvoiceCreationForm = ({
  // ...existing code...
  isEditMode,
  editingInvoice,
  selectedCustomerForInvoice,
  handleCustomerSelectForInvoice,
  invoiceDate,
  setInvoiceDate,
  lpo,
  setLpo,
  itemType,
  setItemType,
  selectedProducts,
  selectedServices,
  selectedCredits,
  creationOrder,
  inlineInsert,
  emptyRows,
  handleEmptyRowSearch,
  handleEmptyRowItemSelect,
  handleRemoveEmptyRow,
  handleAddLineBelow,
  handleInlineInsertSearch,
  handleInlineItemSelect,
  handleCancelInlineInsert,
  handleInlineTypeChange,
  handleProductNoteChange,
  handleServiceNoteChange,
  handleProductQuantityChange,
  handleServiceQuantityChange,
  handleProductPriceChange,
  handleServicePriceChange,
  handleRemoveProduct,
  handleRemoveService,
  handleCreditAdd,
  handleCreditChange,
  handleRemoveCredit,
  discount,
  setDiscount,
  vatRate,
  calculateTotal,
  loading,
  handleCreateInvoice,
  setView,
  resetInvoiceForm,
  noteInputRefs,
  batchModalOpen,
  setBatchModalOpen,
  selectedProductForBatch,
  setSelectedProductForBatch,
  pendingRowId,
  setPendingRowId,
  handleBatchSelect,
}) => {
  // Refs for keyboard navigation
  const customerSectionRef = useRef(null);
  const productServiceSectionRef = useRef(null);
  const submitButtonRef = useRef(null);
  const dateInputRef = useRef(null);

  // Prefill LPO when editing
  useEffect(() => {
    if (isEditMode && editingInvoice && editingInvoice.lpo) {
      setLpo(editingInvoice.lpo);
    }
  }, [isEditMode, editingInvoice, setLpo]);

  // Keyboard navigation handler
  const handleFormKeyDown = (e) => {
    switch (e.key) {
      case 'F1':
        e.preventDefault();
        const customerInput = customerSectionRef.current?.querySelector('input');
        if (customerInput) customerInput.focus();
        break;
      case 'F2':
        e.preventDefault();
        dateInputRef.current?.focus();
        break;
      case 'F3':
        e.preventDefault();
        productServiceSectionRef.current?.querySelector('input')?.focus();
        break;
      case 'F4':
        e.preventDefault();
        submitButtonRef.current?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        setView("list");
        resetInvoiceForm();
        break;
      default:
        break;
    }
  };

  // Auto-focus management
  useEffect(() => {
    setTimeout(() => {
      dateInputRef.current?.focus();
    }, 100);
  }, []);

  const getItemKey = (item = {}) => item._selectedKey || item.uniqueId || item._id;

  const orderedItems = useMemo(() => {
    const lookup = new Map();
    selectedProducts.forEach((product) => {
      lookup.set(getItemKey(product), { item: product, type: "product" });
    });
    selectedServices.forEach((service) => {
      lookup.set(getItemKey(service), { item: service, type: "service" });
    });
    selectedCredits.forEach((credit) => {
      lookup.set(getItemKey(credit), { item: credit, type: "credit" });
    });

    const seen = new Set();
    const ordered = [];

    creationOrder.forEach((entry) => {
      const record = lookup.get(entry.key);
      if (record) {
        seen.add(entry.key);
        ordered.push({ key: entry.key, type: entry.type || record.type, item: record.item });
      }
    });

    const appendMissing = (collection, type) => {
      collection.forEach((entry) => {
        const key = getItemKey(entry);
        if (!seen.has(key)) {
          seen.add(key);
          ordered.push({ key, type, item: entry });
        }
      });
    };

    appendMissing(selectedProducts, "product");
    appendMissing(selectedServices, "service");
    appendMissing(selectedCredits, "credit");

    return ordered;
  }, [creationOrder, selectedProducts, selectedServices, selectedCredits]);

  const inlineInsertPosition = useMemo(() => {
    if (!inlineInsert) {
      return null;
    }
    const desiredIndex =
      typeof inlineInsert.index === "number" ? inlineInsert.index : orderedItems.length;
    return Math.min(Math.max(desiredIndex, 0), orderedItems.length);
  }, [inlineInsert, orderedItems]);

  const inlineInsertMeta = inlineInsert && inlineInsertPosition !== null
    ? { ...inlineInsert, index: inlineInsertPosition }
    : null;

  const defaultRowCount = emptyRows.length;

  const renderEmptyRow = (row) => {
    const canRemoveRow = defaultRowCount > 1;

    return (
      <tr
        key={`empty-row-${row.id}`}
        className="transition-colors duration-150 border-t-2 border-blue-200 hover:bg-gray-50"
      >
        <td className="px-4 py-4">
          {itemType === "credit" ? (
            <div className="space-y-2">
              <button
                onClick={() => {
                  const newCredit = {
                    _id: `credit-${Date.now()}`,
                    title: "Credit",
                    amount: 0,
                    note: "",
                    additionalNote: "",
                  };
                  handleEmptyRowItemSelect(row.id, newCredit);
                }}
                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm bg-red-50 hover:bg-red-100 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-red-700 font-medium transition-colors"
              >
                + Add Credit
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <InlineItemSelector
                value={row.searchTerm}
                onChange={(value) => handleEmptyRowSearch(row.id, value)}
                onItemSelect={(item) => handleEmptyRowItemSelect(row.id, item)}
                isProduct={itemType === "product"}
                itemType={itemType}
                placeholder={`Search ${
                  itemType === "product" ? "products" : "services"
                }...`}
              />
            </div>
          )}
        </td>
        <td className="px-4 py-4">
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"></div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="w-20 px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"></div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="w-24 px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"></div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"></div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-center">
          {canRemoveRow && (
            <button
              onClick={() => handleRemoveEmptyRow(row.id)}
              className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-150"
            >
              <X size={16} />
            </button>
          )}
        </td>
      </tr>
    );
  };

  const renderInlineInsertRow = () => {
    if (!inlineInsertMeta) {
      return null;
    }

    const inlineType = inlineInsertMeta.type || itemType;
    const typeLabel =
      inlineType === "product"
        ? "Product"
        : inlineType === "service"
        ? "Service"
        : "Credit";
    const isCreditType = inlineType === "credit";

    const addInlineCredit = () => {
      handleInlineItemSelect({
        _id: `inline-credit-${Date.now()}`,
        title: "Credit",
        amount: 0,
        note: "",
        additionalNote: "",
      });
    };

    const typeOptions = [
      { value: "service", label: "Service", icon: <Briefcase size={14} /> },
      { value: "product", label: "Product", icon: <Package size={14} /> },
      { value: "credit", label: "Credit", icon: <Trash2 size={14} /> },
    ];

    return (
      <tr
        key={`inline-insert-${inlineInsertMeta.index}`}
        className="bg-blue-50/70 border border-blue-200 animate-pulse"
      >
        <td className="px-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-700">
                Insert {typeLabel} below
              </span>
              <div className="flex items-center gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInlineTypeChange(option.value)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors ${
                      inlineType === option.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleCancelInlineInsert}
                  className="p-2 text-blue-500 hover:text-blue-700"
                  title="Cancel inline insert"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            {isCreditType ? (
              <button
                onClick={addInlineCredit}
                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm bg-red-50 hover:bg-red-100 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-red-700 font-medium transition-colors"
              >
                + Add Credit
              </button>
            ) : (
              <InlineItemSelector
                value={inlineInsertMeta.searchTerm || ""}
                onChange={handleInlineInsertSearch}
                onItemSelect={handleInlineItemSelect}
                isProduct={inlineType === "product"}
                itemType={inlineType}
                placeholder={`Search ${
                  inlineType === "product" ? "products" : "services"
                }...`}
              />
            )}
            <p className="text-xs text-blue-500">
              This temporary row disappears after selecting an item.
            </p>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-100"></div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="w-20 px-3 py-2 border border-blue-200 rounded-lg bg-blue-100"></div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="w-24 px-3 py-2 border border-blue-200 rounded-lg bg-blue-100"></div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-100"></div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap text-center">
          <span className="text-xs font-medium text-blue-500">Inline Insert</span>
        </td>
      </tr>
    );
  };

  const renderInlineSlot = (position) => {
    if (!inlineInsertMeta || inlineInsertMeta.index !== position) {
      return null;
    }
    return renderInlineInsertRow();
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-2xl border border-blue-200 p-8 animate-fade-in"
      onKeyDown={handleFormKeyDown}
      tabIndex={-1}
    >
      <div className="flex items-center mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg mr-4">
          <FileText size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-blue-800">
            {isEditMode ? "Update Invoice" : "Create New Invoice"}
          </h2>
          <p className="text-blue-600 text-sm">
            {isEditMode 
              ? "Modify the invoice details and save changes" 
              : "Fill in the details to create a new invoice"
            }
          </p>
          <div className="mt-2 text-xs text-blue-500">
            <span className="font-medium">Keyboard shortcuts:</span> 
            <span className="ml-2">F1: Customer</span>
            <span className="ml-2">F2: Date</span>
            <span className="ml-2">F3: Products/Services</span>
            <span className="ml-2">F4: Submit</span>
            <span className="ml-2">Esc: Cancel</span>
          </div>
        </div>
      </div>

      {/* Customer Selection Section */}
      <div className="mb-8" ref={customerSectionRef} tabIndex={-1}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          Customer Information
          <span className="ml-2 text-xs text-blue-500 font-normal">(F1)</span>
          <span className="text-red-500 ml-1">*</span>
        </h3>
        <CustomerSelector
          onCustomerSelect={handleCustomerSelectForInvoice}
          selectedCustomer={selectedCustomerForInvoice}
        />
      </div>

      {/* Invoice Date & LPO Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          Invoice Date & LPO
          <span className="ml-2 text-xs text-blue-500 font-normal">(F2)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="invoice-date" className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Date
            </label>
            <input
              id="invoice-date"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 transition-all duration-200"
              ref={dateInputRef}
            />
          </div>
          <div>
            <label htmlFor="lpo" className="block text-sm font-medium text-gray-700 mb-2">
              LPO
            </label>
            <input
              id="lpo"
              type="text"
              value={lpo || ""}
              onChange={(e) => setLpo(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 transition-all duration-200 ${isEditMode ? '' : ''}`}
              placeholder="Enter LPO number/reference"
              disabled={false}
            />
          </div>
        </div>
      </div>

      {/* Products & Services Section */}
      <div className="mb-8" ref={productServiceSectionRef} tabIndex={-1}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg">
          <div className="border-b border-blue-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Items & Credits
                  <span className="ml-2 text-xs text-blue-500 font-normal">(F3)</span>
                  <span className="text-red-500 ml-1">*</span>
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  Choose item type and add details below
                </p>
              </div>
              {/* Item Type Selection */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-blue-200">
                <button
                  type="button"
                  onClick={() => setItemType('service')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    itemType === 'service'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Briefcase size={16} className="inline mr-1" />
                  Service
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('product')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    itemType === 'product'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Package size={16} className="inline mr-1" />
                  Product
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('credit')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    itemType === 'credit'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Trash2 size={16} className="inline mr-1" />
                  Credit
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Items & Credits Table */}
            <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Price/Amount
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-blue-800 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {renderInlineSlot(0)}
                    {orderedItems.map(({ key: itemKey, type: entryType, item }, index) => {
                      const isProduct = entryType === "product";
                      const isCredit = entryType === "credit";

                      return (
                        <React.Fragment key={`ordered-${itemKey}`}>
                          <tr
                            className={`hover:bg-gray-50 transition-colors duration-150 ${
                              isCredit ? "bg-red-50 border-l-4 border-red-500" : ""
                            }`}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {isProduct ? (
                                    <Package size={16} className="text-blue-500" />
                                  ) : isCredit ? (
                                    <Trash2 size={16} className="text-red-500" />
                                  ) : (
                                    <Briefcase size={16} className="text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-800 font-medium">
                                    {item.name || item.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {isCredit ? "Credit Item" : `Code: ${item.code}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {isCredit ? (
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={item.note || ""}
                                      onChange={(e) => handleCreditChange(itemKey, "note", e.target.value)}
                                      placeholder="Note (optional)..."
                                      className="flex-1 px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 text-gray-700 placeholder-gray-400"
                                    />
                                    {!item.showAdditionalNote && (
                                      <button
                                        type="button"
                                        onClick={() => handleCreditChange(itemKey, "showAdditionalNote", true)}
                                        className="flex-shrink-0 p-2 text-red-600 rounded-lg transition-colors text-xs"
                                        title="Add desc"
                                      >
                                        add desc
                                      </button>
                                    )}
                                  </div>
                                  {item.showAdditionalNote && (
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        value={item.additionalNote || ""}
                                        onChange={(e) => handleCreditChange(itemKey, "additionalNote", e.target.value)}
                                        placeholder="Additional note (optional)..."
                                        className="flex-1 px-3 py-2 border border-red-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 text-gray-700 placeholder-gray-400"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleCreditChange(itemKey, "showAdditionalNote", false)}
                                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                        title="Hide additional note"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={item.note || ""}
                                      onChange={(e) => {
                                        if (isProduct) {
                                          handleProductNoteChange(itemKey, e.target.value);
                                        } else {
                                          handleServiceNoteChange(itemKey, e.target.value);
                                        }
                                      }}
                                      placeholder="Add description..."
                                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-700 placeholder-gray-400"
                                      ref={(el) => (noteInputRefs.current[itemKey] = el)}
                                    />
                                    {!item.showAdditionalNote && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isProduct) {
                                            handleProductNoteChange(itemKey, item.note, "showAdditionalNote", true);
                                          } else {
                                            handleServiceNoteChange(itemKey, item.note, "showAdditionalNote", true);
                                          }
                                        }}
                                        className="flex-shrink-0 p-2 text-blue-600 rounded-lg transition-colors text-xs"
                                        title="Add desc"
                                      >
                                        add desc
                                      </button>
                                    )}
                                  </div>
                                  {item.showAdditionalNote && (
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        value={item.additionalNote || ""}
                                        onChange={(e) => {
                                          if (isProduct) {
                                            handleProductNoteChange(itemKey, item.note, "additionalNote", e.target.value);
                                          } else {
                                            handleServiceNoteChange(itemKey, item.note, "additionalNote", e.target.value);
                                          }
                                        }}
                                        placeholder="Additional note (optional)..."
                                        className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-700 placeholder-gray-400"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isProduct) {
                                            handleProductNoteChange(itemKey, item.note, "showAdditionalNote", false);
                                          } else {
                                            handleServiceNoteChange(itemKey, item.note, "showAdditionalNote", false);
                                          }
                                        }}
                                        className="flex-shrink-0 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                        title="Hide additional note"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {isCredit ? (
                                <div className="w-20 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-center text-gray-500">
                                  N/A
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  min="1"
                                  max={
                                    isProduct && item.selectedBatch
                                      ? item.selectedBatch.stock
                                      : 999
                                  }
                                  value={item.quantity}
                                  onChange={(e) =>
                                    isProduct
                                      ? handleProductQuantityChange(itemKey, e.target.value)
                                      : handleServiceQuantityChange(itemKey, e.target.value)
                                  }
                                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-700"
                                />
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  isCredit
                                    ? item.amount
                                    : isProduct
                                    ? item.sellingPrice
                                    : item.price
                                }
                                onChange={(e) => {
                                  if (isCredit) {
                                    handleCreditChange(itemKey, "amount", parseFloat(e.target.value) || 0);
                                  } else if (isProduct) {
                                    handleProductPriceChange(itemKey, e.target.value);
                                  } else {
                                    handleServicePriceChange(itemKey, e.target.value);
                                  }
                                }}
                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-700"
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className={`text-lg font-bold ${
                                isCredit ? "text-red-600" : "text-gray-800"
                              }`}>
                                {isCredit ? "-" : ""}
                                {(
                                  isCredit
                                    ? item.amount || 0
                                    : (isProduct ? item.sellingPrice : item.price) * item.quantity
                                ).toFixed(2)}{" "}
                                AED
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                {handleAddLineBelow && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddLineBelow(itemKey)}
                                    className="inline-flex items-center p-2 border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors duration-150"
                                    title="Add line below"
                                    aria-label="Add line below"
                                  >
                                    <Plus size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    if (isProduct) {
                                      handleRemoveProduct(itemKey);
                                    } else if (isCredit) {
                                      handleRemoveCredit(itemKey);
                                    } else {
                                      handleRemoveService(itemKey);
                                    }
                                  }}
                                  className="inline-flex items-center p-2 border border-red-300 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors duration-150"
                                  title="Remove line"
                                  aria-label="Remove line"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {renderInlineSlot(index + 1)}
                        </React.Fragment>
                      );
                    })}

                    {/* Empty Rows for Search */}
                    {emptyRows.map((row) => renderEmptyRow(row))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          Invoice Summary
          <span className="ml-2 text-xs text-blue-500 font-normal">(F4)</span>
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                Discount (AED)
              </label>
              <input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-700 transition-all duration-200"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VAT Rate
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                {vatRate}%
              </div>
            </div>
          </div>

          <div className="border-t border-blue-200 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>{calculateTotal().toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>VAT ({vatRate}%):</span>
                <span>{(calculateTotal() * (vatRate / 100)).toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Discount:</span>
                <span>-{discount.toFixed(2)} AED</span>
              </div>
              <div className="border-t border-blue-200 pt-3">
                <div className="flex justify-between text-xl font-bold text-blue-700">
                  <span>Total:</span>
                  <span>
                    {(calculateTotal() + (calculateTotal() * (vatRate / 100)) - discount).toFixed(2)} AED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            setView("list");
            resetInvoiceForm();
          }}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
        >
          Cancel
        </button>
        
        <button
          type="button"
          onClick={handleCreateInvoice}
          disabled={loading || !selectedCustomerForInvoice || (selectedProducts.length === 0 && selectedServices.length === 0)}
          ref={submitButtonRef}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            loading || !selectedCustomerForInvoice || (selectedProducts.length === 0 && selectedServices.length === 0)
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {isEditMode ? "Updating..." : "Creating..."}
            </div>
          ) : (
            <>
              {isEditMode ? "Update Invoice" : "Create Invoice"}
            </>
          )}
        </button>
      </div>

      {/* Batch Selection Modal */}
      <BatchSelectionModal
        isOpen={batchModalOpen}
        onClose={() => {
          setBatchModalOpen(false);
          setSelectedProductForBatch(null);
          setPendingRowId(null);
        }}
        product={selectedProductForBatch}
        onBatchSelect={handleBatchSelect}
      />
    </div>
  );
};

export default InvoiceCreationForm;