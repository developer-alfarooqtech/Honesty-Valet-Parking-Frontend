// Pagination.jsx
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showFirstLast = true,
  siblingCount = 1,
  className = ''
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Calculate range
    let startPage = Math.max(1, currentPage - siblingCount);
    let endPage = Math.min(totalPages, currentPage + siblingCount);
    
    // Adjust if we're at the beginning or end
    if (currentPage <= siblingCount + 1) {
      endPage = Math.min(totalPages, 2 * siblingCount + 1);
    }
    
    if (currentPage >= totalPages - siblingCount) {
      startPage = Math.max(1, totalPages - (2 * siblingCount));
    }
    
    // Generate numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* First page button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors
            ${currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-blue-100 hover:text-blue-500'}`}
          aria-label="First page"
        >
          <ChevronsLeft size={18} />
        </button>
      )}

      {/* Previous page button */}
      <button 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors
          ${currentPage === 1 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-600 hover:bg-blue-100 hover:text-blue-500'}`}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Show ellipsis if not at beginning */}
      {pageNumbers[0] > 1 && (
        <span className="flex items-center justify-center w-10 h-10 text-gray-600">...</span>
      )}

      {/* Page numbers */}
      {pageNumbers.map(page => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors
            ${currentPage === page 
              ? 'bg-blue-400 text-white font-medium'
              : 'text-gray-700 hover:bg-blue-100 hover:text-blue-500'}`}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {/* Show ellipsis if not at end */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <span className="flex items-center justify-center w-10 h-10 text-gray-600">...</span>
      )}

      {/* Next page button */}
      <button 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors
          ${currentPage === totalPages 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-600 hover:bg-blue-100 hover:text-blue-500'}`}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>

      {/* Last page button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors
            ${currentPage === totalPages 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-blue-100 hover:text-blue-500'}`}
          aria-label="Last page"
        >
          <ChevronsRight size={18} />
        </button>
      )}
    </div>
  );
};

export default Pagination;