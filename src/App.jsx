import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Layout from "./components/Layout";
import { Provider } from "react-redux";
import store from "./redux/store";
import AuthProvider from "./components/AuthProvider";
import { ProtectedRoute, AdminRoute } from "./routeProtect/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Unauthorized from "./pages/Unauthorized";
import NotFoundPage from "./pages/NotFoundPage";
import ProductsAndServices from "./pages/ProductsAndServices";
import PurchaseInvoices from "./pages/PurchaseInvoices";

import Expense from "./pages/Expense";
import Suppliers from "./pages/Suppliers";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import Report from "./pages/Report";
import Salary from "./pages/Salary";
import BankStatements from "./pages/BankStatemanets";
import PendingPayments from "./pages/PendingPayments";
import CreditNotes from "./pages/CreditNotes";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              // Default styles for all toasts
              style: {
                background: "#1f2937", // dark gray (tailwind: bg-gray-800)
                color: "#ffffff",
                padding: "16px",
                borderRadius: "8px",
                width: "300px",
              },
              success: {
                style: {
                  background: "#10b981", // Tailwind green-500
                  color: "#fff",
                },
              },
              error: {
                style: {
                  background: "#ef4444", // Tailwind red-500
                  color: "#fff",
                },
              },
            }}
          />
          <Routes>
            {/* Public routes without layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFoundPage />} />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/customers"
                element={
                  <Layout>
                    <Customers />
                  </Layout>
                }
              />
              <Route
                path="/credit-notes"
                element={
                  <Layout>
                    <CreditNotes />
                  </Layout>
                }
              />
              <Route
                path="/invoices"
                element={
                  <Layout>
                    <Invoices />
                  </Layout>
                }
              />
              <Route
                path="/products-services"
                element={
                  <Layout>
                    <ProductsAndServices />
                  </Layout>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <Layout>
                    <Suppliers />
                  </Layout>
                }
              />
              <Route
                path="/expense"
                element={
                  <Layout>
                    <Expense />
                  </Layout>
                }
              />
              <Route
                path="/salary"
                element={
                  <Layout>
                    <Salary />
                  </Layout>
                }
              />
              <Route
                path="/purchase-invoices"
                element={
                  <Layout>
                    <PurchaseInvoices />
                  </Layout>
                }
              />
              <Route
                path="/report"
                element={
                  <Layout>
                    <Report />
                  </Layout>
                }
              />
              <Route
                path="/bank-statements"
                element={
                  <Layout>
                    <BankStatements />
                  </Layout>
                }
              />
              <Route
                path="/pending-payments"
                element={
                  <Layout>
                    <PendingPayments />
                  </Layout>
                }
              />
            </Route>

            <Route element={<AdminRoute />}>
              <Route
                path="/users"
                element={
                  <Layout>
                    <Users />
                  </Layout>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
