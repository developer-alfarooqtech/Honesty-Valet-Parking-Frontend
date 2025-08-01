import { Search } from 'lucide-react';

// Background component with blur effect (blue theme)
const BlurredBackground = () => {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-200">
        {/* Create multiple circles for the blurred background effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-300 opacity-60 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-400 opacity-50 blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-72 h-72 rounded-full bg-blue-200 opacity-70 blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
};

// Main 404 page component
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <BlurredBackground />
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-blue-500 p-4 rounded-full mb-6">
          <Search size={48} className="text-white" />
        </div>
        <h1 className="text-9xl font-bold text-blue-900">404</h1>
        <h2 className="text-4xl font-medium text-blue-800 mt-4">Page Not Found</h2>
      </div>
    </div>
  );
}