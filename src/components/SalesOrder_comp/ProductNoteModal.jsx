import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ReactDOM from 'react-dom';

const ProductNoteModal = ({ isOpen, onClose, onSave, item, type }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (item && isOpen) {
      setNote(item.note || '');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(note);
  };

  const itemName = item ? item.name : '';
  const itemType = type === 'product' ? 'Product' : 'Service';

  return (
    <>
    {typeof document !== 'undefined' && document.body && ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-[9999] animate-fade-in" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-600">
            {note ? 'Edit' : 'Add'} Note for {itemType}: {itemName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="note">
              Note
            </label>
            <textarea
              id="note"
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Enter note for this ${itemType.toLowerCase()}...`}
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>,
        document.body
      )}
    </>
  );
};

export default ProductNoteModal;