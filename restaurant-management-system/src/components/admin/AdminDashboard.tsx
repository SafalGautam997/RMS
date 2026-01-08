import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { orderQueries, transactionQueries } from "../../db/queries";
import {
  formatNepaliDate,
  formatNepaliTime,
  getNepaliDateTime,
} from "../../utils/timeUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faSignOutAlt,
  faClipboardList,
  faClock,
  faCoins,
  faChartLine,
  faUtensils,
  faUsers,
  faFileAlt,
  faPercent,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import ThemeSwitcher from "../ThemeSwitcher";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [clockNow, setClockNow] = useState<Date>(new Date());
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

  useEffect(() => {
    const t = setInterval(() => setClockNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadStats = async () => {
    try {
      const orders = await orderQueries.getAll();
      const nepaliDate = getNepaliDateTime();
      const today = nepaliDate.toISOString().split("T")[0];
      const month = nepaliDate.getMonth() + 1;
      const year = nepaliDate.getFullYear();

      // Get daily sales using the same approach as Reports page
      let todaySalesTransactions = await transactionQueries.getDailyReport(
        today
      );
      let todaySalesAmount = todaySalesTransactions.reduce(
        (sum: number, t: any) => sum + (t.amount || 0),
        0
      );

      // If no sales for Nepal date, also check with current UTC date as fallback
      if (todaySalesAmount === 0) {
        const utcToday = new Date().toISOString().split("T")[0];
        const utcTransactions = await transactionQueries.getDailyReport(
          utcToday
        );
        todaySalesAmount = utcTransactions.reduce(
          (sum: number, t: any) => sum + (t.amount || 0),
          0
        );
      }

      // Get monthly sales using the same approach as Reports page
      const monthlySalesTransactions =
        await transactionQueries.getMonthlyReport(
          year.toString(),
          month.toString().padStart(2, "0")
        );
      const monthlySalesAmount = monthlySalesTransactions.reduce(
        (sum: number, t: any) => sum + (t.amount || 0),
        0
      );

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === "Pending").length,
        todaySales: todaySalesAmount || 0,
        monthlySales: monthlySalesAmount || 0,
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
    <div className="min-h-screen">
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <div className="card px-4 py-3 rounded-xl border border-[color:var(--t-border)] bg-[color:var(--t-surface)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--t-text)]">
            <FontAwesomeIcon icon={faClock} />
            <span>Nepal Time</span>
          </div>
          <div className="mt-1 text-xs text-[color:var(--t-text-secondary)]">
            {formatNepaliDate(clockNow)}
          </div>
          <div className="text-lg font-bold text-[color:var(--t-text)] leading-tight">
            {formatNepaliTime(clockNow)}
          </div>
        </div>
      </div>
      {/* Header */}
      <header className="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="icon-box w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faCrown} className="text-2xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{user?.party}</p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <div className="hidden sm:flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-xl border border-white border-opacity-30">
              <span className="text-sm text-white text-opacity-80">
                Welcome,
              </span>
              <span className="font-semibold text-white">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl font-semibold transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card stats-card p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1 opacity-70">
                  Total Orders
                </p>
                <p className="text-4xl font-bold gradient-text">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="icon-box rounded-2xl p-4 shadow-lg">
                <FontAwesomeIcon
                  icon={faClipboardList}
                  className="text-4xl text-white"
                />
              </div>
            </div>
          </div>

          <div className="card stats-card p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1 opacity-70">
                  Pending Orders
                </p>
                <p className="text-4xl font-bold gradient-text">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="icon-box rounded-2xl p-4 shadow-lg">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-4xl text-white"
                />
              </div>
            </div>
          </div>

          <div className="card stats-card p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1 opacity-70">
                  Today's Sales
                </p>
                <p className="text-4xl font-bold gradient-text">
                  ₹{stats.todaySales.toFixed(2)}
                </p>
              </div>
              <div className="icon-box rounded-2xl p-4 shadow-lg">
                <FontAwesomeIcon
                  icon={faCoins}
                  className="text-4xl text-white"
                />
              </div>
            </div>
          </div>

          <div className="card stats-card p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1 opacity-70">
                  Monthly Sales
                </p>
                <p className="text-4xl font-bold gradient-text">
                  ₹{stats.monthlySales.toFixed(2)}
                </p>
              </div>
              <div className="icon-box rounded-2xl p-4 shadow-lg">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="text-4xl text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/admin/menu")}
            className="card group p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="icon-box w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon
                icon={faUtensils}
                className="text-4xl text-white"
              />
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              Menu Management
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Add, edit, and manage menu items and categories
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/staff")}
            className="card group p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="icon-box w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon icon={faUsers} className="text-4xl text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              Staff Management
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Manage waiters and staff members
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            className="card group p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="icon-box w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon
                icon={faClipboardList}
                className="text-4xl text-white"
              />
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              View All Orders
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Monitor all restaurant orders
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/transactions")}
            className="card group p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="icon-box w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon
                icon={faReceipt}
                className="text-4xl text-white"
              />
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              Transactions
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              View payment history and transactions
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/discounts")}
            className="card group p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="icon-box w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon
                icon={faPercent}
                className="text-4xl text-white"
              />
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
              Discount Management
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create and manage discount offers
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/reports")}
            className="card group p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="icon-box w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon
                icon={faFileAlt}
                className="text-4xl text-white"
              />
            </div>
            <h3 className="text-xl font-bold mb-2 gradient-text">
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
