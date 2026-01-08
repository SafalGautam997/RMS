import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import type { Order } from "../../types";
import { orderQueries } from "../../db/queries";
import { formatNepaliDateTime } from "../../utils/timeUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faList } from "@fortawesome/free-solid-svg-icons";

const WaiterOrders = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const allOrders = await orderQueries.getAll();
      // Filter orders by current waiter
      const myOrders = allOrders.filter(
        (order: any) => order.waiter_id === user?.id
      );
      setOrders(myOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "badge badge-warning";
      case "Served":
        return "badge badge-info";
      case "Paid":
        return "badge badge-success";
      case "Cancelled":
        return "badge badge-danger";
      default:
        return "badge";
    }
  };

  return (
    <div className="min-h-screen">
      <header className="header-main">
        <div className="px-4 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/waiter")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl transition font-semibold inline-flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              My Orders
            </h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[color:var(--t-text)]">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-[color:var(--t-text-secondary)]">
                    Table {order.table_number}
                  </p>
                </div>
                <span className={getStatusColor(order.status)}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--t-text-secondary)]">
                    Subtotal:
                  </span>
                  <span className="font-semibold">
                    ₹{order.subtotal.toFixed(2)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-[color:var(--t-error)]">
                    <span>Discount:</span>
                    <span>-₹{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-[color:var(--t-success)]">
                    ₹{order.total_price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-[color:var(--t-text-secondary)] border-t border-[color:var(--t-border)] pt-2">
                <p>{formatNepaliDateTime(new Date(order.created_at))}</p>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-[color:var(--t-text-secondary)]">
              <FontAwesomeIcon icon={faList} />
            </div>
            <p className="text-[color:var(--t-text-secondary)] text-lg">
              No orders yet
            </p>
            <button
              onClick={() => navigate("/waiter/new-order")}
              className="btn-primary mt-4 px-6 py-3 rounded-lg transition"
            >
              Create New Order
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WaiterOrders;
