import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearCurrentOrder } from "../../store/slices/orderSlice";
import {
  orderQueries,
  orderItemQueries,
  transactionQueries,
} from "../../db/queries";
import { useState } from "react";
import BillPrint from "./BillPrint";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentOrder } = useAppSelector((state) => state.order);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const handlePayment = async () => {
    if (!user || !currentOrder.tableNumber || currentOrder.items.length === 0) {
      alert("Invalid order");
      return;
    }

    try {
      // Create order
      const orderResult = await orderQueries.create(
        currentOrder.tableNumber,
        user.id,
        "Pending",
        currentOrder.subtotal,
        currentOrder.discountAmount,
        currentOrder.totalPrice
      );

      const newOrderId = orderResult.lastID as number;

      // Add order items
      currentOrder.items.forEach((item) => {
        orderItemQueries.create(
          newOrderId,
          item.menu_item_id,
          item.quantity,
          item.price
        );
      });

      // Create transaction
      transactionQueries.create(
        newOrderId,
        currentOrder.totalPrice,
        paymentMethod
      );

      // Update order status to Paid
      orderQueries.updateStatus(newOrderId, "Paid");

      setOrderId(newOrderId);
      setShowPrintModal(true);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinish = () => {
    dispatch(clearCurrentOrder());
    navigate("/waiter");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/waiter/new-order")}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Checkout
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="mb-4">
            <p className="text-lg">
              <strong>Table:</strong> {currentOrder.tableNumber}
            </p>
            <p className="text-lg">
              <strong>Waiter:</strong> {user?.name}
            </p>
          </div>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-bold text-lg mb-3">Items:</h3>
            <div className="space-y-2">
              {currentOrder.items.map((item) => (
                <div key={item.menu_item_id} className="flex justify-between">
                  <span>
                    {item.item_name} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{currentOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-₹{currentOrder.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">
                ₹{currentOrder.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Payment Method
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {["Cash", "Card", "Mobile Pay", "Other"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-3 rounded-lg font-semibold transition ${
                  paymentMethod === method
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg transition font-bold text-lg"
          >
            Complete Payment
          </button>
        </div>
      </main>

      {/* Print Modal */}
      {showPrintModal && orderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600">
                Order #{orderId} has been completed
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePrint}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-semibold"
              >
                🖨️ Print Bill
              </button>
              <button
                onClick={handleFinish}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg transition font-semibold"
              >
                Finish
              </button>
            </div>

            {/* Hidden bill for printing */}
            <div className="hidden print:block">
              <BillPrint
                orderId={orderId}
                tableNumber={currentOrder.tableNumber!}
                waiterName={user?.name || ""}
                items={currentOrder.items}
                subtotal={currentOrder.subtotal}
                discountAmount={currentOrder.discountAmount}
                totalPrice={currentOrder.totalPrice}
                paymentMethod={paymentMethod}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
