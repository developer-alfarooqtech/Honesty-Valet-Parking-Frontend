import React, { useState, useEffect } from 'react';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError, clearRedirectRoute } from '../redux/authSlice';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, error, redirectRoute } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && redirectRoute) {
      toast.success('Login successful');
      const redirectTimer = setTimeout(() => {
        navigate(redirectRoute);
        dispatch(clearRedirectRoute());
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, redirectRoute, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, { duration: 4000 });
      setIsLoading(false);
    }
  }, [error]);
  
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!loginId.trim()) {
      toast.error('Please enter your login ID', { duration: 4000 });
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please enter your password', { duration: 4000 });
      return;
    }
    
    setIsLoading(true);
    dispatch(loginUser({ loginId, password }));
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-amber-50 to-blue-100">
      {/* Animated background elements */}
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/10 to-transparent bg-[size:30px_30px] opacity-40"
           style={{
             backgroundImage: `
               linear-gradient(rgba(249, 115, 22, 0.15) 1px, transparent 1px),
               linear-gradient(90deg, rgba(249, 115, 22, 0.15) 1px, transparent 1px)
             `
           }}>
      </div>
      
      <div className="w-full max-w-md relative z-10 px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 mb-4 bg-gradient-to-br from-blue-100 to-amber-100 rounded-full backdrop-blur-sm border border-blue-300 shadow-lg">
            <LogIn className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent mb-2">
           Honesty & Perfection Valet Parking Services
          </h1>
          <p className="text-gray-600 text-lg">Access Terminal</p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-amber-500 mx-auto mt-4 rounded-full shadow-sm"></div>
        </div>
        
        {/* Login Form */}
        <div className="backdrop-blur-md bg-white/80 rounded-2xl border border-blue-200 p-8 shadow-2xl relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-transparent to-amber-100/50 rounded-2xl"></div>
          <div className="absolute inset-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 tracking-wide">
              AUTHENTICATE
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Login ID Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
                  <User className="h-5 w-5 text-blue-500 group-focus-within:text-blue-600 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-white/70 border border-blue-200 rounded-xl text-gray-800 placeholder-gray-500 
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
                           backdrop-blur-sm transition-all duration-300 group hover:bg-white/90 shadow-sm"
                  placeholder="Enter User ID"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-100/0 via-blue-100/0 to-amber-100/0 
                               group-focus-within:from-blue-100/40 group-focus-within:via-transparent group-focus-within:to-amber-100/40 
                               transition-all duration-500 pointer-events-none"></div>
              </div>
              
              {/* Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-blue-500 group-focus-within:text-blue-600 transition-colors duration-300" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-4 bg-white/70 border border-blue-200 rounded-xl text-gray-800 placeholder-gray-500 
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
                           backdrop-blur-sm transition-all duration-300 group hover:bg-white/90 shadow-sm"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-blue-500 
                           transition-colors duration-300 z-10"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-100/0 via-blue-100/0 to-amber-100/0 
                               group-focus-within:from-blue-100/40 group-focus-within:via-transparent group-focus-within:to-amber-100/40 
                               transition-all duration-500 pointer-events-none"></div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-500 to-amber-600 
                         hover:from-blue-400 hover:to-amber-500 text-white font-bold py-4 px-6 rounded-xl 
                         transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] 
                         shadow-lg hover:shadow-blue-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                               tranblue-x-[-100%] group-hover:tranblue-x-[100%] transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      INITIATE ACCESS
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
        
        {/* Footer */}
      
      </div>
    </div>
  );
};

export default LoginPage;