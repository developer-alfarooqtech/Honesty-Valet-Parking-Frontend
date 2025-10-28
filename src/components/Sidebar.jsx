import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ChevronLeft, ChevronRight, LogOut, Users, Building, Boxes, BookCheck, ShoppingBag, Package, Notebook, Building2, ListOrdered, DollarSignIcon, CarTaxiFront, Store, NotebookPen, Banknote, TrendingUp, EuroIcon, DollarSign, ReceiptText } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import toast from 'react-hot-toast';
import BankModal from './BankModal';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Route to permission mapping  

  const navItems = [
    { icon: Users, name: 'Users', path: '/users', super: true },
    { icon: Home, name: 'Dashboard', path: '/', permission: 'dashboard' },
    { icon: Building, name: 'Customers', path: '/customers', permission: 'customers' },
    { icon: DollarSign, name: 'Bank-Receipts', path: '/bank-statements', permission: 'bank-statements' },
    { icon: DollarSign, name: 'Payment-Receipts', path: '/pending-payments', permission: 'pending-payments' },
    // { icon: ListOrdered, name: 'Sales Orders', path: '/sales-orders', permission: 'sales-orders' },
    { icon: NotebookPen, name: 'Invoices', path: '/invoices', permission: 'invoices' },
    { icon: ReceiptText, name: 'Credit Notes', path: '/credit-notes', permission: 'credit-notes' },
    { icon: Notebook, name: 'Purchase-INV', path: '/purchase-invoices', permission: 'purchase-invoices' },
    { icon: Package, name: 'Products/Services', path: '/products-services', permission: 'products-services' },
    { icon: Store, name: 'Suppliers', path: '/suppliers', permission: 'suppliers' },
    { icon: DollarSignIcon, name: 'Expense', path: '/expense', permission: 'expense' },
    { icon: EuroIcon, name: 'Salary', path: '/salary', permission: 'salary' },
    { icon: TrendingUp, name: 'Reports', path: '/report', permission: 'report' },
  ];

  // Check if user has permission for a specific route
  const hasPermission = (permission) => {
    if (!permission) return true; // No permission required (like Bank action)
    if (user?.is_Super === true) return true; // Super admin has all permissions
    return user?.permissions?.[permission] === true;
  };

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter(item => {
    // Show super admin only items
    if (item.super) {
      return user?.is_Super === true;
    }
    
    // Check permission for regular items
    if (item.permission) {
      return hasPermission(item.permission);
    }
    
    // Show items without specific permissions (like Bank)
    return true;
  });

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error?.message || 'Logout failed');
    }
  };

  return (
    <>
      <div className={`relative h-screen ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
        <div className="fixed h-full backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-lg">
          <div className={`flex flex-col h-full ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              {!collapsed && (
                <h2 className="text-xl font-bold text-blue-500">Honesty & Perfection</h2>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded-md backdrop-blur-xl bg-white/10 text-blue-600 hover:bg-white/20 transition-all"
              >
                {collapsed ? <ChevronRight /> : <ChevronLeft />}
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 py-4 overflow-auto">
              <ul className="space-y-2 px-2">
                {filteredNavItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = item.path && location.pathname === item.path;
                  
                  const handleClick = (e) => {
                    if (item.action) {
                      e.preventDefault();
                      item.action();
                    }
                  };
                  
                  return (
                    <li key={index}>
                      {item.path ? (
                        <Link 
                          to={item.path}
                          className={`flex items-center p-3 rounded-lg transition-all duration-200
                            ${isActive 
                              ? 'bg-blue-500 backdrop-blur-xl text-white shadow-md' 
                              : 'bg-white backdrop-blur-xl text-blue-500 hover:bg-white/10'}`}
                        >
                          <Icon size={20} className={`${collapsed ? 'mx-auto' : 'mr-3'}`} />
                          {!collapsed && <span className='text-md'>{item.name}</span>}
                        </Link>
                      ) : (
                        <button
                          onClick={handleClick}
                          className="w-full flex items-center p-3 rounded-lg transition-all duration-200
                            bg-white cursor-pointer backdrop-blur-xl text-blue-600 hover:bg-white/10"
                        >
                          <Icon size={20} className={`${collapsed ? 'mx-auto' : 'mr-3'}`} />
                          {!collapsed && <span className='text-md'>{item.name}</span>}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer with User and Logout */}
            <div className="p-4 border-t border-white/20 space-y-3">
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
                <div className="w-8 h-8 rounded-full bg-blue-500/70 backdrop-blur-xl flex items-center justify-center text-white shadow-md">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                {!collapsed && <span className="font-medium text-blue-700">{user?.name}</span>}
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200
                  bg-red-400/10 backdrop-blur-xl text-red-500 hover:bg-red-400/20`}
              >
                <LogOut size={20} className={`${collapsed ? 'mx-auto' : 'mr-3'}`} />
                {!collapsed && <span className="font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bank Modal */}
      <BankModal 
        isOpen={bankModalOpen} 
        onClose={() => setBankModalOpen(false)} 
      />
    </>
  );
};

export default Sidebar;
