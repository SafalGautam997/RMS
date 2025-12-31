import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderQueries, orderItemQueries } from "../../db/queries";
import { formatNepaliDateTime } from "../../utils/timeUtils";

const PendingOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingOrders();
    // Refresh every 10 seconds
    const interval = setInterval(loadPendingOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await orderQueries.getAll();
      // Show both Pending and Served orders (not yet paid)
      const pendingAndServed = allOrders.filter(
        (o: any) => o.status === "Pending" || o.status === "Served"
      );
      setOrders(pendingAndServed);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkServed = async (orderId: number) => {
    try {
      await orderQueries.updateStatus(orderId, "Served");
      loadPendingOrders();
    } catch (error) {
      console.error("Error marking order as served:", error);
      alert("Error marking order as served");
    }
  };

  const handleProceedToPayment = async (order: any) => {
    try {
      // Fetch order items
      const items = await orderItemQueries.getByOrderId(order.id);
      navigate("/waiter/checkout", {
        state: {
          orderId: order.id,
          tableNumber: order.table_number,
          items: items,
          subtotal: order.subtotal,
          discountAmount: order.discount_amount,
          totalPrice: order.total_price,
        },
      });
    } catch (error) {
      console.error("Error preparing payment:", error);
      alert("Error preparing for payment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/waiter")}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              ⏳ Pending Orders
            </h1>
          </div>
          <button
            onClick={loadPendingOrders}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            🔄 Refresh
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500 text-lg font-semibold">
              All orders are served! No pending orders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  order.status === "Pending"
                    ? "border-amber-500"
                    : "border-green-500"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Table {order.table_number}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatNepaliDateTime(new Date(order.created_at))}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {order.status === "Pending" ? "⏳ Pending" : "✓ Served"}
                  </span>
                </div>

                <div className="border-t pt-3 mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Total:</strong> ₹{order.total_price.toFixed(2)}
                  </p>
                  {order.discount_amount > 0 && (
                    <p className="text-sm text-red-600 mb-2">
                      <strong>Discount:</strong> -₹
                      {order.discount_amount.toFixed(2)}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleProceedToPayment(order)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-semibold mb-2"
                >
                  💳 Proceed to Payment
                </button>
                {order.status === "Pending" && (
                  <button
                    onClick={() => handleMarkServed(order.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-semibold"
                  >
                    ✓ Mark as Served
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingOrders;
