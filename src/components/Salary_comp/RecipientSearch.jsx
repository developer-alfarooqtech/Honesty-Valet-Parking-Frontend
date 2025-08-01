// components/RecipientSearch.jsx
import { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, X } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import { fetchRecipientsBySearch } from '../../service/salaryService';

const RecipientSearch = ({ 
  selectedRecipient, 
  onRecipientSelect, 
  onAddNew,
  placeholder = "Search recipient...",
  showAddButton = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Initialize search term when selectedRecipient changes
  useEffect(() => {
    if (selectedRecipient) {
      setSearchTerm(selectedRecipient.name);
    } else {
      setSearchTerm('');
    }
  }, [selectedRecipient]);

  useEffect(() => {
    const searchRecipients = async () => {
      if (debouncedSearchTerm.trim()) {
        setLoading(true);
        try {
          const response = await fetchRecipientsBySearch(debouncedSearchTerm);
          setRecipients(response.data || []);
        } catch (error) {
          console.error('Error searching recipients:', error);
          setRecipients([]);
        } finally {
          setLoading(false);
        }
      } else {
        setRecipients([]);
      }
    };

    searchRecipients();
  }, [debouncedSearchTerm]);

  const handleRecipientSelect = (recipient) => {
    onRecipientSelect(recipient);
    setSearchTerm(recipient.name);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    if (!value) {
      onRecipientSelect(null);
    }
  };

  const handleAddNew = () => {
    setIsOpen(false);
    setSearchTerm('')
    onAddNew();
  };

  const handleClearSelection = () => {
    setSearchTerm('');
    onRecipientSelect(null);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -tranblue-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -tranblue-y-1/2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          size={18} 
        />
      </div>

      {/* Selected Recipient Display */}
      {selectedRecipient && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium text-gray-800">{selectedRecipient.name}</div>
            {selectedRecipient.Phone && (
              <div className="text-sm text-gray-500">{selectedRecipient.Phone}</div>
            )}
            {selectedRecipient.address && (
              <div className="text-sm text-gray-500 truncate">{selectedRecipient.address}</div>
            )}
          </div>
          <button
            onClick={handleClearSelection}
            className="text-gray-400 hover:text-red-500 ml-2"
            title="Clear selection"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isOpen && (searchTerm || recipients.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              Searching...
            </div>
          ) : recipients.length > 0 ? (
            <>
              {recipients.map((recipient) => (
                <button
                  key={recipient._id}
                  onClick={() => handleRecipientSelect(recipient)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-800">{recipient.name}</div>
                  {recipient.Phone && (
                    <div className="text-sm text-gray-500">{recipient.Phone}</div>
                  )}
                  {recipient.address && (
                    <div className="text-sm text-gray-500 truncate">{recipient.address}</div>
                  )}
                </button>
              ))}
              {showAddButton && (
                <button
                  onClick={handleAddNew}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-t border-gray-200 text-blue-600 flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add new recipient
                </button>
              )}
            </>
          ) : searchTerm ? (
            <div className="px-4 py-3">
              <div className="text-gray-500 text-center mb-2">No recipients found</div>
              {showAddButton && (
                <button
                  onClick={handleAddNew}
                  className="w-full px-3 py-2 text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add new recipient
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default RecipientSearch;