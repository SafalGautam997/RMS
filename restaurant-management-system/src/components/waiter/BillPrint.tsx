interface BillPrintProps {
  orderId: number;
  tableNumber: number;
  waiterName: string;
  items: Array<{ item_name?: string; quantity: number; price: number }>;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  paymentMethod: string;
}

const BillPrint = ({
  orderId,
  tableNumber,
  waiterName,
  items,
  subtotal,
  discountAmount,
  totalPrice,
  paymentMethod,
}: BillPrintProps) => {
  const currentDate = new Date().toLocaleString();

  return (
    <div className="print:block max-w-xs mx-auto p-4 font-mono text-sm">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">RESTAURANT</h1>
        <p className="text-xs">Thank you for dining with us!</p>
        <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
      </div>

      <div className="mb-4 text-xs">
        <p>
          <strong>Order #:</strong> {orderId}
        </p>
        <p>
          <strong>Table:</strong> {tableNumber}
        </p>
        <p>
          <strong>Waiter:</strong> {waiterName}
        </p>
        <p>
          <strong>Date:</strong> {currentDate}
        </p>
      </div>

      <div className="border-t-2 border-dashed border-gray-400 my-2"></div>

      <div className="mb-4">
        {items.map((item, index) => (
          <div key={index} className="mb-1">
            <div className="flex justify-between">
              <span>{item.item_name}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-600 ml-2">
              {item.quantity} x ₹{item.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-dashed border-gray-400 my-2"></div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount:</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold border-t pt-1">
          <span>TOTAL:</span>
          <span>₹{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-400 my-2"></div>

      <div className="text-xs mb-4">
        <p>
          <strong>Payment Method:</strong> {paymentMethod}
        </p>
        <p>
          <strong>Status:</strong> PAID
        </p>
      </div>

      <div className="text-center text-xs">
        <p>Please visit us again!</p>
        <p className="mt-2">www.restaurant.com</p>
      </div>
    </div>
  );
};

export default BillPrint;
