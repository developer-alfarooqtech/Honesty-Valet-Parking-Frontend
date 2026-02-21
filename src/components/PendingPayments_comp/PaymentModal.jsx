import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, CreditCard, DollarSign, FileText, Trash2 } from "lucide-react";
import { fetchAllBanks } from "../../service/bankServices";
import { applyPayment } from "../../service/pendingPaymentsService";
import toast from "react-hot-toast";
import CreditNoteSelectionModal from "./CreditNoteSelectionModal";

const PaymentModal = ({ payments, customer, onClose, onSuccess }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [globalDescription, setGlobalDescription] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [useCustomerBalance, setUseCustomerBalance] = useState(false);
  const [balanceDeduction, setBalanceDeduction] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasManualReceivedAmount, setHasManualReceivedAmount] = useState(false);

  // Credit Note Deductions State
  const [creditNoteDeductions, setCreditNoteDeductions] = useState([]);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);

  const paymentsTotal = useMemo(() => {
    return payments.reduce(
      (sum, { paymentData }) => sum + (parseFloat(paymentData.amount) || 0),
      0
    );
  }, [payments]);

  const customerBalance = Number(customer?.balance || 0);
  const safeMaxBalanceUsage = Math.max(
    0,
    Math.min(customerBalance, paymentsTotal)
  );

  const parsedBalanceDeduction = (() => {
    if (!useCustomerBalance) return 0;
    const numeric = parseFloat(balanceDeduction || "0");
    return Number.isNaN(numeric) ? 0 : Math.max(0, numeric);
  })();

  const clampedBalanceDeduction = useCustomerBalance
    ? Math.min(parsedBalanceDeduction, safeMaxBalanceUsage)
    : 0;

  // Calculate totals
  const totalCreditNoteDeduction = creditNoteDeductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const parsedReceivedAmount = (() => {
    const numeric = parseFloat(receivedAmount || "0");
    return Number.isNaN(numeric) ? 0 : Math.max(0, numeric);
  })();

  const totalCoverage = parsedReceivedAmount + clampedBalanceDeduction + totalCreditNoteDeduction;
  const excessAmount = Math.max(0, totalCoverage - paymentsTotal);
  const remainingAmount = Math.max(0, paymentsTotal - totalCoverage);
  const projectedBalanceAfter = Math.max(
    0,
    customerBalance - clampedBalanceDeduction + excessAmount
  );
  const cashAppliedToInvoices = Math.max(
    0,
    paymentsTotal - clampedBalanceDeduction - totalCreditNoteDeduction
  );
  const coverageValid = remainingAmount < 0.01;
  const disableSubmit =
    submitting ||
    loading ||
    payments.length === 0 ||
    (!selectedBankAccount && (cashAppliedToInvoices > 0 || parsedReceivedAmount > 0)) ||
    !paymentDate ||
    !coverageValid;

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const computeAutoReceivedAmount = () => {
    const autoAmount = cashAppliedToInvoices;
    if (autoAmount === 0) {
      return "";
    }
    return autoAmount.toFixed(2);
  };

  useEffect(() => {
    if (hasManualReceivedAmount) {
      return;
    }
    setReceivedAmount(computeAutoReceivedAmount());
  }, [paymentsTotal, clampedBalanceDeduction, totalCreditNoteDeduction, hasManualReceivedAmount]);

  useEffect(() => {
    if (!useCustomerBalance || !balanceDeduction) return;
    const numeric = parseFloat(balanceDeduction);
    if (Number.isNaN(numeric)) return;
    if (numeric > safeMaxBalanceUsage) {
      setBalanceDeduction(
        safeMaxBalanceUsage > 0 ? safeMaxBalanceUsage.toFixed(2) : ""
      );
    }
  }, [safeMaxBalanceUsage, useCustomerBalance, balanceDeduction]);

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetchAllBanks();
      const data = await response.data;

      if (data) {
        setBankAccounts(data);
        if (data.length > 0) {
          setSelectedBankAccount(data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceivedAmountChange = (value) => {
    if (value === "") {
      setReceivedAmount("");
      setHasManualReceivedAmount(true);
      return;
    }
    const numeric = Math.max(0, parseFloat(value));
    if (Number.isNaN(numeric)) return;
    setReceivedAmount(numeric.toString());
    setHasManualReceivedAmount(true);
  };

  const handleBalanceDeductionChange = (value) => {
    if (value === "") {
      setBalanceDeduction("");
      setHasManualReceivedAmount(false);
      return;
    }
    const numeric = Math.max(0, parseFloat(value));
    if (Number.isNaN(numeric)) return;
    setBalanceDeduction(Math.min(numeric, safeMaxBalanceUsage).toString());
    setHasManualReceivedAmount(false);
  };

  const handleCreditNoteSelect = (selectedNotes) => {
    let currentRemaining = Math.max(0, paymentsTotal - totalCreditNoteDeduction);

    const newDeductions = [...creditNoteDeductions];

    selectedNotes.forEach(note => {
      // Check if already added
      if (newDeductions.some(d => d._id === note._id)) return;

      const amountToUse = Math.min(Number(note.remainingBalance), currentRemaining);
      currentRemaining = Math.max(0, currentRemaining - amountToUse);

      newDeductions.push({
        ...note,
        amount: amountToUse > 0 ? amountToUse.toFixed(2) : "" // Pre-fill valid amounts
      });
    });

    setCreditNoteDeductions(newDeductions);
  };

  const handleDeductionChange = (id, value) => {
    const newDeductions = creditNoteDeductions.map(item => {
      if (item._id === id) {
        const val = parseFloat(value);
        if (!isNaN(val) && val > item.remainingBalance) {
          toast.error(`Amount cannot exceed credit note balance (${item.remainingBalance})`);
          return item;
        }
        return { ...item, amount: value };
      }
      return item;
    });
    setCreditNoteDeductions(newDeductions);
  };

  const removeDeduction = (id) => {
    setCreditNoteDeductions(creditNoteDeductions.filter(item => item._id !== id));
  };

  const handleUseFullBalance = () => {
    if (!useCustomerBalance) {
      setUseCustomerBalance(true);
    }
    if (safeMaxBalanceUsage > 0) {
      setBalanceDeduction(safeMaxBalanceUsage.toFixed(2));
    }
    setHasManualReceivedAmount(false);
  };

  const handleResetReceivedAmount = () => {
    setHasManualReceivedAmount(false);
    setReceivedAmount(computeAutoReceivedAmount());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBankAccount && (cashAppliedToInvoices > 0 || parsedReceivedAmount > 0)) {
      toast.error("Please select a bank account");
      return;
    }

    if (!paymentDate) {
      toast.error("Please select a payment date");
      return;
    }

    if (paymentsTotal <= 0) {
      toast.error("Select invoices with payment amounts before submitting");
      return;
    }

    if (!coverageValid) {
      toast.error(
        "Received amount plus balance deduction must cover the selected invoices"
      );
      return;
    }

    // Validate Credit Note Amounts
    for (const cn of creditNoteDeductions) {
      const amt = parseFloat(cn.amount);
      if (isNaN(amt) || amt <= 0) {
        toast.error(`Please enter a valid amount for Credit Note ${cn.creditNoteNumber}`);
        return;
      }
      if (amt > cn.remainingBalance) {
        toast.error(`Amount for Credit Note ${cn.creditNoteNumber} exceeds balance`);
        return;
      }
    }

    if (totalCreditNoteDeduction > paymentsTotal + 0.001) {
      toast.error(`Credit note deduction (${totalCreditNoteDeduction.toFixed(2)}) cannot exceed total payment amount (${paymentsTotal.toFixed(2)})`);
      return;
    }

    if (totalCreditNoteDeduction + clampedBalanceDeduction > paymentsTotal + 0.001) {
      toast.error(`Deductions cannot exceed total payment amount`);
      return;
    }

    if (clampedBalanceDeduction > 0 && !customer?._id) {
      toast.error("Customer information is required to deduct from balance");
      return;
    }

    setSubmitting(true);

    try {
      const paymentPayload = payments.map(({ invoice, paymentData }) => ({
        invoiceId: invoice._id,
        discount: paymentData.discount || 0,
        amount: paymentData.amount || 0,
        bankAccount: selectedBankAccount,
        date: paymentDate,
        description: globalDescription || paymentData.description || "", // Use global description if provided, otherwise use individual
      }));

      const response = await applyPayment({
        payments: paymentPayload,
        customerId: customer?._id,
        receivedAmount: Number(parsedReceivedAmount.toFixed(2)),
        balanceDeductionAmount: Number(clampedBalanceDeduction.toFixed(2)),
        deductFromCustomerBalance: clampedBalanceDeduction > 0,
        excessAmount: Number(excessAmount.toFixed(2)),
        creditNoteDeductions: creditNoteDeductions.map(cn => ({
          _id: cn._id,
          amount: parseFloat(cn.amount),
          creditNoteNumber: cn.creditNoteNumber
        }))
      });

      const data = await response.data;

      if (data.success) {
        toast.success(data.message || "Payments processed successfully");
        onSuccess(data.customer || null);
      } else {
        toast.error(data.message || "Error processing payments");
      }
    } catch (error) {
      console.error("Error processing payments:", error);
      toast.error("Error processing payments. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md animate-fade-in flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Process Payments
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Details
              </h3>

              {/* Credit Note Deductions Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Deduct from Credit Notes
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCreditNoteModal(true)}
                    className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                  >
                    + Add Credit Note
                  </button>
                </div>

                {creditNoteDeductions.length > 0 && (
                  <div className="bg-white border rounded-md divide-y">
                    {creditNoteDeductions.map((cn) => (
                      <div key={cn._id} className="p-3 flex items-center gap-3">
                        <FileText size={16} className="text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{cn.creditNoteNumber}</div>
                          <div className="text-xs text-green-600">Balance: {Number(cn.remainingBalance).toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Amount:</span>
                          <input
                            type="number"
                            value={cn.amount}
                            onChange={(e) => handleDeductionChange(cn._id, e.target.value)}
                            className="w-24 p-1 text-right text-sm border rounded focus:ring-slate-500 focus:border-slate-500"
                            placeholder="0.00"
                            max={cn.remainingBalance}
                          />
                          <button
                            type="button"
                            onClick={() => removeDeduction(cn._id)}
                            className="text-red-400 hover:text-red-600 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="p-2 bg-gray-50 text-right text-sm font-medium text-gray-700">
                      Total Credit Deduction: {totalCreditNoteDeduction.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Bank Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBankAccount}
                      onChange={(e) => setSelectedBankAccount(e.target.value)}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      required={cashAppliedToInvoices > 0 || parsedReceivedAmount > 0}
                    >
                      <option value="">Select Bank Account</option>
                      {bankAccounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                    <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      required

                    />
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Received Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Received Amount (Cash In) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={receivedAmount}
                      onChange={(e) => handleReceivedAmountChange(e.target.value)}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      placeholder="0.00"
                      required
                    />
                    <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={handleResetReceivedAmount}
                      className="absolute right-3 top-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Auto-fill
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Any surplus automatically tops up the customer balance.
                  </p>
                </div>
              </div>

              {/* Global Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (applies to all invoices)
                </label>
                <input
                  type="text"
                  value={globalDescription}
                  onChange={(e) => setGlobalDescription(e.target.value)}
                  placeholder="Enter description for all invoices..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              {customer && (
                <div className="mt-4 border border-gray-200 rounded-lg bg-white p-4 space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Current Balance</p>
                      <p className="text-2xl font-semibold text-green-600">
                        AED {customerBalance.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-500">Projected After Payment</p>
                      <p className="text-2xl font-semibold text-slate-600">
                        AED {projectedBalanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                        checked={useCustomerBalance}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setUseCustomerBalance(checked);
                          if (!checked) {
                            setBalanceDeduction("");
                          }
                          setHasManualReceivedAmount(false);
                        }}
                      />
                      Deduct from customer balance
                    </label>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>Max usable: AED {safeMaxBalanceUsage.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={handleUseFullBalance}
                        disabled={safeMaxBalanceUsage === 0}
                        className="text-slate-600 disabled:text-gray-400"
                      >
                        Use full balance
                      </button>
                      {useCustomerBalance && (
                        <button
                          type="button"
                          onClick={() => setBalanceDeduction("")}
                          className="text-gray-500"
                        >
                          Clear amount
                        </button>
                      )}
                    </div>
                  </div>

                  {useCustomerBalance ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Balance Contribution (AED)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={balanceDeduction}
                          onChange={(e) =>
                            handleBalanceDeductionChange(e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Remaining usable: AED {Math.max(
                            0,
                            safeMaxBalanceUsage - clampedBalanceDeduction
                          ).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Balance After Payment</p>
                        <p className="text-xl font-semibold text-slate-600">
                          AED {projectedBalanceAfter.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Excess Added Back</p>
                        <p className="text-xl font-semibold text-green-600">
                          AED {excessAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Enable the toggle to cover part of the payment using the stored balance.
                    </p>
                  )}
                </div>
              )}

              <div className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Selected</p>
                    <p className="text-lg font-semibold text-gray-900">
                      AED {paymentsTotal.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Credit Notes</p>
                    <p className="text-lg font-semibold text-gray-900">
                      AED {totalCreditNoteDeduction.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Balance Used</p>
                    <p className="text-lg font-semibold text-gray-900">
                      AED {clampedBalanceDeduction.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cash Applied</p>
                    <p className="text-lg font-semibold text-gray-900">
                      AED {cashAppliedToInvoices.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Excess To Balance</p>
                    <p className="text-lg font-semibold text-gray-900">
                      AED {excessAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
                {!coverageValid && (
                  <p className="text-sm text-red-600">
                    Remaining amount AED {remainingAmount.toFixed(2)} must be covered by received cash or balance deduction.
                  </p>
                )}
              </div>
            </div>

            {/* Invoice List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selected Invoices ({payments.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Balance
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Payment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map(({ invoice, paymentData }) => {
                      const currentDiscount =
                        paymentData.discount !== undefined
                          ? paymentData.discount
                          : invoice.discount || 0;
                      const newFinalAmount =
                        invoice.totalAmount - currentDiscount;
                      const newTotalPaid =
                        (invoice.totalPayedAmount || 0) +
                        (paymentData.amount || 0);
                      const remaining = newFinalAmount - newTotalPaid;

                      return (
                        <tr key={invoice._id}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {invoice.customer?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.customer?.Code}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-medium text-red-600">
                              {(
                                newFinalAmount - (invoice.totalPayedAmount || 0)
                              ).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-medium text-green-600">
                              {currentDiscount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-medium text-slate-600">
                              {(paymentData.amount || 0).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {globalDescription || paymentData.description || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div
                              className={`text-sm font-medium ${remaining <= 0
                                ? "text-green-600"
                                : "text-slate-600"
                                }`}
                            >
                              {Math.max(0, remaining).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-right font-semibold text-gray-900">
                        Total Payment Amount:
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-lg font-bold text-slate-600">
                          {paymentsTotal.toFixed(2)}
                        </div>
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-700 space-y-1">
            <p className="text-lg font-semibold text-gray-900">
              Total Selected: <span className="text-slate-600">AED {paymentsTotal.toFixed(2)}</span>
            </p>
            <p>
              Cash received AED {parsedReceivedAmount.toFixed(2)} • Balance used AED {clampedBalanceDeduction.toFixed(2)} • Excess AED {excessAmount.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={disableSubmit}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign size={16} />
                  Process Payments
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {showCreditNoteModal && (
        <CreditNoteSelectionModal
          customer={customer}
          onClose={() => setShowCreditNoteModal(false)}
          onSelect={handleCreditNoteSelect}
          selectedIds={creditNoteDeductions.map((cn) => cn._id)}
        />
      )}
    </div>
  );
};

export default PaymentModal;
