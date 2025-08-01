import React, { useEffect, useState } from "react";
import ProductsTable from "../components/Product_comp/ProductsTable";
import ServicesTable from "../components/Service_Comp/ServicesTable";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";
import {
  Package,
  Search,
  Plus,
  Briefcase,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import AddProductModal from "../components/Product_comp/AddProductModal";
import AddServiceModal from "../components/Service_Comp/AddServiceModal";
import {
  addProduct,
  getProducts,
  getServices,
  addService,
  updateService,
  downloadProducts,
  downloadServices,
} from "../service/productService";
import { handleDownloadProductsPDF } from "../components/Product_comp/DownloadProducts";
import { handleDownloadServicesPDF } from "../components/Service_Comp/DownloadServices";
import toast from "react-hot-toast";

const ProductsAndServices = () => {
  // View state - products or services
  const [activeView, setActiveView] = useState("products");
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Products state
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [totalProductPages, setTotalProductPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Services state
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [totalServicePages, setTotalServicePages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");

  // Filter states - Fixed to use proper boolean values
  const [availableOnly, setAvailableOnly] = useState(false);
  const [unavailableOnly, setUnavailableOnly] = useState(false);

  // Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const limit = 25; // Items per page

  // Use debounce hook for search terms
  const debouncedProductSearchTerm = useDebounce(productSearchTerm, 500);
  const debouncedServiceSearchTerm = useDebounce(serviceSearchTerm, 500);

  // Load products when relevant states change
  useEffect(() => {
    if (activeView === "products") {
      loadProducts();
    }
  }, [
    currentProductPage,
    limit,
    debouncedProductSearchTerm,
    activeView,
    availableOnly,
    unavailableOnly,
  ]);

  // Load services when relevant states change
  useEffect(() => {
    if (activeView === "services") {
      loadServices();
    }
  }, [currentServicePage, limit, debouncedServiceSearchTerm, activeView]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await getProducts({
        page: currentProductPage,
        limit,
        search: debouncedProductSearchTerm,
        availableOnly,
        unavailableOnly, // Fixed the parameter name
      });

      setProducts(res.data.data.products || []);
      setTotalProductPages(res.data.data.totalPages || 1);
      setTotalProducts(res.data.data.totalProducts || 0);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const downloadProductsPdf = async () => {
    await handleDownloadProductsPDF({
      setExportingPDF,
      search: debouncedProductSearchTerm,
      availableOnly,
      unavailableOnly,
    });
  };

  const downloadServicesPdf = async () => {
    await handleDownloadServicesPDF({
      setExportingPDF,
      search: debouncedServiceSearchTerm,
    });
  };

  const handleDownloadProductExcel = async () => {
    try {
      setExportingExcel(true);
      // Get raw data for Excel generation
      const response = await downloadProducts({
        search: debouncedProductSearchTerm,
      availableOnly,
      unavailableOnly,
      });

      if (!response.data || !response.data.products) {
        toast.error("Failed to retrieve data");
        return;
      }

      const { products } = response.data;

      // Create a workbook
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Format data for Excel
      const worksheetData = products.map((product) => ({
        Product: product.name || "N/A",
        Code: product.code || "N/A",
        Stock: product.stock || 0,
        "Purchase Price":  product.purchasePrice || 0,
        "Selling Price": product.sellingPrice||0,

      }));

      // Create worksheet with invoice data
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

      // Create summary worksheet
      // Write to file and trigger download
      XLSX.writeFile(workbook, "Products_List.xlsx");

      toast.success("Excel report downloaded successfully");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to download Excel report");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleDownloadServiceExcel = async () => {
    try {
      setExportingExcel(true);
      // Get raw data for Excel generation
      const response = await downloadServices({
        search: debouncedServiceSearchTerm,
      });

      if (!response.data || !response.data.services) {
        toast.error("Failed to retrieve data");
        return;
      }

      const { services } = response.data;

      // Create a workbook
      const XLSX = await import("xlsx");    
      const workbook = XLSX.utils.book_new();

      // Format data for services
      const worksheetData = services.map((item) => ({
        Service: item.name || "N/A",
        Code: item.code || "N/A",
        Price: item.price || 0,

      }));

      // Create worksheet with invoice data
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Items");

      // Create summary worksheet
      // Write to file and trigger download
      XLSX.writeFile(workbook, "Services_List.xlsx");

      toast.success("Excel report downloaded successfully");
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Failed to download Excel report");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleUpdateService = async (serviceId, serviceData) => {
    try {
      await updateService(serviceId, serviceData);
      // Refresh service list after updating
      loadServices();
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  };

  const loadServices = async () => {
    setIsLoadingServices(true);
    try {
      const res = await getServices({
        page: currentServicePage,
        limit,
        search: debouncedServiceSearchTerm,
      });

      setServices(res.data.data.services || []);
      setTotalServicePages(res.data.data.totalPages || 1);
      setTotalServices(res.data.data.totalServices || 0);
    } catch (err) {
      console.error("Error loading services:", err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleProductPageChange = (page) => {
    setCurrentProductPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleServicePageChange = (page) => {
    setCurrentServicePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProductSearchChange = (e) => {
    setProductSearchTerm(e.target.value);
    setCurrentProductPage(1); // Reset to first page when search changes
  };

  const handleServiceSearchChange = (e) => {
    setServiceSearchTerm(e.target.value);
    setCurrentServicePage(1); // Reset to first page when search changes
  };

  const handleAddProduct = async (productData) => {
    try {
      await addProduct(productData);
      // Refresh product list after adding
      loadProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const handleAddService = async (serviceData) => {
    try {
      await addService(serviceData);
      // Refresh service list after adding
      loadServices();
    } catch (error) {
      console.error("Error adding service:", error);
      throw error;
    }
  };

  // Handle filter changes with proper logic
  const handleAvailableOnlyToggle = () => {
    const newAvailableOnly = !availableOnly;
    setAvailableOnly(newAvailableOnly);

    // If setting available only to true, turn off unavailable only
    if (newAvailableOnly && unavailableOnly) {
      setUnavailableOnly(false);
    }

    setCurrentProductPage(1); // Reset to first page
  };

  const handleUnavailableOnlyToggle = () => {
    const newUnavailableOnly = !unavailableOnly;
    setUnavailableOnly(newUnavailableOnly);

    // If setting unavailable only to true, turn off available only
    if (newUnavailableOnly && availableOnly) {
      setAvailableOnly(false);
    }

    setCurrentProductPage(1); // Reset to first page
  };

  const colors = {
    mainBg: "bg-blue-500",
    secondaryBg: "bg-blue-600",
    hoverMainBg: "hover:bg-blue-600",
    hoverSecondaryBg: "hover:bg-blue-700",
    borderColor: "border-blue-100",
    gradientFrom: "from-blue-50",
    ringColor: "focus:ring-blue-400",
    text: "text-blue-500",
    textSecondary: "text-blue-400",
    tabSelected: "bg-blue-500 text-white",
    tabUnselected: "text-blue-600 bg-white hover:bg-blue-100",
    icon: <Package size={24} className="text-white" />,
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div
              className={`bg-gradient-to-br ${colors.mainBg} to-${colors.secondaryBg} p-3 rounded-lg shadow-lg`}
            >
              {colors.icon}
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${colors.text}`}>
                {activeView === "products" ? "Products" : "Services"}
              </h1>
              <p className={`${colors.textSecondary} font-medium`}>
                {activeView === "products"
                  ? "Manage your Products"
                  : "Manage your services"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() =>
                activeView === "products"
                  ? setIsAddProductModalOpen(true)
                  : setIsAddServiceModalOpen(true)
              }
              className={`px-4 py-2 bg-gradient-to-r ${colors.mainBg} to-${colors.secondaryBg} ${colors.hoverMainBg} ${colors.hoverSecondaryBg} text-white rounded-lg shadow-md flex items-center space-x-2 transition-all duration-300 transform hover:scale-105`}
            >
              <Plus size={16} />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 flex rounded-lg overflow-hidden border border-blue-200">
          <button
            onClick={() => setActiveView("products")}
            className={`flex-1 py-3 px-4 font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
              activeView === "products"
                ? colors.tabSelected
                : colors.tabUnselected
            }`}
          >
            <Package size={18} />
            <span>Products</span>
          </button>
          <button
            onClick={() => setActiveView("services")}
            className={`flex-1 py-3 px-4 font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
              activeView === "services"
                ? colors.tabSelected
                : colors.tabUnselected
            }`}
          >
            <Briefcase size={18} />
            <span>Services</span>
          </button>
        </div>

        {/* Main content card */}
        <div
          className={`bg-white rounded-xl shadow-xl overflow-hidden border ${colors.borderColor}`}
        >
          {/* Search and stats section */}
          <div
            className={`bg-gradient-to-r ${colors.gradientFrom} to-white p-5 border-b ${colors.borderColor}`}
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 w-full">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={
                    activeView === "products"
                      ? "Search products by name or code"
                      : "Search services by name or code"
                  }
                  value={
                    activeView === "products"
                      ? productSearchTerm
                      : serviceSearchTerm
                  }
                  onChange={
                    activeView === "products"
                      ? handleProductSearchChange
                      : handleServiceSearchChange
                  }
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-300 shadow-md placeholder:text-gray-500 text-sm"
                />
              </div>

              {/* Filter Switches */}
              {activeView === "products" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <span className="text-sm font-medium text-gray-700">
                    Filters:
                  </span>

                  <div className="flex items-center space-x-4">
                    {/* Available Only Toggle */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Available</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={availableOnly}
                          onChange={handleAvailableOnlyToggle}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-300 peer-checked:after:tranblue-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    {/* Unavailable Toggle */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">
                        Out of Stock
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={unavailableOnly}
                          onChange={handleUnavailableOnlyToggle}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-300 peer-checked:after:tranblue-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  if (activeView === "products") {
                    downloadProductsPdf();
                  } else {
                    downloadServicesPdf();
                  }
                }}
                disabled={exportingPDF}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <FileText size={16} />
                Download PDF
              </button>

              <button
                onClick={() => {
                  if (activeView === "products") {
                    handleDownloadProductExcel();
                  } else {
                    handleDownloadServiceExcel();
                  }
                }}
                disabled={exportingExcel}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2.5 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <FileSpreadsheet size={16} />
                Download Excel
              </button>

              {/* Stats Display */}
              <div className="flex items-center space-x-2 bg-blue-100 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                <span className="text-sm font-medium text-gray-700">
                  {activeView === "products"
                    ? isLoadingProducts
                      ? "Loading..."
                      : `Showing ${products.length} of ${totalProducts} products`
                    : isLoadingServices
                    ? "Loading..."
                    : `Showing ${services.length} of ${totalServices} services`}
                </span>
              </div>
            </div>
          </div>

          {/* Content based on active view */}
          {activeView === "products" ? (
            <>
              <ProductsTable
                products={products}
                isLoading={isLoadingProducts}
                setProducts={setProducts}
                loadProducts={loadProducts}
              />

              {/* Pagination for products */}
              {totalProductPages > 1 && (
                <div
                  className={`p-5 border-t ${colors.borderColor} bg-gray-50`}
                >
                  <Pagination
                    currentPage={currentProductPage}
                    totalPages={totalProductPages}
                    onPageChange={handleProductPageChange}
                    className="flex justify-center"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <ServicesTable
                services={services}
                isLoading={isLoadingServices}
                onUpdateService={handleUpdateService}
              />

              {/* Pagination for services */}
              {totalServicePages > 1 && (
                <div
                  className={`p-5 border-t ${colors.borderColor} bg-gray-50`}
                >
                  <Pagination
                    currentPage={currentServicePage}
                    totalPages={totalServicePages}
                    onPageChange={handleServicePageChange}
                    className="flex justify-center"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        onAddService={handleAddService}
      />
    </div>
  );
};

export default ProductsAndServices;
