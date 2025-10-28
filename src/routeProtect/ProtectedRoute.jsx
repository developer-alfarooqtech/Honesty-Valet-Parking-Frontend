import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Utility to get permission key from pathname
const getPermissionKey = (pathname) => {
  const routeMap = {
    '/': 'dashboard',
    '/customers': 'customers',
    '/products-services': 'products-services',
    '/sales-orders': 'sales-orders',
    '/bank-statements': 'bank-statements',
    '/pending-payments': 'pending-payments',
    '/expense': 'expense',
    '/purchase-invoices': 'purchase-invoices',
    '/invoices': 'invoices',
    '/credit-notes': 'credit-notes',
    '/suppliers': 'suppliers',
    '/salary': 'salary',
    '/report': 'report',
    // Add more routes and permission keys here
  };
  return routeMap[pathname] || null;
};

const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-200">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const permissionKey = getPermissionKey(location.pathname);
  const hasPermission = user?.is_Super || (permissionKey && user?.permissions?.[permissionKey]);

  return hasPermission ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;


// Component for admin-only routes
const AdminRoute = () => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-200">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Check both authentication and admin status
  const isAdmin = user && user.is_Super;
  
  // Once loading is done, check if authenticated and is admin
  return isAuthenticated && isAdmin ? (
    <Outlet />
  ) : isAuthenticated ? (
    <Navigate to="/unauthorized" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export { ProtectedRoute, AdminRoute };