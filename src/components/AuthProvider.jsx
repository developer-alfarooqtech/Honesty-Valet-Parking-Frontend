import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, logoutUser } from '../redux/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
  const token = localStorage.getItem('accessToken');

  const checkAuth = async () => {
    if (!token) {
      await dispatch(logoutUser()).unwrap();
      setAuthChecked(true);
      return;
    }

    try {
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      console.error('Fetch user failed:', error);
      localStorage.removeItem('accessToken');
    } finally {
      setAuthChecked(true);
    }
  };

  if (!authChecked) {
    checkAuth();
  }
}, [authChecked, dispatch]);

  
  // Show loading spinner during initial auth check
  // if (!authChecked || loading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }
  
  // Render children once auth check is complete
  return <>{children}</>;
};

export default AuthProvider;