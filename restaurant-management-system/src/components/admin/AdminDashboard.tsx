import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { orderQueries, transactionQueries } from "../../db/queries";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todaySales: 0,
    monthlySales: 0,
  });

  useEffect(() => {
    loadStats();

    // Reload stats every 5 seconds (polling)
    const interval = setInterval(() => {
      loadStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const orders = await orderQueries.getAll();
      const today = new Date().toISOString().split("T")[0];
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const todaySalesData = await transactionQueries.getDailySales(today);
      const monthlySalesData = await transactionQueries.getMonthlySales(
        year,
        month
      );

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === "Pending").length,
        todaySales: todaySalesData?.total || 0,
        monthlySales: monthlySalesData?.total || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👑</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-xl border border-gray-200">
              <span className="text-sm text-gray-500">Welcome,</span>
              <span className="font-semibold text-gray-800">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl font-semibold transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 border border-blue-100 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Total Orders
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-lg">
                <span className="text-4xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl p-6 border border-orange-100 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Pending Orders
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg">
                <span className="text-4xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-6 border border-green-100 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Today's Sales
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ₹{stats.todaySales.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg">
                <span className="text-4xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-6 border border-purple-100 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Monthly Sales
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ₹{stats.monthlySales.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 shadow-lg">
                <span className="text-4xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/admin/menu")}
            className="group bg-gradient-to-br from-white to-orange-50 hover:from-orange-50 hover:to-orange-100 rounded-2xl shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-orange-100"
          >
            <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">🍽️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-700 transition-colors">
              Menu Management
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Add, edit, and manage menu items and categories
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/staff")}
            className="group bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 rounded-2xl shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-blue-100"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
              Staff Management
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Manage waiters and staff members
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            className="group bg-gradient-to-br from-white to-purple-50 hover:from-purple-50 hover:to-purple-100 rounded-2xl shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-purple-100"
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
              View All Orders
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Monitor all restaurant orders
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/transactions")}
            className="group bg-gradient-to-br from-white to-green-50 hover:from-green-50 hover:to-green-100 rounded-2xl shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-green-100"
          >
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">💳</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">
              Transactions
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              View payment history and transactions
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/discounts")}
            className="group bg-gradient-to-br from-white to-yellow-50 hover:from-yellow-50 hover:to-yellow-100 rounded-2xl shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-yellow-100"
          >
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">🎟️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-yellow-700 transition-colors">
              Discount Management
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create and manage discount offers
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/reports")}
            className="group bg-gradient-to-br from-white to-red-50 hover:from-red-50 hover:to-red-100 rounded-2xl shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-red-100"
          >
            <div className="bg-gradient-to-br from-red-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">📈</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-700 transition-colors">
              Reports & Analytics
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              View sales reports and analytics
            </p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
