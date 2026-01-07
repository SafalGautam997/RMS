import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import ThemeSwitcher from "../ThemeSwitcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faClock,
  faReceipt,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const WaiterDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="icon-box w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faUser} className="text-2xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Waiter Panel</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/waiter/new-order")}
            className="card group p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="icon-box w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon
                icon={faReceipt}
                className="text-4xl text-white"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 gradient-text">New Order</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create a new order for a table
            </p>
          </button>

          <button
            onClick={() => navigate("/waiter/orders")}
            className="card group p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="icon-box w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon
                icon={faClipboardList}
                className="text-4xl text-white"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 gradient-text">My Orders</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              View and manage your orders
            </p>
          </button>

          <button
            onClick={() => navigate("/waiter/pending")}
            className="card group p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="icon-box w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon icon={faClock} className="text-4xl text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2 gradient-text">
              Pending Orders
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              View orders waiting to be served
            </p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default WaiterDashboard;
