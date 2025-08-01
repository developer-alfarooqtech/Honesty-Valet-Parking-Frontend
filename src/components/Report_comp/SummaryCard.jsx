const SummaryCard = ({ 
  label, 
  amount, 
  isNegative = false, 
  isHighlight = false,
  icon: Icon 
}) => {
  const getTextColor = () => {
    if (isHighlight) {
      return amount >= 0 ? "text-blue-700" : "text-red-700";
    }
    if (isNegative) return "text-red-600";
    return "text-blue-800";
  };

  const getBgColor = () => {
    if (isHighlight) return "bg-white border border-blue-200";
    return "bg-white border border-blue-100 hover:border-blue-200";
  };

  const getFontWeight = () => {
    if (isHighlight) return "font-bold";
    return "font-medium";
  };

  return (
    <div className={`
      flex justify-between items-center 
      ${getBgColor()} 
      px-4 py-3 rounded-lg
      transition-all duration-200 hover:shadow-sm
    `}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <Icon 
            className="flex-shrink-0 text-blue-500 w-4 h-4" 
          />
        )}
        <span className={`
          ${getFontWeight()} 
          ${isHighlight ? 'text-blue-800' : 'text-blue-600'}
          text-sm truncate
        `}>
          {label}
        </span>
      </div>
      
      <div className="flex-shrink-0 ml-4">
        <span className={`
          ${getFontWeight()} 
          ${getTextColor()}
          text-base font-mono
          text-right
        `}>
          AED {isNegative ? '-' : ''}{Math.abs(amount).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default SummaryCard;