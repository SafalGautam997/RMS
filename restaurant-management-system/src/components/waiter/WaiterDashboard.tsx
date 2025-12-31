import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

const WaiterDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🤵</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Waiter Panel
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-teal-50 px-5 py-2.5 rounded-xl border border-emerald-200 shadow-sm">
              <span className="text-sm text-emerald-600 font-medium">
                Hello,
              </span>
              <span className="font-bold text-emerald-800">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl font-semibold transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* New Order */}
          <button
            onClick={() => navigate("/waiter/new-order")}
            className="group bg-white/95 backdrop-blur-sm hover:bg-white rounded-3xl shadow-2xl p-16 text-center transition-all duration-500 transform hover:scale-105 hover:shadow-3xl border-4 border-white/50 hover:border-emerald-300"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-32 h-32 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <span className="text-7xl">🍽️</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
              New Order
            </h2>
            <p className="text-gray-600 text-xl font-medium">
              Create a new order for a table
            </p>
          </button>

          {/* My Orders */}
          <button
            onClick={() => navigate("/waiter/orders")}
            className="group bg-white/95 backdrop-blur-sm hover:bg-white rounded-3xl shadow-2xl p-16 text-center transition-all duration-500 transform hover:scale-105 hover:shadow-3xl border-4 border-white/50 hover:border-cyan-300"
          >
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-32 h-32 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <span className="text-7xl">📋</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
              My Orders
            </h2>
            <p className="text-gray-600 text-xl font-medium">
              View and manage your orders
            </p>
          </button>

          {/* Pending Orders */}
          <button
            onClick={() => navigate("/waiter/pending")}
            className="group bg-white/95 backdrop-blur-sm hover:bg-white rounded-3xl shadow-2xl p-16 text-center transition-all duration-500 transform hover:scale-105 hover:shadow-3xl border-4 border-white/50 hover:border-amber-300"
          >
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-32 h-32 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <span className="text-7xl">⏳</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
              Pending Orders
            </h2>
            <p className="text-gray-600 text-xl font-medium">
              View orders waiting to be served
            </p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default WaiterDashboard;
