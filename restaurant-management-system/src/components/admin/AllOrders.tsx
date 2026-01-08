import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Order, OrderItem } from "../../types";
import { orderQueries, orderItemQueries } from "../../db/queries";
import {
  formatNepaliDate,
  formatNepaliTime,
  formatNepaliDateTime,
} from "../../utils/timeUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEye,
  faFileArrowDown,
  faFloppyDisk,
  faPenToSquare,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const AllOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [filterType, setFilterType] = useState<"day" | "month" | "year">("day");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [viewingOrderItems, setViewingOrderItems] = useState<OrderItem[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: "",
    subtotal: 0,
    discountAmount: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const allOrders = await orderQueries.getAll();
      setOrders(allOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setEditFormData({
      status: order.status,
      subtotal: order.subtotal,
      discountAmount: order.discount_amount,
      totalPrice: order.total_price,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;

    try {
      await orderQueries.update(
        editingOrder.id,
        editFormData.subtotal,
        editFormData.discountAmount,
        editFormData.totalPrice
      );
      await orderQueries.updateStatus(editingOrder.id, editFormData.status);
      setShowEditModal(false);
      setEditingOrder(null);
      loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order");
    }
  };

  const handleDelete = async (orderId: number) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await orderQueries.delete(orderId);
        await loadOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Error deleting order");
      }
    }
  };

  const handleViewOrder = async (order: Order) => {
    setViewingOrder(order);
    try {
      const items = await orderItemQueries.getByOrderId(order.id);
      setViewingOrderItems(items);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error loading order items:", error);
      alert("Error loading order details");
    }
  };

  const csvEscape = (value: unknown) => {
    const str = String(value ?? "");
    const escaped = str.replace(/"/g, '""');
    return /[\n\r,\"]/g.test(escaped) ? `"${escaped}"` : escaped;
  };

  const downloadOrdersAsCSV = async () => {
    const csvHeaders =
      "Order ID,Table,Waiter,Subtotal,Discount,Total,Status,Date,Time,Items\n";

    const orderItemsByOrderId = new Map<number, OrderItem[]>();
    await Promise.all(
      filteredOrders.map(async (order) => {
        try {
          const items = await orderItemQueries.getByOrderId(order.id);
          orderItemsByOrderId.set(order.id, items);
        } catch (error) {
          console.error("Error loading order items for CSV:", error);
          orderItemsByOrderId.set(order.id, []);
        }
      })
    );

    const csvRows = filteredOrders
      .map((order) => {
        const orderDate = new Date(order.created_at);
        const items = orderItemsByOrderId.get(order.id) || [];
        const itemNames = Array.from(
          new Set(items.map((i) => i.item_name).filter(Boolean))
        ).join("; ");

        return [
          csvEscape(order.id),
          csvEscape(order.table_number),
          csvEscape(order.waiter_name || "N/A"),
          csvEscape(order.subtotal.toFixed(2)),
          csvEscape(order.discount_amount.toFixed(2)),
          csvEscape(order.total_price.toFixed(2)),
          csvEscape(order.status),
          csvEscape(formatNepaliDate(orderDate)),
          csvEscape(formatNepaliTime(orderDate)),
          csvEscape(itemNames),
        ].join(",");
      })
      .join("\n");

    const csvContent = csvHeaders + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch = filter === "All" || order.status === filter;
    if (!dateFilter) return statusMatch;

    const orderDate = new Date(order.created_at);
    const filterDate = new Date(dateFilter);

    if (filterType === "day") {
      return (
        statusMatch && orderDate.toDateString() === filterDate.toDateString()
      );
    } else if (filterType === "month") {
      return (
        statusMatch &&
        orderDate.getMonth() === filterDate.getMonth() &&
        orderDate.getFullYear() === filterDate.getFullYear()
      );
    } else if (filterType === "year") {
      return (
        statusMatch && orderDate.getFullYear() === filterDate.getFullYear()
      );
    }
    return statusMatch;
  });

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin")}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl transition font-semibold inline-flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-white">All Orders</h1>
            </div>
            <button
              onClick={downloadOrdersAsCSV}
              className="btn-primary px-6 py-2.5 rounded-xl transition font-semibold inline-flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faFileArrowDown} />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-auto overflow-x-auto">
              <div className="flex gap-2 pb-1 whitespace-nowrap">
                {["All", "Pending", "Served", "Paid"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-6 py-2.5 rounded-xl transition font-semibold ${
                      filter === status ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "day" | "month" | "year")
                }
                className="form-select px-4 py-2 rounded-lg w-full sm:w-auto"
              >
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
              <input
                type={
                  filterType === "year"
                    ? "number"
                    : filterType === "month"
                    ? "month"
                    : "date"
                }
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="form-input px-4 py-2 rounded-lg w-full sm:w-auto"
                placeholder={`Filter by ${filterType}`}
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 w-full sm:w-auto"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="table-container overflow-x-auto">
          <table className="table-modern min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Table
                </th>
                <th className="hidden sm:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Waiter
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden lg:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Time
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Table {order.table_number}
                  </td>
                  <td className="hidden sm:table-cell px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.waiter_name}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{order.total_price.toFixed(2)}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNepaliDateTime(new Date(order.created_at))}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      {order.status === "Paid" && (
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition text-xs"
                        >
                          <span className="inline-flex items-center gap-2">
                            <FontAwesomeIcon icon={faEye} />
                            <span>View</span>
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(order)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition text-xs"
                      >
                        <span className="inline-flex items-center gap-2">
                          <FontAwesomeIcon icon={faPenToSquare} />
                          <span>Edit</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition text-xs"
                      >
                        <span className="inline-flex items-center gap-2">
                          <FontAwesomeIcon icon={faTrash} />
                          <span>Del</span>
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Edit Order #{editingOrder.id}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Served">Served</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtotal
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.subtotal}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      subtotal: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.discountAmount}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      discountAmount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.totalPrice}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      totalPrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-semibold"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                  <span>Save</span>
                </span>
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition font-semibold"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faXmark} />
                  <span>Cancel</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Order Details #{viewingOrder.id}
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #</p>
                  <p className="font-semibold text-lg">{viewingOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Table</p>
                  <p className="font-semibold text-lg">
                    {viewingOrder.table_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Waiter</p>
                  <p className="font-semibold text-lg">
                    {viewingOrder.waiter_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-lg">{viewingOrder.status}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-semibold text-lg">
                  {formatNepaliDateTime(new Date(viewingOrder.created_at))}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                Order Items
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Item
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {viewingOrderItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{item.item_name}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold">
                  ₹{viewingOrder.subtotal.toFixed(2)}
                </span>
              </div>
              {viewingOrder.discount_amount > 0 && (
                <div className="flex justify-between text-lg text-red-600">
                  <span>Discount:</span>
                  <span className="font-semibold">
                    -₹{viewingOrder.discount_amount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>TOTAL:</span>
                <span>₹{viewingOrder.total_price.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition font-semibold text-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
