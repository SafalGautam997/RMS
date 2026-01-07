import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { useAppSelector } from "./store/hooks";

// Components
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import MenuManagement from "./components/admin/MenuManagement";
import StaffManagement from "./components/admin/StaffManagement";
import AllOrders from "./components/admin/AllOrders";
import Transactions from "./components/admin/Transactions";
import DiscountManagement from "./components/admin/DiscountManagement";
import Reports from "./components/admin/Reports";

// Waiter Components
import WaiterDashboard from "./components/waiter/WaiterDashboard";
import NewOrder from "./components/waiter/NewOrder";
import WaiterOrders from "./components/waiter/WaiterOrders";
import Checkout from "./components/waiter/Checkout";
import PendingOrders from "./components/waiter/PendingOrders";

// Customer (public) Components
import CustomerMenu from "./components/customer/CustomerMenu";

function AppContent() {
  const themeMode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.body.className = `theme-${themeMode}`;
  }, [themeMode]);

  return (
    <Router>
      <Routes>
        {/* Public Customer Route */}
        <Route path="/menu" element={<CustomerMenu />} />

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute allowedRole="Admin">
              <MenuManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRole="Admin">
              <StaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRole="Admin">
              <AllOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRole="Admin">
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/discounts"
          element={
            <ProtectedRoute allowedRole="Admin">
              <DiscountManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRole="Admin">
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Waiter Routes */}
        <Route
          path="/waiter"
          element={
            <ProtectedRoute allowedRole="Waiter">
              <WaiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/new-order"
          element={
            <ProtectedRoute allowedRole="Waiter">
              <NewOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/orders"
          element={
            <ProtectedRoute allowedRole="Waiter">
              <WaiterOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/checkout"
          element={
            <ProtectedRoute allowedRole="Waiter">
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/pending"
          element={
            <ProtectedRoute allowedRole="Waiter">
              <PendingOrders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
