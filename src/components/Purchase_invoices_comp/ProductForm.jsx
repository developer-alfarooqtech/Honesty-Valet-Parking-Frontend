import React, { useState, useEffect } from "react";
import { Package, FileText, Barcode, ShoppingCart, DollarSign, Tag, PlusSquare } from "lucide-react";
import { searchProducts } from "../../service/productService";

const ProductForm = ({ newProduct, setNewProduct, addProduct }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isProductSelected, setIsProductSelected] = useState(false);

  const inputFields = [
    { key: "code", placeholder: "Product Code", icon: <Barcode className="h-5 w-5 text-blue-400" /> },
    { key: "name", placeholder: "Product Name", icon: <Package className="h-5 w-5 text-blue-400" />, disabled: isProductSelected },
    { key: "description", placeholder: "Description", icon: <FileText className="h-5 w-5 text-blue-400" />, disabled: isProductSelected },
    { key: "stock", placeholder: "Quantity", type: "number", icon: <ShoppingCart className="h-5 w-5 text-blue-400" /> },
    { key: "purchasePrice", placeholder: "Purchase Price", type: "number", icon: <DollarSign className="h-5 w-5 text-blue-400" /> },
    { key: "sellingPrice", placeholder: "Selling Price", type: "number", icon: <Tag className="h-5 w-5 text-blue-400" /> }
  ];

  const handleChange = async (key, value) => {
    setNewProduct({
      ...newProduct,
      [key]: (key === "stock" || key.includes("Price")) ? Number(value) : value
    });
    if (key === "code") {
      if (value) {
        try {
          const { data } = await searchProducts(value);
          setSuggestions(data);
          setIsProductSelected(false);  // Enable fields on code edit
        } catch (error) {
          console.error("Error fetching product suggestions:", error);
        }
      } else {
        setSuggestions([]);
        setIsProductSelected(false);  // Enable fields if code is cleared
      }
    }
  };

  const handleSuggestionClick = (product) => {
    setNewProduct({
      ...newProduct,
      code: product.code,
      name: product.name,
      description: product.description
    });
    setSuggestions([]);
    setIsProductSelected(true);  // Disable fields after selection
  };

  return (
    <>
      <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
        <PlusSquare className="w-5 h-5 text-blue-500 mr-2" />
        Add Product
      </h3>

      {/* Responsive grid: 1 col on mobile, 2 on tablet, 3 on desktop, 6 on very large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {inputFields.map(({ key, placeholder, type = "text", icon, disabled = false }) => (
          <div key={key} className="relative">
            <label className="block text-sm font-medium text-blue-700 mb-2 flex items-center">
              {icon}
              <span className="ml-2 text-xs sm:text-sm">{placeholder}</span>
            </label>
            <input
              type={type}
              disabled={disabled}
              className={`w-full border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all text-sm ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder={key === 'code' ? 'Search by name or code' : placeholder}
              value={newProduct[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              min={type === "number" ? 0 : undefined}
              step={type === "number" && key.includes("Price") ? "0.01" : "1"}
            />
            {key === "code" && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                {suggestions.map((product) => (
                  <li
                    key={product._id}
                    onClick={() => handleSuggestionClick(product)}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-sm"
                  >
                    <div className="font-medium">{product.code}</div>
                    <div className="text-gray-600 text-xs truncate">{product.name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-start">
        <button
          onClick={addProduct}
          disabled={!newProduct.name || !newProduct.code}
          className={`flex items-center justify-center ${!newProduct.name || !newProduct.code ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"} text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm sm:text-base`}
        >
          <PlusSquare className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>
    </>
  );
};

export default ProductForm;