const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <div className="text-red-600 mb-2">{message}</div>
    <button
      onClick={onRetry}
      className="text-red-700 hover:text-red-900 text-sm underline flex items-center justify-center gap-1 mx-auto"
    >
      <RefreshCw size={14} />
      Try Again
    </button>
  </div>
);

export default ErrorMessage