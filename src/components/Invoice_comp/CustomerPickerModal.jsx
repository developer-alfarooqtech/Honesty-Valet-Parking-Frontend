import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Users, Search, X, Loader2, CheckCircle2 } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import { getCustomers, downloadCustomers } from "../../service/customerService";

const PAGE_SIZE = 18;

const dedupeCustomers = (list = []) => {
  const map = new Map();
  let tempCounter = 0;
  list.forEach((customer) => {
    if (customer?._id) {
      if (!map.has(customer._id)) {
        map.set(customer._id, customer);
      }
    } else {
      map.set(`temp-${tempCounter++}`, customer);
    }
  });
  return Array.from(map.values());
};

const sortCustomersByCode = (list = []) => {
  return [...list].sort((a = {}, b = {}) => {
    const codeA = (a.Code ?? "").toString().trim().toLowerCase();
    const codeB = (b.Code ?? "").toString().trim().toLowerCase();

    if (codeA && codeB) {
      const compareCodes = codeA.localeCompare(codeB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      if (compareCodes !== 0) return compareCodes;
    }

    if (codeA && !codeB) return -1;
    if (!codeA && codeB) return 1;

    const nameA = (a.name ?? "").toString().trim().toLowerCase();
    const nameB = (b.name ?? "").toString().trim().toLowerCase();
    return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
  });
};

const CustomerPickerModal = ({
  isOpen,
  onClose,
  selectedCustomers = [],
  onApply,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [localSelections, setLocalSelections] = useState(selectedCustomers);
  const [hasMore, setHasMore] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);
  const [forceLoadAll, setForceLoadAll] = useState(false);
  const scrollContainerRef = useRef(null);
  const customersRef = useRef([]);
  const fallbackTriggeredRef = useRef(false);

  const selectedIds = useMemo(
    () => new Set(localSelections.map((customer) => customer._id)),
    [localSelections]
  );

  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  useEffect(() => {
    fallbackTriggeredRef.current = false;
    setForceLoadAll(false);
  }, [debouncedSearch, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLocalSelections(selectedCustomers);
    }
  }, [isOpen, selectedCustomers]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchCustomersList = async () => {
      const isFirstPage = currentPage === 1;
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await getCustomers({
          page: currentPage,
          limit: PAGE_SIZE,
          search: debouncedSearch,
        });
        const data = response.data;

        if (!isMounted) return;

        if (data?.success) {
          const incoming = data.customers || [];
          const total = data.totalCustomers || 0;
          const pages = data.totalPages || 1;
          const baseList = currentPage === 1 ? [] : customersRef.current;
          const nextList = sortCustomersByCode(
            currentPage === 1
              ? dedupeCustomers(incoming)
              : dedupeCustomers([...baseList, ...incoming])
          );
          const baseLength = baseList.length;
          const missingCustomers = total > 0 && nextList.length < total;
          const reachedLastPage = currentPage >= pages;
          const noGrowth = nextList.length === baseLength;

          setCustomers(nextList);
          setTotalPages(pages);
          setTotalCustomers(total);
          setHasMore(currentPage < pages);

          if (
            missingCustomers &&
            !fallbackTriggeredRef.current &&
            (reachedLastPage || noGrowth)
          ) {
            fallbackTriggeredRef.current = true;
            setForceLoadAll(true);
          }
        } else {
          if (currentPage === 1) {
            setCustomers([]);
          }
          setTotalPages(1);
          setTotalCustomers(0);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
        if (currentPage === 1) {
          setCustomers([]);
        }
        setTotalPages(1);
        setTotalCustomers(0);
        setHasMore(false);
      } finally {
        if (!isMounted) return;
        if (currentPage === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    };

    fetchCustomersList();

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentPage, debouncedSearch]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
    setCustomers([]);
    setHasMore(true);
    setLoadingMore(false);
    setLoadingAll(false);
    setSelectingAll(false);
  }, [debouncedSearch, isOpen]);

  const requestNextPage = useCallback(() => {
    if (loading || loadingMore || loadingAll || !hasMore) return;
    setLoadingMore(true);
    setCurrentPage((prev) => prev + 1);
  }, [hasMore, loading, loadingAll, loadingMore]);

  const fetchAllCustomersList = useCallback(async () => {
    try {
      const response = await downloadCustomers({ search: debouncedSearch });
      const data = response.data;
      if (data?.success) {
        const fullList = sortCustomersByCode(
          dedupeCustomers(data.customers || [])
        );
        if (!totalCustomers && fullList.length > 0) {
          setTotalCustomers(fullList.length);
        }
        return fullList;
      }
    } catch (error) {
      console.error("Error loading full customer list:", error);
    }
    return null;
  }, [debouncedSearch, totalCustomers]);

  const handleLoadAllCustomers = useCallback(async () => {
    if (loadingAll) return;
    setLoadingAll(true);
    try {
      const fullList = await fetchAllCustomersList();
      if (fullList) {
        setCustomers(sortCustomersByCode(fullList));
        setTotalCustomers(fullList.length);
        setTotalPages(1);
        setHasMore(false);
        fallbackTriggeredRef.current = true;
        setForceLoadAll(false);
      }
    } finally {
      setLoadingAll(false);
    }
  }, [fetchAllCustomersList, loadingAll]);

  const handleSelectAllCustomers = useCallback(async () => {
    if (selectingAll) return;

    if (customers.length === totalCustomers && totalCustomers > 0) {
      setLocalSelections(customers);
      return;
    }

    setSelectingAll(true);
    try {
      const fullList = await fetchAllCustomersList();
      if (fullList) {
        const sortedFullList = sortCustomersByCode(fullList);
        setCustomers(sortedFullList);
        setTotalCustomers(fullList.length);
        setTotalPages(1);
        setHasMore(false);
        setLocalSelections(sortedFullList);
        fallbackTriggeredRef.current = true;
        setForceLoadAll(false);
      }
    } finally {
      setSelectingAll(false);
    }
  }, [customers, fetchAllCustomersList, selectingAll, totalCustomers]);

  useEffect(() => {
    if (!isOpen) return;
    const needsFullLoad =
      forceLoadAll ||
      (!loading &&
        !loadingMore &&
        !loadingAll &&
        !hasMore &&
        totalCustomers > 0 &&
        customers.length > 0 &&
        customers.length < totalCustomers &&
        !fallbackTriggeredRef.current);

    if (needsFullLoad) {
      fallbackTriggeredRef.current = true;
      setForceLoadAll(false);
      handleLoadAllCustomers();
    }
  }, [
    customers.length,
    forceLoadAll,
    handleLoadAllCustomers,
    hasMore,
    isOpen,
    loading,
    loadingMore,
    loadingAll,
    totalCustomers,
  ]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      const threshold = 200;
      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceToBottom <= threshold) {
        requestNextPage();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen, requestNextPage]);

  const toggleCustomer = (customer) => {
    setLocalSelections((prev) => {
      const exists = prev.some((c) => c._id === customer._id);
      if (exists) {
        return prev.filter((c) => c._id !== customer._id);
      }
      return [...prev, customer];
    });
  };

  const handleClearSelections = () => {
    setLocalSelections([]);
  };

  const handleSelectAllVisible = () => {
    setLocalSelections((prev) => {
      const existingIds = new Set(prev.map((c) => c._id));
      const newCustomers = customers.filter((c) => !existingIds.has(c._id));
      if (newCustomers.length === 0) return prev;
      return [...prev, ...newCustomers];
    });
  };

  const handleDeselectVisible = () => {
    const visibleIds = new Set(customers.map((c) => c._id));
    setLocalSelections((prev) => prev.filter((c) => !visibleIds.has(c._id)));
  };

  const allVisibleSelected = useMemo(() => {
    if (customers.length === 0) return false;
    return customers.every((customer) => selectedIds.has(customer._id));
  }, [customers, selectedIds]);

  const handleApply = () => {
    if (onApply) {
      onApply(localSelections);
    }
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setCustomers([]);
    setHasMore(true);
    setLoadingMore(false);
    setLoadingAll(false);
    setSelectingAll(false);
    setForceLoadAll(false);
    fallbackTriggeredRef.current = false;
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-blue-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-blue-50/80">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 text-blue-600 p-2 rounded-full">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Browse Customers
              </h2>
              <p className="text-sm text-gray-500">
                Select one or multiple customers to filter the invoices list
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-blue-50 bg-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -tranblue-y-1/2 h-5 w-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-blue-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-blue-600">
                {localSelections.length} selected
              </div>
              {customers.length > 0 && (
                <button
                  type="button"
                  onClick={allVisibleSelected ? handleDeselectVisible : handleSelectAllVisible}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {allVisibleSelected ? "Deselect visible" : "Select all visible"}
                </button>
              )}
              {localSelections.length > 0 && (
                <button
                  onClick={handleClearSelections}
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Clear all
                </button>
              )}
              {totalCustomers > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllCustomers}
                  disabled={selectingAll}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {selectingAll ? "Selecting..." : `Select all ${totalCustomers}`}
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          ref={scrollContainerRef}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Users className="h-10 w-10 text-blue-200 mb-3" />
              <p className="text-sm">No customers found for this search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map((customer) => {
                const isSelected = selectedIds.has(customer._id);
                return (
                  <button
                    key={customer._id}
                    onClick={() => toggleCustomer(customer)}
                    className={`border rounded-2xl p-4 text-left transition-all duration-200 hover:border-blue-300 hover:shadow-md ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            {customer.name}
                          </h3>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Code: {customer.Code || "N/A"}</p>
                        {customer.address?.address1 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {customer.address?.address1}
                          </p>
                        )}
                        {customer.Phone && (
                          <p className="text-xs text-gray-400">
                            {customer.Phone}
                          </p>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        readOnly
                        checked={isSelected}
                        className="mt-1 h-5 w-5 text-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {!loading && customers.length > 0 && (
            <div className="flex flex-col items-center gap-3 pt-4">
              {loadingMore && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  Loading more customers...
                </div>
              )}
              {!loadingMore && hasMore && (
                <button
                  type="button"
                  onClick={requestNextPage}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50"
                >
                  See more customers
                </button>
              )}
              {!loadingMore && customers.length < totalCustomers && (
                <button
                  type="button"
                  onClick={handleLoadAllCustomers}
                  disabled={loadingAll}
                  className="px-4 py-2 text-xs font-medium text-blue-500 border border-dashed border-blue-200 rounded-full hover:bg-blue-50 disabled:opacity-50"
                >
                  {loadingAll
                    ? "Loading full list..."
                    : `Load all ${totalCustomers} customers`}
                </button>
              )}
              {!hasMore && (
                <p className="text-xs text-gray-400">You've reached the end of the list.</p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-blue-50 bg-blue-50/60">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Showing {customers.length} of {totalCustomers} customers
              </span>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                type="button"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPickerModal;
