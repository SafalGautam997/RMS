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
        return "bg-yellow-100 text-yellow-800";
      case "Served":
        return "bg-blue-100 text-blue-800";
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen">
      <header className="header-main">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
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
                  <h3 className="text-lg font-bold text-gray-800">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Table {order.table_number}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    ₹{order.subtotal.toFixed(2)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount:</span>
                    <span>-₹{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    ₹{order.total_price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t pt-2">
                <p>{formatNepaliDateTime(new Date(order.created_at))}</p>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-gray-400">
              <FontAwesomeIcon icon={faList} />
            </div>
            <p className="text-gray-500 text-lg">No orders yet</p>
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
