import React, { useState, useEffect } from "react";
import { X, Search, Check } from "lucide-react";
import { fetchAllCreditNotes } from "../../service/creditNoteService";
import toast from "react-hot-toast";
import useDebounce from "../../hooks/useDebounce";

const CreditNoteSelectionModal = ({
    customer,
    onClose,
    onSelect,
    selectedIds = [],
}) => {
    const [creditNotes, setCreditNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [tempSelected, setTempSelected] = useState(new Set(selectedIds));
    const [selectedObjects, setSelectedObjects] = useState(new Map());

    useEffect(() => {
        if (debouncedSearchTerm) {
            fetchCreditNotes();
        } else {
            setCreditNotes([]);
        }
    }, [debouncedSearchTerm]);

    const fetchCreditNotes = async () => {
        setLoading(true);
        try {
            const query = {
                hasRemainingBalance: "true",
                creditType: "independent", // Only standalone/independent credit notes
                search: debouncedSearchTerm,
            };

            const response = await fetchAllCreditNotes(query);
            if (response.data && response.data.success) {
                setCreditNotes(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching credit notes:", error);
            toast.error("Failed to load credit notes");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (creditNote) => {
        const newSelectedIds = new Set(tempSelected);
        const newSelectedObjects = new Map(selectedObjects);

        if (newSelectedIds.has(creditNote._id)) {
            newSelectedIds.delete(creditNote._id);
            newSelectedObjects.delete(creditNote._id);
        } else {
            newSelectedIds.add(creditNote._id);
            newSelectedObjects.set(creditNote._id, creditNote);
        }
        setTempSelected(newSelectedIds);
        setSelectedObjects(newSelectedObjects);
    };

    const handleConfirm = () => {
        // Return full credit note objects from our map
        const selectedNotes = Array.from(selectedObjects.values());
        onSelect(selectedNotes);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Select Credit Notes
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-2.5 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search credit notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                        </div>
                    ) : creditNotes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? "No credit notes found matching your search." : "Start typing to search for credit notes..."}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {creditNotes.map((cn) => {
                                const isSelected = tempSelected.has(cn._id);
                                return (
                                    <div
                                        key={cn._id}
                                        onClick={() => toggleSelection(cn)}
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${isSelected
                                            ? "border-slate-500 bg-slate-50"
                                            : "border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div
                                            className={`flex-shrink-0 w-5 h-5 rounded border mr-3 flex items-center justify-center ${isSelected
                                                ? "bg-slate-600 border-slate-600 text-white"
                                                : "border-gray-300"
                                                }`}
                                        >
                                            {isSelected && <Check size={14} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {cn.creditNoteNumber}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {cn.description || "No description"}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(cn.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">
                                                        {cn.remainingBalance?.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Available</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        {tempSelected.size} selected
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50"
                            disabled={tempSelected.size === 0}
                        >
                            Confirm Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditNoteSelectionModal;
