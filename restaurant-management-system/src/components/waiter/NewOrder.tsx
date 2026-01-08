import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCartShopping,
  faChair,
  faCheck,
  faClock,
  faMinus,
  faPlus,
  faTag,
  faTrash,
  faUtensils,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  setTableNumber,
  addItemToCurrentOrder,
  removeItemFromCurrentOrder,
  updateItemQuantity,
  applyDiscount,
  clearCurrentOrder,
} from "../../store/slices/orderSlice";
import type { MenuItem, Discount } from "../../types";
import {
  menuQueries,
  discountQueries,
  orderQueries,
  orderItemQueries,
} from "../../db/queries";

const NewOrder = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentOrder } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showCart, setShowCart] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [tableNumber, setTableNumberState] = useState("");

  useEffect(() => {
    loadMenu();
    loadDiscounts();
  }, []);

  const loadMenu = async () => {
    try {
      const items = await menuQueries.getAvailable();
      setMenuItems(items);
    } catch (error) {
      console.error("Error loading menu:", error);
    }
  };

  const loadDiscounts = async () => {
    try {
      const activeDiscounts = await discountQueries.getActive();
      setDiscounts(activeDiscounts);
    } catch (error) {
      console.error("Error loading discounts:", error);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(menuItems.map((item) => item.category_name))),
  ];

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category_name === selectedCategory);

  const handleAddItem = (item: MenuItem) => {
    dispatch(addItemToCurrentOrder({ menuItem: item, quantity: 1 }));
  };

  const handleSetTable = () => {
    if (tableNumber) {
      dispatch(setTableNumber(parseInt(tableNumber)));
    }
  };

  const handleApplyDiscount = (discount: Discount) => {
    dispatch(applyDiscount({ type: discount.type, value: discount.value }));
    setShowDiscountModal(false);
  };

  const handleConfirmOrder = async () => {
    if (!currentOrder.tableNumber) {
      alert("Please select a table number");
      return;
    }

    if (currentOrder.items.length === 0) {
      alert("Please add items to the order");
      return;
    }

    try {
      if (!user) {
        alert("User not found");
        return;
      }

      // Create order with Pending status
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
      for (const item of currentOrder.items) {
        await orderItemQueries.create(
          newOrderId,
          item.menu_item_id,
          item.quantity,
          item.price
        );
      }

      alert("Order confirmed! It's now in Pending Orders.");
      setShowCart(false);
      dispatch(clearCurrentOrder());
      navigate("/waiter/pending");
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Error confirming order");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-main sticky top-0 z-40">
        <div className="px-4 py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/waiter")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl transition font-semibold flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              New Order
            </h1>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="btn-primary relative px-5 py-2.5 rounded-xl w-full sm:w-auto"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCartShopping} />
              <span>Cart ({currentOrder.items.length})</span>
            </span>
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Table Selection */}
        {!currentOrder.tableNumber && (
          <div className="card animate-slideInLeft mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-4">
              <span className="mr-2">
                <FontAwesomeIcon icon={faChair} />
              </span>
              Select Table Number
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumberState(e.target.value)}
                placeholder="Enter table number"
                className="form-input flex-1"
              />
              <button
                onClick={handleSetTable}
                className="btn-primary px-5 py-2.5 rounded-xl w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} />
                  <span>Set</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {currentOrder.tableNumber && (
          <div className="badge badge-success mb-6 block p-4 text-lg">
            <span className="mr-2">
              <FontAwesomeIcon icon={faChair} />
            </span>
            Table: {currentOrder.tableNumber}
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category || "All")}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                  selectedCategory === category
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item: MenuItem) => {
            const cartItem = currentOrder.items.find(
              (ci: any): boolean => ci.menu_item_id === item.id
            );
            return (
              <div
                key={item.id}
                className="menu-item-card group relative flex flex-col"
              >
                <button
                  onClick={() => handleAddItem(item)}
                  className="flex-1 flex flex-col"
                >
                  {item.images ? (
                    <div className="w-full h-40 mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.images}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="menu-item-icon">
                      <FontAwesomeIcon icon={faUtensils} />
                    </div>
                  )}
                  <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {item.category_name}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-green-600">
                      ₹{item.price.toFixed(2)}
                    </p>
                    <span className="text-xl group-hover:scale-125 transition">
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                  </div>
                  {!item.available && (
                    <div className="menu-item-badge">Unavailable</div>
                  )}
                </button>
                {cartItem && cartItem.quantity > 0 && (
                  <div className="border-t pt-2 mt-2 flex items-center justify-between gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(
                          updateItemQuantity({
                            menuItemId: item.id,
                            quantity: Math.max(1, cartItem.quantity - 1),
                          })
                        );
                      }}
                      className="bg-red-400 hover:bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm"
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="font-bold text-gray-800 text-sm min-w-4 text-center">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(
                          updateItemQuantity({
                            menuItemId: item.id,
                            quantity: cartItem.quantity + 1,
                          })
                        );
                      }}
                      className="bg-green-400 hover:bg-green-500 text-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Cart Sidebar/Modal */}
      {showCart && (
        <div className="modal-backdrop">
          <div className="cart-container open">
            {/* Cart Header */}
            <div className="cart-header">
              <h2 className="text-2xl font-bold">
                <span className="mr-2">
                  <FontAwesomeIcon icon={faCartShopping} />
                </span>
                Order Cart
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="modal-close"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="cart-items-scroll">
              {currentOrder.items.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <div className="text-6xl mb-4">
                    <FontAwesomeIcon icon={faCartShopping} />
                  </div>
                  <p className="font-semibold">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentOrder.items.map((item: any) => (
                    <div key={item.menu_item_id} className="cart-item group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {item.item_name}
                        </h3>
                        <button
                          onClick={() =>
                            dispatch(
                              removeItemFromCurrentOrder(item.menu_item_id)
                            )
                          }
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              dispatch(
                                updateItemQuantity({
                                  menuItemId: item.menu_item_id,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              )
                            }
                            className="bg-red-400 hover:bg-red-500 text-white w-8 h-8 rounded-full font-bold"
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              dispatch(
                                updateItemQuantity({
                                  menuItemId: item.menu_item_id,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                            className="bg-green-400 hover:bg-green-500 text-white w-8 h-8 rounded-full font-bold"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                        <span className="font-bold text-green-600">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="cart-total">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">
                  ₹{currentOrder.subtotal.toFixed(2)}
                </span>
              </div>
              {currentOrder.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600 mb-2">
                  <span>Discount:</span>
                  <span>-₹{currentOrder.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-3 mb-4">
                <span>Total:</span>
                <span className="gradient-text">
                  ₹{currentOrder.totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setShowDiscountModal(true)}
                className="btn-secondary w-full mb-2"
              >
                <span className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faTag} />
                  <span>Apply Discount</span>
                </span>
              </button>
              <button
                onClick={handleConfirmOrder}
                className="btn-primary w-full mb-2 py-2.5 rounded-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Confirm Order (Pending)</span>
                </span>
              </button>
              <button
                onClick={() => {
                  if (!currentOrder.tableNumber) {
                    alert("Please select a table number");
                    return;
                  }
                  if (currentOrder.items.length === 0) {
                    alert("Please add items to the order");
                    return;
                  }
                  navigate("/waiter/checkout");
                }}
                className="btn-secondary w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faCheck} />
                  <span>Proceed to Checkout</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <button
              onClick={() => setShowDiscountModal(false)}
              className="modal-close"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <h2 className="text-3xl font-bold gradient-text mb-6">
              <span className="mr-2">
                <FontAwesomeIcon icon={faTag} />
              </span>
              Apply Discount
            </h2>
            <div className="space-y-3 mb-6">
              {discounts.map((discount) => (
                <button
                  key={discount.id}
                  onClick={() => handleApplyDiscount(discount)}
                  className="card w-full text-left hover:border-indigo-500 border-2 border-transparent transition"
                >
                  <h3 className="font-bold text-gray-800 text-lg">
                    {discount.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {discount.type === "Percentage"
                      ? `${discount.value}% Off`
                      : `₹${discount.value} Off`}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDiscountModal(false)}
              className="btn-secondary w-full"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faXmark} />
                <span>Close</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewOrder;
