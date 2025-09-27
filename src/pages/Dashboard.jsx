// Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  Percent,
  ShoppingCart,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  Home,
  TrendingDown,
} from "lucide-react";
import StatsCard from "../components/Dashboard_comp/StatsCard";
// import PaymentStatusChart from '../components/Dashboard_comp/PaymentStatusChart';
import RevenueChart from "../components/Dashboard_comp/RevenueChart";
import RecentInvoicesTable from "../components/Dashboard_comp/RecentInvoicesTable";
import TopCustomersTable from "../components/Dashboard_comp/TopCustomersTable";
import {
  conversionRateApi,
  fetchStats,
  monthlyRevenueApi,
  paymentStats,
  recentInvs,
  topCustomersApi,
} from "../service/dashboardService";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    monthlyRevenue: [],
    // paymentStatus: [],
    recentInvoices: [],
    topCustomers: [],
    conversionRate: {},
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all dashboard data in parallel
        const [
          statsRes,
          monthlyRevenueRes,
          // paymentStatusRes,
          recentInvoicesRes,
          topCustomersRes,
          conversionRateRes,
        ] = await Promise.all([
          fetchStats(),
          monthlyRevenueApi(),
          // paymentStats(),
          recentInvs(),
          topCustomersApi(),
          conversionRateApi(),
        ]);

        const [
          stats,
          monthlyRevenue,
          // paymentStatus,
          recentInvoices,
          topCustomers,
          conversionRate,
        ] = await Promise.all([
          statsRes.data,
          monthlyRevenueRes.data,
          // paymentStatusRes.data,
          recentInvoicesRes.data,
          topCustomersRes.data,
          conversionRateRes.data,
        ]);

        setDashboardData({
          stats,
          monthlyRevenue,
          // paymentStatus,
          recentInvoices,
          topCustomers,
          conversionRate,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  console.log("dashboard data:",dashboardData);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 font-medium">
            Loading dashboard...
          </p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
            <Home size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-500">Dashboard</h1>
            <p className="text-blue-400 font-medium">Manage your Customers</p>
          </div>
        </header>
        {/* Main Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Revenue Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Revenue"
              value={`${dashboardData.stats.totalInvoiceAmount || 0}`}
              icon={DollarSign}
              sub="Total Revenue"
            />
            <StatsCard
              title="Invoices"
              value={dashboardData.stats.totalInvoices || 0}
              icon={FileText}
              sub="Total Invoices"
            />
            <StatsCard
              title="Pending Payments"
              value={`${dashboardData.stats.pendingAmount || 0}`}
              icon={Clock}
              sub="Total Pending Payments"
            />
            <StatsCard
              title="Discounts"
              value={`${dashboardData.stats.totalDiscount || 0}`}
              icon={TrendingDown}
              sub="Total Discounts Given"
            />
          </div>
        </div>

        {/* Sales Order Stats */}
        {/* <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Sales Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Sales Orders"
              value={dashboardData.stats.totalSalesOrders || 0}
              icon={ShoppingCart}
              sub="Total Sales Orders"
            />
            <StatsCard
              title="Converted to Invoice"
              value={dashboardData.conversionRate.convertedSalesOrders || 0}
              icon={CheckCircle}
              sub="Total Orders Converted to Invoice"
            />
            <StatsCard
              title="Conversion Rate"
              value={`${dashboardData.conversionRate.conversionRate || 0}%`}
              icon={BarChart3}
              sub="In Percentage"
            />
          </div>
        </div> */}

        {/* Charts Row */}
        <div className="mb-8">
          <RevenueChart data={dashboardData.monthlyRevenue} />
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RecentInvoicesTable invoices={dashboardData.recentInvoices} />
          </div>
          <div>
            <TopCustomersTable customers={dashboardData.topCustomers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
