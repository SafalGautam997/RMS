import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearCurrentOrder } from "../../store/slices/orderSlice";
import {
  orderQueries,
  orderItemQueries,
  transactionQueries,
  menuQueries,
} from "../../db/queries";
import { useState, useEffect } from "react";
import BillPrint from "./BillPrint";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheck,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentOrder } = useAppSelector((state) => state.order);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [existingOrder, setExistingOrder] = useState<any>(null);

  // Check if we're coming from pending orders (order ID passed via state)
  useEffect(() => {
    const state = location.state as any;
    if (state?.orderId) {
      setExistingOrder(state);
      setOrderId(state.orderId);
    }
  }, [location.state]);

  const handlePayment = async () => {
    try {
      if (existingOrder) {
        // Payment for an existing pending order
        const orderId = existingOrder.orderId;

        // Create transaction
        await transactionQueries.create(
          orderId,
          existingOrder.totalPrice,
          paymentMethod
        );

        // Update order status to Paid
        await orderQueries.updateStatus(orderId, "Paid");

        // Update stock for all items in the order
        const orderItems = await orderItemQueries.getByOrderId(orderId);
        for (const item of orderItems) {
          await menuQueries.updateStock(item.menu_item_id, item.quantity);
        }

        setOrderId(orderId);
        setShowPrintModal(true);
      } else {
        // New order checkout
        if (
          !user ||
          !currentOrder.tableNumber ||
          currentOrder.items.length === 0
        ) {
          alert("Invalid order");
          return;
        }

        // Create order
        const orderResult = await orderQueries.create(
          currentOrder.tableNumber,
          user.id,
          "Paid",
          currentOrder.subtotal,
          currentOrder.discountAmount,
          currentOrder.totalPrice
        );

        const newOrderId = orderResult.lastID as number;

        // Add order items and update stock
        for (const item of currentOrder.items) {
          await orderItemQueries.create(
            newOrderId,
            item.menu_item_id,
            item.quantity,
            item.price
          );
          // Update stock after order is placed
          await menuQueries.updateStock(item.menu_item_id, item.quantity);
        }

        // Create transaction
        await transactionQueries.create(
          newOrderId,
          currentOrder.totalPrice,
          paymentMethod
        );

        setOrderId(newOrderId);
        setShowPrintModal(true);
      }
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

  // Show bill print view after payment
  if (showPrintModal && orderId) {
    const displayData = existingOrder || {
      tableNumber: currentOrder.tableNumber,
      items: currentOrder.items,
      subtotal: currentOrder.subtotal,
      discountAmount: currentOrder.discountAmount,
      totalPrice: currentOrder.totalPrice,
    };

    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card p-8">
            <div className="mb-6">
              <BillPrint
                orderId={orderId}
                tableNumber={displayData.tableNumber}
                waiterName={user?.name || ""}
                items={displayData.items}
                subtotal={displayData.subtotal}
                discountAmount={displayData.discountAmount}
                totalPrice={displayData.totalPrice}
                paymentMethod={paymentMethod}
                restaurantName={user?.party || "RESTAURANT"}
              />
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t print:hidden">
              <button
                onClick={handlePrint}
                className="btn-primary flex-1 py-3 rounded-lg transition font-semibold inline-flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPrint} />
                <span>Print Bill</span>
              </button>
              <button
                onClick={handleFinish}
                className="btn-secondary flex-1 py-3 rounded-lg transition font-semibold inline-flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faCheck} />
                <span>Finish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="header-main">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/waiter/new-order")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl transition font-semibold inline-flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Checkout
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="card p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="mb-4">
            <p className="text-lg">
              <strong>Table:</strong>{" "}
              {existingOrder?.tableNumber || currentOrder.tableNumber}
            </p>
            <p className="text-lg">
              <strong>Waiter:</strong> {user?.name}
            </p>
          </div>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-bold text-lg mb-3">Items:</h3>
            <div className="space-y-2">
              {(existingOrder?.items || currentOrder.items).map((item: any) => (
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
              <span>
                ₹{(existingOrder?.subtotal || currentOrder.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>
                -₹
                {(
                  existingOrder?.discountAmount || currentOrder.discountAmount
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-2xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">
                ₹
                {(existingOrder?.totalPrice || currentOrder.totalPrice).toFixed(
                  2
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Payment Method
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {["Cash", "Card", "Mobile Pay", "Other"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-3 rounded-lg font-semibold transition ${
                  paymentMethod === method ? "btn-primary" : "btn-secondary"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <button
            onClick={handlePayment}
            className="w-full btn-primary py-4 rounded-lg transition font-bold text-lg"
          >
            Complete Payment
          </button>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
