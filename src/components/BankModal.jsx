import { useState, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { fetchBanks, createBank } from '../service/bankService';
import toast from 'react-hot-toast';

const BankModal = ({ isOpen, onClose }) => {
  const [banks, setBanks] = useState([]);
  const [newBankName, setNewBankName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBanks();
    }
  }, [isOpen]);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const response = await fetchBanks();
      setBanks(response.data);
    } catch (error) {
      toast.error('Failed to load bank accounts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = async (e) => {
    e.preventDefault();
    
    if (!newBankName.trim()) {
      toast.error('Please enter a bank name');
      return;
    }

    try {
      setCreating(true);
      await createBank(newBankName);
      toast.success('Bank account created successfully');
      setNewBankName('');
      loadBanks(); // Reload the list
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create bank account');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 animate-fade-in backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Bank Accounts</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {/* Create bank form */}
          <form onSubmit={handleCreateBank} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                placeholder="Enter bank name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-70"
              >
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Banks list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 size={24} className="animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading bank accounts...</span>
              </div>
            ) : banks.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No bank accounts found. Add one to get started.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {banks.map((bank) => (
                  <li key={bank._id} className="py-3 px-2 hover:bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{bank.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankModal;