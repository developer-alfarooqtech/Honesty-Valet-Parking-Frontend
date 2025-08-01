// src/components/Layout.jsx
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Background with gradient and blur */}
      <div className="absolute inset-0 bg-gray-50">
        {/* Decorative blurred circles */}
        {/* <div className="absolute top-10 left-20 w-64 h-64 rounded-full bg-blue-300/60 blur-3xl"></div>
        <div className="absolute top-50 left-20 w-64 h-64 rounded-full bg-blue-300/60 blur-3xl"></div>
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-blue-300/60 blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-blue-400/50 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 rounded-full bg-blue-200/70 blur-3xl"></div> */}
      </div>

      {/* Content container */}
      <div className="relative flex w-full h-full z-10">
        {!isLoginPage && <Sidebar />}
        <div className={`flex-1 ${!isLoginPage ? 'ml-0' : ''} overflow-auto`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;